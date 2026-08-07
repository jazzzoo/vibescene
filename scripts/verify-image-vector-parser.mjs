// Focused verification for Step 4-A (targetStats/contextAffinity parser) and
// Step 6 (genre-first canonical taxonomy parser/validator) in
// supabase/functions/analyze-and-search/services/gpt.ts.
//
// This does NOT call OpenAI and does NOT test recommendation scoring (see
// scripts/verify-music-scoring.mjs and scripts/verify-genre-filter-20-track.mjs
// for that). It loads gpt.ts's exported pure validation helpers with the same
// transpile+vm technique already used by scripts/validate-music-catalog.mjs,
// shimming gpt.ts's "../errors.ts" and "./curationLanes.ts" imports, and
// loading the REAL (unshimmed) musicGenreTaxonomy.ts — it has zero runtime
// imports of its own, so it can be transpiled+loaded standalone exactly like
// scoring.ts already is in scripts/verify-music-scoring.mjs.
//
// Usage: node scripts/verify-image-vector-parser.mjs

import { readFileSync } from 'fs';
import ts from 'typescript';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GPT_PATH = path.join(ROOT, 'supabase/functions/analyze-and-search/services/gpt.ts');
const TAXONOMY_PATH = path.join(ROOT, 'supabase/functions/_shared/musicGenreTaxonomy.ts');
const CATALOG_PATH = path.join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const SCORING_PATH = path.join(ROOT, 'supabase/functions/analyze-and-search/services/scoring.ts');

const TEST_LANE_ID = 'test-lane';

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

let cachedTaxonomy = null;
function loadTaxonomyModule() {
  if (!cachedTaxonomy) cachedTaxonomy = transpileToSandbox(TAXONOMY_PATH);
  return cachedTaxonomy;
}

let cachedCatalog = null;
function loadCatalogModule() {
  // Real module, not a shim — musicCatalog.ts has only a type-only import from
  // musicGenreTaxonomy.ts (erased at transpile time), so it has zero runtime requires.
  if (!cachedCatalog) cachedCatalog = transpileToSandbox(CATALOG_PATH);
  return cachedCatalog;
}

let cachedScoring = null;
function loadScoringModule() {
  // Real module, not a shim — scoring.ts's imports (CatalogTrack/TrackAffinity/TrackStats from
  // musicCatalog.ts, PrimaryGenre/Subgenre from musicGenreTaxonomy.ts, ContextAffinity/TargetStats
  // from gpt.ts) are all `import type`, fully erased — zero runtime requires.
  if (!cachedScoring) cachedScoring = transpileToSandbox(SCORING_PATH);
  return cachedScoring;
}

function fakeRequire(id) {
  if (id.endsWith('errors.ts') || id.endsWith('errors')) {
    return {
      SafeError: class SafeError extends Error {
        constructor(message) {
          super(message);
          this.name = 'SafeError';
        }
      },
    };
  }
  if (id.endsWith('curationLanes.ts') || id.endsWith('curationLanes')) {
    // Minimal shim — only needs to satisfy buildCurationLanesPrompt()'s field
    // access at gpt.ts module-load time and VALID_LANE_IDS lookup.
    return {
      CURATION_LANES: [{
        id: TEST_LANE_ID,
        name: 'Test Lane',
        description: '',
        sceneSignals: [],
        energySignals: [],
        allowedGenres: [],
        forbiddenGenres: [],
        referenceVibes: [],
        titleExamples: [],
        avoidWhen: [],
      }],
    };
  }
  if (id.endsWith('musicGenreTaxonomy.ts') || id.endsWith('musicGenreTaxonomy')) {
    // Real module, not a shim — it's pure data/types with zero runtime imports.
    return loadTaxonomyModule();
  }
  if (id.endsWith('musicCatalog.ts') || id.endsWith('musicCatalog')) {
    return loadCatalogModule();
  }
  if (id.endsWith('scoring.ts') || id.endsWith('scoring')) {
    return loadScoringModule();
  }
  throw new Error(`verify-image-vector-parser: unexpected require("${id}") — no shim registered`);
}

function loadGptModule() {
  const sandbox = transpileToSandbox(GPT_PATH, {
    require: fakeRequire,
    // analyzeImage() reads Deno.env.get(...) but this script never calls analyzeImage
    // (no network calls in a focused parser test) — stub only so module load doesn't crash
    // if anything at module scope ever references it.
    Deno: { env: { get: () => undefined } },
  });
  return sandbox;
}

// Loads a FRESH gpt.ts sandbox with a mocked `fetch` (queued canned OpenAI chat-completion
// responses, one per call) and a fake OPENAI_API_KEY, so analyzeImage()'s real one-time
// correction-retry loop can be exercised end-to-end with ZERO real network calls. This is the
// only place in this script that "calls" analyzeImage — it never reaches the real OpenAI API.
function loadGptModuleWithMockFetch(responseContents) {
  let callIndex = 0;
  const fetchMock = async () => {
    const content = responseContents[Math.min(callIndex, responseContents.length - 1)];
    callIndex += 1;
    return { ok: true, json: async () => ({ choices: [{ message: { content } }] }) };
  };
  return transpileToSandbox(GPT_PATH, {
    require: fakeRequire,
    Deno: { env: { get: (key) => (key === 'OPENAI_API_KEY' ? 'fake-test-key' : undefined) } },
    fetch: fetchMock,
  });
}

const {
  validateVectorObject,
  TARGET_STATS_FIELDS,
  CONTEXT_AFFINITY_FIELDS,
  parseGptJson,
  applyCompatibilityValidation,
  validateGenreSelection,
  validateGenreSelectionWithCoverage,
  buildCorrectionPrompt,
} = loadGptModule();

const { PRIMARY_GENRE_IDS, SUBGENRE_IDS, SUBGENRES_BY_PRIMARY } = loadTaxonomyModule();
const { FINAL_TRACK_COUNT, filterEligibleByGenre } = loadScoringModule();
const { MUSIC_CATALOG, hasYoutubeVideoId } = loadCatalogModule();
const VERIFIED_CATALOG_POOL = MUSIC_CATALOG.filter(hasYoutubeVideoId);

const failures = [];
let totalChecks = 0;
function check(label, cond) {
  totalChecks += 1;
  if (!cond) failures.push(label);
}

function validStats() {
  const obj = {};
  for (const f of TARGET_STATS_FIELDS) obj[f] = 50;
  return obj;
}
function validAffinity() {
  const obj = {};
  for (const f of CONTEXT_AFFINITY_FIELDS) obj[f] = 50;
  return obj;
}

console.log(`Loaded gpt.ts exports: TARGET_STATS_FIELDS=${TARGET_STATS_FIELDS.length}, CONTEXT_AFFINITY_FIELDS=${CONTEXT_AFFINITY_FIELDS.length}`);

// 1. complete valid 17+13 payload passes
{
  const r = validateVectorObject(validStats(), TARGET_STATS_FIELDS);
  check('[1] valid targetStats (17 fields) passes with no normalization', r.status === 'ok' && r.normalized === false);
  const r2 = validateVectorObject(validAffinity(), CONTEXT_AFFINITY_FIELDS);
  check('[1] valid contextAffinity (13 fields) passes with no normalization', r2.status === 'ok' && r2.normalized === false);
}

// 2. decimal values are normalized to integers
{
  const stats = validStats();
  stats.brightness = 72.6;
  const r = validateVectorObject(stats, TARGET_STATS_FIELDS);
  check('[2] decimal value rounds to nearest integer', r.status === 'ok' && r.value.brightness === 73);
  check('[2] rounding is reported as normalized', r.status === 'ok' && r.normalized === true);
}

// 3. slightly out-of-range values are clamped (chosen policy: recoverable window is [-5, 105])
{
  const stats = validStats();
  stats.warmth = 104;
  stats.tension = -3;
  const r = validateVectorObject(stats, TARGET_STATS_FIELDS);
  check('[3] slightly-over-100 clamps to 100', r.status === 'ok' && r.value.warmth === 100);
  check('[3] slightly-under-0 clamps to 0', r.status === 'ok' && r.value.tension === 0);
  check('[3] clamping is reported as normalized', r.status === 'ok' && r.normalized === true);
}

// 3b. far-out-of-range values are rejected outright, not silently clamped
{
  const stats = validStats();
  stats.motion = 9999;
  const r = validateVectorObject(stats, TARGET_STATS_FIELDS);
  check('[3b] far out-of-range value is invalid, not clamped', r.status === 'invalid' && r.invalid.some((s) => s.includes('motion')));
}

// 4. missing required field fails
{
  const stats = validStats();
  delete stats.dreaminess;
  const r = validateVectorObject(stats, TARGET_STATS_FIELDS);
  check('[4] missing field is reported as invalid', r.status === 'invalid' && r.missing.includes('dreaminess'));
}

// 5. string numeric value behavior is explicit: rejected (not silently coerced)
{
  const stats = validStats();
  stats.groove = '80';
  const r = validateVectorObject(stats, TARGET_STATS_FIELDS);
  check('[5] string numeric value is rejected, not coerced', r.status === 'invalid' && r.invalid.some((s) => s.includes('groove')));
}

// 6. NaN / Infinity fails
{
  const statsNaN = validStats();
  statsNaN.density = NaN;
  const rNaN = validateVectorObject(statsNaN, TARGET_STATS_FIELDS);
  check('[6] NaN is invalid', rNaN.status === 'invalid');

  const statsInf = validStats();
  statsInf.density = Infinity;
  const rInf = validateVectorObject(statsInf, TARGET_STATS_FIELDS);
  check('[6] Infinity is invalid', rInf.status === 'invalid');
}

// 7. existing compatibility fields still parse (Step 6: primaryGenres/subgenres canonical arrays)
{
  const payload = {
    image_type: 'SCENE',
    confidence: 0.9,
    analysis: {
      location: 'street', time_of_day: 'night', season: 'winter',
      mood_keywords: ['calm'], sensory_impressions: ['cold'], cultural_context: '',
    },
    music_profile: { energy_score: 3, tempo: 'mid', valence: 'neutral', primaryGenres: ['pop'], subgenres: ['city-pop', 'dance-pop'] },
    targetStats: validStats(),
    contextAffinity: validAffinity(),
    playlist: [{ rank: 1, title: 'Song', artist: 'Artist', reason: 'fits' }],
    playlist_concept: 'Test Concept',
    playlist_subtitle: 'A sufficiently long subtitle for testing purposes',
    primary_lane_id: TEST_LANE_ID,
  };
  const content = '```json\n' + JSON.stringify(payload) + '\n```';
  const parsed = parseGptJson(content);
  check('[7] parseGptJson strips markdown fences and parses JSON', parsed.image_type === 'SCENE');

  let compatOk = true;
  try {
    applyCompatibilityValidation(parsed);
  } catch {
    compatOk = false;
  }
  check('[7] applyCompatibilityValidation accepts a valid compatibility payload', compatOk);
  check(
    '[7] existing compatibility fields remain intact',
    parsed.playlist_concept === 'Test Concept' &&
      parsed.playlist[0].title === 'Song' &&
      parsed.music_profile.primaryGenres[0] === 'pop',
  );
}

// 8. extra/unexpected fields do not break parsing
{
  const stats = validStats();
  stats.colorWarmth = 42; // not a real TrackStats field name — must be ignored, not error
  const r = validateVectorObject(stats, TARGET_STATS_FIELDS);
  check('[8] unexpected extra field does not invalidate the object', r.status === 'ok');
  check('[8] unexpected extra field is not copied into the validated value', r.status === 'ok' && r.value.colorWarmth === undefined);
}

// ── Step 6 genre-first canonical taxonomy validation (Phase 12) ────────────────────────────
console.log(`Loaded taxonomy: PRIMARY_GENRE_IDS=${PRIMARY_GENRE_IDS.length}, SUBGENRE_IDS=${SUBGENRE_IDS.length}`);

function withGenre(primaryGenres, subgenres) {
  return { music_profile: { energy_score: 3, tempo: 'mid', valence: 'neutral', primaryGenres, subgenres } };
}

// 9. valid one-primary/two-subgenre response
{
  const r = validateGenreSelection(withGenre(['pop'], ['city-pop', 'dance-pop']));
  check('[9] valid one-primary/two-subgenre passes', r.ok === true);
  check('[9] returns the exact primaryGenres/subgenres', r.ok && r.primaryGenres.length === 1 && r.subgenres.length === 2);
}

// 10. valid multi-primary/multi-subgenre response
{
  const r = validateGenreSelection(withGenre(['rnb-soul', 'hip-hop', 'jazz'], ['k-rnb', 'jazz-rap', 'nu-jazz']));
  check('[10] valid multi-primary/multi-subgenre passes', r.ok === true);
}

// 11. unknown primary genre is rejected
{
  const r = validateGenreSelection(withGenre(['not-a-real-genre'], ['city-pop']));
  check('[11] unknown primaryGenre is invalid', r.ok === false);
  check('[11] issue names the unknown id', r.ok === false && r.issues.some((s) => s.includes('not-a-real-genre')));
}

// 12. unknown subgenre is rejected
{
  const r = validateGenreSelection(withGenre(['pop'], ['not-a-real-subgenre', 'city-pop']));
  check('[12] unknown subgenre is invalid', r.ok === false);
  check('[12] issue names the unknown id', r.ok === false && r.issues.some((s) => s.includes('not-a-real-subgenre')));
}

// 13. incompatible subgenre-primary combination (subgenre belongs to a different, unselected primary)
{
  // "trap" belongs only to hip-hop, not pop
  const r = validateGenreSelection(withGenre(['pop'], ['trap', 'city-pop']));
  check('[13] subgenre incompatible with all selected primaryGenres is invalid', r.ok === false);
  check('[13] issue names the incompatible subgenre', r.ok === false && r.issues.some((s) => s.includes('trap')));
}

// 14. duplicate primary genre is rejected
{
  const r = validateGenreSelection(withGenre(['pop', 'pop'], ['city-pop', 'dance-pop']));
  check('[14] duplicate primaryGenres value is invalid', r.ok === false);
}

// 15. duplicate subgenre is rejected
{
  const r = validateGenreSelection(withGenre(['pop'], ['city-pop', 'city-pop']));
  check('[15] duplicate subgenres value is invalid', r.ok === false);
}

// 16. too many primary genres (>3)
{
  const r = validateGenreSelection(withGenre(['pop', 'rock', 'jazz', 'hip-hop'], ['city-pop', 'indie-rock']));
  check('[16] more than 3 primaryGenres is invalid', r.ok === false);
}

// 17. too many subgenres (>6)
{
  const r = validateGenreSelection(withGenre(['pop'], ['city-pop', 'dance-pop', 'synth-pop', 'electropop', 'bedroom-pop', 'indie-pop', 'k-pop']));
  check('[17] more than 6 subgenres is invalid', r.ok === false);
}

// 18. free-text genre alias (never a real taxonomy id) is rejected, not silently normalized
{
  const r = validateGenreSelection(withGenre(['bright pop'], ['neon electronic']));
  check('[18] free-text genre alias is invalid, not normalized', r.ok === false);
}

// 19. missing genre arrays entirely
{
  const r = validateGenreSelection({ music_profile: { energy_score: 3, tempo: 'mid', valence: 'neutral' } });
  check('[19] missing primaryGenres/subgenres arrays is invalid', r.ok === false);
  check(
    '[19] issues mention both missing arrays',
    r.ok === false &&
      r.issues.some((s) => s.includes('primaryGenres')) &&
      r.issues.some((s) => s.includes('subgenres')),
  );
}

// 20. genre correction retry prompt behavior
{
  const genreResult = validateGenreSelection(withGenre(['not-a-real-genre'], ['trap']));
  const prompt = buildCorrectionPrompt([], genreResult.ok ? [] : genreResult.issues);
  check('[20] correction prompt mentions primaryGenres/subgenres', prompt.includes('primaryGenres') && prompt.includes('subgenres'));
  check('[20] correction prompt lists valid canonical primary ids', PRIMARY_GENRE_IDS.every((id) => prompt.includes(id)));
  check('[20] correction prompt lists valid canonical subgenre ids', SUBGENRE_IDS.every((id) => prompt.includes(id)));
  check('[20] correction prompt still works when only vector issues exist', buildCorrectionPrompt(['targetStats.brightness missing'], []).includes('targetStats'));
}

// 21. every catalog-relevant subgenre truly belongs to its declared primary (sanity check on the fixture helper itself)
{
  const allBelong = Object.entries(SUBGENRES_BY_PRIMARY).every(([primary, subs]) =>
    subs.every((sg) => SUBGENRE_IDS.includes(sg)) && PRIMARY_GENRE_IDS.includes(primary)
  );
  check('[21] SUBGENRES_BY_PRIMARY is internally consistent with the flat id lists', allBelong);
}

// ── Genre-selection adequacy (coverage) against the REAL 795-track catalog ─────────────────
console.log(`Loaded scoring.ts exports: FINAL_TRACK_COUNT=${FINAL_TRACK_COUNT}, verifiedCatalogTracks=${VERIFIED_CATALOG_POOL.length}`);

function withGenreCoverage(primaryGenres, subgenres) {
  return { music_profile: { energy_score: 3, tempo: 'mid', valence: 'neutral', primaryGenres, subgenres } };
}

// 22. ambient-experimental alone is rejected — real catalog has only 3 eligible tracks for it.
{
  const r = validateGenreSelectionWithCoverage(withGenreCoverage(['ambient-experimental'], ['ambient-electronic', 'downtempo']));
  check('[22] ambient-experimental alone is rejected for insufficient real-catalog coverage', r.ok === false);
  check('[22] rejection issue reports the real eligible count (3)', r.ok === false && r.issues.some((s) => s.includes('3 catalog track')));
}

// 23. electronic alone is rejected — real catalog has only 18 eligible tracks for it.
{
  const r = validateGenreSelectionWithCoverage(withGenreCoverage(['electronic'], ['house', 'deep-house']));
  check('[23] electronic alone is rejected for insufficient real-catalog coverage', r.ok === false);
  check('[23] rejection issue reports the real eligible count (18)', r.ok === false && r.issues.some((s) => s.includes('18 catalog track')));
}

// 24. a genuinely adequate real selection passes coverage (sanity check — not everything is rejected).
{
  const r = validateGenreSelectionWithCoverage(withGenreCoverage(['pop'], ['city-pop', 'dance-pop']));
  check('[24] a genuinely adequate real selection (pop + city-pop/dance-pop) passes coverage', r.ok === true);
  check('[24] eligibleCount meets FINAL_TRACK_COUNT', r.ok === true && r.eligibleCount >= FINAL_TRACK_COUNT, r.ok && r.eligibleCount);
  check(
    '[24] eligibleCount matches filterEligibleByGenre computed independently',
    r.ok === true && r.eligibleCount === filterEligibleByGenre(VERIFIED_CATALOG_POOL, ['pop'], ['city-pop', 'dance-pop']).length,
  );
}

// 25. a shape-invalid selection is still rejected by validateGenreSelectionWithCoverage (delegates to validateGenreSelection first).
{
  const r = validateGenreSelectionWithCoverage(withGenreCoverage(['not-a-real-genre'], ['city-pop']));
  check('[25] shape-invalid selection is rejected before any coverage check', r.ok === false && r.issues.some((s) => s.includes('not-a-real-genre')));
}

function fullGptPayload({ primaryGenres, subgenres }) {
  return {
    image_type: 'SCENE',
    confidence: 0.9,
    analysis: {
      location: 'street', time_of_day: 'night', season: 'winter',
      mood_keywords: ['calm'], sensory_impressions: ['cold'], cultural_context: '',
    },
    music_profile: { energy_score: 3, tempo: 'mid', valence: 'neutral', primaryGenres, subgenres },
    targetStats: validStats(),
    contextAffinity: validAffinity(),
    playlist: [{ rank: 1, title: 'Song', artist: 'Artist', reason: 'fits' }],
    playlist_concept: 'Test Concept',
    playlist_subtitle: 'A sufficiently long subtitle for testing purposes',
    primary_lane_id: TEST_LANE_ID,
  };
}

// 26. analyzeImage() end-to-end: an initially insufficient genre selection (electronic alone, 18
// eligible) is corrected on the ONE existing retry into an adequate selection (electronic+pop) —
// zero real network calls, fetch is fully mocked.
{
  const responses = [
    JSON.stringify(fullGptPayload({ primaryGenres: ['electronic'], subgenres: ['house', 'deep-house'] })),
    JSON.stringify(fullGptPayload({ primaryGenres: ['electronic', 'pop'], subgenres: ['house', 'city-pop'] })),
  ];
  const { analyzeImage } = loadGptModuleWithMockFetch(responses);
  const result = await analyzeImage('https://example.com/fake-signed-url.jpg');
  check('[26] initially-insufficient genre selection is corrected on the one retry', result.music_profile.primaryGenres.includes('pop'));
  check('[26] corrected response is returned successfully (no throw)', Array.isArray(result.music_profile.subgenres));
}

// 27. analyzeImage() end-to-end: initial selection insufficient AND the corrected retry response
// is ALSO insufficient (ambient-experimental alone) -> explicit SafeError, no silent fallback,
// no unrelated genre silently added, no second retry round attempted.
{
  const responses = [
    JSON.stringify(fullGptPayload({ primaryGenres: ['electronic'], subgenres: ['house', 'deep-house'] })),
    JSON.stringify(fullGptPayload({ primaryGenres: ['ambient-experimental'], subgenres: ['ambient-electronic', 'downtempo'] })),
  ];
  const { analyzeImage } = loadGptModuleWithMockFetch(responses);
  let threw = false;
  let errorName = null;
  try {
    await analyzeImage('https://example.com/fake-signed-url.jpg');
  } catch (err) {
    threw = true;
    errorName = err.name;
  }
  check('[27] still-insufficient corrected selection throws explicitly', threw === true);
  check('[27] thrown error is a SafeError (explicit failure, not a silent fallback)', errorName === 'SafeError');
}

console.log(`\nChecks run: ${totalChecks}, passed ${totalChecks - failures.length}, failed ${failures.length}`);
if (failures.length > 0) {
  console.error('\nFAILED:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nVERIFICATION PASSED');
