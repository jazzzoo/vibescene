#!/usr/bin/env node
/**
 * musicCatalog.ts의 모든 lane에 대해 YouTube videoId 검증 현황을 표로 출력한다.
 * YouTube API를 절대 호출하지 않는다.
 *
 * 사용법:
 *   node scripts/check-catalog-youtube-ids.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CATALOG_PATH = join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');

const READY_THRESHOLD = 5;

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
      videoId: rawId || null,
    });
  }

  return tracks;
}

function main() {
  const fileContent = readFileSync(CATALOG_PATH, 'utf-8');
  const allTracks = parseCatalogTracks(fileContent);

  // 파일 등장 순서대로 lane 목록 구성
  const laneOrder = [];
  const seenLanes = new Set();
  for (const t of allTracks) {
    if (!seenLanes.has(t.laneId)) {
      laneOrder.push(t.laneId);
      seenLanes.add(t.laneId);
    }
  }

  const laneStats = laneOrder.map(laneId => {
    const tracks = allTracks.filter(t => t.laneId === laneId);
    const verified = tracks.filter(t => t.videoId).length;
    return {
      laneId,
      total: tracks.length,
      verified,
      ready: verified >= READY_THRESHOLD,
    };
  });

  const totalTracks = allTracks.length;
  const totalVerified = allTracks.filter(t => t.videoId).length;
  const readyLaneCount = laneStats.filter(l => l.ready).length;

  // 컬럼 너비 계산
  const laneColWidth = Math.max(...laneStats.map(l => l.laneId.length), 4);

  const header =
    'Lane'.padEnd(laneColWidth) +
    '  ' + 'Total'.padStart(5) +
    '  ' + 'Verified'.padStart(8) +
    '  ' + '    %' +
    '  Ready';

  const sep = '─'.repeat(header.length);

  console.log('');
  console.log('=== YouTube ID Coverage ===');
  console.log('');
  console.log(header);
  console.log(sep);

  for (const stat of laneStats) {
    const pct = stat.total > 0 ? Math.round((stat.verified / stat.total) * 100) : 0;
    const readyMark = stat.ready ? '✓' : '✗';
    const pctStr = `${String(pct).padStart(3)}%`;

    console.log(
      stat.laneId.padEnd(laneColWidth) +
      '  ' + String(stat.total).padStart(5) +
      '  ' + String(stat.verified).padStart(8) +
      '  ' + pctStr.padStart(5) +
      '  ' + readyMark
    );
  }

  console.log(sep);
  console.log('');

  const totalPct = totalTracks > 0 ? Math.round((totalVerified / totalTracks) * 100) : 0;
  console.log(`전체 트랙:      ${totalTracks}`);
  console.log(`전체 verified:  ${totalVerified} / ${totalTracks} (${totalPct}%)`);
  console.log(`Ready lanes:    ${readyLaneCount} / ${laneStats.length}  (기준: verified >= ${READY_THRESHOLD})`);
  console.log('');
  console.log('템플릿 생성:  node scripts/export-youtube-id-template.mjs --lane <lane-id>');
  console.log('ID 적용(실행): node scripts/apply-youtube-ids-from-template.mjs --lane <lane-id> --apply');
  console.log('');
}

main();
