#!/usr/bin/env node
/**
 * musicCatalog.ts의 모든 lane별 youtubeVideoId를 검증하고
 * debug/youtube-playlist-debug.html을 생성한다.
 *
 * - YouTube API 호출 없음
 * - production 코드 변경 없음
 * - 실제 YouTube playlist 생성 없음
 *
 * 사용법:
 *   node scripts/generate-youtube-debug.mjs
 *   npm run debug:youtube-playlists
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CATALOG_PATH = join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const OUTPUT_DIR = join(ROOT, 'debug');
const OUTPUT_PATH = join(OUTPUT_DIR, 'youtube-playlist-debug.html');

/** youtubeVideoId 유효성 기준: 11자리 alphanumeric + _ - */
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const YOUTUBE_WATCH_BASE = 'https://www.youtube.com/watch?v=';
const YOUTUBE_PLAYLIST_BASE = 'https://www.youtube.com/watch_videos?video_ids=';

// ─── 파서 ────────────────────────────────────────────────────────────────────

/**
 * musicCatalog.ts 파일을 텍스트로 읽고 중첩 없는 {} 블록에서 트랙을 추출한다.
 * TypeScript import 없이 동작하도록 regex 기반으로 파싱한다.
 * ALL_SEED_TRACKS의 spread(...)는 블록이 아니므로 자동으로 건너뛰어진다.
 */
function parseCatalogTracks(fileContent) {
  const tracks = [];
  const blockRegex = /\{[^{}]+\}/gs;
  let match;

  while ((match = blockRegex.exec(fileContent)) !== null) {
    const block = match[0];

    const laneIdMatch  = block.match(/laneId:\s*"([^"]+)"/);
    const titleMatch   = block.match(/title:\s*"([^"]+)"/);
    const artistMatch  = block.match(/artist:\s*"([^"]+)"/);

    // laneId, title, artist가 모두 있는 블록만 트랙으로 인식
    if (!laneIdMatch || !titleMatch || !artistMatch) continue;

    const videoIdMatch = block.match(/youtubeVideoId:\s*"([^"]*)"/);
    const rawId = videoIdMatch ? videoIdMatch[1].trim() : null;

    tracks.push({
      laneId:  laneIdMatch[1],
      title:   titleMatch[1],
      artist:  artistMatch[1],
      rawVideoId: rawId || null,
    });
  }

  return tracks;
}

// ─── 검증 ────────────────────────────────────────────────────────────────────

/**
 * 전체 트랙에서 ID가 2회 이상 등장하는 videoId를 카운트한다.
 * 정규식을 통과한 ID만 대상으로 한다.
 */
function buildGlobalIdCount(tracks) {
  const count = {};
  for (const t of tracks) {
    if (t.rawVideoId && VIDEO_ID_REGEX.test(t.rawVideoId)) {
      count[t.rawVideoId] = (count[t.rawVideoId] || 0) + 1;
    }
  }
  return count;
}

/**
 * 트랙 하나의 상태를 반환한다.
 * 판별 순서: missing → invalid → duplicate → valid
 */
function classifyTrack(rawVideoId, globalIdCount) {
  if (!rawVideoId) return { status: 'missing', videoId: null };
  if (!VIDEO_ID_REGEX.test(rawVideoId)) return { status: 'invalid', videoId: rawVideoId };
  if (globalIdCount[rawVideoId] > 1) return { status: 'duplicate', videoId: rawVideoId };
  return { status: 'valid', videoId: rawVideoId };
}

// ─── 집계 ────────────────────────────────────────────────────────────────────

function buildLaneData(allTracks) {
  // 파일 등장 순서 그대로 lane 목록 구성
  const laneOrder = [];
  const seenLanes = new Set();
  for (const t of allTracks) {
    if (!seenLanes.has(t.laneId)) {
      laneOrder.push(t.laneId);
      seenLanes.add(t.laneId);
    }
  }

  const globalIdCount = buildGlobalIdCount(allTracks);

  return laneOrder.map(laneId => {
    const tracks = allTracks
      .filter(t => t.laneId === laneId)
      .map((t, i) => ({
        index: i + 1,
        title: t.title,
        artist: t.artist,
        ...classifyTrack(t.rawVideoId, globalIdCount),
      }));

    const valid     = tracks.filter(t => t.status === 'valid');
    const missing   = tracks.filter(t => t.status === 'missing');
    const invalid   = tracks.filter(t => t.status === 'invalid');
    const duplicate = tracks.filter(t => t.status === 'duplicate');

    const validIds = valid.map(t => t.videoId);
    const playlistUrl = validIds.length > 0
      ? `${YOUTUBE_PLAYLIST_BASE}${validIds.join(',')}`
      : null;

    return {
      laneId,
      tracks,
      counts: {
        total:     tracks.length,
        valid:     valid.length,
        missing:   missing.length,
        invalid:   invalid.length,
        duplicate: duplicate.length,
      },
      playlistUrl,
    };
  });
}

// ─── HTML 생성 ───────────────────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BADGE = {
  valid:     '<span class="badge b-valid">✓ valid</span>',
  missing:   '<span class="badge b-missing">✗ missing</span>',
  invalid:   '<span class="badge b-invalid">⚠ invalid</span>',
  duplicate: '<span class="badge b-dup">⟳ duplicate</span>',
};

function renderLane(lane) {
  const { laneId, tracks, counts, playlistUrl } = lane;
  const coverPct = counts.total > 0 ? Math.round(counts.valid / counts.total * 100) : 0;

  const actionsHtml = playlistUrl
    ? `<a class="btn b-open" href="${esc(playlistUrl)}" target="_blank" rel="noopener">
         Open playlist (${counts.valid} tracks)
       </a>
       <button class="btn b-copy" onclick="copyUrl(this,${JSON.stringify(playlistUrl)})">Copy URL</button>`
    : '<span class="no-pl">No valid videos</span>';

  const rowsHtml = tracks.map(t => {
    const idCell   = t.videoId ? `<code>${esc(t.videoId)}</code>` : '<span class="dim">—</span>';
    const linkCell = t.videoId
      ? `<a href="${YOUTUBE_WATCH_BASE}${esc(t.videoId)}" target="_blank" rel="noopener" title="Open on YouTube">▶</a>`
      : '<span class="dim">—</span>';
    return `<tr class="r-${t.status}">
      <td class="c-idx">${t.index}</td>
      <td class="c-title">${esc(t.title)}</td>
      <td class="c-artist">${esc(t.artist)}</td>
      <td class="c-id">${idCell}</td>
      <td class="c-status">${BADGE[t.status]}</td>
      <td class="c-link">${linkCell}</td>
    </tr>`;
  }).join('');

  return `
<section class="lane" id="${esc(laneId)}">
  <h2 class="lane-h">${esc(laneId)}</h2>
  <div class="lane-stats">
    <span class="st">Total <strong>${counts.total}</strong></span>
    <span class="st sv">Valid <strong>${counts.valid}</strong></span>
    <span class="st sm">Missing <strong>${counts.missing}</strong></span>
    <span class="st si">Invalid <strong>${counts.invalid}</strong></span>
    <span class="st sd">Duplicate <strong>${counts.duplicate}</strong></span>
    <span class="st sp">Coverage <strong>${coverPct}%</strong></span>
  </div>
  <div class="lane-actions">${actionsHtml}</div>
  <details open>
    <summary class="det-sum">Track list (${counts.total})</summary>
    <table class="tt">
      <thead><tr><th>#</th><th>Title</th><th>Artist</th><th>Video ID</th><th>Status</th><th></th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </details>
</section>`;
}

function renderTocItem(lane) {
  const warn = lane.counts.missing + lane.counts.invalid > 0 ? ' ⚠' : '';
  const dup  = lane.counts.duplicate > 0 ? ' ⟳' : '';
  return `<li><a href="#${esc(lane.laneId)}">${esc(lane.laneId)}<span class="tc">${lane.counts.valid}/${lane.counts.total}${warn}${dup}</span></a></li>`;
}

function generateHtml(lanes) {
  const S = {
    lanes:     lanes.length,
    tracks:    lanes.reduce((a, l) => a + l.counts.total,     0),
    valid:     lanes.reduce((a, l) => a + l.counts.valid,     0),
    missing:   lanes.reduce((a, l) => a + l.counts.missing,   0),
    invalid:   lanes.reduce((a, l) => a + l.counts.invalid,   0),
    duplicate: lanes.reduce((a, l) => a + l.counts.duplicate, 0),
  };

  const generatedAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const CSS = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,monospace;font-size:13px;background:#111;color:#e0e0e0;line-height:1.5}
    a{color:#60a5fa}a:hover{text-decoration:underline}
    h1{font-size:20px;font-weight:700;color:#fff}
    h2{font-size:14px;font-weight:700;color:#f0f0f0}
    code{font-family:monospace;font-size:11px;color:#a3e635;background:#1a1a1a;padding:1px 4px;border-radius:3px}
    strong{color:#e0e0e0}
    .dim{color:#3a3a3a}

    /* layout */
    .layout{display:flex;min-height:100vh}
    .sidebar{width:240px;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto;background:#161616;border-right:1px solid #252525;padding:14px 0}
    .sidebar h3{font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1.2px;padding:0 14px 10px}
    .sidebar ul{list-style:none}
    .sidebar li a{display:flex;justify-content:space-between;align-items:center;padding:4px 14px;color:#888;text-decoration:none;font-size:11px}
    .sidebar li a:hover{background:#1f1f1f;color:#fff}
    .tc{font-size:10px;color:#444;margin-left:6px;white-space:nowrap}
    .main{flex:1;min-width:0;padding:24px}

    /* summary */
    .summary{background:#1a1a1a;border:1px solid #252525;border-radius:8px;padding:20px 24px;margin-bottom:28px}
    .gen-time{color:#555;font-size:11px;margin:4px 0 16px}
    .sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:16px}
    .sc{background:#1e1e1e;border-radius:6px;padding:12px;text-align:center}
    .sc .num{font-size:26px;font-weight:700;color:#fff}
    .sc .lbl{font-size:10px;color:#666;margin-top:2px}
    .sc.cv .num{color:#4ade80}.sc.cm .num{color:#f87171}.sc.ci .num{color:#fb923c}.sc.cd .num{color:#c084fc}

    /* lane */
    .lane{background:#1a1a1a;border:1px solid #252525;border-radius:8px;padding:18px 22px;margin-bottom:18px}
    .lane-h{margin-bottom:10px}
    .lane-stats{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px}
    .st{font-size:12px;color:#666}.st strong{color:#e0e0e0}
    .sv strong{color:#4ade80}.sm strong{color:#f87171}.si strong{color:#fb923c}.sd strong{color:#c084fc}.sp strong{color:#60a5fa}
    .lane-actions{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center}
    .no-pl{font-size:12px;color:#555;font-style:italic}
    .btn{display:inline-block;padding:5px 13px;border-radius:5px;font-size:12px;font-weight:600;cursor:pointer;border:none;text-decoration:none;line-height:1.6}
    .b-open{background:#b91c1c;color:#fff}.b-open:hover{background:#991b1b;text-decoration:none}
    .b-copy{background:#252525;color:#999;border:1px solid #333}.b-copy:hover{background:#2e2e2e;color:#fff}
    .b-copy.copied{background:#14532d;color:#4ade80;border-color:#14532d}

    /* details */
    details>summary.det-sum{cursor:pointer;font-size:12px;color:#555;user-select:none;padding:4px 0;list-style:none}
    details>summary.det-sum::before{content:"▶ ";font-size:10px}
    details[open]>summary.det-sum::before{content:"▼ "}
    details>summary.det-sum:hover{color:#999}

    /* track table */
    .tt{width:100%;border-collapse:collapse;margin-top:8px}
    .tt th{text-align:left;font-size:10px;color:#444;text-transform:uppercase;letter-spacing:0.8px;padding:5px 8px;border-bottom:1px solid #252525}
    .tt td{padding:5px 8px;vertical-align:middle;border-bottom:1px solid #1c1c1c}
    .tt tbody tr:hover{background:#1f1f1f}
    .c-idx{color:#444;width:30px;text-align:right}
    .c-title{max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .c-artist{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#888}
    .c-id{width:130px}
    .c-status{width:105px}
    .c-link{width:36px;text-align:center}

    /* badges */
    .badge{display:inline-block;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700}
    .b-valid{background:#14532d;color:#4ade80}
    .b-missing{background:#450a0a;color:#f87171}
    .b-invalid{background:#431407;color:#fb923c}
    .b-dup{background:#3b0764;color:#c084fc}

    /* row tints */
    .r-missing td{opacity:.75}
    .r-invalid td{opacity:.75}

    @media(max-width:700px){.sidebar{display:none}.sg{grid-template-columns:repeat(3,1fr)}}
  `;

  const JS = `
    function copyUrl(btn, url) {
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy URL'; btn.classList.remove('copied'); }, 2000);
      }).catch(() => {
        btn.textContent = 'Failed';
        setTimeout(() => { btn.textContent = 'Copy URL'; }, 2000);
      });
    }
  `;

  const toc = lanes.map(renderTocItem).join('\n');
  const laneSections = lanes.map(renderLane).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>VibeScene YouTube Debug</title>
  <style>${CSS}</style>
</head>
<body>
<div class="layout">
  <nav class="sidebar">
    <h3>Lanes (${S.lanes})</h3>
    <ul>
      ${toc}
    </ul>
  </nav>
  <main class="main">
    <div class="summary">
      <h1>VibeScene — YouTube ID Debug</h1>
      <p class="gen-time">Generated: ${generatedAt}</p>
      <div class="sg">
        <div class="sc"><div class="num">${S.lanes}</div><div class="lbl">Lanes</div></div>
        <div class="sc"><div class="num">${S.tracks}</div><div class="lbl">Total tracks</div></div>
        <div class="sc cv"><div class="num">${S.valid}</div><div class="lbl">Valid IDs</div></div>
        <div class="sc cm"><div class="num">${S.missing}</div><div class="lbl">Missing IDs</div></div>
        <div class="sc ci"><div class="num">${S.invalid}</div><div class="lbl">Invalid IDs</div></div>
        <div class="sc cd"><div class="num">${S.duplicate}</div><div class="lbl">Duplicate IDs</div></div>
      </div>
    </div>
    ${laneSections}
  </main>
</div>
<script>${JS}</script>
</body>
</html>`;
}

// ─── 진입점 ──────────────────────────────────────────────────────────────────

function main() {
  const fileContent = readFileSync(CATALOG_PATH, 'utf-8');
  const allTracks   = parseCatalogTracks(fileContent);
  const lanes       = buildLaneData(allTracks);
  const html        = generateHtml(lanes);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, html, 'utf-8');

  const S = {
    lanes:     lanes.length,
    tracks:    lanes.reduce((a, l) => a + l.counts.total,     0),
    valid:     lanes.reduce((a, l) => a + l.counts.valid,     0),
    missing:   lanes.reduce((a, l) => a + l.counts.missing,   0),
    invalid:   lanes.reduce((a, l) => a + l.counts.invalid,   0),
    duplicate: lanes.reduce((a, l) => a + l.counts.duplicate, 0),
  };

  console.log('');
  console.log('=== YouTube Debug HTML Generated ===');
  console.log('');
  console.log(`Output:    ${OUTPUT_PATH}`);
  console.log('');
  console.log(`Lanes:     ${S.lanes}`);
  console.log(`Tracks:    ${S.tracks}`);
  console.log(`Valid:     ${S.valid}`);
  console.log(`Missing:   ${S.missing}`);
  console.log(`Invalid:   ${S.invalid}`);
  console.log(`Duplicate: ${S.duplicate}`);
  console.log('');
  console.log('브라우저에서 열기:');
  console.log(`  start "" "${OUTPUT_PATH.replace(/\//g, '\\')}"`);
  console.log('');
}

main();
