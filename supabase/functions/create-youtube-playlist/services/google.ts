import { SafeError } from "../errors.ts";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

type TokenRefreshResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export type GooglePlatform = "ios" | "android";

// iOS/Android OAuth client는 client_secret이 발급되지 않으며,
// refresh_token은 발급 시 사용된 client_id에 귀속되어 다른 client_id로 갱신하면
// invalid_grant로 거부된다. 따라서 토큰을 발급받은 platform과 동일한 client_id로만 갱신한다.
function getClientIdForPlatform(platform: GooglePlatform): string | undefined {
  return platform === "ios"
    ? Deno.env.get("GOOGLE_IOS_CLIENT_ID")
    : Deno.env.get("GOOGLE_ANDROID_CLIENT_ID");
}

// refresh_token으로 새 access_token을 발급한다.
// refresh_token 등 민감 값은 절대 로그에 남기지 않는다.
export async function refreshAccessToken(
  refreshToken: string,
  platform: GooglePlatform,
): Promise<string> {
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
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    });
  } catch {
    throw new SafeError("Google 인증 서버와 통신하는 데 실패했습니다.");
  }

  if (!response.ok) {
    // Google 에러 원문은 사용자에게 노출하지 않음
    throw new SafeError("Google 인증 갱신에 실패했습니다. 다시 로그인해 주세요.");
  }

  let data: Partial<TokenRefreshResponse>;
  try {
    data = await response.json();
  } catch {
    throw new SafeError("Google 인증 응답을 처리하지 못했습니다.");
  }

  if (!data.access_token) {
    throw new SafeError("Google access token을 받지 못했습니다. 다시 로그인해 주세요.");
  }

  return data.access_token;
}
