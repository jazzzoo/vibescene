// LoadingScreen 전용 카피 데이터 — 백엔드 실시간 진행률이 없는 상태에서
// "시간 기반 내러티브"와 "레인 스포트라이트"를 보여주기 위한 순수 데이터 + 셔플 유틸.
// 여기 있는 문구는 실제 서버 이벤트가 아니라 제품 레벨의 설명용 텍스트다.

// ── Processing narrative ────────────────────────────────────────────────
// 3단계(읽기 → 비교 → 정리) 순서로 정렬 — 첫 사이클은 이 순서 그대로 노출되고,
// 이 배열을 다 소진하면 LoadingScreen이 전체 풀을 셔플해 재사용한다.
const VISUAL_READING_MESSAGES = [
  'Reading the scene...',
  'Looking at color and light...',
  'Noticing small visual details...',
  'Checking brightness and contrast...',
  'Reading the space around the subject...',
  'Looking for movement in the frame...',
  'Finding the visual rhythm...',
];

const LANE_COMPARISON_MESSAGES = [
  'Finding the emotional energy...',
  'Comparing music worlds...',
  'Matching the scene to a sound...',
  'Balancing warmth, color, and motion...',
  'Looking past the obvious mood...',
  'Avoiding the predictable match...',
  'Narrowing down the right music lane...',
];

const PLAYLIST_SHAPING_MESSAGES = [
  'Searching the verified catalog...',
  'Looking for a strong opening track...',
  'Building the emotional flow...',
  'Balancing bright and quiet moments...',
  'Shaping the rise and cooldown...',
  'Fine-tuning the track order...',
  'Giving the playlist one last check...',
  'Almost ready to press play...',
];

// 최초 1회 순환 순서 — 시각 정보 → 무드/레인 비교 → 플레이리스트 정리 순으로 진행되는
// "시간 기반 진행 서사"다. 실제 백엔드 진행률과 1:1로 대응하지 않는다.
export const PROCESSING_MESSAGE_SEQUENCE: readonly string[] = [
  ...VISUAL_READING_MESSAGES,
  ...LANE_COMPARISON_MESSAGES,
  ...PLAYLIST_SHAPING_MESSAGES,
];

// 최초 순환이 끝난 뒤 재사용하는 전체 풀 — LoadingScreen이 이 풀을 셔플해서 계속 돌린다.
export const PROCESSING_MESSAGE_POOL: readonly string[] = PROCESSING_MESSAGE_SEQUENCE;

// step === 'finalizing'(실제 상태) 신호를 받았을 때 내러티브를 자연스럽게 마무리 쪽으로
// 당겨오기 위한 인덱스 — PROCESSING_MESSAGE_SEQUENCE 안에서 "정리" 단계가 시작되는 지점.
export const SHAPING_PHASE_START_INDEX =
  VISUAL_READING_MESSAGES.length + LANE_COMPARISON_MESSAGES.length;

// ── Lane spotlight ──────────────────────────────────────────────────────
// supabase/functions/analyze-and-search/services/curationLanes.ts의 CURATION_LANES와
// 1:1로 대응하는 프론트엔드 전용 카피. 백엔드 lane_id 문자열이 아니라 사람이 읽는 이름/설명만 사용한다.
// lane이 추가/제거되면 이 배열도 함께 갱신해야 한다.
export type LaneSpotlightEntry = {
  name: string;
  description: string;
};

export const LANE_SPOTLIGHTS: readonly LaneSpotlightEntry[] = [
  { name: 'Modern Jazz Groove', description: 'Warm brass, deep grooves, and city evenings with a little swing.' },
  { name: 'J-Rock Highway Rush', description: 'Fast guitars for roads, motion, and wind through an open window.' },
  { name: 'K-R&B Night Drive', description: 'Soft neon, quiet confidence, and late-night streets moving slowly.' },
  { name: 'K-Indie Rainy Room', description: 'Rain outside, warm lights inside, and songs that let time slow down.' },
  { name: 'City Pop / Retro Drive', description: 'Polished basslines, retro lights, and memories glowing after sunset.' },
  { name: 'Indie Road Movie', description: 'Departures, distant scenery, and songs built for the journey between places.' },
  { name: 'American Alternative Drive', description: 'Big guitars, open roads, and the feeling of going somewhere.' },
  { name: 'Dream Pop / Shoegaze Fog', description: 'Soft haze, blurred light, and melodies drifting just out of reach.' },
  { name: 'Neon Electronic Night', description: 'Cold light, synthetic motion, and a city still awake at 2 AM.' },
  { name: 'Lo-fi Bedroom Solitude', description: 'Small rooms, late thoughts, and gentle beats that stay close.' },
  { name: 'Summer Beach Pop', description: 'Salt air, open water, and pop made for sunlit afternoons.' },
  { name: 'Funk / Disco Night', description: 'Bright basslines, moving lights, and a night that refuses to sit still.' },
  { name: 'Classic Soul / Old Film', description: 'Warm voices, faded frames, and romance from another decade.' },
  { name: 'Big City Swagger Hip-Hop', description: 'Sharp confidence, tall buildings, and bass that owns the sidewalk.' },
  { name: 'Highteen Pop Room', description: 'Mirrors, posters, friends, and bright pop with bedroom energy.' },
  { name: 'Modern Romance Pop', description: 'Warm closeness, small gestures, and a soundtrack for two.' },
  { name: 'Trendy Pop Chic', description: 'Polished style, glossy light, and pop that knows the camera is watching.' },
  { name: 'Cozy Cafe Mellow', description: 'Coffee, window light, and soft songs for an unhurried table.' },
  { name: 'Hip-Hop Night Drive', description: 'Empty roads, heavy bass, and city lights sliding past the window.' },
  { name: 'Dark Heavy Hip-Hop', description: 'Deep shadows, hard edges, and bass with serious weight.' },
  { name: 'Sunny Stroll Pop', description: 'Flower pots, blue skies, and playful pop for a bright neighborhood walk.' },
];

// ── Shuffle helper ──────────────────────────────────────────────────────
// Fisher-Yates — 입력 배열을 변형하지 않고 새 배열을 반환하는 순수 함수.
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 새로 셔플된 배열의 첫 원소가 직전 사이클의 마지막 원소와 같으면(연속 반복) 다른 위치와 교체한다.
// 배열 길이가 1 이하면 손댈 게 없으므로 그대로 반환.
export function shuffleAvoidingRepeatStart<T>(items: readonly T[], previousLast: T | null): T[] {
  const shuffled = shuffle(items);
  if (shuffled.length <= 1 || previousLast === null) return shuffled;
  if (shuffled[0] !== previousLast) return shuffled;

  const swapIndex = 1 + Math.floor(Math.random() * (shuffled.length - 1));
  [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
  return shuffled;
}
