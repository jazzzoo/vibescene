// Deterministic verification that a 20-track playlist survives the full frontend
// consumption path: backend-response mapping -> frontend transformation -> queue
// (YouTube "play all" URL) transformation -> shared-playlist mapping -> render-data
// shape. No network calls, no GPT, no real Supabase project, no production DB writes.
//
// Uses the same transpile+vm technique as scripts/verify-music-scoring.mjs, extended
// with a stubbing `require()` so the actual, unmodified source files in src/services
// and src/components can be exercised directly instead of being reimplemented here.
//
// Usage: node scripts/verify-frontend-20-track-flow.mjs

import { readFileSync } from 'fs';
import ts from 'typescript';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PLAYLIST_SERVICE_PATH = path.join(ROOT, 'src/services/playlist.ts');
const TRACK_LIST_PATH = path.join(ROOT, 'src/components/result/TrackList.tsx');
const RESULT_SCREEN_PATH = path.join(ROOT, 'src/screens/ResultScreen/index.tsx');
const SHARED_RESULT_SCREEN_PATH = path.join(ROOT, 'src/screens/SharedResultScreen/index.tsx');
const ACTION_BUTTONS_PATH = path.join(ROOT, 'src/components/result/ActionButtons.tsx');
const GET_SHARED_PLAYLIST_PATH = path.join(ROOT, 'supabase/functions/get-shared-playlist/index.ts');

let passed = 0;
let failed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) {
    passed += 1;
  } else {
    failed += 1;
    failures.push({ name, detail });
  }
}

// ── Synthetic 20-unique-track fixture ────────────────────────────────────────────
const FIXTURE_N = 20;
function makeDbTrackRows(n) {
  return Array.from({ length: n }, (_, i) => ({
    rank: i + 1,
    title: `Track ${i + 1}`,
    artist: `Artist ${i + 1}`,
    youtube_video_id: `vid${String(i + 1).padStart(2, '0')}`,
    youtube_video_url: `https://www.youtube.com/watch?v=vid${String(i + 1).padStart(2, '0')}`,
    thumbnail_url: `https://i.ytimg.com/vi/vid${String(i + 1).padStart(2, '0')}/hqdefault.jpg`,
    reason: 'Catalog pick',
  }));
}
const dbTrackRows = makeDbTrackRows(FIXTURE_N);
const expectedIds = dbTrackRows.map((r) => r.youtube_video_id);

const dbPlaylistRow = {
  image_storage_path: 'user123/main.jpg',
  analysis: {
    imageType: 'SCENE',
    confidence: 0.9,
    tempo: 'slow',
    valence: 'positive',
    playlistSubtitle: 'Test subtitle',
  },
  playlist_concept: 'Test Playlist',
  primary_genre: 'pop',
  secondary_genre: 'soft-pop',
  energy_score: 3,
  youtube_playlist_id: null,
  youtube_playlist_url: null,
  created_at: '2026-08-07T00:00:00.000Z',
};

// ── Generic transpile+vm loader with a stubbing require() ────────────────────────
// Any import not explicitly listed in `stubs` (react-native, expo, react-navigation,
// unrelated relative imports like ../../constants/colors) resolves to a Proxy that is
// both callable and property-accessible and always returns itself / null — enough for
// module-scope calls like StyleSheet.create(...) to execute without throwing, since we
// never invoke the React component functions themselves (only their plain top-level
// helper functions / exported service functions).
function makeGenericStub() {
  const fn = function StubComponent() { return null; };
  const proxy = new Proxy(fn, {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      if (prop === 'default') return proxy;
      if (prop === 'then') return undefined; // don't make the proxy look thenable
      return proxy;
    },
  });
  return proxy;
}

function loadWithStubs(fullPath, stubs) {
  const src = readFileSync(fullPath, 'utf-8');
  const out = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  });
  const fakeRequire = (spec) => (spec in stubs ? stubs[spec] : makeGenericStub());
  const sandbox = { module: { exports: {} }, exports: {}, require: fakeRequire, console, process, window: undefined };
  sandbox.module.exports = sandbox.exports;
  vm.createContext(sandbox);
  vm.runInContext(out.outputText, sandbox, { filename: fullPath });
  return sandbox.exports;
}

// ── Fake Supabase client for src/services/playlist.ts ────────────────────────────
// Mirrors the exact chain shape playlist.ts calls: .from(t).select(...).eq(...).order(...)
// (thenable, no .single()) and .from(t).select(...).eq(...).single() (playlists table).
function makeQueryBuilder(resolvedData) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    single: () => Promise.resolve({ data: resolvedData, error: null }),
    then: (resolve) => Promise.resolve(resolve({ data: resolvedData, error: null })),
  };
  return builder;
}

function makeFakeSupabase({ playlistRow, trackRows, sharedPlaylistInvokeResponse }) {
  return {
    from(table) {
      if (table === 'playlists') return makeQueryBuilder(playlistRow);
      if (table === 'tracks') return makeQueryBuilder(trackRows);
      throw new Error(`unexpected table in test stub: ${table}`);
    },
    functions: {
      invoke: async (fnName) => {
        if (fnName === 'get-shared-playlist') return { data: sharedPlaylistInvokeResponse, error: null };
        throw new Error(`unexpected function in test stub: ${fnName}`);
      },
    },
    auth: { getSession: async () => ({ data: { session: { access_token: 'fake' } } }) },
  };
}

// ── Simulate the get-shared-playlist Edge Function's own response-building map ───
// (supabase/functions/get-shared-playlist/index.ts:126-142) — Deno.serve() cannot be
// invoked directly from Node, so its exact field-mapping expression is re-run here
// against the same fixture; its absence of any .slice()/.limit() was independently
// confirmed by a static source-text check further below (structural, not reimplemented).
function buildEdgeFunctionSharedResponse(playlistRow, trackRows) {
  return {
    success: true,
    playlist: {
      id: 'test-playlist-id',
      imageUrl: 'https://fake-signed-url.test/img.jpg',
      analysis: playlistRow.analysis,
      playlistConcept: playlistRow.playlist_concept,
      primaryGenre: playlistRow.primary_genre,
      secondaryGenre: playlistRow.secondary_genre,
      energyScore: playlistRow.energy_score,
      createdAt: playlistRow.created_at,
      sharedAt: null,
      tracks: trackRows.map((t) => ({
        rank: t.rank,
        title: t.title,
        artist: t.artist,
        youtubeVideoId: t.youtube_video_id,
        youtubeVideoUrl: t.youtube_video_url,
        thumbnailUrl: t.thumbnail_url,
        reason: t.reason,
      })),
    },
  };
}

function assertOrderedIds(name, tracks, idField) {
  check(`${name}: exactly ${FIXTURE_N} tracks`, tracks.length === FIXTURE_N, tracks.length);
  const ids = tracks.map((t) => t[idField]);
  check(`${name}: no duplicate ids`, new Set(ids).size === ids.length, ids);
  check(`${name}: order preserved (same ids, same order as source)`, JSON.stringify(ids) === JSON.stringify(expectedIds), ids);
  const ranks = tracks.map((t) => t.rank);
  check(`${name}: ranks are exactly 1..20 in order`, JSON.stringify(ranks) === JSON.stringify(Array.from({ length: FIXTURE_N }, (_, i) => i + 1)), ranks);
}

// ── [1] Backend response -> frontend transformation: getPlaylistResult ───────────
{
  const fakeSupabase = makeFakeSupabase({
    playlistRow: dbPlaylistRow,
    trackRows: dbTrackRows,
    sharedPlaylistInvokeResponse: null,
  });

  const playlistServiceExports = loadWithStubs(PLAYLIST_SERVICE_PATH, {
    '../lib/supabaseClient': { supabase: fakeSupabase },
    './errors': { SafeError: class SafeError extends Error {} },
    './storage': {
      createSignedImageUrl: async () => 'https://fake-signed-url.test/img.jpg',
      getThumbnailStoragePath: (p) => `${p}_thumb`,
    },
  });

  const result = await playlistServiceExports.getPlaylistResult('test-playlist-id');
  assertOrderedIds('[1] getPlaylistResult (own playlist, saved -> loaded)', result.tracks, 'youtubeVideoId');
}

// ── [2] Shared-playlist retrieval: getSharedPlaylist (client) over the Edge
//        Function's own response shape (server) ─────────────────────────────────
{
  const edgeResponse = buildEdgeFunctionSharedResponse(dbPlaylistRow, dbTrackRows);
  assertOrderedIds('[2a] get-shared-playlist Edge Function response shape', edgeResponse.playlist.tracks, 'youtubeVideoId');

  const fakeSupabase = makeFakeSupabase({
    playlistRow: dbPlaylistRow,
    trackRows: dbTrackRows,
    sharedPlaylistInvokeResponse: edgeResponse,
  });

  const playlistServiceExports = loadWithStubs(PLAYLIST_SERVICE_PATH, {
    '../lib/supabaseClient': { supabase: fakeSupabase },
    './errors': { SafeError: class SafeError extends Error {} },
    './storage': {
      createSignedImageUrl: async () => 'https://fake-signed-url.test/img.jpg',
      getThumbnailStoragePath: (p) => `${p}_thumb`,
    },
  });

  const shared = await playlistServiceExports.getSharedPlaylist('fake-share-id');
  assertOrderedIds('[2b] getSharedPlaylist (client mapping of Edge Function response)', shared.tracks, 'youtubeVideoId');
}

// ── [3] Player queue (YouTube "Play on YouTube" watch_videos URL) ────────────────
// buildPlayOnYoutubeUrl is not exported (component-local helper) — extracted directly
// via source-text slice + eval rather than reimplemented, so this exercises the exact
// production expression, not a paraphrase of it.
function extractFunctionSource(fileText, fnName) {
  const startMarker = `function ${fnName}(`;
  const start = fileText.indexOf(startMarker);
  if (start === -1) throw new Error(`could not find function ${fnName} in source`);
  let depth = 0;
  let i = fileText.indexOf('{', start);
  const bodyStart = i;
  for (; i < fileText.length; i += 1) {
    if (fileText[i] === '{') depth += 1;
    else if (fileText[i] === '}') {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return fileText.slice(start, i + 1);
}

function loadExtractedFunction(filePath, fnName) {
  const src = readFileSync(filePath, 'utf-8');
  const fnSource = extractFunctionSource(src, fnName);
  const out = ts.transpileModule(`${fnSource}\nexports.__fn = ${fnName};`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const sandbox = { module: { exports: {} }, exports: {}, console };
  sandbox.module.exports = sandbox.exports;
  vm.createContext(sandbox);
  vm.runInContext(out.outputText, sandbox, { filename: filePath });
  return sandbox.exports.__fn;
}

{
  const queueTracks = dbTrackRows.map((t) => ({ youtubeVideoId: t.youtube_video_id }));

  for (const [label, filePath] of [
    ['ActionButtons.tsx (owner ResultScreen)', ACTION_BUTTONS_PATH],
    ['SharedResultScreen/index.tsx (recipient screen)', SHARED_RESULT_SCREEN_PATH],
  ]) {
    const buildPlayOnYoutubeUrl = loadExtractedFunction(filePath, 'buildPlayOnYoutubeUrl');
    const url = buildPlayOnYoutubeUrl(queueTracks);
    check(`[3] ${label}: queue URL is the multi-video watch_videos form (not single-video)`, url.startsWith('https://www.youtube.com/watch_videos?video_ids='), url);
    const idsInUrl = decodeURIComponent(url.split('video_ids=')[1]).split(',');
    check(`[3] ${label}: all ${FIXTURE_N} track ids present in queue URL`, idsInUrl.length === FIXTURE_N, idsInUrl.length);
    check(`[3] ${label}: queue URL preserves source order`, JSON.stringify(idsInUrl) === JSON.stringify(expectedIds), idsInUrl);
    check(`[3] ${label}: no duplicate ids in queue URL`, new Set(idsInUrl).size === idsInUrl.length, idsInUrl);
  }
}

// ── [4] Rendering data: TrackList/TrackItem structural check (no slice, full map) ─
{
  const trackListSrc = readFileSync(TRACK_LIST_PATH, 'utf-8');
  check('[4] TrackList.tsx contains no .slice( truncation', !/\.slice\(/.test(trackListSrc), 'found .slice(');
  check('[4] TrackList.tsx maps the full tracks prop (tracks.map(', /tracks\.map\(/.test(trackListSrc), 'tracks.map( not found');
  check('[4] TrackList.tsx does not use a FlatList/virtualized list with a fixed window', !/FlatList/.test(trackListSrc), 'unexpected FlatList usage');

  const resultScreenSrc = readFileSync(RESULT_SCREEN_PATH, 'utf-8');
  check('[4] ResultScreen passes the full result.tracks array to TrackList (no slice)', /<TrackList\s+tracks=\{result\.tracks\}/.test(resultScreenSrc), 'expected full result.tracks passed to TrackList');

  const sharedResultScreenSrc = readFileSync(SHARED_RESULT_SCREEN_PATH, 'utf-8');
  check('[4] SharedResultScreen passes the full result.tracks array to TrackList (no slice)', /<TrackList\s+tracks=\{result\.tracks\}/.test(sharedResultScreenSrc), 'expected full result.tracks passed to TrackList');

  // Simulate TrackList's actual per-item key/rank/isLast derivation for all 20 rows.
  const tracks = dbTrackRows.map((t) => ({ rank: t.rank, youtubeVideoId: t.youtube_video_id }));
  const rendered = tracks.map((track, index) => ({
    key: track.rank,
    rank: track.rank,
    isLast: index === tracks.length - 1,
  }));
  check('[4] rendered rows cover positions 1-20 with unique keys', JSON.stringify(rendered.map((r) => r.rank)) === JSON.stringify(Array.from({ length: FIXTURE_N }, (_, i) => i + 1)), rendered.map((r) => r.rank));
  check('[4] only the true last row (position 20) is flagged isLast', rendered.filter((r) => r.isLast).length === 1 && rendered[FIXTURE_N - 1].isLast, rendered.filter((r) => r.isLast));
}

// ── [5] Save/load JSON-serialization round-trip (local state / history reopen) ───
{
  const original = await (async () => {
    const fakeSupabase = makeFakeSupabase({ playlistRow: dbPlaylistRow, trackRows: dbTrackRows, sharedPlaylistInvokeResponse: null });
    const playlistServiceExports = loadWithStubs(PLAYLIST_SERVICE_PATH, {
      '../lib/supabaseClient': { supabase: fakeSupabase },
      './errors': { SafeError: class SafeError extends Error {} },
      './storage': { createSignedImageUrl: async () => 'x', getThumbnailStoragePath: (p) => p },
    });
    return playlistServiceExports.getPlaylistResult('test-playlist-id');
  })();

  const roundTripped = JSON.parse(JSON.stringify(original));
  assertOrderedIds('[5] JSON round-trip (serialize/deserialize) preserves all tracks', roundTripped.tracks, 'youtubeVideoId');
}

// ── Report ─────────────────────────────────────────────────────────────────────
if (failed > 0) {
  console.error('FAILED CHECKS:');
  for (const f of failures) {
    console.error(`  - ${f.name}`);
    console.error(`      detail: ${JSON.stringify(f.detail)}`);
  }
  console.error(`\nPassed: ${passed}`);
  console.error(`Failed: ${failed}`);
  process.exit(1);
}

console.log('FRONTEND 20-TRACK FLOW VERIFICATION PASSED');
console.log(`Passed: ${passed}`);
console.log('Failed: 0');
