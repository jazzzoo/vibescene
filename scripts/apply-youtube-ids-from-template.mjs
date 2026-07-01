#!/usr/bin/env node
/**
 * scratch/youtube-id-input/<lane>.md 를 읽어 musicCatalog.ts에 youtubeVideoId를 적용한다.
 * YouTube API를 절대 호출하지 않는다.
 * 기본은 dry-run. --apply 옵션이 있을 때만 파일을 실제 수정한다.
 *
 * 사용법:
 *   node scripts/apply-youtube-ids-from-template.mjs --lane <lane-id>
 *   node scripts/apply-youtube-ids-from-template.mjs --lane <lane-id> --apply
 *
 * 지원 URL 형식:
 *   https://www.youtube.com/watch?v=B1tqsYYiY9Q
 *   https://www.youtube.com/watch?v=B1tqsYYiY9Q&list=...
 *   https://youtu.be/B1tqsYYiY9Q
 *   https://www.youtube.com/shorts/B1tqsYYiY9Q
 *   B1tqsYYiY9Q  (11자 videoId 직접 입력)
 */

import assert from 'assert';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, URL as NodeURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CATALOG_PATH = join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const INPUT_DIR = join(ROOT, 'scratch/youtube-id-input');

const VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

// ─── 인수 파싱 ────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let lane = null;
  let apply = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lane' && args[i + 1]) {
      lane = args[i + 1];
      i++;
    } else if (args[i] === '--apply') {
      apply = true;
    }
  }
  return { lane, apply };
}

// ─── videoId 추출 ────────────────────────────────────────────────────────────
// URLSearchParams를 사용해 v 파라미터만 정확히 읽는다.
// list=RD..., start_radio, index, pp 등 다른 파라미터는 완전히 무시한다.

function extractVideoId(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // URL 파싱 시도
  let parsed = null;
  try {
    parsed = new NodeURL(trimmed);
  } catch {
    // 유효한 URL 아님 → bare videoId 가능성
  }

  if (parsed) {
    const host = parsed.hostname;
    const isYoutubeDomain =
      host === 'www.youtube.com' || host === 'youtube.com';

    // https://www.youtube.com/watch?v=ID[&list=...&start_radio=...]
    // searchParams.get('v')만 읽으므로 list, start_radio 등은 완전히 무시된다.
    if (isYoutubeDomain && parsed.pathname === '/watch') {
      const v = parsed.searchParams.get('v');
      if (v && VIDEO_ID_REGEX.test(v)) return v;
      return null; // watch URL인데 v가 없거나 형식 불일치
    }

    // https://youtu.be/ID
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      if (VIDEO_ID_REGEX.test(id)) return id;
      return null;
    }

    // https://www.youtube.com/shorts/ID
    if (isYoutubeDomain && parsed.pathname.startsWith('/shorts/')) {
      const id = parsed.pathname.split('/')[2] ?? '';
      if (VIDEO_ID_REGEX.test(id)) return id;
      return null;
    }

    // 인식된 YouTube 도메인이지만 알 수 없는 경로
    if (isYoutubeDomain || host === 'youtu.be') return null;
  }

  // 11자리 bare videoId
  if (VIDEO_ID_REGEX.test(trimmed)) return trimmed;

  return null;
}

// ─── self-check ──────────────────────────────────────────────────────────────
// 스크립트 시작 시 항상 실행. 실패하면 즉시 종료.

function runSelfCheck() {
  const TARGET = 'yHKb38-nl3U';
  const tests = [
    ['https://www.youtube.com/watch?v=yHKb38-nl3U', TARGET],
    ['https://www.youtube.com/watch?v=yHKb38-nl3U&list=RDyHKb38-nl3U&start_radio=1', TARGET],
    ['https://youtu.be/yHKb38-nl3U', TARGET],
    ['https://www.youtube.com/shorts/yHKb38-nl3U', TARGET],
    ['yHKb38-nl3U', TARGET],
  ];

  let passed = 0;
  for (const [input, expected] of tests) {
    const result = extractVideoId(input);
    try {
      assert.strictEqual(result, expected, `extractVideoId("${input}")`);
      passed++;
    } catch {
      console.error(`[self-check] FAIL: extractVideoId("${input}")`);
      console.error(`  expected: "${expected}"`);
      console.error(`  got:      "${result}"`);
      process.exit(1);
    }
  }
  console.log(`[self-check] extractVideoId: ${passed}/${tests.length} passed`);
}

// ─── 템플릿 파싱 ─────────────────────────────────────────────────────────────

function parseTemplate(content) {
  const entries = [];
  const lines = content.split('\n');
  let currentEntry = null;

  for (const line of lines) {
    // "N. Title — Artist" 형식 (em dash U+2014)
    const trackLine = line.match(/^(\d+)\.\s+(.+?)\s+—\s+(.+)$/);
    if (trackLine) {
      currentEntry = {
        num: parseInt(trackLine[1], 10),
        title: trackLine[2].trim(),
        artist: trackLine[3].trim(),
        rawUrl: null,
      };
      entries.push(currentEntry);
      continue;
    }

    if (currentEntry) {
      const urlLine = line.match(/^\s+youtubeUrl:\s*(.*)$/);
      if (urlLine) {
        // 줄 끝 인라인 주석 제거 (공백+# 이후)
        const withoutComment = urlLine[1].replace(/\s+#.*$/, '').trim();
        currentEntry.rawUrl = withoutComment || null;
      }
    }
  }

  return entries;
}

// ─── 카탈로그 블록 파싱 ──────────────────────────────────────────────────────

function parseCatalogBlocks(fileContent) {
  const blocks = [];
  const blockRegex = /\{[^{}]+\}/gs;
  let match;

  while ((match = blockRegex.exec(fileContent)) !== null) {
    const text = match[0];
    const laneIdMatch = text.match(/laneId:\s*"([^"]+)"/);
    const titleMatch = text.match(/title:\s*"([^"]+)"/);
    const artistMatch = text.match(/artist:\s*"([^"]+)"/);

    if (!laneIdMatch || !titleMatch || !artistMatch) continue;

    const videoIdMatch = text.match(/youtubeVideoId:\s*"([^"]*)"/);
    const rawCurrentId = videoIdMatch ? videoIdMatch[1].trim() : null;

    blocks.push({
      text,
      start: match.index,
      end: match.index + text.length,
      laneId: laneIdMatch[1],
      title: titleMatch[1],
      artist: artistMatch[1],
      hasVideoId: videoIdMatch !== null,
      currentVideoId: rawCurrentId || null,
    });
  }

  return blocks;
}

// ─── 블록 수정 ───────────────────────────────────────────────────────────────

function insertVideoId(blockText, videoId) {
  const lines = blockText.split('\n');
  const artistIdx = lines.findIndex(line => /artist:\s*"[^"]+"/.test(line));
  if (artistIdx === -1) return blockText;

  const indentMatch = lines[artistIdx].match(/^([ \t]*)/);
  const indent = indentMatch ? indentMatch[1] : '    ';
  const newLine = `${indent}youtubeVideoId: "${videoId}",`;

  return [
    ...lines.slice(0, artistIdx + 1),
    newLine,
    ...lines.slice(artistIdx + 1),
  ].join('\n');
}

function replaceVideoId(blockText, videoId) {
  return blockText.replace(
    /youtubeVideoId:\s*"[^"]*"/,
    `youtubeVideoId: "${videoId}"`
  );
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

function main() {
  runSelfCheck();

  const { lane, apply } = parseArgs();

  if (!lane) {
    console.error('Usage: node scripts/apply-youtube-ids-from-template.mjs --lane <lane-id> [--apply]');
    process.exit(1);
  }

  // 템플릿 파일 읽기
  const templatePath = join(INPUT_DIR, `${lane}.md`);
  let templateContent;
  try {
    templateContent = readFileSync(templatePath, 'utf-8');
  } catch {
    console.error(`Template not found: ${templatePath}`);
    console.error(`먼저 export를 실행하세요: node scripts/export-youtube-id-template.mjs --lane ${lane}`);
    process.exit(1);
  }

  // 카탈로그 파일 읽기
  const fileContent = readFileSync(CATALOG_PATH, 'utf-8');

  // 파싱
  const entries = parseTemplate(templateContent);
  const allBlocks = parseCatalogBlocks(fileContent);
  const laneBlocks = allBlocks.filter(b => b.laneId === lane);

  if (laneBlocks.length === 0) {
    console.error(`Lane "${lane}" not found in catalog.`);
    process.exit(1);
  }

  // 전체 카탈로그의 현재 videoId 맵 (중복 검증용)
  const globalVideoIdMap = new Map(); // videoId -> "laneId::title::artist"
  for (const b of allBlocks) {
    if (b.currentVideoId) {
      const key = `${b.laneId}::${b.title}::${b.artist}`;
      globalVideoIdMap.set(b.currentVideoId, key);
    }
  }

  // 통계
  let newlyAdded = 0;
  let updated = 0;
  let skipped = 0;
  let invalidCount = 0;
  const warnings = [];

  // 이번 세션에서 할당 예정인 videoId 추적 (인트라 템플릿 중복 검사)
  const assignedInTemplate = new Map(); // videoId -> "title by artist"

  // 적용할 변경 목록
  const changes = [];

  for (const entry of entries) {
    const { num, title, artist, rawUrl } = entry;

    if (!rawUrl) {
      skipped++;
      continue;
    }

    const videoId = extractVideoId(rawUrl);

    if (!videoId) {
      warnings.push(`[WARN] Entry ${num} ("${title}"): videoId를 추출할 수 없음 → "${rawUrl}"`);
      invalidCount++;
      continue;
    }

    if (!VIDEO_ID_REGEX.test(videoId)) {
      warnings.push(`[WARN] Entry ${num} ("${title}"): 잘못된 videoId 형식 → "${videoId}"`);
      invalidCount++;
      continue;
    }

    // 인트라 템플릿 중복 검사
    if (assignedInTemplate.has(videoId)) {
      warnings.push(
        `[WARN] 중복 videoId (템플릿 내): "${videoId}" → entry ${num} "${title}" AND "${assignedInTemplate.get(videoId)}"`
      );
    }

    // 같은 lane 내 기존 카탈로그 중복 검사
    const sameLaneDup = laneBlocks.find(
      b => b.currentVideoId === videoId && !(b.title === title && b.artist === artist)
    );
    if (sameLaneDup) {
      warnings.push(
        `[WARN] 같은 lane 내 중복 videoId "${videoId}": "${title}" vs "${sameLaneDup.title}" by "${sameLaneDup.artist}"`
      );
    }

    // 전체 카탈로그 중복 검사
    if (globalVideoIdMap.has(videoId)) {
      const existingKey = globalVideoIdMap.get(videoId);
      const currentKey = `${lane}::${title}::${artist}`;
      if (existingKey !== currentKey) {
        warnings.push(
          `[WARN] 전체 카탈로그 중복 videoId "${videoId}": 이미 사용됨 → ${existingKey}`
        );
      }
    }

    assignedInTemplate.set(videoId, `${title} by ${artist}`);

    // 해당 트랙 블록 찾기
    const block = laneBlocks.find(b => b.title === title && b.artist === artist);
    if (!block) {
      warnings.push(`[WARN] 카탈로그에서 찾을 수 없음: lane="${lane}" title="${title}" artist="${artist}"`);
      skipped++;
      continue;
    }

    // 같은 값이면 skip
    if (block.currentVideoId === videoId) {
      skipped++;
      continue;
    }

    const isUpdate = block.hasVideoId;
    const newBlockText = isUpdate
      ? replaceVideoId(block.text, videoId)
      : insertVideoId(block.text, videoId);

    changes.push({ block, newBlockText, videoId, isUpdate, title, artist });

    if (isUpdate) {
      updated++;
    } else {
      newlyAdded++;
    }
  }

  // 경고 출력
  if (warnings.length > 0) {
    console.log('');
    for (const w of warnings) {
      console.warn(w);
    }
  }

  // 리포트
  const laneTotal = laneBlocks.length;
  const laneVerified = laneBlocks.filter(b => b.currentVideoId).length;

  // 중복 videoId 목록 (changes 내에서)
  const dupVideoIds = [];
  const seenNewIds = new Set();
  for (const c of changes) {
    if (seenNewIds.has(c.videoId)) {
      dupVideoIds.push(c.videoId);
    }
    seenNewIds.add(c.videoId);
  }

  console.log('');
  console.log('=== Report ===');
  console.log(`Lane:              ${lane}`);
  console.log(`Lane total tracks: ${laneTotal}`);
  console.log(`Lane verified:     ${laneVerified}`);
  console.log(`Newly added:       ${newlyAdded}`);
  console.log(`Updated:           ${updated}`);
  console.log(`Skipped:           ${skipped}`);
  console.log(`Invalid URL:       ${invalidCount}`);
  if (dupVideoIds.length > 0) {
    console.log(`Duplicate videoIds: ${[...new Set(dupVideoIds)].join(', ')}`);
  }

  if (changes.length === 0) {
    console.log('');
    console.log('변경할 내용이 없습니다.');
    return;
  }

  if (!apply) {
    console.log('');
    console.log('[dry-run] 적용 예정 변경 목록:');
    for (const c of changes) {
      const action = c.isUpdate ? 'UPDATE' : 'ADD';
      const prev = c.block.currentVideoId ? ` (기존: ${c.block.currentVideoId})` : '';
      console.log(`  [${action}] "${c.title}" by "${c.artist}" → ${c.videoId}${prev}`);
    }
    console.log('');
    console.log('실제 적용: node scripts/apply-youtube-ids-from-template.mjs --lane ' + lane + ' --apply');
    return;
  }

  // 실제 적용 — 위치가 큰 것부터 처리해 앞쪽 offset을 유지
  let newContent = fileContent;
  const sortedChanges = [...changes].sort((a, b) => b.block.start - a.block.start);

  for (const c of sortedChanges) {
    newContent = newContent.slice(0, c.block.start) + c.newBlockText + newContent.slice(c.block.end);
  }

  writeFileSync(CATALOG_PATH, newContent, 'utf-8');
  console.log('');
  console.log(`[apply] musicCatalog.ts 업데이트 완료.`);
  console.log(`  추가: ${newlyAdded}개 / 수정: ${updated}개`);
}

main();
