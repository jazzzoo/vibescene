import { SafeError } from "../errors.ts";
import type { GooglePlatform } from "./google.ts";

// deno-lint-ignore no-explicit-any
type SupabaseAdmin = any;

export type PlaylistRow = {
  id: string;
  user_id: string;
  playlist_concept: string;
  status: string;
};

export type TrackRow = {
  rank: number;
  title: string;
  artist: string;
  youtube_video_id: string;
};

// playlist 소유권 + status='searching' 검증
export async function getPlaylist(
  supabase: SupabaseAdmin,
  playlistId: string,
  userId: string,
): Promise<PlaylistRow> {
  const { data, error } = await supabase
    .from("playlists")
    .select("id, user_id, playlist_concept, status")
    .eq("id", playlistId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new SafeError("플레이리스트를 찾을 수 없습니다.");
  }

  if (data.status !== "searching") {
    throw new SafeError("플레이리스트 상태가 올바르지 않습니다.");
  }

  return data as PlaylistRow;
}

export async function getTracks(
  supabase: SupabaseAdmin,
  playlistId: string,
): Promise<TrackRow[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("rank, title, artist, youtube_video_id")
    .eq("playlist_id", playlistId)
    .order("rank", { ascending: true });

  if (error) {
    throw new SafeError("트랙 목록을 불러오지 못했습니다.");
  }

  return (data ?? []) as TrackRow[];
}

export type OauthTokenRow = {
  refreshToken: string;
  platform: GooglePlatform;
};

// refresh_token_encrypted 컬럼에 평문으로 저장됨 (컬럼명은 미래 암호화를 위한 예약)
// platform이 없는(레거시) 토큰은 어떤 client_id로 갱신해야 할지 알 수 없으므로
// 재로그인을 안내한다 (oauth_tokens.platform이 null인 기존 행 포함).
export async function getOauthToken(
  supabase: SupabaseAdmin,
  userId: string,
): Promise<OauthTokenRow> {
  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("refresh_token_encrypted, platform")
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  if (
    error ||
    !data?.refresh_token_encrypted ||
    (data.platform !== "ios" && data.platform !== "android")
  ) {
    throw new SafeError("YouTube 연동 정보를 찾을 수 없습니다. Google 로그인을 다시 시도해 주세요.");
  }

  return {
    refreshToken: data.refresh_token_encrypted as string,
    platform: data.platform,
  };
}

export async function updatePlaylistStatus(
  supabase: SupabaseAdmin,
  playlistId: string,
  status: string,
): Promise<void> {
  const { error } = await supabase
    .from("playlists")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", playlistId);

  if (error) throw new SafeError("플레이리스트 상태 업데이트에 실패했습니다.");
}

export async function updatePlaylistCreated(
  supabase: SupabaseAdmin,
  playlistId: string,
  youtubePlaylistId: string,
  youtubePlaylistUrl: string,
): Promise<void> {
  const { error } = await supabase
    .from("playlists")
    .update({
      status: "created",
      youtube_playlist_id: youtubePlaylistId,
      youtube_playlist_url: youtubePlaylistUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", playlistId);

  if (error) throw new SafeError("플레이리스트 완료 상태 저장에 실패했습니다.");
}

export async function updatePlaylistFailed(
  supabase: SupabaseAdmin,
  playlistId: string,
  errorMessage: string,
): Promise<void> {
  await supabase
    .from("playlists")
    .update({
      status: "failed",
      error_message: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", playlistId);
}
