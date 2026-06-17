import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { SafeError } from "./errors.ts";
import {
  getOauthToken,
  getPlaylist,
  getTracks,
  updatePlaylistCreated,
  updatePlaylistFailed,
  updatePlaylistStatus,
} from "./services/db.ts";
import { refreshAccessToken } from "./services/google.ts";
import { addTracksToPlaylist, createYouTubePlaylist } from "./services/youtube.ts";
import { checkRateLimit, getClientIp } from "./services/rateLimit.ts";

const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return Response.json(
      { success: false, error: "Method not allowed" },
      { status: 405, headers: CORS_HEADERS },
    );
  }

  // 외부 스코프 — catch 블록에서 failed 처리 시 접근
  let playlistId: string | null = null;
  // deno-lint-ignore no-explicit-any
  let supabaseAdmin: any = null;

  try {
    // ── 0. IP 기반 Rate Limit (인증 전) ────────────────────────────────────
    const clientIp = getClientIp(req);
    if (!checkRateLimit(`ip:${clientIp}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS).allowed) {
      return Response.json(
        { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // ── 1. 서버 환경변수 확인 ────────────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

    if (!supabaseUrl || !serviceRoleKey || !googleClientId || !googleClientSecret) {
      throw new SafeError("서버 설정이 올바르지 않습니다.");
    }

    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // ── 2. Authorization 헤더에서 JWT 추출 및 검증 ───────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { success: false, error: "인증이 필요합니다." },
        { status: 401, headers: CORS_HEADERS },
      );
    }
    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return Response.json(
        { success: false, error: "유효하지 않은 인증 토큰입니다." },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    // 클라이언트가 보낸 user_id를 절대 신뢰하지 않음 — JWT에서만 추출
    const userId = user.id;

    // ── 2-1. user_id 기반 Rate Limit (JWT 검증 후) ──────────────────────────
    if (!checkRateLimit(`user:${userId}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS).allowed) {
      return Response.json(
        { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // ── 3. 요청 바디 파싱 및 검증 ──────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { success: false, error: "요청 형식이 올바르지 않습니다." },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parsedPlaylistId =
      body !== null &&
      typeof body === "object" &&
      "playlist_id" in body &&
      typeof (body as Record<string, unknown>).playlist_id === "string"
        ? (body as { playlist_id: string }).playlist_id
        : null;

    if (!parsedPlaylistId) {
      return Response.json(
        { success: false, error: "playlist_id가 필요합니다." },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // playlist_id 확보 후 catch 블록에서 failed 처리 가능
    playlistId = parsedPlaylistId;

    // ── 4. 플레이리스트 소유권 + status='searching' 검증 ────────────────────
    const playlist = await getPlaylist(supabaseAdmin, playlistId, userId);

    // ── 5. Google refresh_token 조회 ────────────────────────────────────────
    const refreshToken = await getOauthToken(supabaseAdmin, userId);

    // ── 6. status → 'creating' ───────────────────────────────────────────────
    await updatePlaylistStatus(supabaseAdmin, playlistId, "creating");

    // ── 7. Google access_token 갱신 ─────────────────────────────────────────
    const accessToken = await refreshAccessToken(refreshToken, googleClientId, googleClientSecret);

    // ── 8. 트랙 목록 조회 ───────────────────────────────────────────────────
    const tracks = await getTracks(supabaseAdmin, playlistId);

    // ── 9. YouTube 플레이리스트 생성 ─────────────────────────────────────────
    const { youtubePlaylistId, youtubePlaylistUrl } = await createYouTubePlaylist(
      accessToken,
      playlist.playlist_concept,
    );

    // ── 10. 트랙 추가 ────────────────────────────────────────────────────────
    await addTracksToPlaylist(accessToken, youtubePlaylistId, tracks);

    // ── 11. status → 'created' + YouTube 정보 저장 ──────────────────────────
    await updatePlaylistCreated(supabaseAdmin, playlistId, youtubePlaylistId, youtubePlaylistUrl);

    return Response.json(
      {
        success: true,
        youtube_playlist_id: youtubePlaylistId,
        youtube_playlist_url: youtubePlaylistUrl,
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (err) {
    if (playlistId && supabaseAdmin) {
      const safeMessage = err instanceof SafeError
        ? err.message
        : "YouTube 플레이리스트 생성 중 오류가 발생했습니다.";
      await updatePlaylistFailed(supabaseAdmin, playlistId, safeMessage).catch(() => {});
    }

    const userMessage = err instanceof SafeError
      ? err.message
      : "YouTube 플레이리스트 생성 중 오류가 발생했습니다.";

    return Response.json(
      { success: false, error: userMessage },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
