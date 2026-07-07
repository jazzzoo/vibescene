import { supabase } from '../lib/supabaseClient';
import { SafeError } from './errors';
import { createSignedImageUrl, getThumbnailStoragePath } from './storage';
import type { Analysis, MusicProfile, PlaylistHistoryItem, PlaylistResult, PlaylistStatus, SharedPlaylistResult, Track } from '../types/playlist';

// Supabase 쿼리 결과 로컬 타입 (generated types 없이 안전하게 캐스팅)
type PlaylistRow = {
  image_storage_path: string;
  analysis: unknown;
  playlist_concept: string | null;
  primary_genre: string | null;
  secondary_genre: string | null;
  energy_score: number | null;
  youtube_playlist_id: string | null;
  youtube_playlist_url: string | null;
  created_at: string;
};

type TrackRow = {
  rank: number;
  title: string;
  artist: string;
  youtube_video_id: string;
  youtube_video_url: string;
  thumbnail_url: string;
  reason: string;
};

function hasStringField<K extends string>(
  data: unknown,
  key: K,
): data is Record<K, string> {
  return (
    data !== null &&
    typeof data === 'object' &&
    key in data &&
    typeof (data as Record<string, unknown>)[key] === 'string'
  );
}

/**
 * playlists + tracks 테이블에서 결과를 조회하고 PlaylistResult로 변환한다.
 * RLS에 의해 현재 사용자 소유 데이터만 조회됨.
 */
export async function getPlaylistResult(playlistId: string): Promise<PlaylistResult> {
  const [playlistRes, tracksRes] = await Promise.all([
    supabase
      .from('playlists')
      .select(
        'image_storage_path, analysis, playlist_concept, primary_genre, secondary_genre, energy_score, youtube_playlist_id, youtube_playlist_url, created_at',
      )
      .eq('id', playlistId)
      .single(),
    supabase
      .from('tracks')
      .select('rank, title, artist, youtube_video_id, youtube_video_url, thumbnail_url, reason')
      .eq('playlist_id', playlistId)
      .order('rank', { ascending: true }),
  ]);

  if (playlistRes.error || !playlistRes.data) {
    throw new SafeError("We couldn't load your playlist.");
  }
  if (tracksRes.error || !tracksRes.data) {
    throw new SafeError("We couldn't load the tracks.");
  }

  const row = playlistRes.data as unknown as PlaylistRow;
  const trackRows = tracksRes.data as unknown as TrackRow[];

  const analysis = row.analysis as Analysis | null;
  if (!analysis) throw new SafeError("We couldn't load the analysis data.");

  // private bucket이므로 signed URL 발급 (실패 시 null — UI는 fallback 처리)
  const imageUri = await createSignedImageUrl(row.image_storage_path);

  const tracks: Track[] = trackRows.map((t) => ({
    rank: t.rank,
    title: t.title,
    artist: t.artist,
    youtubeVideoId: t.youtube_video_id,
    youtubeVideoUrl: t.youtube_video_url,
    thumbnailUrl: t.thumbnail_url,
    reason: t.reason,
  }));

  const musicProfile: MusicProfile = {
    primaryGenre: row.primary_genre ?? '',
    secondaryGenre: row.secondary_genre ?? '',
    energyScore: row.energy_score ?? 0,
  };

  return {
    imageUri,
    analysis,
    musicProfile,
    playlistConcept: row.playlist_concept ?? '',
    tracks,
    youtubePlaylistId: row.youtube_playlist_id,
    youtubePlaylistUrl: row.youtube_playlist_url,
    confidence: analysis.confidence,
    createdAt: row.created_at,
  };
}

/**
 * Edge Function 1(analyze-and-search)을 호출해 이미지 분석 + YouTube 검색을 수행한다.
 * LoadingScreen에서 직접 사용하는 함수.
 * - image_storage_path만 전달 (user_id는 Edge Function이 JWT에서 추출)
 * - 성공 시 { playlistId } 반환 (status = 'searching')
 */
export async function analyzeAndSearchPlaylist(
  imageStoragePath: string,
): Promise<{ playlistId: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new SafeError('Please sign in again.');
  }

  const { data, error } = await supabase.functions.invoke('analyze-and-search', {
    body: { image_storage_path: imageStoragePath },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) {
    const serverError = hasStringField(data, 'error') ? data.error : null;
    throw new SafeError(
      serverError ?? "We couldn't create your playlist. Please try again.",
    );
  }

  const playlistId = hasStringField(data, 'playlist_id') ? data.playlist_id : null;
  if (!playlistId) {
    throw new SafeError("We couldn't create your playlist. Please try again.");
  }

  return { playlistId };
}

export type CreateYouTubePlaylistResult = {
  youtubePlaylistId: string;
  youtubePlaylistUrl: string;
};

/**
 * Edge Function 2(create-youtube-playlist)를 호출해 YouTube 플레이리스트를 생성한다.
 * ResultScreen에서 사용. user_id는 Edge Function이 JWT에서 추출.
 */
export async function createYouTubePlaylist(
  playlistId: string,
): Promise<CreateYouTubePlaylistResult> {
  const { data, error } = await supabase.functions.invoke('create-youtube-playlist', {
    body: { playlist_id: playlistId },
  });

  if (error) {
    const serverError = hasStringField(data, 'error') ? data.error : null;
    throw new SafeError(
      serverError ?? "We couldn't create your YouTube playlist. Please try again.",
    );
  }

  const youtubePlaylistId = hasStringField(data, 'youtube_playlist_id')
    ? data.youtube_playlist_id
    : null;
  const youtubePlaylistUrl = hasStringField(data, 'youtube_playlist_url')
    ? data.youtube_playlist_url
    : null;

  if (!youtubePlaylistId || !youtubePlaylistUrl) {
    throw new SafeError("We couldn't create your YouTube playlist. Please try again.");
  }

  return { youtubePlaylistId, youtubePlaylistUrl };
}

type HistoryRow = {
  id: string;
  image_storage_path: string | null;
  playlist_concept: string | null;
  status: string;
  created_at: string;
};

/**
 * 현재 사용자의 플레이리스트 히스토리를 조회한다.
 * RLS에 의해 본인 데이터만 반환되므로 별도 user_id 필터 불필요.
 * image_storage_path가 있으면 signed URL 발급 (실패 시 null).
 */
export async function getPlaylistHistory(): Promise<PlaylistHistoryItem[]> {
  const { data, error } = await supabase
    .from('playlists')
    .select('id, image_storage_path, playlist_concept, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new SafeError("We couldn't load your history. Please try again.");
  }

  const rows = (data ?? []) as unknown as HistoryRow[];

  const items = await Promise.all(
    rows.map(async (row): Promise<PlaylistHistoryItem> => {
      let imageUri: string | null = null;
      let fallbackImageUri: string | null = null;

      if (row.image_storage_path) {
        // thumbnail을 우선 사용하고, 생성에 실패하면(예: 기존 데이터에 thumbnail이 없는 경우)
        // main image signed URL로 fallback한다.
        const [thumbnailUri, mainUri] = await Promise.all([
          createSignedImageUrl(getThumbnailStoragePath(row.image_storage_path)),
          createSignedImageUrl(row.image_storage_path),
        ]);
        imageUri = thumbnailUri ?? mainUri;
        fallbackImageUri = mainUri;
      }

      return {
        id: row.id,
        imageUri,
        fallbackImageUri,
        playlistConcept: row.playlist_concept ?? '',
        status: row.status as PlaylistStatus,
        createdAt: row.created_at,
      };
    }),
  );

  return items;
}

export type CreateShareLinkResult = {
  shareId: string;
  sharePath: string;
  shareUrl: string | null;
};

/**
 * create-share-link Edge Function을 호출해 플레이리스트 공개 공유 링크를 생성한다.
 * 이미 공유된 플레이리스트이면 기존 shareId를 그대로 반환 (idempotent).
 * supabase.functions.invoke가 현재 세션 토큰을 Authorization 헤더에 자동 포함한다.
 */
export async function createShareLink(playlistId: string): Promise<CreateShareLinkResult> {
  const { data, error } = await supabase.functions.invoke('create-share-link', {
    body: { playlistId },
  });

  if (error) {
    throw new SafeError("Couldn't create a share link. Please try again.");
  }

  const result = data as { success: boolean; shareId?: string; sharePath?: string; shareUrl?: string | null } | null;

  if (!result?.success || !result.shareId) {
    throw new SafeError("Couldn't create a share link. Please try again.");
  }

  return {
    shareId: result.shareId,
    sharePath: result.sharePath ?? `/p/${result.shareId}`,
    shareUrl: result.shareUrl ?? null,
  };
}

/**
 * 공유 링크의 shareId로 get-shared-playlist Edge Function을 호출한다.
 * 인증 불필요 — 공개 엔드포인트. anon key만 전송됨.
 */
export async function getSharedPlaylist(shareId: string): Promise<SharedPlaylistResult> {
  const { data, error } = await supabase.functions.invoke('get-shared-playlist', {
    body: { shareId },
  });

  if (error) {
    throw new SafeError('This shared playlist is unavailable.');
  }

  const row = (data as { success: boolean; playlist?: Record<string, unknown> } | null)?.playlist;
  if (!row) {
    throw new SafeError('This shared playlist is unavailable.');
  }

  const analysis = row.analysis as Analysis | null;
  if (!analysis) {
    throw new SafeError('This shared playlist is unavailable.');
  }

  const rawTracks = Array.isArray(row.tracks) ? row.tracks : [];
  const tracks: Track[] = (rawTracks as Record<string, unknown>[]).map((t) => ({
    rank: t.rank as number,
    title: t.title as string,
    artist: t.artist as string,
    youtubeVideoId: t.youtubeVideoId as string,
    youtubeVideoUrl: t.youtubeVideoUrl as string,
    thumbnailUrl: t.thumbnailUrl as string,
    reason: t.reason as string,
  }));

  return {
    id: row.id as string,
    imageUrl: (row.imageUrl as string | null) ?? null,
    analysis,
    playlistConcept: (row.playlistConcept as string) ?? '',
    createdAt: row.createdAt as string,
    sharedAt: (row.sharedAt as string | null) ?? null,
    tracks,
  };
}

/**
 * Edge Function 1(analyze-and-search)을 호출해 이미지 분석 + YouTube 검색을 수행한다.
 * usePlaylistGeneration hook에서 사용하는 레거시 함수. 신규 코드는 analyzeAndSearchPlaylist 사용.
 */
export async function generatePlaylist(imageStoragePath: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('analyze-and-search', {
    body: { image_storage_path: imageStoragePath },
  });

  if (error) {
    // functions.invoke는 4xx/5xx일 때 error를 세팅하고, data에 body가 담김
    const serverMessage = (data as { error?: string } | null)?.error;
    throw new Error(serverMessage ?? "We couldn't create your playlist.");
  }

  const playlistId = (data as { playlist_id?: string } | null)?.playlist_id;
  if (!playlistId) throw new Error("We couldn't create your playlist.");

  return playlistId;
}
