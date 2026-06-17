import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { SafeError } from "./errors.ts";
import { analyzeImage } from "./services/gpt.ts";
import { searchYouTubeTracks } from "./services/youtube.ts";
import {
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

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    let playlistId: string | null = null;

    try {
      // ── 0. IP 기반 Rate Limit 검사 (인증 전, 요청 초반) ────────────────────
      // GPT-4o Vision + YouTube Search API를 호출하는 비용 발생 함수이므로
      // GPT 호출(6번) 이전에 반드시 통과해야 한다.
      const clientIp = getClientIp(req);
      if (!checkRateLimit(`ip:${clientIp}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS).allowed) {
        return Response.json(
          { success: false, error: "Too many requests. Please try again later." },
          { status: 429 },
        );
      }

      // ── 1. Authorization 헤더에서 JWT 추출 및 검증 ───────────────────────
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
      }
      const token = authHeader.replace("Bearer ", "");

      const { data: { user }, error: authError } =
        await ctx.supabaseAdmin.auth.getUser(token);
      if (authError || !user) {
        return Response.json({ error: "유효하지 않은 인증 토큰입니다." }, { status: 401 });
      }

      // 클라이언트가 보낸 user_id를 절대 신뢰하지 않음 — JWT에서만 추출
      const userId = user.id;

      // ── 1-1. user_id 기반 Rate Limit 검사 (JWT 검증 후) ─────────────────────
      if (!checkRateLimit(`user:${userId}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS).allowed) {
        return Response.json(
          { success: false, error: "Too many requests. Please try again later." },
          { status: 429 },
        );
      }

      // ── 2. 요청 바디 파싱 및 검증 ────────────────────────────────────────
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return Response.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
      }

      const imageStoragePath =
        body !== null &&
          typeof body === "object" &&
          "image_storage_path" in body &&
          typeof (body as Record<string, unknown>).image_storage_path === "string"
          ? (body as { image_storage_path: string }).image_storage_path
          : null;

      if (!imageStoragePath) {
        return Response.json({ error: "image_storage_path가 필요합니다." }, { status: 400 });
      }

      // ── 3. playlist 행 삽입 (status = 'pending') ─────────────────────────
      playlistId = await insertPendingPlaylist(ctx.supabaseAdmin, userId, imageStoragePath);

      // ── 4. status → 'analyzing' ───────────────────────────────────────────
      await updatePlaylistStatus(ctx.supabaseAdmin, playlistId, "analyzing");

      // ── 5. Storage에서 이미지 Signed URL 발급 (GPT에 URL로 전달) ──────────
      const { data: signedUrlData, error: signedUrlError } = await ctx.supabaseAdmin.storage
        .from(IMAGE_BUCKET)
        .createSignedUrl(imageStoragePath, SIGNED_URL_TTL_SECONDS);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        throw new SafeError("이미지를 불러오는 데 실패했습니다.");
      }

      // ── 6. GPT-4o Vision으로 이미지 분석 ─────────────────────────────────
      const gptResult = await analyzeImage(signedUrlData.signedUrl);

      // ── 7. 분석 결과 저장 + status → 'searching' ─────────────────────────
      await updatePlaylistAnalysis(ctx.supabaseAdmin, playlistId, gptResult);

      // ── 8. YouTube 트랙 검색 ──────────────────────────────────────────────
      const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
      if (!youtubeApiKey) throw new SafeError("음악 검색 서비스가 설정되지 않았습니다.");

      const foundTracks = await searchYouTubeTracks(gptResult.playlist, youtubeApiKey);

      if (foundTracks.length < MIN_TRACKS) {
        throw new SafeError("적합한 음악을 충분히 찾지 못했습니다. 다시 시도해 주세요.");
      }

      // ── 9. rank 순차 재정렬 (5-9개 찾은 경우 포함) ────────────────────────
      const rankedTracks = foundTracks.map((track, idx) => ({ ...track, rank: idx + 1 }));

      // ── 10. tracks 테이블에 삽입 ──────────────────────────────────────────
      await insertTracks(ctx.supabaseAdmin, playlistId, rankedTracks);

      // ── 11. status는 'searching' 유지 — Edge Function 2가 creating/created 처리
      return Response.json({ playlist_id: playlistId }, { status: 200 });

    } catch (err) {
      // 실패 시 playlist 상태를 failed로 업데이트
      if (playlistId) {
        const safeMessage = err instanceof SafeError
          ? err.message
          : "플레이리스트 생성 중 오류가 발생했습니다.";
        await updatePlaylistFailed(ctx.supabaseAdmin, playlistId, safeMessage).catch(() => {});
      }

      const userMessage = err instanceof SafeError
        ? err.message
        : "플레이리스트 생성 중 오류가 발생했습니다.";

      return Response.json({ error: userMessage }, { status: 500 });
    }
  }),
};
