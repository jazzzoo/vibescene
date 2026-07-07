import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { SafeError } from "./errors.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retry-count",
};

// 인메모리 Rate Limit (프로세스 재시작 시 초기화 — best effort)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

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

  try {
    // ── 0. IP 기반 Rate Limit ───────────────────────────────────────────────
    const clientIp = getClientIp(req);
    if (!checkRateLimit(`ip:${clientIp}`, 20, 60_000)) {
      return Response.json(
        { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // ── 1. 환경변수 확인 + supabaseAdmin 생성 ─────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new SafeError("서버 설정이 올바르지 않습니다.");
    }

    // deno-lint-ignore no-explicit-any
    const supabaseAdmin: any = createClient(supabaseUrl, serviceRoleKey);

    // ── 2. Authorization 헤더에서 JWT 추출 및 검증 ───────────────────────
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

    // ── 2-1. user_id 기반 Rate Limit ──────────────────────────────────────
    if (!checkRateLimit(`user:${userId}`, 20, 60_000)) {
      return Response.json(
        { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // ── 3. 요청 바디 파싱 ──────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { success: false, error: "요청 형식이 올바르지 않습니다." },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const playlistId =
      body !== null &&
      typeof body === "object" &&
      "playlistId" in body &&
      typeof (body as Record<string, unknown>).playlistId === "string"
        ? (body as { playlistId: string }).playlistId
        : null;

    if (!playlistId) {
      return Response.json(
        { success: false, error: "playlistId가 필요합니다." },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // ── 4. 소유권 확인 ────────────────────────────────────────────────────
    const { data: playlist, error: playlistError } = await supabaseAdmin
      .from("playlists")
      .select("id, user_id, share_id, is_public")
      .eq("id", playlistId)
      .eq("user_id", userId)
      .single();

    if (playlistError || !playlist) {
      return Response.json(
        { success: false, error: "플레이리스트를 찾을 수 없습니다." },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    // ── 5. 이미 공유된 플레이리스트이면 기존 share_id 반환 ───────────────
    if (playlist.share_id && playlist.is_public) {
      const shareId = playlist.share_id as string;
      const sharePath = `/p/${shareId}`;
      const appUrl = Deno.env.get("APP_URL") ?? "";
      const shareUrl = appUrl ? `${appUrl}${sharePath}` : null;

      return Response.json(
        { success: true, shareId, sharePath, shareUrl },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    // ── 6. share_id 생성 + is_public=true + shared_at 저장 ───────────────
    const shareId = crypto.randomUUID();
    const sharedAt = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("playlists")
      .update({ share_id: shareId, is_public: true, shared_at: sharedAt })
      .eq("id", playlistId)
      .eq("user_id", userId);

    if (updateError) {
      throw new SafeError("공유 링크를 생성하지 못했습니다.");
    }

    const sharePath = `/p/${shareId}`;
    const appUrl = Deno.env.get("APP_URL") ?? "";
    const shareUrl = appUrl ? `${appUrl}${sharePath}` : null;

    return Response.json(
      { success: true, shareId, sharePath, shareUrl },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (err) {
    const userMessage = err instanceof SafeError
      ? err.message
      : "공유 링크 생성 중 오류가 발생했습니다.";

    return Response.json(
      { success: false, error: userMessage },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
