// Focused verification for Step 5-A: supabase/functions/analyze-and-search/services/scoring.ts.
//
// Loads scoring.ts (and, for the production-catalog tests, musicCatalog.ts) with the
// same transpile+vm technique already used by scripts/validate-music-catalog.mjs and
// scripts/verify-image-vector-parser.mjs — no test framework, no new dependency.
// scoring.ts has zero runtime imports (both its imports are `import type`, fully erased
// by the TypeScript transpiler), so it can be loaded standalone with a plain sandbox.
//
// This does NOT call OpenAI, does NOT touch sequencing/DB, and does NOT test the
// production edge function's HTTP behavior — only the pure scoring module.
//
// Usage: node scripts/verify-music-scoring.mjs

import { readFileSync } from 'fs';
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

function transpileToSandbox(fullPath, extraSandbox = {}) {
  const src = readFileSync(fullPath, 'utf-8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const sandbox = { module: { exports: {} }, exports: {}, require, console, ...extraSandbox };
  sandbox.module.exports = sandbox.exports;
  vm.createContext(sandbox);
  vm.runInContext(out.outputText, sandbox, { filename: fullPath });
  return sandbox.exports;
}

const {
  SCORE_WEIGHTS,
  scoreCatalogTrack,
  rankCatalogTracks,
  selectTopScoredTracks,
  checkTrackEligibility,
} = transpileToSandbox(SCORING_PATH);

let cachedCatalog = null;
function loadMusicCatalog() {
  if (!cachedCatalog) {
    cachedCatalog = transpileToSandbox(CATALOG_PATH);
  }
  return cachedCatalog;
}

// ── Test harness ────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];

function numbersClose(a, b) {
  return typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 1e-9;
}

function check(name, actual, expected) {
  const ok = numbersClose(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed += 1;
  } else {
    failed += 1;
    failures.push({ name, expected, actual });
  }
}

function assertTrue(name, cond, actualForReport) {
  if (cond) {
    passed += 1;
  } else {
    failed += 1;
    failures.push({ name, expected: true, actual: actualForReport !== undefined ? actualForReport : cond });
  }
}

// ── Fixture builders ──────────────────────────────────────────────────────
const STATS_FIELDS = [
  'brightness', 'warmth', 'openness', 'motion', 'intimacy', 'socialEnergy',
  'tension', 'nostalgia', 'playfulness', 'dreaminess',
  'energy', 'groove', 'density', 'acousticness', 'electronicness',
  'vocalPresence', 'climaxIntensity',
];
const AFFINITY_FIELDS = [
  'spring', 'summer', 'autumn', 'winter',
  'morning', 'day', 'dusk', 'night', 'lateNight',
  'clear', 'cloudy', 'rain', 'snow',
];
const ATMOSPHERE_FIELDS = STATS_FIELDS.slice(0, 10);

function uniformStats(value) {
  const obj = {};
  for (const f of STATS_FIELDS) obj[f] = value;
  return obj;
}
function uniformAffinity(value) {
  const obj = {};
  for (const f of AFFINITY_FIELDS) obj[f] = value;
  return obj;
}
let trackCounter = 0;
function makeTrack(overrides = {}) {
  trackCounter += 1;
  return {
    title: `Track ${trackCounter}`,
    artist: `Artist ${trackCounter}`,
    youtubeVideoId: `vid-${trackCounter}`,
    stats: uniformStats(50),
    affinity: uniformAffinity(50),
    ...overrides,
  };
}

// [1] Identical scene and track vectors produce 100 for all five groups and totalScore.
{
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const track = makeTrack({ stats: uniformStats(50), affinity: uniformAffinity(50) });
  const r = scoreCatalogTrack(scene, track);
  check('[1] identical vectors -> atmosphereScore', r.atmosphereScore, 100);
  check('[1] identical vectors -> desiredSoundScore', r.desiredSoundScore, 100);
  check('[1] identical vectors -> seasonScore', r.seasonScore, 100);
  check('[1] identical vectors -> timeScore', r.timeScore, 100);
  check('[1] identical vectors -> weatherScore', r.weatherScore, 100);
  check('[1] identical vectors -> totalScore', r.totalScore, 100);
}

// [2] Fully opposite 0-versus-100 vectors produce 0 for all five groups and totalScore.
{
  const scene = { targetStats: uniformStats(0), contextAffinity: uniformAffinity(0) };
  const track = makeTrack({ stats: uniformStats(100), affinity: uniformAffinity(100) });
  const r = scoreCatalogTrack(scene, track);
  check('[2] opposite vectors -> atmosphereScore', r.atmosphereScore, 0);
  check('[2] opposite vectors -> desiredSoundScore', r.desiredSoundScore, 0);
  check('[2] opposite vectors -> seasonScore', r.seasonScore, 0);
  check('[2] opposite vectors -> timeScore', r.timeScore, 0);
  check('[2] opposite vectors -> weatherScore', r.weatherScore, 0);
  check('[2] opposite vectors -> totalScore', r.totalScore, 0);
}

// [3] A difference limited to one group affects only that group and the expected weighted total.
// [4] totalScore matches the exact accepted weighted formula.
{
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const trackStats = uniformStats(50);
  for (const f of ATMOSPHERE_FIELDS) trackStats[f] = 70; // +20 distance on all 10 atmosphere fields only
  const track = makeTrack({ stats: trackStats, affinity: uniformAffinity(50) });
  const r = scoreCatalogTrack(scene, track);
  check('[3] isolated atmosphere diff -> atmosphereScore', r.atmosphereScore, 80);
  check('[3] other groups unaffected -> desiredSoundScore', r.desiredSoundScore, 100);
  check('[3] other groups unaffected -> seasonScore', r.seasonScore, 100);
  check('[3] other groups unaffected -> timeScore', r.timeScore, 100);
  check('[3] other groups unaffected -> weatherScore', r.weatherScore, 100);
  const expectedTotal = 80 * SCORE_WEIGHTS.atmosphere + 100 * SCORE_WEIGHTS.desiredSound +
    100 * SCORE_WEIGHTS.season + 100 * SCORE_WEIGHTS.time + 100 * SCORE_WEIGHTS.weather;
  check('[4] totalScore matches exact accepted weighted formula', r.totalScore, expectedTotal);
}

// [5] All scores remain between 0 and 100.
{
  const scene = { targetStats: uniformStats(37), contextAffinity: uniformAffinity(63) };
  const stats = uniformStats(50);
  stats.brightness = 12;
  stats.energy = 99;
  const affinity = uniformAffinity(50);
  affinity.rain = 100;
  affinity.summer = 0;
  const track = makeTrack({ stats, affinity });
  const r = scoreCatalogTrack(scene, track);
  for (const key of ['atmosphereScore', 'desiredSoundScore', 'seasonScore', 'timeScore', 'weatherScore', 'totalScore']) {
    assertTrue(`[5] ${key} within [0,100]`, r[key] >= 0 && r[key] <= 100, r[key]);
  }
}

// [6] Same inputs produce identical ranking.
{
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const tracks = [
    makeTrack({ stats: uniformStats(60), affinity: uniformAffinity(40) }),
    makeTrack({ stats: uniformStats(40), affinity: uniformAffinity(60) }),
    makeTrack({ stats: uniformStats(50), affinity: uniformAffinity(50) }),
  ];
  const order1 = rankCatalogTracks(scene, tracks).ranked.map((r) => r.track.youtubeVideoId);
  const order2 = rankCatalogTracks(scene, tracks).ranked.map((r) => r.track.youtubeVideoId);
  check('[6] identical inputs produce identical ranking order', order1, order2);
}

// [7] Input catalog array is not mutated.
{
  const tracks = [
    makeTrack({ stats: uniformStats(10), affinity: uniformAffinity(10) }),
    makeTrack({ stats: uniformStats(90), affinity: uniformAffinity(90) }),
  ];
  const before = tracks.map((t) => t.youtubeVideoId);
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  rankCatalogTracks(scene, tracks);
  const after = tracks.map((t) => t.youtubeVideoId);
  check('[7] input array order is not mutated', after, before);
}

// [8] A higher-fit synthetic track ranks above a lower-fit track.
{
  const scene = { targetStats: uniformStats(80), contextAffinity: uniformAffinity(80) };
  const goodTrack = makeTrack({ youtubeVideoId: 'id-good', stats: uniformStats(80), affinity: uniformAffinity(80) });
  const badTrack = makeTrack({ youtubeVideoId: 'id-bad', stats: uniformStats(10), affinity: uniformAffinity(10) });
  const { ranked } = rankCatalogTracks(scene, [badTrack, goodTrack]); // inserted worst-first on purpose
  assertTrue(
    '[8] higher-fit track ranks first',
    ranked[0].track.youtubeVideoId === 'id-good',
    ranked.map((r) => r.track.youtubeVideoId),
  );
}

// [9] Deterministic tie-break rules work in the required order.
{
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const sharedStats = uniformStats(65);
  const sharedAffinity = uniformAffinity(65);

  const tracks = [
    makeTrack({ artist: ' ZZZ Artist ', title: 'Zzz Title', youtubeVideoId: 'id-a', stats: sharedStats, affinity: sharedAffinity }),
    makeTrack({ artist: 'aaa artist', title: 'Aaa Title', youtubeVideoId: 'id-b', stats: sharedStats, affinity: sharedAffinity }),
    makeTrack({ artist: 'Shared Artist', title: 'Beta Song', youtubeVideoId: 'id-c', stats: sharedStats, affinity: sharedAffinity }),
    makeTrack({ artist: 'Shared Artist', title: 'Alpha Song', youtubeVideoId: 'id-d', stats: sharedStats, affinity: sharedAffinity }),
    makeTrack({ artist: 'Same Artist', title: 'Same Title', youtubeVideoId: 'zzz-id', stats: sharedStats, affinity: sharedAffinity }),
    makeTrack({ artist: 'Same Artist', title: 'Same Title', youtubeVideoId: 'aaa-id', stats: sharedStats, affinity: sharedAffinity }),
  ];

  const { ranked } = rankCatalogTracks(scene, tracks);
  const order = ranked.map((r) => r.track.youtubeVideoId);

  assertTrue('[9] artist tie-break ascending (normalized "aaa artist" before "zzz artist")', order.indexOf('id-b') < order.indexOf('id-a'), order);
  assertTrue('[9] title tie-break ascending within same artist ("Alpha Song" before "Beta Song")', order.indexOf('id-d') < order.indexOf('id-c'), order);
  assertTrue('[9] youtubeVideoId tie-break ascending within same artist+title', order.indexOf('aaa-id') < order.indexOf('zzz-id'), order);
}

// [10] A track without youtubeVideoId is excluded.
{
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const validTrack = makeTrack({ youtubeVideoId: 'valid-id' });
  const invalidTrack = makeTrack({ youtubeVideoId: '' });
  const { ranked, skipped } = rankCatalogTracks(scene, [validTrack, invalidTrack]);
  assertTrue('[10] track without youtubeVideoId excluded from ranked', !ranked.some((r) => r.track === invalidTrack));
  assertTrue('[10] track without youtubeVideoId recorded in skipped with a reason', skipped.some((s) => s.reason.includes('youtubeVideoId')));
}

// [11] A track with malformed stats is excluded.
{
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const badStats = uniformStats(50);
  badStats.brightness = 'oops';
  const track = makeTrack({ stats: badStats });
  const { ranked, skipped } = rankCatalogTracks(scene, [track]);
  check('[11] malformed stats -> ranked length', ranked.length, 0);
  assertTrue('[11] malformed stats recorded with a stats reason', skipped.some((s) => s.reason.includes('stats')));
}

// [12] A track with malformed affinity is excluded.
{
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const badAffinity = uniformAffinity(50);
  badAffinity.rain = 150; // out of range
  const track = makeTrack({ affinity: badAffinity });
  const { ranked, skipped } = rankCatalogTracks(scene, [track]);
  check('[12] malformed affinity -> ranked length', ranked.length, 0);
  assertTrue('[12] malformed affinity recorded with an affinity reason', skipped.some((s) => s.reason.includes('affinity')));
}

// [13] Top-N selection respects the requested count.
{
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const tracks = [1, 2, 3, 4, 5].map((i) => makeTrack({ stats: uniformStats(50 + i), affinity: uniformAffinity(50) }));
  const { ranked } = rankCatalogTracks(scene, tracks);
  const top = selectTopScoredTracks(ranked, 3);
  check('[13] selectTopScoredTracks respects requested count', top.length, 3);
}

// [14]-[16] Production-catalog checks.
{
  const { MUSIC_CATALOG } = loadMusicCatalog();
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const verifiedPool = MUSIC_CATALOG.filter((t) => typeof t.youtubeVideoId === 'string' && t.youtubeVideoId.trim().length > 0);
  const { ranked } = rankCatalogTracks(scene, verifiedPool);
  const top16 = selectTopScoredTracks(ranked, 16);

  check('[14] top-16 selection from production catalog returns exactly 16', top16.length, 16);
  assertTrue(
    '[15] all selected production tracks have YouTube IDs',
    top16.every((t) => typeof t.youtubeVideoId === 'string' && t.youtubeVideoId.trim().length > 0),
  );
  const idSet = new Set(top16.map((t) => t.youtubeVideoId));
  check('[16] selected production tracks contain no duplicate YouTube IDs', idSet.size, 16);
}

// [17] Score breakdown contains all five group scores.
{
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const r = scoreCatalogTrack(scene, makeTrack());
  for (const key of ['track', 'totalScore', 'atmosphereScore', 'desiredSoundScore', 'seasonScore', 'timeScore', 'weatherScore']) {
    assertTrue(`[17] ScoreBreakdown contains "${key}"`, Object.prototype.hasOwnProperty.call(r, key));
  }
}

// [18] Weight sum equals exactly 1.
{
  const sum = SCORE_WEIGHTS.atmosphere + SCORE_WEIGHTS.desiredSound + SCORE_WEIGHTS.season + SCORE_WEIGHTS.time + SCORE_WEIGHTS.weather;
  assertTrue('[18] weight sum equals exactly 1 (strict, no epsilon)', sum === 1, sum);
}

// [19] Scoring does not accept or read lane, genre, tags, playlistId, or seed parameters.
{
  const scene = { targetStats: uniformStats(50), contextAffinity: uniformAffinity(50) };
  const sharedStats = uniformStats(65);
  const sharedAffinity = uniformAffinity(65);
  const trackA = makeTrack({
    stats: sharedStats, affinity: sharedAffinity,
    primaryGenre: 'pop', subgenre: 'dance-pop', moodTags: ['happy'], sceneTags: ['beach'],
    playlistId: 'some-playlist-id', laneId: 'summer-beach-pop', seed: 'random-seed-value',
  });
  const trackB = makeTrack({
    stats: sharedStats, affinity: sharedAffinity,
    primaryGenre: 'rock', subgenre: 'j-rock', moodTags: ['angry'], sceneTags: ['city-night'],
    playlistId: 'different-playlist-id', laneId: 'j-rock-highway-rush', seed: 'different-seed',
  });
  const resultA = scoreCatalogTrack(scene, trackA);
  const resultB = scoreCatalogTrack(scene, trackB);
  check('[19] totalScore identical regardless of genre/lane/tags/playlistId/seed', resultA.totalScore, resultB.totalScore);
  check('[19] atmosphereScore identical regardless of genre/lane/tags/playlistId/seed', resultA.atmosphereScore, resultB.atmosphereScore);
  check('[19] desiredSoundScore identical regardless of genre/lane/tags/playlistId/seed', resultA.desiredSoundScore, resultB.desiredSoundScore);
  assertTrue('[19] scoreCatalogTrack takes only (scene, track) — no seed/playlistId parameter', scoreCatalogTrack.length === 2, scoreCatalogTrack.length);
  assertTrue('[19] rankCatalogTracks takes only (scene, tracks) — no seed/playlistId parameter', rankCatalogTracks.length === 2, rankCatalogTracks.length);
}

// [20] Meaningfully different scene vectors produce different ranking orders or different top-result sets.
{
  const scenes = {
    'bright warm open summer day': {
      targetStats: {
        brightness: 90, warmth: 85, openness: 85, motion: 60, intimacy: 20,
        socialEnergy: 70, tension: 10, nostalgia: 20, playfulness: 70, dreaminess: 30,
        energy: 65, groove: 55, density: 50, acousticness: 50, electronicness: 40,
        vocalPresence: 60, climaxIntensity: 40,
      },
      contextAffinity: {
        spring: 40, summer: 95, autumn: 10, winter: 5,
        morning: 30, day: 90, dusk: 20, night: 5, lateNight: 0,
        clear: 90, cloudy: 15, rain: 5, snow: 0,
      },
    },
    'rainy intimate low-motion late night': {
      targetStats: {
        brightness: 15, warmth: 30, openness: 20, motion: 10, intimacy: 90,
        socialEnergy: 15, tension: 40, nostalgia: 60, playfulness: 15, dreaminess: 60,
        energy: 20, groove: 25, density: 35, acousticness: 70, electronicness: 30,
        vocalPresence: 55, climaxIntensity: 20,
      },
      contextAffinity: {
        spring: 20, summer: 10, autumn: 50, winter: 40,
        morning: 5, day: 5, dusk: 20, night: 70, lateNight: 90,
        clear: 5, cloudy: 40, rain: 90, snow: 10,
      },
    },
    'high-energy urban night': {
      targetStats: {
        brightness: 40, warmth: 35, openness: 45, motion: 85, intimacy: 25,
        socialEnergy: 80, tension: 65, nostalgia: 15, playfulness: 50, dreaminess: 15,
        energy: 90, groove: 85, density: 80, acousticness: 15, electronicness: 85,
        vocalPresence: 70, climaxIntensity: 85,
      },
      contextAffinity: {
        spring: 20, summer: 30, autumn: 25, winter: 25,
        morning: 5, day: 10, dusk: 25, night: 85, lateNight: 70,
        clear: 30, cloudy: 30, rain: 15, snow: 5,
      },
    },
    'dreamy hazy dusk': {
      targetStats: {
        brightness: 45, warmth: 50, openness: 60, motion: 25, intimacy: 55,
        socialEnergy: 25, tension: 20, nostalgia: 55, playfulness: 25, dreaminess: 90,
        energy: 35, groove: 30, density: 45, acousticness: 55, electronicness: 45,
        vocalPresence: 40, climaxIntensity: 30,
      },
      contextAffinity: {
        spring: 35, summer: 25, autumn: 45, winter: 20,
        morning: 10, day: 25, dusk: 90, night: 35, lateNight: 10,
        clear: 35, cloudy: 55, rain: 25, snow: 10,
      },
    },
    'calm acoustic morning': {
      targetStats: {
        brightness: 65, warmth: 60, openness: 55, motion: 15, intimacy: 45,
        socialEnergy: 20, tension: 10, nostalgia: 35, playfulness: 30, dreaminess: 35,
        energy: 25, groove: 20, density: 30, acousticness: 90, electronicness: 10,
        vocalPresence: 50, climaxIntensity: 15,
      },
      contextAffinity: {
        spring: 55, summer: 30, autumn: 35, winter: 15,
        morning: 90, day: 45, dusk: 10, night: 5, lateNight: 0,
        clear: 70, cloudy: 25, rain: 10, snow: 5,
      },
    },
  };

  const { MUSIC_CATALOG } = loadMusicCatalog();
  const verifiedPool = MUSIC_CATALOG.filter((t) => typeof t.youtubeVideoId === 'string' && t.youtubeVideoId.trim().length > 0);

  const results = Object.entries(scenes).map(([name, scene]) => {
    const { ranked } = rankCatalogTracks(scene, verifiedPool);
    const top10 = selectTopScoredTracks(ranked, 10).map((t) => t.youtubeVideoId);
    return { name, top10Key: top10.join(','), topScore: ranked[0].totalScore };
  });

  const distinctTopSets = new Set(results.map((r) => r.top10Key));
  assertTrue(
    '[20] meaningfully different scenes produce more than one distinct top-10 set',
    distinctTopSets.size > 1,
    results.map((r) => `${r.name}: ${r.top10Key.slice(0, 80)}...`),
  );

  const distinctTopScores = new Set(results.map((r) => r.topScore.toFixed(6)));
  assertTrue(
    '[20] score distributions differ across scenes (distinct top totalScore values)',
    distinctTopScores.size > 1,
    results.map((r) => `${r.name}: ${r.topScore}`),
  );
}

// ── Report ──────────────────────────────────────────────────────────────────
if (failed > 0) {
  console.error('FAILED TESTS:');
  for (const f of failures) {
    console.error(`  - ${f.name}`);
    console.error(`      expected: ${JSON.stringify(f.expected)}`);
    console.error(`      actual:   ${JSON.stringify(f.actual)}`);
  }
  console.error(`\nPassed: ${passed}`);
  console.error(`Failed: ${failed}`);
  process.exit(1);
}

console.log('MUSIC SCORING VERIFICATION PASSED');
console.log(`Passed: ${passed}`);
console.log('Failed: 0');
