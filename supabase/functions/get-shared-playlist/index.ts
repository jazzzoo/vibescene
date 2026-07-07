import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { SafeError } from "./errors.ts";

const IMAGE_BUCKET = "user-images";
// 클라이언트 캐시를 고려해 1시간 TTL로 발급
const SIGNED_URL_TTL_SECONDS = 3600;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retry-count",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return Response.json(
      { success: false, error: "Method not allowed" },
      { status: 405, headers: CORS_HEADERS },
    );
  }

  try {
    // ── 1. 환경변수 확인 ───────────────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new SafeError("서버 설정이 올바르지 않습니다.");
    }

    // service_role로 접근 — RLS 우회가 아닌, 서버에서 is_public 조건을 명시적으로 적용
    // deno-lint-ignore no-explicit-any
    const supabaseAdmin: any = createClient(supabaseUrl, serviceRoleKey);

    // ── 2. shareId 파싱 (GET: query param, POST: body) ────────────────────
    let shareId: string | null = null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      shareId = url.searchParams.get("shareId");
    } else {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return Response.json(
          { success: false, error: "요청 형식이 올바르지 않습니다." },
          { status: 400, headers: CORS_HEADERS },
        );
      }
      shareId =
        body !== null &&
        typeof body === "object" &&
        "shareId" in body &&
        typeof (body as Record<string, unknown>).shareId === "string"
          ? (body as { shareId: string }).shareId
          : null;
    }

    // UUID 최대 길이(36) + 여유를 고려해 100자 이내로 제한
    if (!shareId || shareId.length > 100) {
      return Response.json(
        { success: false, error: "shareId가 필요합니다." },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // ── 3. 플레이리스트 조회 (is_public=true 조건 필수) ──────────────────
    // user_id는 의도적으로 select 제외 — 공개 응답에 포함 금지
    const { data: playlist, error: playlistError } = await supabaseAdmin
      .from("playlists")
      .select(
        "id, image_storage_path, analysis, playlist_concept, primary_genre, secondary_genre, energy_score, created_at, shared_at",
      )
      .eq("share_id", shareId)
      .eq("is_public", true)
      .single();

    if (playlistError || !playlist) {
      return Response.json(
        { success: false, error: "공유된 플레이리스트를 찾을 수 없습니다." },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    // ── 4. 트랙 조회 ──────────────────────────────────────────────────────
    const { data: tracks, error: tracksError } = await supabaseAdmin
      .from("tracks")
      .select("rank, title, artist, youtube_video_id, youtube_video_url, thumbnail_url, reason")
      .eq("playlist_id", playlist.id)
      .order("rank", { ascending: true });

    if (tracksError) {
      throw new SafeError("트랙 정보를 불러오지 못했습니다.");
    }

    // ── 5. 이미지 signed URL 생성 (private bucket — 경로 직접 노출 금지) ─
    let imageUrl: string | null = null;
    if (playlist.image_storage_path) {
      const { data: signedData } = await supabaseAdmin
        .storage
        .from(IMAGE_BUCKET)
        .createSignedUrl(playlist.image_storage_path, SIGNED_URL_TTL_SECONDS);
      imageUrl = signedData?.signedUrl ?? null;
    }

    // ── 6. 응답 조립 (user_id, image_storage_path 제외) ──────────────────
    return Response.json(
      {
        success: true,
        playlist: {
          id: playlist.id,
          imageUrl,
          analysis: playlist.analysis,
          playlistConcept: playlist.playlist_concept,
          primaryGenre: playlist.primary_genre,
          secondaryGenre: playlist.secondary_genre,
          energyScore: playlist.energy_score,
          createdAt: playlist.created_at,
          sharedAt: playlist.shared_at,
          tracks: (tracks ?? []).map((t: {
            rank: number;
            title: string;
            artist: string;
            youtube_video_id: string;
            youtube_video_url: string;
            thumbnail_url: string;
            reason: string;
          }) => ({
            rank: t.rank,
            title: t.title,
            artist: t.artist,
            youtubeVideoId: t.youtube_video_id,
            youtubeVideoUrl: t.youtube_video_url,
            thumbnailUrl: t.thumbnail_url,
            reason: t.reason,
          })),
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (err) {
    const userMessage = err instanceof SafeError
      ? err.message
      : "공유 플레이리스트를 불러오는 중 오류가 발생했습니다.";

    return Response.json(
      { success: false, error: userMessage },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
