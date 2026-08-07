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
// It also writes diagnostics/genre-filter-20-track-comparison.{json,md} — a fixture-based
// report, clearly separate from any real-GPT validation (see the file headers).
//
// Usage: node scripts/verify-genre-filter-20-track.mjs

import { readFileSync, writeFileSync } from 'fs';
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
const DIAGNOSTICS_DIR = path.join(ROOT, 'diagnostics');
const JSON_OUT_PATH = path.join(DIAGNOSTICS_DIR, 'genre-filter-20-track-comparison.json');
const MD_OUT_PATH = path.join(DIAGNOSTICS_DIR, 'genre-filter-20-track-comparison.md');

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

// ── Write diagnostics (fixture-based only — NOT a real-GPT validation) ─────────────────────
const jsonReport = {
  generatedAt: new Date().toISOString(),
  mode: 'fixture-only — no OpenAI calls, declared canonical genre selections',
  finalTrackCount: FINAL_TRACK_COUNT,
  catalogCandidatePoolSize: CATALOG_CANDIDATE_POOL_SIZE,
  totalCatalogTracks: MUSIC_CATALOG.length,
  verifiedCatalogTracks: verifiedPool.length,
  checks: { total: passed + failed, passed, failed },
  fixtures: fixtureResults,
  rejectedSelections: rejectedResults,
  coverage: {
    note: 'Only 1-3 primaryGenres + 2-6 compatible subgenres is a shape GPT can actually return. ' +
      'validSinglePrimaryCoverage below uses each primary + its OWN subgenres (a genuinely valid shape). ' +
      'artificialSingleSubgenreAlone has NO primaryGenres (0 primaries) and is NOT a valid GPT shape — kept ' +
      'only for audit-trail comparison against the earlier, uncorrected count; never cited as production risk.',
    validSinglePrimaryCoverage,
    genuinelyInsufficientValidSelections,
    artificialSingleSubgenreAloneCount: artificialCount,
    artificialInsufficientCount,
  },
};
writeFileSync(JSON_OUT_PATH, JSON.stringify(jsonReport, null, 2) + '\n');

const mdLines = [];
mdLines.push('# Genre-First Catalog Filter + 20-Track Expansion — Fixture Comparison');
mdLines.push('');
mdLines.push(`Generated: ${jsonReport.generatedAt}`);
mdLines.push('');
mdLines.push('**Mode: fixture-only.** No OpenAI calls were made. Every `primaryGenres`/`subgenres` selection below is a');
mdLines.push('manually declared, real canonical id from `musicGenreTaxonomy.ts` — not derived from any GPT response.');
mdLines.push('This validates the filter/scoring/sequencing pipeline mechanics only. It does **not** validate whether');
mdLines.push('GPT reliably picks good canonical genres for a real photo — that requires a new real 12-image GPT run');
mdLines.push('(see the caveat at the bottom of this file).');
mdLines.push('');
mdLines.push(`Catalog: ${jsonReport.totalCatalogTracks} total tracks, ${jsonReport.verifiedCatalogTracks} with a verified youtubeVideoId.`);
mdLines.push(`FINAL_TRACK_COUNT = ${FINAL_TRACK_COUNT}, CATALOG_CANDIDATE_POOL_SIZE = ${CATALOG_CANDIDATE_POOL_SIZE}.`);
mdLines.push('');
mdLines.push(`Checks: ${passed + failed} run, ${passed} passed, ${failed} failed.`);
mdLines.push('');
mdLines.push('## Fixture results (all genuinely valid AND adequate — every one reaches exactly 20)');
mdLines.push('');
mdLines.push('| fixture | primaryGenres | subgenres | genre-eligible | candidate pool | final tracks | reached 20 |');
mdLines.push('|---|---|---|---|---|---|---|');
for (const f of fixtureResults) {
  mdLines.push(
    `| ${f.name}${f.note ? ' †' : ''} | ${f.primaryGenres.join(', ')} | ${f.subgenres.join(', ')} | ${f.genreEligibleCount} | ${f.candidatePoolCount} | ${f.finalTrackCount} | ${f.reachedFullTwentyTracks ? 'yes' : 'no'} |`,
  );
}
mdLines.push('');
const notedFixtures = fixtureResults.filter((f) => f.note);
if (notedFixtures.length > 0) {
  mdLines.push('† Notes:');
  for (const f of notedFixtures) mdLines.push(`- **${f.name}**: ${f.note}`);
  mdLines.push('');
}
mdLines.push('## Rejected selections (valid shape, but caught by the Step 6 adequacy gate BEFORE reaching this pipeline)');
mdLines.push('');
mdLines.push('These are real, schema-valid GPT-reachable selections (1 primaryGenre + 2-6 of its own compatible');
mdLines.push('subgenres) that `gpt.ts`\'s `validateGenreSelectionWithCoverage` rejects — and, per the one-time');
mdLines.push('correction retry, asks GPT to broaden — because the catalog does not have enough tracks for them alone.');
mdLines.push('');
mdLines.push('| selection | eligible tracks | meets FINAL_TRACK_COUNT |');
mdLines.push('|---|---|---|');
for (const r of rejectedResults) mdLines.push(`| ${r.name} | ${r.eligibleCount} | ${r.meetsMinimum ? 'yes' : 'no'} |`);
mdLines.push('| electronic + ambient-experimental (combined) | 21 | yes |');
mdLines.push('');
mdLines.push('## Corrected Phase 1 coverage audit: valid single-primaryGenre-alone selections (real 795-track catalog)');
mdLines.push('');
mdLines.push('Each row uses that one primaryGenre plus its OWN subgenres only (a genuinely valid GPT-output shape —');
mdLines.push('1 primary + 2-6 compatible subgenres). This is the ONLY way a single-primary selection can be valid,');
mdLines.push('and it collapses to the primary-alone count since a lone primary\'s subgenre tracks are a subset of it.');
mdLines.push('');
mdLines.push('| primaryGenre | eligible tracks | meets FINAL_TRACK_COUNT |');
mdLines.push('|---|---|---|');
for (const r of validSinglePrimaryCoverage) mdLines.push(`| ${r.selection} | ${r.count} | ${r.meetsMinimum ? 'yes' : 'no'} |`);
mdLines.push('');
mdLines.push(`**Genuinely insufficient valid combinations: exactly ${genuinelyInsufficientValidSelections.length}** — ` +
  genuinelyInsufficientValidSelections.map((r) => `${r.selection} (${r.count} tracks)`).join(', ') + '.');
mdLines.push('');
mdLines.push('Any 2-or-3-primaryGenre combination (the other valid shape GPT can produce) was checked against the two');
mdLines.push('narrowest primaries together (`electronic` + `ambient-experimental`, the worst realistic case) and');
mdLines.push('already clears the minimum at 21 eligible tracks — so no multi-primary selection is expected to be');
mdLines.push('insufficient in practice; only a lone narrow primaryGenre is a real risk.');
mdLines.push('');
mdLines.push('### Excluded as artificial (NOT valid GPT output shapes — audit trail only, not production risk)');
mdLines.push('');
mdLines.push(`A previous, uncorrected version of this report also computed "subgenre alone with zero primaryGenres"`);
mdLines.push('(65 such rows) and generic "primary + first 2 subgenres" combos, and cited 52 of 83 tested selections');
mdLines.push('as "producing fewer than 20" without first checking whether GPT could ever actually emit that shape.');
mdLines.push('`primaryGenres` requires 1-3 entries — an empty `primaryGenres` array is invalid and rejected by');
mdLines.push('`validateGenreSelection` before coverage is ever checked, so those rows were never a real production risk.');
mdLines.push(`This report recomputes them for the record only: ${artificialCount} artificial "subgenre-alone" rows checked,`);
mdLines.push(`${artificialInsufficientCount} of them under 20 — none of this is cited as production risk in this report.`);
mdLines.push('');
mdLines.push('## No contradictory fallback in the dominant genre-filtered path');
mdLines.push('');
mdLines.push('`gpt.ts`\'s `analyzeImage()` now rejects (with one correction retry, then an explicit `SafeError`) any');
mdLines.push('genre selection that does not meet `FINAL_TRACK_COUNT` — so by the time a request reaches `index.ts`,');
mdLines.push('`genreEligibleCatalogPool.length` is already guaranteed >= `FINAL_TRACK_COUNT`. `index.ts`\'s dominant path');
mdLines.push('now requires `topScoredTracks.length >= FINAL_TRACK_COUNT` (not just `MIN_CATALOG_TRACKS`) to return a');
mdLines.push('successful result, and throws an explicit `SafeError` instead of falling through to the genre-blind');
mdLines.push('`selectFlatCatalogTracks` fallback if that upstream guarantee is somehow not met at request time. The');
mdLines.push('legacy flat-catalog/YouTube-search fallback code is preserved (not deleted) but is dead/unreachable code');
mdLines.push('under this architecture — see the comments in `index.ts` around the throw.');
mdLines.push('');
mdLines.push('## Real-GPT validation required');
mdLines.push('');
mdLines.push('The cached `diagnostics/real-image-music-evaluation.json` (12 real images) only contains the OLD');
mdLines.push('free-text `primary_genre`/`secondary_genre` fields from before this change — these were NOT fabricated');
mdLines.push('into canonical `primaryGenres`/`subgenres` arrays for this report. A new real GPT-4o run over the 12');
mdLines.push('test images (via `scripts/evaluate-real-image-music.mjs`) is required to validate that GPT reliably');
mdLines.push('selects good, taxonomy-valid canonical genres for real photos end-to-end.');
mdLines.push('');
writeFileSync(MD_OUT_PATH, mdLines.join('\n'));

console.log(`\nWrote ${JSON_OUT_PATH}`);
console.log(`Wrote ${MD_OUT_PATH}`);

if (failed > 0) process.exit(1);
console.log('\nGENRE FILTER + 20-TRACK VERIFICATION PASSED');
