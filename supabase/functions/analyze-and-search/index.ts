import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { DbOperationError, SafeError } from "./errors.ts";
import { analyzeImage } from "./services/gpt.ts";
import { searchYouTubeTracks } from "./services/youtube.ts";
import {
  ensureProfileExists,
  insertPendingPlaylist,
  insertTracks,
  updatePlaylistAnalysis,
  updatePlaylistFailed,
  updatePlaylistStatus,
} from "./services/db.ts";
import { checkRateLimit, getClientIp } from "./services/rateLimit.ts";

const MIN_TRACKS = 5;
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

    // ── 8. 분석 결과 저장 + status → 'searching' ─────────────────────────
    await updatePlaylistAnalysis(supabaseAdmin, playlistId, gptResult);

    // ── 9. YouTube 트랙 검색 ──────────────────────────────────────────────
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!youtubeApiKey) throw new SafeError("음악 검색 서비스가 설정되지 않았습니다.");

    setStage("youtube_search_started");
    const foundTracks = await searchYouTubeTracks(gptResult.playlist, youtubeApiKey);
    setStage("youtube_search_completed");

    if (foundTracks.length < MIN_TRACKS) {
      // GPT hallucination(존재하지 않는 곡)인지 YouTube 검색 쿼리 문제인지 진단하기 위한 로그.
      // title/artist만 남기고 API key, signed URL 등 민감 정보는 절대 포함하지 않음.
      const candidateTitles = gptResult.playlist.map((track) => ({ title: track.title, artist: track.artist }));
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
