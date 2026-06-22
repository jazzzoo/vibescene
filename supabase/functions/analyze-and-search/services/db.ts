import { DbOperationError } from "../errors.ts";
import type { GptResponse } from "./gpt.ts";
import type { YoutubeTrack } from "./youtube.ts";

// deno-lint-ignore no-explicit-any
type SupabaseAdmin = any;

// auth.users에는 존재하지만 profiles에는 row가 없는 경우(예: Anonymous Sign-In) 대비.
// playlists.user_id → profiles(id) FK 제약을 만족시키기 위해 최소 row를 보장한다.
// 이미 존재하면 ON CONFLICT DO NOTHING으로 아무 영향 없이 통과한다 (email 등 기존 값 보존).
export async function ensureProfileExists(
  supabase: SupabaseAdmin,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });

  if (error) {
    throw new DbOperationError(
      "ensureProfileExists",
      "DB_OPERATION_FAILED",
      error,
      "사용자 프로필 확인 중 오류가 발생했습니다.",
    );
  }
}

export async function insertPendingPlaylist(
  supabase: SupabaseAdmin,
  userId: string,
  imageStoragePath: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: userId,
      image_storage_path: imageStoragePath,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    throw new DbOperationError(
      "insertPendingPlaylist",
      "DB_OPERATION_FAILED",
      error,
      "플레이리스트 생성 중 오류가 발생했습니다.",
    );
  }
  // .single()이 에러 없이도 row를 못 돌려주는 경우(예: select 권한 문제) 대비
  if (!data || !(data as { id?: string }).id) {
    throw new DbOperationError(
      "insertPendingPlaylist",
      "DB_OPERATION_FAILED",
      { message: "insert succeeded but no row was returned" },
      "플레이리스트 생성 중 오류가 발생했습니다.",
    );
  }
  return (data as { id: string }).id;
}

export async function updatePlaylistStatus(
  supabase: SupabaseAdmin,
  playlistId: string,
  status: string,
): Promise<void> {
  const { error } = await supabase
    .from("playlists")
    .update({ status })
    .eq("id", playlistId);

  if (error) {
    throw new DbOperationError(
      "updatePlaylistStatus",
      "DB_OPERATION_FAILED",
      error,
      "플레이리스트 상태 업데이트 중 오류가 발생했습니다.",
    );
  }
}

// GPT snake_case → DB 컬럼/JSONB 매핑 후 저장
// - primary_genre, secondary_genre, energy_score: 개별 컬럼
// - tempo, valence, confidence: analysis JSONB 안에 포함
export async function updatePlaylistAnalysis(
  supabase: SupabaseAdmin,
  playlistId: string,
  gpt: GptResponse,
): Promise<void> {
  const src = gpt.analysis as Record<string, unknown>;

  // analysis JSONB: imageType + 이미지 분석 결과 + tempo/valence/confidence
  const analysis: Record<string, unknown> = {
    imageType: gpt.image_type,
    confidence: gpt.confidence,
    tempo: gpt.music_profile.tempo,
    valence: gpt.music_profile.valence,
  };

  if (gpt.image_type === "SCENE" || gpt.image_type === "MIXED") {
    analysis.location = src.location ?? "";
    analysis.timeOfDay = src.time_of_day ?? "";
    analysis.season = src.season ?? "";
    analysis.moodKeywords = src.mood_keywords ?? [];
    analysis.sensoryImpressions = src.sensory_impressions ?? [];
    analysis.culturalContext = src.cultural_context ?? "";
  }

  if (gpt.image_type === "PERSON" || gpt.image_type === "MIXED") {
    analysis.styleVibe = src.style_vibe ?? "";
    analysis.energy = src.energy ?? "";
    analysis.colorTone = src.color_tone ?? "";
  }

  const { error } = await supabase
    .from("playlists")
    .update({
      status: "searching",
      analysis,
      playlist_concept: gpt.playlist_concept,
      primary_genre: gpt.music_profile.primary_genre,
      secondary_genre: gpt.music_profile.secondary_genre,
      energy_score: gpt.music_profile.energy_score,
    })
    .eq("id", playlistId);

  if (error) {
    throw new DbOperationError(
      "updatePlaylistAnalysis",
      "DB_OPERATION_FAILED",
      error,
      "분석 결과 저장 중 오류가 발생했습니다.",
    );
  }
}

export async function insertTracks(
  supabase: SupabaseAdmin,
  playlistId: string,
  tracks: YoutubeTrack[],
): Promise<void> {
  const rows = tracks.map((track) => ({
    playlist_id: playlistId,
    rank: track.rank,
    title: track.title,
    artist: track.artist,
    reason: track.reason,
    youtube_video_id: track.youtube_video_id,
    youtube_video_url: track.youtube_video_url,
    thumbnail_url: track.thumbnail_url,
  }));

  const { error } = await supabase.from("tracks").insert(rows);
  if (error) {
    throw new DbOperationError(
      "insertTracks",
      "DB_SAVE_FAILED",
      error,
      "트랙 저장 중 오류가 발생했습니다.",
    );
  }
}

export async function updatePlaylistFailed(
  supabase: SupabaseAdmin,
  playlistId: string,
  errorMessage: string,
): Promise<void> {
  await supabase
    .from("playlists")
    .update({ status: "failed", error_message: errorMessage })
    .eq("id", playlistId);
}
