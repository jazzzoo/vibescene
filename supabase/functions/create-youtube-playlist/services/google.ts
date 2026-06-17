import { SafeError } from "../errors.ts";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

type TokenRefreshResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

// refresh_token으로 새 access_token을 발급한다.
// refresh_token, client_secret 등 민감 값은 절대 로그에 남기지 않는다.
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
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
