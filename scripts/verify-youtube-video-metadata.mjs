#!/usr/bin/env node
/**
 * musicCatalog.ts の youtubeVideoId を YouTube oEmbed API で検証し
 * HTML + JSON リポートを生成する。
 *
 * - YouTube Data API 不要（oEmbed のみ使用）
 * - production コード変更なし
 * - 実際の YouTube playlist 作成なし
 *
 * 使い方:
 *   node scripts/verify-youtube-video-metadata.mjs
 *   npm run debug:youtube-metadata
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dirname, '..');
const CATALOG    = join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const DEBUG_DIR  = join(ROOT, 'debug');
const CACHE_PATH = join(DEBUG_DIR, 'youtube-oembed-cache.json');
const HTML_PATH  = join(DEBUG_DIR, 'youtube-video-metadata-report.html');
const JSON_PATH  = join(DEBUG_DIR, 'youtube-video-metadata-report.json');

const VIDEO_ID_RE  = /^[a-zA-Z0-9_-]{11}$/;
const DELAY_MS     = 150;
const MAX_RETRY    = 2;
const OEMBED_BASE  = 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=';
const PLAYLIST_BASE = 'https://www.youtube.com/watch_videos?video_ids=';

// ─── Catalog parser ───────────────────────────────────────────────────────────

function parseCatalogTracks(src) {
  const tracks = [];
  const re = /\{[^{}]+\}/gs;
  let m;
  while ((m = re.exec(src)) !== null) {
    const b = m[0];
    const lane   = (b.match(/laneId:\s*"([^"]+)"/)         || [])[1];
    const title  = (b.match(/title:\s*"([^"]+)"/)          || [])[1];
    const artist = (b.match(/artist:\s*"([^"]+)"/)         || [])[1];
    if (!lane || !title || !artist) continue;
    const rawId  = (b.match(/youtubeVideoId:\s*"([^"]*)"/) || [])[1];
    tracks.push({ laneId: lane, title, artist, youtubeVideoId: rawId?.trim() || null });
  }
  return tracks;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

function loadCache() {
  if (!existsSync(CACHE_PATH)) return {};
  try { return JSON.parse(readFileSync(CACHE_PATH, 'utf-8')); } catch { return {}; }
}

function saveCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
}

// ─── oEmbed fetch ─────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchOEmbed(videoId) {
  const url = `${OEMBED_BASE}${videoId}&format=json`;
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });
      if ([401, 403, 404].includes(res.status)) {
        return { ok: false, httpStatus: res.status, error: `HTTP ${res.status}` };
      }
      if (!res.ok) {
        if (attempt < MAX_RETRY) { await sleep(500 * (attempt + 1)); continue; }
        return { ok: false, httpStatus: res.status, error: `HTTP ${res.status}` };
      }
      const d = await res.json();
      return {
        ok: true,
        ytTitle:    d.title        || '',
        ytAuthor:   d.author_name  || '',
        ytAuthorUrl:d.author_url   || '',
        ytThumb:    d.thumbnail_url || '',
      };
    } catch (err) {
      if (attempt < MAX_RETRY) { await sleep(500 * (attempt + 1)); continue; }
      return { ok: false, httpStatus: 0, error: err.message || 'network error' };
    }
  }
  return { ok: false, httpStatus: 0, error: 'max retries' };
}

// ─── Text normalization ───────────────────────────────────────────────────────

const STOP = new Set(['a','an','the','of','in','on','at','to','for','and','or','but',
  'is','are','was','were','be','been','have','has','by','with','from','up','out',
  'not','no','so','do','did','i','me','my','you','your','he','she','it','its',
  'we','our','they','their','this','that']);

// Words common in YouTube titles that aren't part of the song identity
const YT_NOISE = new Set(['official','video','audio','music','mv','visualizer','hd','hq',
  '4k','remastered','remaster','version','ver','explicit','clean','album','single','ep',
  'ost','soundtrack','vevo','records','entertainment','productions','topic']);

function norm(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')     // strip combining marks
    .replace(/feat\.?|ft\.?|featuring/gi, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')   // strip punctuation (keep CJK)
    .replace(/\s+/g, ' ')
    .trim();
}

function keywords(text) {
  return norm(text)
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP.has(w) && !YT_NOISE.has(w));
}

// Fraction of sourceKws found in targetText (substring match)
function overlapScore(sourceKws, targetText) {
  if (!sourceKws.length) return 0;
  const t = norm(targetText);
  return sourceKws.filter(kw => t.includes(kw)).length / sourceKws.length;
}

// ─── Flags ───────────────────────────────────────────────────────────────────

const ACCEPTABLE_FLAGS = ['official audio', 'official video', 'visualizer'];

const DANGER_FLAGS = [
  'lyric video', 'lyrics', 'cover', 'live', 'remix',
  'sped up', 'slowed', 'nightcore', 'karaoke',
  'instrumental', 'reaction', 'shorts', 'tiktok',
  '1 hour', '1hour', 'extended', 'loop', 'bass boosted',
];

function detectFlags(ytTitle) {
  const lo = ytTitle.toLowerCase();
  const flags = [];
  for (const f of ACCEPTABLE_FLAGS) {
    if (lo.includes(f)) flags.push({ name: f, kind: 'ok' });
  }
  const seen = new Set();
  for (const f of DANGER_FLAGS) {
    if (lo.includes(f) && !seen.has(f)) {
      // "lyric video" supersedes "lyrics"
      if (f === 'lyrics' && lo.includes('lyric video')) continue;
      seen.add(f);
      flags.push({ name: f, kind: 'danger' });
    }
  }
  return flags;
}

// ─── Classifier ───────────────────────────────────────────────────────────────

function classify(catalogTitle, catalogArtist, ytTitle, ytAuthor, flags, unavailable) {
  if (unavailable) return { status: 'unavailable', confidence: 0, titleScore: 0, artistScore: 0 };

  const titleKws  = keywords(catalogTitle);
  const artistKws = keywords(catalogArtist);

  // Strip " - Topic" and "VEVO" from author for matching
  const cleanAuthor = ytAuthor
    .replace(/\s*-\s*topic$/i, '')
    .replace(/vevo$/i, '');

  const titleScore  = overlapScore(titleKws, ytTitle);
  const artistScore = Math.max(
    overlapScore(artistKws, ytTitle),
    overlapScore(artistKws, cleanAuthor),
  );

  const confidence = Math.round((0.6 * titleScore + 0.4 * artistScore) * 100) / 100;

  const seriousDanger = ['cover', 'remix', 'nightcore', 'sped up', 'slowed', 'karaoke'];
  const dangerFlags = flags.filter(f => f.kind === 'danger');
  const hasSeriousDanger = dangerFlags.some(f => seriousDanger.includes(f.name));
  const hasDanger = dangerFlags.length > 0;

  let status;
  if      (titleScore >= 0.75 && artistScore >= 0.5 && !hasDanger)        status = 'match';
  else if (titleScore >= 0.75 && artistScore >= 0.5 && !hasSeriousDanger) status = 'likely-match';
  else if (titleScore >= 0.75 && artistScore >= 0.5)                       status = 'review';
  else if (titleScore >= 0.5  && !hasSeriousDanger)                        status = 'likely-match';
  else if (titleScore >= 0.5)                                              status = 'review';
  else if (titleScore >= 0.25 || artistScore >= 0.5)                       status = 'review';
  else                                                                     status = 'likely-wrong';

  return { status, confidence, titleScore, artistScore };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (typeof fetch === 'undefined') {
    console.error('Error: Node.js 18+ required (built-in fetch API)');
    process.exit(1);
  }

  mkdirSync(DEBUG_DIR, { recursive: true });

  // 1. Parse catalog
  const rawTracks = parseCatalogTracks(readFileSync(CATALOG, 'utf-8'));
  console.log(`\n=== VibeScene YouTube Metadata Verification ===\n`);
  console.log(`Catalog tracks : ${rawTracks.length}`);

  // 2. Cache
  const cache = loadCache();
  console.log(`Cache entries  : ${Object.keys(cache).length}`);

  // 3. Determine unique valid IDs to fetch
  const globalIdCount = {};
  for (const t of rawTracks) {
    const id = t.youtubeVideoId;
    if (id && VIDEO_ID_RE.test(id)) globalIdCount[id] = (globalIdCount[id] || 0) + 1;
  }

  const uniqueValidIds = [...new Set(
    rawTracks.map(t => t.youtubeVideoId).filter(id => id && VIDEO_ID_RE.test(id))
  )];
  const toFetch = uniqueValidIds.filter(id => !(id in cache));

  console.log(`Unique valid IDs: ${uniqueValidIds.length}`);
  console.log(`To fetch        : ${toFetch.length}\n`);

  if (toFetch.length > 0) {
    const estSec = Math.ceil(toFetch.length * DELAY_MS / 1000);
    console.log(`Estimated time  : ~${estSec}s (${DELAY_MS}ms delay)\n`);

    let done = 0;
    for (const videoId of toFetch) {
      const result = await fetchOEmbed(videoId);
      cache[videoId] = result;
      done++;
      const icon = result.ok ? '✓' : '✗';
      const info = result.ok ? result.ytTitle.slice(0, 50) : result.error;
      process.stdout.write(`\r[${done}/${toFetch.length}] ${icon} ${videoId}  ${info}                  `);
      if (done % 50 === 0) saveCache(cache);
      await sleep(DELAY_MS);
    }
    saveCache(cache);
    console.log('\n');
  } else {
    console.log('All IDs already in cache.\n');
  }

  // 4. Classify all tracks
  const laneIdCounts = {};
  for (const t of rawTracks) {
    if (!t.youtubeVideoId || !VIDEO_ID_RE.test(t.youtubeVideoId)) continue;
    const k = `${t.laneId}::${t.youtubeVideoId}`;
    laneIdCounts[k] = (laneIdCounts[k] || 0) + 1;
  }

  const results = rawTracks.map(t => {
    const id = t.youtubeVideoId;
    const idValid    = Boolean(id && VIDEO_ID_RE.test(id));
    const isDuplicate  = idValid && globalIdCount[id] > 1;
    const isSameLaneDup = idValid && laneIdCounts[`${t.laneId}::${id}`] > 1;

    const cached = idValid ? cache[id] : null;
    const unavailable = !idValid || !cached || !cached.ok;

    const ytTitle  = cached?.ok ? cached.ytTitle  : '';
    const ytAuthor = cached?.ok ? cached.ytAuthor : '';
    const ytThumb  = cached?.ok ? cached.ytThumb  : '';
    const httpStatus = cached?.httpStatus ?? null;

    const flags = ytTitle ? detectFlags(ytTitle) : [];
    const { status, confidence, titleScore, artistScore } = classify(
      t.title, t.artist, ytTitle, ytAuthor, flags, unavailable
    );

    const ytUrl    = id ? `https://www.youtube.com/watch?v=${id}` : null;
    const searchQ  = encodeURIComponent(`${t.artist} ${t.title}`);
    const searchUrl = `https://www.youtube.com/results?search_query=${searchQ}`;

    return {
      laneId: t.laneId,
      title:  t.title,
      artist: t.artist,
      videoId: id,
      idValid, isDuplicate, isSameLaneDup,
      ytTitle, ytAuthor, ytThumb, httpStatus,
      status, confidence, titleScore, artistScore,
      flags:     flags.map(f => f.name),
      flagKinds: Object.fromEntries(flags.map(f => [f.name, f.kind])),
      ytUrl, searchUrl,
    };
  });

  // 5. Summary
  const summary = {
    total:       results.length,
    checked:     results.filter(r => r.ytTitle || r.status === 'unavailable').length,
    match:       results.filter(r => r.status === 'match').length,
    likelyMatch: results.filter(r => r.status === 'likely-match').length,
    review:      results.filter(r => r.status === 'review').length,
    likelyWrong: results.filter(r => r.status === 'likely-wrong').length,
    unavailable: results.filter(r => r.status === 'unavailable').length,
    flagged:     results.filter(r => r.flags.some(f => r.flagKinds[f] === 'danger')).length,
    duplicateId: results.filter(r => r.isDuplicate).length,
    sameLaneDup: results.filter(r => r.isSameLaneDup).length,
  };

  // 6. Lane playlist URLs (unique valid IDs per lane, deduped)
  const laneMap = {};
  for (const r of results) {
    if (!laneMap[r.laneId]) laneMap[r.laneId] = { tracks: [], seen: new Set() };
    laneMap[r.laneId].tracks.push(r);
  }
  const lanePlaylists = {};
  for (const [laneId, { tracks, seen }] of Object.entries(laneMap)) {
    const ids = [];
    for (const r of tracks) {
      if (r.idValid && r.status !== 'unavailable' && !seen.has(r.videoId)) {
        ids.push(r.videoId);
        seen.add(r.videoId);
      }
    }
    lanePlaylists[laneId] = ids.length > 0 ? `${PLAYLIST_BASE}${ids.join(',')}` : null;
  }

  // Lane stats for summary
  const laneStats = Object.entries(laneMap).map(([laneId, { tracks }]) => ({
    laneId,
    total:       tracks.length,
    match:       tracks.filter(r => r.status === 'match').length,
    likelyMatch: tracks.filter(r => r.status === 'likely-match').length,
    review:      tracks.filter(r => r.status === 'review').length,
    likelyWrong: tracks.filter(r => r.status === 'likely-wrong').length,
    unavailable: tracks.filter(r => r.status === 'unavailable').length,
  }));

  // 7. JSON report
  writeFileSync(JSON_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    summary,
    tracks: results.map(r => ({
      laneId: r.laneId, title: r.title, artist: r.artist,
      youtubeVideoId: r.videoId,
      ytTitle: r.ytTitle, ytAuthor: r.ytAuthor,
      status: r.status, flags: r.flags, confidence: r.confidence,
      titleScore: r.titleScore, artistScore: r.artistScore,
      isDuplicate: r.isDuplicate, isSameLaneDup: r.isSameLaneDup,
      ytUrl: r.ytUrl, searchUrl: r.searchUrl,
    })),
  }, null, 2), 'utf-8');
  console.log(`JSON: ${JSON_PATH}`);

  // 8. HTML report
  writeFileSync(HTML_PATH, generateHtml(results, summary, laneStats, lanePlaylists), 'utf-8');
  console.log(`HTML: ${HTML_PATH}`);

  // 9. Terminal: top 20 to review
  const priority = results
    .filter(r => ['likely-wrong','unavailable','review'].includes(r.status))
    .sort((a, b) => {
      const rank = { 'likely-wrong': 0, 'unavailable': 1, 'review': 2 };
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
      return a.confidence - b.confidence;
    })
    .slice(0, 20);

  console.log('\n=== Top 20 — 우선 확인 필요 ===\n');
  console.log('Status'.padEnd(14) + 'Conf'.padEnd(6) + 'Lane'.padEnd(30) + 'Title — Artist');
  console.log('─'.repeat(88));
  for (const r of priority) {
    const conf = (Math.round(r.confidence * 100) + '%').padEnd(6);
    const lane = r.laneId.slice(0, 27).padEnd(30);
    console.log(r.status.padEnd(14) + conf + lane + `${r.title} — ${r.artist}`);
  }

  console.log(`\n캐시  : ${CACHE_PATH}`);
  console.log(`JSON  : ${JSON_PATH}`);
  console.log(`HTML  : ${HTML_PATH}`);
  console.log('');
}

// ─── HTML generator ───────────────────────────────────────────────────────────

function generateHtml(results, summary, laneStats, lanePlaylists) {
  const at = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  // Embedded data: strip ytThumb from per-row data to keep HTML lean;
  // thumbnails are loaded lazily from the stored URL.
  const dataJson = JSON.stringify(results.map(r => ({
    laneId: r.laneId,
    title:  r.title, artist: r.artist,
    videoId: r.videoId, idValid: r.idValid,
    isDup: r.isDuplicate, isSameDup: r.isSameLaneDup,
    ytTitle: r.ytTitle, ytAuthor: r.ytAuthor, ytThumb: r.ytThumb,
    status: r.status, flags: r.flags, flagKinds: r.flagKinds,
    conf: r.confidence, titleScore: r.titleScore, artistScore: r.artistScore,
    httpStatus: r.httpStatus,
    ytUrl: r.ytUrl, searchUrl: r.searchUrl,
  }))).replace(/<\/script>/gi, '<\\/script>');

  const laneStatsJson    = JSON.stringify(laneStats);
  const lanePlaylistJson = JSON.stringify(lanePlaylists)
    .replace(/<\/script>/gi, '<\\/script>');

  // Lane summary rows (server-side rendered — static)
  const laneTableRows = laneStats.map(l => {
    const pl = lanePlaylists[l.laneId];
    const openBtn = pl
      ? `<a class="btn b-sm b-lane" href="${esc(pl)}" target="_blank" rel="noopener">▶</a>`
      : '<span class="dim">—</span>';
    return `<tr>
      <td>${esc(l.laneId)}</td>
      <td>${l.total}</td>
      <td class="cv">${l.match}</td>
      <td class="clm">${l.likelyMatch}</td>
      <td class="crv">${l.review > 0 ? l.review : '<span class="dim">0</span>'}</td>
      <td class="cw">${l.likelyWrong > 0 ? `<strong>${l.likelyWrong}</strong>` : '<span class="dim">0</span>'}</td>
      <td class="cu">${l.unavailable > 0 ? `<strong>${l.unavailable}</strong>` : '<span class="dim">0</span>'}</td>
      <td>${openBtn}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>VibeScene — YouTube Metadata Verification</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:13px;background:#0f0f0f;color:#d4d4d4;line-height:1.5}
a{color:#60a5fa;text-decoration:none}a:hover{text-decoration:underline}
h1{font-size:18px;font-weight:700;color:#fff}
h2{font-size:13px;font-weight:700;color:#ccc;text-transform:uppercase;letter-spacing:1px}
code{font-family:monospace;font-size:11px;color:#86efac;background:#1a1a1a;padding:1px 5px;border-radius:3px}
strong{color:#e0e0e0}.dim{color:#444}

/* Summary bar */
.sbar{background:#161616;border-bottom:1px solid #222;padding:16px 20px}
.sbar-title{margin-bottom:2px}.sbar-time{font-size:11px;color:#555;margin-bottom:14px}
.sg{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}
.sc{background:#1e1e1e;border-radius:6px;padding:10px 16px;text-align:center;min-width:90px}
.sc .n{font-size:22px;font-weight:700;color:#fff}.sc .l{font-size:10px;color:#666;margin-top:1px}
.sc.cv .n{color:#4ade80}.sc.clm .n{color:#60a5fa}.sc.crv .n{color:#fbbf24}
.sc.cw .n{color:#f87171}.sc.cu .n{color:#9ca3af}.sc.cf .n{color:#c084fc}

/* Lane table */
.lane-section{margin-top:12px}
.lane-tbl{width:100%;border-collapse:collapse;font-size:12px}
.lane-tbl th{text-align:left;color:#555;padding:4px 8px;border-bottom:1px solid #252525;font-size:10px;text-transform:uppercase;letter-spacing:.8px}
.lane-tbl td{padding:4px 8px;border-bottom:1px solid #1c1c1c}
.lane-tbl tr:hover td{background:#1a1a1a}
.cv{color:#4ade80}.clm{color:#60a5fa}.crv{color:#fbbf24}.cw{color:#f87171}.cu{color:#9ca3af}

/* Filter bar */
.fbar{position:sticky;top:0;z-index:10;background:#111;border-bottom:1px solid #1e1e1e;padding:8px 20px;display:flex;flex-wrap:wrap;gap:6px}
.fb{padding:4px 11px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #2a2a2a;background:#1a1a1a;color:#888}
.fb:hover{color:#ddd;border-color:#444}.fb.active{background:#2563eb;color:#fff;border-color:#2563eb}
.fb.fw{color:#fbbf24;border-color:#fbbf2444}.fb.fw.active{background:#fbbf24;color:#111}
.fb.fx{color:#f87171;border-color:#f8717144}.fb.fx.active{background:#f87171;color:#111}
.fb.fu{color:#9ca3af}.fb.fu.active{background:#9ca3af;color:#111}
.fb.ff{color:#c084fc;border-color:#c084fc44}.fb.ff.active{background:#c084fc;color:#111}

/* Table */
.twrap{padding:0 20px 40px}
.tcount{font-size:11px;color:#555;padding:8px 0 4px}
.tt{width:100%;border-collapse:collapse}
.tt th{text-align:left;font-size:10px;color:#444;text-transform:uppercase;letter-spacing:.8px;padding:6px 8px;border-bottom:1px solid #252525;position:sticky;top:41px;background:#111;z-index:5}
.tt td{padding:6px 8px;border-bottom:1px solid #191919;vertical-align:top}
.tt tbody tr:hover td{background:#161616}

/* Column widths */
.th-thumb{width:72px}.th-lane{width:160px}.th-cat{width:210px}.th-yt{min-width:200px}
.th-status{width:110px}.th-flags{width:130px}.th-conf{width:90px}.th-act{width:120px}

/* Thumbnail */
.thumb{width:64px;height:36px;object-fit:cover;border-radius:3px;display:block}
.thumb-ph{width:64px;height:36px;background:#1e1e1e;border-radius:3px}

/* Lane tag */
.lane-tag{font-size:10px;color:#888;word-break:break-all}

/* Catalog cell */
.cat-title{font-weight:600;color:#e0e0e0;margin-bottom:2px}
.cat-artist{font-size:12px;color:#888;margin-bottom:3px}

/* YouTube cell */
.yt-title{display:block;color:#d0d0d0;margin-bottom:2px;word-break:break-word}
.yt-author{display:block;font-size:11px;color:#666}
.yt-err{font-size:11px;color:#f87171}

/* Status badge */
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700}

/* Flags */
.flag{display:inline-block;padding:1px 5px;border-radius:3px;font-size:10px;font-weight:600;margin:1px 2px 1px 0}
.flag-danger{background:#450a0a;color:#f87171}
.flag-ok{background:#14532d;color:#4ade80}

/* Dup badges */
.dup-badge{display:inline-block;padding:1px 5px;border-radius:3px;font-size:10px;font-weight:700;margin-left:4px}
.dup-global{background:#312e81;color:#a5b4fc}
.dup-lane{background:#4c1d95;color:#c084fc}

/* Confidence bar */
.conf-wrap{display:flex;align-items:center;gap:6px}
.conf-track{flex:1;height:5px;background:#1e1e1e;border-radius:3px;overflow:hidden}
.conf-bar{height:100%;border-radius:3px}
.conf-num{font-size:11px;color:#888;white-space:nowrap;min-width:28px}

/* Buttons */
.btn{display:inline-block;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:none;white-space:nowrap}
.b-yt{background:#b91c1c;color:#fff}.b-yt:hover{background:#991b1b;text-decoration:none}
.b-search{background:#1e3a5f;color:#93c5fd}.b-search:hover{background:#1e40af;text-decoration:none}
.b-lane{background:#14532d;color:#4ade80}.b-lane:hover{background:#166534;text-decoration:none}
.b-copy{background:#1e1e1e;color:#888;border:1px solid #333}.b-copy:hover{color:#ddd}
.b-copy.copied{background:#14532d;color:#4ade80}
.b-sm{padding:2px 7px;font-size:10px}

/* Acts cell */
.act-wrap{display:flex;flex-direction:column;gap:4px}

.empty{text-align:center;color:#555;padding:48px;font-size:14px}
</style>
</head>
<body>

<!-- Summary -->
<div class="sbar">
  <h1 class="sbar-title">YouTube Metadata Verification</h1>
  <p class="sbar-time">Generated: ${at}</p>
  <div class="sg">
    <div class="sc"><div class="n">${summary.total}</div><div class="l">Total</div></div>
    <div class="sc cv"><div class="n">${summary.match}</div><div class="l">match</div></div>
    <div class="sc clm"><div class="n">${summary.likelyMatch}</div><div class="l">likely-match</div></div>
    <div class="sc crv"><div class="n">${summary.review}</div><div class="l">review</div></div>
    <div class="sc cw"><div class="n">${summary.likelyWrong}</div><div class="l">likely-wrong</div></div>
    <div class="sc cu"><div class="n">${summary.unavailable}</div><div class="l">unavailable</div></div>
    <div class="sc cf"><div class="n">${summary.flagged}</div><div class="l">⚑ flagged</div></div>
  </div>

  <details>
    <summary style="cursor:pointer;font-size:12px;color:#555;user-select:none">Lane breakdown ▾</summary>
    <div class="lane-section">
      <table class="lane-tbl">
        <thead><tr>
          <th>Lane</th><th>Total</th>
          <th>match</th><th>likely-match</th><th>review</th><th>likely-wrong</th><th>unavail</th>
          <th>Playlist</th>
        </tr></thead>
        <tbody>${laneTableRows}</tbody>
      </table>
    </div>
  </details>
</div>

<!-- Filter bar -->
<div class="fbar">
  <button class="fb active" data-f="all">All (${summary.total})</button>
  <button class="fb cv" data-f="match">match (${summary.match})</button>
  <button class="fb clm" data-f="likely-match">likely-match (${summary.likelyMatch})</button>
  <button class="fb fw" data-f="review">review (${summary.review})</button>
  <button class="fb fx" data-f="likely-wrong">likely-wrong (${summary.likelyWrong})</button>
  <button class="fb fu" data-f="unavailable">unavailable (${summary.unavailable})</button>
  <button class="fb ff" data-f="flagged">only flagged (${summary.flagged})</button>
  <button class="fb" data-f="duplicate">dup videoId (${summary.duplicateId})</button>
  <button class="fb" data-f="samelane">same-lane dup (${summary.sameLaneDup})</button>
</div>

<!-- Track table -->
<div class="twrap">
  <div class="tcount" id="tcount"></div>
  <table class="tt">
    <thead><tr>
      <th class="th-thumb"></th>
      <th class="th-lane">Lane</th>
      <th class="th-cat">Catalog</th>
      <th class="th-yt">YouTube result</th>
      <th class="th-status">Status</th>
      <th class="th-flags">Flags</th>
      <th class="th-conf">Confidence</th>
      <th class="th-act">Actions</th>
    </tr></thead>
    <tbody id="tbody"></tbody>
  </table>
  <div class="empty" id="empty" style="display:none">No tracks match this filter.</div>
</div>

<script>
  const DATA = ${dataJson};
  const LANE_PLAYLISTS = ${lanePlaylistJson};

  const STATUS_STYLE = {
    'match':        { bg:'#14532d22', color:'#4ade80', border:'#4ade8044' },
    'likely-match': { bg:'#1e3a5f22', color:'#60a5fa', border:'#60a5fa44' },
    'review':       { bg:'#451a0322', color:'#fbbf24', border:'#fbbf2444' },
    'likely-wrong': { bg:'#450a0a22', color:'#f87171', border:'#f8717144' },
    'unavailable':  { bg:'#1e1e1e',   color:'#9ca3af', border:'#333'      },
  };

  let currentFilter = 'all';

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function statusBadge(status) {
    const st = STATUS_STYLE[status] || { bg:'#222', color:'#888', border:'#333' };
    return '<span class="badge" style="background:' + st.bg + ';color:' + st.color + ';border:1px solid ' + st.border + '">' + esc(status) + '</span>';
  }

  function flagsHtml(flags, flagKinds) {
    if (!flags.length) return '<span class="dim">—</span>';
    return flags.map(function(f) {
      var cls = (flagKinds[f] === 'ok') ? 'flag-ok' : 'flag-danger';
      return '<span class="flag ' + cls + '">' + esc(f) + '</span>';
    }).join('');
  }

  function confHtml(conf) {
    var pct = Math.round(conf * 100);
    var color = pct >= 75 ? '#4ade80' : pct >= 50 ? '#60a5fa' : pct >= 25 ? '#fbbf24' : '#f87171';
    return '<div class="conf-wrap"><div class="conf-track"><div class="conf-bar" style="width:' + pct + '%;background:' + color + '"></div></div><span class="conf-num">' + pct + '%</span></div>';
  }

  function matchFilter(t) {
    if (currentFilter === 'all')       return true;
    if (currentFilter === 'flagged')   return t.flags.some(function(f){ return t.flagKinds[f] === 'danger'; });
    if (currentFilter === 'duplicate') return t.isDup;
    if (currentFilter === 'samelane')  return t.isSameDup;
    return t.status === currentFilter;
  }

  function renderRows() {
    var visible = DATA.filter(matchFilter);
    document.getElementById('tcount').textContent = 'Showing ' + visible.length + ' tracks';
    document.getElementById('empty').style.display = visible.length === 0 ? 'block' : 'none';

    var html = '';
    for (var i = 0; i < visible.length; i++) {
      var t = visible[i];

      var thumbHtml = t.ytThumb
        ? '<img class="thumb" src="' + esc(t.ytThumb) + '" loading="lazy" alt="" onerror="this.style.display=\'none\'">'
        : '<div class="thumb-ph"></div>';

      var dupHtml = '';
      if (t.isSameDup)   dupHtml = '<span class="dup-badge dup-lane">same-lane dup</span>';
      else if (t.isDup)  dupHtml = '<span class="dup-badge dup-global">dup</span>';

      var idHtml = t.videoId
        ? '<code>' + esc(t.videoId) + '</code>' + dupHtml
        : '<span class="dim">no id</span>';

      var ytCell = '';
      if (t.ytTitle) {
        ytCell = '<span class="yt-title">' + esc(t.ytTitle) + '</span>';
        if (t.ytAuthor) ytCell += '<span class="yt-author">' + esc(t.ytAuthor) + '</span>';
      } else if (t.httpStatus) {
        ytCell = '<span class="yt-err">HTTP ' + t.httpStatus + '</span>';
      } else {
        ytCell = '<span class="dim">unavailable</span>';
      }

      var openBtn   = t.ytUrl    ? '<a class="btn b-yt" href="' + esc(t.ytUrl)    + '" target="_blank" rel="noopener">▶ Open</a>'   : '';
      var searchBtn = t.searchUrl ? '<a class="btn b-search" href="' + esc(t.searchUrl) + '" target="_blank" rel="noopener">🔍 Search</a>' : '';

      html += '<tr class="tr-' + t.status + '">'
        + '<td class="th-thumb">' + thumbHtml + '</td>'
        + '<td class="th-lane"><span class="lane-tag">' + esc(t.laneId) + '</span></td>'
        + '<td class="th-cat"><div class="cat-title">' + esc(t.title) + '</div><div class="cat-artist">' + esc(t.artist) + '</div>' + idHtml + '</td>'
        + '<td class="th-yt">' + ytCell + '</td>'
        + '<td class="th-status">' + statusBadge(t.status) + '</td>'
        + '<td class="th-flags">' + flagsHtml(t.flags, t.flagKinds) + '</td>'
        + '<td class="th-conf">' + confHtml(t.conf) + '</td>'
        + '<td class="th-act"><div class="act-wrap">' + openBtn + searchBtn + '</div></td>'
        + '</tr>';
    }

    document.getElementById('tbody').innerHTML = html;
  }

  // Filter button click
  document.querySelectorAll('.fb').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.fb').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.dataset.f;
      renderRows();
    });
  });

  function copyUrl(btn, url) {
    navigator.clipboard.writeText(url).then(function() {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function(){ btn.textContent = 'Copy URL'; btn.classList.remove('copied'); }, 2000);
    });
  }

  renderRows();
</script>
</body>
</html>`;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
