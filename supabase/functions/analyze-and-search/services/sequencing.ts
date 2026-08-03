import { type CatalogTrack, type TrackEnergy } from "../../_shared/musicCatalog.ts";

// catalog 트랙의 순서만 6단계 에너지 아크로 재배치한다. 트랙 추가/삭제/변경 없음.
//   opener → mood lock → energy lift → emotional peak → cooldown → closer
//
// 10곡 기준 목표 배치:
//   1     opener
//   2-3   mood lock
//   4-5   energy lift
//   6-7   emotional peak
//   8-9   cooldown
//   10    closer
//
// Lane 기반 anchor 로직 제거됨 (Phase 7, catalog-genre-reclassification 마이그레이션).
// 후속 장르-우선 알고리즘 도입 시 anchor 로직을 별도로 재설계한다.

// [opener, moodLock, energyLift, emotionalPeak, cooldown, closer] stage별 목표 에너지 톤.
const STAGE_TARGET_ENERGY = [2, 1.5, 2.3, 3, 1.3, 1];

// 트랙 수 부족 시 중간 4개 stage 채우기 우선순위.
const MIDDLE_FILL_PRIORITY = [2, 1, 3, 0];

function energyScore(energy: TrackEnergy): number {
  if (energy === "low") return 1;
  if (energy === "high") return 3;
  return 2;
}

// n곡을 6-stage 아크에 몇 곡씩 배분할지 결정한다.
function computeArcBucketSizes(n: number): number[] {
  if (n <= 0) return [0, 0, 0, 0, 0, 0];
  if (n === 1) return [1, 0, 0, 0, 0, 0];

  const middleTotal = n - 2;
  const middleBucketCount = 4;
  const base = Math.floor(middleTotal / middleBucketCount);
  let remainder = middleTotal - base * middleBucketCount;

  const middleSizes = [base, base, base, base];
  for (const idx of MIDDLE_FILL_PRIORITY) {
    if (remainder <= 0) break;
    middleSizes[idx] += 1;
    remainder -= 1;
  }

  return [1, middleSizes[0], middleSizes[1], middleSizes[2], middleSizes[3], 1];
}

// 이미 선택된 catalog 트랙 목록을 6-stage 에너지 아크 순서로 재배치한다.
// 같은 배열 원소들의 "순서"만 바뀐다. 새로운 무작위성을 추가하지 않는 결정론적 재배치.
export function sequencePlaylistArc<T extends Pick<CatalogTrack, "energy">>(tracks: T[]): T[] {
  const n = tracks.length;
  if (n <= 1) return tracks;

  const bucketSizes = computeArcBucketSizes(n);
  const pool = [...tracks];
  const sequenced: T[] = [];

  for (let stage = 0; stage < STAGE_TARGET_ENERGY.length; stage += 1) {
    const size = bucketSizes[stage];
    if (size === 0) continue;

    const target = STAGE_TARGET_ENERGY[stage];
    pool.sort((a, b) => Math.abs(energyScore(a.energy) - target) - Math.abs(energyScore(b.energy) - target));

    sequenced.push(...pool.splice(0, size));
  }

  // 버킷 배분 버그 방어 — 개수 어긋나면 원본 순서로 안전하게 fallback.
  if (sequenced.length !== n) return tracks;

  return sequenced;
}

// 후보 풀에서 finalCount개를 energy arc 순서로 배열한다.
// Phase 7: 레인 기반 anchor 로직 제거. sequencePlaylistArc만 사용.
// 실패 시 candidatePool slice 순서(seededShuffle 결과)로 fallback.
export function sequenceCatalogTracks(
  candidatePool: CatalogTrack[],
  finalCount = 10,
): CatalogTrack[] {
  const targetCount = Math.min(finalCount, candidatePool.length);
  if (targetCount <= 0) return [];

  const selection = candidatePool.slice(0, targetCount);

  try {
    return sequencePlaylistArc(selection);
  } catch (err) {
    console.error("[sequencing] energy_fit_sequencing_failed", {
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return selection;
  }
}

// Backward-compatible alias — remove after index.ts call sites are updated.
export function sequenceCatalogTracksWithAnchors(
  candidatePool: CatalogTrack[],
  _seed: string,      // formerly laneId — ignored after lane removal
  finalCount = 10,
): CatalogTrack[] {
  return sequenceCatalogTracks(candidatePool, finalCount);
}
