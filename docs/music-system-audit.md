# VibeScene Music System Audit

**Audit type:** Read-only. No source files were modified, staged, committed, or pushed.
**Scope:** Existing curation-lane music catalog, image analysis, track selection, playlist construction, player, UI, backend/DB, scripts, and tests — as a baseline before a possible move to genre-based catalog + per-track atmosphere stats.
**Branch at audit time:** `main`, working tree clean (`git status --short` empty), no pre-existing uncommitted changes.
**Files created by this audit:** `docs/music-system-audit.md`, `docs/music-system-audit.json` only. No other file was touched.

---

## A. Executive summary

- **Source of truth for track data:** `supabase/functions/_shared/musicCatalog.ts` (7,266 lines). It exports 21 per-lane arrays (`*_SEED_TRACKS`) plus one aggregate `ALL_SEED_TRACKS` built by spreading all 21 arrays together. There is **one** source of truth for track data — no competing/duplicate catalog file was found anywhere else in the repo (frontend never imports track data directly; it only reads already-selected tracks back from the `tracks` DB table).
- **Total track objects:** 701 (sum of the 21 `*_SEED_TRACKS` arrays). `ALL_SEED_TRACKS` itself contains 0 literal objects — it is a derived/computed export, not a second source.
- **Total lane count:** 21, defined independently in `supabase/functions/analyze-and-search/services/curationLanes.ts` (`CURATION_LANES`). The 21 lane IDs there match the 21 distinct `laneId` values found in the catalog 1:1 — except for one mislabeled track (see §I).
- **Current image-to-music selection method:** GPT-4o Vision picks exactly **one** `primary_lane_id` from a hardcoded prompt-embedded catalogue of the 21 lanes (never multiple, never partial). The backend then deterministically samples tracks whose `laneId` field matches that string from the flat `ALL_SEED_TRACKS` array (seeded shuffle), with a YouTube-search fallback only when catalog coverage for that lane is thin. There is **no similarity scoring, no embeddings, and no per-track atmosphere data** anywhere in the current pipeline.
- **Major architectural dependencies:** the lane ID string is the single join key threading through the GPT system prompt, the catalog, `sequencing.ts` (playlist ordering), the `playlists` table (`primary_lane_id`/`primary_lane_name` columns), and `src/data/loadingContent.ts` (`LANE_SPOTLIGHTS`, manually hand-kept in sync with `CURATION_LANES` — no shared source, no generator, no test enforcing the 21↔21 parity).
- **Top migration risks:**
  1. `curationLanes.ts` → `gpt.ts` prompt text is the *only* place lane semantics live; replacing lanes with genre/atmosphere requires a full prompt rewrite plus re-validation of GPT output reliability (findability, coherence).
  2. `laneId` is a bare `string` everywhere (catalog, DB column, sequencing anchor logic) — nothing enforces it against `CURATION_LANES` except one runtime check in `gpt.ts` (`VALID_LANE_IDS`) and one non-throwing `console.warn` in `validateCatalog()`. No compile-time union type ties them together.
  3. Zero automated tests exist for catalog, lanes, image analysis, selection, playlist, player, or sharing — any migration is unverified by anything except manual QA.
  4. The base DB schema (the `playlists`/`tracks`/`profiles` tables themselves) is **not** in the tracked `supabase/migrations/` folder — only four incremental `ALTER TABLE` migrations exist. The original `CREATE TABLE` statements could not be located in the repository (see §K).
  5. `sequenceCatalogTracksWithAnchors` (`sequencing.ts`) uses **object reference identity** (`Map<CatalogSeedTrack, number>` and `.includes()`/`.indexOf()` on live objects) to track lane-array position and remove anchors from the candidate pool. Any future refactor that clones/deep-copies track objects before calling this function will silently break anchor selection and duplicate-removal.

---

## B. Complete file inventory

| File path | Role | Main exports/functions | Imported by | Runtime used | Risk |
|---|---|---|---|---|---|
| `supabase/functions/_shared/musicCatalog.ts` | Catalog source of truth (701 tracks, 21 lane arrays) | `CatalogSeedTrack`, `TrackEnergy`, 21× `*_SEED_TRACKS`, `ALL_SEED_TRACKS`, `getTracksByLane`, `selectCatalogTracks`, `selectVerifiedCatalogTracks`, `hasYoutubeVideoId`, `getVerifiedTracksByLane`, `validateCatalog` | `analyze-and-search/index.ts`, `analyze-and-search/services/sequencing.ts` | Yes | High |
| `supabase/functions/analyze-and-search/services/curationLanes.ts` | Lane definitions (21 lanes) | `CurationLane` type, `CURATION_LANES`, `getCurationLaneName` | `gpt.ts`, `db.ts` | Yes | High |
| `supabase/functions/analyze-and-search/services/gpt.ts` | GPT-4o Vision call, System Prompt v2, lane-catalogue-to-prompt serializer, response parsing/validation | `buildCurationLanesPrompt` (private), `SYSTEM_PROMPT` (private, "임의 수정 금지"), `analyzeImage`, `GptResponse`/`GptPlaylistItem`/`GptAnalysisScene`/`GptAnalysisPerson` types | `analyze-and-search/index.ts` | Yes | High |
| `supabase/functions/analyze-and-search/services/sequencing.ts` | Deterministic playlist ordering (energy arc + "anchor" opener/mood-lock picks) | `sequencePlaylistArc`, `sequenceCatalogTracksWithAnchors` | `analyze-and-search/index.ts` | Yes | Medium |
| `supabase/functions/analyze-and-search/services/youtube.ts` | YouTube Data API v3 search + candidate scoring/filtering fallback | `searchYouTubeTracks`, `YoutubeTrack` type | `analyze-and-search/index.ts` | Yes | Medium |
| `supabase/functions/analyze-and-search/services/db.ts` | Supabase writes for playlist/analysis/tracks rows | `ensureProfileExists`, `insertPendingPlaylist`, `updatePlaylistStatus`, `updatePlaylistAnalysis`, `insertTracks`, `updatePlaylistFailed`, `TrackSource` type | `analyze-and-search/index.ts` | Yes | High |
| `supabase/functions/analyze-and-search/services/rateLimit.ts` | In-memory IP/user rate limiting | `checkRateLimit`, `getClientIp` | `analyze-and-search/index.ts` | Yes | Low |
| `supabase/functions/analyze-and-search/errors.ts` | `SafeError` (user-safe message) | `SafeError` | `gpt.ts`, `db.ts`, `index.ts` | Yes | Low |
| `supabase/functions/analyze-and-search/index.ts` | Edge Function 1 orchestration: upload→signed URL→GPT→catalog/YouTube selection→sequencing→DB insert; stops at `status='searching'` | `Deno.serve` handler, `toVerifiedTrackRows` | n/a (HTTP entry point) | Yes | High |
| `supabase/functions/create-youtube-playlist/index.ts` | Edge Function 2: `searching`→`creating`→`created`, creates a real YouTube playlist via OAuth | `Deno.serve` handler | n/a (HTTP entry point) | Yes (but the client button that triggers it is currently feature-flagged off, see §C) | Medium |
| `supabase/functions/create-youtube-playlist/services/{db,google,youtube,rateLimit}.ts` | DB reads/writes, Google OAuth token refresh, YouTube playlist-insert calls, rate limiting | various | `create-youtube-playlist/index.ts` | Yes | Medium |
| `supabase/functions/create-share-link/index.ts` | Generates public share id/link for a playlist | `Deno.serve` handler | n/a | Yes | Low |
| `supabase/functions/get-shared-playlist/index.ts` | Public read endpoint for a shared playlist (no auth) | `Deno.serve` handler | n/a | Yes | Low |
| `supabase/functions/exchange-google-code/*` | Google OAuth code exchange (unrelated to music selection, referenced only for completeness) | various | n/a | Yes (currently disabled client-side per commit `422a764`) | Low |
| `src/types/playlist.ts` | Frontend track/playlist/analysis TypeScript types | `Track`, `MusicProfile`, `Analysis`, `PlaylistResult`, `ResultScreenParams`, `PlaylistStatus`, `SharedPlaylistResult`, `PlaylistHistoryItem` | `services/playlist.ts`, all result/history screens/components | Yes | Medium |
| `src/services/playlist.ts` | Frontend↔Supabase data layer (fetch playlist result, invoke Edge Functions, history, share) | `getPlaylistResult`, `analyzeAndSearchPlaylist`, `createYouTubePlaylist`, `getPlaylistHistory`, `createShareLink`, `getSharedPlaylist`, `generatePlaylist` (dead/legacy, see §I) | `LoadingScreen`, `ResultScreen`, `HistoryScreen`, `SharedResultScreen` | Mostly yes (`generatePlaylist` unused) | Medium |
| `src/services/storage.ts` | Image upload (main + thumbnail), signed URL creation | `uploadUserImage` (used), `uploadImageToStorage` (unused/dead, see §I), `getThumbnailStoragePath`, `createSignedImageUrl` | `LoadingScreen` (`uploadUserImage`), `playlist.ts` (`createSignedImageUrl`, `getThumbnailStoragePath`) | Partially (one dead export) | Low |
| `src/hooks/useImagePicker.ts` | Camera/library picker | `useImagePicker` | not found imported by any screen in this audit's search (see §K) | Unverified | Low |
| `src/data/loadingContent.ts` | LoadingScreen copy: processing-message sequence + **hand-maintained lane display copy** (`LANE_SPOTLIGHTS`) | `PROCESSING_MESSAGE_SEQUENCE`, `PROCESSING_MESSAGE_POOL`, `SHAPING_PHASE_START_INDEX`, `LaneSpotlightEntry`, `LANE_SPOTLIGHTS` (21 entries), `shuffle`, `shuffleAvoidingRepeatStart` | `LoadingScreen/index.tsx` | Yes | High (hand-sync risk) |
| `src/screens/LoadingScreen/index.tsx` | Upload → analyze → navigate; renders rotating processing text + "Lane Spotlight" card | component | navigation | Yes | Medium |
| `src/screens/ResultScreen/index.tsx` | Playlist result screen (hero image, concept/subtitle, track list, save/share actions) | component | navigation | Yes | Low |
| `src/screens/SharedResultScreen/index.tsx` | Public shared-playlist view | component | navigation | Yes | Low |
| `src/screens/HistoryScreen/index.tsx` | Grid of past playlists | component | navigation | Yes | Low |
| `src/components/result/TrackList.tsx`, `TrackItem.tsx` | Track list rendering; tapping opens YouTube via `Linking` | components | `ResultScreen`, `SharedResultScreen` | Yes | Low |
| `src/components/result/ActionButtons.tsx` | "Play on YouTube" (multi-video `watch_videos` deep link), "Save to YouTube" (feature-flagged off), "Share playlist" | component, `buildPlayOnYoutubeUrl` | `ResultScreen` | Yes | Medium |
| `src/components/result/MoodTags.tsx` | Generic tag-pill list component | `MoodTags` | **not imported anywhere** (dead component, see §I) | No | Low |
| `src/components/result/PlaylistConcept.tsx`, `PlaylistSubtitle.tsx`, `GradientOverlay.tsx` | Hero text/overlay rendering | components | `ResultScreen`, `SharedResultScreen` | Yes | Low |
| `src/components/history/HistoryCard.tsx` | History grid tile + status badge | component | `HistoryScreen` | Yes | Low |
| `src/constants/colors.ts`, `src/constants/spacing.ts` | Design tokens | `COLORS`, `SPACING` | throughout `src/` | Yes | Low |
| `supabase/migrations/20260625120000_add_primary_lane_to_playlists.sql` | Adds `primary_lane_id`, `primary_lane_name`, `track_source` (+ CHECK constraint) to `playlists` | SQL | n/a | Yes | High |
| `supabase/migrations/20260707120000_add_share_fields_to_playlists.sql` | Adds `share_id`, `is_public`, `shared_at` + unique partial index | SQL | n/a | Yes | Low |
| `supabase/migrations/20260703120000_add_events_table.sql` | `events` analytics table | SQL | n/a | Yes | Low |
| `supabase/migrations/20260617120000_add_platform_to_oauth_tokens.sql` | `oauth_tokens.platform` column | SQL | n/a | Yes | Low |
| `supabase/queries/analytics_rollup.sql` | Ad-hoc analytics rollup query (not a migration) | SQL | n/a (manual/dashboard use) | Unclear | Low |
| `scripts/check-catalog-youtube-ids.mjs` | Reports per-lane count of tracks with/without `youtubeVideoId` | CLI script | n/a | Read-only | Low |
| `scripts/export-youtube-id-template.mjs` | Dumps a lane's tracks to a markdown template for manual YouTube ID entry | CLI script | n/a | Read-only (writes to `scratch/`, not the catalog) | Low |
| `scripts/apply-youtube-ids-from-template.mjs` | Applies IDs from the markdown template back into `musicCatalog.ts` | CLI script | n/a | **Mutates `musicCatalog.ts` only when run with `--apply`**; dry-run by default | Medium (not executed during this audit) |
| `scripts/generate-youtube-debug.mjs` | HTML debug report of catalog YouTube ID validity | CLI script | n/a | Read-only (writes to `debug/`) | Low |
| `scripts/verify-youtube-video-metadata.mjs` | Verifies video IDs via YouTube oEmbed, builds HTML+JSON report | CLI script | n/a | Read-only (network calls to oEmbed; writes to `debug/`) | Low |

No test files, fixtures, or snapshots related to music/lanes/analysis/playlist/player/sharing/loading were found anywhere in `src/`, `supabase/`, or `scripts/` (see §I and §K). `package.json` declares no test runner and no `"test"` script.

---

## C. Current track data model

Inferred directly from `supabase/functions/_shared/musicCatalog.ts:11-24`:

```ts
export type TrackEnergy = "low" | "medium" | "high";

export type CatalogSeedTrack = {
  laneId: string;            // required — free string, not a union of CURATION_LANES ids at the type level
  title: string;             // required
  artist: string;            // required
  youtubeVideoId?: string;   // optional — but in practice 701/701 tracks have it (see §D)
  energy: TrackEnergy;       // required
  moodTags: string[];        // required
  sceneTags: string[];       // required
  subTags?: string[];        // optional — but in practice 701/701 tracks have it (see §D)
};
```

Runtime shape flowing to the `tracks` DB table (`analyze-and-search/services/youtube.ts:50-58`, `db.ts:150-175`) is a **different, narrower** shape — the catalog's `moodTags`/`sceneTags`/`subTags`/`energy`/`laneId` are **not** persisted per-track; only this survives into the DB and the client:

```ts
// DB row / YoutubeTrack (analyze-and-search/services/youtube.ts:50-58)
type YoutubeTrack = {
  rank: number;
  title: string;
  artist: string;
  reason: string;             // for catalog picks: "Catalog pick for the {laneId} lane"; for GPT picks: GPT's own reasoning text
  youtube_video_id: string;
  youtube_video_url: string;
  thumbnail_url: string;
};

// Frontend Track (src/types/playlist.ts:1-9)
type Track = {
  rank: number;
  title: string;
  artist: string;
  youtubeVideoId: string;
  youtubeVideoUrl: string;
  thumbnailUrl: string;
  reason: string;
};
```

The playlist-level `laneId` is captured once, not per track: `playlists.primary_lane_id` / `playlists.primary_lane_name` (columns added in `20260625120000_add_primary_lane_to_playlists.sql`), populated in `db.ts:updatePlaylistAnalysis`. It is **never sent to the frontend** — `PlaylistResult`/`SharedPlaylistResult` in `src/types/playlist.ts` have no `laneId`/`primaryLaneId` field, and neither `playlist.ts`'s `getPlaylistResult`/`getSharedPlaylist` queries select those columns for client use.

---

## D. Music catalog inventory

(Derived by parsing `musicCatalog.ts` programmatically — brace-matched per-export object extraction, not manual counting. Script and full raw output are reproducible from the file itself.)

**Exported arrays (21 lane arrays + 1 aggregate):**

| Export | Track count |
|---|---|
| `MODERN_JAZZ_GROOVE_SEED_TRACKS` | 30 |
| `J_ROCK_HIGHWAY_RUSH_SEED_TRACKS` | 31 |
| `HIP_HOP_NIGHT_DRIVE_SEED_TRACKS` | 32 |
| `K_RNB_NIGHT_DRIVE_SEED_TRACKS` | 30 |
| `K_INDIE_RAINY_ROOM_SEED_TRACKS` | 30 |
| `CITY_POP_RETRO_GLOW_SEED_TRACKS` | 40 |
| `INDIE_ROAD_MOVIE_SEED_TRACKS` | 45 |
| `AMERICAN_ALTERNATIVE_DRIVE_SEED_TRACKS` | 30 |
| `DREAM_POP_SHOEGAZE_FOG_SEED_TRACKS` | 36 |
| `BIG_CITY_SWAGGER_HIPHOP_SEED_TRACKS` | 33 |
| `NEON_ELECTRONIC_NIGHT_SEED_TRACKS` | 35 |
| `HIGHTEEN_POP_ROOM_SEED_TRACKS` | 30 |
| `LOFI_BEDROOM_SOLITUDE_SEED_TRACKS` | 35 |
| `MODERN_ROMANCE_POP_SEED_TRACKS` | 35 |
| `SUMMER_BEACH_POP_SEED_TRACKS` | 31 |
| `FUNK_DISCO_NIGHT_SEED_TRACKS` | 38 |
| `TRENDY_POP_CHIC_SEED_TRACKS` | 30 |
| `CLASSIC_SOUL_OLD_FILM_SEED_TRACKS` | 32 |
| `COZY_CAFE_MELLOW_SEED_TRACKS` | 30 |
| `DARK_HEAVY_HIPHOP_SEED_TRACKS` | 34 |
| `SUNNY_STOLL_POP_SEED_TRACKS` | 34 |
| `ALL_SEED_TRACKS` | 0 own objects — `[...spread of all 21 arrays above]` (`musicCatalog.ts:7099-7121`), i.e. 701 at runtime |

- **Total track objects (sum of literal arrays):** 701
- **Total exported track arrays:** 21 lane-specific + 1 aggregate = 22
- **Track count by declared `laneId` field (actual, not export name):** matches export counts exactly for 20 of 21 lanes; **`dark-heavy-hiphop` has only 33** and **`big-city-swagger-hiphop` has 34** by field value, vs. 34/33 by export/array location — because one object physically stored in the `DARK_HEAVY_HIPHOP_SEED_TRACKS` array carries `laneId: "big-city-swagger-hiphop"` (see §I finding 1).
- **Unique track count:** 701 literal objects; by normalized (lowercased, trimmed) title+artist there are **25 duplicate groups** (52 objects involved) — see §I. By `youtubeVideoId` there are **22 duplicate groups** (44 objects involved).
- **Missing-field count:** 0 tracks missing `laneId`, `title`, `artist`, or `energy`. 0 tracks with an invalid `energy` value (only `"low"|"medium"|"high"` appear). 0 tracks with an empty `moodTags`/`sceneTags`/`subTags` array or a malformed `youtubeVideoId` (all present IDs match the 11-character YouTube ID pattern).
- **`youtubeVideoId` coverage:** 701/701 tracks have a non-empty `youtubeVideoId` — the catalog is fully "verified" in the sense used by `hasYoutubeVideoId`/`getVerifiedTracksByLane`. This means, in current data, the `selectVerifiedCatalogTracks` fast path (§F) will essentially always have enough candidates and the plain YouTube-search fallback path is effectively cold code for now (still reachable if a lane drops below `MIN_CATALOG_TRACKS=5`, which none currently do — the smallest lane has 30 tracks).
- **Invalid-lane count:** 0 — every `laneId` value appearing in the catalog (21 distinct values) has a matching entry in `CURATION_LANES` (21 lanes). No catalog track references a nonexistent lane.
- **Unused-export count:** 0 of the 21 `*_SEED_TRACKS` exports are dead — all are consumed transitively via `ALL_SEED_TRACKS` → `getTracksByLane`. `ALL_SEED_TRACKS`, `getTracksByLane`, `selectCatalogTracks`, `selectVerifiedCatalogTracks`, `hasYoutubeVideoId` are all imported and used by `analyze-and-search/index.ts` or `sequencing.ts`. `validateCatalog()` and `getVerifiedTracksByLane` are exported but **no caller was found in the codebase** — i.e. `validateCatalog()`'s data-quality checks (missing fields, invalid energy, in-lane duplicate title/artist, lane track-count minimum) do not appear to run anywhere in the current build/deploy/runtime path (see §I and §K — could not confirm whether it's wired into a CI step outside this repo).

---

## E. Lane inventory

All 21 lanes are defined once, in `supabase/functions/analyze-and-search/services/curationLanes.ts:18-720`, each with fields: `id`, `name`, `description`, `sceneSignals[]`, `energySignals[]`, `allowedGenres[]`, `forbiddenGenres[]`, `referenceVibes[]`, `titleExamples[]`, `avoidWhen[]`.

| Lane ID | Display name | Definition file | Catalog track count (by `laneId` field) | Referenced in prompt (`gpt.ts`) | Referenced in loading UI (`loadingContent.ts`) | Referenced in DB | Hard-coded elsewhere |
|---|---|---|---|---|---|---|---|
| `modern-jazz-groove` | Modern Jazz Groove | curationLanes.ts:20 | 30 | Yes | Yes | Yes (`primary_lane_id` values) | none found |
| `j-rock-highway-rush` | J-Rock Highway Rush | curationLanes.ts:63 | 31 | Yes | Yes | Yes | none found |
| `k-rnb-night-drive` | K-R&B Night Drive | curationLanes.ts:93 | 30 | Yes | Yes | Yes | none found |
| `k-indie-rainy-room` | K-Indie Rainy Room | curationLanes.ts:125 | 30 | Yes | Yes | Yes | none found |
| `city-pop-retro-glow` | City Pop / Retro Drive | curationLanes.ts:155 | 40 | Yes | Yes | Yes | none found |
| `indie-road-movie` | Indie Road Movie | curationLanes.ts:187 | 45 | Yes | Yes | Yes | none found |
| `american-alternative-drive` | American Alternative Drive | curationLanes.ts:219 | 30 | Yes | Yes | Yes | none found |
| `dream-pop-shoegaze-fog` | Dream Pop / Shoegaze Fog | curationLanes.ts:249 | 36 | Yes | Yes | Yes | none found |
| `neon-electronic-night` | Neon Electronic Night | curationLanes.ts:279 | 35 | Yes | Yes | Yes | none found |
| `lofi-bedroom-solitude` | Lo-fi Bedroom Solitude | curationLanes.ts:309 | 35 | Yes | Yes | Yes | none found |
| `summer-beach-pop` | Summer Beach Pop | curationLanes.ts:340 | 31 | Yes | Yes | Yes | none found |
| `funk-disco-night` | Funk / Disco Night | curationLanes.ts:371 | 38 | Yes | Yes | Yes | none found |
| `classic-soul-old-film` | Classic Soul / Old Film | curationLanes.ts:401 | 32 | Yes | Yes | Yes | none found |
| `big-city-swagger-hiphop` | Big City Swagger Hip-Hop | curationLanes.ts:431 | 34 (field value; see §I re: 1 mislabeled track) | Yes | Yes | Yes | none found |
| `highteen-pop-room` | Highteen Pop Room | curationLanes.ts:462 | 30 | Yes | Yes | Yes | none found |
| `modern-romance-pop` | Modern Romance Pop | curationLanes.ts:493 | 35 | Yes | Yes | Yes | none found |
| `trendy-pop-chic` | Trendy Pop Chic | curationLanes.ts:523 | 30 | Yes | Yes | Yes | none found |
| `cozy-cafe-mellow` | Cozy Cafe Mellow | curationLanes.ts:554 | 30 | Yes | Yes | Yes | none found |
| `hip-hop-night-drive` | Hip-Hop Night Drive | curationLanes.ts:585 | 32 | Yes | Yes | Yes | none found |
| `dark-heavy-hiphop` | Dark Heavy Hip-Hop | curationLanes.ts:617 | 33 (field value; should be 34, see §I) | Yes | Yes | Yes | none found |
| `sunny-stroll-pop` | Sunny Stroll Pop | curationLanes.ts:647 | 34 | Yes | Yes | Yes | none found |

Notes:
- **Lane ID is never used as a TypeScript enum/union or object-key/switch-case anywhere** — it is passed around purely as `string` (`CatalogSeedTrack.laneId: string`, `GptResponse.primary_lane_id: string`, DB column `text`). The only structural enforcement is a `Set<string>` membership check in `gpt.ts:476,556` (`VALID_LANE_IDS`).
- **Lane *name* (display string) is independently hand-duplicated** in `src/data/loadingContent.ts:64-86` (`LANE_SPOTLIGHTS`) as frontend-only copy — 21 entries, name+description, manually written to roughly track `CURATION_LANES`' `name`/`description`/`referenceVibes` fields but with no code-level link. The file's own comment (`loadingContent.ts:56-58`) acknowledges this: "lane이 추가/제거되면 이 배열도 함께 갱신해야 한다" (must be updated by hand whenever a lane is added/removed).
- Removing or renaming a lane ID would: break `gpt.ts`'s `VALID_LANE_IDS` check (GPT could no longer be told about it, and any GPT response mentioning it would now hard-fail as "invalid"), silently orphan any catalog tracks still carrying the old `laneId` (they simply stop being selectable, no error), and leave a stale, no-longer-matching entry in `LANE_SPOTLIGHTS` unless a human remembers to update it.

---

## F. End-to-end runtime flow

**Step-by-step (file:function → data object):**

1. **Upload** — `src/screens/LoadingScreen/index.tsx:101` calls `uploadUserImage(localImageUri)` (`src/services/storage.ts:89-133`). Produces main image (≤1600px, q0.85) + best-effort thumbnail (≤480px, q0.75), uploads both to Supabase Storage bucket `user-images/{userId}/{filename}.jpg`. Returns `storagePath: string`.
2. **Edge Function 1 call** — `analyzeAndSearchPlaylist(storagePath)` (`src/services/playlist.ts:112-138`) invokes `analyze-and-search` with `{ image_storage_path }` + bearer JWT.
3. **Server: auth + rate limit** — `supabase/functions/analyze-and-search/index.ts:84-133`. IP + user-id rate limits (`rateLimit.ts`), JWT→`userId` via `supabaseAdmin.auth.getUser(token)` (`user_id` is *never* trusted from the client body).
4. **`playlists` row created**, `status='pending'` → `'analyzing'` (`db.ts:insertPendingPlaylist`, `updatePlaylistStatus`).
5. **Signed image URL** — `index.ts:181-193`, 5-minute TTL, `user-images` bucket.
6. **GPT-4o Vision call** — `analyzeImage(signedUrl)` (`gpt.ts:481-562`). Sends `SYSTEM_PROMPT` (embeds full `CURATION_LANES_PROMPT`, generated from `CURATION_LANES` at module load time — not a second hand-written copy) + the image URL. Model: `gpt-4o`, `response_format: json_object`, `max_tokens: 2000`. Produces `GptResponse` (see §C/§G for shape). `primary_lane_id` is validated against `VALID_LANE_IDS`; invalid/missing → `SafeError` thrown, no fallback default (`gpt.ts:554-559`).
7. **Verified-catalog fast path** — `selectVerifiedCatalogTracks({ laneId: primary_lane_id, seed: playlistId, count: 16 })` (`musicCatalog.ts:7191-7205`). If ≥5 verified tracks come back (currently always true, §D), these are sequenced and inserted directly — **no YouTube Search API call at all** in this path.
8. **Sequencing** — `sequenceCatalogTracksWithAnchors(tracks, laneId, playlistId, 10)` (`sequencing.ts:176-226`): picks "anchor" opener/mood-lock tracks (position 1–2) using each track's original array index within its lane as a familiarity proxy + a seeded pseudo-random rotation, then arranges the rest into a 6-stage energy arc (opener→mood lock→energy lift→emotional peak→cooldown→closer) by nearest-`energy`-match greedy assignment. Falls back to pure energy-arc, then to the raw seeded-shuffle order, on any internal error.
9. **Fallback path (if <5 verified catalog tracks for the lane)** — `selectCatalogTracks(...)` (any track in the lane, verified or not) if ≥5 available, else `trackSource='youtube_fallback'` and GPT's own 10-item `playlist[]` (title/artist/reason) is used as the search input instead.
10. **`updatePlaylistAnalysis`** (`db.ts:92-148`) writes `analysis` JSONB, `playlist_concept`, `primary_genre`, `secondary_genre`, `energy_score`, `primary_lane_id`, `primary_lane_name` (looked up via `getCurationLaneName`), `track_source`, and sets `status='searching'`.
11. **YouTube search** (only on the fallback path) — `searchYouTubeTracks` (`youtube.ts:389-411`): per track, tries progressively broader query suffixes, scores candidates by title/channel/keyword/duration/view-count heuristics, rejects covers/reactions/live/too-short/too-long, keeps the best-scoring accepted candidate.
12. **`insertTracks`** (`db.ts:150-175`) writes the final ranked rows into the `tracks` table. **Edge Function 1 stops here — `status` remains `'searching'`.**
13. **ResultScreen loads** — `getPlaylistResult(playlistId)` (`playlist.ts:45-104`) reads `playlists` + `tracks`, builds a signed image URL, returns `PlaylistResult` to the UI. `laneId`/`primary_lane_id` is **not** included in what's sent to the client.
14. **Playback** — no in-app player exists. `TrackItem` opens `https://www.youtube.com/watch?v={id}` via `Linking`; `ActionButtons`' "Play on YouTube" opens a multi-video `watch_videos?video_ids=...` URL in a new tab/window (web) or via `Linking` (native).
15. **Optional: Save to YouTube (Edge Function 2)** — currently unreachable in the UI because `ActionButtons.tsx:20` hardcodes `SAVE_TO_YOUTUBE_ENABLED = false` (Google OAuth disabled per commit `422a764 Disable Google OAuth during early preview`). If enabled, `create-youtube-playlist/index.ts` moves `status` `'searching'`→`'creating'`→`'created'`, creating a real YouTube playlist via the user's OAuth token.
16. **Optional: Share** — `createShareLink`/`create-share-link` sets `share_id`/`is_public=true`; `get-shared-playlist` is a public (no-auth) endpoint that returns a subset of the same data (never `user_id` or `image_storage_path`), for `SharedResultScreen`.

```mermaid
flowchart TD
    A[User picks/takes photo] --> B["uploadUserImage()<br/>src/services/storage.ts"]
    B -->|storagePath| C["analyzeAndSearchPlaylist()<br/>src/services/playlist.ts"]
    C -->|POST + JWT| D["Edge Function 1: analyze-and-search/index.ts"]
    D --> E["Auth + rate limit<br/>(userId from JWT only)"]
    E --> F["playlists row:<br/>status=pending -> analyzing"]
    F --> G["Signed image URL<br/>(5 min TTL)"]
    G --> H["analyzeImage()<br/>gpt.ts: GPT-4o Vision +<br/>SYSTEM_PROMPT + CURATION_LANES_PROMPT"]
    H -->|GptResponse: primary_lane_id,<br/>music_profile, analysis, playlist[]| I{primary_lane_id<br/>valid?}
    I -- no --> Z1["SafeError -> status=failed"]
    I -- yes --> J["selectVerifiedCatalogTracks(laneId)<br/>musicCatalog.ts"]
    J -->|">=5 tracks (current: always)"| K["sequenceCatalogTracksWithAnchors()<br/>sequencing.ts"]
    J -->|"<5 tracks"| L["selectCatalogTracks(laneId)<br/>any track in lane"]
    L -->|">=5"| K
    L -->|"<5"| M["trackSource=youtube_fallback<br/>use GPT's own playlist[]"]
    M --> N["searchYouTubeTracks()<br/>youtube.ts: query + score + filter"]
    K --> O["updatePlaylistAnalysis()<br/>db.ts: writes primary_lane_id,<br/>primary_lane_name, analysis JSONB,<br/>status=searching"]
    N --> O
    O --> P["insertTracks()<br/>db.ts: tracks table"]
    P --> Q["Edge Function 1 response:<br/>{ playlist_id }<br/>status stays = searching"]
    Q --> R["ResultScreen:<br/>getPlaylistResult()"]
    R --> S["TrackItem / ActionButtons:<br/>Linking.openURL to YouTube<br/>(no in-app player)"]
    R -.optional, currently<br/>feature-flagged off.-> T["Edge Function 2:<br/>create-youtube-playlist<br/>searching -> creating -> created"]
    R -.optional.-> U["create-share-link /<br/>get-shared-playlist -><br/>SharedResultScreen"]
```

---

## G. Field usage matrix

| Field | Exists in track data (`CatalogSeedTrack`) | Generated by image analysis (`GptResponse`) | Used in selection logic | Used in UI | Runtime impact if removed/changed |
|---|---|---|---|---|---|
| `laneId` | Yes (required) | Indirectly — GPT outputs `primary_lane_id`, mapped 1:1 | Yes — sole filter key in `getTracksByLane`/`selectCatalogTracks`/`selectVerifiedCatalogTracks` | No (never sent to client) | High — removing breaks all track filtering and lane-name lookup |
| `title` | Yes (required) | Yes (`playlist[].title`, GPT's own picks — only used when falling back to YouTube search) | Used as YouTube search query input (fallback path) and identity key (dedup checks in `validateCatalog`) | Yes (`TrackItem`, `TrackList`) | High |
| `artist` | Yes (required) | Yes (`playlist[].artist`) | Same as `title` | Yes | High |
| `youtubeVideoId` | Yes (optional field; 701/701 populated) | No (GPT never outputs a video id) | Yes — presence gates the "verified" fast path (`hasYoutubeVideoId`) | Yes (via DB `youtube_video_id` → watch/thumbnail URLs) | High |
| `energy` (`"low"|"medium"|"high"`, per track) | Yes (required) | Related but separate: GPT outputs `music_profile.energy_score` (1–5 numeric), not this enum | Yes — sole input to `sequencing.ts` energy-arc ordering and anchor eligibility | No | Medium — removing breaks playlist ordering, not selection |
| `moodTags` | Yes (required) | Related but separate: GPT outputs `analysis.mood_keywords` (free text) | **No** — never read by any selection/sequencing function found | No (no per-track tag UI exists; `MoodTags.tsx` is unused, see §I) | None currently — dead data |
| `sceneTags` | Yes (required) | Related but separate: GPT's internal STEP 3.5 visual profile (scene/subject) is **never output** in the JSON schema | **No** | No | None currently — dead data |
| `subTags` | Yes (optional; 701/701 populated) | No | **No** | No | None currently — dead data |
| `primary_lane_id` | n/a (analysis-side field) | Yes (required in `GptResponse`, validated against `VALID_LANE_IDS`) | Yes — drives everything in §F step 7–9 | No (server-only) | High |
| `confidence` | n/a | Yes (`0.0–1.0`) | No | **No** — stored in `PlaylistResult.confidence`/DB `analysis.confidence` but never rendered by any screen/component found | None currently — dead data end-to-end past storage |
| `music_profile.energy_score` | n/a | Yes (1–5) | Constrains GPT's own track picks ("stay within ±1") but is **not** used by the backend catalog-selection code (`selectCatalogTracks`/`sequencing.ts` use the catalog's own `energy` enum, not this score) | Yes — displayed as `musicProfile.energyScore` is present in `PlaylistResult` but not rendered by any screen found in this audit | Low today, but a semantic gap: two different "energy" concepts exist (image-analysis `energy_score` 1–5 vs. catalog `energy` low/med/high) and are never reconciled in code |
| `music_profile.primary_genre` / `secondary_genre` | n/a | Yes, constrained by prompt instructions to come from the selected lane's `allowedGenres` | No (not read by selection code) | Not directly rendered (no genre chip/label found in UI) | Stored only, currently descriptive metadata |
| `analysis.mood_keywords`, `sensory_impressions`, `cultural_context`, `location`, `time_of_day`, `season` | n/a | Yes (SCENE/MIXED only) | No | No component renders these (`MoodTags` exists but is unused/unwired) | Descriptive only, stored in JSONB, unused by UI/selection |
| `analysis.style_vibe`, `energy`, `color_tone` | n/a | Yes (PERSON/MIXED only) | No | No | Same as above |
| STEP 3.5 visual profile (scene/subject, brightness, saturation, contrast, color temperature, palette, light quality, texture, density, composition energy, openness, motion, social context) | n/a | **No** — explicitly prompted as "internal reasoning only... never output it directly, in the JSON or otherwise" (`gpt.ts:114-137`) | Influences GPT's lane choice internally, but is structurally invisible to the backend — no field, no DB column, nothing to inspect or reuse | No | This is the closest existing analog to "atmosphere stats," but it is fully discarded after the GPT call completes — nothing downstream ever sees it |
| `playlist_concept`, `playlist_subtitle` | n/a | Yes | No | Yes (hero title/subtitle) | Cosmetic |
| `reason` (per track) | n/a (catalog tracks get a synthesized string `"Catalog pick for the {laneId} lane"`; fallback tracks get GPT's own `reason` text) | Partially | No | Stored/returned but **not rendered** by `TrackItem` (only title/artist/rank/thumbnail shown) | None |

---

## H. Hard-coded dependencies

- **Lane IDs as literal strings, only place they're declared:** `curationLanes.ts:20,63,93,125,155,187,219,249,279,309,340,371,401,431,462,493,523,554,585,617,647` (the `id:` field of each of the 21 lane objects). Every other reference (`musicCatalog.ts` `laneId:` fields, `gpt.ts` prompt/validation, `db.ts` storage) is a *consumer* of these strings, not a second declaration — good, single source for the ID strings themselves.
- **Lane display name, duplicated by hand:** `curationLanes.ts` `name:` field (21×) vs. `src/data/loadingContent.ts:64-86` `LANE_SPOTLIGHTS` `name:` field (21×). No shared import; kept in sync manually per the file's own comment (`loadingContent.ts:56-58`).
- **Lane count assumption (`21`):** not literally hard-coded as a number anywhere found, but implicitly assumed by the 1:1 correspondence requirement between `CURATION_LANES` and `LANE_SPOTLIGHTS` — nothing enforces this at compile time or runtime (no test, no assertion).
- **`VALID_LANE_IDS` set membership check:** `gpt.ts:476,556` — the only runtime guard tying GPT output back to `CURATION_LANES`.
- **System prompt text embedding the lane catalogue:** `gpt.ts:23` (`CURATION_LANES_PROMPT = buildCurationLanesPrompt(CURATION_LANES)`), interpolated into `SYSTEM_PROMPT` at `gpt.ts:247`. This *is* generated from source data (not hand-duplicated text), but the surrounding prompt instructions (`gpt.ts:141-243`) are hand-written prose that assumes exactly 21 named lanes with specific "conflict resolver" pairs called out by name (e.g. `gpt.ts:227-243` — over a dozen lane-pair-specific tie-breaker rules referencing lane names directly in prose, not data-driven).
- **`track_source` CHECK constraint:** `supabase/migrations/20260625120000_add_primary_lane_to_playlists.sql:19-22` hardcodes the allowed values `('catalog', 'youtube_fallback', 'mixed')` — note `'mixed'` is allowed by the DB constraint but no code path in `db.ts`/`index.ts` currently ever writes `'mixed'` (only `'catalog'` or `'youtube_fallback'` are set, `index.ts:250`).
- **`PlaylistStatus` string union (frontend):** `src/types/playlist.ts:58-64` — `'pending' | 'analyzing' | 'searching' | 'creating' | 'created' | 'failed'`. No corresponding Postgres `CHECK`/enum constraint was found in the migrations directory for the `playlists.status` column itself (only `track_source` has a `CHECK`).
- **Loading-screen fallback subtitle text:** `gpt.ts:479` `FALLBACK_PLAYLIST_SUBTITLE` — a single hardcoded string used when GPT's subtitle is missing/too short.
- **`SAVE_TO_YOUTUBE_ENABLED = false`:** `src/components/result/ActionButtons.tsx:20` — a manual feature flag, not an env var or remote config.
- **UI labels:** "LANE SPOTLIGHT" (`LoadingScreen/index.tsx:239`), "Creating your soundtrack" (`LoadingScreen/index.tsx:225`) — plain literal strings, not data-driven.
- **No test files or fixtures** reference lane IDs/names — see §I.

---

## I. Data-quality findings

1. **Mislabeled `laneId` inside `DARK_HEAVY_HIPHOP_SEED_TRACKS` (highest severity data-integrity issue found)**
   - **File:** `supabase/functions/_shared/musicCatalog.ts:6684-6690`
   - **Track:** "Runaway" — Kanye West feat. Pusha T — `youtubeVideoId: "cv1naUa3_3g"`
   - **Export/array:** physically located inside `DARK_HEAVY_HIPHOP_SEED_TRACKS` (array starts `musicCatalog.ts:6413`), but its `laneId` field reads `"big-city-swagger-hiphop"` instead of `"dark-heavy-hiphop"`.
   - **Effect:** `getTracksByLane("dark-heavy-hiphop")` never returns this track (it's excluded by field value even though it lives in that array), while `getTracksByLane("big-city-swagger-hiphop")` returns it **twice** — once from its correctly-labeled counterpart inside `BIG_CITY_SWAGGER_HIPHOP_SEED_TRACKS`, and once from this mislabeled copy. Net effect: `big-city-swagger-hiphop` has one extra/duplicate "Runaway" entry (identical title/artist/videoId) and `dark-heavy-hiphop` is silently short one intended track.
   - **Severity:** High (silent selection-logic bug; not caught by `validateCatalog()`, whose in-lane duplicate check operates on title+artist within a single lane and wouldn't catch a cross-lane label mismatch).
   - **Automatically fixable:** Likely yes (single field value correction), but per audit scope this was **not** modified.
   - **Manual review required:** Yes — should confirm intent (was this meant to be a legitimate cross-lane duplicate with a copy-paste `laneId` mistake, or should the second copy be removed entirely?).

2. **22 duplicate `youtubeVideoId` groups (44 track objects) across lane boundaries**
   - Examples: `BuzJ5NArvgw` ("Them Changes" — Thundercat) appears in both `modern-jazz-groove` and `funk-disco-night`; `Dst9gZkq1a8` ("goosebumps" — Travis Scott feat. Kendrick Lamar) appears in both `hip-hop-night-drive` and `dark-heavy-hiphop`; `4iFP_wd6QU8` ("Square (2017)" — Yerin Baek) appears in both `cozy-cafe-mellow` and `sunny-stroll-pop`. Full list of 22 groups is reproducible from the catalog file.
   - **File:** `musicCatalog.ts` (multiple locations per group)
   - **Current impact:** By design, per `musicCatalog.ts:7212` ("같은 곡이 서로 다른 curation lane에 걸쳐 등장하는 것은 허용되므로, duplicate 검사는 lane 내부로 한정한다" — the same song appearing across different lanes is allowed by design; `validateCatalog()` intentionally only checks for duplicates *within* a lane). So most of these are **not bugs**, they are accepted cross-lane overlap. The one exception is finding #1 above, which is a same-video-ID duplicate landing inside a single lane's declared membership due to the mislabel.
   - **Severity:** Low/informational for the 21 legitimate cross-lane cases; High for the 1 case that's actually finding #1.
   - **Fixable/review:** No action implied by design; flagged here only for completeness per the audit checklist.

3. **25 duplicate normalized title+artist groups (52 track objects), including near-duplicate title spelling**
   - Example: "Feather" — Nujabes feat. Cise Starr & Akin (in `modern-jazz-groove`) vs. "Feather" — Nujabes (in `lofi-bedroom-solitude`, `youtubeVideoId` differs: `hQ5x8pHoIPA` vs. same — same video, different feature-artist string). "Luv(sic.) Part 3" vs. "Luv(sic.) pt3" (punctuation/spelling variant, `modern-jazz-groove` vs. `lofi-bedroom-solitude`, same `youtubeVideoId Fwv2gnCFDOc`). "Virtual Insanity" by Jamiroquai appears with **two different `youtubeVideoId`s** (`4JkIs37a2JE` in `modern-jazz-groove` vs. `OeTFAiYbR9o` in `funk-disco-night`) — two different uploads of the same song. "DNA." and "Mask Off" (Kendrick Lamar / Future) each appear with two different `youtubeVideoId`s across `big-city-swagger-hiphop` and `dark-heavy-hiphop`.
   - **Severity:** Low — same category as #2 (cross-lane overlap allowed by design), except the featured-artist-string and punctuation variants are worth normalizing before any future "one canonical track record" migration, since a flattened single-catalog model (per §J) would otherwise create true duplicate rows.
   - **Fixable:** Partially automatically (exact-match dedup), partially requires manual judgment (deciding canonical title/artist string, e.g. "Luv(sic.) Part 3" vs. "Luv(sic.) pt3", "feat. Cise Starr & Akin" vs. no-feature-credit).

4. **`validateCatalog()` exists but no caller was found**
   - **File:** `musicCatalog.ts:7214-7266`
   - It checks required fields, valid `energy` values, blank (whitespace-only) `youtubeVideoId`, in-lane duplicate title+artist, and lanes below `MIN_LANE_TRACK_COUNT=5`. Grep across `supabase/`, `src/`, and `scripts/` found no call site.
   - **Severity:** Medium (process gap, not a data bug) — this is the one built-in mechanism for catching exactly the kind of issue in finding #1, but it isn't wired into anything (no test, no CI script, no boot-time check in the Edge Function).
   - **Manual review required:** Confirm whether it's invoked outside this repo (e.g. a manual `node`/`deno` REPL step) — could not verify from repository contents alone.

5. **Two "energy" concepts never reconciled**
   - Catalog `CatalogSeedTrack.energy: "low"|"medium"|"high"` (used by `sequencing.ts`) vs. GPT's `music_profile.energy_score: 1-5` (used only to constrain GPT's *own* fallback track picks, per the prompt's "All 10 songs must stay within ±1 of the energy score" instruction). No code path maps one to the other or cross-checks them.
   - **Severity:** Low today (no observed failure mode), but relevant to §J if atmosphere/energy stats are unified in a redesign.

6. **Dead/unused code found during data-quality review (not track data, but adjacent):**
   - `src/components/result/MoodTags.tsx` — defined, exported, never imported by any screen.
   - `src/services/playlist.ts:314-329` `generatePlaylist()` — comment calls it "레거시 함수" (legacy) for a `usePlaylistGeneration` hook that does not exist in `src/hooks/` (only `useImagePicker.ts` exists there).
   - `src/services/storage.ts:22-61` `uploadImageToStorage()` — exported, not called anywhere in `src/` (the actually-used upload path is `uploadUserImage`).
   - `musicCatalog.ts` `getVerifiedTracksByLane()` — exported, no call site found (its logic is duplicated inline inside `selectVerifiedCatalogTracks`).

No missing values, empty tag arrays, inconsistent field *types*, or inconsistent field-name casing were found in the 701-track catalog itself — the structural data quality of the catalog is otherwise clean.

---

## J. Migration impact map

For each possible future change, based only on what currently exists (no implementation performed):

| Possible change | Directly affected files | Indirectly affected | Type impact | Runtime impact | Data impact | UI impact | Backend impact | Test impact | Risk |
|---|---|---|---|---|---|---|---|---|---|
| Flatten all tracks into a single catalog (drop lane-array grouping) | `musicCatalog.ts` (21 arrays → 1), `getTracksByLane`, `selectCatalogTracks`, `selectVerifiedCatalogTracks` | `sequencing.ts` (`buildLaneIndexMap` depends on per-lane array position as a "representativeness" proxy — would need a replacement signal) | Low (still `CatalogSeedTrack[]`) | Medium — every lane-scoped query becomes a filter over one big array instead of native separation | Medium — must decide what happens to the 21/25/22 duplicate/cross-lane entries found in §I when there's only one array | None directly | None directly | None (no tests exist to update) | Medium |
| Remove fixed lane membership as the primary selection rule | `curationLanes.ts`, `gpt.ts` (`SYSTEM_PROMPT`, `buildCurationLanesPrompt`, `VALID_LANE_IDS`), `analyze-and-search/index.ts` (steps 7–9), `sequencing.ts` (`buildLaneIndexMap` keyed by `laneId`) | `db.ts` (`updatePlaylistAnalysis` writes `primary_lane_id`/`primary_lane_name`), `20260625120000_add_primary_lane_to_playlists.sql` schema, `loadingContent.ts` (`LANE_SPOTLIGHTS`) | High — `GptResponse.primary_lane_id: string` and all lane-keyed types would need redesign | High — this is the core selection algorithm | High — historical rows keep `primary_lane_id` values with no forward equivalent unless backfilled | High — "LANE SPOTLIGHT" loading card has nothing to show | High — GPT prompt is the single largest hand-written artifact in the system (~700 lines of lane-specific tie-breaker prose) | None (no tests) | High |
| Preserve `laneId` temporarily for backward compatibility | `CatalogSeedTrack` type (add new fields alongside, keep `laneId`), `db.ts` (keep writing `primary_lane_id`) | none beyond additive change | Low | Low | Low | None | Low | None | Low |
| Add `primaryGenre` | `CatalogSeedTrack` type, `musicCatalog.ts` (701 objects need backfilling), `sequencing.ts` (unaffected unless used), catalog scripts (`check-catalog-youtube-ids.mjs`-style tooling would need updates to validate the new field) | `gpt.ts` (`music_profile.primary_genre` already exists at the *analysis* level — would need to be reconciled with a new catalog-level field of the same name, avoiding confusion between "the genre GPT free-typed" and "the genre this track is tagged with") | Medium (new required or optional field on 701 objects) | Low until selection logic starts reading it | High — 701 objects need populating; no automated genre-tagging exists today (would require either manual tagging or a new one-off script) | None until surfaced | None | New tests would need to be written from scratch (none exist to extend) | Medium |
| Add `secondaryGenres` | Same as above, plus needs an array type decision (`string[]`) | Same | Medium | Low | High (same backfill problem) | None | None | None | Medium |
| Add `subGenres` | Same as above | Same | Medium | Low | High | None | None | None | Medium |
| Add `country` | `CatalogSeedTrack` type, `musicCatalog.ts` | None found today reads geography from tracks (only `analysis.location`/`cultural_context` exist, and only as free-text GPT output, explicitly told in the prompt to be "secondary flavor only") | Low | Low | High (backfill) | None | None | None | Low |
| Add `language` | Same | Same | Low | Low | High (backfill) | None | None | None | Low |
| Add `era` | Same | Prompt already constrains GPT picks to "1980s to present" (`gpt.ts:253`) — an `era` field on catalog tracks would be new structured data, not derivable from anything currently stored | Low | Low | High (backfill) | None | None | None | Low |
| Add `vocalType` | Same | None found | Low | Low | High (backfill) | None | None | None | Low |
| Add per-track atmosphere stats (season/weather/time-of-day/motion/texture affinity) | `CatalogSeedTrack` type, `musicCatalog.ts` (701 backfills), `sequencing.ts` if used for ordering | `gpt.ts` STEP 3.5 visual profile is the closest existing concept but is explicitly discarded (never output) — a redesign would need to promote it from prompt-only reasoning into an actual output field, which also touches the JSON schema, `GptResponse` type, and `db.ts`'s JSONB mapping | High — this is genuinely new structured data on both sides (image analysis output *and* catalog schema) with no existing field to extend | Medium initially (additive), High once used for selection (replaces `laneId` filtering) | Very High — 701 tracks need atmosphere tagging from scratch; no existing signal in the repo approximates this at the catalog level | Medium (if surfaced as "why this track" copy) | High (GPT prompt + response schema + validation) | None (no tests) | High |
| Adding `confidence` | Already exists (`GptResponse.confidence`, `Analysis.confidence`) — not a new field | n/a | None | None | None | Already unused in UI today (§G) | None | None | Low (already done, just unused) |
| Adding `evidence source` / `review status` (provenance/QA metadata for genre or atmosphere tags) | New columns/fields entirely — nothing analogous exists today | Would interact with whatever backfill/tagging process is chosen for genre/atmosphere | Medium | Low | Medium | Possibly (an admin/debug view, none exists today — `scripts/generate-youtube-debug.mjs` is the closest thing, a static HTML report, not a live admin screen) | Low | None | Medium |
| Changing image analysis from lane selection to atmosphere output | `gpt.ts` (full `SYSTEM_PROMPT` rewrite — the largest single hand-authored asset in the codebase, ~700 lines including 8 "conflict resolver" and "tie-breaker" rule blocks written around specific lane names), `GptResponse` type, `db.ts` (`updatePlaylistAnalysis` field mapping), `analyze-and-search/index.ts` (steps 7–9 entirely rebuilt around similarity search instead of `laneId` equality) | `curationLanes.ts` likely deprecated/removed, `loadingContent.ts` (`LANE_SPOTLIGHTS`) needs a replacement concept, `sequencing.ts`'s anchor logic (keyed by lane-array position) needs a new "representativeness" signal | High | High | High | High (loading screen's lane-spotlight concept has no direct successor) | High | None | High |
| Searching across the entire catalog (drop lane-scoped filtering) | `getTracksByLane`, `selectCatalogTracks`, `selectVerifiedCatalogTracks`, `sequencing.ts` (`buildLaneIndexMap`) | `analyze-and-search/index.ts` steps 7–9 | Medium | High — replaces O(lane) filtering with O(catalog) similarity ranking, a new algorithm class entirely (nothing resembling a similarity/embedding search exists in the repo today) | Low (catalog content itself doesn't need to change) | None | None | None | High |
| Dynamic playlist construction (replace deterministic seeded-shuffle + energy-arc with similarity-ranked selection) | `sequencing.ts`, `musicCatalog.ts` (`selectCatalogTracks`/`selectVerifiedCatalogTracks`), `analyze-and-search/index.ts` | `db.ts` `track_source` semantics (`'catalog'`/`'youtube_fallback'`/unused `'mixed'`) may need to change meaning | Medium | High | Low | Low (playlist ordering is not surfaced distinctly in UI — tracks just render in `rank` order) | Medium | None | Medium |
| Retaining user-facing generated atmosphere names without fixed internal lanes | `gpt.ts` (`playlist_concept`/`playlist_subtitle` generation already does something similar — freeform, prompt-generated names not tied to a fixed enum) | `loadingContent.ts` `LANE_SPOTLIGHTS` would need to become dynamic/generated rather than a static hand-written array | Low–Medium | Low | Low | Medium (Lane Spotlight card during loading currently depends on a fixed, known-in-advance list to rotate through *before* analysis completes — a fully dynamic/generated name breaks that "spotlight preview" concept, since it wouldn't exist until after analysis) | Low | None | Medium |

---

## K. Unknowns

Everything below could not be verified from the repository contents alone:

- **Whether `validateCatalog()` (§D, §I finding 4) is ever executed** — no call site exists in the repo; it may be run manually via a Deno REPL, a Supabase deploy hook, or not at all. Cannot confirm from source alone.
- **The original `CREATE TABLE` statements for `playlists`, `tracks`, `profiles`, and `oauth_tokens`.** Only four incremental `ALTER TABLE`/`CREATE TABLE IF NOT EXISTS events` migrations exist in `supabase/migrations/`. The base schema was evidently created outside of what's tracked here (e.g., directly in the Supabase dashboard, via a squashed/since-deleted migration, or in a different repository/branch). This means the full current column list, types, constraints, and RLS policies for `playlists`/`tracks`/`profiles` cannot be fully confirmed from this repository — only what's inferable from the four migrations plus the columns referenced in application code (`db.ts`, `playlist.ts`, etc.).
- **Whether RLS policies exist and what they cover** for `playlists`/`tracks`/`profiles`/`oauth_tokens` — only the `events` table's RLS policy is defined in a tracked migration (`20260703120000_add_events_table.sql:21-27`). Code comments (e.g. `playlist.ts:43-44`, "RLS에 의해 현재 사용자 소유 데이터만 조회됨") assert RLS is in effect for `playlists`/`tracks`, but the policy definitions themselves are not in this repository.
- **Whether `src/hooks/useImagePicker.ts` is actually used anywhere.** A search across `src/` for its import/usage did not surface a call site within the files read during this audit; a full exhaustive cross-check of every screen file was not performed for this specific hook. Flagged as unconfirmed rather than asserted dead.
- **Whether `scripts/apply-youtube-ids-from-template.mjs`, when run with `--apply`, has been used to introduce the mislabeled-lane bug in finding §I-1**, or whether that mislabel predates the script / was a manual edit. The script only touches `youtubeVideoId` values per its own code comments, not `laneId`, so it is unlikely to be the cause, but this could not be fully confirmed by history inspection within the read-only scope of this audit (git blame/log archaeology was not performed).
- **Whether any external system (CI, a separate ops repo, a Supabase dashboard-configured job) runs the `scripts/*.mjs` tools regularly**, or whether they are purely ad hoc/manual. `package.json` only wires up two of the five scripts as npm scripts (`debug:youtube-playlists`, `debug:youtube-metadata`); the other three (`check-catalog-youtube-ids.mjs`, `export-youtube-id-template.mjs`, `apply-youtube-ids-from-template.mjs`) have no `package.json` script entry and are presumably run directly with `node`.
- **The real-world track-count/lane-count assumptions "baked into" the GPT prompt's tie-breaker prose** (§H) were not evaluated for correctness against actual GPT-4o behavior — this audit is static/read-only and did not invoke the OpenAI API to observe live lane-selection accuracy.
- **Whether `docs/lane-selection-review.md` / `.ko.md` / `.html` / `.ko.html`** (pre-existing files in `docs/`, not created by this audit) contain findings that overlap with or supersede parts of this report — they were not read as part of this audit's scope (the task specified inspecting code/data, not pre-existing docs), so any relationship between their contents and this report's findings is unconfirmed.

---

## L. Recommended next investigation

(Investigation/evidence-gathering only — no implementation guidance, per audit scope.)

1. Confirm the actual current Postgres schema for `playlists`, `tracks`, `profiles`, and `oauth_tokens` directly against the live Supabase project (e.g. `supabase db dump` or dashboard schema export), since the tracked migrations only show incremental changes, not the base tables (§K).
2. Confirm current RLS policy definitions for `playlists`/`tracks`/`profiles` directly against the live project, since none are present in tracked migrations (§K).
3. Determine whether `validateCatalog()` runs anywhere (CI, manual step, or nowhere) so its role in a future migration's data-quality gate is understood before being relied upon or replaced.
4. Decide, with a human reviewer, whether the mislabeled "Runaway" track (§I-1) is an isolated incident or whether a full scripted scan for laneId/array-membership mismatches across the whole 701-track catalog is warranted before any genre backfill begins (a scan script could be written as a follow-up, read-only step).
5. Inventory the full list of 25 duplicate-title-artist and 22 duplicate-video-id groups in detail (this report references representative examples; the complete lists are mechanically reproducible from `musicCatalog.ts` and should be produced as a dedicated artifact before deciding on canonicalization rules for a flattened catalog).
6. Clarify with the product owner what "atmosphere stats" should structurally contain, using GPT's already-designed-but-discarded STEP 3.5 visual profile (`gpt.ts:114-137`) as a starting vocabulary (scene/subject, weather, brightness, saturation, contrast, color temperature, palette, light quality, texture, density, composition energy, openness, motion, social context) — since this is the one piece of prior art in the repo closest to the target concept.
7. Investigate whether `usePlaylistGeneration`/`generatePlaylist()` (§I finding 6) is truly dead or whether it's reachable from a code path outside the screens read in this audit (e.g. a dev-only debug entry point), before removing it in any cleanup pass.
8. Get git history/blame context (outside this audit's read-only, current-state-only scope) on when/why the `dark-heavy-hiphop` vs. `big-city-swagger-hiphop` mislabel (§I-1) was introduced, to judge whether similar silent mislabels are likely elsewhere.
