import { getTracksByLane, type CatalogSeedTrack, type TrackEnergy } from "../../_shared/musicCatalog.ts";

// catalog 트랙은 musicCatalog.ts의 seededShuffle로 이미 결정론적으로 "선택"되어 있다.
// 이 모듈은 그 선택 결과(트랙 정체성)는 절대 바꾸지 않고, 순서만 6단계 아크로 재배치한다:
//   opener → mood lock → energy lift → emotional peak → cooldown → closer
//
// 10곡 기준 목표 배치(요청 사양):
//   1     opener
//   2-3   mood lock
//   4-5   energy lift
//   6-7   emotional peak
//   8-9   cooldown
//   10    closer
//
// catalog 트랙에는 이미 energy("low"|"medium"|"high") 필드가 있으므로, musicCatalog.ts를
// 건드리지 않고도 이 필드만으로 재정렬할 수 있다.

// [opener, moodLock, energyLift, emotionalPeak, cooldown, closer] 각 stage가 원하는 "에너지 톤".
// 3단계(low/medium/high)뿐이라 소수점 목표값으로 상대적 위치(더 낮음/더 높음)를 표현한다.
const STAGE_TARGET_ENERGY = [2, 1.5, 2.3, 3, 1.3, 1];

// 트랙 수가 10보다 적어 중간 4개 stage에 나눠줄 트랙이 모자랄 때, 어느 stage부터 채울지 우선순위.
// emotional-peak(2)를 최우선으로 채워 "절정"이 가장 두꺼운 구간이 되도록 한다.
const MIDDLE_FILL_PRIORITY = [2, 1, 3, 0];

function energyScore(energy: TrackEnergy): number {
  if (energy === "low") return 1;
  if (energy === "high") return 3;
  return 2;
}

// n곡을 6-stage 아크에 몇 곡씩 배분할지 결정한다.
// opener/closer는 n>=2면 항상 1곡 — 첫 곡과 마지막 곡의 역할은 트랙 수와 무관하게 유지한다.
// 나머지(n-2)곡은 중간 4개 stage(moodLock/energyLift/emotionalPeak/cooldown)에 최대한 고르게 분배하고,
// 나눠 떨어지지 않는 몫은 MIDDLE_FILL_PRIORITY 순서로 하나씩 얹는다.
function computeArcBucketSizes(n: number): number[] {
  if (n <= 0) return [0, 0, 0, 0, 0, 0];
  if (n === 1) return [1, 0, 0, 0, 0, 0];

  const middleTotal = n - 2;
  const middleBucketCount = 4;
  const base = Math.floor(middleTotal / middleBucketCount);
  let remainder = middleTotal - base * middleBucketCount;

  // index 0..3 = moodLock, energyLift, emotionalPeak, cooldown
  const middleSizes = [base, base, base, base];
  for (const idx of MIDDLE_FILL_PRIORITY) {
    if (remainder <= 0) break;
    middleSizes[idx] += 1;
    remainder -= 1;
  }

  return [1, middleSizes[0], middleSizes[1], middleSizes[2], middleSizes[3], 1];
}

// 이미 선택된 catalog 트랙 목록을 6-stage 에너지 아크 순서로 재배치한다.
// 트랙을 추가/삭제/변경하지 않는다 — 같은 배열 원소들의 "순서"만 바뀐다.
//
// stage마다 목표 에너지에 가장 가까운 트랙을 남은 pool에서 그리디하게 하나씩 떼어간다.
// Array.prototype.sort는 stable이므로, energy가 동점인 트랙들은 입력 순서(=seededShuffle 결과)를
// 그대로 유지한 채 배정된다 — 즉 이 함수는 새로운 무작위성을 전혀 추가하지 않는, 순수 결정론적 재배치다.
export function sequencePlaylistArc<T extends Pick<CatalogSeedTrack, "energy">>(tracks: T[]): T[] {
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

  // 방어적 체크 — 버킷 배분 로직에 버그가 있어 개수가 어긋나면 원본(seededShuffle) 순서로 안전하게 fallback.
  if (sequenced.length !== n) return tracks;

  return sequenced;
}

// ── Phase 8: 신뢰 오프너(1번) + 친숙한 mood lock(2번) ──────────────────────
//
// 위의 energy-fit 재배치만으로는 1-2번 트랙이 "그 lane의 아무 low/medium 에너지 곡"이 될 수 있다.
// 첫 1-2곡은 사용자가 "이 서비스가 내 사진을 이해했구나"를 느끼는 신뢰 구간이므로,
// 에너지 적합도뿐 아니라 "이 lane에서 얼마나 대표적인 곡인가"도 함께 고려한다.
//
// catalog에는 인기도/친숙도 필드가 없다 — 664곡을 수동 태깅하거나 GPT를 추가 호출하지 않기 위해,
// 각 lane 배열 안에서 트랙이 등장하는 "원래 순서"를 낮을수록 더 대표적이라는 가벼운 proxy로 사용한다.
// (이 순서가 실제로 "대표곡 우선" 의도로 입력되었다는 보장은 없다 — 확인된 사실이 아니라
//  현재 쓸 수 있는 최선의 근사치라는 점을 최종 리포트에 명시한다.)

const ANCHOR_POSITION_COUNT = 2; // 앵커 로직을 적용하는 앞쪽 포지션 수 (1번, 2번 트랙)
const ANCHOR_SHORTLIST_SIZE = 6; // lane 원본 순서 기준 상위 몇 곡을 "앵커 후보"로 볼지
const ANCHOR_ENERGY_TOLERANCE = 1; // 포지션 목표 에너지와 이보다 많이 차이나면 앵커 후보에서 제외

function simpleSeedHash(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// lane 원본(작성 순서) 배열에서 각 트랙의 index를 조회하기 위한 Map.
// getTracksByLane/selectCatalogTracks/selectVerifiedCatalogTracks는 모두 같은 트랙 객체 참조를
// 공유하므로(필터/셔플만 하고 복제하지 않음) 객체 참조 키만으로 정확히 매칭된다.
function buildLaneIndexMap(laneId: string): Map<CatalogSeedTrack, number> {
  const map = new Map<CatalogSeedTrack, number>();
  getTracksByLane(laneId).forEach((track, idx) => map.set(track, idx));
  return map;
}

function expandStageSequence(bucketSizes: number[]): number[] {
  const sequence: number[] = [];
  bucketSizes.forEach((size, stage) => {
    for (let i = 0; i < size; i += 1) sequence.push(stage);
  });
  return sequence;
}

// candidatePool 중에서 1번/2번 포지션에 놓을 "신뢰 오프너 + 친숙한 mood lock"을 고른다.
// 조건에 맞는 후보가 없는 포지션부터는 빈 채로 두어, 호출부가 일반 energy-fit 로직으로
// 자연스럽게 이어받게 한다(억지로 채우지 않음).
function pickAnchorTracks(
  candidatePool: CatalogSeedTrack[],
  laneIndexMap: Map<CatalogSeedTrack, number>,
  positionTargets: number[],
  seed: string,
): CatalogSeedTrack[] {
  const anchors: CatalogSeedTrack[] = [];
  const remaining = [...candidatePool];

  for (let position = 0; position < ANCHOR_POSITION_COUNT; position += 1) {
    const target = positionTargets[position];
    if (target === undefined) break;

    // "유명하다는 이유로 고에너지 절정곡을 1번에 놓지 않는다" — high energy는 항상 앵커 후보에서 제외.
    // 그 외에는 해당 포지션 목표 에너지와 크게 어긋나지 않는 곡만 앵커 후보로 인정한다.
    const eligible = remaining.filter(
      (track) => track.energy !== "high" && Math.abs(energyScore(track.energy) - target) <= ANCHOR_ENERGY_TOLERANCE,
    );
    if (eligible.length === 0) break;

    // lane 원본 순서(대표곡 proxy) 기준 오름차순 정렬 후 상위 N곡을 숏리스트로 삼는다.
    const shortlist = [...eligible]
      .sort(
        (a, b) =>
          (laneIndexMap.get(a) ?? Number.MAX_SAFE_INTEGER) - (laneIndexMap.get(b) ?? Number.MAX_SAFE_INTEGER),
      )
      .slice(0, ANCHOR_SHORTLIST_SIZE);

    // 같은 lane이라도 playlist(=seed)마다 다른 앵커가 나오도록, 숏리스트 안에서 seed 기반으로 회전 선택.
    // 매번 같은 두 곡으로 시작하는 것을 피하면서도, seed가 같으면 항상 같은 결과(결정론)를 유지한다.
    const pickedIndex = simpleSeedHash(`${seed}:anchor:${position}`) % shortlist.length;
    const picked = shortlist[pickedIndex];

    anchors.push(picked);
    remaining.splice(remaining.indexOf(picked), 1);
  }

  return anchors;
}

// 앵커 인지 시퀀싱 — 1/2번 포지션은 "신뢰할 수 있고 친숙한" 곡을 우선하고,
// 나머지 포지션은 기존 energy-fit 아크 로직을 그대로 사용한다.
// 트랙을 추가/삭제/변경하지 않는다 — candidatePool 안에서 어떤 targetCount곡을 어떤 "순서"로 쓸지만 정한다.
//
// 3단계 fallback:
//   1) 앵커 인지 시퀀싱 실패 → sequencePlaylistArc(순수 energy-fit)로 fallback
//   2) 그것도 실패 → candidatePool의 원본(seededShuffle) 순서를 그대로 사용
export function sequenceCatalogTracksWithAnchors(
  candidatePool: CatalogSeedTrack[],
  laneId: string,
  seed: string,
  finalCount = 10,
): CatalogSeedTrack[] {
  const targetCount = Math.min(finalCount, candidatePool.length);
  if (targetCount <= 0) return [];

  // count:10으로 선택했을 때와 동일한 seededShuffle 순서(앞쪽 targetCount개) — energy-fit fallback 입력.
  const legacySelection = candidatePool.slice(0, targetCount);

  try {
    const bucketSizes = computeArcBucketSizes(targetCount);
    const positionTargets = expandStageSequence(bucketSizes).map((stage) => STAGE_TARGET_ENERGY[stage]);
    const laneIndexMap = buildLaneIndexMap(laneId);

    const anchors = pickAnchorTracks(candidatePool, laneIndexMap, positionTargets, seed);
    const pool = candidatePool.filter((track) => !anchors.includes(track));
    const sequenced: CatalogSeedTrack[] = [...anchors];

    for (let position = anchors.length; position < targetCount; position += 1) {
      const target = positionTargets[position];
      pool.sort((a, b) => Math.abs(energyScore(a.energy) - target) - Math.abs(energyScore(b.energy) - target));
      const next = pool.shift();
      if (!next) break;
      sequenced.push(next);
    }

    if (sequenced.length !== targetCount) {
      throw new Error(`anchor sequencing produced ${sequenced.length} tracks, expected ${targetCount}`);
    }

    return sequenced;
  } catch (anchorErr) {
    console.error("[sequencing] anchor_aware_sequencing_failed", {
      laneId,
      errorMessage: anchorErr instanceof Error ? anchorErr.message : String(anchorErr),
    });

    try {
      return sequencePlaylistArc(legacySelection);
    } catch (energyErr) {
      console.error("[sequencing] energy_fit_sequencing_failed", {
        laneId,
        errorMessage: energyErr instanceof Error ? energyErr.message : String(energyErr),
      });
      return legacySelection;
    }
  }
}
