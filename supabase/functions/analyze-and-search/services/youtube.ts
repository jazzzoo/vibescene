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

// 폰 촬영/비공식 직캠 느낌이 강한 키워드 — "live" 자체는 막지 않되 이런 신호는 reject에 가깝게 처리.
// 단일 영문 단어("phone" 등)는 matchesKeyword()에서 단어 경계로만 매칭되므로
// "saxophone"/"headphone"처럼 단어 일부로 포함된 경우는 오매칭되지 않는다.
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

// 후보가 채택 가능한지(score) / 왜 reject됐는지(reason)를 함께 표현 — 진단 로그용
type CandidateEvaluation =
  | { accepted: true; score: number }
  | { accepted: false; reason: string };

// 진단 로그 한 줄에 들어갈 후보 1개 정보 — videoId는 남기지 않는다.
type CandidateDiagnostic = {
  videoTitle: string;
  channelTitle: string;
  durationSeconds: number | null;
  score: number | null;
  rejectReason: string | null;
};

// 영문 단일 단어 키워드는 단어 경계(\b)로 매칭해 "phone"이 "saxophone"/"headphone"의
// 일부로 오매칭되는 걸 막는다. 공백 포함 구절이나 한글 키워드는 그대로 부분 문자열로 검사한다
// (이미 충분히 구체적인 phrase라 substring으로도 오매칭 위험이 낮음).
function matchesKeyword(haystack: string, keyword: string): boolean {
  const isSingleAsciiWord = /^[a-z]+$/.test(keyword);
  if (!isSingleAsciiWord) return haystack.includes(keyword);
  return new RegExp(`\\b${keyword}\\b`).test(haystack);
}

// title/artist 비교용 정규화 — accent 제거 + 문장부호(아포스트로피, 물음표 등) 제거.
// "You Hate Jazz?"와 "You Hate Jazz" / "Beyoncé"와 "Beyonce" 같은 표기 차이로
// title match 보너스를 못 받는 경우를 줄인다. (이 정규화는 score 가산용이며, reject 여부에는 쓰지 않음)
function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // NFKD로 분리된 combining diacritical mark(accent) 제거
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
  if (!response.ok) {
    // API key/quota 문제인지 구분하기 위한 최소 정보(상태 코드)만 남김. 응답 본문은 남기지 않음.
    console.error("[youtube] search_list_failed", { status: response.status });
    return [];
  }

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
  if (!response.ok) {
    console.error("[youtube] videos_list_failed", { status: response.status });
    return result;
  }

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

// 후보 1개를 평가한다. accepted:false면 reject(채택 불가) — reason은 진단 로그용.
function evaluateCandidate(
  detail: YoutubeVideoDetails,
  trackTitle: string,
  trackArtist: string,
): CandidateEvaluation {
  // 진행 중/예정 라이브 방송은 정상 음원이 아니므로 채택하지 않음 (공식 라이브 "영상"은 duration이 있으면 통과)
  if (detail.liveBroadcastContent !== "none") {
    return { accepted: false, reason: `live_broadcast_${detail.liveBroadcastContent}` };
  }
  if (detail.durationSeconds === null) {
    return { accepted: false, reason: "duration_unknown" };
  }
  if (detail.durationSeconds < MIN_DURATION_SECONDS) {
    return { accepted: false, reason: `too_short_${detail.durationSeconds}s` };
  }
  if (detail.durationSeconds > MAX_DURATION_SECONDS) {
    return { accepted: false, reason: `too_long_${detail.durationSeconds}s` };
  }

  const lowerTitle = detail.title.toLowerCase();
  const lowerChannel = detail.channelTitle.toLowerCase();

  const hardRejectKeyword = HARD_REJECT_KEYWORDS.find(
    (kw) => matchesKeyword(lowerTitle, kw) || matchesKeyword(lowerChannel, kw),
  );
  if (hardRejectKeyword) {
    return { accepted: false, reason: `hard_reject_keyword_${hardRejectKeyword}` };
  }

  const normalizedTitle = normalizeForMatch(detail.title);
  const normalizedChannel = normalizeForMatch(detail.channelTitle);
  const normalizedTrackTitle = normalizeForMatch(trackTitle);
  const normalizedArtist = normalizeForMatch(trackArtist);

  let score = 0;

  if (BAD_KEYWORDS.some((kw) => matchesKeyword(lowerTitle, kw) || matchesKeyword(lowerChannel, kw))) {
    score -= 5;
  }

  if (normalizedTrackTitle && normalizedTitle.includes(normalizedTrackTitle)) score += 4;
  if (normalizedArtist && normalizedTitle.includes(normalizedArtist)) score += 3;
  if (normalizedArtist && normalizedChannel.includes(normalizedArtist)) score += 2;

  if (OFFICIAL_CHANNEL_KEYWORDS.some((kw) => matchesKeyword(lowerChannel, kw))) score += 3;
  if (OFFICIAL_TITLE_KEYWORDS.some((kw) => matchesKeyword(lowerTitle, kw))) score += 3;

  if (
    detail.durationSeconds >= PREFERRED_MIN_DURATION_SECONDS &&
    detail.durationSeconds <= PREFERRED_MAX_DURATION_SECONDS
  ) {
    score += 2;
  }

  if (detail.viewCount >= VIEW_COUNT_BONUS_THRESHOLD) score += 1;

  return { accepted: true, score };
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
  if (candidates.length === 0) {
    // search.list 자체가 후보를 하나도 못 가져온 경우 — 위의 search_list_failed 로그와 함께 보면
    // API 실패인지, 정말 검색 결과가 없는지 구분할 수 있다.
    console.error("[youtube] no_acceptable_candidate", {
      track: { title, artist },
      candidateCount: 0,
      candidates: [],
    });
    return null;
  }

  let details: Map<string, YoutubeVideoDetails>;
  try {
    details = await fetchVideoDetails(candidates.map((c) => c.videoId), apiKey);
  } catch {
    console.error("[youtube] no_acceptable_candidate", {
      track: { title, artist },
      candidateCount: candidates.length,
      candidates: [],
    });
    return null;
  }

  let best: { candidate: YoutubeSearchCandidate; score: number } | null = null;
  const diagnostics: CandidateDiagnostic[] = [];

  for (const candidate of candidates) {
    const detail = details.get(candidate.videoId);
    if (!detail) {
      diagnostics.push({
        videoTitle: candidate.title,
        channelTitle: candidate.channelTitle,
        durationSeconds: null,
        score: null,
        rejectReason: "video_details_missing",
      });
      continue;
    }

    const evaluation = evaluateCandidate(detail, title, artist);
    if (!evaluation.accepted) {
      diagnostics.push({
        videoTitle: detail.title,
        channelTitle: detail.channelTitle,
        durationSeconds: detail.durationSeconds,
        score: null,
        rejectReason: evaluation.reason,
      });
      continue;
    }

    diagnostics.push({
      videoTitle: detail.title,
      channelTitle: detail.channelTitle,
      durationSeconds: detail.durationSeconds,
      score: evaluation.score,
      rejectReason: null,
    });

    if (!best || evaluation.score > best.score) {
      best = { candidate, score: evaluation.score };
    }
  }

  if (!best) {
    // 좋은 후보가 하나도 채택되지 못한 경우에만 후보별 reject 원인을 남긴다 (성공 케이스는 로그하지 않음).
    console.error("[youtube] no_acceptable_candidate", {
      track: { title, artist },
      candidateCount: candidates.length,
      candidates: diagnostics,
    });
    return null;
  }

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
