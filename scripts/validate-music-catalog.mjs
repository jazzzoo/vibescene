// Validates supabase/functions/_shared/musicCatalog.ts against the accepted
// Step 2 stat/affinity source (docs/music-catalog-stats-correction-draft.ts)
// and the accepted Step 3-1 genre source
// (docs/music-catalog-genre-classification-revised-draft.ts), and against
// the production taxonomy (supabase/functions/_shared/musicGenreTaxonomy.ts).
//
// Post-migration assertions (catalog-genre-reclassification):
//   - Exactly 673 physical entries (no cross-lane duplication)
//   - Unique primary IDs and unique primary video IDs
//   - alternateVideoIds globally unique, no collision with primary IDs
//   - No laneId field on any catalog track
//   - No lane-array constants in musicCatalog.ts source text
//   - No runtime consumer imports from docs/
//   - Exactly one production catalog source (MUSIC_CATALOG)
//
// Usage: node scripts/validate-music-catalog.mjs

import { readFileSync, readdirSync, statSync } from 'fs';
import ts from 'typescript';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PROD_PATH       = path.join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const TAXONOMY_PATH   = path.join(ROOT, 'supabase/functions/_shared/musicGenreTaxonomy.ts');
const STEP2_PATH      = path.join(ROOT, 'docs/music-catalog-stats-correction-draft.ts');
const GENRE_DRAFT_PATH = path.join(ROOT, 'docs/music-catalog-genre-classification-revised-draft.ts');

const EXPECTED_CANONICAL_COUNT = 673;
const STAT_KEYS    = ['brightness','warmth','openness','motion','intimacy','socialEnergy',
                      'tension','nostalgia','playfulness','dreaminess',
                      'energy','groove','density','acousticness','electronicness',
                      'vocalPresence','climaxIntensity'];
const AFFINITY_KEYS = ['spring','summer','autumn','winter',
                       'morning','day','dusk','night','lateNight',
                       'clear','cloudy','rain','snow'];

const failures = [];
const warnings = [];
function fail(msg) { failures.push(msg); }
function warn(msg) { warnings.push(msg); }

function loadModule(fullPath, exportNames) {
  const src = readFileSync(fullPath, 'utf-8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const sandbox = { module: { exports: {} }, exports: {}, require, console };
  sandbox.module.exports = sandbox.exports;
  vm.createContext(sandbox);
  vm.runInContext(out.outputText, sandbox, { filename: fullPath });
  const result = {};
  for (const name of exportNames) result[name] = sandbox.exports[name] ?? sandbox[name];
  return result;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === 'object') {
    const ak = Object.keys(a), bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    return ak.every(k => deepEqual(a[k], b[k]));
  }
  return false;
}

// ---------------------------------------------------------------------------
// Load production catalog — prefer MUSIC_CATALOG, fall back to ALL_SEED_TRACKS alias
// ---------------------------------------------------------------------------
const prodMod    = loadModule(PROD_PATH, ['MUSIC_CATALOG', 'ALL_SEED_TRACKS']);
const prodTracks = prodMod.MUSIC_CATALOG ?? prodMod.ALL_SEED_TRACKS;

if (!prodTracks || !Array.isArray(prodTracks)) {
  fail('MUSIC_CATALOG (or ALL_SEED_TRACKS alias) is not exported or not an array');
  console.log('Failures: 1\n  [FAIL] ' + failures[0]);
  process.exit(1);
}

const step2Mod    = loadModule(STEP2_PATH, ['MUSIC_CATALOG_STATS_CORRECTION_DRAFT']);
const step2Tracks = step2Mod.MUSIC_CATALOG_STATS_CORRECTION_DRAFT;

const step2ById = new Map(step2Tracks.map(t => [t.id, t]));
const altToCanonical = new Map();
for (const t of step2Tracks) {
  for (const alt of (t.alternateVideoIds || [])) {
    if (altToCanonical.has(alt)) fail(`alternateVideoId "${alt}" claimed by >1 step2 track (${altToCanonical.get(alt).id} and ${t.id})`);
    if (step2ById.has(alt)) fail(`alternateVideoId "${alt}" on track ${t.id} collides with another track's primary id`);
    altToCanonical.set(alt, t);
  }
}

// ---------------------------------------------------------------------------
// 0. Source text structural checks — no lane arrays, no laneId field
// ---------------------------------------------------------------------------
const prodSrc = readFileSync(PROD_PATH, 'utf-8');

// ALL_SEED_TRACKS is the allowed compat alias (= MUSIC_CATALOG); lane-specific arrays are not.
const LANE_ARRAY_PATTERN = /export const (?!ALL_SEED_TRACKS\b)[A-Z_]+_SEED_TRACKS\s*:/;
if (LANE_ARRAY_PATTERN.test(prodSrc)) {
  fail('musicCatalog.ts still contains lane-array constant(s) — migration incomplete');
}

// Check that no track object in the source has a laneId field
// (conservative text-level check — exact equality check happens per-track below)
if (/\blaneId\s*:/.test(prodSrc)) {
  fail('musicCatalog.ts source contains laneId field — must be removed from canonical schema');
}

// MUSIC_CATALOG export must exist
if (!/export const MUSIC_CATALOG\b/.test(prodSrc)) {
  fail('musicCatalog.ts does not export MUSIC_CATALOG');
}

// ---------------------------------------------------------------------------
// 1. Exact physical entry count (must equal canonical count — no duplicates)
// ---------------------------------------------------------------------------
console.log(`Production physical track entries: ${prodTracks.length}`);
if (prodTracks.length !== EXPECTED_CANONICAL_COUNT) {
  fail(`Production has ${prodTracks.length} physical entries, expected exactly ${EXPECTED_CANONICAL_COUNT} (no cross-lane duplication allowed after migration)`);
}

// ---------------------------------------------------------------------------
// 2. Per-track checks: uniqueness, required fields, no laneId, stat equality
// ---------------------------------------------------------------------------
const seenPrimaryIds   = new Map();   // youtubeVideoId -> track title
const seenAllAltIds    = new Set();   // alternateVideoIds globally
const canonicalIdsRepresentedInProd = new Set();

if (step2Tracks.length !== EXPECTED_CANONICAL_COUNT) {
  fail(`step2 source has ${step2Tracks.length} tracks, expected exactly ${EXPECTED_CANONICAL_COUNT}`);
}

for (const t of prodTracks) {
  // laneId must not exist on any track
  if ('laneId' in t && t.laneId !== undefined) {
    fail(`Track "${t.title}" (${t.youtubeVideoId}) has laneId field — must be removed`);
  }

  if (!t.title || !t.title.trim()) fail(`empty title for track with youtubeVideoId=${t.youtubeVideoId}`);
  if (!t.artist || !t.artist.trim()) fail(`empty artist for track "${t.title}"`);
  if (!t.youtubeVideoId) { fail(`missing youtubeVideoId for "${t.title}"`); continue; }

  // Primary ID uniqueness
  if (seenPrimaryIds.has(t.youtubeVideoId)) {
    fail(`duplicate primary youtubeVideoId "${t.youtubeVideoId}" ("${t.title}" and "${seenPrimaryIds.get(t.youtubeVideoId)}")`);
  }
  seenPrimaryIds.set(t.youtubeVideoId, t.title);

  // alternateVideoIds uniqueness (global, no collision with primary IDs)
  for (const alt of (t.alternateVideoIds || [])) {
    if (seenPrimaryIds.has(alt)) {
      fail(`alternateVideoId "${alt}" on "${t.title}" collides with an existing primary youtubeVideoId`);
    }
    if (seenAllAltIds.has(alt)) {
      fail(`alternateVideoId "${alt}" on "${t.title}" already claimed by another track`);
    }
    seenAllAltIds.add(alt);
  }

  const canonical = step2ById.get(t.youtubeVideoId) || altToCanonical.get(t.youtubeVideoId);
  if (!canonical) {
    fail(`production track "${t.title}"/${t.artist} (${t.youtubeVideoId}) has no matching step2 canonical track`);
    continue;
  }
  canonicalIdsRepresentedInProd.add(canonical.id);

  // required 30 dimensions present + finite + ranged
  if (!t.stats) { fail(`missing stats on production track ${t.youtubeVideoId}`); }
  else {
    for (const k of STAT_KEYS) {
      const v = t.stats[k];
      if (typeof v !== 'number' || !Number.isFinite(v)) fail(`stats.${k} not finite for ${t.youtubeVideoId}: ${v}`);
      else if (v < 0 || v > 100) fail(`stats.${k}=${v} out of range [0,100] for ${t.youtubeVideoId}`);
    }
  }
  if (!t.affinity) { fail(`missing affinity on production track ${t.youtubeVideoId}`); }
  else {
    for (const k of AFFINITY_KEYS) {
      const v = t.affinity[k];
      if (typeof v !== 'number' || !Number.isFinite(v)) fail(`affinity.${k} not finite for ${t.youtubeVideoId}: ${v}`);
      else if (v < 0 || v > 100) fail(`affinity.${k}=${v} out of range [0,100] for ${t.youtubeVideoId}`);
    }
  }
  if (typeof t.statConfidence !== 'number' || t.statConfidence < 0 || t.statConfidence > 1) {
    fail(`statConfidence out of range [0,1] for ${t.youtubeVideoId}: ${t.statConfidence}`);
  }

  // exact equality with step2 canonical source
  if (t.stats && !deepEqual(t.stats, canonical.stats)) fail(`stats mismatch vs step2 for ${t.youtubeVideoId} (canonical id ${canonical.id})`);
  if (t.affinity && !deepEqual(t.affinity, canonical.affinity)) fail(`affinity mismatch vs step2 for ${t.youtubeVideoId} (canonical id ${canonical.id})`);
  if (!deepEqual(t.alternateVideoIds || [], canonical.alternateVideoIds || [])) fail(`alternateVideoIds mismatch vs step2 for ${t.youtubeVideoId} (canonical id ${canonical.id})`);
  if (t.statConfidence !== canonical.review.statConfidence) fail(`statConfidence mismatch vs step2 for ${t.youtubeVideoId}: prod=${t.statConfidence} step2=${canonical.review.statConfidence}`);
  if (t.needsStatReview !== canonical.review.needsStatReview) fail(`needsStatReview mismatch vs step2 for ${t.youtubeVideoId}`);
  if (!deepEqual(t.statReviewNotes || [], canonical.review.notes || [])) fail(`statReviewNotes mismatch vs step2 for ${t.youtubeVideoId}`);
}

// Verify every step2 canonical track is represented
if (canonicalIdsRepresentedInProd.size !== EXPECTED_CANONICAL_COUNT) {
  fail(`production represents ${canonicalIdsRepresentedInProd.size} distinct canonical step2 tracks, expected exactly ${EXPECTED_CANONICAL_COUNT}`);
}
for (const id of step2ById.keys()) {
  if (!canonicalIdsRepresentedInProd.has(id)) fail(`step2 canonical track ${id} is not represented anywhere in production`);
}

// Post-migration: cross-lane duplicate warnings become failures
// (All primary IDs are now unique — validated above by seenPrimaryIds)

// ---------------------------------------------------------------------------
// 3. Genre classification (Step 3-1)
// ---------------------------------------------------------------------------
const taxonomyMod = loadModule(TAXONOMY_PATH, ['PRIMARY_GENRES', 'SUBGENRES_BY_PRIMARY', 'CROSSOVER_ADJACENCY']);
const validPrimaries = new Set(taxonomyMod.PRIMARY_GENRES.map(p => p.id));
const subgenreToPrimary = new Map();
for (const [primary, subs] of Object.entries(taxonomyMod.SUBGENRES_BY_PRIMARY)) {
  for (const s of subs) subgenreToPrimary.set(s, primary);
}

const genreMod    = loadModule(GENRE_DRAFT_PATH, ['MUSIC_CATALOG_GENRE_CLASSIFICATION_REVISED_DRAFT']);
const genreTracks = genreMod.MUSIC_CATALOG_GENRE_CLASSIFICATION_REVISED_DRAFT;
if (genreTracks.length !== EXPECTED_CANONICAL_COUNT) {
  fail(`genre draft source has ${genreTracks.length} tracks, expected exactly ${EXPECTED_CANONICAL_COUNT}`);
}
const genreById = new Map(genreTracks.map(t => [t.id, t]));

const canonicalIdsRepresentedForGenre = new Set();

for (const t of prodTracks) {
  if (!t.youtubeVideoId) continue;

  const step2Canonical  = step2ById.get(t.youtubeVideoId) || altToCanonical.get(t.youtubeVideoId);
  const genreCanonical  = step2Canonical ? genreById.get(step2Canonical.id) : undefined;

  const requiredGenreFields = ['primaryGenre','subgenre','crossoverGenres','genreConfidence','needsGenreReview','genreReason'];
  const missing = requiredGenreFields.filter(f => t[f] === undefined || t[f] === null);
  if (missing.length > 0) {
    fail(`production track ${t.youtubeVideoId} missing genre field(s): ${missing.join(', ')}`);
    continue;
  }

  if (!genreCanonical) {
    fail(`production track ${t.youtubeVideoId} has genre data but no matching genre-draft canonical track`);
    continue;
  }
  canonicalIdsRepresentedForGenre.add(genreCanonical.id);

  if (!validPrimaries.has(t.primaryGenre)) fail(`unknown primaryGenre "${t.primaryGenre}" for ${t.youtubeVideoId}`);
  if (!subgenreToPrimary.has(t.subgenre)) fail(`unknown subgenre "${t.subgenre}" for ${t.youtubeVideoId}`);
  else if (subgenreToPrimary.get(t.subgenre) !== t.primaryGenre) fail(`subgenre "${t.subgenre}" does not belong to primaryGenre "${t.primaryGenre}" for ${t.youtubeVideoId}`);

  const seenCrossover = new Set();
  for (const cg of t.crossoverGenres) {
    if (seenCrossover.has(cg)) fail(`duplicate crossoverGenres entry "${cg}" for ${t.youtubeVideoId}`);
    seenCrossover.add(cg);
    if (cg === t.subgenre) fail(`crossoverGenres entry "${cg}" duplicates own subgenre for ${t.youtubeVideoId}`);
    if (cg === t.primaryGenre) fail(`crossoverGenres entry "${cg}" duplicates own primaryGenre for ${t.youtubeVideoId}`);
    const cgPrimary = subgenreToPrimary.get(cg);
    if (!cgPrimary) { fail(`unknown crossoverGenres subgenre "${cg}" for ${t.youtubeVideoId}`); continue; }
    if (cgPrimary === t.primaryGenre) continue;
    const adjacency = taxonomyMod.CROSSOVER_ADJACENCY[t.primaryGenre] || [];
    if (!adjacency.includes(cgPrimary)) {
      warn(`crossoverGenres entry "${cg}" (primary "${cgPrimary}") is not listed as adjacent to primaryGenre "${t.primaryGenre}" for ${t.youtubeVideoId} — accepted Step 3-1 data as-is, not a defect introduced by this migration`);
    }
  }

  if (!Number.isInteger(t.genreConfidence) || t.genreConfidence < 0 || t.genreConfidence > 100) {
    fail(`genreConfidence must be an integer in [0,100] for ${t.youtubeVideoId}: ${t.genreConfidence}`);
  }
  if (t.needsGenreReview && (!t.genreReason || !t.genreReason.trim())) {
    fail(`needsGenreReview is true but genreReason is empty for ${t.youtubeVideoId}`);
  }

  const gc = genreCanonical.genreClassification;
  if (t.primaryGenre !== gc.primaryGenre) fail(`primaryGenre mismatch vs genre draft for ${t.youtubeVideoId}: prod=${t.primaryGenre} draft=${gc.primaryGenre}`);
  if (t.subgenre !== gc.subgenre) fail(`subgenre mismatch vs genre draft for ${t.youtubeVideoId}: prod=${t.subgenre} draft=${gc.subgenre}`);
  if (!deepEqual(t.crossoverGenres, gc.crossoverGenres)) fail(`crossoverGenres mismatch vs genre draft for ${t.youtubeVideoId}`);
  if (t.genreConfidence !== gc.genreConfidence) fail(`genreConfidence mismatch vs genre draft for ${t.youtubeVideoId}: prod=${t.genreConfidence} draft=${gc.genreConfidence}`);
  if (t.needsGenreReview !== gc.needsGenreReview) fail(`needsGenreReview mismatch vs genre draft for ${t.youtubeVideoId}`);
  if (t.genreReason !== gc.genreReason) fail(`genreReason mismatch vs genre draft for ${t.youtubeVideoId}`);
}

if (canonicalIdsRepresentedForGenre.size !== EXPECTED_CANONICAL_COUNT) {
  fail(`production represents ${canonicalIdsRepresentedForGenre.size} distinct canonical genre-classified tracks, expected exactly ${EXPECTED_CANONICAL_COUNT}`);
}
for (const id of genreById.keys()) {
  if (!canonicalIdsRepresentedForGenre.has(id)) fail(`genre-draft canonical track ${id} is not represented anywhere in production`);
}

// ---------------------------------------------------------------------------
// 4. No production import from docs/
// ---------------------------------------------------------------------------
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|mjs|jsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const runtimeDirs  = ['supabase', 'src'].map(d => path.join(ROOT, d)).filter(d => { try { return statSync(d).isDirectory(); } catch { return false; } });
const runtimeFiles = runtimeDirs.flatMap(d => walk(d));

for (const f of runtimeFiles) {
  const content = readFileSync(f, 'utf-8');
  if (/from\s+["'](\.\.\/)*docs\//.test(content) || /require\(["'](\.\.\/)*docs\//.test(content)) {
    fail(`runtime file imports from docs/: ${path.relative(ROOT, f)}`);
  }
}

// ---------------------------------------------------------------------------
// 5. Exactly one production catalog source; no stale lane-array constants elsewhere
// ---------------------------------------------------------------------------
for (const f of runtimeFiles) {
  const content = readFileSync(f, 'utf-8');
  if (f !== PROD_PATH && /export const MUSIC_CATALOG\b/.test(content)) {
    fail(`potential second production catalog source: ${path.relative(ROOT, f)}`);
  }
  // The old ALL_SEED_TRACKS pattern should not appear as a primary export in other files.
  // (It is kept as a compat alias inside PROD_PATH itself — excluded by f !== PROD_PATH.)
  if (f !== PROD_PATH && /export const ALL_SEED_TRACKS\b/.test(content)) {
    fail(`ALL_SEED_TRACKS exported outside musicCatalog.ts: ${path.relative(ROOT, f)}`);
  }
  if (f !== TAXONOMY_PATH && /export const SUBGENRES_BY_PRIMARY/.test(content)) {
    fail(`potential second production taxonomy source: ${path.relative(ROOT, f)}`);
  }
  // No lane-array _SEED_TRACKS constants in any runtime file
  if (LANE_ARRAY_PATTERN.test(content)) {
    fail(`lane-array constant found in runtime file (should be gone): ${path.relative(ROOT, f)}`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`Production physical track entries: ${prodTracks.length}`);
console.log(`Distinct canonical step2 tracks represented: ${canonicalIdsRepresentedInProd.size} (expected ${EXPECTED_CANONICAL_COUNT})`);
console.log(`Distinct canonical genre-classified tracks represented: ${canonicalIdsRepresentedForGenre.size} (expected ${EXPECTED_CANONICAL_COUNT})`);
console.log(`Step2 canonical source track count: ${step2Tracks.length}`);
console.log(`Genre draft source track count: ${genreTracks.length}`);
console.log(`Runtime files scanned for docs/ imports and second-source check: ${runtimeFiles.length}`);
console.log('');
console.log(`Warnings: ${warnings.length}`);
warnings.forEach(w => console.log('  [warn]', w));
console.log('');
console.log(`Failures: ${failures.length}`);
failures.forEach(f => console.log('  [FAIL]', f));
console.log('');

if (failures.length > 0) {
  console.log('VALIDATION FAILED');
  process.exit(1);
} else {
  console.log('VALIDATION PASSED');
  process.exit(0);
}
