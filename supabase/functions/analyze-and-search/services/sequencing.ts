import type { CatalogSeedTrack, TrackEnergy } from "../../_shared/musicCatalog.ts";

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
