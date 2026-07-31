# Music Catalog Genre Classification — Report

**Status:** Offline editorial classification draft (Step 3-1). Review artifact only — not deployed, not wired into runtime code, no existing source file modified.

**Input:** `docs/music-catalog-stats-correction-draft.ts` (673 tracks, the final Step 2 correction-candidate catalog, unchanged).
**Output:** `docs/music-catalog-genre-classification-draft.ts` (673 tracks + new `genreClassification` object per track).
**Taxonomy:** `docs/music-genre-taxonomy.ts` (9 primary genres, 65 subgenres).
**Method:** Deterministic offline classification — track-level overrides for the 23 Step-2 special-attention tracks, curated per-artist overrides (real musical knowledge, ~110 artists covering ~48% of the catalog), then a subTag/moodTag evidence-weighted heuristic (cross-checked against legacy genre field + lane default) for the remainder. No audio analysis, no API calls, no web research, no use of numeric sound/atmosphere stats or image affinities as classification input.

---

## 1. Totals

- Total tracks classified: **673**
- Average genre confidence: **79.63**
- Tracks flagged `needsGenreReview`: **44** (6.5%)

## 2. Primary genre distribution

| Primary genre | Tracks | % |
|---|---:|---:|
| pop | 192 | 28.5% |
| rock | 150 | 22.3% |
| hip-hop | 116 | 17.2% |
| rnb-soul | 99 | 14.7% |
| jazz | 37 | 5.5% |
| folk-acoustic | 35 | 5.2% |
| funk-disco | 25 | 3.7% |
| electronic | 16 | 2.4% |
| ambient-experimental | 3 | 0.4% |

## 3. Subgenre distribution (all, sorted by size)

| Subgenre | Tracks |
|---|---:|
| pop/city-pop | 38 |
| pop/dance-pop | 38 |
| rnb-soul/classic-soul | 28 |
| rock/alternative-rock | 27 |
| rock/dream-pop | 27 |
| pop/soft-pop | 26 |
| hip-hop/lofi-hiphop | 26 |
| rock/j-rock | 25 |
| rnb-soul/k-rnb | 25 |
| hip-hop/trap | 24 |
| rock/indie-rock | 23 |
| pop/electropop | 23 |
| rnb-soul/alt-rnb | 22 |
| pop/indie-pop | 22 |
| hip-hop/k-hiphop | 18 |
| rock/k-indie-rock | 17 |
| pop/k-pop | 17 |
| rock/britpop | 16 |
| pop/bedroom-pop | 14 |
| rnb-soul/contemporary-rnb | 12 |
| folk-acoustic/indie-folk | 11 |
| folk-acoustic/singer-songwriter | 11 |
| hip-hop/mainstream-rap | 11 |
| funk-disco/disco-funk | 10 |
| folk-acoustic/folk-pop | 9 |
| funk-disco/disco | 9 |
| jazz/jazz-hop | 8 |
| hip-hop/alternative-hip-hop | 8 |
| hip-hop/east-coast-hip-hop | 8 |
| jazz/nu-jazz | 7 |
| jazz/acid-jazz | 7 |
| jazz/modern-jazz | 6 |
| rnb-soul/neo-soul | 6 |
| jazz/lounge-jazz | 6 |
| electronic/house | 6 |
| pop/teen-pop | 6 |
| rnb-soul/motown-soul | 6 |
| hip-hop/jazz-rap | 5 |
| hip-hop/cloud-rap | 5 |
| rock/pop-punk | 5 |
| rock/garage-rock | 4 |
| pop/j-pop | 4 |
| pop/synth-pop | 4 |
| rock/shoegaze | 4 |
| hip-hop/west-coast-hip-hop | 4 |
| electronic/tropical-house | 4 |
| hip-hop/melodic-rap | 3 |
| folk-acoustic/cinematic-folk | 3 |
| hip-hop/drill | 3 |
| electronic/progressive-house | 3 |
| funk-disco/classic-funk | 3 |
| funk-disco/nu-disco | 3 |
| jazz/bossa-nova | 3 |
| rock/power-pop | 2 |
| electronic/synthwave | 2 |
| ambient-experimental/ambient-electronic | 2 |
| folk-acoustic/americana | 1 |
| hip-hop/boom-bap | 1 |
| electronic/future-bass | 1 |
| ambient-experimental/lofi-ambient | 1 |

## 4. Crossover usage

- Tracks with **0** crossover genres: 121
- Tracks with **1** crossover genre: 480
- Tracks with **2** crossover genres: 70
- Tracks with **3** crossover genres: 2

Most-used crossover genres:

| Crossover genre | Uses |
|---|---:|
| disco-funk | 42 |
| alternative-rock | 35 |
| soft-pop | 34 |
| neo-soul | 26 |
| alt-rnb | 22 |
| dance-pop | 22 |
| synth-pop | 21 |
| trap | 19 |
| power-pop | 18 |
| indie-pop | 18 |
| dream-pop | 18 |
| americana | 18 |
| teen-pop | 17 |
| mainstream-rap | 16 |
| k-rnb | 15 |
| electropop | 14 |
| bedroom-pop | 14 |
| alternative-hip-hop | 13 |
| contemporary-rnb | 12 |
| motown-soul | 12 |
| indie-folk | 11 |
| classic-soul | 10 |
| melodic-rap | 10 |
| nu-disco | 10 |
| house | 10 |

## 5. Confidence bands

| Band | Tracks |
|---|---:|
| 90-100 | 78 |
| 80-89 | 164 |
| 70-79 | 407 |
| 60-69 | 19 |
| 50-59 | 5 |
| <50 | 0 |

## 6. Genre distribution by existing lane

**american-alternative-drive**: rock=28, folk-acoustic=1

**big-city-swagger-hiphop**: hip-hop=33

**city-pop-retro-glow**: pop=39, rock=1

**classic-soul-old-film**: rnb-soul=31, jazz=1

**cozy-cafe-mellow**: jazz=9, rnb-soul=9, pop=6, rock=1, folk-acoustic=1

**dark-heavy-hiphop**: hip-hop=25

**dream-pop-shoegaze-fog**: rock=28, pop=6, rnb-soul=1

**funk-disco-night**: funk-disco=24, pop=4, electronic=4, rnb-soul=2, jazz=1, hip-hop=1

**highteen-pop-room**: pop=25, rock=5

**hip-hop-night-drive**: hip-hop=28, rnb-soul=4

**indie-road-movie**: rock=25, folk-acoustic=20

**j-rock-highway-rush**: rock=30, pop=1

**k-indie-rainy-room**: rock=20, pop=6, folk-acoustic=3, rnb-soul=1

**k-rnb-night-drive**: rnb-soul=30

**lofi-bedroom-solitude**: hip-hop=27, ambient-experimental=3, rock=1, pop=1

**modern-jazz-groove**: jazz=26, hip-hop=2, rnb-soul=1, pop=1

**modern-romance-pop**: pop=18, rnb-soul=13, rock=2

**neon-electronic-night**: pop=22, electronic=7, rnb-soul=4, rock=2

**summer-beach-pop**: pop=14, folk-acoustic=5, rock=4, electronic=4, funk-disco=1, rnb-soul=1

**sunny-stroll-pop**: pop=21, folk-acoustic=5, rock=3, rnb-soul=2

**trendy-pop-chic**: pop=28, electronic=1

## 7. Lanes that split across many genres (≥3 distinct primary genres)

| Lane | Distinct primaries | Primaries |
|---|---:|---|
| summer-beach-pop | 6 | pop, rock, folk-acoustic, electronic, funk-disco, rnb-soul |
| funk-disco-night | 6 | funk-disco, pop, jazz, electronic, hip-hop, rnb-soul |
| cozy-cafe-mellow | 5 | jazz, rnb-soul, pop, rock, folk-acoustic |
| modern-jazz-groove | 4 | jazz, hip-hop, rnb-soul, pop |
| k-indie-rainy-room | 4 | rock, rnb-soul, pop, folk-acoustic |
| neon-electronic-night | 4 | rnb-soul, pop, electronic, rock |
| lofi-bedroom-solitude | 4 | hip-hop, rock, ambient-experimental, pop |
| sunny-stroll-pop | 4 | pop, folk-acoustic, rock, rnb-soul |
| dream-pop-shoegaze-fog | 3 | rock, pop, rnb-soul |
| modern-romance-pop | 3 | pop, rock, rnb-soul |

## 8. Genres that absorb tracks from many lanes (≥6 distinct lanes)

| Primary genre | Distinct lanes | Lanes |
|---|---:|---|
| pop | 14 | modern-jazz-groove, j-rock-highway-rush, k-indie-rainy-room, city-pop-retro-glow, dream-pop-shoegaze-fog, neon-electronic-night, highteen-pop-room, lofi-bedroom-solitude, modern-romance-pop, summer-beach-pop, funk-disco-night, trendy-pop-chic, cozy-cafe-mellow, sunny-stroll-pop |
| rock | 13 | j-rock-highway-rush, k-indie-rainy-room, city-pop-retro-glow, indie-road-movie, american-alternative-drive, dream-pop-shoegaze-fog, neon-electronic-night, highteen-pop-room, lofi-bedroom-solitude, modern-romance-pop, summer-beach-pop, cozy-cafe-mellow, sunny-stroll-pop |
| rnb-soul | 12 | modern-jazz-groove, hip-hop-night-drive, k-rnb-night-drive, k-indie-rainy-room, dream-pop-shoegaze-fog, neon-electronic-night, modern-romance-pop, summer-beach-pop, funk-disco-night, classic-soul-old-film, cozy-cafe-mellow, sunny-stroll-pop |
| hip-hop | 6 | modern-jazz-groove, hip-hop-night-drive, big-city-swagger-hiphop, lofi-bedroom-solitude, funk-disco-night, dark-heavy-hiphop |
| folk-acoustic | 6 | k-indie-rainy-room, indie-road-movie, american-alternative-drive, summer-beach-pop, cozy-cafe-mellow, sunny-stroll-pop |

## 9. Very small subgenres (≤3 tracks, in-use)

| Subgenre | Tracks |
|---|---:|
| hip-hop/melodic-rap | 3 |
| folk-acoustic/cinematic-folk | 3 |
| hip-hop/drill | 3 |
| electronic/progressive-house | 3 |
| funk-disco/classic-funk | 3 |
| funk-disco/nu-disco | 3 |
| jazz/bossa-nova | 3 |
| rock/power-pop | 2 |
| electronic/synthwave | 2 |
| ambient-experimental/ambient-electronic | 2 |
| folk-acoustic/americana | 1 |
| hip-hop/boom-bap | 1 |
| electronic/future-bass | 1 |
| ambient-experimental/lofi-ambient | 1 |

Unused taxonomy subgenres (defined, but zero tracks classified into them this pass): art-pop, deep-house, boogie, downtempo, cinematic-ambient

## 10. Oversized subgenres (≥30 tracks)

| Subgenre | Tracks |
|---|---:|
| pop/city-pop | 38 |
| pop/dance-pop | 38 |

## 11. Tracks whose genre conflicts with existing (legacy) metadata

95 of 673 tracks were assigned a primaryGenre different from what the legacy broad `genre` field (lane-disambiguated) would suggest. This is expected — the legacy 8-value field predates genre-first design and conflates categories (e.g. `jazz-funk` covers both jazz and funk-disco; `ambient-dream` covers both dream-pop/shoegaze rock and true instrumental ambient electronic). Sample (first 30):

| Track | Artist | Legacy genre | Lane | Legacy-expected primary | Assigned primary/subgenre | Confidence |
|---|---|---|---|---|---|---:|
| Navajo | Masego | hip-hop | modern-jazz-groove | hip-hop | jazz/acid-jazz | 83 |
| Gunjou Biyori | Tokyo Jihen | jazz-funk | j-rock-highway-rush | jazz | rock/j-rock | 83 |
| FANTASISTA | Dragon Ash | hip-hop | j-rock-highway-rush | hip-hop | rock/alternative-rock | 83 |
| Kaiju no Hanauta | Vaundy | rock | j-rock-highway-rush | rock | pop/j-pop | 62 |
| Jasmine | DPR LIVE | hip-hop | hip-hop-night-drive | hip-hop | rnb-soul/k-rnb | 76 |
| Martini Blue | DPR LIVE | hip-hop | hip-hop-night-drive | hip-hop | rnb-soul/k-rnb | 76 |
| Hold On, We're Going Home | Drake feat. Majid Jordan | hip-hop | hip-hop-night-drive | hip-hop | rnb-soul/alt-rnb | 67 |
| Ling Ling | The Black Skirts | pop | k-indie-rainy-room | pop | rock/k-indie-rock | 76 |
| Everything | The Black Skirts | pop | k-indie-rainy-room | pop | rock/k-indie-rock | 76 |
| Gondry | HYUKOH | pop | k-indie-rainy-room | pop | rock/k-indie-rock | 80 |
| For Lovers Who Hesitate | JANNABI | pop | k-indie-rainy-room | pop | rock/k-indie-rock | 78 |
| A Thought on an Autumn Night | JANNABI | pop | k-indie-rainy-room | pop | rock/k-indie-rock | 78 |
| 하루종일 | george | pop | k-indie-rainy-room | pop | rnb-soul/k-rnb | 78 |
| Tree | Car, the Garden | pop | k-indie-rainy-room | pop | rock/dream-pop | 74 |
| Home Sweet Home | Car, the Garden | pop | k-indie-rainy-room | pop | rock/dream-pop | 74 |
| seasons | wave to earth | pop | k-indie-rainy-room | pop | rock/dream-pop | 74 |
| bad | wave to earth | pop | k-indie-rainy-room | pop | rock/dream-pop | 74 |
| 보편적인 노래 | Broccoli, you too | pop | k-indie-rainy-room | pop | folk-acoustic/indie-folk | 74 |
| 앵콜요청금지 | Broccoli, you too | pop | k-indie-rainy-room | pop | folk-acoustic/indie-folk | 74 |
| To My Youth | BOL4 | pop | k-indie-rainy-room | pop | folk-acoustic/indie-folk | 78 |
| Run With Me | sunwoojunga | pop | k-indie-rainy-room | pop | rock/k-indie-rock | 71 |
| White night | Zitten | pop | k-indie-rainy-room | pop | rock/k-indie-rock | 71 |
| Wasurerarenaino | Sakanaction | pop | city-pop-retro-glow | pop | rock/j-rock | 72 |
| Chateau | Angus & Julia Stone | pop | indie-road-movie | pop | folk-acoustic/indie-folk | 82 |
| Dakota | Stereophonics | pop | indie-road-movie | pop | rock/britpop | 76 |
| Maybe Tomorrow | Stereophonics | rnb-soul | indie-road-movie | rnb-soul | rock/britpop | 76 |
| One Day Like This | Elbow | pop | indie-road-movie | pop | rock/britpop | 76 |
| Obstacle 1 | Interpol | pop | american-alternative-drive | pop | rock/alternative-rock | 83 |
| Feel It Still | Portugal. The Man | pop | american-alternative-drive | pop | rock/indie-rock | 71 |
| Outro | M83 | pop | dream-pop-shoegaze-fog | pop | rock/dream-pop | 70 |

_(95 total; full list in the JSON report.)_

## 12. Artist-level inconsistencies

2 artists (with 2+ catalog tracks) have tracks spread across more than one primary genre. Most are legitimate (genre-fluid artists, or a Feat.-collaboration pulling identity a different direction) — flagged here for visibility, not all are errors. Sample (first 20, by track count):

| Artist | Tracks | Primaries used |
|---|---:|---|
| Laufey | 2 | jazz, pop |
| Billie Eilish | 2 | rock, pop |

_(2 total; full list with per-track breakdown in the JSON report.)_

## 13. Duplicate / near-duplicate taxonomy labels (raw tag variants normalized to one canonical subgenre)

The source catalog's legacy subTags contained ~794 unique free-text labels; the taxonomy's alias table normalizes the genre-bearing ones down to 74 canonical subgenres (mood/scene-only tags like "midnight", "romantic", "road-trip" are excluded entirely as non-genre signal). Canonical subgenres with 3+ raw variants collapsing into them:

| Canonical subgenre | Raw variants collapsed into it |
|---|---|
| trap | atlanta-rap, trap-lite, southern-rap, dark-hiphop, dark-pop-rap, hard-rap, mainstream-heavy, modern-hiphop, modern-rap, dark-rap, dark-swagger, dark-street, dark-energy, dark-night, night-heavy, heavy-rap, anthemic-rap, industrial-rap, metro-boomin, street-rap, street-flex, street-bounce, street-youth, crew-track, urban-swagger, modern-swagger, producer-rap, trap-pop, heavy-energy, heavy-bass, bass-heavy, city-party, night-rap |
| alternative-rock | arena-rock, blues-rock, post-punk, post-punk-revival, post-grunge, grunge, psychedelic-rock, slacker-rock, art-rock, desert-rock, stadium-rock, stadium-alternative, southern-alt-rock, rap-rock, pop-rock, pop-rock-rush, melodic-rock, modern-rock, classic-modern-rock, classic-alternative, modern-classic, emo-rock, mixture-rock, urban-rock, cinematic-rock, heavy-drive, slow-rock, emotional-rock, emotional-release, emo-x |
| soft-pop | piano-pop, sunshine-pop, jazz-pop, duet-pop, morning-cafe, mellow-duet, romantic-cafe, brunch-cafe, cozy-romance, 90s-pop, blues-pop, mellow-cafe, old-cafe, cafe-pop, cafe-romance, classic-cafe, soft-sunshine, story-pop, warm-pop, jazzy-pop, cinematic-pop, heartbreak-pop, breakup-pop, romance-pop, soft-romance, soft-ballad, emotional-pop, spring-pop, daylight-pop |
| disco-funk | modern-funk, city-funk, smooth-funk, bedroom-funk, party-funk, soft-funk, funk-pop, bassline-pop, daylight-groove, playful-groove, brass-pop, night-funk, sleek-groove, cosmic-groove, luxury-groove, elegant-groove, chic-groove, chic-pop, smooth-chic, soft-chic, urban-groove, night-groove, midnight-groove, summer-groove, sunny-groove, driving-groove, bass-groove, positive-groove, feel-good-groove |
| dance-pop | dancefloor-pop, global-pop, afro-pop, beach-pop, beach-anthem, party-pop, club-chic, fashion-pop, trend-pop, trendy-pop, attitude-pop, performance-pop, solo-pop, confidence-pop, sunny-pop, groove-pop, fresh-chic, fresh-pop, modern-chic, dance-night, modern-pop, breakup-anthem, revenge-pop, flirty-pop, playful-breakup, playful-pop, party-drama, feel-good-pop, color-pop |
| teen-pop | bright-pop, girly-pop, highteen-pop-rock, teen-pop-rock, cute-pop, queer-pop, bubbly-pop, youth-pop, teen-crush, crush-anthem, highschool-crush, highschool-drama, highschool-feelings, relationship-drama, soft-highteen, stylish-teen, teen-angst, teen-romance, modern-highteen, highteen-party, highteen-rebel, highteen-romance, 2000s-highteen, young-pop, teen-melancholy, bright-highteen |
| dream-pop | dream-pop-adjacent, ethereal-pop, cosmic-pop, hazy-pop, dreamy-pop, synth-dream, ambient-pop, west-coast-haze, heat-haze, wide-haze, moody-drive, cinematic-fog, cinematic-haze, cinematic-night, retro-haze, soft-haze, soft-drive, blue-haze, hazy-night, hazy-pop-x, desert-dream, surreal-drive, dream-drive, slow-dream, glowing-pop |
| classic-soul | vocal-soul, southern-soul, blues-soul, smooth-soul, soul-pop, piano-soul, northern-soul, doo-wop, oldies, bright-oldies, diva-soul, classic-pop-soul, classic-love, grand-romance, deep-love, dramatic-love, blue-eyed-soul, old-romance, old-film-energy, cinematic-classic, classic-romance, wedding-romance, classic-urban |
| alt-rnb | lofi-rnb, soft-rnb, mellow-rnb, dark-rnb, groove-rnb, minimal-rnb, smooth-rnb, trap-rnb, rnb-rap, rap-rnb, hiphop-rnb, dream-rnb, late-night-feelings, late-night-text, loner-cruise, dark-cruise, minimal-groove, alt-pop-rnb, rainy-rnb, urban-grit, dark-groove |
| power-pop | guitar-pop, surf-pop, sunny-rock, youth-pop-rock, blue-sky-rock, bright-pop-rock, west-coast-pop, surf-rock, ska-pop, beach-rock, teenage-drive, suburban-drive, freedom-drive, youth-rush, youth-drive, youth-anthem, youth-rock, youth-escape, youth-release, harmony-rock |
| lofi-hiphop | chillhop, instrumental-hiphop, lofi-beats, jazzy-beats, piano-beats, study-beats, study-loop, cozy-study, late-night-study, soulful-lofi, dusty-beats, bedroom-night, bedroom-solitude, winter-beats, sleepy-beats, chill-beats, minimal-beat |
| contemporary-rnb | newjack-pop, rnb-pop, rnb-dance, pop-rnb, romantic-rnb, smooth-cruise, urban-ballad, urban-cool, urban-drive, urban-night, urban-pop, urban-rnb, urban-style, urban-glow, smooth-night |
| mainstream-rap | swagger-rap, fashion-rap, confidence-rap, technical-rap, luxury-rap, big-city-flex, late-night-luxury, cruising-rap, swagger, swagger-groove, swagger-drive, city-anthem, cool-rap, rap |
| neo-soul | acoustic-soul, neo-soul-jazz, funk-soul, soul-rnb, jazz-soul, psychedelic-soul, groove-soul, minimal-soul, cafe-soul, romantic-groove, warm-groove, vocal-groove, soulful-x |
| city-pop | japanese-city-pop, modern-city-pop, k-city-pop, city-pop-adjacent, classic-city-pop, dark-city-pop, sophisti-pop, retro-pop, retro-romance, retro-summer, modern-retro, k-city-pop-x, soft-retro |
| indie-rock | college-rock, heartland-indie, rainy-indie, sad-indie, dreamy-indie, retro-indie, autumn-indie, winter-indie, indie-classic, emo-indie, melancholy-drive, youth-nostalgia, rainy-road |
| lofi-ambient | synth-lofi, lofi-synth, ambient-lofi, study-focus, calm-focus, peaceful-study, quiet-drift, quiet-focus, quiet-solitude, night-solitude, calm-beats, quiet-room, cozy-room |
| disco | dance-classic, dancefloor-classic, classic-groove, 80s-groove, 80s-night, elegant-disco, boogie-night, feel-good-disco, freedom-anthem, night-strut, elegant-night, club-classic, retro-groove |
| americana | alt-country, americana-drive, heartland-drive, heartland-punk, road-riff, road-anthem, road-rock, road-rush, highway-rock, drive-anthem, nature-drive, country-pop |
| acid-jazz | funk-jazz, jazz-funk, smooth-jazz-pop, smooth-jazz-soul, modern-fusion, guitar-groove, broken-beat, jazz-rock, sax-groove, sax-pop, modern-groove |
| folk-pop | island-pop, beach-folk, acoustic-pop, soft-acoustic, ocean-pop, soft-beach, soft-summer, travel-pop, sunset-folk, road-pop |
| shoegaze | shoegaze-rock, shoegaze-adjacent, modern-shoegaze, classic-shoegaze, ambient-rock, heavy-dream, hazy-vocal, slowcore, fuzzy-dream |
| bedroom-pop | minimal-pop, sad-pop, internet-pop, nostalgia-core, viral-sad, soft-loneliness, teenage-room, moody-room, rainy-pop |
| alternative-hip-hop | conscious-rap, gospel-rap, grime, uk-rap, cinematic-rap, cinematic-hiphop, alt-rap, alternative-rap |
| ambient-electronic | indie-electronic, dream-electronic, bedroom-calm, soft-focus, soft-morning, misty-morning, instrumental, minimal |

## 14. Potentially inconsistent / weakly-supported classifications (confidence < 65)

| Track | Artist | Assigned | Confidence | Reason |
|---|---|---|---:|---|
| Ain't No Rest for the Wicked | Cage The Elephant | rock/alternative-rock | 58 | [tag-derived] no genre-bearing subtags found; fell back to legacy genre 'rock' + lane default (american-alternative-drive). |
| You Belong With Me | Taylor Swift | pop/soft-pop | 58 | [artist-knowledge] Catalog spans pop, country and indie-folk eras; track-level identity genuinely varies, defaulted conservatively. |
| 22 | Taylor Swift | pop/soft-pop | 58 | [artist-knowledge] Catalog spans pop, country and indie-folk eras; track-level identity genuinely varies, defaulted conservatively. |
| Lover | Taylor Swift | pop/soft-pop | 58 | [artist-knowledge] Catalog spans pop, country and indie-folk eras; track-level identity genuinely varies, defaulted conservatively. |
| Style | Taylor Swift | pop/soft-pop | 58 | [artist-knowledge] Catalog spans pop, country and indie-folk eras; track-level identity genuinely varies, defaulted conservatively. |
| Kaiju no Hanauta | Vaundy | pop/j-pop | 62 | [artist-knowledge] Genre-fluid modern Japanese artist moving between J-pop, rock and R&B; track-level identity varies. |
| Tokyo Flash | Vaundy | pop/j-pop | 62 | [artist-knowledge] Genre-fluid modern Japanese artist moving between J-pop, rock and R&B; track-level identity varies. |
| Santeria | Sublime | rock/alternative-rock | 62 | [artist-knowledge] Ska-punk/reggae-rock hybrid the taxonomy has no dedicated bucket for; filed under alternative-rock with a funk/groove crossover as the closest fit. |

## 15. Limitations

- This is an offline editorial draft; no audio was analyzed.
- No external music database (Spotify, MusicBrainz, Last.fm, YouTube) or LLM/API call was used to classify tracks.
- Some modern hybrid/genre-fluid tracks (Taylor Swift, Harry Styles, M83, Tame Impala, Lana Del Rey, Billie Eilish, Sakanaction, Vaundy) remain genuinely subjective and are conservatively flagged `needsGenreReview` rather than guessed with false confidence.
- User review is required before this draft replaces or deletes any part of the canonical catalog.
- Step 3-2 (wiring genre into runtime/playlist logic) has not begun.
