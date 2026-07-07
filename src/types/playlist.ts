export type Track = {
  rank: number;
  title: string;
  artist: string;
  youtubeVideoId: string;
  youtubeVideoUrl: string;
  thumbnailUrl: string;
  reason: string;
};

// primary_genre, secondary_genre, energy_score는 playlists 테이블 개별 컬럼
export type MusicProfile = {
  primaryGenre: string;
  secondaryGenre: string;
  energyScore: number;
};

// analysis JSONB: imageType + 이미지 분석 + tempo/valence/confidence 포함
export type Analysis = {
  imageType: 'SCENE' | 'PERSON' | 'MIXED';
  // music_profile에서 이동된 필드
  confidence: number;
  tempo: string;
  valence: string;
  // 앨범/플레이리스트 스타일 부제 — 구버전 데이터에는 없을 수 있어 optional
  playlistSubtitle?: string;
  // SCENE/MIXED 분석 필드
  location?: string;
  timeOfDay?: string;
  season?: string;
  moodKeywords?: string[];
  sensoryImpressions?: string[];
  culturalContext?: string;
  // PERSON/MIXED 분석 필드
  styleVibe?: string;
  energy?: string;
  colorTone?: string;
};

export type PlaylistResult = {
  imageUri: string | null;       // Supabase Storage signed URL (실패 시 null)
  analysis: Analysis;
  musicProfile: MusicProfile;
  playlistConcept: string;
  tracks: Track[];
  youtubePlaylistId: string | null;  // Edge Function 2 실행 전까지 null
  youtubePlaylistUrl: string | null; // Edge Function 2 실행 전까지 null
  confidence: number;
  createdAt: string;
};

export type ResultScreenParams = {
  playlistResult: PlaylistResult;
  fromHistory?: boolean;
  historyDate?: string;
};

export type PlaylistStatus =
  | 'pending'
  | 'analyzing'
  | 'searching'
  | 'creating'
  | 'created'
  | 'failed';

export type PlaylistHistoryItem = {
  id: string;
  imageUri: string | null;          // 우선 표시용 signed URL — thumbnail 우선, 없으면 main (실패 시 null)
  fallbackImageUri: string | null;  // imageUri 로딩 실패 시 사용할 main image signed URL
  playlistConcept: string;
  status: PlaylistStatus;
  createdAt: string;
};
