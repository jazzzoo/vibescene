import { SafeError } from "../errors.ts";
import type { GptPlaylistItem } from "./gpt.ts";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export type YoutubeTrack = {
  rank: number;
  title: string;
  artist: string;
  reason: string;
  youtube_video_id: string;
  youtube_video_url: string;
  thumbnail_url: string;
};

export async function searchYouTubeTracks(
  playlist: GptPlaylistItem[],
  apiKey: string,
): Promise<YoutubeTrack[]> {
  const results: YoutubeTrack[] = [];

  for (const track of playlist) {
    try {
      const query = encodeURIComponent(`${track.title} ${track.artist} official`);
      const url =
        `${YOUTUBE_SEARCH_URL}?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`;

      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      const item = data.items?.[0];
      if (!item) continue;

      const videoId: string | undefined = item.id?.videoId;
      if (!videoId) continue;

      const thumbnails = item.snippet?.thumbnails;
      const thumbnailUrl: string =
        thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? "";

      results.push({
        rank: track.rank,
        title: track.title,
        artist: track.artist,
        reason: track.reason,
        youtube_video_id: videoId,
        youtube_video_url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail_url: thumbnailUrl,
      });
    } catch {
      // 개별 트랙 검색 실패는 건너뜀
    }
  }

  if (results.length === 0) {
    throw new SafeError("적합한 음악을 찾지 못했습니다. 다시 시도해 주세요.");
  }

  return results;
}
