// Focused verification for Step 4-A: the targetStats/contextAffinity parser
// added to supabase/functions/analyze-and-search/services/gpt.ts.
//
// This does NOT call OpenAI and does NOT test recommendation scoring (not
// implemented yet). It loads gpt.ts's exported pure validation helpers with
// the same transpile+vm technique already used by
// scripts/validate-music-catalog.mjs, shimming gpt.ts's two relative
// imports ("../errors.ts", "./curationLanes.ts") so the file can be loaded
// standalone under plain Node without Deno.
//
// Usage: node scripts/verify-image-vector-parser.mjs

import { readFileSync } from 'fs';
import ts from 'typescript';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GPT_PATH = path.join(ROOT, 'supabase/functions/analyze-and-search/services/gpt.ts');

const TEST_LANE_ID = 'test-lane';

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
  throw new Error(`verify-image-vector-parser: unexpected require("${id}") — no shim registered`);
}

function loadGptModule() {
  const src = readFileSync(GPT_PATH, 'utf-8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const sandbox = {
    module: { exports: {} },
    exports: {},
    require: fakeRequire,
    console,
    // analyzeImage() reads Deno.env.get(...) but this script never calls analyzeImage
    // (no network calls in a focused parser test) — stub only so module load doesn't crash
    // if anything at module scope ever references it.
    Deno: { env: { get: () => undefined } },
  };
  sandbox.module.exports = sandbox.exports;
  vm.createContext(sandbox);
  vm.runInContext(out.outputText, sandbox, { filename: GPT_PATH });
  return sandbox.exports;
}

const {
  validateVectorObject,
  TARGET_STATS_FIELDS,
  CONTEXT_AFFINITY_FIELDS,
  parseGptJson,
  applyCompatibilityValidation,
} = loadGptModule();

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

// 7. existing compatibility fields still parse
{
  const payload = {
    image_type: 'SCENE',
    confidence: 0.9,
    analysis: {
      location: 'street', time_of_day: 'night', season: 'winter',
      mood_keywords: ['calm'], sensory_impressions: ['cold'], cultural_context: '',
    },
    music_profile: { energy_score: 3, tempo: 'mid', valence: 'neutral', primary_genre: 'pop', secondary_genre: '' },
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
      parsed.music_profile.primary_genre === 'pop',
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

console.log(`\nChecks run: ${totalChecks}, passed ${totalChecks - failures.length}, failed ${failures.length}`);
if (failures.length > 0) {
  console.error('\nFAILED:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nVERIFICATION PASSED');
