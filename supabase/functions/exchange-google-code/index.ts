import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { SafeError } from "./errors.ts";
import { decodeGoogleIdToken, exchangeCodeForTokens } from "./services/google.ts";
import type { GooglePlatform } from "./services/google.ts";
import { upsertOauthTokens, upsertProfile } from "./services/db.ts";
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
    return Response.json({ success: false, error: "Method not allowed" }, { status: 405, headers: CORS_HEADERS });
  }

  try {
    // ── 0. IP 기반 Rate Limit 검사 (인증 전, 요청 초반) ────────────────────
    const clientIp = getClientIp(req);
    if (!checkRateLimit(`ip:${clientIp}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS).allowed) {
      return Response.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // ── 1. Authorization 헤더에서 Supabase JWT 추출 ──────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ success: false, error: "인증이 필요합니다." }, { status: 401, headers: CORS_HEADERS });
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new SafeError("서버 설정이 올바르지 않습니다.");
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // ── 2. JWT 검증 → 현재 user_id 확보 ──────────────────────────────────
    // (request body의 user_id는 절대 신뢰/사용하지 않음)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return Response.json({ success: false, error: "유효하지 않은 인증 토큰입니다." }, { status: 401, headers: CORS_HEADERS });
    }
    const userId = user.id;

    // ── 2-1. user_id 기반 Rate Limit 검사 (JWT 검증 후) ─────────────────────
    if (!checkRateLimit(`user:${userId}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS).allowed) {
      return Response.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // ── 3. 요청 바디 파싱 및 검증 ─────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400, headers: CORS_HEADERS });
    }

    const { code, codeVerifier, redirectUri, platform } = parseRequestBody(body);
    if (!code || !codeVerifier || !redirectUri || !platform) {
      return Response.json(
        { success: false, error: "code, code_verifier, redirect_uri, platform이 필요합니다." },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // ── 4~6. Google OAuth token endpoint에 code 교환 요청 ────────────────
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier, redirectUri, platform);

    // ── 7. id_token에서 Google 프로필 정보 추출 ───────────────────────────
    const profile = decodeGoogleIdToken(tokenResponse.id_token);

    // ── 8. profiles 테이블 UPSERT (현재 anonymous user_id에 연결) ─────────
    await upsertProfile(supabaseAdmin, userId, {
      googleId: profile.sub,
      email: profile.email,
      displayName: profile.name,
      avatarUrl: profile.picture,
    });

    // ── 9. oauth_tokens 테이블 UPSERT ─────────────────────────────────────
    await upsertOauthTokens(supabaseAdmin, userId, {
      provider: "google",
      platform,
      refreshToken: tokenResponse.refresh_token,
      accessToken: tokenResponse.access_token,
      scope: tokenResponse.scope,
      expiresInSeconds: tokenResponse.expires_in,
    });

    return Response.json({ success: true }, { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    const message = err instanceof SafeError
      ? err.message
      : "Google 로그인 처리 중 오류가 발생했습니다.";

    return Response.json({ success: false, error: message }, { status: 500, headers: CORS_HEADERS });
  }
});

function parseRequestBody(body: unknown): {
  code: string | null;
  codeVerifier: string | null;
  redirectUri: string | null;
  platform: GooglePlatform | null;
} {
  if (body === null || typeof body !== "object") {
    return { code: null, codeVerifier: null, redirectUri: null, platform: null };
  }

  const record = body as Record<string, unknown>;
  const platform = record.platform === "ios" || record.platform === "android"
    ? record.platform
    : null;

  return {
    code: typeof record.code === "string" ? record.code : null,
    codeVerifier: typeof record.code_verifier === "string" ? record.code_verifier : null,
    redirectUri: typeof record.redirect_uri === "string" ? record.redirect_uri : null,
    platform,
  };
}
