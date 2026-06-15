export type Track = {
  rank: number;
  title: string;
  artist: string;
  youtubeVideoId: string;
  youtubeVideoUrl: string;
  thumbnailUrl: string;
  reason: string;
};

export type MusicProfile = {
  energyScore: number;
  tempo: 'slow' | 'mid' | 'uptempo';
  valence: 'positive' | 'neutral' | 'negative';
  primaryGenre: string;
  secondaryGenre: string;
};

export type Analysis = {
  imageType: 'SCENE' | 'PERSON' | 'MIXED';
  location: string;
  timeOfDay: string;
  season: string;
  moodKeywords: string[];
  sensoryImpressions: string[];
  culturalContext: string;
};

export type PlaylistResult = {
  imageUri: string;
  analysis: Analysis;
  musicProfile: MusicProfile;
  playlistConcept: string;
  tracks: Track[];
  youtubePlaylistId: string;
  youtubePlaylistUrl: string;
  confidence: number;
  createdAt: string;
};

export type ResultScreenParams = {
  playlistResult: PlaylistResult;
  fromHistory?: boolean;
  historyDate?: string;
};
