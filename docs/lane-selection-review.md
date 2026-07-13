# Lane Selection Review Report

**Purpose:** a human-readable review of how `analyze-and-search` currently picks a music "curation lane" for an uploaded photo, so this can be visually inspected before the backend is deployed.

**Source of truth (as of this review):**
- `supabase/functions/analyze-and-search/services/gpt.ts`
- `supabase/functions/analyze-and-search/services/curationLanes.ts`

This document does not change any of the above files. It only describes what they currently say.

---

## 1. Overview

**How GPT chooses `primary_lane_id`**
Lane selection happens entirely inside a single GPT-4o Vision call (`analyzeImage()` in `gpt.ts`). The prompt walks GPT through:
1. **STEP 1** — classify the image as SCENE / PERSON / MIXED.
2. **STEP 2** — analyze location/space, time of day, season, mood, sensory impressions, and cultural context.
3. **STEP 3** — build an internal music profile (energy score, tempo, valence).
4. **STEP 3.5** — silently note additional visual signals (scene type, weather feeling, openness, motion, social context, color/lighting, aesthetic era, dominant subject) — these are reasoning aids only, not output fields.
5. **STEP 4** — choose exactly one of the 20 official curation lanes, using the lane-selection rules, several "guard" sections, and a conflict-resolver quick-reference, then output its `lane_id` as `primary_lane_id`.
6. **STEP 6** — return the full JSON response.

**What image dimensions are considered**
Scene type, time of day, weather feeling, season/temperature feeling, openness/indoor-outdoor, energy level, motion (static/walking/driving/dancing/performing/travel), social context (alone/couple/friends/crowd), emotional tone, color/lighting, aesthetic era (retro/modern/cinematic/analog/glossy/casual), and dominant subject/object. Cultural/geographic context is also noted, but explicitly as secondary flavor (see below).

**Real user location/weather is NOT used.** The system only looks at what's visible in the uploaded photo. There is no location permission, no weather API, and no use of the device's real GPS or current conditions anywhere in this flow.

**Cultural/location cues are secondary flavor only.** The prompt explicitly says a Japanese alley is not automatically City Pop, a Korean street is not automatically K-indie, and a New York street is not automatically hip-hop. Culture can nudge a choice only when it's reinforced by the image's actual visible mood/energy/weather/openness/motion/social context/aesthetic.

**The backend does not silently override GPT's lane.** `gpt.ts` validates `primary_lane_id` against the 20 official lane IDs; if it's missing or invalid, the request **fails with an error** — there is no fallback default, and in particular there is no fallback to `city-pop-retro-glow` or any other lane.

---

## 2. Lane selection principles (current global rules)

These are paraphrased from the actual prompt text in `gpt.ts` STEP 4:

1. **Visible mood and energy beat location.** Do not choose a lane just because the image looks Japanese, Korean, American, urban, or trendy.
2. **Weather and openness matter.** Bright open-sky/water/summer images should not automatically downshift into a nostalgic/calm lane.
3. **Indoor vs outdoor matters.** A cafe interior, a bedroom, a night street, and an open ocean landscape should not collapse into the same lane just because they all feel "warm" or "calm."
4. **Time of day matters.** Daytime sunny energy, golden-hour nostalgia, neon night, rainy night, and late-night solitude are different lane territories.
5. **Social context matters.** A couple, a lone person, friends, and a crowd should shift the lane choice (e.g. couple → Modern Romance Pop, solo night-walk → K-R&B Night Drive or Lo-fi Bedroom Solitude).
6. **Motion matters.** Driving, walking, dancing, performing, traveling, and resting point to different lanes.
7. **Aesthetic era matters.** Retro/analog/vintage is not the same as modern/glossy — this is the main thing separating City Pop from Trendy Pop Chic and Classic Soul.
8. **Cultural cues are secondary.** They can flavor a decision but should never be the deciding factor by themselves.
9. **If two lanes conflict, use the tie-breakers.** STEP 4 has a dedicated "Conflict resolver" quick-reference block for the most commonly confused lane pairs (see Part 2 below).

---

## 3. Full 20-lane guide

> Note on format: the task asked for a "decision table." A single 12-column table across 20 rows would be extremely wide and hard to actually read, so this section presents the same information as one clearly-labeled block per lane — this is more legible for a manual review than a giant table, while covering every requested field.

### modern-jazz-groove — "Modern Jazz Groove"
- **Meaning:** Rhythmic, adult, sax/Rhodes-piano jazz-hop groove for stylish interiors and city nights.
- **Choose when:** dim jazz bar with a live sax player, rain on a late-night cafe window, warm Rhodes-piano lounge glow, adult apartment at night, stylish rooftop/wine-bar after dark.
- **Do NOT choose when:** bright idol pop energy; fast highway driving; delicate acoustic singer-songwriter cafe; a sunlit daytime cafe with plain gentle comfort; a solitary late-night car/window with R&B sensuality; a quiet empty room with no social/stylish energy.
- **Strongest visual triggers:** dim lounge lighting, live sax, Rhodes piano, rain on a night window, stylish bar/lounge setting.
- **Common false positives:** any warm indoor scene defaults here even when it should be Cozy Cafe Mellow (daytime) or K-R&B Night Drive (solo night car/window).
- **Confused with:** Cozy Cafe Mellow, K-R&B Night Drive.
- **Tie-breaker:** rhythmic/night/stylish groove → this lane; daytime plain cafe comfort → Cozy Cafe Mellow; sensual solo night car/window → K-R&B Night Drive.
- **Typical energy:** mellow but rhythmic, mid-tempo.
- **Typical time/weather/space:** indoor, night-leaning, no strong weather cue.
- **Example that SHOULD select this lane:** "A dim jazz bar at night, a saxophonist mid-solo, warm amber lighting, glasses of wine on the table."
- **Example that should NOT select this lane:** "A bright sunlit cafe table with a coffee cup and pastry, morning light streaming in." → Cozy Cafe Mellow.

### j-rock-highway-rush — "J-Rock Highway Rush"
- **Meaning:** High-speed Japanese rock for real motion, driving, and adrenaline.
- **Choose when:** car/motorcycle in motion on a highway, tunnel lights streaking past, live band performance with guitars, wind-blown hair/clothing, anime-opening-style dynamic action framing.
- **Do NOT choose when:** quiet indoor room; slow reflective jazz mood; mellow late-night lounge; a calm Japanese street/landmark with no actual motion; a peaceful sunny travel moment without adrenaline; retro city nostalgia.
- **Strongest visual triggers:** motion blur, tunnel, highway, live guitar performance, visible speed.
- **Common false positives:** any "Japan-looking" street or landmark photo with no real motion — this used to be the classic wrong trigger for this lane.
- **Confused with:** American Alternative Drive, Indie Road Movie, City Pop / Retro Drive.
- **Tie-breaker:** motion+speed+adrenaline → this lane; casual sunny friends drive → American Alternative Drive; wistful solo travel/departure → Indie Road Movie; retro nostalgia → City Pop.
- **Typical energy:** high, fast tempo.
- **Typical time/weather/space:** outdoor, daytime, summer-leaning, in motion.
- **Example that SHOULD select this lane:** "A motorcycle leaning into a curve on a sunlit highway, tunnel lights blurring past, wind visibly whipping through hair."
- **Example that should NOT select this lane:** "A quiet, empty alley in Tokyo at dusk, no people, no motion, soft ambient light." → not automatically J-Rock or City Pop just because it looks Japanese.

### k-rnb-night-drive — "K-R&B Night Drive"
- **Meaning:** Smooth, sensual, lonely Korean R&B for neon night streets and cars.
- **Choose when:** a single figure walking a neon-lit street at night, a rain-streaked car window with blurred city lights, a lone silhouette against a glowing window, soft neon on wet pavement, a moody low-lit portrait.
- **Do NOT choose when:** sunny highway road trip; acoustic folk rock mood; old vintage film photo; aggressive/confident street-rap energy; a couple/romantic scene; a tense/menacing mood.
- **Strongest visual triggers:** solitary figure, neon reflections, night car window, moody low light.
- **Common false positives:** any night car/city scene defaults here even when it's actually a confident rap cruise (Hip-Hop Night Drive) or a couple (Modern Romance Pop).
- **Confused with:** Hip-Hop Night Drive, Modern Romance Pop, Dark Heavy Hip-Hop.
- **Tie-breaker:** smooth/sensual/lonely → this lane; confident rap/street cruise → Hip-Hop Night Drive; couple romantic warmth → Modern Romance Pop; menace/aggression → Dark Heavy Hip-Hop.
- **Typical energy:** smooth, moody mid-tempo.
- **Typical time/weather/space:** outdoor/car, night, urban.
- **Example that SHOULD select this lane:** "A single person walking alone down a rain-slick neon-lit street at 2am, reflections in puddles, no one else around."
- **Example that should NOT select this lane:** "Two people holding hands, walking together under city lights at night, smiling at each other." → Modern Romance Pop.

### k-indie-rainy-room — "K-Indie Rainy Room"
- **Meaning:** Soft Korean indie/bedroom pop for rainy windows and ordinary daily-life melancholy.
- **Choose when:** raindrops on a bedroom/living-room window, an ordinary lived-in room with soft daylight, a half-finished tea/coffee cup, a diary/notebook/houseplant, everyday unstyled clutter.
- **Do NOT choose when:** a party/bright social gathering; a high-speed energetic mood; funk/disco energy; an outdoor hazy fog-blurred scene; a private desk/bedroom with no rain; a warm public cafe/bakery.
- **Strongest visual triggers:** rain on glass, ordinary domestic clutter, diary/notebook.
- **Common false positives:** any "quiet room" photo gets pulled here even without rain or diary-like domestic detail — should be Lo-fi Bedroom Solitude instead.
- **Confused with:** Lo-fi Bedroom Solitude, Dream Pop / Shoegaze Fog, Cozy Cafe Mellow.
- **Tie-breaker:** rain+ordinary room+diary feeling → this lane; private desk/bedroom stillness → Lo-fi Bedroom Solitude; hazy outdoor fog/blur → Dream Pop / Shoegaze Fog; public cafe → Cozy Cafe Mellow.
- **Typical energy:** soft, low tempo.
- **Typical time/weather/space:** indoor, rainy.
- **Example that SHOULD select this lane:** "Rain tracing down a bedroom window, a half-drunk cup of tea on the sill, a notebook lying open on the bed."
- **Example that should NOT select this lane:** "A minimal, dark bedroom at night, just a desk lamp and a laptop glowing, no rain, no clutter." → Lo-fi Bedroom Solitude.

### city-pop-retro-glow — "City Pop / Retro Drive"
- **Meaning:** Glossy retro Japanese/Korean city pop for sunset drives and 80s urban nostalgia.
- **Choose when:** a car windshield reflecting a warm sunset, retro film-grain color grading, a glossy 1980s-style cityscape at dusk, a highway/waterfront drive in golden-hour light, a vintage analog-camera aesthetic.
- **Do NOT choose when:** dark/somber scene; ambient post-rock mood; slow introspective night; bright open-air ocean/beach/blue-sky daytime; modern glossy fashion/editorial; a travel/departure story; a plain sunny Japanese/Korean-looking street/window with no retro glow; a quiet warm cafe with plain daytime comfort.
- **Strongest visual triggers:** sunset/golden-hour light, retro color grading, glossy synth-city aesthetic.
- **Common false positives:** **this is the lane that was previously over-selected** — any sunny, peaceful, or Japan/Korea-looking photo used to default here even without actual retro/sunset/glow signals. It is now the most heavily-guarded lane in the whole system (see Part 4).
- **Confused with:** Summer Beach Pop, Trendy Pop Chic, Indie Road Movie, Classic Soul / Old Film, Cozy Cafe Mellow.
- **Tie-breaker:** retro sunset city glow → this lane; bright open sky/water/vacation → Summer Beach Pop; modern glossy fashion → Trendy Pop Chic; travel/departure → Indie Road Movie; old-film analog warmth → Classic Soul / Old Film.
- **Typical energy:** upbeat, groovy retro funk, mid-tempo.
- **Typical time/weather/space:** outdoor/drive, sunset/dusk-leaning.
- **Example that SHOULD select this lane:** "A car driving along a coastal highway at sunset, warm orange light reflecting off the windshield, retro film-grain color grading."
- **Example that should NOT select this lane:** "A bright midday photo of a harbor with clear blue sky, sailboats, and sparkling ocean water." → Summer Beach Pop. *(This is the exact scenario that triggered this entire audit.)*

### indie-road-movie — "Indie Road Movie"
- **Meaning:** Wistful indie rock/Britpop for travel, departures, and open roads.
- **Choose when:** a train pulling away from a platform, an empty airport terminal/departure gate, a solitary figure with a suitcase/backpack, an open road into changing scenery, a bus/train window with landscape passing.
- **Do NOT choose when:** a stylish urban night; K-R&B/jazz-hop mood; a dance club; strong speed/adrenaline/guitar rush; friends casually enjoying a sunny drive; retro city nostalgia.
- **Strongest visual triggers:** train/platform, airport gate, solitary traveler, open road.
- **Common false positives:** general "outdoor"/"travel" photos get pulled here even when the mood is actually energetic-with-friends (American Alternative Drive) or fast/adrenaline (J-Rock Highway Rush).
- **Confused with:** American Alternative Drive, J-Rock Highway Rush, City Pop / Retro Drive.
- **Tie-breaker:** wistful cinematic solo journey → this lane; speed/adrenaline guitar → J-Rock Highway Rush; friends/casual sunny drive → American Alternative Drive; retro city drive → City Pop.
- **Typical energy:** mid-tempo, wistful but moving forward.
- **Typical time/weather/space:** outdoor, transit spaces, any time of day.
- **Example that SHOULD select this lane:** "A lone traveler watching a train pull away from an empty platform, suitcase beside them, soft grey daylight."
- **Example that should NOT select this lane:** "A car full of laughing friends driving down a sunny highway with the windows down." → American Alternative Drive.

### american-alternative-drive — "American Alternative Drive"
- **Meaning:** Sunny, casual American alt-rock/garage rock for road trips with friends.
- **Choose when:** friends packed into a car with windows down, a sunlit highway with casual unposed energy, a road-trip pit stop in daylight, sunglasses/denim/casual summer clothing in motion, a group laughing/singing in a car.
- **Do NOT choose when:** a moody night street; smooth R&B/jazz mood; a quiet rainy room; strong speed/anime/guitar-driven adrenaline; a solitary traveler/wistful departure; a polished glossy fashion-forward scene.
- **Strongest visual triggers:** friends in a car, sunlit highway, casual daytime road-trip energy.
- **Common false positives:** any "road" or "friends" photo could get pulled here even if the real signal is adrenaline/speed (J-Rock Highway Rush) or solo travel (Indie Road Movie).
- **Confused with:** J-Rock Highway Rush, Indie Road Movie.
- **Tie-breaker:** friends+sun+casual → this lane; speed/anime/guitar rush → J-Rock Highway Rush; solo/departure/cinematic → Indie Road Movie.
- **Typical energy:** energetic, sunny, casual, mid-to-uptempo.
- **Typical time/weather/space:** outdoor, sunny daytime.
- **Example that SHOULD select this lane:** "A group of friends in a convertible, sunglasses on, singing along, driving down a sunlit highway."
- **Example that should NOT select this lane:** "A single person standing alone on a train platform with a suitcase, watching the train arrive." → Indie Road Movie.

### dream-pop-shoegaze-fog — "Dream Pop / Shoegaze Fog"
- **Meaning:** Hazy, reverb-soaked dream pop/shoegaze for foggy, blurred, melancholic scenes.
- **Choose when:** thick fog blurring a skyline/landscape, soft-focus washed-out lighting, distant lights glowing through mist/rain, a figure dissolving into haze at the frame's edges, an overexposed/dreamlike double-exposure look.
- **Do NOT choose when:** a bright high-energy scene; funk/disco mood; a sharp punchy rock scene; an ordinary rainy room with clear sharp detail; a plain minimal bedroom with no fog/haze; a bright sunny clear scene.
- **Strongest visual triggers:** fog, haze, blur, washed-out/overexposed light.
- **Common false positives:** any "rainy" or "moody" photo could get pulled here even when it's really an ordinary rainy room (K-Indie Rainy Room) or a plain quiet bedroom (Lo-fi Bedroom Solitude).
- **Confused with:** K-Indie Rainy Room, Lo-fi Bedroom Solitude.
- **Tie-breaker:** hazy/blurred/ethereal atmosphere → this lane; ordinary rainy room → K-Indie Rainy Room; lonely bedroom stillness → Lo-fi Bedroom Solitude.
- **Typical energy:** slow to mid-tempo, hazy/washed-out drift.
- **Typical time/weather/space:** outdoor or window-view, foggy/misty/rainy.
- **Example that SHOULD select this lane:** "A skyline completely obscured by thick fog, streetlights reduced to soft glowing halos, everything blurred and dreamlike."
- **Example that should NOT select this lane:** "A clearly visible rainy bedroom window with sharp raindrops, a notebook on the desk, everything in clear focus." → K-Indie Rainy Room.

### big-city-swagger-hiphop — "Big City Swagger Hip-Hop"
- **Meaning:** Confident, bass-heavy hip-hop for downtown dominance, skylines, and luxury cars.
- **Choose when:** a black luxury car gliding past a glowing skyline, a confident figure against a downtown backdrop, a rooftop/high-rise skyline view at night, designer/luxury styling cues, a wide dominant low-angle city-architecture shot.
- **Do NOT choose when:** a quiet rainy room; soft acoustic pop mood; a bright K-pop moment; smooth melodic low-key cruise energy; a tense/menacing/underground mood; a synthetic futuristic neon scene.
- **Strongest visual triggers:** skyline dominance, black luxury car, confident posture, high-rise view.
- **Common false positives:** any "night city" photo could default here even when it's actually a relaxed cruise (Hip-Hop Night Drive) or dark/menacing (Dark Heavy Hip-Hop).
- **Confused with:** Hip-Hop Night Drive, Dark Heavy Hip-Hop, Neon Electronic Night.
- **Tie-breaker:** confident/luxury/dominance → this lane; smooth low-key cruise → Hip-Hop Night Drive; aggressive/dark → Dark Heavy Hip-Hop; futuristic synth/neon → Neon Electronic Night.
- **Typical energy:** confident, bass-driven, mid-to-high.
- **Typical time/weather/space:** outdoor, night, city.
- **Example that SHOULD select this lane:** "A black luxury sedan gliding past a glowing downtown skyline at night, shot from a low, dominant angle."
- **Example that should NOT select this lane:** "A dark, graffiti-covered alley with harsh shadows and a tense, confrontational figure." → Dark Heavy Hip-Hop.

### neon-electronic-night — "Neon Electronic Night"
- **Meaning:** Cool synthetic neon and futuristic electronic pop for cyberpunk-style night scenes.
- **Choose when:** neon signage reflected on wet pavement, a late-night subway car under cold fluorescent/neon light, glowing screens/digital billboards, a cool blue/purple/pink neon palette with hard edges, a futuristic/cyberpunk-styled night street.
- **Do NOT choose when:** an acoustic/organic scene; a vintage soul/oldies mood; a quiet daytime scene; a warm colorful dancefloor/party; a confident rap cruise/sensual R&B; a retro/glossy/sunset-warm scene.
- **Strongest visual triggers:** cool-toned neon, screens, futuristic architecture.
- **Common false positives:** any "neon" or "night city" photo could default here even when the actual mood is warm/social (Funk / Disco Night) or a confident rap cruise (Hip-Hop Night Drive).
- **Confused with:** Funk / Disco Night, Hip-Hop Night Drive, K-R&B Night Drive, City Pop / Retro Drive.
- **Tie-breaker:** cool synthetic neon/futuristic → this lane; warm colorful dancefloor/groove → Funk / Disco Night; rap/R&B night drive → Hip-Hop/K-R&B lanes.
- **Typical energy:** pulsing, synthetic, mid-tempo.
- **Typical time/weather/space:** outdoor/transit, night.
- **Example that SHOULD select this lane:** "A late-night subway car lit by cold blue-purple fluorescent light, empty except for one passenger, neon ads reflected in the window."
- **Example that should NOT select this lane:** "A warm, colorful house party with a disco ball and people dancing together, golds and pinks everywhere." → Funk / Disco Night.

### lofi-bedroom-solitude — "Lo-fi Bedroom Solitude"
- **Meaning:** Minimal lo-fi/slowcore for private, solitary, introspective indoor stillness.
- **Choose when:** a desk lamp glowing in an otherwise dark room, headphones on a desk or worn by a solitary figure, a laptop/notebook lit only by screen glow, a plain minimally decorated private room at night, a single unmade bed/quiet nighttime bedroom with no one else present.
- **Do NOT choose when:** a high-energy/social scene; driving rock/bright pop mood; an outdoor party; a warm public cafe/bakery with daylight; rain against a window with a diary-like domestic feeling; a youthful bedroom with posters/friends/school energy.
- **Strongest visual triggers:** desk lamp, headphones, screen glow, empty private room.
- **Common false positives:** any "quiet room" defaults here even when it's actually a rainy diary-like room (K-Indie Rainy Room) or a public cafe (Cozy Cafe Mellow).
- **Confused with:** Cozy Cafe Mellow, K-Indie Rainy Room, Highteen Pop Room, Dream Pop / Shoegaze Fog.
- **Tie-breaker:** alone/private/still → this lane; public cafe/daylight → Cozy Cafe Mellow; rain/diary/K-indie warmth → K-Indie Rainy Room; youthful friends/posters/school → Highteen Pop Room.
- **Typical energy:** very low tempo, minimal.
- **Typical time/weather/space:** indoor, dim/night.
- **Example that SHOULD select this lane:** "A dark bedroom lit only by a desk lamp and a laptop screen, headphones on the desk, 1am, completely alone."
- **Example that should NOT select this lane:** "A sunlit cafe table with a coffee cup and an open book, people chatting quietly in the background." → Cozy Cafe Mellow.

### highteen-pop-room — "Highteen Pop Room"
- **Meaning:** Playful teen-pop/bedroom pop for high-school bedrooms, selfies, and youthful friend energy.
- **Choose when:** a teenage bedroom with posters/fairy lights/plush toys, a school hallway/locker scene, friends laughing together casually, a playful selfie with bright unpolished styling, handwritten notes/stickers/DIY decor.
- **Do NOT choose when:** a moody adult night; dark/heavy hip-hop mood; a formal/mature scene; a polished editorial adult-fashion moment; one person alone in quiet stillness; a romantic date scene.
- **Strongest visual triggers:** posters, school setting, group of friends, playful unpolished styling.
- **Common false positives:** any "bedroom" or "selfie" photo defaults here even when the mood is actually adult/glossy (Trendy Pop Chic) or solitary (Lo-fi Bedroom Solitude).
- **Confused with:** Trendy Pop Chic, Lo-fi Bedroom Solitude, Modern Romance Pop.
- **Tie-breaker:** teen/playful/friends/school → this lane; adult fashion/editorial → Trendy Pop Chic; alone/private stillness → Lo-fi Bedroom Solitude.
- **Typical energy:** playful, bright, mid-to-high tempo.
- **Typical time/weather/space:** indoor, bedroom/school.
- **Example that SHOULD select this lane:** "Two friends laughing on a bed covered in posters and fairy lights, taking a silly selfie together."
- **Example that should NOT select this lane:** "A polished mirror selfie in a designer outfit on a clean, minimal city street." → Trendy Pop Chic.

### modern-romance-pop — "Modern Romance Pop"
- **Meaning:** Glowing synth-pop for couples, date nights, and bittersweet young love.
- **Choose when:** two people together in a warm intimate moment, a date-night scene with soft glowing light, hands touching/close physical closeness, a rainy street/city window shared by a couple, a phone-lit face suggesting a late-night conversation with someone.
- **Do NOT choose when:** a chaotic party; aggressive hip-hop mood; a bright daytime beach; one person alone rather than a couple/shared intimacy; bright open-air vacation energy; a group of friends rather than a romantic pair.
- **Strongest visual triggers:** two people together, physical closeness, soft glow, shared intimacy.
- **Common false positives:** any "night city lights" photo defaults here even when it's actually a solitary figure (K-R&B Night Drive).
- **Confused with:** K-R&B Night Drive, Summer Beach Pop.
- **Tie-breaker:** couple/romantic warmth → this lane; solo sensual neon → K-R&B Night Drive; beach/open vacation → Summer Beach Pop.
- **Typical energy:** mid-tempo, glowing/emotional.
- **Typical time/weather/space:** outdoor/car, night-leaning.
- **Example that SHOULD select this lane:** "Two people sitting close together on a rainy city bench at night, sharing an umbrella, city lights glowing softly behind them."
- **Example that should NOT select this lane:** "A single person walking alone at night, city lights reflected in puddles, no one else in frame." → K-R&B Night Drive.

### summer-beach-pop — "Summer Beach Pop"
- **Meaning:** Bright surf-rock/sunny pop for beach days and open-air vacation energy.
- **Choose when:** ocean waves/beach shoreline under a clear blue sky, a pool/open-water scene in bright daylight, sunglasses/swimwear/vacation gear in direct sunlight, a wide-open harbor/coastline/seaside horizon, bright midday sun with minimal shadow.
- **Do NOT choose when:** a dark/moody scene; slowcore/noir-jazz mood; a rainy indoor room; a golden-hour/sunset city drive with retro nostalgia; an indoor fashion/editorial shoot; a travel/departure story without beach/sun/water energy.
- **Strongest visual triggers:** ocean, beach, blue sky, bright midday sun.
- **Common false positives:** **this lane was previously under-selected** — the exact bright-sky/ocean/harbor scenario from the original bug report should land here, not on City Pop.
- **Confused with:** City Pop / Retro Drive, Trendy Pop Chic, Indie Road Movie.
- **Tie-breaker:** open sky/water/sun/vacation → this lane; retro urban glow → City Pop; modern glossy fashion → Trendy Pop Chic; travel/departure without beach/sun → Indie Road Movie.
- **Typical energy:** upbeat, sun-soaked, bright and breezy.
- **Typical time/weather/space:** outdoor, sunny, summer, midday.
- **Example that SHOULD select this lane:** "A wide-open harbor under a clear blue sky, bright midday sun, ocean water sparkling, boats in the distance."
- **Example that should NOT select this lane:** "A car driving along a coastal road at sunset, warm orange light, retro-toned photo." → City Pop / Retro Drive.

### trendy-pop-chic — "Trendy Pop Chic"
- **Meaning:** Glossy, confident modern pop/K-pop for fashion-forward, social-media-style moments.
- **Choose when:** a mirror selfie in a styled curated outfit, an editorial-style portrait with clean modern lighting, a fashion-forward look on a city street, polished high-contrast social-media-ready framing, designer/trend-driven styling with minimal clutter.
- **Do NOT choose when:** a quiet solitary room; ambient/ballad mood; a rainy melancholic day; a playful teenage bedroom/school setting; a retro/nostalgic/sunset-glow scene; a plain unstyled casual home moment.
- **Strongest visual triggers:** mirror selfie, editorial polish, fashion styling.
- **Common false positives:** **this lane was previously under-selected** — fashion-forward/glossy images used to often default to City Pop just from "stylish city" cues.
- **Confused with:** City Pop / Retro Drive, Highteen Pop Room.
- **Tie-breaker:** adult polished fashion/editorial → this lane; teen/playful/school → Highteen Pop Room; retro city nostalgia → City Pop.
- **Typical energy:** confident, sleek, mid-to-high tempo.
- **Typical time/weather/space:** mixed indoor/outdoor, city street/mirror selfie.
- **Example that SHOULD select this lane:** "A polished mirror selfie in a designer outfit, clean modern lighting, minimal background clutter, high-contrast framing."
- **Example that should NOT select this lane:** "A car reflecting a warm sunset with retro film-grain color grading." → City Pop / Retro Drive.

### funk-disco-night — "Funk / Disco Night"
- **Meaning:** Warm, groovy disco/funk for colorful dancefloors and social party nights.
- **Choose when:** a colorful warm-lit dancefloor with people dancing, disco-ball/warm party lighting (reds, golds, pinks), a group of friends dancing/celebrating together, a retro-styled nightclub/house-party scene, warm saturated colored lighting rather than cool neon.
- **Do NOT choose when:** a quiet introspective scene; acoustic folk mood; a slow rainy day; a cool synthetic futuristic scene; a stylish lounge/jazz-bar groove without an actual dancefloor/party; a dark tense aggressive scene.
- **Strongest visual triggers:** dancefloor, disco lighting, group celebration.
- **Common false positives:** any colorful night scene could default here even when it's actually cool/futuristic (Neon Electronic Night) or a stylish lounge (Modern Jazz Groove).
- **Confused with:** Neon Electronic Night, Modern Jazz Groove.
- **Tie-breaker:** warm dancefloor/groove/social party → this lane; cool futuristic neon/synth → Neon Electronic Night; stylish lounge groove without dancefloor → Modern Jazz Groove.
- **Typical energy:** groovy, danceable, uptempo.
- **Typical time/weather/space:** indoor, night, party.
- **Example that SHOULD select this lane:** "A warmly lit dancefloor with a disco ball, friends dancing together, golden and pink lighting everywhere."
- **Example that should NOT select this lane:** "A dim jazz lounge with a saxophonist playing to a seated, quiet crowd." → Modern Jazz Groove.

### classic-soul-old-film — "Classic Soul / Old Film"
- **Meaning:** Warm classic soul/vintage ballads for old-film-toned, timeless nostalgic scenes.
- **Choose when:** a faded grainy old photograph/home-movie still, warm sepia/film-grain color toning, a vintage family gathering/old street scene, analog film artifacts (light leaks, scratches, soft focus), decades-old clothing/decor rather than 80s-glossy.
- **Do NOT choose when:** a futuristic neon night; anime rock/synthwave mood; a bright modern K-pop scene; 80s-glossy synth/sunset-drive energy; a modern polished editorial/fashion moment; a bright open-air sunny/vacation-like scene.
- **Strongest visual triggers:** sepia tone, film grain, vintage family-photo look.
- **Common false positives:** often conflated with City Pop's "retro" label even though the aesthetics differ (decades-old sepia vs 80s glossy synth-color).
- **Confused with:** City Pop / Retro Drive, Trendy Pop Chic.
- **Tie-breaker:** old-film analog memory/soul warmth → this lane; 80s city synth/drive → City Pop; modern glossy editorial → Trendy Pop Chic.
- **Typical energy:** warm, soulful, mid-tempo.
- **Typical time/weather/space:** mixed, vintage aesthetic, any time of day.
- **Example that SHOULD select this lane:** "A faded, sepia-toned family photograph with visible film grain and light leaks, clearly decades old."
- **Example that should NOT select this lane:** "A glossy, warm-toned 1980s cityscape at dusk with neon-lit signage and a car windshield reflecting the sunset." → City Pop / Retro Drive.

### cozy-cafe-mellow — "Cozy Cafe Mellow"
- **Meaning:** Warm, gentle soul-pop/soft R&B for sunlit public cafes and easygoing daytime comfort.
- **Choose when:** a window-seat table with a coffee cup in soft daylight, a bakery counter/pastry display, warm morning/early-afternoon sunlight across a cafe table, a book/laptop/journal on a public cafe table, gentle unhurried public seating.
- **Do NOT choose when:** a dark night street; aggressive/heavy mood; a neon nightclub; a rhythmic stylish night-lounge groove; a private bedroom/desk with no public cafe setting; rain against a window with a diary-like domestic mood.
- **Strongest visual triggers:** cafe window seat, bakery, warm daylight.
- **Common false positives:** any "warm and calm" indoor scene could default here even when it's actually private solitude (Lo-fi Bedroom Solitude) or a rainy diary room (K-Indie Rainy Room).
- **Confused with:** Lo-fi Bedroom Solitude, Modern Jazz Groove, K-Indie Rainy Room.
- **Tie-breaker:** public cafe/daylight/warm comfort → this lane; rhythmic jazz/lounge → Modern Jazz Groove; private alone room → Lo-fi Bedroom Solitude; rainy diary interior → K-Indie Rainy Room.
- **Typical energy:** gentle, warm, low-to-mid tempo.
- **Typical time/weather/space:** indoor, daylight/morning.
- **Example that SHOULD select this lane:** "A window-seat table at a bakery cafe, warm morning sunlight, a coffee cup and an open book, quiet and unhurried."
- **Example that should NOT select this lane:** "A dark, empty bedroom lit only by a desk lamp and laptop screen, headphones on the desk, late at night." → Lo-fi Bedroom Solitude.

### hip-hop-night-drive — "Hip-Hop Night Drive"
- **Meaning:** Smooth, melodic hip-hop/R&B-rap for confident late-night city cruising.
- **Choose when:** a car interior lit by passing streetlights at night, downtown city lights streaming past a car window, a confident relaxed nighttime cruise through the city, neon signage blurred by motion through a windshield, a late-night city street with moderate moving energy.
- **Do NOT choose when:** a bright daytime scene; acoustic/folk energy; a sunny beach; a soft lonely sensual mood; a tense/menacing/underground mood; luxury/skyline dominance and stillness rather than motion.
- **Strongest visual triggers:** in-motion car interior, city lights streaming past, confident cruise energy.
- **Common false positives:** overlaps heavily with K-R&B Night Drive since both show near-identical car/night-street visuals — flagged as genuinely hard to separate from an image alone (see Part 4, Red Flags).
- **Confused with:** K-R&B Night Drive, Dark Heavy Hip-Hop, Big City Swagger Hip-Hop.
- **Tie-breaker:** smooth rap/cruise/night drive → this lane; sensual soft R&B → K-R&B Night Drive; aggressive menace → Dark Heavy Hip-Hop; luxury big-city dominance → Big City Swagger Hip-Hop.
- **Typical energy:** smooth, melodic, mid-tempo.
- **Typical time/weather/space:** outdoor/car, night.
- **Example that SHOULD select this lane:** "A car cruising confidently through downtown at night, city lights streaming past the window, moderate motion, relaxed energy."
- **Example that should NOT select this lane:** "A single, lonely figure standing still under a neon sign at night, no motion, no car." → K-R&B Night Drive.

### dark-heavy-hiphop — "Dark Heavy Hip-Hop"
- **Meaning:** Aggressive, bass-heavy trap/drill for dark, tense, high-stakes night scenes.
- **Choose when:** a shadowy underlit street/alley, a black room lit only by a phone screen, an aggressive pose/intense confrontational expression, underground/graffiti-heavy urban texture, harsh low-key lighting with deep shadow.
- **Do NOT choose when:** a bright and cheerful scene; soft acoustic/cafe pop mood; a sunny beach day; a smooth relaxed mood; confident luxury/skyline dominance without menace; synthetic/futuristic neon rather than dark/underground.
- **Strongest visual triggers:** deep shadow, aggressive posture, underground texture.
- **Common false positives:** any "dark night" photo could default here even when the mood is actually smooth/confident (Hip-Hop Night Drive or Big City Swagger).
- **Confused with:** Hip-Hop Night Drive, Big City Swagger Hip-Hop, Neon Electronic Night.
- **Tie-breaker:** menace/aggression/heavy darkness → this lane; smooth cruise → Hip-Hop Night Drive; confident luxury → Big City Swagger Hip-Hop; synthetic neon future → Neon Electronic Night.
- **Typical energy:** heavy, tense, aggressive.
- **Typical time/weather/space:** indoor/outdoor dark, night.
- **Example that SHOULD select this lane:** "A shadowy underground alley, harsh low light, a figure in an aggressive, confrontational pose, graffiti-covered walls."
- **Example that should NOT select this lane:** "A black luxury car gliding past a glowing skyline, confident but not aggressive, polished and dominant." → Big City Swagger Hip-Hop.

---

## Part 2 — Common Lane Conflicts

1. **City Pop / Retro Drive vs Summer Beach Pop** — retro urban nostalgia + sunset drive → City Pop; bright open-air sunny/water/vacation → Summer Beach Pop. This was the original bug: bright-sky/ocean photos were defaulting to City Pop. Fixed by making "bright open-air ocean/beach/blue-sky daytime" an explicit `avoidWhen` for City Pop.
2. **City Pop / Retro Drive vs Trendy Pop Chic** — retro/nostalgic → City Pop; modern glossy/fashion-forward → Trendy Pop Chic. Aesthetic era (retro vs modern) is the deciding factor.
3. **City Pop / Retro Drive vs Indie Road Movie** — retro city mood → City Pop; travel/departure story (train, airport, open road) → Indie Road Movie.
4. **Cozy Cafe Mellow vs Lo-fi Bedroom Solitude** — public/social warm daytime cafe → Cozy Cafe Mellow; private solitary room → Lo-fi Bedroom Solitude. Indoor/outdoor and social-context signals separate these.
5. **K-R&B Night Drive vs Hip-Hop Night Drive** — sensual/smooth solitary mood → K-R&B Night Drive; confident rap/street cruise → Hip-Hop Night Drive. **This is the hardest pair in the whole system** — both describe near-identical car/night-street visuals, and the real difference is vocal/sonic style, which isn't strongly visible in a photo (see Red Flags).
6. **Hip-Hop Night Drive vs Dark Heavy Hip-Hop** — smooth relaxed cruise → Hip-Hop Night Drive; aggressive/tense/menacing → Dark Heavy Hip-Hop. Emotional tone (relaxed vs aggressive) is the deciding factor.
7. **Neon Electronic Night vs Funk / Disco Night** — cool synthetic neon/futuristic → Neon Electronic Night; warm colorful dancefloor/groove → Funk / Disco Night. Color temperature (cool vs warm) is the deciding factor.
8. **Highteen Pop Room vs Trendy Pop Chic** — playful teen/school/friend energy → Highteen Pop Room; adult glossy fashion/editorial → Trendy Pop Chic. Age-coded styling cues (posters/school vs magazine-style polish) separate these.
9. **Modern Romance Pop vs K-R&B Night Drive** — couple/shared intimacy → Modern Romance Pop; solitary nocturnal sensuality → K-R&B Night Drive. Social context (couple vs alone) is the deciding factor.
10. **Dream Pop / Shoegaze Fog vs Lo-fi Bedroom Solitude** — hazy/blurred/outdoor dreamscape → Dream Pop / Shoegaze Fog; plain private indoor stillness → Lo-fi Bedroom Solitude. Presence of fog/haze/blur is the deciding factor.
11. **American Alternative Drive vs Indie Road Movie** — friends/casual/energetic road trip → American Alternative Drive; solo/wistful/departure narrative → Indie Road Movie. Social context (friends vs solo) is the deciding factor.
12. **Modern Jazz Groove vs Cozy Cafe Mellow** — rhythmic, often nighttime lounge groove → Modern Jazz Groove; plain warm daytime cafe comfort → Cozy Cafe Mellow. Time of day + rhythm/energy separate these.
13. **Classic Soul / Old Film vs City Pop / Retro Drive** — decades-old sepia/analog nostalgia → Classic Soul / Old Film; 80s glossy synth/sunset city drive → City Pop / Retro Drive. Both are "retro" but with a different aesthetic era.
14. **Big City Swagger Hip-Hop vs Hip-Hop Night Drive vs Dark Heavy Hip-Hop** — confident/luxury/dominant stillness → Big City Swagger; smooth relaxed in-motion cruise → Hip-Hop Night Drive; aggressive/tense/menacing → Dark Heavy Hip-Hop. This three-way split relies on fairly subtle emotional-tone reading and is one of the harder judgment calls in the system.

---

## Part 3 — Image Scenario Test Matrix

| # | Image description | Strongest visual cues | Expected primary lane | Acceptable secondary lanes | Should NOT win | Reason |
|---|---|---|---|---|---|---|
| 1 | Bright blue sky + ocean/harbor + sunny daytime | open sky, water, bright midday sun | Summer Beach Pop | Trendy Pop Chic, Indie Road Movie | City Pop / Retro Drive | Open sky/water/sun outweighs any Japan/city association — this was the original bug case. |
| 2 | Sunset city skyline + warm retro colors | golden-hour light, retro color grading | City Pop / Retro Drive | Classic Soul / Old Film (if very vintage-toned) | Summer Beach Pop | Genuine retro/sunset glow signal present. |
| 3 | Rainy window + quiet room + alone | rain on glass, ordinary domestic clutter | K-Indie Rainy Room | Lo-fi Bedroom Solitude, Dream Pop / Shoegaze Fog | Cozy Cafe Mellow | Rain + ordinary room + diary feeling is the core trigger. |
| 4 | Neon city night + movement | cool neon, motion | Neon Electronic Night | Hip-Hop Night Drive | Funk / Disco Night | Cool synthetic neon + motion beats warm dancefloor unless warm party lighting is present. |
| 5 | Dark car interior + night road | in-motion car, city lights | Hip-Hop Night Drive | K-R&B Night Drive | Dark Heavy Hip-Hop | Motion + moderate energy reads as cruise, not menace. |
| 6 | Cozy cafe table + warm light | window seat, daylight | Cozy Cafe Mellow | Modern Jazz Groove (only if night+rhythmic) | Lo-fi Bedroom Solitude | Public daylight cafe setting. |
| 7 | Stylish outfit/selfie/editorial | mirror selfie, polish | Trendy Pop Chic | — | City Pop / Retro Drive, Highteen Pop Room | Modern glossy polish, not retro or teen-playful. |
| 8 | Young bedroom/friends/school vibe | posters, friends, school | Highteen Pop Room | — | Trendy Pop Chic, Lo-fi Bedroom Solitude | Youthful social energy, not adult-fashion or solitary. |
| 9 | Foggy field/window/dreamy blur | fog, haze | Dream Pop / Shoegaze Fog | K-Indie Rainy Room (if clearly indoor rain) | Summer Beach Pop | Haze/blur is the defining signal. |
| 10 | Intense dark street/aggressive pose | shadow, confrontational pose | Dark Heavy Hip-Hop | Big City Swagger Hip-Hop (if confident-not-aggressive) | Hip-Hop Night Drive | Aggression/menace over smooth cruise. |
| 11 | Live band/guitar/highway rush | performance, speed | J-Rock Highway Rush | American Alternative Drive (if aesthetic reads American/casual) | Indie Road Movie | Actual performance+speed signal present, not just travel. |
| 12 | Couple/soft romantic date | two people, intimacy | Modern Romance Pop | K-R&B Night Drive (only if actually solo) | Highteen Pop Room | Couple/shared intimacy over group/teen energy. |
| 13 | Luxury skyline/black car/confident city posture | skyline, luxury car | Big City Swagger Hip-Hop | Hip-Hop Night Drive (if in motion) | Dark Heavy Hip-Hop | Confident dominance, not menace. |
| 14 | Old family photo/vintage street/film memory | sepia, film grain | Classic Soul / Old Film | — | City Pop / Retro Drive | Decades-old analog warmth, not 80s glossy synth. |
| 15 | Colorful dancefloor/social party | disco lighting, group dancing | Funk / Disco Night | Trendy Pop Chic (if more fashion-focused than dance-focused) | Neon Electronic Night | Warm colorful social groove, not cool synthetic. |
| 16 | Private desk/headphones/late-night alone | desk lamp, headphones, solitude | Lo-fi Bedroom Solitude | K-Indie Rainy Room (if rain visible) | Highteen Pop Room | Solitary stillness, no social/teen signal. |
| 17 | Casual sunny road trip with friends | friends, sunlit highway | American Alternative Drive | — | J-Rock Highway Rush, Indie Road Movie | Friends+casual+sun beats solo/speed signals. |
| 18 | Airport/platform/train departure | departure gate, solitary traveler | Indie Road Movie | — | City Pop / Retro Drive | Travel/departure narrative is the defining trigger. |
| 19 | Bright casual home selfie | plain home, no styling | Cozy Cafe Mellow or Lo-fi Bedroom Solitude (daylight vs. night) | the other of the two | Trendy Pop Chic | No fashion/editorial polish, just casual home. |
| 20 | Futuristic subway/screens/cold neon | cold neon, screens | Neon Electronic Night | Hip-Hop Night Drive (if confident cruise dominates) | City Pop / Retro Drive | Cold/futuristic beats warm/retro. |
| 21 | Sunny Japanese street with no retro mood | plain daylight, no motion/glow signal | Summer Beach Pop or Cozy Cafe Mellow (depending on openness) | — | City Pop / Retro Drive, J-Rock Highway Rush | Explicit test of "don't choose from location alone" — no cultural lane should trigger by country cue only. |
| 22 | Japanese alley at night with warm neon and retro signage | warm neon, retro signage | City Pop / Retro Drive | Classic Soul / Old Film (if very vintage) | Neon Electronic Night | Warm neon+retro signage is a genuine retro-glow signal, not just location. |
| 23 | Korean rainy street | rain, street | K-Indie Rainy Room (intimate/ordinary) or K-R&B Night Drive (moody/neon/solitary) | the other of the two | — (not automatic from "Korean" alone) | Culture is flavor; actual rain+intimacy vs neon+loneliness decides. |
| 24 | New York skyline daylight | skyline, daylight | Depends on framing — Big City Swagger only if confident/dominant | Cozy Cafe Mellow, Summer Beach Pop | Hip-Hop Night Drive automatically from "New York" alone | Exactly the case the STEP 2 cultural-context cleanup targets. |
| 25 | Beach selfie with fashion/editorial pose | beach + editorial pose | Trendy Pop Chic | Summer Beach Pop (if pose is candid, not posed) | — | Fashion/editorial framing outweighs the beach backdrop per the tie-breaker rule. |
| 26 | Indoor hotel window looking at ocean | window framing, ocean beyond | Summer Beach Pop (if openness dominates) or Cozy Cafe Mellow (if room dominates) | the other of the two | City Pop / Retro Drive (unless sunset) | Openness through the window vs. enclosed-room framing decides. |
| 27 | Empty bedroom with posters and daylight, no people | posters, daylight | Highteen Pop Room (if posters/teen decor clear) | Lo-fi Bedroom Solitude (if minimal/adult) | — | Posters+youthful decor vs plain minimal room. |
| 28 | Crowd at concert | crowd, performance | Ambiguous — depends on genre-coded cues (guitars → J-Rock Highway Rush, DJ/lights → Funk/Disco Night or Big City Swagger) | multiple, genre-cue-dependent | — | "Concert" alone is ambiguous; flagged in Red Flags. |
| 29 | Quiet library/study desk | solitary desk | Lo-fi Bedroom Solitude | Cozy Cafe Mellow (if warm daylight/public) | Highteen Pop Room (unless clearly teen study space) | Solitary desk stillness. |
| 30 | Mountain road at sunset | drive, sunset | City Pop / Retro Drive (if drive/glow dominates) or Indie Road Movie (if journey/departure dominates) | the other of the two | — | Sunset+drive vs open-road-journey framing decides. |
| 31 | Tunnel/highway motion blur | motion blur | J-Rock Highway Rush | American Alternative Drive (if aesthetic is casual/American) | Indie Road Movie | Motion blur is a hard speed signal, too fast for Indie Road Movie's wistful pace. |
| 32 | Mirror selfie in a glossy outfit | glossy fashion polish | Trendy Pop Chic | — | Highteen Pop Room, City Pop / Retro Drive | Glossy/modern editorial polish is the defining trigger. |
| 33 | Romantic dinner table | two people, intimate table | Modern Romance Pop | Cozy Cafe Mellow (if calm/daytime rather than romantic-glow) | Funk / Disco Night | Intimate couple framing over party energy. |
| 34 | Lonely late-night convenience store | solitary, night, still | K-R&B Night Drive | Lo-fi Bedroom Solitude (if very interior-focused) | Hip-Hop Night Drive | No motion/cruise present — solitary and still, not driving. |
| 35 | Old film street photo | sepia, film grain, street | Classic Soul / Old Film | — | City Pop / Retro Drive (unless clearly 80s-glossy) | Analog/sepia vs glossy-synth distinction. |
| 36 | Modern cafe with laptop | cafe, laptop | Cozy Cafe Mellow | Lo-fi Bedroom Solitude (if framing feels private/enclosed) | — | Public daylight cafe setting is the default read. |
| 37 | Dark underground club | dark, club | Ambiguous — Dark Heavy Hip-Hop (tense), Funk / Disco Night (warm/celebratory), or Neon Electronic Night (cool/futuristic) | multiple, tone-dependent | — | "Dark club" alone is ambiguous; color temperature and emotional tone must decide. Flagged in Red Flags. |
| 38 | Warm disco party | warm party lighting | Funk / Disco Night | — | Neon Electronic Night | Warm saturated party lighting is the defining cue, per the explicit conflict-resolver rule. |
| 39 | Blue-hour city walk | blue hour, ambiguous social context | K-R&B Night Drive (solo), Modern Romance Pop (couple), or Dream Pop / Shoegaze Fog (hazy/blurred) | multiple, context-dependent | — | Blue hour alone is ambiguous; social context and clarity/haze decide. Flagged in Red Flags. |
| 40 | Sunny poolside vacation | pool, sun, vacation | Summer Beach Pop | Trendy Pop Chic (if clearly editorial/fashion-posed) | City Pop / Retro Drive | Bright open-air water/sun energy, same principle as scenario #1. |

---

## Part 4 — Red Flags Before Deploy

Being honest about what's still not fully solved:

1. **K-R&B Night Drive vs Hip-Hop Night Drive is the hardest unresolved pair.** Both lanes describe near-identical visuals (car interior, night street, neon reflections). The actual differentiator — smooth/sensual R&B vocals vs. confident rap flow — is a *sonic* distinction, not something reliably visible in a static photo. The prompt now gives GPT the best available guidance (solo+lonely vs. confident+in-motion), but this pair will likely still get mixed up on genuinely ambiguous images.

2. **Big City Swagger Hip-Hop vs Hip-Hop Night Drive vs Dark Heavy Hip-Hop is a real three-way overlap.** All three involve night city scenes with cars/streets; the split depends on subtle emotional-tone reading (confident-luxury-stillness vs. confident-cruise-motion vs. aggressive-menace) that GPT may not always read consistently.

3. **Classic Soul / Old Film vs City Pop / Retro Drive both trade on "retro."** The distinction (decades-old sepia/analog vs. 80s glossy synth-color) is a fine-grained aesthetic-era judgment call. Ambiguous vintage-toned photos could still land on the wrong one of these two.

4. **Several scenarios are genuinely multi-valent, not solvable by better prompt wording alone** — concert crowds, dark clubs, and blue-hour city walks (rows 28, 37, 39 above) all depend on secondary cues (specific instruments/decor, color warmth, who's in frame) that a single photo may simply not show clearly. In these cases GPT's answer is a best-guess, not a guarantee.

5. **`avoidWhen` is prompt guidance, not a hard constraint.** Every lane now has 6 concrete `avoidWhen` entries naming a specific alternative lane, which is a big improvement over the original 3 generic entries — but it's still text an LLM is asked to follow, not something the backend enforces. There's no server-side check that verifies the chosen lane is actually consistent with its own `avoidWhen` list; the backend only checks that `primary_lane_id` is one of the 20 valid IDs.

6. **City Pop / Retro Drive is now the most heavily-guarded lane in the system** (named explicitly in 3 separate guard sections, the conflict resolver, and inside 3 other lanes' `avoidWhen` lists pointing away from it). This directly targets the reported over-selection bug, but it does raise a small risk of the opposite problem — City Pop could become mildly *under*-selected in genuinely ambiguous retro-adjacent cases that should still win it.

7. **Summer Beach Pop and Trendy Pop Chic should now win noticeably more often** for bright/open-air and fashion-forward images respectively — but this is **untested against real GPT-4o Vision output**. Everything in this review is reasoning about the prompt *text*, not measured behavior from actual API calls.

8. **There is no automated eval harness.** No test suite currently feeds real (or synthetic) sample images through `analyzeImage()` and checks which `primary_lane_id` comes back. This review can confirm the instructions are more specific and better differentiated than before, but it cannot guarantee GPT-4o Vision will comply perfectly, especially on edge cases. Building a small eval set (e.g. 20-40 representative test images with expected lane labels, run against the real endpoint) would be the natural next step to actually verify this instead of just reasoning about it.

---

*This document reflects the state of `gpt.ts` and `curationLanes.ts` at the time of writing. It is a review artifact only — it is not imported by any application code and has no effect on runtime behavior.*
