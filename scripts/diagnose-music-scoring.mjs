// Step 5-B: read-only diagnostic for the production image-to-track scoring system.
//
// This script does NOT reimplement or duplicate the scoring formula. It loads the real
// supabase/functions/analyze-and-search/services/scoring.ts module (same transpile+vm
// technique already used by scripts/verify-music-scoring.mjs) and calls its actual
// exported functions (rankCatalogTracks, scoreCatalogTrack, SCORE_WEIGHTS) against the
// real production catalog (supabase/functions/_shared/musicCatalog.ts), loaded without
// copying track data into fixtures.
//
// This is a diagnostic, not a pass/fail regression test: it exits nonzero only for real
// execution or data-integrity failures (e.g. a scene producing fewer than 16 eligible
// candidates, or a module failing to load). Ordinary findings such as genre concentration,
// artist repetition, or high cross-scene overlap are reported as findings, not failures.
//
// Usage: node scripts/diagnose-music-scoring.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import ts from 'typescript';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCORING_PATH = path.join(ROOT, 'supabase/functions/analyze-and-search/services/scoring.ts');
const CATALOG_PATH = path.join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const DIAGNOSTICS_DIR = path.join(ROOT, 'diagnostics');
const JSON_OUT_PATH = path.join(DIAGNOSTICS_DIR, 'music-scoring-diagnostic.json');
const MD_OUT_PATH = path.join(DIAGNOSTICS_DIR, 'music-scoring-diagnostic.md');

function transpileToSandbox(fullPath) {
  const src = readFileSync(fullPath, 'utf-8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const sandbox = { module: { exports: {} }, exports: {}, require, console };
  sandbox.module.exports = sandbox.exports;
  vm.createContext(sandbox);
  vm.runInContext(out.outputText, sandbox, { filename: fullPath });
  return sandbox.exports;
}

let scoringModule;
let catalogModule;
try {
  scoringModule = transpileToSandbox(SCORING_PATH);
  catalogModule = transpileToSandbox(CATALOG_PATH);
} catch (err) {
  console.error('[diagnose-music-scoring] FATAL: failed to load production modules', err);
  process.exit(1);
}

const { rankCatalogTracks, scoreCatalogTrack, SCORE_WEIGHTS } = scoringModule;
const { MUSIC_CATALOG } = catalogModule;

if (typeof rankCatalogTracks !== 'function' || typeof scoreCatalogTrack !== 'function' || !SCORE_WEIGHTS) {
  console.error('[diagnose-music-scoring] FATAL: scoring.ts did not export the expected functions/constants');
  process.exit(1);
}
if (!Array.isArray(MUSIC_CATALOG) || MUSIC_CATALOG.length === 0) {
  console.error('[diagnose-music-scoring] FATAL: musicCatalog.ts did not export a non-empty MUSIC_CATALOG');
  process.exit(1);
}

const CATALOG_COUNT = MUSIC_CATALOG.length;
const verifiedPool = MUSIC_CATALOG.filter(
  (t) => typeof t.youtubeVideoId === 'string' && t.youtubeVideoId.trim().length > 0,
);

// ── Generic math/util helpers (none of these touch the scoring formula itself) ──────
function round2(x) {
  if (!Number.isFinite(x)) return x;
  return Math.round((x + Number.EPSILON) * 100) / 100;
}
function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function stddevPopulation(arr) {
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((x) => (x - m) ** 2)));
}
function jaccard(setA, setB) {
  const intersectionSize = [...setA].filter((x) => setB.has(x)).length;
  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}
function spearmanFromRanks(ranksA, ranksB) {
  const n = ranksA.length;
  if (n < 2) return null;
  const meanA = mean(ranksA);
  const meanB = mean(ranksB);
  let num = 0;
  let denomA = 0;
  let denomB = 0;
  for (let i = 0; i < n; i += 1) {
    const da = ranksA[i] - meanA;
    const db = ranksB[i] - meanB;
    num += da * db;
    denomA += da * da;
    denomB += db * db;
  }
  if (denomA === 0 || denomB === 0) return null;
  return num / Math.sqrt(denomA * denomB);
}
function normalizeName(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
function countBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}
function topEntries(map, n) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}
function pairSortKey(p) {
  return `${p.sceneA}__${p.sceneB}`;
}

// ── PHASE 4: eight fixed, deterministic scene profiles (all integers 0-100) ──────────
const SCENES = [
  {
    key: 'bright-warm-summer-day',
    label: 'PROFILE 1 — BRIGHT WARM SUMMER DAY',
    concept: 'Bright, warm, open, low-tension, social summer daytime outdoor scene.',
    targetStats: {
      brightness: 90, warmth: 88, openness: 82, motion: 55, intimacy: 20,
      socialEnergy: 68, tension: 12, nostalgia: 25, playfulness: 62, dreaminess: 25,
      energy: 60, groove: 58, density: 50, acousticness: 55, electronicness: 35,
      vocalPresence: 55, climaxIntensity: 40,
    },
    contextAffinity: {
      spring: 30, summer: 92, autumn: 8, winter: 3,
      morning: 25, day: 90, dusk: 10, night: 3, lateNight: 2,
      clear: 90, cloudy: 12, rain: 3, snow: 0,
    },
  },
  {
    key: 'rainy-intimate-late-night',
    label: 'PROFILE 2 — RAINY INTIMATE LATE NIGHT',
    concept: 'Dim, intimate, enclosed, low-motion, rainy late-night interior.',
    targetStats: {
      brightness: 12, warmth: 45, openness: 15, motion: 10, intimacy: 88,
      socialEnergy: 12, tension: 48, nostalgia: 78, playfulness: 15, dreaminess: 80,
      energy: 18, groove: 30, density: 38, acousticness: 55, electronicness: 45,
      vocalPresence: 55, climaxIntensity: 25,
    },
    contextAffinity: {
      spring: 15, summer: 8, autumn: 35, winter: 30,
      morning: 3, day: 5, dusk: 15, night: 85, lateNight: 92,
      clear: 5, cloudy: 82, rain: 90, snow: 8,
    },
  },
  {
    key: 'high-energy-urban-night',
    label: 'PROFILE 3 — HIGH-ENERGY URBAN NIGHT',
    concept: 'Fast, bright-neon, dense, social, electronic city nightlife.',
    targetStats: {
      brightness: 48, warmth: 32, openness: 48, motion: 88, intimacy: 30,
      socialEnergy: 82, tension: 55, nostalgia: 15, playfulness: 50, dreaminess: 20,
      energy: 92, groove: 88, density: 82, acousticness: 12, electronicness: 88,
      vocalPresence: 55, climaxIntensity: 85,
    },
    contextAffinity: {
      spring: 15, summer: 25, autumn: 20, winter: 20,
      morning: 3, day: 8, dusk: 20, night: 90, lateNight: 85,
      clear: 45, cloudy: 45, rain: 12, snow: 5,
    },
  },
  {
    key: 'dreamy-hazy-dusk',
    label: 'PROFILE 4 — DREAMY HAZY DUSK',
    concept: 'Soft, spacious, hazy, ethereal, reflective sunset scene.',
    targetStats: {
      brightness: 48, warmth: 78, openness: 78, motion: 18, intimacy: 52,
      socialEnergy: 20, tension: 15, nostalgia: 80, playfulness: 45, dreaminess: 93,
      energy: 30, groove: 22, density: 25, acousticness: 55, electronicness: 48,
      vocalPresence: 35, climaxIntensity: 45,
    },
    contextAffinity: {
      spring: 30, summer: 45, autumn: 48, winter: 15,
      morning: 10, day: 20, dusk: 92, night: 30, lateNight: 10,
      clear: 48, cloudy: 50, rain: 15, snow: 3,
    },
  },
  {
    key: 'calm-acoustic-morning',
    label: 'PROFILE 5 — CALM ACOUSTIC MORNING',
    concept: 'Quiet, natural, clean, soft morning space.',
    targetStats: {
      brightness: 78, warmth: 78, openness: 62, motion: 12, intimacy: 48,
      socialEnergy: 15, tension: 6, nostalgia: 45, playfulness: 22, dreaminess: 35,
      energy: 20, groove: 18, density: 22, acousticness: 92, electronicness: 8,
      vocalPresence: 50, climaxIntensity: 15,
    },
    contextAffinity: {
      spring: 88, summer: 30, autumn: 30, winter: 10,
      morning: 92, day: 40, dusk: 8, night: 3, lateNight: 0,
      clear: 62, cloudy: 25, rain: 8, snow: 3,
    },
  },
  {
    key: 'cold-open-winter-space',
    label: 'PROFILE 6 — COLD OPEN WINTER SPACE',
    concept: 'Wide, cold, empty, restrained winter landscape or architecture.',
    targetStats: {
      brightness: 48, warmth: 8, openness: 92, motion: 15, intimacy: 12,
      socialEnergy: 6, tension: 48, nostalgia: 48, playfulness: 6, dreaminess: 50,
      energy: 20, groove: 18, density: 22, acousticness: 48, electronicness: 48,
      vocalPresence: 20, climaxIntensity: 30,
    },
    contextAffinity: {
      spring: 8, summer: 3, autumn: 15, winter: 92,
      morning: 25, day: 88, dusk: 20, night: 8, lateNight: 3,
      clear: 40, cloudy: 55, rain: 8, snow: 90,
    },
  },
  {
    key: 'crowded-festival',
    label: 'PROFILE 7 — CROWDED FESTIVAL',
    concept: 'Bright, colorful, moving, communal, celebratory outdoor gathering.',
    targetStats: {
      brightness: 88, warmth: 82, openness: 80, motion: 92, intimacy: 15,
      socialEnergy: 95, tension: 25, nostalgia: 15, playfulness: 92, dreaminess: 15,
      energy: 95, groove: 90, density: 82, acousticness: 30, electronicness: 82,
      vocalPresence: 80, climaxIntensity: 85,
    },
    contextAffinity: {
      spring: 20, summer: 92, autumn: 8, winter: 3,
      morning: 10, day: 88, dusk: 30, night: 15, lateNight: 5,
      clear: 90, cloudy: 12, rain: 3, snow: 0,
    },
  },
  {
    key: 'dark-tense-cinematic-scene',
    label: 'PROFILE 8 — DARK TENSE CINEMATIC SCENE',
    concept: 'Dark, dense, uneasy, dramatic, suspenseful scene.',
    targetStats: {
      brightness: 8, warmth: 22, openness: 40, motion: 48, intimacy: 22,
      socialEnergy: 15, tension: 93, nostalgia: 48, playfulness: 5, dreaminess: 48,
      energy: 68, groove: 35, density: 80, acousticness: 18, electronicness: 78,
      vocalPresence: 35, climaxIntensity: 92,
    },
    contextAffinity: {
      spring: 8, summer: 8, autumn: 25, winter: 25,
      morning: 3, day: 8, dusk: 20, night: 90, lateNight: 55,
      clear: 15, cloudy: 88, rain: 48, snow: 8,
    },
  },
];

// ── PHASE 5/6/7: per-scene ranking, summary metrics, component-influence ─────────────
function processScene(sceneDef) {
  const { key, label, concept, targetStats, contextAffinity } = sceneDef;
  const scene = { targetStats, contextAffinity };
  const { ranked, skipped } = rankCatalogTracks(scene, verifiedPool);
  const top16 = ranked.slice(0, 16);

  if (top16.length !== 16) {
    throw new Error(
      `data-integrity failure: scene "${label}" produced only ${top16.length} eligible top candidates ` +
        `(expected 16); eligibleTotal=${ranked.length}, skipped=${skipped.length}`,
    );
  }

  const rows = top16.map((entry, idx) => ({
    rank: idx + 1,
    artist: entry.track.artist,
    title: entry.track.title,
    youtubeVideoId: entry.track.youtubeVideoId,
    primaryGenre: entry.track.primaryGenre,
    subgenre: entry.track.subgenre,
    totalScore: entry.totalScore,
    atmosphereScore: entry.atmosphereScore,
    desiredSoundScore: entry.desiredSoundScore,
    seasonScore: entry.seasonScore,
    timeScore: entry.timeScore,
    weatherScore: entry.weatherScore,
  }));

  const totalScores = rows.map((r) => r.totalScore);
  const topScore = totalScores[0];
  const rank16Score = totalScores[15];
  const scoreSpread = topScore - rank16Score;
  const meanTop16Score = mean(totalScores);
  const medianTop16Score = median(totalScores);
  const stdDevTop16Score = stddevPopulation(totalScores);

  const meanRank1to10 = mean(totalScores.slice(0, 10));
  const meanRank11to16 = mean(totalScores.slice(10, 16));
  const rankTierGap = meanRank1to10 - meanRank11to16;

  const artistCounts = countBy(rows, (r) => normalizeName(r.artist));
  const artistCountsTop10 = countBy(rows.slice(0, 10), (r) => normalizeName(r.artist));
  const genreCounts = countBy(rows, (r) => r.primaryGenre);
  const subgenreCounts = countBy(rows, (r) => r.subgenre);

  const uniqueArtists = artistCounts.size;
  const uniquePrimaryGenres = genreCounts.size;
  const uniqueSubgenres = subgenreCounts.size;

  const maximumTracksByOneArtist = Math.max(...artistCounts.values());
  const maximumTracksByOneArtistTop10 = Math.max(...artistCountsTop10.values());
  const maximumTracksByOnePrimaryGenre = Math.max(...genreCounts.values());
  const maximumTracksByOneSubgenre = Math.max(...subgenreCounts.values());

  const artistRepetitions = [...artistCounts.entries()]
    .filter(([, c]) => c > 1)
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count || a.artist.localeCompare(b.artist));

  const artistRepetitionDetail = artistRepetitions.map(({ artist, count }) => {
    const matchingRows = rows.filter((r) => normalizeName(r.artist) === artist);
    const ranks = matchingRows.map((r) => r.rank).sort((a, b) => a - b);
    let adjacent = true;
    for (let i = 1; i < ranks.length; i += 1) {
      if (ranks[i] - ranks[i - 1] !== 1) adjacent = false;
    }
    const scores = matchingRows.map((r) => r.totalScore);
    const scoreGap = Math.max(...scores) - Math.min(...scores);
    return { artist, count, ranks, adjacent, scoreGap };
  });

  const meanAtmosphere = mean(rows.map((r) => r.atmosphereScore));
  const meanDesiredSound = mean(rows.map((r) => r.desiredSoundScore));
  const meanSeason = mean(rows.map((r) => r.seasonScore));
  const meanTime = mean(rows.map((r) => r.timeScore));
  const meanWeather = mean(rows.map((r) => r.weatherScore));

  const componentInfluence = {
    meanAtmosphereScore: meanAtmosphere,
    meanDesiredSoundScore: meanDesiredSound,
    meanSeasonScore: meanSeason,
    meanTimeScore: meanTime,
    meanWeatherScore: meanWeather,
    atmosphereContribution: meanAtmosphere * SCORE_WEIGHTS.atmosphere,
    desiredSoundContribution: meanDesiredSound * SCORE_WEIGHTS.desiredSound,
    seasonContribution: meanSeason * SCORE_WEIGHTS.season,
    timeContribution: meanTime * SCORE_WEIGHTS.time,
    weatherContribution: meanWeather * SCORE_WEIGHTS.weather,
  };

  // Track-vector redundancy (Phase 13 Q15 support): pairwise similarity BETWEEN the 16
  // selected tracks themselves (not scene-to-track). Reuses the real production
  // scoreCatalogTrack() by treating one track's own {stats, affinity} as a SceneVector —
  // this is the actual production formula applied track-vs-track, not a reimplementation.
  const pairwiseTrackSimilarities = [];
  for (let i = 0; i < top16.length; i += 1) {
    for (let j = i + 1; j < top16.length; j += 1) {
      const trackAsScene = {
        targetStats: top16[i].track.stats,
        contextAffinity: top16[i].track.affinity,
      };
      const result = scoreCatalogTrack(trackAsScene, top16[j].track);
      pairwiseTrackSimilarities.push(result.totalScore);
    }
  }
  const meanPairwiseTrackVectorSimilarity = mean(pairwiseTrackSimilarities);

  return {
    key,
    label,
    concept,
    scene,
    rows,
    skippedCount: skipped.length,
    eligibleCount: ranked.length,
    summary: {
      topScore,
      rank16Score,
      scoreSpread,
      meanTop16Score,
      medianTop16Score,
      stdDevTop16Score,
      meanRank1to10,
      meanRank11to16,
      rankTierGap,
      uniqueArtists,
      uniquePrimaryGenres,
      uniqueSubgenres,
      maximumTracksByOneArtist,
      maximumTracksByOneArtistTop10,
      maximumTracksByOnePrimaryGenre,
      maximumTracksByOneSubgenre,
      primaryGenreDistribution: topEntries(genreCounts, genreCounts.size),
      subgenreDistribution: topEntries(subgenreCounts, subgenreCounts.size),
      artistRepetitions,
      artistRepetitionDetail,
    },
    componentInfluence,
    vectorRedundancy: { meanPairwiseTrackVectorSimilarity },
  };
}

let sceneResults;
try {
  sceneResults = SCENES.map(processScene);
} catch (err) {
  console.error('[diagnose-music-scoring] FATAL:', err.message);
  process.exit(1);
}

// ── PHASE 8: cross-scene pairwise overlap analysis ───────────────────────────────────
const pairwise = [];
for (let i = 0; i < sceneResults.length; i += 1) {
  for (let j = i + 1; j < sceneResults.length; j += 1) {
    const A = sceneResults[i];
    const B = sceneResults[j];
    const idsTop16A = new Set(A.rows.map((r) => r.youtubeVideoId));
    const idsTop16B = new Set(B.rows.map((r) => r.youtubeVideoId));
    const idsTop10A = new Set(A.rows.slice(0, 10).map((r) => r.youtubeVideoId));
    const idsTop10B = new Set(B.rows.slice(0, 10).map((r) => r.youtubeVideoId));

    const top16OverlapCount = [...idsTop16A].filter((id) => idsTop16B.has(id)).length;
    const top10OverlapCount = [...idsTop10A].filter((id) => idsTop10B.has(id)).length;

    pairwise.push({
      sceneA: A.key,
      sceneB: B.key,
      top16OverlapCount,
      top16Jaccard: jaccard(idsTop16A, idsTop16B),
      top10OverlapCount,
      top10Jaccard: jaccard(idsTop10A, idsTop10B),
      sameNumberOne: A.rows[0].youtubeVideoId === B.rows[0].youtubeVideoId,
    });
  }
}

function buildMatrix(metric, selfValue) {
  const keys = sceneResults.map((s) => s.key);
  const matrix = {};
  for (const k of keys) {
    matrix[k] = {};
    matrix[k][k] = selfValue;
  }
  for (const p of pairwise) {
    matrix[p.sceneA][p.sceneB] = p[metric];
    matrix[p.sceneB][p.sceneA] = p[metric];
  }
  return matrix;
}

const top16OverlapMatrix = buildMatrix('top16OverlapCount', 16);
const top16JaccardMatrix = buildMatrix('top16Jaccard', 1);
const top10OverlapMatrix = buildMatrix('top10OverlapCount', 10);

const sortedByOverlapDesc = [...pairwise].sort(
  (a, b) => b.top16OverlapCount - a.top16OverlapCount || pairSortKey(a).localeCompare(pairSortKey(b)),
);
const highestOverlapPairs = sortedByOverlapDesc.slice(0, 5);
const sortedByOverlapAsc = [...pairwise].sort(
  (a, b) => a.top16OverlapCount - b.top16OverlapCount || pairSortKey(a).localeCompare(pairSortKey(b)),
);
const lowestOverlapPairs = sortedByOverlapAsc.slice(0, 5);

function findPair(keyA, keyB) {
  return pairwise.find(
    (p) => (p.sceneA === keyA && p.sceneB === keyB) || (p.sceneA === keyB && p.sceneB === keyA),
  );
}
const namedOppositePairs = [
  { name: 'bright warm summer day vs dark tense cinematic scene', pair: findPair('bright-warm-summer-day', 'dark-tense-cinematic-scene') },
  { name: 'calm acoustic morning vs high-energy urban night', pair: findPair('calm-acoustic-morning', 'high-energy-urban-night') },
  { name: 'crowded festival vs rainy intimate late night', pair: findPair('crowded-festival', 'rainy-intimate-late-night') },
  { name: 'cold open winter space vs bright warm summer day', pair: findPair('cold-open-winter-space', 'bright-warm-summer-day') },
];

// ── PHASE 9: global catalog dominance analysis ───────────────────────────────────────
const trackAppearanceMap = new Map();
for (const s of sceneResults) {
  for (const row of s.rows) {
    if (!trackAppearanceMap.has(row.youtubeVideoId)) {
      trackAppearanceMap.set(row.youtubeVideoId, {
        artist: row.artist,
        title: row.title,
        youtubeVideoId: row.youtubeVideoId,
        appearances: [],
      });
    }
    trackAppearanceMap.get(row.youtubeVideoId).appearances.push({
      scene: s.key,
      rank: row.rank,
      totalScore: row.totalScore,
    });
  }
}
const trackRecurrence = [...trackAppearanceMap.values()]
  .map((t) => ({
    artist: t.artist,
    title: t.title,
    youtubeVideoId: t.youtubeVideoId,
    sceneCount: t.appearances.length,
    scenes: t.appearances.map((a) => a.scene),
    averageRank: mean(t.appearances.map((a) => a.rank)),
    averageTotalScore: mean(t.appearances.map((a) => a.totalScore)),
  }))
  .sort((a, b) => b.sceneCount - a.sceneCount || b.averageTotalScore - a.averageTotalScore || a.artist.localeCompare(b.artist));

const tracksInMoreThanOneScene = trackRecurrence.filter((t) => t.sceneCount > 1).length;
const tracksInAtLeastFourScenes = trackRecurrence.filter((t) => t.sceneCount >= 4).length;
const tracksInAllEightScenes = trackRecurrence.filter((t) => t.sceneCount === 8).length;
const top20RecurringTracks = trackRecurrence.slice(0, 20);

const artistAppearanceMap = new Map();
for (const s of sceneResults) {
  const artistsInThisScene = new Set(s.rows.map((r) => normalizeName(r.artist)));
  for (const a of artistsInThisScene) {
    if (!artistAppearanceMap.has(a)) artistAppearanceMap.set(a, { artist: a, scenes: [] });
    artistAppearanceMap.get(a).scenes.push(s.key);
  }
}
const artistRecurrence = [...artistAppearanceMap.values()]
  .map((a) => ({ artist: a.artist, sceneCount: a.scenes.length, scenes: a.scenes }))
  .sort((a, b) => b.sceneCount - a.sceneCount || a.artist.localeCompare(b.artist));
const artistsInMultipleScenes = artistRecurrence.filter((a) => a.sceneCount > 1).length;
const top15RecurringArtists = artistRecurrence.slice(0, 15);

const genrePresenceByScene = sceneResults.map((s) => new Set(s.rows.map((r) => r.primaryGenre)));
const allGenresSeen = new Set(sceneResults.flatMap((s) => s.rows.map((r) => r.primaryGenre)));
const genresInAllScenes = [...allGenresSeen].filter((g) => genrePresenceByScene.every((set) => set.has(g))).sort();
const genrePresenceCounts = [...allGenresSeen]
  .map((g) => ({ primaryGenre: g, sceneCount: genrePresenceByScene.filter((set) => set.has(g)).length }))
  .sort((a, b) => b.sceneCount - a.sceneCount || a.primaryGenre.localeCompare(b.primaryGenre));

const subgenrePresenceByScene = sceneResults.map((s) => new Set(s.rows.map((r) => r.subgenre)));
const allSubgenresSeen = new Set(sceneResults.flatMap((s) => s.rows.map((r) => r.subgenre)));
const subgenresInAllScenes = [...allSubgenresSeen].filter((g) => subgenrePresenceByScene.every((set) => set.has(g))).sort();
const subgenrePresenceCounts = [...allSubgenresSeen]
  .map((g) => ({ subgenre: g, sceneCount: subgenrePresenceByScene.filter((set) => set.has(g)).length }))
  .sort((a, b) => b.sceneCount - a.sceneCount || a.subgenre.localeCompare(b.subgenre));
const top20RecurringSubgenres = subgenrePresenceCounts.slice(0, 20);

// ── PHASE 10: genre concentration analysis ───────────────────────────────────────────
const perScenePrimaryGenreShare = sceneResults.map((s) => ({
  scene: s.key,
  shareOfMostCommonPrimaryGenre: s.summary.maximumTracksByOnePrimaryGenre / 16,
  shareOfMostCommonSubgenre: s.summary.maximumTracksByOneSubgenre / 16,
  primaryGenresRepresented: s.summary.uniquePrimaryGenres,
  subgenresRepresented: s.summary.uniqueSubgenres,
}));

const rank1Genres = sceneResults.map((s) => s.rows[0].primaryGenre);
const rank1GenreCounts = countBy(rank1Genres, (g) => g);
const mostFrequentRank1PrimaryGenre = topEntries(rank1GenreCounts, 1)[0] || null;

const totalGenreSlotCounts = countBy(sceneResults.flatMap((s) => s.rows.map((r) => r.primaryGenre)), (g) => g);
const mostTotalSlotsPrimaryGenre = topEntries(totalGenreSlotCounts, 1)[0] || null;
const totalSubgenreSlotCounts = countBy(sceneResults.flatMap((s) => s.rows.map((r) => r.subgenre)), (g) => g);
const mostTotalSlotsSubgenre = topEntries(totalSubgenreSlotCounts, 1)[0] || null;

const perSceneDominantGenre = sceneResults.map((s) => ({
  scene: s.key,
  genre: s.summary.primaryGenreDistribution[0][0],
  count: s.summary.primaryGenreDistribution[0][1],
}));
const dominantGenreSceneCounts = countBy(perSceneDominantGenre, (d) => d.genre);
const topDominantGenreEntry = topEntries(dominantGenreSceneCounts, 1)[0];
const [topDominantGenre, topDominantGenreSceneCount] = topDominantGenreEntry;
const scenesDominatedByTopGenre = perSceneDominantGenre.filter((d) => d.genre === topDominantGenre).map((d) => d.scene);

function classifyConcentration(dominantSceneCount) {
  if (dominantSceneCount >= 5) return 'cross-scene recurring concentration';
  if (dominantSceneCount >= 2) return 'scene-specific concentration';
  return 'no obvious concentration';
}
const primaryGenreConcentrationClassification = classifyConcentration(topDominantGenreSceneCount);

const perSceneDominantSubgenre = sceneResults.map((s) => ({
  scene: s.key,
  subgenre: s.summary.subgenreDistribution[0][0],
  count: s.summary.subgenreDistribution[0][1],
}));
const dominantSubgenreSceneCounts = countBy(perSceneDominantSubgenre, (d) => d.subgenre);
const topDominantSubgenreEntry = topEntries(dominantSubgenreSceneCounts, 1)[0];
const [topDominantSubgenre, topDominantSubgenreSceneCount] = topDominantSubgenreEntry;
const scenesDominatedByTopSubgenre = perSceneDominantSubgenre.filter((d) => d.subgenre === topDominantSubgenre).map((d) => d.scene);
const subgenreConcentrationClassification = classifyConcentration(topDominantSubgenreSceneCount);

// ── PHASE 11: artist repetition analysis ─────────────────────────────────────────────
const maxArtistCountAnyTop16 = Math.max(...sceneResults.map((s) => s.summary.maximumTracksByOneArtist));
const maxArtistCountAnyTop10 = Math.max(...sceneResults.map((s) => s.summary.maximumTracksByOneArtistTop10));
const scenesWithArtistRepeatIn16 = sceneResults.filter((s) => s.summary.maximumTracksByOneArtist >= 2).length;
const maxArtistSceneRecurrence = artistRecurrence.length > 0 ? artistRecurrence[0].sceneCount : 0;
const artistsWithCrossSceneRecurrenceAtLeast4 = artistRecurrence.filter((a) => a.sceneCount >= 4);

function classifyArtistRepetition() {
  if (maxArtistSceneRecurrence >= 4) return 'cross-scene artist dominance';
  if (maxArtistCountAnyTop16 <= 1) return 'none';
  if (maxArtistCountAnyTop16 === 2 && scenesWithArtistRepeatIn16 <= 2) return 'occasional and scene-plausible';
  return 'frequent within individual scenes';
}
const artistRepetitionClassification = classifyArtistRepetition();

// ── PHASE 12: sensitivity checks ──────────────────────────────────────────────────────
function runSensitivityPair(name, sceneA, sceneB) {
  const { ranked: rankedA } = rankCatalogTracks(sceneA, verifiedPool);
  const { ranked: rankedB } = rankCatalogTracks(sceneB, verifiedPool);
  const top16A = rankedA.slice(0, 16);
  const top16B = rankedB.slice(0, 16);
  const top10A = rankedA.slice(0, 10);
  const top10B = rankedB.slice(0, 10);

  const idsTop16A = new Set(top16A.map((r) => r.track.youtubeVideoId));
  const idsTop16B = new Set(top16B.map((r) => r.track.youtubeVideoId));
  const idsTop10A = new Set(top10A.map((r) => r.track.youtubeVideoId));
  const idsTop10B = new Set(top10B.map((r) => r.track.youtubeVideoId));

  const top16OverlapCount = [...idsTop16A].filter((id) => idsTop16B.has(id)).length;
  const top10OverlapCount = [...idsTop10A].filter((id) => idsTop10B.has(id)).length;

  const rankMapA = new Map(rankedA.map((r, i) => [r.track.youtubeVideoId, i + 1]));
  const rankMapB = new Map(rankedB.map((r, i) => [r.track.youtubeVideoId, i + 1]));
  const scoreMapA = new Map(rankedA.map((r) => [r.track.youtubeVideoId, r.totalScore]));
  const scoreMapB = new Map(rankedB.map((r) => [r.track.youtubeVideoId, r.totalScore]));
  const trackById = new Map(rankedA.map((r) => [r.track.youtubeVideoId, r.track]));

  const unionIds = [...new Set([...idsTop16A, ...idsTop16B])];
  const withBothRanks = unionIds
    .map((id) => ({ id, rankA: rankMapA.get(id), rankB: rankMapB.get(id) }))
    .filter((p) => p.rankA !== undefined && p.rankB !== undefined);
  const rankOrderCorrelation = spearmanFromRanks(withBothRanks.map((p) => p.rankA), withBothRanks.map((p) => p.rankB));

  const scoreChanges = unionIds.map((id) => {
    const scoreA = scoreMapA.get(id);
    const scoreB = scoreMapB.get(id);
    const track = trackById.get(id);
    return { youtubeVideoId: id, artist: track.artist, title: track.title, scoreA, scoreB, delta: scoreB - scoreA };
  });
  const meanScoreChange = mean(scoreChanges.map((c) => c.delta));
  const upMovers = [...scoreChanges].sort((a, b) => b.delta - a.delta).slice(0, 10);
  const downMovers = [...scoreChanges].sort((a, b) => a.delta - b.delta).slice(0, 10);

  return {
    name,
    top16OverlapCount,
    top10OverlapCount,
    sharedTrackSetSize: unionIds.length,
    rankOrderCorrelation,
    meanScoreChange,
    upMovers,
    downMovers,
  };
}

const NEUTRAL_STATS = {
  brightness: 50, warmth: 50, openness: 50, motion: 50, intimacy: 50,
  socialEnergy: 50, tension: 50, nostalgia: 50, playfulness: 50, dreaminess: 50,
  energy: 50, groove: 50, density: 50, acousticness: 50, electronicness: 50,
  vocalPresence: 50, climaxIntensity: 50,
};
const NEUTRAL_AFFINITY = {
  spring: 30, summer: 30, autumn: 30, winter: 30,
  morning: 20, day: 50, dusk: 20, night: 20, lateNight: 10,
  clear: 50, cloudy: 30, rain: 10, snow: 10,
};

const sensitivityChecks = [
  runSensitivityPair(
    'A: same targetStats, summer vs winter affinity',
    { targetStats: NEUTRAL_STATS, contextAffinity: { ...NEUTRAL_AFFINITY, spring: 30, summer: 90, autumn: 30, winter: 5 } },
    { targetStats: NEUTRAL_STATS, contextAffinity: { ...NEUTRAL_AFFINITY, spring: 30, summer: 5, autumn: 30, winter: 90 } },
  ),
  runSensitivityPair(
    'B: same targetStats, morning vs lateNight affinity',
    { targetStats: NEUTRAL_STATS, contextAffinity: { ...NEUTRAL_AFFINITY, morning: 90, day: 20, dusk: 10, night: 5, lateNight: 5 } },
    { targetStats: NEUTRAL_STATS, contextAffinity: { ...NEUTRAL_AFFINITY, morning: 5, day: 5, dusk: 10, night: 20, lateNight: 90 } },
  ),
  runSensitivityPair(
    'C: same targetStats, clear vs rain affinity',
    { targetStats: NEUTRAL_STATS, contextAffinity: { ...NEUTRAL_AFFINITY, clear: 90, cloudy: 20, rain: 5, snow: 5 } },
    { targetStats: NEUTRAL_STATS, contextAffinity: { ...NEUTRAL_AFFINITY, clear: 5, cloudy: 40, rain: 90, snow: 5 } },
  ),
  runSensitivityPair(
    'D: same contextAffinity, low vs high energy targetStats',
    { targetStats: { ...NEUTRAL_STATS, energy: 15 }, contextAffinity: NEUTRAL_AFFINITY },
    { targetStats: { ...NEUTRAL_STATS, energy: 90 }, contextAffinity: NEUTRAL_AFFINITY },
  ),
  runSensitivityPair(
    'E: same contextAffinity, low-acoustic/high-electronic vs high-acoustic/low-electronic targetStats',
    { targetStats: { ...NEUTRAL_STATS, acousticness: 15, electronicness: 90 }, contextAffinity: NEUTRAL_AFFINITY },
    { targetStats: { ...NEUTRAL_STATS, acousticness: 90, electronicness: 15 }, contextAffinity: NEUTRAL_AFFINITY },
  ),
];

// ── PHASE 13: summary classification ─────────────────────────────────────────────────
const allTop16Jaccards = pairwise.map((p) => p.top16Jaccard);
const meanTop16Jaccard = mean(allTop16Jaccards);
const minTop16Jaccard = Math.min(...allTop16Jaccards);
const maxTop16Jaccard = Math.max(...allTop16Jaccards);

const meanScoreSpread = mean(sceneResults.map((s) => s.summary.scoreSpread));
const meanRankTierGap = mean(sceneResults.map((s) => s.summary.rankTierGap));
const meanVectorRedundancy = mean(sceneResults.map((s) => s.vectorRedundancy.meanPairwiseTrackVectorSimilarity));

function capEvidenceLabel(strong) {
  return strong ? 'POSSIBLY USEFUL, NEEDS REAL-PHOTO VALIDATION' : 'NOT SUPPORTED BY CURRENT EVIDENCE';
}

const summaryClassification = {
  q1_differentScenesDifferentRankings: {
    answer:
      `Mean pairwise top16 Jaccard across all 28 scene pairs = ${round2(meanTop16Jaccard)} ` +
      `(range ${round2(minTop16Jaccard)}-${round2(maxTop16Jaccard)}). ` +
      `${meanTop16Jaccard < 0.5 ? 'Rankings differ substantially across scenes.' : 'Rankings show considerable overlap across scenes.'}`,
    meanTop16Jaccard,
    minTop16Jaccard,
    maxTop16Jaccard,
  },
  q2_oppositeScenesShareTooManyTracks: {
    answer: 'Overlap counts for the four requested opposite pairs (see namedOppositePairs) are reported without an imposed pass/fail threshold, per instructions.',
    namedOppositePairs: namedOppositePairs.map((p) => ({ name: p.name, top16OverlapCount: p.pair.top16OverlapCount, top16Jaccard: round2(p.pair.top16Jaccard) })),
  },
  q3_oneTrackDominatesManyScenes: {
    answer: `${tracksInAllEightScenes} track(s) appear in all 8 scenes; ${tracksInAtLeastFourScenes} track(s) appear in at least 4 of 8 scenes; ${tracksInMoreThanOneScene} track(s) appear in more than 1 scene.`,
    tracksInAllEightScenes,
    tracksInAtLeastFourScenes,
    tracksInMoreThanOneScene,
  },
  q4_oneArtistDominatesManyScenes: {
    answer: `Maximum scene-recurrence for a single artist across the 8 scene top-16 sets = ${maxArtistSceneRecurrence} of 8 scenes (${artistsWithCrossSceneRecurrenceAtLeast4.length} artist(s) recur in >=4 scenes).`,
    maxArtistSceneRecurrence,
    artistsWithCrossSceneRecurrenceAtLeast4Count: artistsWithCrossSceneRecurrenceAtLeast4.length,
  },
  q5_onePrimaryGenreDominatesMostScenes: {
    answer: `"${topDominantGenre}" is the per-scene modal primaryGenre in ${topDominantGenreSceneCount} of 8 scenes (${scenesDominatedByTopGenre.join(', ')}) -> classified as "${primaryGenreConcentrationClassification}".`,
    topDominantGenre,
    topDominantGenreSceneCount,
    scenesDominatedByTopGenre,
    classification: primaryGenreConcentrationClassification,
  },
  q6_oneSubgenreDominatesMostScenes: {
    answer: `"${topDominantSubgenre}" is the per-scene modal subgenre in ${topDominantSubgenreSceneCount} of 8 scenes (${scenesDominatedByTopSubgenre.join(', ')}) -> classified as "${subgenreConcentrationClassification}".`,
    topDominantSubgenre,
    topDominantSubgenreSceneCount,
    scenesDominatedByTopSubgenre,
    classification: subgenreConcentrationClassification,
  },
  q7_seasonMateriallyAffectsRanking: summarizeSensitivity(sensitivityChecks[0]),
  q8_timeMateriallyAffectsRanking: summarizeSensitivity(sensitivityChecks[1]),
  q9_weatherMateriallyAffectsRanking: summarizeSensitivity(sensitivityChecks[2]),
  q10_desiredSoundMateriallyAffectsRanking: {
    answer: `Energy check (D): ${sensitivityChecks[3].top16OverlapCount}/16 overlap, mean score change ${round2(sensitivityChecks[3].meanScoreChange)}. Acoustic/electronic check (E): ${sensitivityChecks[4].top16OverlapCount}/16 overlap, mean score change ${round2(sensitivityChecks[4].meanScoreChange)}.`,
    checkD: summarizeSensitivity(sensitivityChecks[3]),
    checkE: summarizeSensitivity(sensitivityChecks[4]),
  },
  q11_scoreSpreadWideEnough: {
    answer: `Mean top16 scoreSpread (topScore - rank16Score) across the 8 scenes = ${round2(meanScoreSpread)} points.`,
    meanScoreSpread,
    perScene: sceneResults.map((s) => ({ scene: s.key, scoreSpread: round2(s.summary.scoreSpread) })),
  },
  q12_ranks11to16WeakerThan1to10: {
    answer: `Mean (rank1-10 avg minus rank11-16 avg) totalScore gap across the 8 scenes = ${round2(meanRankTierGap)} points.`,
    meanRankTierGap,
    perScene: sceneResults.map((s) => ({ scene: s.key, rankTierGap: round2(s.summary.rankTierGap) })),
  },
  q13_hardGenreCapEvidence: {
    answer: capEvidenceLabel(primaryGenreConcentrationClassification === 'cross-scene recurring concentration'),
    supportingClassification: primaryGenreConcentrationClassification,
    supportingCounts: { topDominantGenre, topDominantGenreSceneCount, scenesDominatedByTopGenre },
  },
  q14_hardArtistCapEvidence: {
    answer: capEvidenceLabel(artistRepetitionClassification === 'cross-scene artist dominance'),
    supportingClassification: artistRepetitionClassification,
    supportingCounts: { maxArtistSceneRecurrence, maxArtistCountAnyTop16, maxArtistCountAnyTop10 },
  },
  q15_vectorSimilarityRedundancyEvidence: {
    answer:
      `Genre-label overlap and actual 30-dim track-vector similarity are measured separately. ` +
      `Mean pairwise track-to-track vector similarity within top-16 sets (production scoreCatalogTrack formula, applied track-vs-track) averages ${round2(meanVectorRedundancy)}/100 across the 8 scenes. ` +
      `This is independent of whether tracks share a genre label — see vectorRedundancy per scene for detail.`,
    meanVectorRedundancy,
    perScene: sceneResults.map((s) => ({ scene: s.key, meanPairwiseTrackVectorSimilarity: round2(s.vectorRedundancy.meanPairwiseTrackVectorSimilarity) })),
    note: 'genre label identity is NOT used as a proxy for this metric; it is computed purely from stats/affinity vectors via the real scoring formula.',
  },
  q16_weightsOrStatsCalibrationEvidence: {
    answer:
      `Component means vary across scenes (see perSceneResults[].componentInfluence), and total-score spreads/tier-gaps are nonzero and vary by scene concept — ` +
      `this diagnostic alone does not establish a calibration defect; it only documents the current distribution for future comparison.`,
  },
};

function summarizeSensitivity(check) {
  return {
    answer: `${check.name}: top16 overlap ${check.top16OverlapCount}/16, top10 overlap ${check.top10OverlapCount}/10, rank-order correlation ${check.rankOrderCorrelation === null ? 'n/a' : round2(check.rankOrderCorrelation)}, mean score change ${round2(check.meanScoreChange)}.`,
    top16OverlapCount: check.top16OverlapCount,
    top10OverlapCount: check.top10OverlapCount,
    rankOrderCorrelation: check.rankOrderCorrelation,
    meanScoreChange: check.meanScoreChange,
  };
}

// ── Console output ────────────────────────────────────────────────────────────────────
console.log('='.repeat(88));
console.log('VibeScene Music Engine Step 5-B — Scoring Diagnostic (read-only)');
console.log(`Catalog count: ${CATALOG_COUNT} | Verified pool: ${verifiedPool.length} | Weights: ${JSON.stringify(SCORE_WEIGHTS)}`);
console.log('='.repeat(88));

for (const s of sceneResults) {
  console.log(`\n${'-'.repeat(88)}\nSCENE: ${s.label}\nConcept: ${s.concept}`);
  console.log(
    `targetStats: ${Object.entries(s.scene.targetStats).map(([k, v]) => `${k}=${v}`).join(' ')}`,
  );
  console.log(
    `contextAffinity: ${Object.entries(s.scene.contextAffinity).map(([k, v]) => `${k}=${v}`).join(' ')}`,
  );
  console.log('rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather');
  for (const r of s.rows) {
    console.log(
      `${String(r.rank).padStart(2)} | ${r.artist} | ${r.title} | ${r.youtubeVideoId} | ${r.primaryGenre} | ${r.subgenre} | ` +
        `${round2(r.totalScore)} | ${round2(r.atmosphereScore)} | ${round2(r.desiredSoundScore)} | ${round2(r.seasonScore)} | ${round2(r.timeScore)} | ${round2(r.weatherScore)}`,
    );
  }
  console.log(
    `Summary: topScore=${round2(s.summary.topScore)} rank16Score=${round2(s.summary.rank16Score)} scoreSpread=${round2(s.summary.scoreSpread)} ` +
      `meanTop16=${round2(s.summary.meanTop16Score)} medianTop16=${round2(s.summary.medianTop16Score)} stdDevTop16=${round2(s.summary.stdDevTop16Score)}`,
  );
  console.log(
    `Distinctness: uniqueArtists=${s.summary.uniqueArtists} uniquePrimaryGenres=${s.summary.uniquePrimaryGenres} uniqueSubgenres=${s.summary.uniqueSubgenres} ` +
      `maxByArtist=${s.summary.maximumTracksByOneArtist} maxByGenre=${s.summary.maximumTracksByOnePrimaryGenre} maxBySubgenre=${s.summary.maximumTracksByOneSubgenre}`,
  );
  console.log(`primaryGenre distribution: ${s.summary.primaryGenreDistribution.map(([g, c]) => `${g}:${c}`).join(', ')}`);
  console.log(`subgenre distribution: ${s.summary.subgenreDistribution.map(([g, c]) => `${g}:${c}`).join(', ')}`);
  console.log(
    `artist repetitions (>1): ${s.summary.artistRepetitions.length === 0 ? 'none' : s.summary.artistRepetitions.map((a) => `${a.artist}:${a.count}`).join(', ')}`,
  );
  console.log(
    `component means: atmosphere=${round2(s.componentInfluence.meanAtmosphereScore)} desiredSound=${round2(s.componentInfluence.meanDesiredSoundScore)} ` +
      `season=${round2(s.componentInfluence.meanSeasonScore)} time=${round2(s.componentInfluence.meanTimeScore)} weather=${round2(s.componentInfluence.meanWeatherScore)}`,
  );
  console.log(
    `weighted contributions: atmosphere=${round2(s.componentInfluence.atmosphereContribution)} desiredSound=${round2(s.componentInfluence.desiredSoundContribution)} ` +
      `season=${round2(s.componentInfluence.seasonContribution)} time=${round2(s.componentInfluence.timeContribution)} weather=${round2(s.componentInfluence.weatherContribution)}`,
  );
}

console.log(`\n${'='.repeat(88)}\nCROSS-SCENE OVERLAP MATRICES\n${'='.repeat(88)}`);
const sceneKeys = sceneResults.map((s) => s.key);
function printMatrix(title, matrix) {
  console.log(`\n${title}`);
  console.log(`${''.padEnd(28)} ${sceneKeys.map((k) => k.slice(0, 8).padStart(9)).join('')}`);
  for (const rowKey of sceneKeys) {
    const cells = sceneKeys.map((colKey) => String(round2(matrix[rowKey][colKey])).padStart(9));
    console.log(`${rowKey.padEnd(28)} ${cells.join('')}`);
  }
}
printMatrix('top16 overlap count', top16OverlapMatrix);
printMatrix('top16 Jaccard similarity', top16JaccardMatrix);
printMatrix('top10 overlap count', top10OverlapMatrix);

console.log('\nHighest top16-overlap pairs:');
for (const p of highestOverlapPairs) console.log(`  ${p.sceneA} <-> ${p.sceneB}: overlap=${p.top16OverlapCount} jaccard=${round2(p.top16Jaccard)} sameNumberOne=${p.sameNumberOne}`);
console.log('Lowest top16-overlap pairs:');
for (const p of lowestOverlapPairs) console.log(`  ${p.sceneA} <-> ${p.sceneB}: overlap=${p.top16OverlapCount} jaccard=${round2(p.top16Jaccard)} sameNumberOne=${p.sameNumberOne}`);
console.log('Named opposite-scene pairs:');
for (const p of namedOppositePairs) console.log(`  ${p.name}: overlap16=${p.pair.top16OverlapCount} jaccard16=${round2(p.pair.top16Jaccard)} overlap10=${p.pair.top10OverlapCount}`);

console.log(`\n${'='.repeat(88)}\nGLOBAL DOMINANCE\n${'='.repeat(88)}`);
console.log(`Tracks in >1 scene: ${tracksInMoreThanOneScene} | in >=4 scenes: ${tracksInAtLeastFourScenes} | in all 8 scenes: ${tracksInAllEightScenes}`);
console.log('Top 20 recurring tracks:');
for (const t of top20RecurringTracks) console.log(`  ${t.artist} - ${t.title} (${t.youtubeVideoId}): scenes=${t.sceneCount} [${t.scenes.join(',')}] avgRank=${round2(t.averageRank)} avgScore=${round2(t.averageTotalScore)}`);
console.log(`Artists in multiple scenes: ${artistsInMultipleScenes}`);
console.log('Top 15 recurring artists:');
for (const a of top15RecurringArtists) console.log(`  ${a.artist}: scenes=${a.sceneCount} [${a.scenes.join(',')}]`);
console.log(`primaryGenres present across all 8 scenes: ${genresInAllScenes.join(', ') || 'none'}`);
console.log(`subgenres present across all 8 scenes: ${subgenresInAllScenes.join(', ') || 'none'}`);
console.log('primaryGenre scene-presence counts:', genrePresenceCounts.map((g) => `${g.primaryGenre}:${g.sceneCount}`).join(', '));
console.log('Top 20 subgenre scene-presence counts:', top20RecurringSubgenres.map((g) => `${g.subgenre}:${g.sceneCount}`).join(', '));

console.log(`\n${'='.repeat(88)}\nGENRE CONCENTRATION\n${'='.repeat(88)}`);
console.log('Per-scene primaryGenre share:', perScenePrimaryGenreShare.map((s) => `${s.scene}=${round2(s.shareOfMostCommonPrimaryGenre)}`).join(', '));
console.log(`Most frequent rank-1 primaryGenre: ${mostFrequentRank1PrimaryGenre[0]} (${mostFrequentRank1PrimaryGenre[1]}/8 scenes)`);
console.log(`Most total top-16 slots by primaryGenre: ${mostTotalSlotsPrimaryGenre[0]} (${mostTotalSlotsPrimaryGenre[1]}/128 slots)`);
console.log(`Most total top-16 slots by subgenre: ${mostTotalSlotsSubgenre[0]} (${mostTotalSlotsSubgenre[1]}/128 slots)`);
console.log(`PrimaryGenre concentration classification: ${primaryGenreConcentrationClassification} (dominant in ${topDominantGenreSceneCount}/8 scenes: ${scenesDominatedByTopGenre.join(', ')})`);
console.log(`Subgenre concentration classification: ${subgenreConcentrationClassification} (dominant in ${topDominantSubgenreSceneCount}/8 scenes: ${scenesDominatedByTopSubgenre.join(', ')})`);

console.log(`\n${'='.repeat(88)}\nARTIST REPETITION\n${'='.repeat(88)}`);
console.log(`Max tracks by one artist in one top-16: ${maxArtistCountAnyTop16} | in one top-10: ${maxArtistCountAnyTop10}`);
console.log(`Max scene-recurrence for one artist: ${maxArtistSceneRecurrence}/8`);
console.log(`Artist repetition classification: ${artistRepetitionClassification}`);

console.log(`\n${'='.repeat(88)}\nSENSITIVITY CHECKS\n${'='.repeat(88)}`);
for (const check of sensitivityChecks) {
  console.log(`\n${check.name}`);
  console.log(`  top16 overlap=${check.top16OverlapCount}/16 top10 overlap=${check.top10OverlapCount}/10 rankOrderCorrelation=${check.rankOrderCorrelation === null ? 'n/a' : round2(check.rankOrderCorrelation)} meanScoreChange=${round2(check.meanScoreChange)}`);
  console.log(`  Up movers: ${check.upMovers.map((m) => `${m.artist}-${m.title}(+${round2(m.delta)})`).join(', ')}`);
  console.log(`  Down movers: ${check.downMovers.map((m) => `${m.artist}-${m.title}(${round2(m.delta)})`).join(', ')}`);
}

console.log(`\n${'='.repeat(88)}\nSUMMARY CLASSIFICATION\n${'='.repeat(88)}`);
for (const [q, data] of Object.entries(summaryClassification)) {
  console.log(`${q}: ${data.answer}`);
}

// ── PHASE 14: machine-readable JSON output ───────────────────────────────────────────
const diagnosticJson = {
  generatedAt: new Date().toISOString(),
  catalogCount: CATALOG_COUNT,
  verifiedPoolCount: verifiedPool.length,
  scoringWeights: SCORE_WEIGHTS,
  sceneProfiles: SCENES.map((s) => ({ key: s.key, label: s.label, concept: s.concept, targetStats: s.targetStats, contextAffinity: s.contextAffinity })),
  perSceneResults: sceneResults.map((s) => ({
    key: s.key,
    label: s.label,
    concept: s.concept,
    top16: s.rows,
    summary: s.summary,
    componentInfluence: s.componentInfluence,
    vectorRedundancy: s.vectorRedundancy,
  })),
  pairwiseOverlap: {
    pairs: pairwise,
    top16OverlapMatrix,
    top16JaccardMatrix,
    top10OverlapMatrix,
    highestOverlapPairs,
    lowestOverlapPairs,
    namedOppositePairs: namedOppositePairs.map((p) => ({ name: p.name, ...p.pair })),
  },
  globalTrackRecurrence: {
    tracksInMoreThanOneScene,
    tracksInAtLeastFourScenes,
    tracksInAllEightScenes,
    top20RecurringTracks,
    artistsInMultipleScenes,
    top15RecurringArtists,
    genresInAllScenes,
    subgenresInAllScenes,
  },
  genreAnalysis: {
    perScenePrimaryGenreShare,
    mostFrequentRank1PrimaryGenre: { genre: mostFrequentRank1PrimaryGenre[0], sceneCount: mostFrequentRank1PrimaryGenre[1] },
    mostTotalSlotsPrimaryGenre: { genre: mostTotalSlotsPrimaryGenre[0], slotCount: mostTotalSlotsPrimaryGenre[1] },
    mostTotalSlotsSubgenre: { subgenre: mostTotalSlotsSubgenre[0], slotCount: mostTotalSlotsSubgenre[1] },
    primaryGenreConcentrationClassification,
    topDominantGenre,
    topDominantGenreSceneCount,
    scenesDominatedByTopGenre,
    subgenreConcentrationClassification,
    topDominantSubgenre,
    topDominantSubgenreSceneCount,
    scenesDominatedByTopSubgenre,
    genrePresenceCounts,
    top20RecurringSubgenres,
  },
  artistAnalysis: {
    maxArtistCountAnyTop16,
    maxArtistCountAnyTop10,
    maxArtistSceneRecurrence,
    artistsWithCrossSceneRecurrenceAtLeast4: artistsWithCrossSceneRecurrenceAtLeast4,
    artistRepetitionClassification,
    perSceneArtistRepetitionDetail: sceneResults.map((s) => ({ scene: s.key, artistRepetitionDetail: s.summary.artistRepetitionDetail })),
  },
  sensitivityChecks,
  summaryClassification,
};

mkdirSync(DIAGNOSTICS_DIR, { recursive: true });
writeFileSync(JSON_OUT_PATH, JSON.stringify(diagnosticJson, null, 2), 'utf-8');

// ── PHASE 15: human-readable Markdown report ─────────────────────────────────────────
const md = [];
md.push('# VibeScene Music Engine — Step 5-B Scoring Diagnostic\n');
md.push(`Generated: ${diagnosticJson.generatedAt}\n`);
md.push(`Catalog count: ${CATALOG_COUNT} | Verified pool: ${verifiedPool.length}\n`);
md.push(`Scoring weights: atmosphere=${SCORE_WEIGHTS.atmosphere}, desiredSound=${SCORE_WEIGHTS.desiredSound}, season=${SCORE_WEIGHTS.season}, time=${SCORE_WEIGHTS.time}, weather=${SCORE_WEIGHTS.weather}\n`);

md.push('\n## Scene-by-scene summary\n');
for (const s of sceneResults) {
  md.push(`\n### ${s.label}\n`);
  md.push(`${s.concept}\n`);
  md.push(
    `- topScore: ${round2(s.summary.topScore)} | rank16Score: ${round2(s.summary.rank16Score)} | scoreSpread: ${round2(s.summary.scoreSpread)}\n` +
      `- meanTop16: ${round2(s.summary.meanTop16Score)} | medianTop16: ${round2(s.summary.medianTop16Score)} | stdDevTop16: ${round2(s.summary.stdDevTop16Score)}\n` +
      `- uniqueArtists: ${s.summary.uniqueArtists} | uniquePrimaryGenres: ${s.summary.uniquePrimaryGenres} | uniqueSubgenres: ${s.summary.uniqueSubgenres}\n` +
      `- maxTracksByOneArtist: ${s.summary.maximumTracksByOneArtist} | maxByPrimaryGenre: ${s.summary.maximumTracksByOnePrimaryGenre} | maxBySubgenre: ${s.summary.maximumTracksByOneSubgenre}\n`,
  );
  md.push('\n| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |');
  md.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of s.rows) {
    md.push(
      `| ${r.rank} | ${r.artist} | ${r.title} | ${r.youtubeVideoId} | ${r.primaryGenre} | ${r.subgenre} | ${round2(r.totalScore)} | ${round2(r.atmosphereScore)} | ${round2(r.desiredSoundScore)} | ${round2(r.seasonScore)} | ${round2(r.timeScore)} | ${round2(r.weatherScore)} |`,
    );
  }
  md.push(`\nprimaryGenre distribution: ${s.summary.primaryGenreDistribution.map(([g, c]) => `${g}:${c}`).join(', ')}\n`);
  md.push(`subgenre distribution: ${s.summary.subgenreDistribution.map(([g, c]) => `${g}:${c}`).join(', ')}\n`);
  md.push(`artist repetitions (>1): ${s.summary.artistRepetitions.length === 0 ? 'none' : s.summary.artistRepetitions.map((a) => `${a.artist}:${a.count}`).join(', ')}\n`);
}

md.push('\n## Overlap matrices\n');
function matrixToMarkdown(title, matrix) {
  const lines = [`\n### ${title}\n`];
  lines.push(`| |${sceneKeys.join('|')}|`);
  lines.push(`|---|${sceneKeys.map(() => '---').join('|')}|`);
  for (const rowKey of sceneKeys) {
    lines.push(`| ${rowKey} |${sceneKeys.map((colKey) => round2(matrix[rowKey][colKey])).join('|')}|`);
  }
  return lines.join('\n');
}
md.push(matrixToMarkdown('top16 overlap count', top16OverlapMatrix));
md.push(matrixToMarkdown('top16 Jaccard similarity', top16JaccardMatrix));
md.push(matrixToMarkdown('top10 overlap count', top10OverlapMatrix));

md.push('\n### Highest top16-overlap pairs\n');
for (const p of highestOverlapPairs) md.push(`- ${p.sceneA} <-> ${p.sceneB}: overlap=${p.top16OverlapCount}, jaccard=${round2(p.top16Jaccard)}, sameNumberOne=${p.sameNumberOne}`);
md.push('\n### Lowest top16-overlap pairs\n');
for (const p of lowestOverlapPairs) md.push(`- ${p.sceneA} <-> ${p.sceneB}: overlap=${p.top16OverlapCount}, jaccard=${round2(p.top16Jaccard)}, sameNumberOne=${p.sameNumberOne}`);
md.push('\n### Named opposite-scene pairs\n');
for (const p of namedOppositePairs) md.push(`- ${p.name}: overlap16=${p.pair.top16OverlapCount}, jaccard16=${round2(p.pair.top16Jaccard)}, overlap10=${p.pair.top10OverlapCount}`);

md.push('\n## Globally recurring tracks (top 20)\n');
md.push('| artist | title | youtubeVideoId | scenes | avgRank | avgScore |');
md.push('|---|---|---|---|---|---|');
for (const t of top20RecurringTracks) md.push(`| ${t.artist} | ${t.title} | ${t.youtubeVideoId} | ${t.sceneCount} (${t.scenes.join(',')}) | ${round2(t.averageRank)} | ${round2(t.averageTotalScore)} |`);

md.push('\n## Globally recurring artists (top 15)\n');
md.push('| artist | scenes |');
md.push('|---|---|');
for (const a of top15RecurringArtists) md.push(`| ${a.artist} | ${a.sceneCount} (${a.scenes.join(',')}) |`);

md.push('\n## Genre analysis\n');
md.push(`- primaryGenres present in all 8 scenes: ${genresInAllScenes.join(', ') || 'none'}`);
md.push(`- subgenres present in all 8 scenes: ${subgenresInAllScenes.join(', ') || 'none'}`);
md.push(`- Most frequent rank-1 primaryGenre: ${mostFrequentRank1PrimaryGenre[0]} (${mostFrequentRank1PrimaryGenre[1]}/8 scenes)`);
md.push(`- Most total top-16 slots by primaryGenre: ${mostTotalSlotsPrimaryGenre[0]} (${mostTotalSlotsPrimaryGenre[1]}/128 slots)`);
md.push(`- Most total top-16 slots by subgenre: ${mostTotalSlotsSubgenre[0]} (${mostTotalSlotsSubgenre[1]}/128 slots)`);
md.push(`- primaryGenre concentration classification: **${primaryGenreConcentrationClassification}** (dominant in ${topDominantGenreSceneCount}/8 scenes: ${scenesDominatedByTopGenre.join(', ')})`);
md.push(`- subgenre concentration classification: **${subgenreConcentrationClassification}** (dominant in ${topDominantSubgenreSceneCount}/8 scenes: ${scenesDominatedByTopSubgenre.join(', ')})`);

md.push('\n## Artist repetition analysis\n');
md.push(`- Max tracks by one artist in one top-16: ${maxArtistCountAnyTop16}`);
md.push(`- Max tracks by one artist in one top-10: ${maxArtistCountAnyTop10}`);
md.push(`- Max scene-recurrence for one artist: ${maxArtistSceneRecurrence}/8`);
md.push(`- Artist repetition classification: **${artistRepetitionClassification}**`);

md.push('\n## Sensitivity checks\n');
for (const check of sensitivityChecks) {
  md.push(`\n### ${check.name}\n`);
  md.push(`- top16 overlap: ${check.top16OverlapCount}/16, top10 overlap: ${check.top10OverlapCount}/10`);
  md.push(`- rank-order correlation: ${check.rankOrderCorrelation === null ? 'n/a' : round2(check.rankOrderCorrelation)}`);
  md.push(`- mean score change: ${round2(check.meanScoreChange)}`);
  md.push(`- Up movers: ${check.upMovers.map((m) => `${m.artist} - ${m.title} (+${round2(m.delta)})`).join('; ')}`);
  md.push(`- Down movers: ${check.downMovers.map((m) => `${m.artist} - ${m.title} (${round2(m.delta)})`).join('; ')}`);
}

md.push('\n## Final diagnostic classification\n');
for (const [q, data] of Object.entries(summaryClassification)) {
  md.push(`\n**${q}**: ${data.answer}`);
}

mkdirSync(DIAGNOSTICS_DIR, { recursive: true });
writeFileSync(MD_OUT_PATH, md.join('\n'), 'utf-8');

console.log(`\n${'='.repeat(88)}`);
console.log(`Wrote ${JSON_OUT_PATH}`);
console.log(`Wrote ${MD_OUT_PATH}`);
console.log('Diagnostic completed successfully.');
