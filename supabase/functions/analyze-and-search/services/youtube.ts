import type { GptPlaylistItem } from "./gpt.ts";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

// 좁은 쿼리("official")부터 시작하면 니치한 장르(예: nu-jazz, J-rock)에서 검색이 통째로
// 실패하는 경우가 많아, 가장 넓은 쿼리부터 시도하고 점점 구체적인 쿼리로 좁혀간다.
const FALLBACK_QUERY_SUFFIXES = ["", " official audio", " official", " topic", " music"];

// search.list 1회당 가져올 후보 수 — 첫 결과만 보지 않고 여러 후보를 스코어링하기 위함
const SEARCH_MAX_RESULTS = 5;

// 트랙당 모을 후보 풀의 상한 — API quota 낭비를 막기 위해 충분히 모이면 나머지 fallback query는 건너뜀
const MAX_CANDIDATES_PER_TRACK = 12;

// 1분 미만 폰 촬영/짤막한 클립을 막기 위한 하한, 풀 라이브 세트 등 과도하게 긴 영상을 막기 위한 상한
const MIN_DURATION_SECONDS = 90;
const MAX_DURATION_SECONDS = 15 * 60;

// 원곡 음원 길이로 흔한 구간(2~8분)에 가산점
const PREFERRED_MIN_DURATION_SECONDS = 120;
const PREFERRED_MAX_DURATION_SECONDS = 8 * 60;

const VIEW_COUNT_BONUS_THRESHOLD = 10_000;

// 폰 촬영/비공식 직캠 느낌이 강한 키워드 — "live" 자체는 막지 않되 이런 신호는 reject에 가깝게 처리
const HARD_REJECT_KEYWORDS = ["fancam", "fan cam", "직캠", "phone"];

// 원곡이 아닌 2차 콘텐츠(커버, 리액션, 튜토리얼, 노래방 등) — 강한 감점
const BAD_KEYWORDS = [
  "cover",
  "reaction",
  "tutorial",
  "karaoke",
  "instrumental cover",
  "lyrics only",
  "slowed",
  "reverb",
  "practice",
  "lesson",
  "piano cover",
  "guitar cover",
];

const OFFICIAL_TITLE_KEYWORDS = ["official audio", "official video", "official music video", "music video"];
const OFFICIAL_CHANNEL_KEYWORDS = ["topic", "official"];

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

type YoutubeSearchCandidate = {
  videoId: string;
  title: string;
  channelTitle: string;
  liveBroadcastContent: string;
  thumbnailUrl: string;
};

type YoutubeVideoDetails = {
  durationSeconds: number | null;
  title: string;
  channelTitle: string;
  viewCount: number;
  liveBroadcastContent: string;
};

// ISO 8601 duration("PT3M27S" 등)을 초 단위로 변환. 형식이 맞지 않으면 null(파싱 실패) 반환
function parseIso8601DurationSeconds(duration: string): number | null {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);
  if (!match) return null;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  if (hours === 0 && minutes === 0 && seconds === 0 && !match[1] && !match[2] && !match[3]) return null;

  return hours * 3600 + minutes * 60 + seconds;
}

async function searchOnce(query: string, apiKey: string): Promise<YoutubeSearchCandidate[]> {
  const url =
    `${YOUTUBE_SEARCH_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${SEARCH_MAX_RESULTS}&key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  const items: unknown[] = Array.isArray(data?.items) ? data.items : [];

  const candidates: YoutubeSearchCandidate[] = [];
  for (const item of items) {
    const typed = item as {
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        liveBroadcastContent?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string }; default?: { url?: string } };
      };
    };

    const videoId = typed.id?.videoId;
    if (!videoId) continue;

    const thumbnails = typed.snippet?.thumbnails;
    candidates.push({
      videoId,
      title: typed.snippet?.title ?? "",
      channelTitle: typed.snippet?.channelTitle ?? "",
      liveBroadcastContent: typed.snippet?.liveBroadcastContent ?? "none",
      thumbnailUrl: thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? "",
    });
  }

  return candidates;
}

// search.list 후보들의 duration/조회수/방송 상태를 한 번의 videos.list 호출로 일괄 조회
async function fetchVideoDetails(
  videoIds: string[],
  apiKey: string,
): Promise<Map<string, YoutubeVideoDetails>> {
  const result = new Map<string, YoutubeVideoDetails>();
  if (videoIds.length === 0) return result;

  const url =
    `${YOUTUBE_VIDEOS_URL}?part=snippet,contentDetails,statistics&id=${videoIds.join(",")}&key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) return result;

  const data = await response.json();
  const items: unknown[] = Array.isArray(data?.items) ? data.items : [];

  for (const item of items) {
    const typed = item as {
      id?: string;
      snippet?: { title?: string; channelTitle?: string; liveBroadcastContent?: string };
      contentDetails?: { duration?: string };
      statistics?: { viewCount?: string };
    };

    const videoId = typed.id;
    if (!videoId) continue;

    const duration = typed.contentDetails?.duration;
    result.set(videoId, {
      durationSeconds: duration ? parseIso8601DurationSeconds(duration) : null,
      title: typed.snippet?.title ?? "",
      channelTitle: typed.snippet?.channelTitle ?? "",
      viewCount: typed.statistics?.viewCount ? Number(typed.statistics.viewCount) : 0,
      liveBroadcastContent: typed.snippet?.liveBroadcastContent ?? "none",
    });
  }

  return result;
}

// 후보 1개에 점수를 매긴다. null이면 reject(채택 불가)
function scoreCandidate(
  detail: YoutubeVideoDetails,
  trackTitle: string,
  trackArtist: string,
): number | null {
  // 진행 중/예정 라이브 방송은 정상 음원이 아니므로 채택하지 않음 (공식 라이브 "영상"은 duration이 있으면 통과)
  if (detail.liveBroadcastContent !== "none") return null;
  if (detail.durationSeconds === null) return null;
  if (detail.durationSeconds < MIN_DURATION_SECONDS) return null;
  if (detail.durationSeconds > MAX_DURATION_SECONDS) return null;

  const lowerTitle = detail.title.toLowerCase();
  const lowerChannel = detail.channelTitle.toLowerCase();
  const lowerTrackTitle = trackTitle.toLowerCase();
  const lowerArtist = trackArtist.toLowerCase();

  if (HARD_REJECT_KEYWORDS.some((kw) => lowerTitle.includes(kw) || lowerChannel.includes(kw))) {
    return null;
  }

  let score = 0;

  if (BAD_KEYWORDS.some((kw) => lowerTitle.includes(kw) || lowerChannel.includes(kw))) {
    score -= 5;
  }

  if (lowerTrackTitle && lowerTitle.includes(lowerTrackTitle)) score += 4;
  if (lowerArtist && lowerTitle.includes(lowerArtist)) score += 3;
  if (lowerArtist && lowerChannel.includes(lowerArtist)) score += 2;

  if (OFFICIAL_CHANNEL_KEYWORDS.some((kw) => lowerChannel.includes(kw))) score += 3;
  if (OFFICIAL_TITLE_KEYWORDS.some((kw) => lowerTitle.includes(kw))) score += 3;

  if (
    detail.durationSeconds >= PREFERRED_MIN_DURATION_SECONDS &&
    detail.durationSeconds <= PREFERRED_MAX_DURATION_SECONDS
  ) {
    score += 2;
  }

  if (detail.viewCount >= VIEW_COUNT_BONUS_THRESHOLD) score += 1;

  return score;
}

// fallback query들을 순서대로 시도하며 후보를 모은다. 첫 성공에서 멈추지 않고
// 충분한 후보(MAX_CANDIDATES_PER_TRACK)가 모이면 나머지 query는 건너뛴다.
async function collectSearchCandidates(
  title: string,
  artist: string,
  apiKey: string,
): Promise<YoutubeSearchCandidate[]> {
  const base = `${title} ${artist}`;
  const seenVideoIds = new Set<string>();
  const candidates: YoutubeSearchCandidate[] = [];

  for (const suffix of FALLBACK_QUERY_SUFFIXES) {
    if (candidates.length >= MAX_CANDIDATES_PER_TRACK) break;

    try {
      const hits = await searchOnce(`${base}${suffix}`, apiKey);
      for (const hit of hits) {
        if (seenVideoIds.has(hit.videoId)) continue;
        seenVideoIds.add(hit.videoId);
        candidates.push(hit);
      }
    } catch {
      // 이번 fallback 쿼리만 건너뛰고 다음 쿼리를 계속 시도
    }
  }

  return candidates;
}

async function searchTrackWithFallback(
  title: string,
  artist: string,
  apiKey: string,
): Promise<YoutubeSearchHit | null> {
  const candidates = await collectSearchCandidates(title, artist, apiKey);
  if (candidates.length === 0) return null;

  let details: Map<string, YoutubeVideoDetails>;
  try {
    details = await fetchVideoDetails(candidates.map((c) => c.videoId), apiKey);
  } catch {
    return null;
  }

  let best: { candidate: YoutubeSearchCandidate; score: number } | null = null;

  for (const candidate of candidates) {
    const detail = details.get(candidate.videoId);
    if (!detail) continue;

    const score = scoreCandidate(detail, title, artist);
    if (score === null) continue;
    if (!best || score > best.score) {
      best = { candidate, score };
    }
  }

  if (!best) return null;

  return { videoId: best.candidate.videoId, thumbnailUrl: best.candidate.thumbnailUrl };
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
