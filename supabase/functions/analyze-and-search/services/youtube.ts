import type { GptPlaylistItem } from "./gpt.ts";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

// 좁은 쿼리("official")부터 시작하면 니치한 장르(예: nu-jazz, J-rock)에서 검색이 통째로
// 실패하는 경우가 많아, 가장 넓은 쿼리부터 시도하고 점점 구체적인 쿼리로 좁혀간다.
// 트랙당 최대 호출 수를 제한해 API quota 낭비를 막는다.
const FALLBACK_QUERY_SUFFIXES = ["", " official audio", " official", " topic", " music"];

export type YoutubeTrack = {
  rank: number;
  title: string;
  artist: string;
  reason: string;
  youtube_video_id: string;
  youtube_video_url: string;
  thumbnail_url: string;
};

type YoutubeSearchHit = {
  videoId: string;
  thumbnailUrl: string;
};

async function searchOnce(query: string, apiKey: string): Promise<YoutubeSearchHit | null> {
  const url =
    `${YOUTUBE_SEARCH_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const item = data.items?.[0];
  const videoId: string | undefined = item?.id?.videoId;
  if (!videoId) return null;

  const thumbnails = item.snippet?.thumbnails;
  const thumbnailUrl: string =
    thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? "";

  return { videoId, thumbnailUrl };
}

// 가장 넓은 쿼리부터 순서대로 시도하다가 첫 성공에서 멈춘다.
async function searchTrackWithFallback(
  title: string,
  artist: string,
  apiKey: string,
): Promise<YoutubeSearchHit | null> {
  const base = `${title} ${artist}`;

  for (const suffix of FALLBACK_QUERY_SUFFIXES) {
    try {
      const hit = await searchOnce(`${base}${suffix}`, apiKey);
      if (hit) return hit;
    } catch {
      // 이번 fallback 쿼리만 건너뛰고 다음 쿼리를 계속 시도
    }
  }

  return null;
}

export async function searchYouTubeTracks(
  playlist: GptPlaylistItem[],
  apiKey: string,
): Promise<YoutubeTrack[]> {
  const results: YoutubeTrack[] = [];

  for (const track of playlist) {
    const hit = await searchTrackWithFallback(track.title, track.artist, apiKey);
    if (!hit) continue;

    results.push({
      rank: track.rank,
      title: track.title,
      artist: track.artist,
      reason: track.reason,
      youtube_video_id: hit.videoId,
      youtube_video_url: `https://www.youtube.com/watch?v=${hit.videoId}`,
      thumbnail_url: hit.thumbnailUrl,
    });
  }

  return results;
}
