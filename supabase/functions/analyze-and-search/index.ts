import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { DbOperationError, SafeError } from "./errors.ts";
import { analyzeImage, type GptPlaylistItem } from "./services/gpt.ts";
import { searchYouTubeTracks, type YoutubeTrack } from "./services/youtube.ts";
import {
  ensureProfileExists,
  insertPendingPlaylist,
  insertTracks,
  type TrackSource,
  updatePlaylistAnalysis,
  updatePlaylistFailed,
  updatePlaylistStatus,
} from "./services/db.ts";
import { checkRateLimit, getClientIp } from "./services/rateLimit.ts";
import { sequenceCatalogTracks } from "./services/sequencing.ts";
import {
  FINAL_TRACK_COUNT,
  filterEligibleByGenre,
  rankCatalogTracks,
  selectTopScoredTracks,
} from "./services/scoring.ts";
import {
  type CatalogTrack,
  hasYoutubeVideoId,
  MUSIC_CATALOG,
  selectFlatCatalogTracks,
} from "../_shared/musicCatalog.ts";

// verified(youtubeVideoId 보유) catalog track을 YoutubeTrack DB insert 형식으로 변환.
// hasYoutubeVideoId로 필터링된 track만 들어오므로 youtubeVideoId는 항상 non-empty string이다.
function toVerifiedTrackRows(tracks: CatalogTrack[]): YoutubeTrack[] {
  return tracks.map((track, idx) => {
    const videoId = track.youtubeVideoId as string;
    return {
      rank: idx + 1,
      title: track.title,
      artist: track.artist,
      reason: "Catalog pick",
      youtube_video_id: videoId,
      youtube_video_url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  });
}

const MIN_TRACKS = 5;
const MIN_CATALOG_TRACKS = 5;
// 최종적으로는 FINAL_TRACK_COUNT(20, scoring.ts에서 import — 여러 곳에 20을 따로 하드코딩하지 않음)곡만
// 쓰지만, "신뢰 오프너(1번)/친숙한 mood lock(2번)" 후보가 seededShuffle에서 잘려나가지 않도록 선택
// 후보 풀 자체를 조금 더 크게(count) 가져온다. 실제 삽입 트랙 수는 변하지 않음. 1.5x 비율(기존
// 16/10=1.6x과 동일한 성격)로 유지 — Phase 7에서 lane anchor 로직이 제거된 뒤로는 이 여유분이
// 기능적으로는 inert하지만(candidatePool을 그대로 순서대로 자르므로), 향후 anchor류 로직 재도입
// 여지와 일관성을 위해 finalCount보다 크게 유지한다.
const CATALOG_CANDIDATE_POOL_SIZE = 30;
const IMAGE_BUCKET = "user-images";
const SIGNED_URL_TTL_SECONDS = 300; // GPT 호출 시간을 고려한 5분
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retry-count",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: CORS_HEADERS });
  }

  // 외부 스코프 — catch 블록에서 failed 처리 시 접근
  let playlistId: string | null = null;
  // deno-lint-ignore no-explicit-any
  let supabaseAdmin: any = null;
  // 진단용 현재 단계 — 민감정보(API key, JWT, signed URL, user token) 절대 포함 금지
  let stage = "request_received";
  const setStage = (next: string) => {
    stage = next;
    console.log(`[analyze-and-search] stage=${next}`);
  };

  try {
    setStage("request_received");

    // ── 0. IP 기반 Rate Limit 검사 (인증 전, 요청 초반) ────────────────────
    // GPT-4o Vision + YouTube Search API를 호출하는 비용 발생 함수이므로
    // GPT 호출(6번) 이전에 반드시 통과해야 한다.
    const clientIp = getClientIp(req);
    if (!checkRateLimit(`ip:${clientIp}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS).allowed) {
      return Response.json(
        { success: false, error: "Too many requests. Please try again later.", code: "RATE_LIMITED", stage },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // ── 1. 서버 환경변수 확인 + supabaseAdmin 클라이언트 생성 ───────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new SafeError("서버 설정이 올바르지 않습니다.");
    }

    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // ── 2. Authorization 헤더에서 JWT 추출 및 검증 ───────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { error: "인증이 필요합니다.", code: "AUTH_REQUIRED", stage },
        { status: 401, headers: CORS_HEADERS },
      );
    }
    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: authError } =
      await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return Response.json(
        { error: "유효하지 않은 인증 토큰입니다.", code: "INVALID_AUTH_TOKEN", stage },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    // 클라이언트가 보낸 user_id를 절대 신뢰하지 않음 — JWT에서만 추출
    // anonymous user(is_anonymous=true)도 user.id가 존재하면 통과 (email 필수 체크 없음)
    const userId = user.id;
    setStage("auth_verified");
    console.log(`[analyze-and-search] auth_verified userId=${userId.slice(0, 8)}...`);

    // ── 2-1. user_id 기반 Rate Limit 검사 (JWT 검증 후) ─────────────────────
    if (!checkRateLimit(`user:${userId}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS).allowed) {
      return Response.json(
        { success: false, error: "Too many requests. Please try again later.", code: "RATE_LIMITED", stage },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // ── 3. 요청 바디 파싱 및 검증 ────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "요청 형식이 올바르지 않습니다.", code: "INVALID_REQUEST_BODY", stage },
        { status: 400, headers: CORS_HEADERS },
      );
    }
    setStage("body_parsed");

    const imageStoragePath =
      body !== null &&
        typeof body === "object" &&
        "image_storage_path" in body &&
        typeof (body as Record<string, unknown>).image_storage_path === "string"
        ? (body as { image_storage_path: string }).image_storage_path
        : null;

    if (!imageStoragePath) {
      return Response.json(
        { error: "image_storage_path가 필요합니다.", code: "MISSING_IMAGE_STORAGE_PATH", stage },
        { status: 400, headers: CORS_HEADERS },
      );
    }
    setStage("image_path_received");

    // ── 3-2. profiles row 보장 (Anonymous Sign-In 등으로 profiles에 row가 없는 경우 대비) ──
    // playlists.user_id → profiles(id) FK 제약을 만족시키기 위해 insertPendingPlaylist 전에 반드시 실행
    setStage("profile_ensure_started");
    await ensureProfileExists(supabaseAdmin, userId);
    setStage("profile_ensure_completed");

    // ── 4. playlist 행 삽입 (status = 'pending') ─────────────────────────
    setStage("playlist_insert_started");
    playlistId = await insertPendingPlaylist(supabaseAdmin, userId, imageStoragePath);
    setStage("playlist_insert_completed");

    // ── 5. status → 'analyzing' ───────────────────────────────────────────
    setStage("status_update_analyzing_started");
    await updatePlaylistStatus(supabaseAdmin, playlistId, "analyzing");
    setStage("status_update_analyzing_completed");

    // ── 6. Storage에서 이미지 Signed URL 발급 (GPT에 URL로 전달) ──────────
    setStage("signed_url_started");
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(IMAGE_BUCKET)
      .createSignedUrl(imageStoragePath, SIGNED_URL_TTL_SECONDS);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      setStage("signed_url_failed");
      // signed URL 전체는 절대 로그하지 않음 — Storage가 반환한 에러 메시지만 남김
      console.error("[analyze-and-search] signed_url_failed", {
        errorMessage: signedUrlError?.message ?? "signedUrl이 반환되지 않음",
      });
      throw new SafeError("이미지 접근 URL 생성에 실패했습니다.");
    }
    setStage("signed_url_created");

    // ── 7. GPT-4o Vision으로 이미지 분석 ─────────────────────────────────
    setStage("openai_analysis_started");
    const gptResult = await analyzeImage(signedUrlData.signedUrl);
    setStage("openai_analysis_completed");

    // 진단용 lane 선택 로그 — 사용자에게 노출되지 않는 백엔드 로그 전용.
    // image_type/energy_score/lane_id만 남기고, 이미지 내용/분석 원문(mood_keywords 등)은 남기지 않는다.
    console.log("[analyze-and-search] lane_selected", {
      imageType: gptResult.image_type,
      energyScore: gptResult.music_profile.energy_score,
      primaryLaneId: gptResult.primary_lane_id,
    });

    // ── 7-1. verified(youtubeVideoId 보유) catalog track을 이미지 벡터로 스코어링 ──────────────
    // Step 5-A: content-blind seeded shuffle을 이미지-트랙 유사도 스코어링으로 대체.
    // Step 6: 스코어링 전에 genre-first 필터를 먼저 적용한다 — full catalog -> genre eligibility
    // filter -> 기존 catalog eligibility 검사(checkTrackEligibility, rankCatalogTracks 내부) ->
    // 기존 30차원 스코어링(변경 없음) -> 결정론적 정렬(변경 없음) -> 후보 선택 -> sequencing 순서.
    // gptResult.targetStats/contextAffinity와 각 트랙의 stats/affinity 간 가중 유사도로 순위를 매기고
    // 상위 CATALOG_CANDIDATE_POOL_SIZE개를 후보로 선택한다.
    // playlistId/시드/lane/mood tag/GPT 추천 곡 제목/coarse energy는 스코어링에 전혀 사용하지 않는다.
    // genre는 스코어 성분이나 tie-break가 아니라 스코어링 이전의 순수 포함/제외 필터로만 쓰인다.
    const verifiedCatalogPool = MUSIC_CATALOG.filter(hasYoutubeVideoId);
    const genreEligibleCatalogPool = filterEligibleByGenre(
      verifiedCatalogPool,
      gptResult.music_profile.primaryGenres,
      gptResult.music_profile.subgenres,
    );
    const { ranked: rankedCatalogTracks, skipped: skippedCatalogTracks } = rankCatalogTracks(
      { targetStats: gptResult.targetStats, contextAffinity: gptResult.contextAffinity },
      genreEligibleCatalogPool,
    );
    const topScoredTracks = selectTopScoredTracks(rankedCatalogTracks, CATALOG_CANDIDATE_POOL_SIZE);

    // 진단용 스코어링 요약 로그 — 이미지, signed URL, 전체 GPT 응답, 전체 벡터, 795개 전체 점수는 절대 남기지 않는다.
    console.log("[analyze-and-search] catalog_scoring_complete", {
      genreEligibleTracks: genreEligibleCatalogPool.length,
      eligibleTracks: rankedCatalogTracks.length,
      skippedTracks: skippedCatalogTracks.length,
      selectedCandidates: topScoredTracks.length,
      topScore: rankedCatalogTracks[0]?.totalScore ?? null,
      lowestCandidateScore:
        rankedCatalogTracks[Math.min(CATALOG_CANDIDATE_POOL_SIZE, rankedCatalogTracks.length) - 1]?.totalScore ??
          null,
      topCandidates: rankedCatalogTracks.slice(0, 3).map((entry) => ({
        artist: entry.track.artist,
        title: entry.track.title,
        totalScore: entry.totalScore,
        atmosphereScore: entry.atmosphereScore,
        desiredSoundScore: entry.desiredSoundScore,
        seasonScore: entry.seasonScore,
        timeScore: entry.timeScore,
        weatherScore: entry.weatherScore,
      })),
    });

    // 개별 부적격 트랙 진단 — {artist, title, reason}만 남기고 전체 track 객체는 남기지 않는다.
    // 카탈로그가 정상이면(validate-music-catalog.mjs 기준 795/795 통과) 사실상 발생하지 않는다.
    if (skippedCatalogTracks.length > 0) {
      console.warn("[analyze-and-search] catalog_scoring_skipped_tracks", {
        skippedTracks: skippedCatalogTracks,
      });
    }

    setStage("catalog_verified_check_completed");

    // Step 6 genre-first architecture, dominant path: gpt.ts's analyzeImage() already gates
    // primaryGenres/subgenres on a pre-flight coverage check (>= FINAL_TRACK_COUNT eligible catalog
    // tracks for the exact selected genres, one correction retry, explicit failure otherwise) —
    // so genreEligibleCatalogPool.length here is already guaranteed >= FINAL_TRACK_COUNT before this
    // request ever reaches scoring. The only way topScoredTracks can still fall short of
    // FINAL_TRACK_COUNT is if checkTrackEligibility (stats/affinity/youtubeVideoId shape checks)
    // rejects enough otherwise-genre-eligible tracks — not expected against the validated 795-track
    // catalog (validate-music-catalog.mjs), but checked explicitly rather than assumed.
    if (topScoredTracks.length >= FINAL_TRACK_COUNT) {
      await updatePlaylistAnalysis(supabaseAdmin, playlistId, gptResult, "catalog");

      // 트랙 정체성은 그대로 두고 순서만 energy arc로 재배치한다.
      // Lane 기반 anchor 로직은 제거됨 (Phase 7). 실패 시 원본 순서로 fallback.
      const sequencedVerifiedTracks = sequenceCatalogTracks(
        topScoredTracks,
        FINAL_TRACK_COUNT,
      );

      const rankedTracks = toVerifiedTrackRows(sequencedVerifiedTracks);

      setStage("db_save_started");
      await insertTracks(supabaseAdmin, playlistId, rankedTracks);
      setStage("db_save_completed");

      // status는 'searching' 유지 — Edge Function 2(create-youtube-playlist)가 creating/created 처리.
      return Response.json({ playlist_id: playlistId }, { status: 200, headers: CORS_HEADERS });
    }

    // Genre-filtered scoring produced fewer than FINAL_TRACK_COUNT candidates despite gpt.ts's
    // upstream genre-selection adequacy gate. Per the genre-first architecture this must NOT fall
    // back to a genre-blind selection (selectFlatCatalogTracks below would silently bypass the
    // user's selected canonical genres) and must NOT return a short playlist as a successful
    // result — fail explicitly instead.
    console.error("[analyze-and-search] genre_filtered_scoring_insufficient", {
      genreEligibleTracks: genreEligibleCatalogPool.length,
      scoredCandidates: topScoredTracks.length,
      requiredFinalTrackCount: FINAL_TRACK_COUNT,
    });
    throw new SafeError("선택된 장르에 맞는 곡을 충분히 찾지 못했습니다. 다시 시도해 주세요.");

    // ── Legacy flat-catalog / YouTube-search fallback — DEAD CODE under the current genre-first
    // architecture (unreachable: the throw above always fires first for the one and only request
    // flow this file handles). Preserved verbatim, not deleted, per this task's "do not redesign"
    // instruction and in case a future production path exists that does not perform canonical
    // genre filtering and still needs a genre-blind fallback. Do not wire this back into the
    // dominant genre-filtered path above.
    //
    // ── 7-2. flat 카탈로그에서 후보 선택 — 673개 전체 풀에서 seeded shuffle.
    // verified track이 부족하면 youtubeVideoId 없는 트랙도 포함한 풀에서 선택한다.
    // 5개 미만이면 GPT 추천(YouTube search) fallback.
    const catalogTracks = selectFlatCatalogTracks({
      seed: playlistId,
      count: CATALOG_CANDIDATE_POOL_SIZE,
    });

    const trackSource: TrackSource = catalogTracks.length >= MIN_CATALOG_TRACKS ? "catalog" : "youtube_fallback";

    // 트랙 정체성은 그대로 두고 순서만 energy arc로 재배치한다.
    const sequencedCatalogTracks =
      trackSource === "catalog"
        ? sequenceCatalogTracks(catalogTracks, FINAL_TRACK_COUNT)
        : catalogTracks;

    const tracksForYoutubeSearch: GptPlaylistItem[] = trackSource === "catalog"
      ? sequencedCatalogTracks.map((track, idx) => ({
        rank: idx + 1,
        title: track.title,
        artist: track.artist,
        reason: "Catalog pick",
      }))
      : gptResult.playlist;

    // ── 8. 분석 결과 저장(primary_lane_id, track_source 포함) + status → 'searching' ──────
    // YouTube 검색(9번) 이전에 저장하므로, 이후 단계에서 실패해도 어떤 lane/source가 실패했는지 추적 가능
    await updatePlaylistAnalysis(supabaseAdmin, playlistId, gptResult, trackSource);

    // ── 9. YouTube 트랙 검색 ──────────────────────────────────────────────
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!youtubeApiKey) throw new SafeError("음악 검색 서비스가 설정되지 않았습니다.");

    setStage("youtube_search_started");
    const foundTracks = await searchYouTubeTracks(tracksForYoutubeSearch, youtubeApiKey);
    setStage("youtube_search_completed");

    if (foundTracks.length < MIN_TRACKS) {
      // GPT hallucination(존재하지 않는 곡)인지 YouTube 검색 쿼리 문제인지 진단하기 위한 로그.
      // title/artist만 남기고 API key, signed URL 등 민감 정보는 절대 포함하지 않음.
      const candidateTitles = tracksForYoutubeSearch.map((track) => ({ title: track.title, artist: track.artist }));
      const foundTitles = foundTracks.map((track) => ({ title: track.title, artist: track.artist }));
      console.error("[analyze-and-search] insufficient_youtube_matches", {
        totalCandidates: candidateTitles.length,
        foundCount: foundTitles.length,
        missingCount: candidateTitles.length - foundTitles.length,
        candidateTitles,
        foundTitles,
      });
      throw new SafeError("적합한 음악을 충분히 찾지 못했습니다. 다시 시도해 주세요.");
    }

    // ── 10. rank 순차 재정렬 (5-9개 찾은 경우 포함) ────────────────────────
    const rankedTracks = foundTracks.map((track, idx) => ({ ...track, rank: idx + 1 }));

    // ── 11. tracks 테이블에 삽입 ──────────────────────────────────────────
    setStage("db_save_started");
    await insertTracks(supabaseAdmin, playlistId, rankedTracks);
    setStage("db_save_completed");

    // ── 12. status는 'searching' 유지 — Edge Function 2가 creating/created 처리
    return Response.json({ playlist_id: playlistId }, { status: 200, headers: CORS_HEADERS });

  } catch (err) {
    const isDbError = err instanceof DbOperationError;

    // 진단 로그 — stage/dbStep/error.message/error.code/error.details/error.hint만 남김.
    // API key, JWT, service role key, signed URL 전체, image URL 전체는 절대 포함하지 않음.
    console.error("[analyze-and-search] failed", {
      stage,
      dbStep: isDbError ? err.dbStep : undefined,
      errorName: err instanceof Error ? err.name : typeof err,
      errorMessage: err instanceof Error ? err.message : String(err),
      pgCode: isDbError ? err.pgCode : undefined,
      pgDetails: isDbError ? err.pgDetails : undefined,
      pgHint: isDbError ? err.pgHint : undefined,
      pgMessage: isDbError ? err.pgMessage : undefined,
    });

    // 실패 시 playlist 상태를 failed로 업데이트
    if (playlistId && supabaseAdmin) {
      const safeMessage = err instanceof SafeError
        ? err.message
        : "플레이리스트 생성 중 오류가 발생했습니다.";
      await updatePlaylistFailed(supabaseAdmin, playlistId, safeMessage).catch(() => {});
    }

    // stage/에러 타입 기준 code/message 분기 — OpenAI/YouTube/DB 로직 자체는 건드리지 않음
    let userMessage = err instanceof SafeError
      ? err.message
      : "플레이리스트 생성 중 오류가 발생했습니다.";
    let code = "ANALYZE_AND_SEARCH_FAILED";

    if (isDbError) {
      code = err.code; // "DB_OPERATION_FAILED" | "DB_SAVE_FAILED"
    } else if (stage === "signed_url_failed") {
      userMessage = "이미지 접근 URL 생성에 실패했습니다.";
      code = "SIGNED_URL_FAILED";
    } else if (stage === "openai_analysis_started") {
      userMessage = "이미지 분석 중 오류가 발생했습니다.";
      code = "OPENAI_ANALYSIS_FAILED";
    } else if (stage === "youtube_search_started" || stage === "youtube_search_completed") {
      code = "YOUTUBE_SEARCH_FAILED";
    }

    const responseBody: Record<string, unknown> = { error: userMessage, code, stage };
    if (isDbError) responseBody.dbStep = err.dbStep;

    return Response.json(responseBody, { status: 500, headers: CORS_HEADERS });
  }
});
