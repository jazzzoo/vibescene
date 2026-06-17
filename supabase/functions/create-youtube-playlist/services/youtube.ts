import { SafeError } from "../errors.ts";
import type { TrackRow } from "./db.ts";

const YOUTUBE_PLAYLISTS_URL = "https://www.googleapis.com/youtube/v3/playlists";
const YOUTUBE_PLAYLIST_ITEMS_URL = "https://www.googleapis.com/youtube/v3/playlistItems";

export type CreatedPlaylist = {
  youtubePlaylistId: string;
  youtubePlaylistUrl: string;
};

export async function createYouTubePlaylist(
  accessToken: string,
  title: string,
): Promise<CreatedPlaylist> {
  let response: Response;
  try {
    response = await fetch(`${YOUTUBE_PLAYLISTS_URL}?part=snippet,status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          title,
          description: "VibeScene으로 만든 플레이리스트",
        },
        status: {
          privacyStatus: "private",
        },
      }),
    });
  } catch {
    throw new SafeError("YouTube 플레이리스트 생성 요청에 실패했습니다.");
  }

  if (!response.ok) {
    // YouTube API 에러 원문은 사용자에게 노출하지 않음
    throw new SafeError("YouTube 플레이리스트를 만들지 못했습니다. 다시 시도해 주세요.");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new SafeError("YouTube 응답을 처리하지 못했습니다.");
  }

  const playlistId =
    data !== null &&
    typeof data === "object" &&
    "id" in data &&
    typeof (data as Record<string, unknown>).id === "string"
      ? (data as { id: string }).id
      : null;

  if (!playlistId) {
    throw new SafeError("YouTube 플레이리스트 ID를 받지 못했습니다.");
  }

  return {
    youtubePlaylistId: playlistId,
    youtubePlaylistUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
  };
}

// 트랙을 순서대로 플레이리스트에 추가한다.
// 일부 추가 실패 시 나머지 트랙은 계속 시도한다.
export async function addTracksToPlaylist(
  accessToken: string,
  youtubePlaylistId: string,
  tracks: TrackRow[],
): Promise<void> {
  for (const track of tracks) {
    if (!track.youtube_video_id) continue;

    let response: Response;
    try {
      response = await fetch(`${YOUTUBE_PLAYLIST_ITEMS_URL}?part=snippet`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            playlistId: youtubePlaylistId,
            resourceId: {
              kind: "youtube#video",
              videoId: track.youtube_video_id,
            },
          },
        }),
      });
    } catch {
      // 개별 트랙 추가 실패 시 다음 트랙으로 넘어감
      continue;
    }

    // 응답을 소비해 연결을 닫는다 (성공/실패 여부는 무시)
    await response.text().catch(() => {});
  }
}
