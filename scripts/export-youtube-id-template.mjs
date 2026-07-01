#!/usr/bin/env node
/**
 * musicCatalog.ts에서 lane별 트랙 목록을 추출해 YouTube ID 입력 템플릿을 생성한다.
 * YouTube API를 절대 호출하지 않는다.
 *
 * 사용법:
 *   node scripts/export-youtube-id-template.mjs --lane <lane-id>
 *
 * 출력:
 *   scratch/youtube-id-input/<lane-id>.md
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CATALOG_PATH = join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const OUTPUT_DIR = join(ROOT, 'scratch/youtube-id-input');

function parseArgs() {
  const args = process.argv.slice(2);
  let lane = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lane' && args[i + 1]) {
      lane = args[i + 1];
      i++;
    }
  }
  return { lane };
}

function parseCatalogTracks(fileContent) {
  const tracks = [];
  const blockRegex = /\{[^{}]+\}/gs;
  let match;

  while ((match = blockRegex.exec(fileContent)) !== null) {
    const block = match[0];
    const laneIdMatch = block.match(/laneId:\s*"([^"]+)"/);
    const titleMatch = block.match(/title:\s*"([^"]+)"/);
    const artistMatch = block.match(/artist:\s*"([^"]+)"/);

    if (!laneIdMatch || !titleMatch || !artistMatch) continue;

    const videoIdMatch = block.match(/youtubeVideoId:\s*"([^"]*)"/);
    const rawId = videoIdMatch ? videoIdMatch[1].trim() : '';

    tracks.push({
      laneId: laneIdMatch[1],
      title: titleMatch[1],
      artist: artistMatch[1],
      youtubeVideoId: rawId || null,
    });
  }

  return tracks;
}

function buildSearchUrl(title, artist) {
  const query = encodeURIComponent(`${title} ${artist} official audio`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

function generateTemplate(laneId, tracks) {
  const verified = tracks.filter(t => t.youtubeVideoId);
  const lines = [
    `# ${laneId}`,
    ``,
    `<!-- Total: ${tracks.length} | Verified: ${verified.length} -->`,
    `<!-- youtubeUrl 란에 YouTube URL 또는 videoId(11자)를 입력하세요. -->`,
    `<!-- 이미 입력된 값은 기존 youtubeVideoId입니다. 올바른 값이면 그대로 두세요. -->`,
    ``,
  ];

  tracks.forEach((track, index) => {
    const existingVal = track.youtubeVideoId ?? '';
    lines.push(`${index + 1}. ${track.title} — ${track.artist}`);
    lines.push(`   youtubeUrl: ${existingVal}`);
    lines.push(`   # search: ${buildSearchUrl(track.title, track.artist)}`);
    lines.push('');
  });

  return lines.join('\n');
}

function main() {
  const { lane } = parseArgs();

  const fileContent = readFileSync(CATALOG_PATH, 'utf-8');
  const allTracks = parseCatalogTracks(fileContent);

  const allLaneIds = [];
  const seen = new Set();
  for (const t of allTracks) {
    if (!seen.has(t.laneId)) {
      allLaneIds.push(t.laneId);
      seen.add(t.laneId);
    }
  }

  if (!lane) {
    console.error('Usage: node scripts/export-youtube-id-template.mjs --lane <lane-id>');
    console.error('');
    console.error('Available lanes:');
    allLaneIds.forEach(l => console.error(`  ${l}`));
    process.exit(1);
  }

  const laneTracks = allTracks.filter(t => t.laneId === lane);

  if (laneTracks.length === 0) {
    console.error(`Lane not found: "${lane}"`);
    console.error('Available lanes: ' + allLaneIds.join(', '));
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const outputPath = join(OUTPUT_DIR, `${lane}.md`);
  const templateContent = generateTemplate(lane, laneTracks);
  writeFileSync(outputPath, templateContent, 'utf-8');

  const verified = laneTracks.filter(t => t.youtubeVideoId);
  console.log(`[export] Lane:     ${lane}`);
  console.log(`[export] Total:    ${laneTracks.length} tracks`);
  console.log(`[export] Verified: ${verified.length} tracks`);
  console.log(`[export] Output:   ${outputPath}`);
}

main();
