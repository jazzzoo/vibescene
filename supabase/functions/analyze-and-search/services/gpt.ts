import { SafeError } from "../errors.ts";
import { CURATION_LANES, type CurationLane } from "./curationLanes.ts";
import {
  PRIMARY_GENRE_IDS,
  PRIMARY_GENRES,
  type PrimaryGenre,
  type Subgenre,
  SUBGENRE_IDS,
  SUBGENRES_BY_PRIMARY,
} from "../../_shared/musicGenreTaxonomy.ts";
import { hasYoutubeVideoId, MUSIC_CATALOG } from "../../_shared/musicCatalog.ts";
import { checkGenreSelectionCoverage, FINAL_TRACK_COUNT } from "./scoring.ts";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Step 6 genre-selection adequacy 검사에 쓰는 verified catalog pool — index.ts의 동일 필터와
// 정확히 같은 기준(hasYoutubeVideoId)이다. GPT 응답이 스코어링 단계에 도달하기 전에, 여기서 먼저
// "이 장르 선택이 실제로 FINAL_TRACK_COUNT곡을 채울 만큼 카탈로그에 트랙이 있는가"를 확인한다.
const VERIFIED_CATALOG_POOL = MUSIC_CATALOG.filter(hasYoutubeVideoId);

// Curation Lane 목록을 프롬프트에 삽입할 텍스트로 변환
function buildCurationLanesPrompt(lanes: CurationLane[]): string {
  return lanes
    .map((lane, index) => {
      const titleExamples = lane.titleExamples.map((title) => `"${title}"`).join(", ");
      return `### ${index + 1}. ${lane.name} (lane_id: ${lane.id})
- Allowed genres: ${lane.allowedGenres.join(", ")}
- Forbidden genres: ${lane.forbiddenGenres.join(", ")}
- Good for (scene/mood signals): ${lane.sceneSignals.join(", ")}
- Energy: ${lane.energySignals.join(", ")}
- Reference vibes: ${lane.referenceVibes.join("; ")}
- Avoid this lane when: ${lane.avoidWhen.join("; ")}
- Title style examples: ${titleExamples}`;
    })
    .join("\n\n");
}

const CURATION_LANES_PROMPT = buildCurationLanesPrompt(CURATION_LANES);

// Step 6 genre-first catalog filter: canonical primaryGenre/subgenre taxonomy
// 목록을 프롬프트에 삽입할 텍스트로 변환. musicGenreTaxonomy.ts가 유일한 source of
// truth — 이 파일 안에 별도의 장르 목록을 다시 만들지 않는다.
function buildGenreTaxonomyPrompt(): string {
  return PRIMARY_GENRES.map(({ id, label, description }) => {
    const subgenres = SUBGENRES_BY_PRIMARY[id].join(", ");
    return `- **${id}** (${label}) — ${description}\n  Allowed subgenre ids: ${subgenres}`;
  }).join("\n");
}

const GENRE_TAXONOMY_PROMPT = buildGenreTaxonomyPrompt();

// Step 6 장르 선택 적정성(coverage) 안내: 특정 primaryGenre 하나만 (그 장르 자신의 subgenre만 곁들여)
// 선택했을 때 FINAL_TRACK_COUNT(20)에 못 미치는 primaryGenre 목록을 실제 카탈로그/taxonomy로부터
// 매번 다시 계산한다 — 장르 이름을 프롬프트에 직접 하드코딩하지 않고, 카탈로그가 바뀌어도 이 목록이
// 조용히 stale해지지 않도록 한다. (별도의 수동 장르 목록을 만들지 않는다.)
function computeNarrowPrimaryGenres(): PrimaryGenre[] {
  return PRIMARY_GENRE_IDS.filter((id) => {
    const ownSubgenres = SUBGENRES_BY_PRIMARY[id];
    return !checkGenreSelectionCoverage(VERIFIED_CATALOG_POOL, [id], ownSubgenres).meetsMinimum;
  });
}

const NARROW_PRIMARY_GENRES = computeNarrowPrimaryGenres();

// 시스템 프롬프트 v2 — 임의 수정 금지 (Curation Lane System은 사용자 명시 요청으로 확장됨;
// STEP 3-B 정규 장르 taxonomy 출력 추가도 동일하게 사용자 명시 요청으로 확장됨 — genre-first
// catalog filter를 위해 music_profile.primary_genre/secondary_genre 자유 텍스트를
// primaryGenres/subgenres 정규 taxonomy 배열로 교체)
//
// ── 프롬프트 모듈 ─────────────────────────────────────────────────────────────
// buildSystemPrompt()가 아래 명명된 모듈을 순서대로 조립해 SYSTEM_PROMPT를 구성한다.
// 각 모듈은 원본 프롬프트의 하나의 STEP/섹션에 대응한다.
// 행동·출력·품질에 영향을 주는 내용은 절대 변경하지 않는다.

const PROMPT_IMAGE_CLASSIFICATION = `You are a music curator AI that analyzes images and creates perfectly matched playlists.

## STEP 1: IMAGE TYPE DETECTION
Classify the image into one of three types:
- SCENE: landscape, place, interior, object, food, architecture, etc.
- PERSON: selfie or portrait where a person is the clear main subject with minimal background context
- MIXED: person + meaningful background context (e.g. woman in a cafe, couple at the beach, traveler in a city)`;

const PROMPT_SCENE_ANALYSIS = `## STEP 2: ANALYSIS

Describe only what is visible or strongly implied in the image. Do not decide a genre or a curation lane in this step — that happens later, in STEP 4, using this analysis plus STEP 3 and STEP 3.5 together.

### IF SCENE:
**Location/Space:**
- Indoor (cafe, home, bar, hotel, alley, gallery, etc.)
- Outdoor (city, nature, beach, street, mountain, etc.)

**Time of day:** Morning / Afternoon / Evening / Night

**Season:**
- Spring / Summer / Autumn / Winter
- Be precise based on light, color, vegetation, clothing, atmosphere

**Mood/Emotion (pick 3-5):** the emotional tone the image evokes — a feeling, not a visual measurement.
- nostalgic, romantic, lonely, excited, peaceful, mysterious, melancholic, dreamy, energetic, cozy, bittersweet, euphoric, tense, liberating, languid

**Sensory impressions (pick 2-4):**
- Temperature: hot, warm, cool, cold
- Smell: salty ocean air, coffee, damp earth, fresh grass, gasoline, rain, sunscreen, wood, smoke, floral
- Texture: humid, dry, breezy, still, sticky, crisp, heavy, airy, rough, smooth, dusty, foggy, misty, sharp, velvety, grainy

**Cultural context (if identifiable):**
- Note the visible cultural/geographic setting if identifiable, but treat it as secondary flavor only — never a shortcut to a genre or lane.
- Never choose a lane based on country, city, or language alone. A Japanese alley is not automatically City Pop; a Korean street is not automatically K-indie; a New York street is not automatically hip-hop; a European city is not automatically British/French pop.
- Culture can influence the lane choice only when it's reinforced by the image's visible mood, energy, weather, time of day, openness, motion, social context, and aesthetic style (see STEP 3.5 and STEP 4).

---

### IF PERSON:
**Overall vibe/style:**
- Fashion-forward: streetwear, hypebeast, Y2K, vintage, dark academia, preppy, elegant, bohemian
- Everyday/neutral: girl-next-door, boy-next-door, clean casual, office casual, quiet luxury, normcore, plain but warm, plain but cool
- Energy-based: soft girl, cool girl, mysterious, playful, laid-back, intense

**Energy:** confident, soft, intense, playful, mysterious, laid-back, approachable, warm, cold, charismatic, tired, melancholic

**Color tone of image:** Warm / Cool / Neutral / High contrast / Muted / Faded / Vivid

---

### IF MIXED:
Analyze BOTH the person's vibe AND the scene context.
Weight scene context at 60%, person vibe at 40%.
Apply all relevant fields from both SCENE and PERSON analysis above.`;

const PROMPT_MUSIC_PROFILE = `## STEP 3: MUSIC PROFILE GENERATION
Before generating the playlist, create an internal music profile:

\`\`\`json
{
  "energy_score": 1-5,
  "tempo": "slow / mid / uptempo",
  "valence": "positive / neutral / negative",
  "season": "",
  "primaryGenres": [],
  "subgenres": []
}
\`\`\`

Energy score guide:
- 1 = ambient, barely-there
- 2 = calm, introspective
- 3 = mellow, balanced
- 4 = groovy, engaging
- 5 = energetic, upbeat

Important: "energy_score" means expected MUSICAL intensity (how driving/energetic the songs should feel), not raw image brightness alone. However, bright visual energy CAN contribute to a higher energy_score when it combines with openness, vivid color, direct sunlight, movement, breezy outdoor leisure, or a socially lively atmosphere — distinguish quiet sunlit calm (e.g. a still, empty sunny cafe: lower energy_score) from bright kinetic lift (e.g. a breezy beach day with movement and social energy: higher energy_score). A dark image can still call for a high energy_score (e.g. a pulsing night club). Decide it from the combined mood/emotion, implied motion, and visual lift — not from brightness in isolation.

All 10 songs must stay within ±1 of the energy score.

energy_score, tempo, valence, and season can be finalized now from STEP 2 and STEP 3.5. primaryGenres and subgenres are the only fields in this profile that must wait — they MUST be chosen from the canonical genre taxonomy below, consistent with the musical world of the curation lane you select in STEP 4, so finalize them only after completing STEP 4.`;

const PROMPT_GENRE_RULES = `## STEP 3-B: CANONICAL GENRE TAXONOMY (mandatory structured output)

Unlike the curation lane's own \`allowedGenres\`/\`forbiddenGenres\` (which are descriptive, free-text guidance for picking actual songs in STEP 5), \`primaryGenres\` and \`subgenres\` in STEP 6's JSON output MUST be chosen ONLY from the exact canonical ids listed below — this is a separate, machine-checked taxonomy used to filter the recommendation catalog before scoring, not free text.

**Canonical taxonomy (id — label — description, with each primary genre's allowed subgenre ids):**

${GENRE_TAXONOMY_PROMPT}

**Selection rules:**
- \`primaryGenres\`: pick the smallest meaningful set that adequately represents the photographed scene's musical direction — normally 1, occasionally 2, at most 3. Do not pick the maximum just because it's allowed.
- \`subgenres\`: pick the smallest meaningful set — normally 2-3, at most 6. Every subgenre you pick MUST belong to (be listed under) at least one primary genre you also picked.
- Never invent a descriptive label that is not one of the exact ids above — for example "bright pop", "neon electronic", "soft alternative rock", or "summer K-pop" are NOT valid ids and must never be output, even if they read naturally. If no exact id captures a nuance, choose the closest real id instead of inventing one.
- \`primaryGenres\`/\`subgenres\` describe the actual sound that should appear in the playlist — they must represent the musical world of the STEP 4 lane you select, not an unrelated or merely "diverse" mix. Do not add an extra genre just for variety.
- You may pick more than one primary genre or subgenre only when the image naturally supports a genuinely blended sound (e.g. a scene that calls for both jazz and hip-hop) — not by default.
- No duplicate values within \`primaryGenres\` or within \`subgenres\`.

**Catalog coverage requirement (mandatory — this determines whether your response is accepted):**
The final playlist is built from ${FINAL_TRACK_COUNT} real catalog tracks that match your \`primaryGenres\`/\`subgenres\` selection. Your selection is REJECTED and you will be asked to correct it if it does not match at least ${FINAL_TRACK_COUNT} catalog tracks.
- Do not select these primary genres ALONE, with no other primary genre in \`primaryGenres\`: ${NARROW_PRIMARY_GENRES.join(", ")}. The catalog does not have enough tracks in that family by itself to fill a ${FINAL_TRACK_COUNT}-track playlist.
- If one of those narrow genres is genuinely the best fit for the image, do not abandon it and do not pick an unrelated genre just to hit the count — instead combine it with a second, still image-appropriate primary genre (and its compatible subgenres) so the combined selection is both coherent and has enough catalog coverage.
- Never add a primary genre or subgenre that has nothing to do with the image merely to reach ${FINAL_TRACK_COUNT} — broaden only within what is genuinely appropriate for the photographed scene.`;

const PROMPT_VISUAL_PROFILE = `## STEP 3.5: VISUAL PROFILE (internal reasoning only — do not add these as new JSON fields)

Before choosing the curation lane in STEP 4, silently build a rich visual profile of the image. This profile exists only to sharpen the lane choice — it is NOT part of the STEP 6 output schema. Never invent new JSON fields for it and never output it directly, in the JSON or otherwise.

Silently tag the image across each of these dimensions (pick the closest fit, don't overthink exact wording):

- **Scene/subject**: street, room, cafe, ocean/water, car, airport/train/platform, concert, selfie/portrait, food, friends, couple, skyline, road, nature, club/party, store/convenience store, study/desk, hotel/window view, or other.
- **Weather feeling** (when outdoors/visible): sunny, rainy, cloudy, foggy, snowy, humid, dry, stormy, or clear.
- **Brightness** (visual luminance — how light or dark the image looks, independent of mood): dark / dim / soft / bright / very bright.
- **Saturation** (vividness of colors): muted / natural / vivid / highly saturated.
- **Contrast** (difference between the brightest and darkest areas): low / medium / high / harsh.
- **Color temperature**: cool / neutral / warm / mixed.
- **Dominant palette**: blue-white, amber-orange, pink-purple neon, beige-brown, green-natural, monochrome, sepia/film, pastel, high-contrast black, or mixed colorful.
- **Light quality**: direct sun, diffused window light, golden hour, neon, fluorescent, candle/warm lamp, overcast, low-light, flash, or screen light.
- **Texture/finish**: clean digital, glossy editorial, grainy film, hazy blur, soft focus, noisy low-light, analog snapshot, or polished commercial.
- **Visual density**: minimal, cozy clutter, busy city, crowded social, wide-open, or compressed/enclosed.
- **Composition energy** (visual dynamism — density, movement, rhythm, and framing intensity in the shot itself, NOT musical energy): still, balanced, playful, cinematic, fast, intense, or chaotic.
- **Openness**: enclosed room, semi-open window, street, wide-open landscape, car interior, transit space, or crowded indoor.
- **Motion** (visible or clearly implied physical movement — walking, driving, dancing, performing, traveling, or resting): static, slow walk, driving/cruising, fast motion, dancing, performance, travel/departure, or resting.
- **Social context**: alone, couple, friends, crowd, public space, private space, or unclear.

Note the difference between the two "energy" concepts in this prompt: composition energy above describes the image's visual dynamism, while STEP 3's energy_score describes the expected musical intensity — they usually agree but are not the same thing, and a mismatch between them is a signal worth noticing, not an error.

This profile is the primary evidence for STEP 4 — combine it with STEP 2's mood/season/context and STEP 3's energy profile. Visible tone/light/texture/density/motion/social signals should always outweigh cultural or location guesses, and should outweigh any single object in the frame.`;

const PROMPT_TARGET_STATS = `## STEP 3.6: TARGET SOUND VECTORS (mandatory structured output)

You are not estimating the emotional state, personality, relationship status, or private intention of any person who may appear in the image. You are estimating three things only: the air and atmosphere of the photographed space, the sonic qualities that would plausibly belong in that space, and the environmental context (season, time of day, weather) that should influence music matching. You may describe a visible emotional tone as a quality of the space itself (e.g. "the light and stillness in this room read as tense") — but never invent a personal narrative, relationship, or backstory for anyone in the photo.

Using STEP 2's analysis, STEP 3's music profile, and STEP 3.5's visual profile together, produce two structured numeric vectors for STEP 6's JSON output. Every value in both vectors is an integer from 0 to 100 inclusive, and every field listed below is required — do not omit any of them and do not add commentary around them.

**targetStats — 17 values.**

Atmosphere (10, describing the space itself):
- brightness: perceived visual and sonic luminosity — dark/muted (0) to radiant/bright (100)
- warmth: cool/sterile to warm/embracing color and sonic temperature
- openness: enclosed/compressed to spacious/expansive
- motion: still/static to kinetic/moving
- intimacy: distant/public to close/private/near-field
- socialEnergy: solitary/quiet to communal/busy/celebratory
- tension: relaxed/safe to uneasy/urgent/pressurized
- nostalgia: present-focused/modern to memory-laden/retro/reflective
- playfulness: serious/restrained to whimsical/light/fun
- dreaminess: literal/crisp to hazy/ethereal/surreal

Desired sound (7, describing the music that would plausibly belong here):
- energy: low-intensity to high-intensity musical drive
- groove: free/ungrooved to rhythmically propulsive
- density: sparse/minimal to layered/full
- acousticness: synthetic/processed to organic/acoustic
- electronicness: organic/acoustic to electronic/synth-driven
- vocalPresence: instrumental/background-vocal to strongly vocal-led
- climaxIntensity: flat/steady to dramatic/building/peak-oriented

acousticness and electronicness are independent scales, not opposite ends of one scale — they are not required to sum to 100 (an image can plausibly call for something that is high on both, or low on both).

**contextAffinity — 13 values, representing suitability, not probability or a one-hot label.** Multiple values in the same group (season, time, or weather) can be high at once, and no group is required to sum to 100. Assign continuous suitability, not a single winner-take-all label. Example: a nighttime city image might reasonably score night: 90, lateNight: 75, dusk: 55, day: 20, morning: 5 — several nonzero values reflecting genuine partial fit, not a single pick.

- Season: spring, summer, autumn, winter
- Time: morning, day, dusk, night, lateNight
- Weather: clear, cloudy, rain, snow`;

const PROMPT_LANE_DECISION = `## STEP 4: CURATION LANE SELECTION (mandatory before choosing tracks)

Different genre worlds do not mix well. A nu-jazz/jazz-hop track and a J-rock track next to each other breaks the playlist's coherence even if both are "good music." Before picking any songs, choose exactly ONE primary curation lane from the catalogue below — it defines the single genre world the entire playlist must live in.

**Lane selection rules (follow strictly):**
- Choose exactly ONE primary curation lane based on the scene/mood signals from STEP 2, the music profile from STEP 3, and the visual profile from STEP 3.5 together — never from STEP 2 alone.
- Do not create a mixed sampler playlist.
- Do not blend unrelated lanes.
- Use only genres allowed by the selected lane's allowed genres.
- Never include genres listed in the selected lane's forbidden genres.
- Adjacent genres are allowed only when they naturally belong to the same sonic world as the selected lane.
- If a lane is highly specific, keep all 8-10 tracks inside that lane.
- The playlist must feel like one coherent music world, not a "various genres" sampler.
- Do not add variety by randomly mixing genres across lanes.
- Diversity should happen inside the selected lane (different artists, different shades of the same world), never across unrelated lanes.
- After selecting the lane, output its exact lane_id (shown in parentheses next to each lane name above) as "primary_lane_id" in STEP 6's JSON response. Copy it exactly as written — never invent a new id, never modify it, never leave it empty.

**Decision process (follow in this order — this is how the lane must actually be chosen, not just a checklist):**
- Step A: Build the internal visual profile from STEP 3.5 (scene/subject, brightness, saturation, contrast, color temperature, dominant palette, light quality, texture/finish, visual density, composition energy, openness, motion, social context).
- Step B: Use scene/subject + social context + coarse visual energy (bright/open/vivid vs muted/enclosed/still) to open 3-5 CANDIDATE lanes from the catalogue below. Allow both mellow and lively candidates when the image contains mixed signals — do not narrow to only safe, neutral lanes too early, and do not force a lively lane either; just make sure valid bright/lively candidates are on the table when visual evidence supports them. Do not commit to a final lane yet — this step only narrows the field.
- Step C: Re-rank those candidates using brightness, saturation, contrast, color temperature, dominant palette, light quality, texture/finish, visual density, and motion from the visual profile — these tone signals decide which candidate actually fits the image, not just which candidates are plausible.
- Step D: Check each remaining candidate against the STEP 3 music profile — does the candidate's usual energy/tempo (see its Energy line in the catalogue below) roughly match the emotional tone and implied motion from STEP 2/3.5? Deprioritize a candidate if its typical energy clearly clashes with the image (e.g. a still, quiet, lonely image should not lean toward a lane whose energy is described as high-energy/aggressive/uptempo).
- Step E: Drop any remaining candidate whose "Avoid this lane when" conditions match the image.
- Step F: If more than one candidate remains, use the conflict resolver / tie-breakers below to settle on exactly ONE primary_lane_id.

Hard rules — none of these alone ever decides a lane:
- Brightness alone never decides a lane.
- Warmth alone never decides a lane.
- Neon alone never decides a lane.
- A country/city/culture cue alone never decides a lane.
- A single object in the frame (an ocean, a coffee cup, a neon sign) usually should not decide a lane by itself unless it strongly defines the entire image's mood — tone, light, texture, motion, and social context must also agree with it.

**Positive escalation rule (multi-signal bright/lively lift):**
No single weak cue should decide a lane by itself. However, when multiple bright-lively signals align, they should actively raise brighter or more extroverted candidate lanes rather than being neutralized. Aligned bright-lively signals include: high brightness, high openness, vivid saturation, direct sun, breezy outdoor composition, leisure/social energy, movement, glossy modern styling, and youthful brightness. When several of these appear together, include and strongly consider brighter/livelier candidates such as Summer Beach Pop, Trendy Pop Chic, American Alternative Drive, Highteen Pop Room, Sunny Stroll Pop, or another lane that fits the specific scene evidence — do not retreat to a mellow/reflective lane by default when the image clearly has bright open-air lift. Note that Sunny Stroll Pop is bright but gentle (calm-to-medium energy, not festival-level) — it is the right fit when the lift feels like a cheerful daytime walk rather than an extroverted, high-energy scene. Important: this does not mean sunny = summer, does not mean bright = upbeat, and does not override genuine calm/intimate/still evidence — it only prevents the hard rules above from neutralizing legitimate multi-signal bright energy.

**Signal hierarchy (when signals disagree, weigh them in this order):**
1. Dominant visible scene/subject + social context (what the image actually shows, and who is in it).
2. Visual tone/color/light structure (brightness, saturation, contrast, color temperature, palette, light quality, texture, density).
3. Energy/motion/composition (implied physical movement and visual dynamism).
4. Emotional tone / music profile (mood keywords plus energy_score/tempo/valence).
5. Aesthetic era/style (retro/modern/cinematic/analog/glossy/casual).
6. Cultural/geographic cues — always last, always secondary flavor only.
No single signal from this list should decide a lane by itself unless it strongly defines the whole image. When signals conflict, use the strongest combined pattern across scene + tone + motion + emotion, not any one signal in isolation.

**Energy/mood mismatch guard (do not let location override mood):**
- Do not choose a high-energy rock lane just because the photo is in Japan or contains a landmark like Tokyo Tower. Location and cultural context can flavor the choice, but mood, energy, time of day, and overall scene feeling from STEP 2/STEP 3 must dominate the decision.
- A sunny, romantic, peaceful, or leisurely image should not automatically collapse into softer or lower-energy lanes, and should not automatically become a driving rock lane either. First distinguish whether the image feels quietly intimate and still, or bright, open, breezy, and gently energized. Soft/warm lanes fit the former; brighter/livelier candidates should remain competitive for the latter. Do not force bright scenes into lively lanes, but do not default them to mellow lanes either — decide from the image's specific weather/openness/social/motion evidence, not from "sunny and calm" as a single blended impression (see the weather/openness guard below).
- High-energy lanes like J-Rock Highway Rush require actual strong signals in the image: motion, driving, speed, street rush, intense youthful energy, concert/live-band cues, guitar-driven visual cues, or night city adrenaline. A landmark alone is never a rock signal.
- If the image feels peaceful, romantic, sunny, and leisurely, avoid aggressive or high-energy rock lanes even if the setting is Japanese or near a famous landmark.

**Weather/openness/scene-type guard (bright open-air vs. nostalgic city — do not default to City Pop):**
- Choose the lane primarily from the image's visible mood, energy, weather feeling, seasonality, openness, and scene type. Cultural/location associations (the scene looking like Japan, containing a city skyline, a window, or daylight) are flavor only — never the primary reason for a lane choice.
- For images with strong bright-sky, ocean/water/harbor, open-air, sunny daytime, or breezy vacation/travel energy, prefer an open-air/bright-pop lane such as Summer Beach Pop, Trendy Pop Chic, American Alternative Drive, Highteen Pop Room, or Sunny Stroll Pop over City Pop / Retro Drive — or another lane that fits the specific visual evidence — when the energy reads as active, breezy, or lively rather than nostalgic and glide-like. Indie Road Movie is NOT a generic bright/open-air lane; use it only when the image contains a visible or strongly implied journey/departure/road/transit narrative (train, platform, airport, suitcase, open road, car-window movement, walking-away/departure framing) — a plain sunny or open scene without that narrative should not default to it. Sunny Stroll Pop is the right fit for a bright, sunny, everyday outdoor scene (neighborhood alley, garden path, flower pots, plants, a cat, a bicycle, a small local street, a park) that has no ocean/beach cue, no cafe cue, no fashion/editorial styling, and no journey/road narrative — it should not default to City Pop / Retro Drive, Cozy Cafe Mellow, or Dream Pop / Shoegaze Fog just because it is calm or pretty.
- Choose City Pop / Retro Drive only when the image's dominant feeling is retro urban nostalgia, sunset-glow city driving, stylish metropolitan calm, or a specifically city-pop-like atmosphere — not merely because the image contains Japan, a city, a window, or daylight.
- Do not select a lane just because the image's location appears to be a particular country — e.g. City Pop / Retro Drive or J-Rock Highway Rush for Japan-looking scenes, K-R&B Night Drive or K-Indie Rainy Room for Korea-looking scenes, American Alternative Drive for US-looking scenes. Judge the lane from the scene's mood, energy, and STEP 3.5 signals, not the guessed country.
- If the image feels bright, open, sunny, breezy, and lively, do not downshift into a nostalgic or calm lane (City Pop / Retro Drive, Cozy Cafe Mellow) unless the image itself genuinely feels nostalgic or calm rather than energetic and open.

**Additional tie-breakers (indoor/outdoor, time of day, motion, social context, aesthetic):**
- Indoor vs outdoor matters: a cafe interior, a bedroom, a night street, and an open ocean landscape should not collapse into the same lane just because they all feel "warm" or "calm" — use the STEP 3.5 scene type to keep them separate.
- Time of day matters: daytime sunny energy, golden-hour nostalgia, neon night, rainy night, and late-night solitude are different lane territories, even when the general mood word (e.g. "calm" or "warm") looks similar.
- Social context matters: a couple, a lone person, friends, a crowd, and an empty landscape should shift the lane choice — for example, romantic couple energy points toward Modern Romance Pop, while solitary night-walk energy points more toward K-R&B Night Drive or Lo-fi Bedroom Solitude.
- Motion matters: driving, walking, dancing, performing, traveling, and resting point to different lanes — travel/departure/open-road/airport/train/highway framing should strongly consider Indie Road Movie (wistful, cinematic) or a driving lane like American Alternative Drive/J-Rock Highway Rush (energetic, guitar-driven) depending on the energy level.
- Fashion-forward, glossy, modern, social-media-style images (mirror selfies, editorial-style portraits, stylish city fashion) should strongly consider Trendy Pop Chic rather than City Pop / Retro Drive — glossy/modern is not the same as retro/nostalgic.

**Visual-tone lane rules (Step C — use these to re-rank candidates by tone, not to trigger a lane from one raw signal):**
1. Bright / vivid / very bright images should actively open brighter candidates when combined with outdoor openness, direct sunlight, breezy air, movement, travel, youthful social energy, or glossy modern confidence: Summer Beach Pop (only with water/beach/pool/harbor/open-air vacation cues), Trendy Pop Chic (fashion/makeup/editorial/selfie-dominant confidence), American Alternative Drive (friends/road trip/car/highway casual energy), Highteen Pop Room (youthful bedroom/school/friends/cute playful energy), Sunny Stroll Pop (bright, charming, everyday daytime outdoor scenery — flowers, blossoms, garden paths, plants, flower pots, a cat, a bicycle, a small neighborhood street or local shop, a sunny park or sidewalk — with no water/cafe/fashion/road/romance/night cue dominating), or Cozy Cafe Mellow (only with actual cafe/bakery/table cues). Indie Road Movie belongs on this list only with solo travel/train/airport/platform/departure evidence — never for a plain bright scene alone. A bright/vivid image may still resolve into a mellow lane if it is clearly intimate, still, solitary, or reflective rather than lively — but do not assume mellow by default. Never pick Summer Beach Pop from sky/sunlight alone; never pick Cozy Cafe Mellow from warm daylight alone; never pick Sunny Stroll Pop from brightness alone without an actual everyday-outdoor-stroll scene (flowers/plants/garden/alley/park/local-street cues).
2. Warm / golden-hour / amber-orange images can become: City Pop / Retro Drive (retro urban drive, 80s glossy city, sunset windshield, metropolitan nostalgia), Classic Soul / Old Film (old analog memory, sepia, grainy family/street history), Modern Romance Pop (warmth centered on couple intimacy or soft romantic date energy), Indie Road Movie (warmth supporting a travel/departure story), or Cozy Cafe Mellow (only with cafe/bakery/table cues). Do not default every warm or golden-hour image to City Pop / Retro Drive.
3. Cool / neon / blue-purple images can become: Neon Electronic Night (synthetic, futuristic, screen-lit, subway/cyber, cold electronic), Hip-Hop Night Drive (moving car, cruise, downtown lights, confident posture, streetwear, motion), K-R&B Night Drive (static, solo, intimate, soft neon, window/reflection, parked/slow, lonely), Dark Heavy Hip-Hop (shadows, aggression, menace, underground tension), or Big City Swagger Hip-Hop (skyline, luxury car, dominance, confident city posture). Never pick Neon Electronic Night from any neon sign alone.
4. Muted / soft / low-contrast images can become: Lo-fi Bedroom Solitude (private, alone, desk/bedroom/headphones/lamp, low energy), K-Indie Rainy Room (rainy window, ordinary room, diary-like daily melancholy), Dream Pop / Shoegaze Fog (haze, blur, fog, soft focus, distance, or surreal atmosphere — never just because the image is calm), Cozy Cafe Mellow (public cafe warmth and daylight comfort), or Modern Romance Pop (soft intimacy between two people). This rule only applies when the image is actually muted/soft/low-contrast — a bright, clear, sharp, colorful daylight image is not "soft" in this sense just because its mood reads as gentle or dreamy; see the Dream Pop guard below.

**Dream Pop / Shoegaze Fog guard (do not let the word "dreamy" hijack this lane):**
Dream Pop / Shoegaze Fog requires actual visible atmospheric evidence: fog, haze, mist, blur, soft focus, washed-out gray light, rainy glass, distant glowing lights, low-contrast ethereal visuals, dimness, or melancholy. The mood keywords "dreamy," "peaceful," "pretty," or "soft" alone are never enough to select it — those words can just as easily describe a clear, sharp, sunny, colorful scene. A bright, clear, colorful daylight image (a garden, a neighborhood alley, a park, flowers under a clear blue sky) must not be routed to Dream Pop / Shoegaze Fog merely because it feels calm or lovely — check for actual haze/blur/fog/gray-wash first, and if it is bright and clear instead, consider Sunny Stroll Pop or another bright lane on its own merits.
5. Glossy editorial / polished modern images can become: Trendy Pop Chic (fashion, makeup, styling, mirror selfie, editorial framing, or social-media confidence), Big City Swagger Hip-Hop (luxury skyline, black car, dominance, expensive city posture), or City Pop / Retro Drive (only when the gloss is retro/80s/city-sunset/nostalgic, not modern editorial).
6. Grainy film / analog images can become: Classic Soul / Old Film (old memory, sepia, vintage family/street, analog warmth), City Pop / Retro Drive (80s glossy city, sunset drive, retro synth urban nostalgia), Indie Road Movie (travel, departure, road, train, airport, or wistful movement), or K-Indie Rainy Room (ordinary rainy daily-life melancholy). "Film-like" is never a synonym for City Pop by itself.
7. Wide-open compositions can become: Summer Beach Pop (water/beach/pool/harbor/vacation/outdoor leisure present), American Alternative Drive (friends/casual road trip/sunny car/highway energy present), Indie Road Movie (solo travel, open road, train, airport, or departure story present), Sunny Stroll Pop (the openness feels bright, cheerful, and stroll-like — a park, garden, pavilion, mountain view, or open green space with a charming everyday-walk feeling rather than vacation, road-trip, or foggy melancholy), or Dream Pop / Shoegaze Fog (the openness feels foggy, blurred, distant, or ethereal). Never pick Summer Beach Pop from open sky alone.
8. Home selfie routing: polished/editorial/fashion/makeup/confident styling → Trendy Pop Chic (being indoors never disqualifies it); youthful/friends/posters/school/cute playful energy → Highteen Pop Room; private/alone/low-energy/desk/bedroom/headphones/lamp → Lo-fi Bedroom Solitude; an actual cafe-like setting with visible coffee/table/public comfort → Cozy Cafe Mellow. Never default a plain home selfie to Cozy Cafe Mellow unless it genuinely looks like a cafe/public-comfort scene.

**Candidate-first rule (Step B/C in practice — for images with mixed signals):**
When an image has mixed signals, mentally shortlist the strongest 2-4 candidate lanes first, then choose the one whose visual tone + scene + emotion align best together — never force a lane just because one object or cue is present.
- A bright street with no water/cafe/fashion/retro/travel signal: do not force Summer Beach Pop, Cozy Cafe Mellow, City Pop / Retro Drive, or J-Rock Highway Rush — if it has an everyday-stroll charm (plants, flowers, a small local street, a garden path, a cat, a bicycle), consider Sunny Stroll Pop; otherwise decide from the remaining social/emotional/subject cues instead.
- Sunny Stroll Pop is the correct fallback for bright, everyday, outdoor stroll scenes that are not beach, not cafe, not road-trip, not fashion, not romance, and not night — it is not limited to flowers; a sunny alley with plants, a cat, a bicycle, or a cute local street can qualify just as well as a garden or a flower bed.
- A sunny Japanese street is not automatically City Pop / Retro Drive, J-Rock Highway Rush, Summer Beach Pop, or Cozy Cafe Mellow.
- An ocean-view hotel window or indoor scenic view: Summer Beach Pop only if the water/open-air/vacation feeling dominates. If it feels glossy, modern, stylish, or hotel/luxury/editorial rather than beachy, consider Trendy Pop Chic instead. If it feels quiet, still, and intimate indoors, consider a calmer lane only if that lane's own definition genuinely fits (e.g. Cozy Cafe Mellow only with real cafe/bakery/table cues — not just a calm window view). Do not default to Indie Road Movie here — only consider it if the image clearly implies transit, departure, journey, or road-trip emotion, not merely a calm scenic view.
- A beach fashion selfie: Trendy Pop Chic can beat Summer Beach Pop if fashion/editorial styling dominates over the beach setting.
- A golden-hour road: City Pop / Retro Drive if retro urban drive dominates, Indie Road Movie if travel/departure dominates, American Alternative Drive if a casual friends road trip dominates.

**Conflict resolver (quick reference for the most commonly confused lane pairs):**
- Modern Jazz Groove vs Cozy Cafe Mellow vs K-Indie Rainy Room vs Lo-fi Bedroom Solitude: a rainy late-night cafe/window is Modern Jazz Groove ONLY if jazz/lounge/sax/Rhodes/rhythmic/adult-sophisticated cues are visible; otherwise prefer K-Indie Rainy Room (rain + ordinary room + diary feeling), Cozy Cafe Mellow (plain warm daytime cafe comfort), or Lo-fi Bedroom Solitude (private desk/bedroom stillness) depending on context.
- J-Rock Highway Rush vs American Alternative Drive vs Indie Road Movie: speed/adrenaline/guitar rush → J-Rock Highway Rush; casual sunny friends road trip → American Alternative Drive; solo wistful departure/travel → Indie Road Movie.
- K-R&B Night Drive vs Hip-Hop Night Drive vs Dark Heavy Hip-Hop: static/solo/soft neon/window-reflection/parked/lonely → K-R&B Night Drive; moving car/cruise/downtown lights/confident posture/streetwear/motion → Hip-Hop Night Drive; aggressive/tense/menacing → Dark Heavy Hip-Hop.
- K-Indie Rainy Room vs Lo-fi Bedroom Solitude vs Dream Pop / Shoegaze Fog: rain + ordinary room + diary feeling → K-Indie Rainy Room; private desk/bedroom stillness → Lo-fi Bedroom Solitude; hazy fog/blur/dreamscape → Dream Pop / Shoegaze Fog.
- City Pop / Retro Drive vs Summer Beach Pop vs Trendy Pop Chic vs Indie Road Movie: retro sunset city glow → City Pop / Retro Drive; bright open sky/vacation → Summer Beach Pop, but only when an actual water/beach/ocean/pool/harbor/open-air-leisure cue is visible (sunlight or a clear sky alone is never enough — a plain sunny street with no such cue belongs to another lane on its own merits); modern glossy fashion/editorial → Trendy Pop Chic; travel/departure narrative → Indie Road Movie.
- Neon Electronic Night vs Funk / Disco Night: cool synthetic neon/futuristic → Neon Electronic Night; warm colorful dancefloor/groove → Funk / Disco Night.
- Home selfie routing (Trendy Pop Chic vs Highteen Pop Room vs Lo-fi Bedroom Solitude vs Cozy Cafe Mellow): a home/mirror selfie with polished styling, makeup, or editorial/fashion confidence → Trendy Pop Chic (indoors/at-home does not disqualify it); casual/youthful/poster/friends/school/cute energy → Highteen Pop Room; quiet/private/alone/low-energy → Lo-fi Bedroom Solitude. Do not default a plain home selfie to Cozy Cafe Mellow — that lane requires an actual visible cafe/bakery/coffee/public-table cue, not just warm daylight.
- Modern Romance Pop vs K-R&B Night Drive: couple/romantic warmth → Modern Romance Pop; solo nocturnal sensuality → K-R&B Night Drive.
- Classic Soul / Old Film vs City Pop / Retro Drive: old-film analog/soulful nostalgia → Classic Soul / Old Film; 80s glossy synth/sunset city drive → City Pop / Retro Drive.
- Sunny Stroll Pop vs Dream Pop / Shoegaze Fog: bright, clear, colorful, sharp, fresh, cute, everyday, outdoor, stroll-like scene with no haze/fog/washed-out melancholy → Sunny Stroll Pop; hazy, foggy, misty, blurred, gray, low-contrast, rainy, dim, distant, or melancholic → Dream Pop / Shoegaze Fog.
- Sunny Stroll Pop vs Summer Beach Pop: sunny outdoor everyday scenery (garden, alley, park, plants) with water/beach/pool/surf/harbor absent → Sunny Stroll Pop; ocean/beach/pool/surf/harbor/vacation-water dominates → Summer Beach Pop.
- Sunny Stroll Pop vs Cozy Cafe Mellow: outdoor plants/flower pots/alley/park/garden with no cafe cues → Sunny Stroll Pop; cafe/table/coffee/bakery/interior comfort visible and central → Cozy Cafe Mellow.
- Sunny Stroll Pop vs Trendy Pop Chic: plants, daylight, local street details, cats, bicycles, flowers, or everyday outdoor scenery with no fashion/styling focus → Sunny Stroll Pop; fashion/editorial/glossy styling/city-chic subject dominates → Trendy Pop Chic.
- Sunny Stroll Pop vs Highteen Pop Room: outdoor daytime alley/park/garden/plants/stroll → Sunny Stroll Pop; bedroom, teen room, selfie, friends, bed, posters, mirror, or interior youth scene → Highteen Pop Room.
- Sunny Stroll Pop vs Modern Romance Pop: everyday daylight scenery with romance absent or not central → Sunny Stroll Pop; couple/date/romantic intimacy is the main subject → Modern Romance Pop.
- Sunny Stroll Pop vs Indie Road Movie / American Alternative Drive: static or lightly strolling everyday outdoor scenery with no journey/transit/road story → Sunny Stroll Pop; road, vehicle, train, airport, departure, movement, highway, travel narrative, or wide nostalgic road energy is central → Indie Road Movie or American Alternative Drive.

**Lane catalogue:**

${CURATION_LANES_PROMPT}`;

const PROMPT_PLAYLIST_GENERATION = `## STEP 5: PLAYLIST CURATION RULES (within the selected lane)

**Era:** 1980s to present only. Prefer well-known, recognizable tracks.

**Seasonal & sensory matching (within the lane):** Use the season/mood/sensory signals from STEP 2 to decide which tracks *inside* the selected lane fit best — this shapes which songs you pick, not which genres you use. NEVER let an obvious seasonal mismatch slip in (e.g. a winter image must not have summer-sounding tracks), but never let season override the selected lane's allowed genres either.

**Artist rule:** Maximum 1 song per artist. Avoid repeating the same artist.

**Playlist ordering:**
- Tracks 1-3: Establish the mood
- Tracks 4-7: Peak mood, most representative songs
- Tracks 8-10: Gentle landing, wind down

**Playlist flow:** All 8-10 songs must belong to the selected curation lane and feel cohesive like a DJ set curated by someone who deeply knows that genre world. No jumps into unrelated lanes.

**Avoid generic global pop hits** unless they are genuinely a perfect fit for the selected lane. Do not overuse safe Western indie pop. Do not make the playlist eclectic unless the selected lane itself is inherently eclectic (e.g. City Pop / Retro Drive). The result should feel curated, not randomly diverse.

**Track findability (mandatory — this is the #1 cause of playlist generation failure):**
- Every recommended track must be a real, released song. Do not invent track titles. Do not invent artist names. Do not output imaginary collaborations.
- Prefer songs that are available on YouTube in some form: official audio, official music video, an artist/label "Topic" channel upload, or a well-known live version.
- Avoid ultra-obscure, unreleased, private, or hard-to-find tracks that are unlikely to appear in a YouTube search.
- For niche lanes, choose accessible gateway tracks within that lane — well-known entry points into that genre world — not impossible-to-find deep cuts.
- If you are not confident a track actually exists and is findable, choose a different, more findable track within the same lane instead.
- Artist and title must be spelled exactly and specifically enough for a YouTube search to find the right video.
- Do not output a vague genre description (e.g. "chill jazz instrumental") as a track's title/artist.
- Do not output a playlist or compilation name as if it were a single track.`;

const PROMPT_PLAYLIST_CONCEPT = `## STEP 5.5: PLAYLIST CONCEPT (TITLE, NOT A SENTENCE, NOT A WORD-MASH)
Generate "playlist_concept" as a natural, evocative **playlist title** — like a movie poster title, a Spotify playlist name, or a mixtape title someone would actually use. It is NEVER a descriptive sentence, and NEVER three keywords mechanically stapled together.

The title must match the selected curation lane's world from STEP 4 — use that lane's reference vibes and title style examples as tone guidance, not as titles to copy verbatim.

Rules:
- 2-5 words recommended. 6 words is the ABSOLUTE MAXIMUM — never exceed it.
- NO full sentences. NO explanatory or descriptive phrasing.
- BANNED openings/patterns: "A journey through...", "A playlist for...", "Capturing...", "This playlist...", "An exploration of...".
- BANNED structure: do NOT mechanically stack "{Mood adjective} + {Place/Object noun} + {Genre}" (e.g. "Nostalgic Station Indie", "Peaceful Spring Pop", "Romantic Train Indie"). These read like three tags glued together, not a real title — avoid this even if it technically fits the word-count rule.
- BANNED structure: do NOT stack "{Landmark/Place} + {Genre} + Vibes" (e.g. "Tower Park Rock Vibes", "Tokyo Park Rock Vibes", "City Pop Vibes"). Never end a title with the word "Vibes".
- BANNED structure: do NOT stack "{Mood/Place} + {Genre}" as a two-word tag pair (e.g. "Romantic Park Pop", "Sunny Park Rock").
- NEVER use generic title words like "Vibes", "Mood", "Playlist", or "Mix" — these are almost always a sign the title is tag-glued, not written. "[Scene/Place] + Vibes" (e.g. "Ocean View Vibes", "Beach Vibes", "City Night Mood") is always wrong.
- Do not force the selected lane's genre into the title. Genre is OPTIONAL — only include it if it sounds natural, not as a default word slotted in to prove the lane was chosen.
- Do not use a landmark name literally (e.g. "Tower", "Tokyo Tower") unless the resulting phrase reads like something a person would genuinely title a playlist — not just the landmark name plus a mood/genre word appended.
- Instead, let a place, object, light, time of day, or feeling combine into a phrase someone would actually title a playlist with. The title should feel like a real album, mixtape, or curated playlist title — not a label describing the image.
- Read it back to yourself: if it sounds like tags glued together, rewrite it.
- Always written in English, regardless of the image's cultural context or language, in natural title case.

GOOD examples (match this style):
- "Train Window Indie"
- "Platform Daydreams"
- "Romantic Rails"
- "Sunlit Station Sounds"
- "Indie on the Platform"
- "Golden Hour Mixtape"
- "Soft City Radio"
- "Rainy Seoul Afterglow"
- "Midnight Walk Songs"
- "Café Window Jazz"
- "Sunlit City Groove"
- "Tower in the Sun"
- "Golden Park Radio"
- "Afternoon Afterglow"
- "Soft City Sunday"
- "Parkside Daydreams"
- "Tokyo Sun Rewind"
- "Open Water Afternoon"
- "Blue Glass Coast"
- "Clouds Over the Harbor"
- "Harbor Under Blue Skies"
- "Low Lights on Seoul"
- "Rain at the Window"

BAD examples — mechanical mood+place+genre stacking or [scene]+Vibes (never produce this style):
- "Nostalgic Station Indie"
- "Peaceful Spring Pop"
- "Romantic Train Indie"
- "Tower Park Rock Vibes"
- "Tokyo Park Rock Vibes"
- "City Pop Vibes"
- "Romantic Park Pop"
- "Sunny Park Rock"
- "Ocean View Vibes"
- "Beach Vibes"
- "City Night Mood"
- "Window Mix"

BAD examples — full sentences (never produce this style):
- "A journey through nostalgic and romantic indie pop melodies, capturing the peaceful essence of an indoor afternoon station in spring."
- "A playlist for a quiet, introspective evening by the window."`;

const PROMPT_PLAYLIST_SUBTITLE = `## STEP 5.6: PLAYLIST SUBTITLE (CURATION COPY, NOT AN EXPLANATION)

Generate "playlist_subtitle" as one short English line that reads like editorial playlist curation copy — the kind of line you'd see under an album title or a Spotify playlist description.

CRITICAL — genre label timing: The final track list is selected from a curated catalog AFTER this subtitle is written. You cannot know the exact genres of the final tracks. Do NOT claim a narrow genre (e.g. "indie pop", "city-pop", "alt-rock") unless the selected lane is entirely defined by that genre. When in doubt, use a sonic world descriptor (e.g. "bright guitars", "breezy pop", "soft rhythms") instead of a genre label.

Preferred broader descriptors for open-air / coastal / outdoor scenes (use instead of narrow genre claims):
- Instead of "indie pop" → "breezy pop", "sunlit pop", "open-sky melodies"
- Instead of "city-pop" → "warm city sound", "sun-glazed grooves", "bright urban pop"
- Instead of "surf rock" → "bright guitars", "open-water guitars"
- Instead of "dream-pop" → "hazy sound", "drifting melodies", "cloud-soft sound"

Rules:
- One short English line.
- 7-16 words recommended.
- Natural sentence case.
- No final period unless it feels absolutely natural.
- Must sound premium, emotional, and playlist-like.
- Should evoke the image mood and the lane's sonic world — without naming the lane.
- Use a sonic world descriptor instead of a narrow genre label unless you are certain.
- It should feel like a line under an album title, Spotify playlist description, or editorial music curation copy.
- It is NOT an explanation of the AI decision.
- Do NOT mention AI, analysis, image detection, mood tags, or lane selection.
- Do NOT write "This playlist was selected because..."
- Do NOT write "The AI chose..."
- Do NOT write "Matched for..."
- Avoid mechanical mood + place + genre stacking.
- Avoid generic wording.

Good examples:
- "Breezy pop for sunlit ocean views and open skies"
- "Warm city sound for bright afternoons and soft city memories"
- "Slow, drifting melodies for rain-lit rooms and quiet evening thoughts"
- "Neon R&B for midnight windows and low city lights"
- "Hazy, cloud-soft sound for foggy streets and half-remembered feelings"
- "Dusty soul for old-film light and slow romantic moments"
- "Bright guitars for highway light and restless summer energy"
- "Sun-glazed grooves for open water and wide blue afternoons"

Bad examples:
- "Indie pop for breezy afternoons and open-water dreams" ← narrow genre claim for a broad coastal lane
- "This playlist was selected because the image looks romantic"
- "The AI chose this lane based on your photo"
- "Matched for romantic joyful peaceful city pop"
- "A playlist for nostalgic and peaceful spring moments"
- "Romantic City Pop Mood"`;

const PROMPT_OUTPUT_CONTRACT = `## STEP 6: OUTPUT FORMAT
Return ONLY valid JSON. No explanation, no markdown, no extra text.

{
  "image_type": "SCENE" or "PERSON" or "MIXED",
  "confidence": 0.0-1.0,
  "analysis": {
    "location": "",
    "time_of_day": "",
    "season": "",
    "mood_keywords": [],
    "sensory_impressions": [],
    "cultural_context": ""
  },
  "music_profile": {
    "energy_score": 0,
    "tempo": "",
    "valence": "",
    "primaryGenres": [],
    "subgenres": []
  },
  "targetStats": {
    "brightness": 0, "warmth": 0, "openness": 0, "motion": 0, "intimacy": 0,
    "socialEnergy": 0, "tension": 0, "nostalgia": 0, "playfulness": 0, "dreaminess": 0,
    "energy": 0, "groove": 0, "density": 0, "acousticness": 0, "electronicness": 0,
    "vocalPresence": 0, "climaxIntensity": 0
  },
  "contextAffinity": {
    "spring": 0, "summer": 0, "autumn": 0, "winter": 0,
    "morning": 0, "day": 0, "dusk": 0, "night": 0, "lateNight": 0,
    "clear": 0, "cloudy": 0, "rain": 0, "snow": 0
  },
  "playlist": [
    {
      "rank": 1,
      "title": "",
      "artist": "",
      "reason": ""
    }
  ],
  "playlist_concept": "Natural evocative playlist title, 2-5 words (6 words max), e.g. 'Platform Daydreams' — NEVER mood+place+genre word-stacking, NEVER a sentence",
  "playlist_subtitle": "Short premium playlist subtitle, 7-16 words, e.g. 'Breezy pop for sunlit ocean views and open skies' — NEVER an AI explanation, NEVER a narrow genre claim, NEVER a mood-tag list",
  "primary_lane_id": "the exact lane_id you selected in STEP 4 — must match one of the lane_id values in the catalogue exactly"
}

Every targetStats field (17) and every contextAffinity field (13) above is required on every response, per STEP 3.6 — all values must be integers from 0 to 100. Do not omit any of them, and do not substitute a placeholder value like 0 or 50 for a field you didn't actually evaluate.

\`music_profile.primaryGenres\` (1-3 values) and \`music_profile.subgenres\` (2-6 values) are required on every response, per STEP 3-B — every value must be an exact canonical id from that taxonomy, with no duplicates, and every subgenre must belong to at least one of the chosen primaryGenres.

For PERSON type, replace analysis with:
{
  "style_vibe": "",
  "energy": "",
  "color_tone": ""
}

For MIXED type, include both analysis and person fields.`;

function buildSystemPrompt(modules: string[]): string {
  return modules.join("\n\n---\n\n");
}

const SYSTEM_PROMPT = buildSystemPrompt([
  PROMPT_IMAGE_CLASSIFICATION,
  PROMPT_SCENE_ANALYSIS,
  PROMPT_MUSIC_PROFILE,
  PROMPT_GENRE_RULES,
  PROMPT_VISUAL_PROFILE,
  PROMPT_TARGET_STATS,
  PROMPT_LANE_DECISION,
  PROMPT_PLAYLIST_GENERATION,
  PROMPT_PLAYLIST_CONCEPT,
  PROMPT_PLAYLIST_SUBTITLE,
  PROMPT_OUTPUT_CONTRACT,
]);

export type GptPlaylistItem = {
  rank: number;
  title: string;
  artist: string;
  reason: string;
};

export type GptAnalysisScene = {
  location: string;
  time_of_day: string;
  season: string;
  mood_keywords: string[];
  sensory_impressions: string[];
  cultural_context: string;
};

export type GptAnalysisPerson = {
  style_vibe: string;
  energy: string;
  color_tone: string;
};

// Step 4-A: 프로덕션 카탈로그의 17 TrackStats와 정확히 동일한 필드명/개수.
// 이름을 바꾸면 향후 스코어링 코드에서 musicCatalog.ts의 TrackStats와 맞춰볼 수 없으므로
// 여기 필드명은 supabase/functions/_shared/musicCatalog.ts의 TrackStats와 반드시 1:1로 일치해야 한다.
export type TargetStats = {
  brightness: number;
  warmth: number;
  openness: number;
  motion: number;
  intimacy: number;
  socialEnergy: number;
  tension: number;
  nostalgia: number;
  playfulness: number;
  dreaminess: number;
  energy: number;
  groove: number;
  density: number;
  acousticness: number;
  electronicness: number;
  vocalPresence: number;
  climaxIntensity: number;
};

// Step 4-A: 프로덕션 카탈로그의 13 TrackAffinity와 정확히 동일한 필드명/개수.
export type ContextAffinity = {
  spring: number;
  summer: number;
  autumn: number;
  winter: number;
  morning: number;
  day: number;
  dusk: number;
  night: number;
  lateNight: number;
  clear: number;
  cloudy: number;
  rain: number;
  snow: number;
};

// 명시적 필드 목록 — "존재하는 키만 검사"가 아니라 "이 목록에 있는 키가 전부 있는지"를 검사하기 위함.
// 순서/개수가 musicCatalog.ts의 TrackStats/TrackAffinity와 어긋나면 안 됨.
export const TARGET_STATS_FIELDS = [
  "brightness", "warmth", "openness", "motion", "intimacy", "socialEnergy",
  "tension", "nostalgia", "playfulness", "dreaminess",
  "energy", "groove", "density", "acousticness", "electronicness",
  "vocalPresence", "climaxIntensity",
] as const;

export const CONTEXT_AFFINITY_FIELDS = [
  "spring", "summer", "autumn", "winter",
  "morning", "day", "dusk", "night", "lateNight",
  "clear", "cloudy", "rain", "snow",
] as const;

export type GptResponse = {
  image_type: "SCENE" | "PERSON" | "MIXED";
  confidence: number;
  analysis: GptAnalysisScene & Partial<GptAnalysisPerson>;
  music_profile: {
    energy_score: number;
    tempo: string;
    valence: string;
    // Step 6 genre-first catalog filter: canonical taxonomy ids only (musicGenreTaxonomy.ts),
    // never free text. Replaces the former primary_genre/secondary_genre string fields.
    primaryGenres: PrimaryGenre[];
    subgenres: Subgenre[];
  };
  targetStats: TargetStats;
  contextAffinity: ContextAffinity;
  playlist: GptPlaylistItem[];
  playlist_concept: string;
  playlist_subtitle: string;
  // Step 6 genre-first 아키텍처에서 lane은 더 이상 catalog eligibility/scoring/candidate
  // selection/sequencing에 쓰이지 않는다 — 호환/DB 저장/분석(usage tracking) 용도로만 남아있다.
  // 그래서 유효하지 않은 lane 하나 때문에 targetStats/contextAffinity/primaryGenres/subgenres가
  // 멀쩡한 응답 전체를 실패시키지 않는다: 무효/누락 시 null로 저장한다 (아래
  // applyCompatibilityValidation 참고). playlists.primary_lane_id/primary_lane_name 컬럼은
  // 이미 nullable이다(기존 row도 전부 null이었음, 20260625120000 마이그레이션 참고).
  primary_lane_id: string | null;
};

// CURATION_LANES에 정의된 lane id만 허용 — GPT가 존재하지 않는 lane id를 만들어내는 것을 방지
const VALID_LANE_IDS = new Set(CURATION_LANES.map((lane) => lane.id));

// playlist_subtitle이 없거나 너무 짧을 때 사용하는 기본 문구 — AI/분석/lane 언급 없이 프리미엄한 톤 유지
const FALLBACK_PLAYLIST_SUBTITLE = "Breezy songs for quiet moments and cinematic city light";

// ── Step 4-A: targetStats/contextAffinity 검증 및 정규화 ──────────────────────
// 0-100 정수를 살짝 벗어난 값("recoverable")만 반올림/clamp한다.
// 이 허용폭을 벗어나면 근본적으로 잘못된 값으로 보고 invalid 처리한다 — 조용히 우겨넣지 않는다.
const VECTOR_RECOVERABLE_MIN = -5;
const VECTOR_RECOVERABLE_MAX = 105;

type VectorFieldResult =
  | { status: "ok"; value: number; normalized: boolean }
  | { status: "invalid"; reason: string };

// 문자열 숫자("80" 등)는 명시적으로 reject한다(안전하게 변환하지 않음) — "80"과 "eighty" 같은
// 모호한 입력을 조용히 허용하는 대신, 항상 실제 number 타입만 허용해 정책을 명확하게 유지한다.
function normalizeVectorField(raw: unknown, field: string): VectorFieldResult {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return { status: "invalid", reason: `${field}: not a finite number (got ${typeof raw})` };
  }
  if (raw < VECTOR_RECOVERABLE_MIN || raw > VECTOR_RECOVERABLE_MAX) {
    return { status: "invalid", reason: `${field}: out of recoverable range (${raw})` };
  }

  const rounded = Math.round(raw);
  const clamped = Math.min(100, Math.max(0, rounded));
  return { status: "ok", value: clamped, normalized: clamped !== raw };
}

type VectorObjectResult<T> =
  | { status: "ok"; value: T; normalized: boolean }
  | { status: "invalid"; missing: string[]; invalid: string[] };

// raw가 object가 아니면 모든 필드를 missing으로 보고한다 — "typeof obj === 'object'"만 확인하고
// 넘어가지 않고, 요구되는 키 목록(fields) 각각을 명시적으로 확인한다.
// fields에 없는 예상 밖의 추가 키는 무시되며 파싱을 깨뜨리지 않는다.
export function validateVectorObject<K extends string>(
  raw: unknown,
  fields: readonly K[],
): VectorObjectResult<Record<K, number>> {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { status: "invalid", missing: [...fields], invalid: [] };
  }

  const source = raw as Record<string, unknown>;
  const value = {} as Record<K, number>;
  const missing: string[] = [];
  const invalid: string[] = [];
  let normalized = false;

  for (const field of fields) {
    if (!(field in source)) {
      missing.push(field);
      continue;
    }

    const fieldResult = normalizeVectorField(source[field], field);
    if (fieldResult.status === "invalid") {
      invalid.push(fieldResult.reason);
      continue;
    }

    value[field] = fieldResult.value;
    if (fieldResult.normalized) normalized = true;
  }

  if (missing.length > 0 || invalid.length > 0) {
    return { status: "invalid", missing, invalid };
  }

  return { status: "ok", value, normalized };
}

type VectorValidationOutcome =
  | { ok: true; targetStats: TargetStats; contextAffinity: ContextAffinity; normalized: boolean }
  | { ok: false; issues: string[] };

function validateVectors(parsed: Record<string, unknown>): VectorValidationOutcome {
  const statsResult = validateVectorObject(parsed.targetStats, TARGET_STATS_FIELDS);
  const affinityResult = validateVectorObject(parsed.contextAffinity, CONTEXT_AFFINITY_FIELDS);

  const issues: string[] = [];
  if (statsResult.status === "invalid") {
    issues.push(...statsResult.missing.map((f) => `targetStats.${f} missing`));
    issues.push(...statsResult.invalid.map((r) => `targetStats.${r}`));
  }
  if (affinityResult.status === "invalid") {
    issues.push(...affinityResult.missing.map((f) => `contextAffinity.${f} missing`));
    issues.push(...affinityResult.invalid.map((r) => `contextAffinity.${r}`));
  }

  if (statsResult.status === "invalid" || affinityResult.status === "invalid") {
    return { ok: false, issues };
  }

  return {
    ok: true,
    targetStats: statsResult.value as TargetStats,
    contextAffinity: affinityResult.value as ContextAffinity,
    normalized: statsResult.normalized || affinityResult.normalized,
  };
}

// ── Step 6 genre-first catalog filter: music_profile.primaryGenres/subgenres 검증 ──────────
// musicGenreTaxonomy.ts를 유일한 source of truth로 사용 — 여기서 별도 장르 목록을 다시 만들지 않는다.
const PRIMARY_GENRE_ID_SET: ReadonlySet<string> = new Set(PRIMARY_GENRE_IDS);
const SUBGENRE_ID_SET: ReadonlySet<string> = new Set(SUBGENRE_IDS);

const MIN_PRIMARY_GENRES = 1;
const MAX_PRIMARY_GENRES = 3;
const MIN_SUBGENRES = 2;
const MAX_SUBGENRES = 6;

type GenreValidationOutcome =
  | { ok: true; primaryGenres: PrimaryGenre[]; subgenres: Subgenre[] }
  | { ok: false; issues: string[] };

// raw가 string[]이 아니면 전체를 invalid로 보고한다 — 부분적으로 살려서 조용히 채우지 않는다.
export function validateGenreSelection(parsed: Record<string, unknown>): GenreValidationOutcome {
  const musicProfile = parsed.music_profile;
  const issues: string[] = [];

  if (musicProfile === null || typeof musicProfile !== "object" || Array.isArray(musicProfile)) {
    return { ok: false, issues: ["music_profile: missing or not an object"] };
  }

  const rawPrimary = (musicProfile as Record<string, unknown>).primaryGenres;
  const rawSubgenres = (musicProfile as Record<string, unknown>).subgenres;

  let primaryGenres: PrimaryGenre[] = [];
  if (!Array.isArray(rawPrimary)) {
    issues.push("music_profile.primaryGenres: missing or not an array");
  } else if (rawPrimary.length === 0) {
    issues.push("music_profile.primaryGenres: must not be empty");
  } else if (!rawPrimary.every((v) => typeof v === "string")) {
    issues.push("music_profile.primaryGenres: all values must be strings");
  } else {
    const values = rawPrimary as string[];
    const unique = new Set(values);
    if (unique.size !== values.length) {
      issues.push("music_profile.primaryGenres: contains duplicate values");
    }
    const unknown = values.filter((v) => !PRIMARY_GENRE_ID_SET.has(v));
    if (unknown.length > 0) {
      issues.push(`music_profile.primaryGenres: unknown taxonomy id(s) ${unknown.join(", ")}`);
    }
    if (values.length > MAX_PRIMARY_GENRES) {
      issues.push(
        `music_profile.primaryGenres: too many values (${values.length}), max ${MAX_PRIMARY_GENRES}`,
      );
    }
    if (unknown.length === 0 && unique.size === values.length && values.length <= MAX_PRIMARY_GENRES) {
      primaryGenres = values as PrimaryGenre[];
    }
  }

  let subgenres: Subgenre[] = [];
  if (!Array.isArray(rawSubgenres)) {
    issues.push("music_profile.subgenres: missing or not an array");
  } else if (rawSubgenres.length === 0) {
    issues.push("music_profile.subgenres: must not be empty");
  } else if (!rawSubgenres.every((v) => typeof v === "string")) {
    issues.push("music_profile.subgenres: all values must be strings");
  } else {
    const values = rawSubgenres as string[];
    const unique = new Set(values);
    if (unique.size !== values.length) {
      issues.push("music_profile.subgenres: contains duplicate values");
    }
    const unknown = values.filter((v) => !SUBGENRE_ID_SET.has(v));
    if (unknown.length > 0) {
      issues.push(`music_profile.subgenres: unknown taxonomy id(s) ${unknown.join(", ")}`);
    }
    if (values.length < MIN_SUBGENRES) {
      issues.push(`music_profile.subgenres: too few values (${values.length}), min ${MIN_SUBGENRES}`);
    }
    if (values.length > MAX_SUBGENRES) {
      issues.push(`music_profile.subgenres: too many values (${values.length}), max ${MAX_SUBGENRES}`);
    }
    if (
      unknown.length === 0 && unique.size === values.length &&
      values.length >= MIN_SUBGENRES && values.length <= MAX_SUBGENRES
    ) {
      subgenres = values as Subgenre[];
    }
  }

  // subgenre <-> primaryGenre 호환성 검사 — 두 배열이 각각 유효할 때만 의미가 있다.
  if (primaryGenres.length > 0 && subgenres.length > 0) {
    const incompatible = subgenres.filter(
      (sg) => !primaryGenres.some((pg) => SUBGENRES_BY_PRIMARY[pg].includes(sg)),
    );
    if (incompatible.length > 0) {
      issues.push(
        `music_profile.subgenres: incompatible with all selected primaryGenres: ${incompatible.join(", ")}`,
      );
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return { ok: true, primaryGenres, subgenres };
}

type GenreSelectionWithCoverageOutcome =
  | { ok: true; primaryGenres: PrimaryGenre[]; subgenres: Subgenre[]; eligibleCount: number }
  | { ok: false; issues: string[] };

// validateGenreSelection(shape/taxonomy 검증) 위에 Step 6 커버리지 적정성 검사를 얹는다. 응답이
// 스코어링 단계에 도달하기 전에 "이 장르 선택이 실제로 FINAL_TRACK_COUNT곡을 채울 만큼 카탈로그에
// 충분한 트랙이 있는가"를 확인한다. filterEligibleByGenre/scoring.ts의 규칙을 그대로 재사용하고,
// 커버리지 부족을 스코어링 단계까지 내려보내지 않는다 — genre-unfiltered fallback으로 우회하지도,
// 조용히 unrelated genre를 추가하지도 않는다: 부족하면 명시적으로 invalid 처리해서 기존 1회 재시도로
// 넘긴다.
export function validateGenreSelectionWithCoverage(
  parsed: Record<string, unknown>,
): GenreSelectionWithCoverageOutcome {
  const shapeResult = validateGenreSelection(parsed);
  if (!shapeResult.ok) return shapeResult;

  const coverage = checkGenreSelectionCoverage(
    VERIFIED_CATALOG_POOL,
    shapeResult.primaryGenres,
    shapeResult.subgenres,
  );
  if (!coverage.meetsMinimum) {
    return {
      ok: false,
      issues: [
        `music_profile.primaryGenres/subgenres (${shapeResult.primaryGenres.join(", ")} / ${
          shapeResult.subgenres.join(", ")
        }) match only ${coverage.eligibleCount} catalog track(s), fewer than the required ${FINAL_TRACK_COUNT}. ` +
          `Choose a broader but still image-appropriate canonical genre set — add a second compatible primary ` +
          `genre and/or additional compatible subgenres from the taxonomy below. Do not add unrelated genres ` +
          `merely to reach the count.`,
      ],
    };
  }

  return {
    ok: true,
    primaryGenres: shapeResult.primaryGenres,
    subgenres: shapeResult.subgenres,
    eligibleCount: coverage.eligibleCount,
  };
}

// 검증 실패 시 딱 1회만 보내는 교정 요청 문구 — 벡터/장르 문제를 하나의 재요청으로 합친다
// (재시도 인프라를 두 번 만들지 않는다). 실패한 필드 이름과 유효한 canonical id 목록만 알려주고
// 전체 JSON을 다시 요청한다.
export function buildCorrectionPrompt(vectorIssues: string[], genreIssues: string[]): string {
  const parts: string[] = [];

  if (vectorIssues.length > 0) {
    parts.push(
      `The required "targetStats" and/or "contextAffinity" objects had a problem: ${
        vectorIssues.join("; ")
      }. Make sure every targetStats field (${TARGET_STATS_FIELDS.join(", ")}) and every ` +
        `contextAffinity field (${CONTEXT_AFFINITY_FIELDS.join(", ")}) is present as an integer from 0 to 100 inclusive.`,
    );
  }

  if (genreIssues.length > 0) {
    parts.push(
      `The required "music_profile.primaryGenres" and/or "music_profile.subgenres" arrays had a problem: ${
        genreIssues.join("; ")
      }. primaryGenres must contain ${MIN_PRIMARY_GENRES}-${MAX_PRIMARY_GENRES} unique values chosen ONLY from ` +
        `this exact list: [${PRIMARY_GENRE_IDS.join(", ")}]. subgenres must contain ${MIN_SUBGENRES}-${MAX_SUBGENRES} ` +
        `unique values chosen ONLY from this exact list: [${SUBGENRE_IDS.join(", ")}], and every subgenre must belong ` +
        `to at least one of your chosen primaryGenres.`,
    );
  }

  return (
    `Your previous JSON response had a problem with required fields: ${parts.join(" ")} ` +
    `Resend the COMPLETE JSON response again, in the exact same schema as before, with all of these fields corrected.`
  );
}

type ChatMessage = { role: string; content: string | Array<Record<string, unknown>> };

// OpenAI Structured Outputs 스키마 — GptResponse 계약의 exact mirror.
// strict=true: 구조 위반 응답 자체가 생성되지 않는다.
// 의미 검증(primaryGenres taxonomy, subgenre ↔ primaryGenre 호환성, catalog 커버리지)은
// validateGenreSelection/validateGenreSelectionWithCoverage가 여전히 담당한다.
const GPT_RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "vibe_playlist_analysis",
    strict: true,
    schema: {
      type: "object",
      properties: {
        image_type: { type: "string", enum: ["SCENE", "PERSON", "MIXED"] },
        confidence: { type: "number" },
        // analysis 필드: SCENE/PERSON/MIXED 분기에 따라 일부 필드가 null이 될 수 있다.
        // strict 모드에서는 모든 declared 필드가 required이므로, 해당 image_type에서
        // 사용하지 않는 필드는 null로 출력된다. 하위 코드(db.ts)는 이미 ?? "" / ?? [] 로 처리.
        analysis: {
          type: "object",
          properties: {
            location: { anyOf: [{ type: "string" }, { type: "null" }] },
            time_of_day: { anyOf: [{ type: "string" }, { type: "null" }] },
            season: { anyOf: [{ type: "string" }, { type: "null" }] },
            mood_keywords: { anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }] },
            sensory_impressions: { anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }] },
            cultural_context: { anyOf: [{ type: "string" }, { type: "null" }] },
            style_vibe: { anyOf: [{ type: "string" }, { type: "null" }] },
            energy: { anyOf: [{ type: "string" }, { type: "null" }] },
            color_tone: { anyOf: [{ type: "string" }, { type: "null" }] },
          },
          required: [
            "location", "time_of_day", "season", "mood_keywords",
            "sensory_impressions", "cultural_context",
            "style_vibe", "energy", "color_tone",
          ],
          additionalProperties: false,
        },
        music_profile: {
          type: "object",
          properties: {
            energy_score: { type: "number" },
            tempo: { type: "string" },
            valence: { type: "string" },
            primaryGenres: { type: "array", items: { type: "string" } },
            subgenres: { type: "array", items: { type: "string" } },
          },
          required: ["energy_score", "tempo", "valence", "primaryGenres", "subgenres"],
          additionalProperties: false,
        },
        targetStats: {
          type: "object",
          properties: {
            brightness: { type: "integer" },
            warmth: { type: "integer" },
            openness: { type: "integer" },
            motion: { type: "integer" },
            intimacy: { type: "integer" },
            socialEnergy: { type: "integer" },
            tension: { type: "integer" },
            nostalgia: { type: "integer" },
            playfulness: { type: "integer" },
            dreaminess: { type: "integer" },
            energy: { type: "integer" },
            groove: { type: "integer" },
            density: { type: "integer" },
            acousticness: { type: "integer" },
            electronicness: { type: "integer" },
            vocalPresence: { type: "integer" },
            climaxIntensity: { type: "integer" },
          },
          required: [
            "brightness", "warmth", "openness", "motion", "intimacy", "socialEnergy",
            "tension", "nostalgia", "playfulness", "dreaminess",
            "energy", "groove", "density", "acousticness", "electronicness",
            "vocalPresence", "climaxIntensity",
          ],
          additionalProperties: false,
        },
        contextAffinity: {
          type: "object",
          properties: {
            spring: { type: "integer" },
            summer: { type: "integer" },
            autumn: { type: "integer" },
            winter: { type: "integer" },
            morning: { type: "integer" },
            day: { type: "integer" },
            dusk: { type: "integer" },
            night: { type: "integer" },
            lateNight: { type: "integer" },
            clear: { type: "integer" },
            cloudy: { type: "integer" },
            rain: { type: "integer" },
            snow: { type: "integer" },
          },
          required: [
            "spring", "summer", "autumn", "winter",
            "morning", "day", "dusk", "night", "lateNight",
            "clear", "cloudy", "rain", "snow",
          ],
          additionalProperties: false,
        },
        playlist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              rank: { type: "integer" },
              title: { type: "string" },
              artist: { type: "string" },
              reason: { type: "string" },
            },
            required: ["rank", "title", "artist", "reason"],
            additionalProperties: false,
          },
        },
        playlist_concept: { type: "string" },
        playlist_subtitle: { type: "string" },
        primary_lane_id: { anyOf: [{ type: "string" }, { type: "null" }] },
      },
      required: [
        "image_type",
        "confidence",
        "analysis",
        "music_profile",
        "targetStats",
        "contextAffinity",
        "playlist",
        "playlist_concept",
        "playlist_subtitle",
        "primary_lane_id",
      ],
      additionalProperties: false,
    },
  },
};

function buildBaseMessages(signedImageUrl: string): ChatMessage[] {
  return [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: signedImageUrl, detail: "auto" },
        },
        {
          type: "text",
          text: "Analyze this image and create a playlist.",
        },
      ],
    },
  ];
}

async function requestChatCompletion(apiKey: string, messages: ChatMessage[]): Promise<string> {
  let response: Response;
  try {
    response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 2000,
        response_format: GPT_RESPONSE_SCHEMA,
      }),
    });
  } catch {
    throw new SafeError("이미지 분석 중 오류가 발생했습니다.");
  }

  if (!response.ok) {
    throw new SafeError("이미지 분석 중 오류가 발생했습니다.");
  }

  let body: { choices?: Array<{ message?: { content?: string | null; refusal?: string | null } }> };
  try {
    body = await response.json();
  } catch {
    throw new SafeError("이미지 분석 결과를 받지 못했습니다.");
  }

  const message = body.choices?.[0]?.message;
  if (message?.refusal) throw new SafeError("이미지 분석 결과를 받지 못했습니다.");
  const content = message?.content;
  if (!content) throw new SafeError("이미지 분석 결과를 받지 못했습니다.");

  return content;
}

export function parseGptJson(content: string): GptResponse {
  try {
    // GPT가 마크다운 코드블록으로 감쌀 경우 제거
    const cleaned = content
      .replace(/^```json\s*/im, "")
      .replace(/^```\s*/im, "")
      .replace(/```\s*$/im, "")
      .trim();
    return JSON.parse(cleaned) as GptResponse;
  } catch {
    throw new SafeError("이미지 분석 결과를 처리하지 못했습니다.");
  }
}

// playlist_subtitle/primary_lane_id 호환 필드 검증.
export function applyCompatibilityValidation(parsed: GptResponse): void {
  // playlist_subtitle이 누락되었거나(구버전 응답 등) 형식이 이상해도 전체 분석을 실패시키지 않고
  // 프리미엄한 기본 문구로 대체 — 빈 문자열로 두면 ResultScreen에서 조용히 사라져 버리므로 항상 값이 있도록 보장한다.
  const rawSubtitle = typeof parsed.playlist_subtitle === "string" ? parsed.playlist_subtitle.trim() : "";
  parsed.playlist_subtitle = rawSubtitle.length >= 10 ? rawSubtitle : FALLBACK_PLAYLIST_SUBTITLE;

  // primary_lane_id는 genre-first 아키텍처에서 호환/DB 저장/분석 용도로만 쓰이고 catalog
  // eligibility/scoring/candidate selection/sequencing에는 전혀 관여하지 않는다 — 그래서 lane 하나가
  // 무효/누락이라고 해서 targetStats/contextAffinity/primaryGenres/subgenres가 유효한 응답 전체를
  // 실패시키지 않는다. 무효/누락/malformed면 null로 정규화만 하고(추측으로 다른 lane을 대신 고르거나
  // primaryGenre로부터 lane을 유추하지 않음), 이 필드 때문에 재요청도 하지 않는다 — 아래는 그대로
  // 진단 로그만 남긴다.
  if (typeof parsed.primary_lane_id !== "string" || !VALID_LANE_IDS.has(parsed.primary_lane_id)) {
    console.error("[gpt] invalid_primary_lane_id", { primaryLaneId: parsed.primary_lane_id });
    parsed.primary_lane_id = null;
  }
}

export async function analyzeImage(signedImageUrl: string): Promise<GptResponse> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new SafeError("이미지 분석 서비스가 설정되지 않았습니다.");

  const baseMessages = buildBaseMessages(signedImageUrl);

  const firstContent = await requestChatCompletion(apiKey, baseMessages);
  const firstParsed = parseGptJson(firstContent);
  applyCompatibilityValidation(firstParsed);

  let finalParsed = firstParsed;
  let vectors = validateVectors(firstParsed as unknown as Record<string, unknown>);
  let genre = validateGenreSelectionWithCoverage(firstParsed as unknown as Record<string, unknown>);

  if (!vectors.ok || !genre.ok) {
    // 이미지/전체 프롬프트/전체 응답은 로그에 남기지 않는다 — 실패한 필드 이름만 남긴다.
    console.error("[gpt] image_vector_or_genre_invalid_retrying", {
      vectorIssues: vectors.ok ? [] : vectors.issues,
      genreIssues: genre.ok ? [] : genre.issues,
    });

    // Step 4-A 재시도 정책 (Step 6에서 genre 검증까지 같은 재시도에 합류): targetStats/contextAffinity
    // 그리고/또는 primaryGenres/subgenres가 근본적으로 잘못된 경우에만 딱 1회 재시도한다. 두 문제를
    // 별도 재시도 라운드로 나누지 않고 하나의 교정 프롬프트로 합쳐서 보낸다 — 재시도 인프라를
    // 두 번 만들지 않는다. 기존 analyzeImage는 재시도 인프라가 전혀 없었으므로, 큐/외부 재시도
    // 서비스 등 아키텍처 변경 없이 같은 함수 안에서 OpenAI에 한 번 더 호출을 보내는 형태로
    // 국소적으로 구현했다 (index.ts 변경 없음).
    const retryMessages: ChatMessage[] = [
      ...baseMessages,
      { role: "assistant", content: firstContent },
      {
        role: "user",
        content: buildCorrectionPrompt(
          vectors.ok ? [] : vectors.issues,
          genre.ok ? [] : genre.issues,
        ),
      },
    ];

    const retryContent = await requestChatCompletion(apiKey, retryMessages);
    const retryParsed = parseGptJson(retryContent);
    applyCompatibilityValidation(retryParsed);

    const retryVectors = validateVectors(retryParsed as unknown as Record<string, unknown>);
    const retryGenre = validateGenreSelectionWithCoverage(retryParsed as unknown as Record<string, unknown>);
    if (!retryVectors.ok || !retryGenre.ok) {
      console.error("[gpt] image_vector_or_genre_invalid_after_retry", {
        vectorIssues: retryVectors.ok ? [] : retryVectors.issues,
        genreIssues: retryGenre.ok ? [] : retryGenre.issues,
      });
      throw new SafeError("이미지의 확장 사운드 분석 값을 확인하지 못했습니다. 다시 시도해 주세요.");
    }

    finalParsed = retryParsed;
    vectors = retryVectors;
    genre = retryGenre;
  }

  finalParsed.targetStats = vectors.targetStats;
  finalParsed.contextAffinity = vectors.contextAffinity;
  finalParsed.music_profile.primaryGenres = genre.primaryGenres;
  finalParsed.music_profile.subgenres = genre.subgenres;

  // 이미지, 전체 프롬프트, 전체 GPT 응답은 로그에 남기지 않는다 — 검증 성공 여부와 정규화 발생 여부,
  // 필드 개수만 남기는 압축된 진단 로그.
  console.log("image_vector_validated", {
    normalized: vectors.normalized,
    targetStatsFields: TARGET_STATS_FIELDS.length,
    contextAffinityFields: CONTEXT_AFFINITY_FIELDS.length,
    primaryGenreCount: genre.primaryGenres.length,
    subgenreCount: genre.subgenres.length,
    genreEligibleCatalogCount: genre.eligibleCount,
  });

  return finalParsed;
}
