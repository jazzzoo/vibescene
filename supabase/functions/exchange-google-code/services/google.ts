import { SafeError } from "../errors.ts";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
};

export type GooglePlatform = "ios" | "android";

// iOS/Android OAuth client는 Google Cloud Console에서 client_secret이 발급되지 않으며,
// authorization code는 발급받은 client_id와 동일한 client_id로만 교환할 수 있다(Google이 강제).
// 따라서 프론트엔드가 보낸 platform에 맞는 client_id만 사용하고, client_secret은 보내지 않는다.
function getClientIdForPlatform(platform: GooglePlatform): string | undefined {
  return platform === "ios"
    ? Deno.env.get("GOOGLE_IOS_CLIENT_ID")
    : Deno.env.get("GOOGLE_ANDROID_CLIENT_ID");
}

// Google OAuth token endpoint에 authorization code를 교환 요청한다.
// code, code_verifier 등 민감 값은 절대 로그에 남기지 않는다.
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string,
  platform: GooglePlatform,
): Promise<GoogleTokenResponse> {
  const clientId = getClientIdForPlatform(platform);
  if (!clientId) {
    throw new SafeError("Google 로그인 서비스가 설정되지 않았습니다.");
  }

  let response: Response;
  try {
    response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        code_verifier: codeVerifier,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
  } catch {
    throw new SafeError("Google 인증 서버와 통신하는 데 실패했습니다.");
  }

  if (!response.ok) {
    // Google 에러 응답 원문은 사용자에게 노출하지 않음
    throw new SafeError("Google 인증에 실패했습니다. 다시 시도해 주세요.");
  }

  let data: Partial<GoogleTokenResponse>;
  try {
    data = await response.json();
  } catch {
    throw new SafeError("Google 인증 응답을 처리하지 못했습니다.");
  }

  if (!data.refresh_token) {
    throw new SafeError("Google refresh token was not returned. Please try signing in again.");
  }

  if (!data.access_token || !data.id_token || typeof data.expires_in !== "number") {
    throw new SafeError("Google 인증 응답이 올바르지 않습니다.");
  }

  return data as GoogleTokenResponse;
}

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
  picture: string;
};

// id_token은 Google 토큰 엔드포인트에서 client_secret으로 인증된 응답으로 직접 받은 것이므로
// (사용자가 임의로 위조해 보낸 값이 아님) 서명 검증 없이 payload만 디코딩한다.
export function decodeGoogleIdToken(idToken: string): GoogleProfile {
  try {
    const payloadSegment = idToken.split(".")[1];
    if (!payloadSegment) throw new Error("invalid id_token format");

    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as Record<string, unknown>;

    return {
      sub: String(payload.sub ?? ""),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      picture: String(payload.picture ?? ""),
    };
  } catch {
    throw new SafeError("Google 프로필 정보를 처리하지 못했습니다.");
  }
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  return atob(base64 + "=".repeat(padLength));
}
