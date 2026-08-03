// Validates supabase/functions/_shared/musicCatalog.ts against
// the production taxonomy (supabase/functions/_shared/musicGenreTaxonomy.ts).
//
// Production is the source of truth. These assertions protect structural
// integrity going forward — they do not compare against docs/ draft files.
//
// Assertions:
//   - Exactly 673 physical entries (no cross-lane duplication)
//   - Unique primary IDs and unique primary video IDs
//   - alternateVideoIds globally unique, no collision with primary IDs
//   - No laneId field on any catalog track
//   - No lane-array constants in musicCatalog.ts source text
//   - All required stat/affinity fields present and in [0,100]
//   - All required genre fields present
//   - All genre fields resolve in production taxonomy
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

const PROD_PATH     = path.join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const TAXONOMY_PATH = path.join(ROOT, 'supabase/functions/_shared/musicGenreTaxonomy.ts');

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

// ---------------------------------------------------------------------------
// 0. Source text structural checks — no lane arrays, no laneId field
// ---------------------------------------------------------------------------
const prodSrc = readFileSync(PROD_PATH, 'utf-8');

// ALL_SEED_TRACKS is the allowed compat alias (= MUSIC_CATALOG); lane-specific arrays are not.
const LANE_ARRAY_PATTERN = /export const (?!ALL_SEED_TRACKS\b)[A-Z_]+_SEED_TRACKS\s*:/;
if (LANE_ARRAY_PATTERN.test(prodSrc)) {
  fail('musicCatalog.ts still contains lane-array constant(s) — migration incomplete');
}

if (/\blaneId\s*:/.test(prodSrc)) {
  fail('musicCatalog.ts source contains laneId field — must be removed from canonical schema');
}

if (!/export const MUSIC_CATALOG\b/.test(prodSrc)) {
  fail('musicCatalog.ts does not export MUSIC_CATALOG');
}

// ---------------------------------------------------------------------------
// 1. Exact physical entry count
// ---------------------------------------------------------------------------
if (prodTracks.length !== EXPECTED_CANONICAL_COUNT) {
  fail(`Production has ${prodTracks.length} physical entries, expected exactly ${EXPECTED_CANONICAL_COUNT} (no cross-lane duplication allowed)`);
}

// ---------------------------------------------------------------------------
// 2. Per-track checks: uniqueness, required fields, no laneId, stat ranges
// ---------------------------------------------------------------------------
const seenPrimaryIds = new Map();  // youtubeVideoId -> track title
const seenAllAltIds  = new Set();  // alternateVideoIds globally

for (const t of prodTracks) {
  if ('laneId' in t && t.laneId !== undefined) {
    fail(`Track "${t.title}" (${t.youtubeVideoId}) has laneId field — must be removed`);
  }

  if (!t.title || !t.title.trim()) fail(`empty title for track with youtubeVideoId=${t.youtubeVideoId}`);
  if (!t.artist || !t.artist.trim()) fail(`empty artist for track "${t.title}"`);
  if (!t.youtubeVideoId) { fail(`missing youtubeVideoId for "${t.title}"`); continue; }

  if (seenPrimaryIds.has(t.youtubeVideoId)) {
    fail(`duplicate primary youtubeVideoId "${t.youtubeVideoId}" ("${t.title}" and "${seenPrimaryIds.get(t.youtubeVideoId)}")`);
  }
  seenPrimaryIds.set(t.youtubeVideoId, t.title);

  for (const alt of (t.alternateVideoIds || [])) {
    if (seenPrimaryIds.has(alt)) {
      fail(`alternateVideoId "${alt}" on "${t.title}" collides with an existing primary youtubeVideoId`);
    }
    if (seenAllAltIds.has(alt)) {
      fail(`alternateVideoId "${alt}" on "${t.title}" already claimed by another track`);
    }
    seenAllAltIds.add(alt);
  }

  if (!t.stats) {
    fail(`missing stats on production track ${t.youtubeVideoId}`);
  } else {
    for (const k of STAT_KEYS) {
      const v = t.stats[k];
      if (typeof v !== 'number' || !Number.isFinite(v)) fail(`stats.${k} not finite for ${t.youtubeVideoId}: ${v}`);
      else if (v < 0 || v > 100) fail(`stats.${k}=${v} out of range [0,100] for ${t.youtubeVideoId}`);
    }
  }

  if (!t.affinity) {
    fail(`missing affinity on production track ${t.youtubeVideoId}`);
  } else {
    for (const k of AFFINITY_KEYS) {
      const v = t.affinity[k];
      if (typeof v !== 'number' || !Number.isFinite(v)) fail(`affinity.${k} not finite for ${t.youtubeVideoId}: ${v}`);
      else if (v < 0 || v > 100) fail(`affinity.${k}=${v} out of range [0,100] for ${t.youtubeVideoId}`);
    }
  }

  if (typeof t.statConfidence !== 'number' || t.statConfidence < 0 || t.statConfidence > 1) {
    fail(`statConfidence out of range [0,1] for ${t.youtubeVideoId}: ${t.statConfidence}`);
  }
}

// ---------------------------------------------------------------------------
// 3. Genre fields — presence + taxonomy resolution
// ---------------------------------------------------------------------------
const taxonomyMod = loadModule(TAXONOMY_PATH, ['PRIMARY_GENRES', 'SUBGENRES_BY_PRIMARY', 'CROSSOVER_ADJACENCY']);
const validPrimaries = new Set(taxonomyMod.PRIMARY_GENRES.map(p => p.id));
const subgenreToPrimary = new Map();
for (const [primary, subs] of Object.entries(taxonomyMod.SUBGENRES_BY_PRIMARY)) {
  for (const s of subs) subgenreToPrimary.set(s, primary);
}

for (const t of prodTracks) {
  if (!t.youtubeVideoId) continue;

  const requiredGenreFields = ['primaryGenre','subgenre','crossoverGenres','genreConfidence','needsGenreReview','genreReason'];
  const missing = requiredGenreFields.filter(f => t[f] === undefined || t[f] === null);
  if (missing.length > 0) {
    fail(`production track ${t.youtubeVideoId} missing genre field(s): ${missing.join(', ')}`);
    continue;
  }

  if (!validPrimaries.has(t.primaryGenre)) fail(`unknown primaryGenre "${t.primaryGenre}" for ${t.youtubeVideoId}`);
  if (!subgenreToPrimary.has(t.subgenre)) fail(`unknown subgenre "${t.subgenre}" for ${t.youtubeVideoId}`);
  else if (subgenreToPrimary.get(t.subgenre) !== t.primaryGenre) {
    fail(`subgenre "${t.subgenre}" does not belong to primaryGenre "${t.primaryGenre}" for ${t.youtubeVideoId}`);
  }

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
      warn(`crossoverGenres "${cg}" (primary "${cgPrimary}") not adjacent to primaryGenre "${t.primaryGenre}" for ${t.youtubeVideoId} — accepted Step 3-1 data`);
    }
  }

  if (!Number.isInteger(t.genreConfidence) || t.genreConfidence < 0 || t.genreConfidence > 100) {
    fail(`genreConfidence must be an integer in [0,100] for ${t.youtubeVideoId}: ${t.genreConfidence}`);
  }
  if (t.needsGenreReview && (!t.genreReason || !t.genreReason.trim())) {
    fail(`needsGenreReview is true but genreReason is empty for ${t.youtubeVideoId}`);
  }
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

const runtimeDirs  = ['supabase', 'src'].map(d => path.join(ROOT, d)).filter(d => {
  try { return statSync(d).isDirectory(); } catch { return false; }
});
const runtimeFiles = runtimeDirs.flatMap(d => walk(d));

for (const f of runtimeFiles) {
  const content = readFileSync(f, 'utf-8');
  if (/from\s+["'](\.\.\/)*docs\//.test(content) || /require\(["'](\.\.\/)*docs\//.test(content)) {
    fail(`runtime file imports from docs/: ${path.relative(ROOT, f)}`);
  }
}

// ---------------------------------------------------------------------------
// 5. Exactly one production catalog source; no stale lane-array constants
// ---------------------------------------------------------------------------
for (const f of runtimeFiles) {
  const content = readFileSync(f, 'utf-8');
  if (f !== PROD_PATH && /export const MUSIC_CATALOG\b/.test(content)) {
    fail(`potential second production catalog source: ${path.relative(ROOT, f)}`);
  }
  if (f !== PROD_PATH && /export const ALL_SEED_TRACKS\b/.test(content)) {
    fail(`ALL_SEED_TRACKS exported outside musicCatalog.ts: ${path.relative(ROOT, f)}`);
  }
  if (f !== TAXONOMY_PATH && /export const SUBGENRES_BY_PRIMARY/.test(content)) {
    fail(`potential second production taxonomy source: ${path.relative(ROOT, f)}`);
  }
  if (LANE_ARRAY_PATTERN.test(content)) {
    fail(`lane-array constant found in runtime file (should be gone): ${path.relative(ROOT, f)}`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`Production physical track entries: ${prodTracks.length} (expected ${EXPECTED_CANONICAL_COUNT})`);
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
