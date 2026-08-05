// Step 5-C: read-only real-image evaluation of the active production pipeline:
//   test image -> (remote) analyzeImage() via the temporary evaluate-real-image Edge Function
//   -> rankCatalogTracks() -> selectTopScoredTracks() -> sequenceCatalogTracks()
//
// This script calls the ACTUAL production implementations. It does not duplicate the system
// prompt, does not reimplement scoring/sequencing, and does not substitute a simplified analyzer.
//
// The image-analysis step no longer runs analyzeImage() in-process — it POSTs each image to the
// temporary, evaluation-only Supabase Edge Function at supabase/functions/evaluate-real-image/,
// which imports and calls the real, unmodified analyzeImage() from
// supabase/functions/analyze-and-search/services/gpt.ts (same SYSTEM_PROMPT, model, image detail
// setting, parsing, compatibility validation, 17+13 vector validation/normalization, and one-time
// correction retry). That function performs no DB access, no Supabase Storage access, and no
// playlist/track/history writes — see its own file for the full explanation.
//
// Scoring (rankCatalogTracks/selectTopScoredTracks) and sequencing (sequenceCatalogTracks) still
// run locally against the real supabase/functions/analyze-and-search/services/scoring.ts,
// supabase/functions/analyze-and-search/services/sequencing.ts, and
// supabase/functions/_shared/musicCatalog.ts, loaded with the same transpile+vm technique already
// used by scripts/verify-music-scoring.mjs and scripts/diagnose-music-scoring.mjs (those three
// files have zero runtime imports of their own once type-only imports are erased, so no shim or
// recursive resolution is needed for them).
//
// No DB access, no Supabase Storage, no frontend code is imported or invoked locally. Images are
// processed sequentially (not concurrently) to keep request counts traceable and avoid burst traffic.
//
// COST NOTE: each POST to the temporary function triggers a real, billed OpenAI GPT-4o Vision call
// server-side (12 images x 1 request, plus at most one additional request per image if the
// production one-time vector-correction retry triggers -> 12 to 24 requests total, observable only
// in aggregate — the temporary function's response does not report a per-image attempt count).
//
// Required environment variables (read from process.env, never hardcoded):
//   SUPABASE_PROJECT_URL          e.g. https://<project-ref>.supabase.co
//   VIBESCENE_EVALUATION_TOKEN    the temporary evaluation-token secret (never logged/printed)
//
// Usage: SUPABASE_PROJECT_URL=... VIBESCENE_EVALUATION_TOKEN=... node scripts/evaluate-real-image-music.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import crypto from 'crypto';
import ts from 'typescript';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { execSync } from 'child_process';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const GPT_PATH = path.join(ROOT, 'supabase/functions/analyze-and-search/services/gpt.ts'); // read-only, for MODEL_NAME extraction below
const SCORING_PATH = path.join(ROOT, 'supabase/functions/analyze-and-search/services/scoring.ts');
const CATALOG_PATH = path.join(ROOT, 'supabase/functions/_shared/musicCatalog.ts');
const SEQUENCING_PATH = path.join(ROOT, 'supabase/functions/analyze-and-search/services/sequencing.ts');
const IMAGES_DIR = path.join(ROOT, 'test-assets/stat-manual-validation');
const DIAGNOSTICS_DIR = path.join(ROOT, 'diagnostics');
const JSON_OUT_PATH = path.join(DIAGNOSTICS_DIR, 'real-image-music-evaluation.json');
const MD_OUT_PATH = path.join(DIAGNOSTICS_DIR, 'real-image-music-evaluation.md');

const EXPECTED_IMAGE_COUNT = 12;
const CATALOG_CANDIDATE_POOL_SIZE = 16;
const FINAL_TRACK_COUNT = 10;

// ── Generic math/util helpers (shared style with diagnose-music-scoring.mjs) ────────
function round2(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return x;
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
function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Minimal pure-buffer JPEG dimension reader (SOFn marker scan) — no image library/dependency.
function getJpegDimensions(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const segLength = buffer.readUInt16BE(offset + 2);
    offset += 2 + segLength;
  }
  return null;
}

// ── PHASE 6: simple TS module loader for scoring/catalog/sequencing — none of these three
// files have any runtime (non-type-only) imports once transpiled, so no require-shimming or
// Deno/fetch injection is needed for them (verified in Step 5-A/5-B). gpt.ts itself is no longer
// loaded in-process at all — image analysis now goes through the deployed temporary function. ──
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
let sequencingModule;
try {
  scoringModule = transpileToSandbox(SCORING_PATH);
  catalogModule = transpileToSandbox(CATALOG_PATH);
  sequencingModule = transpileToSandbox(SEQUENCING_PATH);
} catch (err) {
  console.error('[evaluate-real-image-music] FATAL: failed to load production modules', err);
  process.exit(1);
}

const { rankCatalogTracks, selectTopScoredTracks, SCORE_WEIGHTS } = scoringModule;
const { MUSIC_CATALOG } = catalogModule;
const { sequenceCatalogTracks } = sequencingModule;

if (typeof rankCatalogTracks !== 'function' || typeof selectTopScoredTracks !== 'function' || !SCORE_WEIGHTS) {
  console.error('[evaluate-real-image-music] FATAL: scoring.ts did not export the expected functions/constants.');
  process.exit(1);
}
if (typeof sequenceCatalogTracks !== 'function') {
  console.error('[evaluate-real-image-music] FATAL: sequencing.ts did not export sequenceCatalogTracks.');
  process.exit(1);
}
if (!Array.isArray(MUSIC_CATALOG) || MUSIC_CATALOG.length === 0) {
  console.error('[evaluate-real-image-music] FATAL: musicCatalog.ts did not export a non-empty MUSIC_CATALOG.');
  process.exit(1);
}

const CATALOG_COUNT = MUSIC_CATALOG.length;
const verifiedPool = MUSIC_CATALOG.filter(
  (t) => typeof t.youtubeVideoId === 'string' && t.youtubeVideoId.trim().length > 0,
);

// ── PHASE 2: inventory + pre-run hashes ──────────────────────────────────────────────
let imageFiles;
try {
  imageFiles = readdirSync(IMAGES_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
} catch {
  console.error(`[evaluate-real-image-music] FATAL: source directory not found: ${IMAGES_DIR}`);
  process.exit(1);
}
if (imageFiles.length !== EXPECTED_IMAGE_COUNT) {
  console.error(
    `[evaluate-real-image-music] FATAL: expected exactly ${EXPECTED_IMAGE_COUNT} images, found ${imageFiles.length} in ${IMAGES_DIR}`,
  );
  process.exit(1);
}

const preRunInventory = imageFiles.map((filename) => {
  const fullPath = path.join(IMAGES_DIR, filename);
  const buffer = readFileSync(fullPath);
  const dims = getJpegDimensions(buffer);
  if (!dims) {
    console.error(`[evaluate-real-image-music] FATAL: could not decode dimensions for ${filename}`);
    process.exit(1);
  }
  return {
    filename,
    extension: path.extname(filename),
    byteSize: buffer.length,
    width: dims.width,
    height: dims.height,
    orientation: dims.width === dims.height ? 'square' : dims.width > dims.height ? 'landscape' : 'portrait',
    decodable: true,
    sha256: sha256(buffer),
  };
});

console.log(`Source image inventory (${preRunInventory.length} files):`);
for (const img of preRunInventory) {
  console.log(`  ${img.filename} | ${img.byteSize}B | ${img.width}x${img.height} | ${img.orientation} | sha256=${img.sha256.slice(0, 16)}...`);
}

// ── PHASE 4: API key / cost-safety gate ──────────────────────────────────────────────
let repositoryHead = 'unknown';
try {
  repositoryHead = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
} catch {
  // non-fatal: reporting field only
}

const modelSourceText = readFileSync(GPT_PATH, 'utf-8');
const modelMatch = modelSourceText.match(/model:\s*"([^"]+)"/);
const MODEL_NAME = modelMatch ? modelMatch[1] : 'unknown (could not read model name from gpt.ts)';

console.log('\n=== Pre-flight cost-safety summary ===');
console.log(`Image count: ${preRunInventory.length}`);
console.log(`Expected minimum requests: ${preRunInventory.length}`);
console.log(`Expected maximum requests: ${preRunInventory.length * 2} (one retry per image only if the production vector validator triggers it)`);
console.log(`Model: ${MODEL_NAME}`);
console.log('Confirmation: no DB write will occur (db.ts/index.ts/Supabase client are not imported locally or by the temporary evaluate-real-image function).');
console.log('Confirmation: source images will not be uploaded or modified (read-only in-memory base64 data URLs only, sent to the temporary evaluation function, never to Storage).');

const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL ? process.env.SUPABASE_PROJECT_URL.replace(/\/+$/, '') : null;
const VIBESCENE_EVALUATION_TOKEN = process.env.VIBESCENE_EVALUATION_TOKEN || null;
const EVALUATE_ENDPOINT = SUPABASE_PROJECT_URL ? `${SUPABASE_PROJECT_URL}/functions/v1/evaluate-real-image` : null;

if (!SUPABASE_PROJECT_URL || !VIBESCENE_EVALUATION_TOKEN) {
  console.error('\n[evaluate-real-image-music] STOPPING BEFORE EXECUTION: required environment variables are missing.');
  if (!SUPABASE_PROJECT_URL) console.error('  Missing SUPABASE_PROJECT_URL (e.g. https://<project-ref>.supabase.co).');
  if (!VIBESCENE_EVALUATION_TOKEN) console.error('  Missing VIBESCENE_EVALUATION_TOKEN (the temporary evaluation-token secret).');
  console.error('Set both in the environment this script runs in — never hardcode them in source. No request was made. No diagnostics output file was written.');
  process.exit(1);
}

async function callRemoteAnalyzeImage(filename, imageDataUrl) {
  const response = await fetch(EVALUATE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-vibescene-evaluation-token': VIBESCENE_EVALUATION_TOKEN,
    },
    body: JSON.stringify({ filename, imageDataUrl }),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`이미지 분석 결과를 받지 못했습니다. (remote endpoint returned non-JSON, status ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(payload && payload.error ? payload.error : `remote evaluation request failed with status ${response.status}`);
  }
  return payload;
}

// ── Error classification (no credentials, no stack traces ever included) ────────────
const KNOWN_SAFE_ERROR_CATEGORIES = [
  { match: '이미지 분석 서비스가 설정되지 않았습니다.', category: 'missing_api_key_or_config' },
  { match: '이미지 분석 중 오류가 발생했습니다.', category: 'openai_request_failed' },
  { match: '이미지 분석 결과를 받지 못했습니다.', category: 'openai_empty_response' },
  { match: '이미지 분석 결과를 처리하지 못했습니다.', category: 'json_parse_or_lane_invalid' },
  { match: '이미지의 확장 사운드 분석 값을 확인하지 못했습니다', category: 'vector_validation_failed_after_retry' },
];
function classifyError(err) {
  const message = err instanceof Error ? err.message : String(err);
  const found = KNOWN_SAFE_ERROR_CATEGORIES.find((c) => message.includes(c.match));
  return { category: found ? found.category : 'unknown_error', message };
}

// ── PHASE 5/6: per-image processing (sequential, real analyzeImage + real scoring/sequencing) ──
async function processImage(filename, reusedGptResult) {
  const fullPath = path.join(IMAGES_DIR, filename);
  const buffer = readFileSync(fullPath);
  const dims = getJpegDimensions(buffer);
  const dataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;

  const startedAtIso = new Date().toISOString();
  const startedAtMs = Date.now();
  let gptResult = null;
  let errorInfo = null;
  if (reusedGptResult) {
    gptResult = reusedGptResult;
  } else {
    try {
      gptResult = await callRemoteAnalyzeImage(filename, dataUrl);
    } catch (err) {
      errorInfo = classifyError(err);
    }
  }
  const durationMs = reusedGptResult ? 0 : Date.now() - startedAtMs;
  // Per-image request-attempt count (1 vs 2 on internal retry) is not observable through the
  // remote evaluation endpoint's response schema (Phase 4 deliberately limits the response to
  // parsed GptResponse fields plus an optional `normalized` flag) — only the aggregate call count
  // across all images (12-24) is knowable, from the temporary function's own OpenAI usage.
  const requestAttemptCount = null;
  const normalizationOccurred = gptResult && typeof gptResult.normalized === 'boolean' ? gptResult.normalized : null;

  const base = {
    filename,
    sha256: sha256(buffer),
    width: dims ? dims.width : null,
    height: dims ? dims.height : null,
    analysisStartedAt: startedAtIso,
    analysisDurationMs: durationMs,
    requestAttemptCount,
    vectorNormalizationOccurred: normalizationOccurred,
  };

  if (errorInfo) {
    return { ...base, success: false, error: errorInfo };
  }

  const scene = { targetStats: gptResult.targetStats, contextAffinity: gptResult.contextAffinity };
  const { ranked } = rankCatalogTracks(scene, verifiedPool);
  const top16Ranked = ranked.slice(0, 16);
  const top16Tracks = selectTopScoredTracks(ranked, CATALOG_CANDIDATE_POOL_SIZE);
  const final10Tracks = sequenceCatalogTracks(top16Tracks, FINAL_TRACK_COUNT);

  const top16Rows = top16Ranked.map((entry, idx) => ({
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

  const scoredTop10Ids = top16Rows.slice(0, 10).map((r) => r.youtubeVideoId);
  const final10Rows = final10Tracks.map((track, idx) => {
    const originalScoredRank = top16Rows.findIndex((r) => r.youtubeVideoId === track.youtubeVideoId) + 1;
    const scoreEntry = top16Rows.find((r) => r.youtubeVideoId === track.youtubeVideoId);
    return {
      finalPosition: idx + 1,
      originalScoredRank: originalScoredRank || null,
      artist: track.artist,
      title: track.title,
      youtubeVideoId: track.youtubeVideoId,
      primaryGenre: track.primaryGenre,
      subgenre: track.subgenre,
      totalScore: scoreEntry ? scoreEntry.totalScore : null,
      coarseEnergy: track.energy,
    };
  });

  // ── PHASE 11: sequencing observation (comparison only — sequencing.ts is not modified/called differently) ──
  const finalIds = final10Rows.map((r) => r.youtubeVideoId);
  const everyScoredTop10Present = scoredTop10Ids.every((id) => finalIds.includes(id));
  const introducedOutsideScoredTop10 = finalIds.some((id) => !scoredTop10Ids.includes(id));
  const positionsChanged = final10Rows.map((r) => ({
    youtubeVideoId: r.youtubeVideoId,
    scoredPosition: scoredTop10Ids.indexOf(r.youtubeVideoId) + 1 || null,
    finalPosition: r.finalPosition,
    changed: scoredTop10Ids.indexOf(r.youtubeVideoId) + 1 !== r.finalPosition,
  }));
  const energyRank = { low: 1, medium: 2, high: 3 };
  const energyProgression = final10Rows.map((r) => r.coarseEnergy);
  let largestAdjacentEnergyJump = 0;
  for (let i = 1; i < final10Rows.length; i += 1) {
    const jump = Math.abs((energyRank[final10Rows[i].coarseEnergy] || 0) - (energyRank[final10Rows[i - 1].coarseEnergy] || 0));
    if (jump > largestAdjacentEnergyJump) largestAdjacentEnergyJump = jump;
  }
  const sameArtistAdjacency = [];
  const sameSubgenreAdjacency = [];
  for (let i = 1; i < final10Rows.length; i += 1) {
    if (normalizeName(final10Rows[i].artist) === normalizeName(final10Rows[i - 1].artist)) {
      sameArtistAdjacency.push({ positionA: i, positionB: i + 1 });
    }
    if (final10Rows[i].subgenre === final10Rows[i - 1].subgenre) {
      sameSubgenreAdjacency.push({ positionA: i, positionB: i + 1 });
    }
  }

  const totalScores = top16Rows.map((r) => r.totalScore);
  const summary = {
    topScore: totalScores[0],
    rank10Score: totalScores[9],
    rank16Score: totalScores[15],
    scoreSpread: totalScores[0] - totalScores[15],
    meanTop16Score: mean(totalScores),
    medianTop16Score: median(totalScores),
    stdDevTop16Score: stddevPopulation(totalScores),
    meanRank1to10: mean(totalScores.slice(0, 10)),
    meanRank11to16: mean(totalScores.slice(10, 16)),
  };
  summary.rankTierGap = summary.meanRank1to10 - summary.meanRank11to16;

  const componentInfluence = {
    meanAtmosphereScore: mean(top16Rows.map((r) => r.atmosphereScore)),
    meanDesiredSoundScore: mean(top16Rows.map((r) => r.desiredSoundScore)),
    meanSeasonScore: mean(top16Rows.map((r) => r.seasonScore)),
    meanTimeScore: mean(top16Rows.map((r) => r.timeScore)),
    meanWeatherScore: mean(top16Rows.map((r) => r.weatherScore)),
  };
  componentInfluence.atmosphereContribution = componentInfluence.meanAtmosphereScore * SCORE_WEIGHTS.atmosphere;
  componentInfluence.desiredSoundContribution = componentInfluence.meanDesiredSoundScore * SCORE_WEIGHTS.desiredSound;
  componentInfluence.seasonContribution = componentInfluence.meanSeasonScore * SCORE_WEIGHTS.season;
  componentInfluence.timeContribution = componentInfluence.meanTimeScore * SCORE_WEIGHTS.time;
  componentInfluence.weatherContribution = componentInfluence.meanWeatherScore * SCORE_WEIGHTS.weather;

  const artistCountsTop16 = countBy(top16Rows, (r) => normalizeName(r.artist));
  const artistCountsFinal10 = countBy(final10Rows, (r) => normalizeName(r.artist));
  const genreCounts = countBy(top16Rows, (r) => r.primaryGenre);
  const subgenreCounts = countBy(top16Rows, (r) => r.subgenre);

  return {
    ...base,
    success: true,
    gptResult: {
      image_type: gptResult.image_type,
      confidence: gptResult.confidence,
      analysis: gptResult.analysis,
      music_profile: gptResult.music_profile,
      playlist_concept: gptResult.playlist_concept,
      playlist_subtitle: gptResult.playlist_subtitle,
      primary_lane_id: gptResult.primary_lane_id,
      targetStats: gptResult.targetStats,
      contextAffinity: gptResult.contextAffinity,
    },
    top16: top16Rows,
    final10: final10Rows,
    summary,
    componentInfluence,
    genreArtistObservation: {
      uniqueArtistsTop16: artistCountsTop16.size,
      uniquePrimaryGenresTop16: genreCounts.size,
      uniqueSubgenresTop16: subgenreCounts.size,
      artistsWithMoreThanOneTop16: [...artistCountsTop16.entries()].filter(([, c]) => c > 1).map(([artist, count]) => ({ artist, count })),
      artistsWithMoreThanOneFinal10: [...artistCountsFinal10.entries()].filter(([, c]) => c > 1).map(([artist, count]) => ({ artist, count })),
      maximumTracksByOnePrimaryGenre: Math.max(...genreCounts.values()),
      maximumTracksByOneSubgenre: Math.max(...subgenreCounts.values()),
      maximumTracksByOneArtist: Math.max(...artistCountsTop16.values()),
      primaryGenreDistribution: topEntries(genreCounts, genreCounts.size),
      subgenreDistribution: topEntries(subgenreCounts, subgenreCounts.size),
    },
    sequencingObservation: {
      everyScoredTop10Present,
      introducedOutsideScoredTop10,
      positionsChanged,
      energyProgression,
      largestAdjacentEnergyJump,
      sameArtistAdjacency,
      sameSubgenreAdjacency,
    },
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Empirically, unpaced sequential calls tripped the linked OpenAI account's rate limit (fast
// ~300-900ms failures interleaved with successful ~12-17s calls) even though the account has a
// positive credit balance. This fixed inter-image pause (no extra requests, no retry-on-failure —
// still exactly 1 request per image, 2 only via gpt.ts's own vector-correction retry) keeps the
// sequential loop comfortably under a low requests-per-minute ceiling. Configurable for reruns.
const INTER_REQUEST_DELAY_MS = process.env.EVAL_REQUEST_DELAY_MS ? Number(process.env.EVAL_REQUEST_DELAY_MS) : 20000;

// Resume support: if a prior run already wrote diagnostics/real-image-music-evaluation.json,
// reuse its successful analyzeImage() results (matched by filename + sha256, so a changed image
// is never silently reused) instead of re-spending on images that already succeeded — only the
// images missing/failed last time make a new remote request this run.
function loadPreviousGptResults() {
  const map = new Map();
  try {
    const prev = JSON.parse(readFileSync(JSON_OUT_PATH, 'utf-8'));
    for (const r of prev.perImageResults || []) {
      if (r.filename && r.sha256 && r.gptResult) map.set(`${r.filename}::${r.sha256}`, r.gptResult);
    }
  } catch {
    // no prior run, or unreadable — process everything fresh
  }
  return map;
}

async function main() {
  const previousGptResults = loadPreviousGptResults();
  const results = [];
  let lastRealCallAt = null;
  for (let i = 0; i < preRunInventory.length; i += 1) {
    const filename = preRunInventory[i].filename;
    const reused = previousGptResults.get(`${filename}::${preRunInventory[i].sha256}`) || null;
    console.log(`\n[${i + 1}/${preRunInventory.length}] Analyzing ${filename} ...${reused ? ' (reusing prior successful result — no new request)' : ''}`);
    if (!reused && lastRealCallAt !== null) {
      const elapsed = Date.now() - lastRealCallAt;
      const remaining = INTER_REQUEST_DELAY_MS - elapsed;
      if (remaining > 0) {
        console.log(`  (pausing ${remaining}ms to respect the account's rate limit)`);
        // eslint-disable-next-line no-await-in-loop
        await sleep(remaining);
      }
    }
    // eslint-disable-next-line no-await-in-loop
    const result = await processImage(filename, reused);
    if (!reused) lastRealCallAt = Date.now();
    if (result.success) {
      console.log(`  OK in ${result.analysisDurationMs}ms, normalized=${result.vectorNormalizationOccurred}, lane=${result.gptResult.primary_lane_id}`);
    } else {
      console.log(`  FAILED: ${result.error.category} (${result.analysisDurationMs}ms)`);
    }
    results.push(result);
  }

  const successResults = results.filter((r) => r.success);
  const failedResults = results.filter((r) => !r.success);
  // Per-image attempt count isn't observable through the remote endpoint's response (see
  // callRemoteAnalyzeImage/processImage) — only the aggregate expected range is reportable.
  const totalRequests = null;

  console.log(`\n=== Execution summary ===`);
  console.log(`Images processed: ${results.length}/${preRunInventory.length}`);
  console.log(`Succeeded: ${successResults.length} | Failed: ${failedResults.length}`);
  console.log(`Requests: not individually observable via the remote endpoint; expected range ${preRunInventory.length}-${preRunInventory.length * 2} hosted OpenAI calls (min = 1 per image, max = 2 per image if every image triggered the one-time retry).`);
  if (failedResults.length > 0) {
    console.log('Run is INCOMPLETE — not all 12 images completed successfully:');
    for (const f of failedResults) console.log(`  ${f.filename}: ${f.error.category}`);
  }

  if (successResults.length === 0) {
    console.error('[evaluate-real-image-music] FATAL: no image completed successfully — refusing to write a diagnostics report with no real data.');
    process.exit(1);
  }

  // ── PHASE 7: vector-dimension statistics across successful images ──────────────────
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
  const DESIRED_SOUND_FIELDS = STATS_FIELDS.slice(10);
  const SEASON_FIELDS = AFFINITY_FIELDS.slice(0, 4);
  const TIME_FIELDS = AFFINITY_FIELDS.slice(4, 9);
  const WEATHER_FIELDS = AFFINITY_FIELDS.slice(9);

  function dimensionValues(field, isAffinity) {
    return successResults.map((r) => (isAffinity ? r.gptResult.contextAffinity[field] : r.gptResult.targetStats[field]));
  }
  const vectorDimensionStatistics = {};
  for (const field of STATS_FIELDS) {
    const values = dimensionValues(field, false);
    vectorDimensionStatistics[field] = {
      minimum: Math.min(...values),
      maximum: Math.max(...values),
      mean: mean(values),
      median: median(values),
      standardDeviation: stddevPopulation(values),
      uniqueValueCount: new Set(values).size,
      countBelow20: values.filter((v) => v < 20).length,
      countAbove80: values.filter((v) => v > 80).length,
      countBetween40And60Inclusive: values.filter((v) => v >= 40 && v <= 60).length,
    };
  }
  for (const field of AFFINITY_FIELDS) {
    const values = dimensionValues(field, true);
    vectorDimensionStatistics[field] = {
      minimum: Math.min(...values),
      maximum: Math.max(...values),
      mean: mean(values),
      median: median(values),
      standardDeviation: stddevPopulation(values),
      uniqueValueCount: new Set(values).size,
      countBelow20: values.filter((v) => v < 20).length,
      countAbove80: values.filter((v) => v > 80).length,
      countBetween40And60Inclusive: values.filter((v) => v >= 40 && v <= 60).length,
    };
  }

  function fullVector(r) {
    return { ...r.gptResult.targetStats, ...r.gptResult.contextAffinity };
  }
  function meanAbsDistance(vecA, vecB, fields) {
    return mean(fields.map((f) => Math.abs(vecA[f] - vecB[f])));
  }
  const pairwiseVectorDistances = [];
  for (let i = 0; i < successResults.length; i += 1) {
    for (let j = i + 1; j < successResults.length; j += 1) {
      const A = successResults[i];
      const B = successResults[j];
      const vecA = fullVector(A);
      const vecB = fullVector(B);
      pairwiseVectorDistances.push({
        imageA: A.filename,
        imageB: B.filename,
        meanAbsDistanceAll30: meanAbsDistance(vecA, vecB, [...STATS_FIELDS, ...AFFINITY_FIELDS]),
        atmosphereDistance: meanAbsDistance(vecA, vecB, ATMOSPHERE_FIELDS),
        desiredSoundDistance: meanAbsDistance(vecA, vecB, DESIRED_SOUND_FIELDS),
        seasonDistance: meanAbsDistance(vecA, vecB, SEASON_FIELDS),
        timeDistance: meanAbsDistance(vecA, vecB, TIME_FIELDS),
        weatherDistance: meanAbsDistance(vecA, vecB, WEATHER_FIELDS),
      });
    }
  }
  const sortedByDistanceAsc = [...pairwiseVectorDistances].sort((a, b) => a.meanAbsDistanceAll30 - b.meanAbsDistanceAll30);
  const mostSimilarPairs = sortedByDistanceAsc.slice(0, 5);
  const mostDifferentPairs = [...pairwiseVectorDistances].sort((a, b) => b.meanAbsDistanceAll30 - a.meanAbsDistanceAll30).slice(0, 5);

  // ── PHASE 8: pairwise recommendation overlap ────────────────────────────────────────
  function pairSortKey(p) { return `${p.imageA}__${p.imageB}`; }
  const pairwiseRecommendationOverlap = [];
  for (let i = 0; i < successResults.length; i += 1) {
    for (let j = i + 1; j < successResults.length; j += 1) {
      const A = successResults[i];
      const B = successResults[j];
      const idsTop16A = new Set(A.top16.map((r) => r.youtubeVideoId));
      const idsTop16B = new Set(B.top16.map((r) => r.youtubeVideoId));
      const idsTop10ScoredA = new Set(A.top16.slice(0, 10).map((r) => r.youtubeVideoId));
      const idsTop10ScoredB = new Set(B.top16.slice(0, 10).map((r) => r.youtubeVideoId));
      const idsFinal10A = new Set(A.final10.map((r) => r.youtubeVideoId));
      const idsFinal10B = new Set(B.final10.map((r) => r.youtubeVideoId));

      pairwiseRecommendationOverlap.push({
        imageA: A.filename,
        imageB: B.filename,
        top16OverlapCount: [...idsTop16A].filter((id) => idsTop16B.has(id)).length,
        top16Jaccard: jaccard(idsTop16A, idsTop16B),
        top10ScoredOverlapCount: [...idsTop10ScoredA].filter((id) => idsTop10ScoredB.has(id)).length,
        final10OverlapCount: [...idsFinal10A].filter((id) => idsFinal10B.has(id)).length,
        sameNumberOneScoredTrack: A.top16[0].youtubeVideoId === B.top16[0].youtubeVideoId,
      });
    }
  }

  function buildMatrix(list, keyField, metric, selfValue) {
    const keys = successResults.map((r) => r.filename);
    const matrix = {};
    for (const k of keys) {
      matrix[k] = {};
      matrix[k][k] = selfValue;
    }
    for (const p of list) {
      matrix[p[keyField + 'A'] || p.imageA][p.imageB] = p[metric];
      matrix[p.imageB][p.imageA] = p[metric];
    }
    return matrix;
  }
  const vectorDistanceMatrix = buildMatrix(pairwiseVectorDistances, 'image', 'meanAbsDistanceAll30', 0);
  const top16OverlapMatrix = buildMatrix(pairwiseRecommendationOverlap, 'image', 'top16OverlapCount', 16);
  const top10ScoredOverlapMatrix = buildMatrix(pairwiseRecommendationOverlap, 'image', 'top10ScoredOverlapCount', 10);
  const final10OverlapMatrix = buildMatrix(pairwiseRecommendationOverlap, 'image', 'final10OverlapCount', 10);

  const sortedByOverlapDesc = [...pairwiseRecommendationOverlap].sort(
    (a, b) => b.top16OverlapCount - a.top16OverlapCount || pairSortKey(a).localeCompare(pairSortKey(b)),
  );
  const highestOverlapPairs = sortedByOverlapDesc.slice(0, 5);
  const lowestOverlapPairs = [...pairwiseRecommendationOverlap]
    .sort((a, b) => a.top16OverlapCount - b.top16OverlapCount || pairSortKey(a).localeCompare(pairSortKey(b)))
    .slice(0, 5);

  // ── PHASE 8 (cont.): global recurrence across images ────────────────────────────────
  const trackAppearanceMap = new Map();
  for (const r of successResults) {
    for (const row of r.top16) {
      if (!trackAppearanceMap.has(row.youtubeVideoId)) {
        trackAppearanceMap.set(row.youtubeVideoId, { artist: row.artist, title: row.title, youtubeVideoId: row.youtubeVideoId, appearances: [] });
      }
      trackAppearanceMap.get(row.youtubeVideoId).appearances.push({ image: r.filename, rank: row.rank, totalScore: row.totalScore });
    }
  }
  const globalTrackRecurrence = [...trackAppearanceMap.values()]
    .map((t) => ({
      artist: t.artist, title: t.title, youtubeVideoId: t.youtubeVideoId,
      imageCount: t.appearances.length, images: t.appearances.map((a) => a.image),
      averageRank: mean(t.appearances.map((a) => a.rank)), averageTotalScore: mean(t.appearances.map((a) => a.totalScore)),
    }))
    .filter((t) => t.imageCount > 1)
    .sort((a, b) => b.imageCount - a.imageCount || b.averageTotalScore - a.averageTotalScore || a.artist.localeCompare(b.artist));

  const artistAppearanceMap = new Map();
  for (const r of successResults) {
    const artistsInThisImage = new Set(r.top16.map((row) => normalizeName(row.artist)));
    for (const a of artistsInThisImage) {
      if (!artistAppearanceMap.has(a)) artistAppearanceMap.set(a, { artist: a, images: [] });
      artistAppearanceMap.get(a).images.push(r.filename);
    }
  }
  const globalArtistRecurrence = [...artistAppearanceMap.values()]
    .map((a) => ({ artist: a.artist, imageCount: a.images.length, images: a.images }))
    .filter((a) => a.imageCount > 1)
    .sort((a, b) => b.imageCount - a.imageCount || a.artist.localeCompare(b.artist));

  const genrePresenceByImage = successResults.map((r) => new Set(r.top16.map((row) => row.primaryGenre)));
  const allGenresSeen = new Set(successResults.flatMap((r) => r.top16.map((row) => row.primaryGenre)));
  const genrePresenceCounts = [...allGenresSeen]
    .map((g) => ({ primaryGenre: g, imageCount: genrePresenceByImage.filter((set) => set.has(g)).length }))
    .sort((a, b) => b.imageCount - a.imageCount || a.primaryGenre.localeCompare(b.primaryGenre));

  const subgenrePresenceByImage = successResults.map((r) => new Set(r.top16.map((row) => row.subgenre)));
  const allSubgenresSeen = new Set(successResults.flatMap((r) => r.top16.map((row) => row.subgenre)));
  const subgenrePresenceCounts = [...allSubgenresSeen]
    .map((g) => ({ subgenre: g, imageCount: subgenrePresenceByImage.filter((set) => set.has(g)).length }))
    .sort((a, b) => b.imageCount - a.imageCount || a.subgenre.localeCompare(b.subgenre));

  // ── PHASE 10: genre/artist concentration classification ────────────────────────────
  const perImageDominantGenre = successResults.map((r) => ({ image: r.filename, genre: r.genreArtistObservation.primaryGenreDistribution[0][0], count: r.genreArtistObservation.primaryGenreDistribution[0][1] }));
  const dominantGenreImageCounts = countBy(perImageDominantGenre, (d) => d.genre);
  const [topDominantGenre, topDominantGenreImageCount] = topEntries(dominantGenreImageCounts, 1)[0] || ['none', 0];
  const imagesDominatedByTopGenre = perImageDominantGenre.filter((d) => d.genre === topDominantGenre).map((d) => d.image);
  function classifyConcentration(dominantCount, total) {
    if (dominantCount >= Math.ceil(total * 0.6)) return 'cross-image recurring concentration';
    if (dominantCount >= 2) return 'scene-specific concentration';
    return 'no obvious concentration';
  }
  const primaryGenreConcentrationClassification = classifyConcentration(topDominantGenreImageCount, successResults.length);

  const perImageDominantSubgenre = successResults.map((r) => ({ image: r.filename, subgenre: r.genreArtistObservation.subgenreDistribution[0][0], count: r.genreArtistObservation.subgenreDistribution[0][1] }));
  const dominantSubgenreImageCounts = countBy(perImageDominantSubgenre, (d) => d.subgenre);
  const [topDominantSubgenre, topDominantSubgenreImageCount] = topEntries(dominantSubgenreImageCounts, 1)[0] || ['none', 0];
  const imagesDominatedByTopSubgenre = perImageDominantSubgenre.filter((d) => d.subgenre === topDominantSubgenre).map((d) => d.image);
  const subgenreConcentrationClassification = classifyConcentration(topDominantSubgenreImageCount, successResults.length);

  const maxArtistCountAnyTop16 = Math.max(...successResults.map((r) => r.genreArtistObservation.maximumTracksByOneArtist));
  const maxArtistImageRecurrence = globalArtistRecurrence.length > 0 ? globalArtistRecurrence[0].imageCount : 0;
  const imagesWithArtistRepeatIn16 = successResults.filter((r) => r.genreArtistObservation.maximumTracksByOneArtist >= 2).length;
  function classifyArtistRepetition() {
    if (maxArtistImageRecurrence >= Math.ceil(successResults.length * 0.5)) return 'cross-image dominance';
    if (maxArtistCountAnyTop16 <= 1) return 'none';
    if (maxArtistCountAnyTop16 === 2 && imagesWithArtistRepeatIn16 <= 2) return 'occasional and scene-plausible';
    return 'frequent within an image';
  }
  const artistRepetitionClassification = classifyArtistRepetition();

  // ── PHASE 9: midpoint-collapse assessment (uses vectorDimensionStatistics) ─────────
  const highMidpointDims = STATS_FIELDS.concat(AFFINITY_FIELDS).filter((f) => vectorDimensionStatistics[f].countBetween40And60Inclusive >= Math.ceil(successResults.length * 0.75));
  const lowUniqueDims = STATS_FIELDS.concat(AFFINITY_FIELDS).filter((f) => vectorDimensionStatistics[f].uniqueValueCount <= 2 && successResults.length > 2);

  // ── PHASE 15: summary classification ────────────────────────────────────────────────
  const meanTop16JaccardAcrossImages = mean(pairwiseRecommendationOverlap.map((p) => p.top16Jaccard));
  const meanRankTierGap = mean(successResults.map((r) => r.summary.rankTierGap));
  const meanScoreSpread = mean(successResults.map((r) => r.summary.scoreSpread));
  const sequencingViolations = successResults.filter((r) => !r.sequencingObservation.everyScoredTop10Present || r.sequencingObservation.introducedOutsideScoredTop10);

  function capLabel(strong) {
    return strong ? 'POSSIBLY USEFUL, NEEDS HUMAN REVIEW' : 'NOT SUPPORTED BY CURRENT EVIDENCE';
  }

  const summaryClassification = {
    q1_distinctVectors: { answer: `${successResults.length} images produced ${new Set(successResults.map((r) => JSON.stringify(fullVector(r)))).size} distinct full 30-dim vectors.` },
    q2_midpointCollapseEvidence: { answer: `${highMidpointDims.length} of 30 dimensions have >=75% of images landing in [40,60]. Dimensions: ${highMidpointDims.join(', ') || 'none'}.`, highMidpointDims },
    q3_nearlyIdenticalVectors: { answer: `Most similar pair: ${mostSimilarPairs[0].imageA} vs ${mostSimilarPairs[0].imageB}, meanAbsDistance=${round2(mostSimilarPairs[0].meanAbsDistanceAll30)}.`, mostSimilarPairs },
    q4_distinctVectorsDistinctRankings: { answer: `Mean pairwise top16 Jaccard across all image pairs = ${round2(meanTop16JaccardAcrossImages)}.` },
    q5_oneTrackDominatesUnrelatedImages: { answer: `${globalTrackRecurrence.length} track(s) recur across >1 image; max image-recurrence = ${globalTrackRecurrence.length > 0 ? globalTrackRecurrence[0].imageCount : 0}.`, globalTrackRecurrenceTopEntries: globalTrackRecurrence.slice(0, 5) },
    q6_oneArtistDominatesUnrelatedImages: { answer: `Max artist image-recurrence = ${maxArtistImageRecurrence} of ${successResults.length} images.` },
    q7_oneGenreDominatesUnrelatedImages: { answer: `"${topDominantGenre}" dominant in ${topDominantGenreImageCount}/${successResults.length} images -> ${primaryGenreConcentrationClassification}.`, imagesDominatedByTopGenre },
    q8_seasonVariesMeaningfully: { answer: `Season field stats: ${SEASON_FIELDS.map((f) => `${f} sd=${round2(vectorDimensionStatistics[f].standardDeviation)}`).join(', ')}` },
    q9_timeVariesMeaningfully: { answer: `Time field stats: ${TIME_FIELDS.map((f) => `${f} sd=${round2(vectorDimensionStatistics[f].standardDeviation)}`).join(', ')}` },
    q10_weatherVariesMeaningfully: { answer: `Weather field stats: ${WEATHER_FIELDS.map((f) => `${f} sd=${round2(vectorDimensionStatistics[f].standardDeviation)}`).join(', ')}` },
    q11_desiredSoundVariesMeaningfully: { answer: `Desired-sound field stats: ${DESIRED_SOUND_FIELDS.map((f) => `${f} sd=${round2(vectorDimensionStatistics[f].standardDeviation)}`).join(', ')}` },
    q12_scoreSpreadsInformative: { answer: `Mean top16 scoreSpread across images = ${round2(meanScoreSpread)}.` },
    q13_ranks11to16CloseEnoughFor20Track: { answer: `Mean (rank1-10 avg minus rank11-16 avg) gap across images = ${round2(meanRankTierGap)}.` },
    q14_sequencingPreservesScoredTop10: { answer: sequencingViolations.length === 0 ? 'Yes — every image had all scored top-10 tracks present in final-10 with no outside tracks introduced.' : `No — ${sequencingViolations.length} image(s) violated this: ${sequencingViolations.map((r) => r.filename).join(', ')}.`, violatingImages: sequencingViolations.map((r) => r.filename) },
    q15_hardGenreCapEvidence: { answer: capLabel(primaryGenreConcentrationClassification === 'cross-image recurring concentration'), classification: primaryGenreConcentrationClassification },
    q16_hardArtistCapEvidence: { answer: capLabel(artistRepetitionClassification === 'cross-image dominance'), classification: artistRepetitionClassification },
    q17_vectorRedundancyEvidence: { answer: 'Not separately computed as a track-vs-track metric in this real-image run; see pairwiseVectorDistances for image-vector-level similarity. Requires manual/human review of whether visually distinct source photos are producing recommendation sets that feel redundant.' },
    q18_humanReviewStillRequired: { answer: 'Yes — human-review fields in perImageResults[].humanReview are intentionally blank and required before any quality claim.' },
    q19_candidatePoolExpansionReadiness: { answer: `Technically: yes, the scoring/ranking pipeline runs over the full ${CATALOG_COUNT}-track catalog and returns as many ranked candidates as requested. Quality readiness is not established by this diagnostic alone.` },
    q20_twentyTrackReadiness: { answer: 'technically ready (pipeline can score/rank/select beyond 16 without code changes) — NOT quality-validated (human-review fields are blank) and NOT enabled in production (CATALOG_CANDIDATE_POOL_SIZE/FINAL_TRACK_COUNT unchanged by this task).' },
  };

  // ── PHASE 12: human-review sheet scaffolding (blank fields, never fabricated) ───────
  function buildHumanReview() {
    return {
      PHOTO_VECTOR_PLAUSIBILITY: '',
      RECOMMENDATION_FIT_1_TO_5: '',
      FIRST_3_TRACK_FIT_1_TO_5: '',
      PLAYLIST_COHERENCE_1_TO_5: '',
      REPETITIVENESS_1_TO_5: '',
      OBVIOUSLY_WRONG_TRACKS: '',
      MISSING_MUSICAL_DIRECTION: '',
      NOTES: '',
    };
  }
  for (const r of successResults) {
    r.humanReview = buildHumanReview();
  }

  // ── PHASE 17: source immutability check ─────────────────────────────────────────────
  const postRunHashes = preRunInventory.map((img) => {
    const buffer = readFileSync(path.join(IMAGES_DIR, img.filename));
    return { filename: img.filename, sha256: sha256(buffer) };
  });
  const postRunFiles = readdirSync(IMAGES_DIR).sort();
  const hashMismatches = preRunInventory.filter((img, idx) => img.sha256 !== postRunHashes[idx].sha256);
  const noNewFiles = postRunFiles.length === preRunInventory.length && postRunFiles.every((f, idx) => f === preRunInventory[idx].filename);

  console.log('\n=== Source immutability check ===');
  console.log(`Hash mismatches: ${hashMismatches.length} (expect 0)`);
  console.log(`Directory file count unchanged: ${noNewFiles} (${postRunFiles.length} files, expect ${preRunInventory.length})`);

  // ── PHASE 13: JSON output ────────────────────────────────────────────────────────────
  const diagnosticJson = {
    generatedAt: new Date().toISOString(),
    repositoryHead,
    model: MODEL_NAME,
    sourceDirectory: 'test-assets/stat-manual-validation',
    sourceImageHashes: preRunInventory.map((img) => ({ filename: img.filename, sha256: img.sha256, width: img.width, height: img.height, byteSize: img.byteSize })),
    requestSummary: {
      imagesAttempted: results.length,
      imagesSucceeded: successResults.length,
      imagesFailed: failedResults.length,
      totalRequests,
      totalRequestsNote: 'Per-image/aggregate request count is not observable through the remote evaluation endpoint response; only the structural min/max range below is known.',
      minExpectedRequests: preRunInventory.length,
      maxExpectedRequests: preRunInventory.length * 2,
      failedImages: failedResults.map((f) => ({ filename: f.filename, category: f.error.category })),
    },
    perImageResults: successResults.map((r) => ({
      filename: r.filename,
      sha256: r.sha256,
      width: r.width,
      height: r.height,
      analysisStartedAt: r.analysisStartedAt,
      analysisDurationMs: r.analysisDurationMs,
      requestAttemptCount: r.requestAttemptCount,
      vectorNormalizationOccurred: r.vectorNormalizationOccurred,
      gptResult: r.gptResult,
      top16: r.top16,
      final10: r.final10,
      summary: r.summary,
      componentInfluence: r.componentInfluence,
      genreArtistObservation: r.genreArtistObservation,
      sequencingObservation: r.sequencingObservation,
      humanReview: r.humanReview,
    })),
    vectorDimensionStatistics,
    pairwiseVectorDistances,
    mostSimilarPairs,
    mostDifferentPairs,
    pairwiseRecommendationOverlap,
    overlapMatrices: { vectorDistanceMatrix, top16OverlapMatrix, top10ScoredOverlapMatrix, final10OverlapMatrix },
    highestOverlapPairs,
    lowestOverlapPairs,
    globalTrackRecurrence,
    globalArtistRecurrence,
    genreAnalysis: {
      genrePresenceCounts, subgenrePresenceCounts,
      primaryGenreConcentrationClassification, topDominantGenre, topDominantGenreImageCount, imagesDominatedByTopGenre,
      subgenreConcentrationClassification, topDominantSubgenre, topDominantSubgenreImageCount, imagesDominatedByTopSubgenre,
    },
    artistAnalysis: { maxArtistCountAnyTop16, maxArtistImageRecurrence, artistRepetitionClassification },
    sequencingAnalysis: { imagesWithViolations: sequencingViolations.map((r) => r.filename), totalViolations: sequencingViolations.length },
    sourceImmutability: { hashMismatchCount: hashMismatches.length, mismatches: hashMismatches, directoryFileCountUnchanged: noNewFiles },
    summaryClassification,
  };

  mkdirSync(DIAGNOSTICS_DIR, { recursive: true });
  writeFileSync(JSON_OUT_PATH, JSON.stringify(diagnosticJson, null, 2), 'utf-8');

  // ── PHASE 14: Markdown output ─────────────────────────────────────────────────────
  const md = [];
  md.push('# VibeScene Music Engine — Step 5-C Real-Image Evaluation\n');
  md.push(`Generated: ${diagnosticJson.generatedAt}  \nRepository HEAD: ${repositoryHead}  \nModel: ${MODEL_NAME}\n`);
  md.push(`## Execution summary\n`);
  md.push(`- Images attempted: ${results.length} | succeeded: ${successResults.length} | failed: ${failedResults.length}`);
  md.push(`- Total requests: not individually observable via the remote endpoint; expected ${preRunInventory.length}-${preRunInventory.length * 2} hosted OpenAI calls\n`);

  md.push('## Source image inventory\n');
  md.push('| filename | bytes | dimensions | sha256 (prefix) |');
  md.push('|---|---|---|---|');
  for (const img of preRunInventory) md.push(`| ${img.filename} | ${img.byteSize} | ${img.width}x${img.height} | ${img.sha256.slice(0, 16)}... |`);

  md.push('\n## Per-image results\n');
  for (const r of successResults) {
    md.push(`\n### ${r.filename}\n`);
    md.push(`- lane: ${r.gptResult.primary_lane_id} | image_type: ${r.gptResult.image_type} | confidence: ${r.gptResult.confidence}`);
    md.push(`- playlist_concept: ${r.gptResult.playlist_concept}`);
    md.push(`- targetStats: ${Object.entries(r.gptResult.targetStats).map(([k, v]) => `${k}=${v}`).join(' ')}`);
    md.push(`- contextAffinity: ${Object.entries(r.gptResult.contextAffinity).map(([k, v]) => `${k}=${v}`).join(' ')}`);
    md.push('\n**Top 16 scored**\n');
    md.push('| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |');
    md.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
    for (const row of r.top16) md.push(`| ${row.rank} | ${row.artist} | ${row.title} | ${row.youtubeVideoId} | ${row.primaryGenre} | ${row.subgenre} | ${round2(row.totalScore)} | ${round2(row.atmosphereScore)} | ${round2(row.desiredSoundScore)} | ${round2(row.seasonScore)} | ${round2(row.timeScore)} | ${round2(row.weatherScore)} |`);
    md.push('\n**Final 10 sequenced**\n');
    md.push('| final pos | scored rank | artist | title | youtubeVideoId | energy |');
    md.push('|---|---|---|---|---|---|');
    for (const row of r.final10) md.push(`| ${row.finalPosition} | ${row.originalScoredRank} | ${row.artist} | ${row.title} | ${row.youtubeVideoId} | ${row.coarseEnergy} |`);
    md.push('\n**Human review (blank — manual)**\n');
    for (const [k, v] of Object.entries(r.humanReview)) md.push(`- ${k}: ${v}`);
  }

  md.push('\n## Vector-dimension distribution summary\n');
  md.push('| field | min | max | mean | median | sd | unique | <20 | >80 | 40-60 |');
  md.push('|---|---|---|---|---|---|---|---|---|---|');
  for (const f of [...STATS_FIELDS, ...AFFINITY_FIELDS]) {
    const s = vectorDimensionStatistics[f];
    md.push(`| ${f} | ${s.minimum} | ${s.maximum} | ${round2(s.mean)} | ${round2(s.median)} | ${round2(s.standardDeviation)} | ${s.uniqueValueCount} | ${s.countBelow20} | ${s.countAbove80} | ${s.countBetween40And60Inclusive} |`);
  }

  md.push('\n## Most similar / most different image-vector pairs\n');
  md.push('Most similar:');
  for (const p of mostSimilarPairs) md.push(`- ${p.imageA} vs ${p.imageB}: meanAbsDistance=${round2(p.meanAbsDistanceAll30)}`);
  md.push('Most different:');
  for (const p of mostDifferentPairs) md.push(`- ${p.imageA} vs ${p.imageB}: meanAbsDistance=${round2(p.meanAbsDistanceAll30)}`);

  md.push('\n## Recommendation overlap\n');
  md.push('Highest top16-overlap pairs:');
  for (const p of highestOverlapPairs) md.push(`- ${p.imageA} <-> ${p.imageB}: overlap=${p.top16OverlapCount}, jaccard=${round2(p.top16Jaccard)}`);
  md.push('Lowest top16-overlap pairs:');
  for (const p of lowestOverlapPairs) md.push(`- ${p.imageA} <-> ${p.imageB}: overlap=${p.top16OverlapCount}, jaccard=${round2(p.top16Jaccard)}`);

  md.push('\n## Global recurrence\n');
  md.push(`Recurring tracks: ${globalTrackRecurrence.length}`);
  for (const t of globalTrackRecurrence.slice(0, 20)) md.push(`- ${t.artist} - ${t.title}: images=${t.imageCount} (${t.images.join(',')})`);
  md.push(`Recurring artists: ${globalArtistRecurrence.length}`);
  for (const a of globalArtistRecurrence.slice(0, 15)) md.push(`- ${a.artist}: images=${a.imageCount} (${a.images.join(',')})`);

  md.push('\n## Genre / artist concentration\n');
  md.push(`- primaryGenre concentration: **${primaryGenreConcentrationClassification}** ("${topDominantGenre}" dominant in ${topDominantGenreImageCount}/${successResults.length})`);
  md.push(`- subgenre concentration: **${subgenreConcentrationClassification}** ("${topDominantSubgenre}" dominant in ${topDominantSubgenreImageCount}/${successResults.length})`);
  md.push(`- artist repetition: **${artistRepetitionClassification}** (max in one top16=${maxArtistCountAnyTop16}, max image-recurrence=${maxArtistImageRecurrence})`);

  md.push('\n## Sequencing observation\n');
  md.push(sequencingViolations.length === 0 ? 'Every image preserved all scored top-10 tracks in the final 10 with no outside tracks introduced.' : `Violations in: ${sequencingViolations.map((r) => r.filename).join(', ')}`);

  md.push('\n## Final diagnostic classification\n');
  for (const [q, data] of Object.entries(summaryClassification)) md.push(`\n**${q}**: ${data.answer}`);

  mkdirSync(DIAGNOSTICS_DIR, { recursive: true });
  writeFileSync(MD_OUT_PATH, md.join('\n'), 'utf-8');

  console.log(`\nWrote ${JSON_OUT_PATH}`);
  console.log(`Wrote ${MD_OUT_PATH}`);
  console.log(failedResults.length === 0 ? 'Run completed successfully for all 12 images.' : 'Run completed but is INCOMPLETE (see failedImages).');
  process.exit(failedResults.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('[evaluate-real-image-music] FATAL unhandled error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
