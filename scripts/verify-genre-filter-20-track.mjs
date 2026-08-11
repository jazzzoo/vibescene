// Focused verification for Step 6: the genre-first catalog filter
// (supabase/functions/analyze-and-search/services/scoring.ts:filterEligibleByGenre)
// combined with the 20-track expansion (FINAL_TRACK_COUNT/CATALOG_CANDIDATE_POOL_SIZE
// in supabase/functions/analyze-and-search/index.ts) and the count-agnostic sequencer
// (supabase/functions/analyze-and-search/services/sequencing.ts).
//
// This does NOT call OpenAI, does NOT touch the DB, and does NOT invoke the Deno HTTP
// handler in index.ts (that requires the Deno/Supabase runtime) — it runs the real, pure
// scoring.ts/sequencing.ts/musicCatalog.ts/musicGenreTaxonomy.ts modules directly against
// 10 deterministic, declared-canonical genre fixtures (no GPT call, no fabricated genres
// from old free-text data), using the same transpile+vm technique as
// scripts/verify-music-scoring.mjs and scripts/verify-image-vector-parser.mjs.
//
// Usage: node scripts/verify-genre-filter-20-track.mjs

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
const SEQUENCING_PATH = path.join(ROOT, 'supabase/functions/analyze-and-search/services/sequencing.ts');
const CATALOG_PATH = path.join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const TAXONOMY_PATH = path.join(ROOT, 'supabase/functions/_shared/musicGenreTaxonomy.ts');
const CATALOG_CANDIDATE_POOL_SIZE = 30;

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
  filterEligibleByGenre,
  checkGenreSelectionCoverage,
  FINAL_TRACK_COUNT, // single source of truth (scoring.ts) — not redeclared locally
} = transpileToSandbox(SCORING_PATH);
const { sequenceCatalogTracks } = transpileToSandbox(SEQUENCING_PATH);
const { MUSIC_CATALOG, hasYoutubeVideoId } = transpileToSandbox(CATALOG_PATH);
const { PRIMARY_GENRES, SUBGENRES_BY_PRIMARY } = transpileToSandbox(TAXONOMY_PATH);

const verifiedPool = MUSIC_CATALOG.filter(hasYoutubeVideoId);

// ── Test harness (same style as verify-music-scoring.mjs) ──────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) passed += 1;
  else {
    failed += 1;
    failures.push({ name, detail });
  }
}

const uniformScene = {
  targetStats: {
    brightness: 50, warmth: 50, openness: 50, motion: 50, intimacy: 50, socialEnergy: 50,
    tension: 50, nostalgia: 50, playfulness: 50, dreaminess: 50,
    energy: 50, groove: 50, density: 50, acousticness: 50, electronicness: 50,
    vocalPresence: 50, climaxIntensity: 50,
  },
  contextAffinity: {
    spring: 50, summer: 50, autumn: 50, winter: 50,
    morning: 50, day: 50, dusk: 50, night: 50, lateNight: 50,
    clear: 50, cloudy: 50, rain: 50, snow: 50,
  },
};

// ── Phase 11: 10 targeted fixtures, using only real canonical ids from musicGenreTaxonomy.ts ──
// #3 and #8 substitute a real id for a requested-but-nonexistent one; documented per fixture.
const FIXTURES = [
  {
    name: 'dream-pop + shoegaze',
    primaryGenres: ['rock'],
    subgenres: ['dream-pop', 'shoegaze'],
  },
  {
    name: 'folk-acoustic + singer-songwriter',
    primaryGenres: ['folk-acoustic'],
    subgenres: ['singer-songwriter', 'indie-folk'],
  },
  {
    name: 'rock + indie-rock + alternative-rock',
    note: 'requested "folk-rock" is not a real taxonomy subgenre id — substituted with alternative-rock (both under rock)',
    primaryGenres: ['rock'],
    subgenres: ['indie-rock', 'alternative-rock'],
  },
  {
    name: 'rnb-soul + k-rnb + alt-rnb',
    primaryGenres: ['rnb-soul'],
    subgenres: ['k-rnb', 'alt-rnb'],
  },
  {
    name: 'hip-hop + jazz-rap + lofi-hiphop',
    primaryGenres: ['hip-hop'],
    subgenres: ['jazz-rap', 'lofi-hiphop'],
  },
  {
    name: 'jazz + jazz-hop + nu-jazz',
    primaryGenres: ['jazz'],
    subgenres: ['jazz-hop', 'nu-jazz'],
  },
  {
    name: 'pop + city-pop',
    primaryGenres: ['pop'],
    subgenres: ['city-pop'],
  },
  {
    name: 'pop + bright-feeling subgenres',
    note: 'requested "bright pop" is not a real taxonomy id — substituted with teen-pop + dance-pop (both real, bright-feeling pop subgenres)',
    primaryGenres: ['pop'],
    subgenres: ['teen-pop', 'dance-pop'],
  },
  {
    name: 'mixed K-R&B + hip-hop + jazz',
    primaryGenres: ['rnb-soul', 'hip-hop', 'jazz'],
    subgenres: ['k-rnb', 'jazz-rap', 'nu-jazz'],
  },
  {
    name: 'narrow-but-adequate single primary genre near minimum eligible count',
    note: 'jazz alone is the smallest single primaryGenre that still clears FINAL_TRACK_COUNT on its own (50 eligible) — the genuinely narrow ones (electronic=18, ambient-experimental=3) are NOT valid production fixtures anymore: see "Rejected selections" below, they are caught by gpt.ts\'s adequacy gate before ever reaching this pipeline',
    primaryGenres: ['jazz'],
    subgenres: ['jazz-hop', 'nu-jazz'],
  },
];

// ── Selections a real GPT response could produce (valid 1-3 primary / 2-6 subgenre shape) but
// that the Step 6 adequacy gate in gpt.ts must reject BEFORE they ever reach this filter/scoring/
// sequencing pipeline — these are intentionally NOT run through the full pipeline below (in
// production they never get that far); they are checked directly against checkGenreSelectionCoverage,
// mirroring exactly what gpt.ts's validateGenreSelectionWithCoverage does.
const REJECTED_SELECTIONS = [
  {
    name: 'ambient-experimental alone',
    primaryGenres: ['ambient-experimental'],
    subgenres: ['ambient-electronic', 'downtempo'],
    expectedEligibleCount: 3,
  },
  {
    name: 'electronic alone',
    primaryGenres: ['electronic'],
    subgenres: ['house', 'deep-house'],
    expectedEligibleCount: 18,
  },
];

const fixtureResults = [];

for (const fixture of FIXTURES) {
  const { name, primaryGenres, subgenres, note } = fixture;

  // Fixture sanity: every subgenre must belong to a selected primary, per the same rule GPT output must satisfy.
  const allSubgenresCompatible = subgenres.every((sg) => primaryGenres.some((pg) => SUBGENRES_BY_PRIMARY[pg].includes(sg)));
  check(`[${name}] fixture subgenres are compatible with fixture primaryGenres`, allSubgenresCompatible);

  const genreEligible = filterEligibleByGenre(verifiedPool, primaryGenres, subgenres);

  // Only selected genres are ever eligible; excluded genres never appear.
  const onlySelected = genreEligible.every(
    (t) => primaryGenres.includes(t.primaryGenre) || subgenres.includes(t.subgenre),
  );
  check(`[${name}] only selected primaryGenres/subgenres are eligible`, onlySelected);

  const otherPrimaries = PRIMARY_GENRES.map((g) => g.id).filter((id) => !primaryGenres.includes(id));
  const leakedOtherPrimary = genreEligible.some(
    (t) => otherPrimaries.includes(t.primaryGenre) && !subgenres.includes(t.subgenre),
  );
  check(`[${name}] no excluded primaryGenre leaks into the eligible pool`, !leakedOtherPrimary);

  const { ranked } = rankCatalogTracks(uniformScene, genreEligible);
  const candidatePool = selectTopScoredTracks(ranked, CATALOG_CANDIDATE_POOL_SIZE);
  check(`[${name}] candidate pool never exceeds CATALOG_CANDIDATE_POOL_SIZE (${CATALOG_CANDIDATE_POOL_SIZE})`, candidatePool.length <= CATALOG_CANDIDATE_POOL_SIZE);

  const sequencedA = sequenceCatalogTracks(candidatePool, FINAL_TRACK_COUNT);
  const sequencedB = sequenceCatalogTracks(candidatePool, FINAL_TRACK_COUNT);

  // Every fixture here is, by construction, a genuinely valid AND adequate GPT-reachable
  // selection (>= FINAL_TRACK_COUNT eligible tracks) — exactly what gpt.ts's Step 6 adequacy gate
  // guarantees before a request ever reaches this pipeline. So every fixture must produce EXACTLY
  // FINAL_TRACK_COUNT tracks: never fewer, never more.
  check(`[${name}] fixture is genuinely adequate (>= FINAL_TRACK_COUNT eligible)`, genreEligible.length >= FINAL_TRACK_COUNT, genreEligible.length);
  check(`[${name}] exactly FINAL_TRACK_COUNT (${FINAL_TRACK_COUNT}) final tracks — not fewer`, sequencedA.length >= FINAL_TRACK_COUNT, sequencedA.length);
  check(`[${name}] exactly FINAL_TRACK_COUNT (${FINAL_TRACK_COUNT}) final tracks — not more`, sequencedA.length <= FINAL_TRACK_COUNT, sequencedA.length);
  check(`[${name}] final track count equals FINAL_TRACK_COUNT exactly`, sequencedA.length === FINAL_TRACK_COUNT, sequencedA.length);

  // Deterministic ordering.
  const orderA = sequencedA.map((t) => t.youtubeVideoId);
  const orderB = sequencedB.map((t) => t.youtubeVideoId);
  check(`[${name}] sequencing is deterministic across repeated runs`, JSON.stringify(orderA) === JSON.stringify(orderB));

  // No duplicate youtubeVideoId — and exactly FINAL_TRACK_COUNT (20) UNIQUE ids, not just 20 entries.
  check(`[${name}] no duplicate youtubeVideoId in final sequence`, new Set(orderA).size === orderA.length);
  check(`[${name}] final sequence has exactly ${FINAL_TRACK_COUNT} unique youtubeVideoIds`, new Set(orderA).size === FINAL_TRACK_COUNT, new Set(orderA).size);

  // Selected genres preserved end-to-end (sequencing only reorders, never swaps in outside tracks) —
  // i.e. no genre-unfiltered track (outside the GPT-selected primaryGenres/subgenres) ever enters the result.
  const sequencedOnlySelected = sequencedA.every(
    (t) => primaryGenres.includes(t.primaryGenre) || subgenres.includes(t.subgenre),
  );
  check(`[${name}] final sequence contains only selected genres (no genre-unfiltered track entered the result)`, sequencedOnlySelected);

  fixtureResults.push({
    name,
    note: note ?? null,
    primaryGenres,
    subgenres,
    genreEligibleCount: genreEligible.length,
    candidatePoolCount: candidatePool.length,
    finalTrackCount: sequencedA.length,
    reachedFullTwentyTracks: sequencedA.length === FINAL_TRACK_COUNT,
    finalTracks: sequencedA.map((t) => ({
      artist: t.artist,
      title: t.title,
      youtubeVideoId: t.youtubeVideoId,
      primaryGenre: t.primaryGenre,
      subgenre: t.subgenre,
      energy: t.energy,
    })),
  });
}

// ── Rejected selections: real, valid-shape GPT-reachable selections that must be caught by
// gpt.ts's Step 6 adequacy gate (checkGenreSelectionCoverage) BEFORE reaching this pipeline ──────
const rejectedResults = [];
for (const rejection of REJECTED_SELECTIONS) {
  const { name, primaryGenres, subgenres, expectedEligibleCount } = rejection;
  const coverage = checkGenreSelectionCoverage(verifiedPool, primaryGenres, subgenres);
  check(`[rejected: ${name}] real eligibleCount matches expected (${expectedEligibleCount})`, coverage.eligibleCount === expectedEligibleCount, coverage.eligibleCount);
  check(`[rejected: ${name}] does not meet FINAL_TRACK_COUNT (correctly rejected)`, coverage.meetsMinimum === false);
  rejectedResults.push({ name, primaryGenres, subgenres, eligibleCount: coverage.eligibleCount, meetsMinimum: coverage.meetsMinimum });
}

// Combining the two narrow primaries together (still a valid <=3-primary shape) clears the minimum —
// demonstrating that broadening within an appropriate combination (not adding unrelated genres) is
// exactly the corrective path gpt.ts's prompt guidance and correction retry point GPT toward.
{
  const combined = checkGenreSelectionCoverage(verifiedPool, ['electronic', 'ambient-experimental'], ['house', 'deep-house']);
  check('[rejected: combined] electronic + ambient-experimental together clears FINAL_TRACK_COUNT', combined.meetsMinimum === true, combined.eligibleCount);
}

// ── No genre-score component / unchanged 30-dim weights (Phase 15 invariant, re-asserted here) ──
{
  const weightSum = SCORE_WEIGHTS.atmosphere + SCORE_WEIGHTS.desiredSound + SCORE_WEIGHTS.season + SCORE_WEIGHTS.time + SCORE_WEIGHTS.weather;
  check('[invariant] SCORE_WEIGHTS unchanged (atmosphere=0.30)', SCORE_WEIGHTS.atmosphere === 0.30);
  check('[invariant] SCORE_WEIGHTS unchanged (desiredSound=0.30)', SCORE_WEIGHTS.desiredSound === 0.30);
  check('[invariant] SCORE_WEIGHTS unchanged (season=0.15)', SCORE_WEIGHTS.season === 0.15);
  check('[invariant] SCORE_WEIGHTS unchanged (time=0.10)', SCORE_WEIGHTS.time === 0.10);
  check('[invariant] SCORE_WEIGHTS unchanged (weather=0.15)', SCORE_WEIGHTS.weather === 0.15);
  check('[invariant] weight sum is exactly 1', weightSum === 1, weightSum);

  const sample = verifiedPool.find((t) => t.primaryGenre === 'pop');
  const breakdown = scoreCatalogTrack(uniformScene, sample);
  const breakdownKeys = Object.keys(breakdown);
  check(
    '[invariant] ScoreBreakdown has no genre-score field',
    !breakdownKeys.some((k) => k.toLowerCase().includes('genre')),
    breakdownKeys,
  );
}

// ── Phase 1 (corrected) coverage computation — VALID GPT-output shapes only ─────────────────
// A real GPT response always has 1-3 primaryGenres AND 2-6 subgenres (every subgenre belonging to
// a selected primary) — validateGenreSelection enforces this before coverage is ever checked. So
// "primaryGenres=[] " (subgenre-alone) and "subgenres=[]" (primary-alone-with-no-subgenres) shapes
// are ARTIFICIAL: GPT can never actually produce them. They are kept below ONLY for audit-trail
// completeness (to show what was previously miscited as risk) — never cited as production risk.
//
// The only genuinely valid, GPT-reachable single-primary-family shape is: 1 primaryGenre + 2-6 of
// THAT SAME primary's own subgenres (since with only one primary selected, every subgenre must
// belong to it). Because those subgenres' tracks are already a subset of the primary's own tracks,
// this collapses to exactly the primary-alone count — verified via checkGenreSelectionCoverage
// using each primary's own subgenre list, not derived separately.
const validSinglePrimaryCoverage = PRIMARY_GENRES.map(({ id }) => {
  const ownSubgenres = SUBGENRES_BY_PRIMARY[id];
  const coverage = checkGenreSelectionCoverage(verifiedPool, [id], ownSubgenres);
  return { selection: id, count: coverage.eligibleCount, meetsMinimum: coverage.meetsMinimum };
});

const genuinelyInsufficientValidSelections = validSinglePrimaryCoverage.filter((r) => !r.meetsMinimum);

// ARTIFICIAL diagnostic-only selections — NOT valid GPT output shapes (no primaryGenres, or a lone
// primaryGenre with zero subgenres) — never cited as production risk. Kept only so this report can
// show, and correct, exactly what the earlier (pre-Phase-1-correction) audit had over-counted.
function eligibleCount(primaryGenres, subgenres) {
  return filterEligibleByGenre(verifiedPool, primaryGenres, subgenres).length;
}
const artificialSingleSubgenreAlone = [];
for (const { id } of PRIMARY_GENRES) {
  for (const sg of SUBGENRES_BY_PRIMARY[id]) {
    artificialSingleSubgenreAlone.push({ selection: sg, primary: id, count: eligibleCount([], [sg]) });
  }
}
const artificialCount = artificialSingleSubgenreAlone.length;
const artificialInsufficientCount = artificialSingleSubgenreAlone.filter((r) => r.count < 20).length;

check(
  '[coverage] exactly 2 genuinely valid single-primary selections are insufficient (electronic, ambient-experimental)',
  genuinelyInsufficientValidSelections.length === 2,
  genuinelyInsufficientValidSelections.map((r) => r.selection),
);
check(
  '[coverage] the 2 insufficient selections are exactly electronic and ambient-experimental',
  genuinelyInsufficientValidSelections.map((r) => r.selection).sort().join(',') === 'ambient-experimental,electronic',
  genuinelyInsufficientValidSelections.map((r) => r.selection),
);

// ── Report ──────────────────────────────────────────────────────────────────
console.log(`Fixtures run: ${FIXTURES.length}`);
console.log(`Checks run: ${passed + failed}, passed ${passed}, failed ${failed}`);

if (failed > 0) {
  console.error('\nFAILED:');
  for (const f of failures) console.error(`  - ${f.name}`, f.detail !== undefined ? JSON.stringify(f.detail) : '');
}

if (failed > 0) process.exit(1);
console.log('\nGENRE FILTER + 20-TRACK VERIFICATION PASSED');
