import { SafeError } from "../errors.ts";
import type { GooglePlatform } from "./google.ts";

// deno-lint-ignore no-explicit-any
type SupabaseAdmin = any;

export type ProfileInput = {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
};

// 현재(익명) user_id의 profiles 행에 Google 프로필 정보를 UPSERT한다.
// Supabase Auth identity linking이 아니라, 별도 profiles 테이블에 정보를 저장하는 것이다.
export async function upsertProfile(
  supabase: SupabaseAdmin,
  userId: string,
  profile: ProfileInput,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        google_id: profile.googleId,
        email: profile.email,
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
      },
      { onConflict: "id" },
    );

  if (error) throw new SafeError("프로필 저장 중 오류가 발생했습니다.");
}

export type OauthTokensInput = {
  provider: string;
  platform: GooglePlatform;
  refreshToken: string;
  accessToken: string;
  scope: string;
  expiresInSeconds: number;
};

export async function upsertOauthTokens(
  supabase: SupabaseAdmin,
  userId: string,
  tokens: OauthTokensInput,
): Promise<void> {
  const expiresAt = new Date(Date.now() + tokens.expiresInSeconds * 1000).toISOString();

  const { error } = await supabase
    .from("oauth_tokens")
    .upsert(
      {
        user_id: userId,
        provider: tokens.provider,
        platform: tokens.platform,
        refresh_token_encrypted: tokens.refreshToken,
        access_token_encrypted: tokens.accessToken,
        scope: tokens.scope,
        expires_at: expiresAt,
      },
      { onConflict: "user_id,provider" },
    );

  if (error) throw new SafeError("인증 토큰 저장 중 오류가 발생했습니다.");
}
