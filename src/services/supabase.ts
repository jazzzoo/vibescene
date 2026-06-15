import { supabase } from '../lib/supabaseClient';
import type { Analysis, MusicProfile, PlaylistResult, Track } from '../types/playlist';

// ── DB 로우 타입 (snake_case) ──────────────────────────────────────────────

type TrackRow = {
  rank: number;
  title: string;
  artist: string;
  youtube_video_id: string;
  youtube_video_url: string;
  thumbnail_url: string;
  reason: string;
};

type PlaylistRow = {
  id: string;
  user_id: string;
  image_storage_path: string;
  analysis: Analysis;
  music_profile: MusicProfile;
  playlist_concept: string;
  youtube_playlist_id: string;
  youtube_playlist_url: string;
  confidence: number;
  created_at: string;
  tracks: TrackRow[];
};

// ── 상수 ──────────────────────────────────────────────────────────────────

const IMAGE_BUCKET = 'user-images';
const SIGNED_URL_TTL = 60 * 60; // 60분(초 단위)

// ── 매핑 헬퍼 ─────────────────────────────────────────────────────────────

function rowToTrack(row: TrackRow): Track {
  return {
    rank: row.rank,
    title: row.title,
    artist: row.artist,
    youtubeVideoId: row.youtube_video_id,
    youtubeVideoUrl: row.youtube_video_url,
    thumbnailUrl: row.thumbnail_url,
    reason: row.reason,
  };
}

function rowToPlaylistResult(row: PlaylistRow): PlaylistResult {
  return {
    imageUri: row.image_storage_path,
    analysis: row.analysis,
    musicProfile: row.music_profile,
    playlistConcept: row.playlist_concept,
    tracks: row.tracks.map(rowToTrack),
    youtubePlaylistId: row.youtube_playlist_id,
    youtubePlaylistUrl: row.youtube_playlist_url,
    confidence: row.confidence,
    createdAt: row.created_at,
  };
}

// ── 공개 함수 ─────────────────────────────────────────────────────────────

/**
 * 현재 로그인한 유저의 플레이리스트 목록을 최신순으로 반환한다.
 * PlaylistResult.imageUri에는 image_storage_path가 담겨 있으며,
 * 실제 이미지를 표시할 때는 getImageSignedUrl()로 URL을 발급받아야 한다.
 */
export async function getHistory(): Promise<PlaylistResult[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('playlists')
    .select('*, tracks(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as PlaylistRow[]).map(rowToPlaylistResult);
}

/**
 * playlist id로 단건 조회한다.
 */
export async function getPlaylist(id: string): Promise<PlaylistResult> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*, tracks(*)')
    .eq('id', id)
    .single();

  if (error) throw error;

  return rowToPlaylistResult(data as PlaylistRow);
}

/**
 * Supabase Storage의 image_storage_path로 60분짜리 signed URL을 발급한다.
 */
export async function getImageSignedUrl(imageStoragePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(imageStoragePath, SIGNED_URL_TTL);

  if (error) throw error;

  return data.signedUrl;
}
