// Step 5-A: 이미지 벡터(targetStats/contextAffinity) 기반 결정론적 카탈로그 스코어링.
//
// content-blind seeded shuffle(musicCatalog.ts의 selectFlatCatalogTracks /
// selectVerifiedFlatCatalogTracks)을 대체하기 위한 모듈이다. playlistId, 시드,
// lane, 장르, mood tag, GPT가 추천한 곡 제목, coarse energy(low/medium/high)는
// 전혀 사용하지 않는다 — 오직 이미지에서 나온 17 targetStats + 13 contextAffinity와
// 각 트랙의 17 stats + 13 affinity 사이의 가중 유사도만 사용한다.
//
// 이 모듈은 순수 함수만 제공한다: MUSIC_CATALOG를 변형하지 않고, sequencing이나
// DB 쓰기를 수행하지 않는다. 두 import 모두 type-only이므로(아래 참고),
// 이 파일을 로드해도 gpt.ts(OpenAI 호출)나 musicCatalog.ts(795-track 데이터 배열)의
// 런타임 코드가 실행되지 않는다 — 실제 트랙 배열은 항상 호출부(index.ts)가 인자로 전달한다.

import type { CatalogTrack, TrackAffinity, TrackStats } from "../../_shared/musicCatalog.ts";
import type { PrimaryGenre, Subgenre } from "../../_shared/musicGenreTaxonomy.ts";
import type { ContextAffinity, TargetStats } from "./gpt.ts";

// 이미지 분석에서 나온 "장면 벡터" — targetStats(17) + contextAffinity(13).
export type SceneVector = {
  targetStats: TargetStats;
  contextAffinity: ContextAffinity;
};

// ── Phase 4: 정확한 필드 그룹 — 17 targetStats + 13 contextAffinity 필드를 각각 정확히 1회씩 사용 ──
const ATMOSPHERE_FIELDS = [
  "brightness", "warmth", "openness", "motion", "intimacy",
  "socialEnergy", "tension", "nostalgia", "playfulness", "dreaminess",
] as const;

const DESIRED_SOUND_FIELDS = [
  "energy", "groove", "density", "acousticness", "electronicness",
  "vocalPresence", "climaxIntensity",
] as const;

const SEASON_FIELDS = ["spring", "summer", "autumn", "winter"] as const;
const TIME_FIELDS = ["morning", "day", "dusk", "night", "lateNight"] as const;
const WEATHER_FIELDS = ["clear", "cloudy", "rain", "snow"] as const;

// 검증용 — 17 stats / 13 affinity 필드 전체 목록. 위 그룹을 이어붙인 것이므로
// 그룹 목록과 별도로 필드 리터럴을 중복 선언하지 않는다.
const ALL_STATS_FIELDS: readonly string[] = [...ATMOSPHERE_FIELDS, ...DESIRED_SOUND_FIELDS];
const ALL_AFFINITY_FIELDS: readonly string[] = [...SEASON_FIELDS, ...TIME_FIELDS, ...WEATHER_FIELDS];

// ── Phase 5: 정확한 그룹 가중치 — 단일 source of truth, 불변, 합계는 정확히 1.00 ──
export const SCORE_WEIGHTS = Object.freeze({
  atmosphere: 0.30,
  desiredSound: 0.30,
  season: 0.15,
  time: 0.10,
  weather: 0.15,
});

export type ScoreBreakdown = {
  track: CatalogTrack;
  totalScore: number;
  atmosphereScore: number;
  desiredSoundScore: number;
  seasonScore: number;
  timeScore: number;
  weatherScore: number;
};

export type IneligibleTrack = {
  artist: string;
  title: string;
  reason: string;
};

export type EligibilityResult =
  | { eligible: true }
  | { eligible: false; reason: string };

export type RankResult = {
  ranked: ScoreBreakdown[];
  skipped: IneligibleTrack[];
};

function isValidVectorValue(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function findInvalidField(source: Record<string, unknown>, fields: readonly string[]): string | null {
  for (const field of fields) {
    if (!isValidVectorValue(source[field])) return field;
  }
  return null;
}

// ── Step 6 genre-first catalog filter: 스코어링 이전 장르 적격성 필터 ──────────────────
// GPT가 선택한 canonical primaryGenres/subgenres(musicGenreTaxonomy.ts 기준)로 카탈로그를
// 좁힌 뒤에만 기존 30차원 스코어링을 실행한다. 이 필터는 점수를 매기지 않는다 — 순수하게
// 포함/제외만 결정하며, genre를 스코어 성분이나 tie-break로 사용하지 않는다
// (SCORE_WEIGHTS/scoreCatalogTrack/compareScoreBreakdown은 이 파일 안에서 전혀 건드리지 않음).
//
// 자격 규칙: selected primaryGenres에 track.primaryGenre가 있거나,
//           selected subgenres에 track.subgenre가 있으면 적격(OR).
// crossoverGenres는 이 규칙에서 사용하지 않는다 — track 고유의 primaryGenre/subgenre만 본다.
export function filterEligibleByGenre<T extends Pick<CatalogTrack, "primaryGenre" | "subgenre">>(
  tracks: readonly T[],
  primaryGenres: readonly PrimaryGenre[],
  subgenres: readonly Subgenre[],
): T[] {
  return tracks.filter(
    (track) => primaryGenres.includes(track.primaryGenre) || subgenres.includes(track.subgenre),
  );
}

// 최종 재생목록 트랙 수 — 단일 source of truth. index.ts(시퀀싱)와 gpt.ts(장르 선택 적정성 검사 +
// 프롬프트 안내) 모두 여기서 import해서 쓴다. 여러 파일에 20을 따로 하드코딩하지 않는다.
export const FINAL_TRACK_COUNT = 20;

export type GenreCoverageResult = {
  eligibleCount: number;
  meetsMinimum: boolean;
};

// GPT가 고른 canonical primaryGenres/subgenres가 최종 FINAL_TRACK_COUNT곡을 채울 만큼 카탈로그에
// 충분한 트랙을 갖고 있는지 확인한다. filterEligibleByGenre와 정확히 같은 OR 규칙을 재사용한다 —
// 별도의 커버리지 판단 로직을 새로 만들지 않는다. 스코어링/시퀀싱보다 먼저(=gpt.ts 응답 검증 단계에서)
// 실행되어, 부적격 장르 선택이 스코어링 단계까지 내려가지 않도록 한다.
export function checkGenreSelectionCoverage<T extends Pick<CatalogTrack, "primaryGenre" | "subgenre">>(
  tracks: readonly T[],
  primaryGenres: readonly PrimaryGenre[],
  subgenres: readonly Subgenre[],
): GenreCoverageResult {
  const eligibleCount = filterEligibleByGenre(tracks, primaryGenres, subgenres).length;
  return { eligibleCount, meetsMinimum: eligibleCount >= FINAL_TRACK_COUNT };
}

// ── Phase 8: 트랙 자격 검사 ────────────────────────────────────────────────
// 잘못된 카탈로그 데이터를 여기서 보정/기본값 대체하지 않는다 — 부적격이면 건너뛰고 이유만 남긴다.
export function checkTrackEligibility(track: CatalogTrack): EligibilityResult {
  if (typeof track.youtubeVideoId !== "string" || track.youtubeVideoId.trim().length === 0) {
    return { eligible: false, reason: "missing youtubeVideoId" };
  }
  if (!track.stats) {
    return { eligible: false, reason: "missing stats" };
  }
  if (!track.affinity) {
    return { eligible: false, reason: "missing affinity" };
  }

  const invalidStatField = findInvalidField(track.stats as unknown as Record<string, unknown>, ALL_STATS_FIELDS);
  if (invalidStatField) {
    return { eligible: false, reason: `invalid stats.${invalidStatField}` };
  }

  const invalidAffinityField = findInvalidField(
    track.affinity as unknown as Record<string, unknown>,
    ALL_AFFINITY_FIELDS,
  );
  if (invalidAffinityField) {
    return { eligible: false, reason: `invalid affinity.${invalidAffinityField}` };
  }

  return { eligible: true };
}

// ── Phase 6: 정확한 유사도 공식 ────────────────────────────────────────────
// meanDistance = sum(abs(sceneValue - trackValue)) / fieldCount
// groupSimilarity = 100 - meanDistance (0-100으로 방어적 clamp)
function groupSimilarity(
  sceneSource: Record<string, number>,
  trackSource: Record<string, number>,
  fields: readonly string[],
): number {
  let distanceSum = 0;
  for (const field of fields) {
    distanceSum += Math.abs(sceneSource[field] - trackSource[field]);
  }
  const meanDistance = distanceSum / fields.length;
  const similarity = 100 - meanDistance;

  // 입력은 이미 checkTrackEligibility/GPT 파서에서 0-100으로 검증되므로 이 clamp는
  // 실전에서는 no-op이어야 한다 — 그럼에도 방어적으로 범위를 강제한다.
  return Math.min(100, Math.max(0, similarity));
}

// track이 이미 checkTrackEligibility를 통과했다는 전제로 순수 점수만 계산한다.
// 중간값을 반올림하지 않는다 — 반환되는 모든 점수는 유한(finite)해야 한다.
export function scoreCatalogTrack(scene: SceneVector, track: CatalogTrack): ScoreBreakdown {
  const sceneStats = scene.targetStats as unknown as Record<string, number>;
  const sceneAffinity = scene.contextAffinity as unknown as Record<string, number>;
  const trackStats = track.stats as unknown as Record<string, number>;
  const trackAffinity = track.affinity as unknown as Record<string, number>;

  const atmosphereScore = groupSimilarity(sceneStats, trackStats, ATMOSPHERE_FIELDS);
  const desiredSoundScore = groupSimilarity(sceneStats, trackStats, DESIRED_SOUND_FIELDS);
  const seasonScore = groupSimilarity(sceneAffinity, trackAffinity, SEASON_FIELDS);
  const timeScore = groupSimilarity(sceneAffinity, trackAffinity, TIME_FIELDS);
  const weatherScore = groupSimilarity(sceneAffinity, trackAffinity, WEATHER_FIELDS);

  const totalScore =
    atmosphereScore * SCORE_WEIGHTS.atmosphere +
    desiredSoundScore * SCORE_WEIGHTS.desiredSound +
    seasonScore * SCORE_WEIGHTS.season +
    timeScore * SCORE_WEIGHTS.time +
    weatherScore * SCORE_WEIGHTS.weather;

  return { track, totalScore, atmosphereScore, desiredSoundScore, seasonScore, timeScore, weatherScore };
}

// ── Phase 7: 결정론적 tie-break 정규화 — locale-sensitive 비교 금지, 순수 문자열 비교만 사용 ──
function normalizeForSort(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

// 1. totalScore desc → 2. atmosphereScore desc → 3. desiredSoundScore desc →
// 4. normalized artist asc → 5. normalized title asc → 6. youtubeVideoId asc
function compareScoreBreakdown(a: ScoreBreakdown, b: ScoreBreakdown): number {
  if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
  if (a.atmosphereScore !== b.atmosphereScore) return b.atmosphereScore - a.atmosphereScore;
  if (a.desiredSoundScore !== b.desiredSoundScore) return b.desiredSoundScore - a.desiredSoundScore;

  const artistA = normalizeForSort(a.track.artist);
  const artistB = normalizeForSort(b.track.artist);
  if (artistA !== artistB) return artistA < artistB ? -1 : 1;

  const titleA = normalizeForSort(a.track.title);
  const titleB = normalizeForSort(b.track.title);
  if (titleA !== titleB) return titleA < titleB ? -1 : 1;

  const idA = a.track.youtubeVideoId ?? "";
  const idB = b.track.youtubeVideoId ?? "";
  if (idA !== idB) return idA < idB ? -1 : 1;

  return 0;
}

// 자격 있는 트랙만 점수를 매기고 결정론적으로 정렬한다. 부적격 트랙은 건너뛰고
// {artist, title, reason}만 skipped에 남긴다 (전체 track 객체는 절대 남기지 않음).
// 입력 tracks 배열/원소를 변형하지 않는다 — 새 배열(ranked)만 만들어 그 위에서 정렬한다.
export function rankCatalogTracks(scene: SceneVector, tracks: readonly CatalogTrack[]): RankResult {
  const ranked: ScoreBreakdown[] = [];
  const skipped: IneligibleTrack[] = [];

  for (const track of tracks) {
    const eligibility = checkTrackEligibility(track);
    if (!eligibility.eligible) {
      skipped.push({ artist: track.artist, title: track.title, reason: eligibility.reason });
      continue;
    }
    ranked.push(scoreCatalogTrack(scene, track));
  }

  ranked.sort(compareScoreBreakdown);

  return { ranked, skipped };
}

// 이미 정렬된 ranked 목록에서 상위 count개의 CatalogTrack만 꺼낸다.
export function selectTopScoredTracks(ranked: readonly ScoreBreakdown[], count: number): CatalogTrack[] {
  return ranked.slice(0, Math.max(0, count)).map((entry) => entry.track);
}
