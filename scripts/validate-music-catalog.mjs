// Validates supabase/functions/_shared/musicCatalog.ts against the accepted
// Step 2 stat/affinity source (docs/music-catalog-stats-correction-draft.ts).
//
// Usage: node scripts/validate-music-catalog.mjs
//
// docs/music-catalog-stats-correction-draft.ts is a temporary migration input,
// read here only to prove exact equality with production. It is not imported
// by any runtime or build code.

import { readFileSync, readdirSync, statSync } from 'fs';
import ts from 'typescript';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PROD_PATH = path.join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const STEP2_PATH = path.join(ROOT, 'docs/music-catalog-stats-correction-draft.ts');
const EXPECTED_CANONICAL_COUNT = 673;
const STAT_KEYS = ['brightness','warmth','openness','motion','intimacy','socialEnergy','tension','nostalgia','playfulness','dreaminess','energy','groove','density','acousticness','electronicness','vocalPresence','climaxIntensity'];
const AFFINITY_KEYS = ['spring','summer','autumn','winter','morning','day','dusk','night','lateNight','clear','cloudy','rain','snow'];

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
// Load both sources
// ---------------------------------------------------------------------------
const prodMod = loadModule(PROD_PATH, ['ALL_SEED_TRACKS']);
const prodTracks = prodMod.ALL_SEED_TRACKS;
const step2Mod = loadModule(STEP2_PATH, ['MUSIC_CATALOG_STATS_CORRECTION_DRAFT']);
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
// 1. Exact expected canonical track count
// ---------------------------------------------------------------------------
if (step2Tracks.length !== EXPECTED_CANONICAL_COUNT) {
  fail(`step2 source has ${step2Tracks.length} tracks, expected exactly ${EXPECTED_CANONICAL_COUNT}`);
}
const canonicalIdsRepresentedInProd = new Set();

// ---------------------------------------------------------------------------
// 2. Per-track checks: id presence, uniqueness within lane, required fields,
//    finite/ranged numeric values, non-empty title/artist, stat equality
// ---------------------------------------------------------------------------
const seenIdsByLane = new Map(); // laneId -> Set<videoId>
const seenIdsGlobal = new Map(); // videoId -> [laneIds]

for (const t of prodTracks) {
  if (!t.title || !t.title.trim()) fail(`empty title for track with youtubeVideoId=${t.youtubeVideoId} in lane ${t.laneId}`);
  if (!t.artist || !t.artist.trim()) fail(`empty artist for track "${t.title}" in lane ${t.laneId}`);
  if (!t.youtubeVideoId) { fail(`missing youtubeVideoId for "${t.title}" in lane ${t.laneId}`); continue; }

  if (!seenIdsByLane.has(t.laneId)) seenIdsByLane.set(t.laneId, new Set());
  const laneSet = seenIdsByLane.get(t.laneId);
  if (laneSet.has(t.youtubeVideoId)) {
    fail(`duplicate youtubeVideoId "${t.youtubeVideoId}" within the same lane "${t.laneId}" ("${t.title}"/${t.artist})`);
  }
  laneSet.add(t.youtubeVideoId);

  if (!seenIdsGlobal.has(t.youtubeVideoId)) seenIdsGlobal.set(t.youtubeVideoId, []);
  seenIdsGlobal.get(t.youtubeVideoId).push(t.laneId);

  const canonical = step2ById.get(t.youtubeVideoId) || altToCanonical.get(t.youtubeVideoId);
  if (!canonical) {
    fail(`production track "${t.title}"/${t.artist} (${t.youtubeVideoId}, lane ${t.laneId}) has no matching step2 canonical track`);
    continue;
  }
  canonicalIdsRepresentedInProd.add(canonical.id);

  // required 30 dimensions present + finite + ranged
  if (!t.stats) { fail(`missing stats on production track ${t.youtubeVideoId} (lane ${t.laneId})`); }
  else {
    for (const k of STAT_KEYS) {
      const v = t.stats[k];
      if (typeof v !== 'number' || !Number.isFinite(v)) fail(`stats.${k} not finite for ${t.youtubeVideoId} (lane ${t.laneId}): ${v}`);
      else if (v < 0 || v > 100) fail(`stats.${k}=${v} out of range [0,100] for ${t.youtubeVideoId} (lane ${t.laneId})`);
    }
  }
  if (!t.affinity) { fail(`missing affinity on production track ${t.youtubeVideoId} (lane ${t.laneId})`); }
  else {
    for (const k of AFFINITY_KEYS) {
      const v = t.affinity[k];
      if (typeof v !== 'number' || !Number.isFinite(v)) fail(`affinity.${k} not finite for ${t.youtubeVideoId} (lane ${t.laneId}): ${v}`);
      else if (v < 0 || v > 100) fail(`affinity.${k}=${v} out of range [0,100] for ${t.youtubeVideoId} (lane ${t.laneId})`);
    }
  }
  if (typeof t.statConfidence !== 'number' || t.statConfidence < 0 || t.statConfidence > 1) {
    fail(`statConfidence out of range [0,1] for ${t.youtubeVideoId} (lane ${t.laneId}): ${t.statConfidence}`);
  }

  // exact equality with step2 canonical source, by track ID
  if (t.stats && !deepEqual(t.stats, canonical.stats)) fail(`stats mismatch vs step2 for ${t.youtubeVideoId} (canonical id ${canonical.id})`);
  if (t.affinity && !deepEqual(t.affinity, canonical.affinity)) fail(`affinity mismatch vs step2 for ${t.youtubeVideoId} (canonical id ${canonical.id})`);
  if (!deepEqual(t.alternateVideoIds || [], canonical.alternateVideoIds || [])) fail(`alternateVideoIds mismatch vs step2 for ${t.youtubeVideoId} (canonical id ${canonical.id})`);
  if (t.statConfidence !== canonical.review.statConfidence) fail(`statConfidence mismatch vs step2 for ${t.youtubeVideoId}: prod=${t.statConfidence} step2=${canonical.review.statConfidence}`);
  if (t.needsStatReview !== canonical.review.needsStatReview) fail(`needsStatReview mismatch vs step2 for ${t.youtubeVideoId}`);
  if (!deepEqual(t.statReviewNotes || [], canonical.review.notes || [])) fail(`statReviewNotes mismatch vs step2 for ${t.youtubeVideoId}`);
}

// cross-lane duplicate ids are allowed by design (same song curated into multiple lanes) — report as info/warning only
for (const [id, lanes] of seenIdsGlobal.entries()) {
  if (lanes.length > 1 && new Set(lanes).size === lanes.length) {
    warn(`youtubeVideoId "${id}" appears in ${lanes.length} different lanes (allowed cross-lane curation): ${lanes.join(', ')}`);
  }
}

if (canonicalIdsRepresentedInProd.size !== EXPECTED_CANONICAL_COUNT) {
  fail(`production represents ${canonicalIdsRepresentedInProd.size} distinct canonical step2 tracks, expected exactly ${EXPECTED_CANONICAL_COUNT}`);
}
for (const id of step2ById.keys()) {
  if (!canonicalIdsRepresentedInProd.has(id)) fail(`step2 canonical track ${id} is not represented anywhere in production`);
}

// ---------------------------------------------------------------------------
// 3. No production import from docs/
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

const runtimeDirs = ['supabase', 'src'].map(d => path.join(ROOT, d)).filter(d => { try { return statSync(d).isDirectory(); } catch { return false; } });
const runtimeFiles = runtimeDirs.flatMap(d => walk(d));
for (const f of runtimeFiles) {
  const content = readFileSync(f, 'utf-8');
  if (/from\s+["'](\.\.\/)*docs\//.test(content) || /require\(["'](\.\.\/)*docs\//.test(content)) {
    fail(`runtime file imports from docs/: ${path.relative(ROOT, f)}`);
  }
}

// ---------------------------------------------------------------------------
// 4. No second live production catalog source
// ---------------------------------------------------------------------------
for (const f of runtimeFiles) {
  if (f === PROD_PATH) continue;
  const content = readFileSync(f, 'utf-8');
  if (/export const ALL_SEED_TRACKS/.test(content) || /MUSIC_CATALOG_STATS_CORRECTION_DRAFT/.test(content)) {
    fail(`potential second production catalog source: ${path.relative(ROOT, f)}`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`Production physical track entries: ${prodTracks.length}`);
console.log(`Distinct canonical step2 tracks represented: ${canonicalIdsRepresentedInProd.size} (expected ${EXPECTED_CANONICAL_COUNT})`);
console.log(`Step2 canonical source track count: ${step2Tracks.length}`);
console.log(`Runtime files scanned for docs/ imports and second-catalog check: ${runtimeFiles.length}`);
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
