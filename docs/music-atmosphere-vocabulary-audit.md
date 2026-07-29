# VibeScene Music Atmosphere Vocabulary Audit

**Audit type:** Read-only investigation. No source files were modified, staged, committed, or pushed. No final atmosphere schema was designed. No new per-track stats were generated. No lane IDs, catalog data, or GPT prompt text were changed.
**Scope:** Evidence inventory of the existing track-tag vocabulary (`moodTags`/`sceneTags`/`subTags`/`energy` in `musicCatalog.ts`), the GPT STEP 3.5 visual-profile framework (`gpt.ts`), the lane-definition vocabulary (`curationLanes.ts`), and the overlap/redundancy/gaps between them — as evidence for a future shared image↔track atmosphere-stat schema.
**Built on:** `docs/music-system-audit.md` / `docs/music-system-audit.json` (prior read-only audit). Every load-bearing claim below was re-verified directly against source in this investigation rather than assumed from that summary.
**Method note:** The 701-track catalog and 21 lane definitions were parsed programmatically (brace-matched object extraction) rather than counted by hand, to guarantee completeness. Semantic categorization of the 1,485 unique tag values used a keyword-substring heuristic (documented in §C and in the JSON companion file) — it is a first-pass evidence tool, not a manually verified linguistic classification. Confidence levels reported per tag reflect this: **high** = the tag is an exact/near-exact core term for its matched category; **medium** = a compound/derived form matched by substring, or the tag matched more than one category; **low ("unclear")** = no confident keyword match was found.
**Incident during this investigation:** An early version of the lane-vocabulary extraction script had an off-by-one argument-index bug that caused it to write its JSON output over the actual source file `supabase/functions/analyze-and-search/services/curationLanes.ts` — twice, before the bug was found and fixed. Both times this was caught immediately via `git status`/`git diff --stat` and reverted with `git checkout -- <file>`, restoring the file byte-for-byte (727 lines, verified via `git diff --stat` showing no residual diff) before any further work continued. No other file was affected. This is disclosed here in full per the "no assumptions, evidence first" instruction governing this audit; see §P.

---

## A. Executive summary

- **Unique `moodTags`:** 259 unique string values across 701 tracks (2,103 total occurrences — every one of the 701 tracks has exactly 3 `moodTags`, no exceptions).
- **Unique `sceneTags`:** 415 unique string values (2,103 total occurrences — exactly 3 per track, 701/701).
- **Unique `subTags`:** 811 unique string values (2,103 total occurrences — exactly 3 per track, 701/701, even though the TypeScript type marks `subTags` as optional).
- **Current energy distribution:** low 165 (23.5%), medium 354 (50.5%), high 182 (26.0%). One lane (`lofi-bedroom-solitude`) is 100% low-energy (35/35); ten of the twenty-one lanes contain **zero** tracks of at least one energy level (e.g. `j-rock-highway-rush` has 0 low, `city-pop-retro-glow` has 0 high, `dark-heavy-hiphop` has 0 low) — see §B.
- **STEP 3.5 dimensions found in the GPT prompt:** 14, extracted verbatim from `gpt.ts:118-133` (Scene/subject, Weather feeling, Brightness, Saturation, Contrast, Color temperature, Dominant palette, Light quality, Texture/finish, Visual density, Composition energy, Openness, Motion, Social context). None of the 14 are ever included in the GPT JSON output, stored, or used by selection logic — the prompt says so explicitly (`gpt.ts:114-116`, "internal reasoning only... never output it directly").
- **Strongest overlap areas:** `moodTags` and STEP 3.5's implicit "composition energy"/"emotional tone" reasoning cover very similar ground (confident, playful, tense, romantic, nostalgic) but in incompatible forms — one is a fixed per-track string list, the other is discarded LLM reasoning. `sceneTags` and STEP 3.5's "Scene/subject" + "Openness" + "Social context" also overlap conceptually (both describe *where* and *with whom*) but again in incompatible, non-joinable forms.
- **Biggest redundancy problem:** `subTags` is overwhelmingly a **genre/micro-genre field, not an atmosphere field** — 253 of 811 unique values (48% of all 2,103 occurrences, weighted by frequency) heuristically categorize as `genre`. This duplicates `music_profile.primary_genre`/`secondary_genre` from the GPT side under a different name and structure, and is the single largest source of "this looks like atmosphere data but isn't" risk for a naive schema-reuse plan.
- **Biggest missing dimensions:** No catalog tag or lane field distinguishes narrow seasonal ranges (no "early/late" anything; almost the entire season vocabulary is "summer" in various compounds — 1 `spring`, 1 `autumn`, 0 `winter` as a standalone weather/season word). No tag anywhere in the catalog contains `storm`, `snow`, `clear`, `overcast`, or `humid`. Weather is present only as `rain`/`rainy` (11 lanes touch it) and `sunny` (8 lanes) plus scattered `haze`/`fog` — a binary-ish "rainy vs. sunny vs. hazy" vocabulary, not a real weather taxonomy. See §I.
- **Most important warning before automated stat generation:** duplicate copies of the *literal same recording* (same `youtubeVideoId`) carry **different energy, moodTags, sceneTags, and subTags depending on which lane they were filed under** — e.g. "Feather" by Nujabes (`hQ5x8pHoIPA`) is `energy: "medium"` with tags `["nostalgic","jazzy","reflective"]` in `modern-jazz-groove`, but `energy: "low"` with tags `["gentle","reflective","airy"]` in `lofi-bedroom-solitude`. Of the 22 duplicate-`youtubeVideoId` groups, 2 differ in `energy`, 16 differ in `moodTags`, 18 differ in `sceneTags`, and 21 of 22 differ in `subTags`. This is direct, repository-internal proof that the existing tag vocabulary encodes **"how this track was written up to justify its lane"**, not an inherent, lane-independent property of the recording itself. Any automated stat-generation process that treats these tags as ground truth about the *track* rather than about *the lane's narrative for that track* will silently inherit this bias. See §H, §N.

---

## B. Tag-field statistics

### B.1 Coverage (all fields, all 701 tracks)

| Field | Tracks with field | Empty values | Total occurrences | Unique values | Avg per track |
|---|---|---|---|---|---|
| `energy` | 701/701 (100%) | 0 | 701 | 3 (`low`/`medium`/`high`) | 1.00 |
| `moodTags` | 701/701 (100%) | 0 | 2,103 | 259 | 3.00 |
| `sceneTags` | 701/701 (100%) | 0 | 2,103 | 415 | 3.00 |
| `subTags` | 701/701 (100%) | 0 | 2,103 | 811 | 3.00 |

No track has an empty array or a missing field for any of the four. (This matches `docs/music-system-audit.md` §D's earlier finding of 0 missing/empty values — re-confirmed here field-by-field.) No casing variants and no plural-form pairs were found in any of the three tag fields (e.g. no `"Warm"` vs `"warm"`, no `"drive"` vs `"drives"`). Three literal near-duplicate spelling pairs were found automatically: `sceneTags` `"night-club"` vs `"nightclub"`; `subTags` `"electro-pop"` vs `"electropop"`; `sceneTags` `"blurred-light"` vs `"blurred-lights"`.

### B.2 `energy` distribution

| Energy | Count | % of 701 |
|---|---|---|
| low | 165 | 23.5% |
| medium | 354 | 50.5% |
| high | 182 | 26.0% |

**By lane** (all 21 lanes; `total` always sums to the lane's track count):

| Lane ID | low | medium | high | total | Note |
|---|---|---|---|---|---|
| modern-jazz-groove | 6 | 24 | 0 | 30 | 0 high |
| j-rock-highway-rush | 0 | 3 | 28 | 31 | 0 low |
| hip-hop-night-drive | 3 | 22 | 7 | 32 | |
| k-rnb-night-drive | 12 | 18 | 0 | 30 | 0 high |
| k-indie-rainy-room | 19 | 11 | 0 | 30 | 0 high |
| city-pop-retro-glow | 4 | 36 | 0 | 40 | 0 high |
| indie-road-movie | 15 | 27 | 3 | 45 | |
| american-alternative-drive | 0 | 14 | 16 | 30 | 0 low |
| dream-pop-shoegaze-fog | 17 | 19 | 0 | 36 | 0 high |
| big-city-swagger-hiphop | 0 | 18 | 16 | 34 | 0 low |
| neon-electronic-night | 0 | 17 | 18 | 35 | 0 low |
| highteen-pop-room | 2 | 10 | 18 | 30 | |
| **lofi-bedroom-solitude** | **35** | **0** | **0** | **35** | **single-energy lane: 100% low** |
| modern-romance-pop | 15 | 18 | 2 | 35 | |
| summer-beach-pop | 2 | 16 | 13 | 31 | |
| funk-disco-night | 0 | 11 | 27 | 38 | 0 low |
| trendy-pop-chic | 0 | 23 | 7 | 30 | 0 low |
| classic-soul-old-film | 18 | 14 | 0 | 32 | 0 high |
| cozy-cafe-mellow | 17 | 13 | 0 | 30 | 0 high |
| dark-heavy-hiphop | 0 | 16 | 17 | 33 | 0 low |
| sunny-stroll-pop | 0 | 24 | 10 | 34 | 0 low |

**Findings:**
- `lofi-bedroom-solitude` is the only lane with a single energy value present (100% low). This makes sense narratively (the lane is *defined* as low-energy) but means the `energy` field carries **zero discriminating information within that lane** — any track selection or sequencing logic that relies on `energy` variance inside this lane has nothing to work with.
- Ten of twenty-one lanes have **zero** tracks at one energy extreme (no `low` in 7 lanes: `j-rock-highway-rush`, `american-alternative-drive`, `big-city-swagger-hiphop`, `neon-electronic-night`, `funk-disco-night`, `trendy-pop-chic`, `dark-heavy-hiphop`, `sunny-stroll-pop` — that's actually 8; no `high` in 6 lanes: `modern-jazz-groove`, `k-rnb-night-drive`, `k-indie-rainy-room`, `city-pop-retro-glow`, `dream-pop-shoegaze-fog`, `classic-soul-old-film`, `cozy-cafe-mellow` — that's 7). This confirms `energy` in the current system is being used as a **lane-consistent narrative signal** (every lane has a designed-in energy "shape") rather than as an independent measurement — which is exactly what `sequencing.ts`'s design comments assume (see `docs/music-system-audit.md` §F step 8).
- **Duplicate-track energy conflicts:** of the 22 duplicate-`youtubeVideoId` groups, 2 have differing `energy` values across their copies — "Feather" (Nujabes, `hQ5x8pHoIPA`): `medium` in `modern-jazz-groove` vs. `low` in `lofi-bedroom-solitude`; "Walking On A Dream" (Empire of the Sun, `eimgRedLkkU`): `medium` in `neon-electronic-night` vs. `high` in `summer-beach-pop`. Both are the *exact same recording*. See §H for full detail.
- **Energy vs. tags consistency:** spot-checking against the moodTag/sceneTag data (§N sample), energy generally "reads" consistently with mood language within a single copy of a track (e.g. `lofi-bedroom-solitude` copies pair `low` energy with `gentle`/`calm`/`solitary`-type moodTags), but as shown above, the *same* recording gets a different energy reading depending on lane — so "consistency" here is consistency with the lane's narrative, not an inherent property being checked twice.
- **Limitations of the 3-level system:** `low`/`medium`/`high` cannot express the within-lane variation that GPT's `music_profile.energy_score` (1-5) or `sequencing.ts`'s `STAGE_TARGET_ENERGY` array (which uses decimal targets like `1.3`, `1.5`, `2.3`, `3` explicitly *because* 3 discrete levels aren't granular enough for a 6-stage arc) already have to work around. `sequencing.ts:26-30`'s `energyScore()` maps `low→1, medium→2, high→3` internally specifically to get arithmetic distance out of the enum — i.e. the code already treats the 3-level field as an approximation of a continuous scale, not as a true category system.

### B.3 GPT `music_profile.energy_score` (1-5) vs. catalog `energy` (low/medium/high)

| | Catalog `energy` | GPT `music_profile.energy_score` |
|---|---|---|
| Prompt definition | n/a (catalog-only field, no prompt) | `gpt.ts:99-104`: 1=ambient/barely-there, 2=calm/introspective, 3=mellow/balanced, 4=groovy/engaging, 5=energetic/upbeat |
| Expected meaning | Per-track playlist-sequencing signal | "expected MUSICAL intensity" of the *image-implied* target, explicitly distinguished in-prompt from raw visual brightness (`gpt.ts:106`) |
| Generated by | Manually authored per catalog track (no generation process documented in repo) | GPT-4o at inference time, combining STEP 2 mood/emotion + STEP 3.5 visual profile |
| Stored | `CatalogSeedTrack.energy` in `musicCatalog.ts` (source file, not DB) | `playlists.energy_score` column (`db.ts:133`) |
| Used | `sequencing.ts` (`STAGE_TARGET_ENERGY` matching, `sequencePlaylistArc`, anchor eligibility) | Constrains GPT's *own* fallback track picks only ("All 10 songs must stay within ±1 of the energy score," `gpt.ts:108`) — **not read by `selectCatalogTracks`/`selectVerifiedCatalogTracks`/`sequencing.ts`, confirmed by grep: no reference to `energy_score` outside `gpt.ts` and `db.ts`'s storage code** |
| Mapping code | None found. `sequencing.ts:26-30` converts the catalog enum to a 1/2/3 integer scale internally, but this is a local conversion for arc-distance math, not a mapping to/from `energy_score` |
| Semantic mismatch example | A track catalogued as `energy: "high"` in `dark-heavy-hiphop` (e.g. "Superhero" — Metro Boomin/Future/Chris Brown is `medium`, but siblings in that lane run to `high`) sits on a 3-point scale; GPT's 1-5 scale for the *same conceptual intensity* has no code path that would ever compare the two, so there is no way today to verify that a `high` catalog track and a `4`-`5` GPT `energy_score` image actually mean the same musical intensity — they are simply never brought into contact. |

**Conclusion:** two structurally different, never-reconciled energy systems exist in the repo today; unifying them is listed as a "strong shared candidate" concept in §M but requires an explicit mapping decision, not just a rename.

---

## C. Complete vocabulary inventory (method + top values; full data in the JSON companion)

Given 259 + 415 + 811 = 1,485 unique tag values across the three fields, this section presents **top-frequency tables** (sufficient to see the shape of the vocabulary) plus the **heuristic category-distribution** used to classify all 1,485 values. The full per-tag inventory (every unique value, its exact frequency, distinct-track count, distinct-lane count, lane ID list, up to 3 representative tracks, heuristic semantic category tags, near-duplicate flags, and a confidence score) is in `docs/music-atmosphere-vocabulary-audit.json` under `moodTagVocabulary` / `sceneTagVocabulary` / `subTagVocabulary` (1,485 entries total).

### C.1 `moodTags` — top 30 by frequency (of 259 unique)

| Value | Freq | % of 701 tracks | Distinct lanes |
|---|---|---|---|
| romantic | 90 | 12.8% | 14 |
| warm | 76 | 10.8% | 15 |
| smooth | 68 | 9.7% | 13 |
| soft | 61 | 8.7% | 14 |
| nostalgic | 59 | 8.4% | 14 |
| bright | 54 | 7.7% | 13 |
| youthful | 49 | 7.0% | 10 |
| confident | 40 | 5.7% | 10 |
| cool | 40 | 5.7% | 12 |
| dreamy | 39 | 5.6% | 12 |
| lonely | 37 | 5.3% | 9 |
| dark | 36 | 5.1% | 9 |
| playful | 33 | 4.7% | 11 |
| glossy | 30 | 4.3% | 8 |
| glowing | 29 | 4.1% | 11 |
| breezy | 28 | 4.0% | 9 |
| bittersweet | 27 | 3.9% | 10 |
| cinematic | 27 | 3.9% | 9 |
| night | 27 | 3.9% | 9 |
| stylish | 27 | 3.9% | 8 |
| emotional | 26 | 3.7% | 9 |
| sleek | 24 | 3.4% | 6 |
| gentle | 23 | 3.3% | 8 |
| groovy | 23 | 3.3% | 7 |
| reflective | 22 | 3.1% | 8 |
| wide | 22 | 3.1% | 7 |
| hazy | 21 | 3.0% | 9 |
| slick | 21 | 3.0% | 6 |
| sweet | 21 | 3.0% | 8 |
| restless | 20 | 2.9% | 8 |

156 of 259 unique moodTags (60%) occur across ≥5 distinct lanes — i.e. the *majority* of the moodTag vocabulary is generic mood adjective language reused broadly across the catalog, not lane-specific. **106 moodTags (41%) occur only once (hapax legomena)** — a long tail of one-off descriptive words. See §C.4 for the semantic category breakdown.

### C.2 `sceneTags` — top 30 by frequency (of 415 unique)

| Value | Freq | % of 701 tracks | Distinct lanes |
|---|---|---|---|
| night-drive | 106 | 15.1% | 12 |
| city-lights | 76 | 10.8% | 15 |
| city-night | 65 | 9.3% | 11 |
| city | 62 | 8.8% | 21 |
| neon | 53 | 7.6% | 12 |
| bedroom | 49 | 7.0% | 8 |
| night-room | 47 | 6.7% | 8 |
| night-city | 39 | 5.6% | 12 |
| window | 39 | 5.6% | 14 |
| daylight | 33 | 4.7% | 12 |
| date-night | 32 | 4.6% | 6 |
| late-night | 28 | 4.0% | 11 |
| cafe | 27 | 3.9% | 6 |
| motion | 26 | 3.7% | 8 |
| friends | 25 | 3.6% | 6 |
| street | 25 | 3.6% | 12 |
| blue-sky | 22 | 3.1% | 6 |
| memory | 21 | 3.0% | 8 |
| sunset | 21 | 3.0% | 11 |
| lounge | 20 | 2.9% | 4 |
| rainy-window | 20 | 2.9% | 6 |
| city-window | 19 | 2.7% | 5 |
| fashion | 18 | 2.6% | 2 |
| coast-road | 17 | 2.4% | 3 |
| club | 16 | 2.3% | 5 |
| open-road | 15 | 2.1% | 5 |
| road-trip | 14 | 2.0% | 3 |
| dancefloor | 14 | 2.0% | 2 |
| highway | 14 | 2.0% | 5 |
| sunny-street | 14 | 2.0% | 5 |

`city` (bare) appears in **all 21 lanes** — the single least-discriminating value in the entire vocabulary. See §J for the full object/scene-bias analysis of `city` and similar terms. 61 of 415 unique sceneTags (15%) are single-occurrence.

### C.3 `subTags` — top 30 by frequency (of 811 unique)

| Value | Freq | % of 701 tracks | Distinct lanes |
|---|---|---|---|
| pop | 35 | 5.0% | 8 |
| indie-pop | 28 | 4.0% | 5 |
| k-rnb | 28 | 4.0% | 1 |
| lofi-hiphop | 28 | 4.0% | 2 |
| trap | 26 | 3.7% | 3 |
| dream-pop | 25 | 3.6% | 3 |
| japanese-city-pop | 25 | 3.6% | 1 |
| alt-rock | 24 | 3.4% | 4 |
| k-pop | 23 | 3.3% | 2 |
| dance-pop | 22 | 3.1% | 3 |
| k-hiphop | 22 | 3.1% | 1 |
| classic-soul | 20 | 2.9% | 1 |
| indie-folk | 19 | 2.7% | 2 |
| indie-rock | 19 | 2.7% | 3 |
| night-groove | 19 | 2.7% | 6 |
| romance-pop | 17 | 2.4% | 2 |
| k-indie-pop | 16 | 2.3% | 1 |
| soft-pop | 16 | 2.3% | 4 |
| synth-pop | 16 | 2.3% | 2 |
| alt-pop | 15 | 2.1% | 3 |
| alt-rnb | 15 | 2.1% | 2 |
| bedroom-pop | 15 | 2.1% | 3 |
| feel-good | 15 | 2.1% | 5 |
| pop-rock | 15 | 2.1% | 4 |
| k-indie | 14 | 2.0% | 2 |
| summer-pop | 13 | 1.9% | 3 |
| funk | 12 | 1.7% | 3 |
| melodic-rap | 12 | 1.7% | 2 |
| modern-jrock | 12 | 1.7% | 1 |
| retro-pop | 12 | 1.7% | 2 |

Every one of the top-30 `subTags` is a genre or micro-genre label (`pop`, `indie-pop`, `k-rnb`, `trap`, `dream-pop`, `alt-rock`...). This is the clearest evidence in the whole vocabulary that **`subTags` functions as a genre/micro-genre tag field**, not an atmosphere field. 91 of 811 unique subTags (11%) are single-occurrence; the long tail is dominated by highly specific genre-fusion coinages (`street-noir`, `dreamy-drive`, `bedroom-funk`) that read as bespoke micro-genre labels invented per-track rather than drawn from a controlled vocabulary.

### C.4 Heuristic semantic-category distribution (unique-value count, all 1,485 values)

| Category | moodTags | sceneTags | subTags |
|---|---|---|---|
| genre | 4 | 3 | **253** |
| unclear (no confident match) | 65 | 61 | 53 |
| emotional_tone | 29 | 1 | 22 |
| texture | 17 | 2 | 68 |
| time_of_day | 4 | 60 | 60 |
| location | 7 | 56 | 26 |
| light | 10 | 36 | 13 |
| motion | 11 | 23 | 56 |
| weather | 9 | 30 | 32 |
| nostalgia | 4 | 24 | 34 |
| confidence | 18 | 1 | 12 |
| playfulness | 11 | 0 | 22 |
| tension | 11 | 0 | 4 |
| pace | 10 | 3 | 6 |
| romance | 6 | 5 | 26 |
| social_energy | 4 | 14 | 11 |
| spatial_openness | 5 | 14 | 8 |
| object | 2 | 21 | 0 |
| season | 5 | 14 | 16 |
| temperature | 5 | 3 | 8 |
| solitude | 3 | 8 | 8 |
| color | 3 | 6 | 5 |
| intimacy | 3 | 8 | 6 |
| culture | 3 | 6 | 7 |
| production_style | 3 | 0 | 14 |
| era | 1 | 0 | 6 |
| spatial_density | 1 | 2 | 8 |
| instrumentation | 1 | 5 | 6 |
| audience_or_demographic | 3 | 4 | 13 |
| activity | 0 | 5 | 4 |
| vocal_character | 0 | 0 | 3 |
| humidity | 1 | 0 | 0 |

**Frequency-weighted** (total occurrences, not unique values — shows which category dominates the tags tracks *actually carry*, not just the vocabulary breadth):

| Field | Dominant categories by occurrence count |
|---|---|
| moodTags (2,103 total) | texture 274, emotional_tone 271, light 175, confidence 173, temperature 151, romance 118, unclear 100, nostalgia 99, playfulness 97, weather 82 |
| sceneTags (2,103 total) | time_of_day 550, location 362, light 248, unclear 225, weather 120, social_energy 88, motion 85, spatial_openness 82, nostalgia 72, object 67 |
| subTags (2,103 total) | **genre 1,009 (48%)**, texture 168, time_of_day 131, unclear 98, motion 97, nostalgia 84, romance 63, playfulness 60, location 48, weather 45 |

**Read carefully:** the "unclear" bucket (65/61/53 unique values, 100/225/98 occurrences) reflects the limits of the specific keyword heuristic used here, not a claim that these values are meaningless — many are legitimate holistic aesthetic adjectives (`focused`, `classy`, `distant`, `earthy`, `relaxed`, `wandering`, etc.) that simply don't decompose cleanly into any single one of the 33 investigation-label categories supplied for this task. That itself is a finding: a non-trivial fraction of the existing vocabulary is intentionally impressionistic rather than structured, and forcing it into a fixed taxonomy will lose information or require a genuinely new category the investigation list didn't anticipate (e.g. "cinematic quality," which the task itself calls out in §7 as a concept to track separately).

---

## D. GPT STEP 3.5 inventory

Extracted verbatim from `supabase/functions/analyze-and-search/services/gpt.ts:114-137` (STEP 3.5, "VISUAL PROFILE — internal reasoning only"). All 14 dimensions below are **never output in the GPT JSON response, never stored, and never used by track-selection logic** — confirmed by (a) the prompt's own instruction ("do not add these as new JSON fields... never output it directly, in the JSON or otherwise," line 116) and (b) the fact that the STEP 6 output schema (`gpt.ts:396-425`) and the `GptResponse` TypeScript type (`gpt.ts:458-473`) contain no field corresponding to any of them.

| # | Exact prompt name | Prompt definition (verbatim) | Value type | Evidence-based? | Hidden-emotion risk | Overlaps existing moodTags | Overlaps sceneTags | Overlaps subTags | Currently output/stored/used | Meaningful for tracks? |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Scene/subject** | "street, room, cafe, ocean/water, car, airport/train/platform, concert, selfie/portrait, food, friends, couple, skyline, road, nature, club/party, store/convenience store, study/desk, hotel/window view, or other" | Categorical (16 named values + other) | Yes, directly visible | Low | No | **Yes — strong overlap** with `location`/`object`-category sceneTags (`cafe`, `beach`, `bedroom`, `road`, `club`...) | n/a | No | Never output/stored/used | **Image-only.** A track has no "scene/subject" in the same sense; sceneTags on tracks describe an *evoked* scene, not a *depicted* one — treating them as the same dimension risks exactly the object/location-shortcut bias flagged in §J. |
| 2 | **Weather feeling** | "sunny, rainy, cloudy, foggy, snowy, humid, dry, stormy, or clear" | Categorical (9 values) | Yes, when outdoors/visible | Low | Partial — moodTags has `rainy`(5), `dusty`(5), `foggy`(1); no `snowy`/`stormy`/`humid`/`dry`/`clear`/`overcast` anywhere in the catalog (§I) | **Yes** — sceneTags has richer rain/sun vocabulary (`rainy-window` 20, `sunny-street` 14, `cloudy-day` 8) | Weak (`sunny-drive`, `rainy-indie`) | No | **Strong shared candidate** — but the catalog's weather vocabulary is far sparser than the prompt's own 9-value list (no snow/storm/clear/overcast at all), so promoting this to a track field means largely starting from zero. |
| 3 | **Brightness** | "dark / dim / soft / bright / very bright" — "visual luminance... independent of mood" | Categorical, ordinal (5-point) | Yes, directly measurable in principle | Low | `bright`(54) and `dark`(36) exist as moodTags but are explicitly *not* separated from mood in the catalog (a track tagged `dark` could mean "visually dark" or "emotionally dark" — see §H) | sceneTags has `dim-light`(10), `dark-room`(5) etc. | No | No | Shared candidate, but the catalog conflates this with `light` and `emotional_tone` categories (see §D's own note on Dimension 3's prompt text distinguishing it from mood — the catalog vocabulary does not make that distinction). |
| 4 | **Saturation** | "muted / natural / vivid / highly saturated" | Categorical, ordinal (4-point) | Yes | Low | No confident match | `colorful`(1 scene), `colorful-room`(4), `black-and-white`(4) | No | No | **Image-only candidate** — no clean musical analogue exists in the catalog vocabulary; "saturated" sound isn't a term used anywhere in `subTags`/`moodTags`. |
| 5 | **Contrast** | "low / medium / high / harsh" | Categorical, ordinal (4-point) | Yes | Low | No match | No match | No match | No | **Image-only** — no evidence in the repo that "contrast" maps to any existing music concept (dynamic range is a plausible external analogue but is not present anywhere in this codebase's vocabulary — see §L). |
| 6 | **Color temperature** | "cool / neutral / warm / mixed" | Categorical (4-point) | Yes | Low | `warm`(76 moodTags, the #2 most frequent value in the entire vocabulary), `cool`(40) | No direct match | No | No | **Strong shared candidate** — `warm`/`cool` are already extremely well-represented in moodTags, though (again) conflated with emotional warmth, not isolated as literal color temperature. |
| 7 | **Dominant palette** | "blue-white, amber-orange, pink-purple neon, beige-brown, green-natural, monochrome, sepia/film, pastel, high-contrast black, or mixed colorful" | Categorical (10 named values) | Yes | Low | No match (moodTags has only `blue`(7), `pink` doesn't appear, `pale`(1)) | `blue-sky`(22), `neon` variants, `black-and-white`(4) | No | No | Weak shared candidate — the catalog has no equivalent controlled palette vocabulary; would need to be built from scratch. |
| 8 | **Light quality** | "direct sun, diffused window light, golden hour, neon, fluorescent, candle/warm lamp, overcast, low-light, flash, or screen light" | Categorical (10 named values) | Yes | Low | `glowing`(29), `glossy`(30) approximate but don't map 1:1 | **Strong overlap** — sceneTags has `golden-hour`(12), `neon`(53), `warm-light`(7), `dim-light`(10), `soft-light`(10), `lamp-light`(6), `phone-light`(7) | subTags has almost none | No | Shared candidate — sceneTags already has a reasonably rich light-quality vocabulary, but it's mixed in with location/object terms rather than isolated. |
| 9 | **Texture/finish** | "clean digital, glossy editorial, grainy film, hazy blur, soft focus, noisy low-light, analog snapshot, or polished commercial" | Categorical (8 named values) | Yes, but interpretive | Medium — "editorial"/"commercial" require aesthetic judgment, not pure visual measurement | `glossy`(30), `hazy`(21), `sleek`(24), `polished`(9) | No strong match | `production_style`-category subTags (`lofi`, `polished`) partially analogous but describe *audio* production, not image texture | No | This is the dimension with the clearest **potential** track-side analogue (audio production texture: lo-fi vs. polished vs. grainy), but the image-side and track-side vocabularies are currently completely separate and would need deliberate bridging, not reuse. |
| 10 | **Visual density** | "minimal, cozy clutter, busy city, crowded social, wide-open, or compressed/enclosed" | Categorical (6 named values) | Yes | Low | `minimal`(12 mood) | `spatial_density`-category sceneTags (`concrete`, few others; the catalog is thin here — only 2 unique sceneTags matched this category) | No | No | Shared candidate in concept (arrangement density is a real musical property) but the catalog vocabulary is too sparse on either side to reuse directly. |
| 11 | **Composition energy** | "still, balanced, playful, cinematic, fast, intense, or chaotic" — explicitly distinguished in-prompt from "musical energy" (line 135) | Categorical (7 named values) | Partially — "playful"/"cinematic"/"intense" require interpretive judgment beyond raw visual measurement | Medium | `playful`(33), `cinematic`(27, via expanded heuristic), `chaotic`(9) all exist as moodTags | `motion`-category sceneTags overlap partially | No | No | The prompt itself flags this as a distinct concept from `music_profile.energy_score` and warns a mismatch between the two "is a signal worth noticing, not an error" (`gpt.ts:135`) — i.e. the prompt already anticipates exactly the kind of two-energy-systems problem documented in §B.3, on the image side as well as between image and catalog. |
| 12 | **Openness** | "enclosed room, semi-open window, street, wide-open landscape, car interior, transit space, or crowded indoor" | Categorical (7 named values) | Yes | Low | `open`(6), `wide`(22) as moodTags | **Strong overlap** — `spatial_openness`-category sceneTags (`open-road`(15), `wide-sky`(3), `empty-room`(4)/`empty-street`(11)/`empty-road`(11), `highway`(14)) | No | No | Good shared candidate — the catalog has real if scattered vocabulary for open vs. enclosed spaces. |
| 13 | **Motion** | "static, slow walk, driving/cruising, fast motion, dancing, performance, travel/departure, or resting" | Categorical (8 named values) | Yes, when visible/implied | Medium — "implied" motion for a still photo is an inference, not a direct observation | `driving`(9), `floating`(12), `rushing`(3) | **Strong overlap** — `motion`-category sceneTags (`night-drive` 106 — the single most frequent sceneTag in the whole catalog, `motion`(26), `fast-motion`(7), `running`(8)) and 56 `subTags` values | Yes, `-drive`/`-cruise`/`-groove` compounds throughout `subTags` | No | **Strongest shared candidate of all 14 STEP 3.5 dimensions** — motion vocabulary is rich and present in all three track-tag fields already, unlike most other STEP 3.5 dimensions. |
| 14 | **Social context** | "alone, couple, friends, crowd, public space, private space, or unclear" | Categorical (7 named values incl. "unclear" as a valid value in the prompt itself) | Yes, when visible | Low | `intimate`(17), `lonely`(37, one of the top-10 most frequent moodTags) | **Strong overlap** — `social_energy`/`solitude`/`intimacy`-category sceneTags (`friends` 25, `party`/`club`/`dancefloor` cluster, `alone`(4), `quiet-room`/`quiet-cafe`) | No | No | Good shared candidate — social context (alone/couple/friends/crowd) is one of the more cleanly represented concepts across the existing vocabulary. |

**Cross-dimension overlaps within STEP 3.5 itself:** the prompt text explicitly separates "Composition energy" (dimension 11) from `music_profile.energy_score`, and separately notes "Brightness... independent of mood" (dimension 3) — both are the prompt author pre-empting a conflation risk. But dimensions 6 (Color temperature) and 8 (Light quality) meaningfully overlap in practice (a "golden hour" light-quality reading and a "warm" color-temperature reading will almost always co-occur), and dimension 9 (Texture/finish) overlaps with dimension 4 (Saturation) and dimension 3 (Brightness) for several of its named values ("noisy low-light" touches brightness; "grainy film" touches saturation/palette).

---

## E. GPT response-field inventory

Extracted from `GptResponse` type (`gpt.ts:458-473`) and STEP 6 output schema (`gpt.ts:393-434`).

| Field | Type | Prompt instructions (source) | Required/optional | Categorical/freeform | Constrained? | Stored in DB | Used in selection | Sent to frontend | Rendered in UI | Duplicates another field | Could contribute to shared atmosphere schema |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `image_type` | `"SCENE"\|"PERSON"\|"MIXED"` | STEP 1 (`gpt.ts:28-33`) | Required | Categorical (3 values) | Yes, string union in type but not runtime-validated against the union (see `docs/music-system-audit.md` §K on no Zod anywhere) | Yes (`analysis.imageType`, `db.ts:103`) | No | Yes (`Analysis.imageType`) | Not directly (no visible UI badge found) | No | Weak — a coarse image-taxonomy field, not atmosphere per se |
| `confidence` | `number` (0.0-1.0) | STEP 6 schema only, no dedicated prompt section explaining how to compute it | Required | Continuous | No explicit constraint/validation found | Yes (`analysis.confidence`) | No | Yes (`PlaylistResult.confidence`) | **No** — confirmed no render call anywhere in `src/` (re-verified: grep for `confidence` in `src/` only hits type defs and pass-through code) | No | Could contribute as a meta-field (per-analysis certainty) but is not itself an atmosphere dimension |
| `analysis.location` | `string` | STEP 2 SCENE (`gpt.ts:41-43`) | Required for SCENE/MIXED | Freeform | No | Yes | No | Yes | Not directly rendered | Overlaps `sceneTags`-category `location` conceptually | Weak — freeform text, not structured |
| `analysis.time_of_day` | `string` | STEP 2 SCENE (`gpt.ts:45`) | Required for SCENE/MIXED | Freeform (prompt suggests Morning/Afternoon/Evening/Night but doesn't enforce) | No | Yes | No | Yes | Not directly rendered | **Strong overlap** with catalog `time_of_day`-category tags (largest single category in sceneTags by occurrence, 550) and with STEP 3.5's implicit day/night framing | **Strong candidate** — already time-of-day-shaped, just needs to become a true enum |
| `analysis.season` | `string` | STEP 2 SCENE (`gpt.ts:47-49`), "Be precise based on light, color, vegetation, clothing, atmosphere" | Required for SCENE/MIXED | Freeform (prompt suggests Spring/Summer/Autumn/Winter) | No | Yes | No | Yes | Not directly rendered | Overlaps catalog `season`-category tags (thin, §I) | **Strong candidate**, but see §I — the catalog side has almost nothing to receive it |
| `analysis.mood_keywords` | `string[]` | STEP 2 SCENE, "pick 3-5" from a suggested list of 15 words (`gpt.ts:51-53`) | Required for SCENE/MIXED | Semi-categorical (suggested vocabulary, not enforced) | No | Yes | No | Yes | **No component renders these** (`MoodTags.tsx` exists and could display them but is never imported, per `docs/music-system-audit.md` §I finding 6) | **Direct conceptual duplicate of `moodTags`** — both are 3-5-ish word emotional-tone lists; the prompt's own suggested vocabulary (nostalgic, romantic, lonely, excited, peaceful, mysterious, melancholic, dreamy, energetic, cozy, bittersweet, euphoric, tense, liberating, languid) overlaps heavily with the catalog's actual moodTags (`nostalgic`, `dreamy`, `bittersweet` all appear in both) | **Yes, strongest single reuse candidate** — this is the closest thing in the entire system to an image-side "moodTags" already |
| `analysis.sensory_impressions` | `string[]` | STEP 2 SCENE, "pick 2-4" from Temperature/Smell/Texture sub-lists (`gpt.ts:54-57`) | Required for SCENE/MIXED | Semi-categorical, 3 sub-dimensions blended into one flat array | No | Yes | No | Yes | Not rendered | Overlaps `temperature`/`texture`-category moodTags and subTags, but **mixes three different concepts (temperature, smell, texture) into a single array with no sub-labeling** — the exact "values that mix multiple concepts in one string" problem the investigation checklist calls out, here at the *field* level rather than the tag-value level | Needs to be split into ≥3 separate dimensions before reuse |
| `analysis.cultural_context` | `string` | STEP 2 SCENE, explicitly told to be "secondary flavor only... never a shortcut to a genre or lane" (`gpt.ts:59-62`) | Required for SCENE/MIXED | Freeform | No | Yes | No (explicitly, by prompt design) | Not rendered | Overlaps catalog `culture`-category tags (thin: k-, japanese-, british- prefixes) | Deliberately **excluded by design** from influencing selection — worth preserving that constraint in any future schema |
| `analysis.style_vibe` | `string` | STEP 2 PERSON (`gpt.ts:67-70`) | Required for PERSON/MIXED | Semi-categorical (suggested vocabulary) | No | Yes | No | Yes | Not rendered | Person-specific; no direct track-tag equivalent | Image(person)-only |
| `analysis.energy` | `string` | STEP 2 PERSON (`gpt.ts:72`) | Required for PERSON/MIXED | Semi-categorical | No | Yes | No | Yes | Not rendered | **Name-collides with `music_profile.energy_score` and catalog `energy`** — three different fields all called "energy," three different value spaces (freeform person-vibe word vs. 1-5 int vs. low/med/high enum) | This naming collision alone is a redundancy/confusion risk worth flagging before schema design (§H) |
| `analysis.color_tone` | `string` | STEP 2 PERSON, "Warm / Cool / Neutral / High contrast / Muted / Faded / Vivid" (`gpt.ts:74`) | Required for PERSON/MIXED | Semi-categorical (7 suggested values) | No | Yes | No | Yes | Not rendered | Overlaps STEP 3.5 dimension 6 (Color temperature) and dimension 4 (Saturation) — i.e. **this PERSON-branch field already does, informally, what two separate STEP 3.5 dimensions do for SCENE** | Candidate for consolidation |
| `music_profile.energy_score` | `number` (1-5) | STEP 3 (`gpt.ts:88-108`) | Required | Continuous | Guided but not hard-enforced (no min/max validation found in `gpt.ts`'s parsing code) | Yes (`playlists.energy_score`) | No (see §B.3) | Yes | Not rendered | See §B.3 collision note | Strong candidate once reconciled with catalog `energy` |
| `music_profile.tempo` | `string` ("slow"/"mid"/"uptempo") | STEP 3 schema (`gpt.ts:91`) | Required | Categorical (3 suggested, not enforced) | No | Yes (`analysis.tempo`, folded into JSONB) | No | Yes | Not rendered | Overlaps `pace`-category moodTags/subTags conceptually | Candidate |
| `music_profile.valence` | `string` ("positive"/"neutral"/"negative") | STEP 3 schema (`gpt.ts:92`) | Required | Categorical (3 suggested) | No | Yes | No | Yes | Not rendered | Overlaps `emotional_tone`-category moodTags broadly | Candidate, coarse |
| `music_profile.primary_genre` / `secondary_genre` | `string` | STEP 3 + STEP 4, "MUST be chosen from the allowedGenres of the curation lane" (`gpt.ts:110`) | Required | Constrained to the selected lane's `allowedGenres` list (by prompt instruction, not runtime validation) | Yes, by instruction only | Yes | No | Yes | Not directly rendered as a chip/label | **Direct duplicate of the `genre`-category majority of `subTags`** — this is the pre-existing analysis-side equivalent of what `subTags` already encodes per-track | Already exists; the redundancy is with `subTags`, not a gap |
| `playlist`[].reason | `string` (per fallback track) | STEP 4/5 combined reasoning | Required for fallback-path tracks | Freeform | No | Partially (only catalog tracks get a synthesized `reason`; GPT fallback tracks keep GPT's own text) | No | Yes (`Track.reason`) | **Not rendered** by `TrackItem` (confirmed in `docs/music-system-audit.md` §G) | n/a | Freeform text, not structured enough for numeric matching as-is |
| `playlist_concept` / `playlist_subtitle` | `string` | STEP 5.5/5.6, extensive style rules | Required | Freeform, heavily constrained by *style* rules (banned patterns) but not by *content* vocabulary | Style-constrained only | Yes | No | Yes | **Yes** — rendered as hero title/subtitle | No | Cosmetic; cited here only for completeness |
| `primary_lane_id` | `string` | STEP 4 (`gpt.ts:141-244`) | Required | Categorical, validated against `VALID_LANE_IDS` (`gpt.ts:476,556`) — the **only** GPT output field with actual runtime enum validation | Yes, and this is the *only* field in the whole response that's runtime-validated against a known set | Yes | Yes (sole selection key, see prior audit §F) | No (server-only) | No | n/a | The one existing "hard" categorical output — instructive precedent for how a future atmosphere field *should* be validated, since nothing else in `GptResponse` is |

**Overall pattern:** `primary_lane_id` is the only output field with real runtime validation. Every other field is either fully freeform or "semi-categorical" (a suggested vocabulary in the prompt text with no code-level enforcement) — meaning today's GPT output is far looser than the strict lane-selection mechanism the prompt otherwise enforces. Any future atmosphere schema that wants numeric-comparable output will need to introduce the same kind of hard validation `primary_lane_id` already has, for fields that currently have none.

---

## F. Lane-definition vocabulary inventory

Extracted programmatically from `supabase/functions/analyze-and-search/services/curationLanes.ts` (21 lanes, brace-matched array-field extraction).

| Field | Total items (across 21 lanes) | Unique items | Repeated items | Notable repeats |
|---|---|---|---|---|
| `sceneSignals` | 118 | 118 | **0** | Every scene-signal phrase across the entire lane catalogue is textually unique — these are lane-specific descriptive sentences, not a shared controlled vocabulary |
| `energySignals` | 74 | 74 | **0** | Same — fully unique phrases per lane |
| `allowedGenres` | 107 | 100 | 7 | `"bedroom pop"`×3, `"Korean city pop"`×2, `"jazz pop"`×2, `"pop rock"`×2, `"trap"`×2, `"indie pop"`×2 |
| `forbiddenGenres` | 89 | 56 | 25 items repeated 2+ times | `"post-rock"`×6, `"bright idol pop"`×4, `"acoustic folk"`×4, `"J-rock"`×3, `"dark trap"`×3, `"slowcore"`×3, plus 19 more appearing exactly twice (`"K-pop"`, `"anime rock"`, `"bright dance pop"`, `"acoustic cafe pop"`, `"nu-jazz"`, `"K-R&B"`, `"lo-fi"`, `"old jazz"`, `"heavy rock"`, `"soft cafe pop"`, `"hard rock"`, `"funk pop"`, `"bright K-pop"`, `"noir jazz"`, and others) |
| `referenceVibes` | 85 | 85 | 0 | Fully unique — mostly artist/song name-drops or short descriptive phrases |
| `titleExamples` | 47 | 47 | 0 | Fully unique — illustrative playlist-title strings |
| `avoidWhen` | 137 | 137 | 0 | Fully unique — every negative-selection condition is written bespoke per lane |

**Reading these numbers:** `allowedGenres` and especially `forbiddenGenres` are the *only* lane fields built from anything resembling a shared, reusable vocabulary (genre names repeat across lanes because genre space is naturally shared — e.g. multiple lanes legitimately forbid "post-rock"). `sceneSignals`, `energySignals`, `referenceVibes`, `titleExamples`, and `avoidWhen` are **100% unique, hand-written natural-language sentences** with zero reuse across lanes — none of these five fields are, today, a "vocabulary" in the tag-list sense at all; they are prose written once per lane to feed the GPT prompt's reasoning, and per the audit checklist's own instruction ("do not treat full natural-language phrases as simple atomic tags without analysis"), they should not be mechanically tokenized into a tag list without a dedicated NLP/manual pass — that pass was **not** attempted here.

**What's reusable as what:**
- **Structured atmosphere dimensions (candidate):** `allowedGenres`/`forbiddenGenres` — already a clean categorical genre vocabulary (100 unique allowed + 56 unique forbidden = 156 total genre terms, many overlapping with `subTags`' genre-heavy vocabulary from §C.3).
- **Categorical vocabulary (candidate, with extraction work):** `energySignals` phrases repeatedly use a small set of underlying concepts (mellow/rhythmic, high-energy/adrenaline, smooth/relaxed, aggressive/tense, etc.) even though no two lanes phrase them identically — a future pass could distill these 74 unique sentences down to a much smaller controlled vocabulary, but that distillation has not been done here (it would itself require the kind of judgment calls this read-only investigation is scoped to avoid).
- **Negative-selection rules (as-is, not atomizable):** `avoidWhen` (137 unique conditions) and `forbiddenGenres` are inherently *relational* (lane-vs-lane contrastive statements — "prefer X instead," "do not confuse with Y") rather than standalone descriptive tags; they only make sense in the fixed-lane framework and do not translate into standalone atmosphere-dimension values.
- **Human-readable lane description only (not reusable as structured data without a rewrite):** `sceneSignals`, `referenceVibes`, `titleExamples` — natural-language sentences authored for LLM prompt-reading, not for tokenization.
- **Obsolete lane-specific logic (per the migration-risk framing in the prior audit):** the entire `avoidWhen`/conflict-resolver apparatus (`gpt.ts:227-243`, 8 named lane-pair tie-breakers) is lane-identity-dependent prose that has no meaning once fixed lanes are removed — it is the single largest hand-authored artifact in the codebase (per `docs/music-system-audit.md` §J) and would need to be replaced wholesale, not migrated.

---

## G. Semantic overlap matrix

"Where does concept X currently appear, in what form?" — built from §C/§D/§E/§F evidence. `—` = no evidence found in this investigation.

| Concept | moodTags | sceneTags | subTags | lane fields | STEP 3.5 | GPT output | Notes |
|---|---|---|---|---|---|---|---|
| Season | `summer`(4), `spring`(1), `autumn`(1) | `summer-night`(12), `summer`(8), `winter-room`(3) | `summer-pop`(13), `spring-pop`(2) | — (no season terms found in `sceneSignals`/`energySignals` text search) | — (no season dimension in STEP 3.5) | `analysis.season` (freeform) | Almost entirely "summer"-biased; catalog has essentially no receiving vocabulary for `analysis.season` values other than summer |
| Weather | `breezy`(28), `rainy`(5), `hazy`(21) | `rainy-window`(20), `sunny-street`(14), `cloudy-day`(8) | `sunny-drive`(5), `soft-haze`(3) | Lane `sceneSignals` prose mentions rain/sun contextually (not tokenized here) | Weather feeling (dim 2): 9 values | — (no `analysis.weather` output field exists at all — only `season`/`time_of_day` are captured, weather is *not* in the GPT output schema despite being a STEP 3.5 dimension) | GPT never outputs weather even though STEP 3.5 evaluates it — a genuine gap, not just a discard |
| Time of day | `night`(27), `late-night`(17) | `night-drive`(106, the single most frequent sceneTag), `daylight`(33) | `night-groove`(19), `night-pop`(10) | Lane prose ("late-night", "golden hour" mentioned descriptively) | Composition/Openness touch it indirectly; no dedicated time dimension beyond what's folded into "Light quality" (golden hour) | `analysis.time_of_day` (freeform) | Richest concept in the whole vocabulary by occurrence count (550 sceneTag occurrences) |
| Brightness | `bright`(54), `dark`(36) | `dim-light`(10), `soft-light`(10) | — | — | Brightness (dim 3): 5-point ordinal | — (not output) | Catalog conflates "bright/dark" mood with literal luminance (§H) |
| Color temperature | `warm`(76, #2 overall), `cool`(40) | — | — | — | Color temperature (dim 6): 4-point | `analysis.color_tone` (PERSON branch only) | Best-covered STEP 3.5 concept on the mood side |
| Humidity | `dusty`(5) [weak] | — | — | — | — (not a STEP 3.5 dimension; only "Weather feeling" includes humid/dry as values) | — | Essentially absent everywhere |
| Openness | `open`(6), `wide`(22) | `open-road`(15), `empty-street`(11), `wide-sky`(3) | `open-road`(4) | — | Openness (dim 12): 7-point | — | Reasonably covered on the scene side |
| Intimacy | `intimate`(17), `tender`(9) | `cafe-date`(5), `close-up`(1) | `cafe-romance`(3) | — | Social context (dim 14) touches this indirectly | — | Thin but present |
| Solitude | `lonely`(37, top-10 overall) | `quiet-room`(9), `alone`(4) | `bedroom-solitude`(4), `lonely-night`(1) | — | Social context (dim 14): "alone" is a named value | — | Well covered — `lonely` is one of the highest-frequency moodTags in the catalog |
| Social density | — (no crowd-size gradient found) | `party`(8), `friends`(25), `club`(16) | `party-groove`(3) | — | Visual density (dim 10): "crowded social" is one named value | — | Present as binary-ish alone-vs-social, not a density gradient |
| Motion | `driving`(9), `floating`(12) | `night-drive`(106), `motion`(26) | 56 unique `-drive`/`-cruise`/`-groove` compounds | — | Motion (dim 13): 8-point | — | **Best-covered concept across all sources simultaneously** — see §D dimension 13 |
| Energy | `energy` field (low/med/high) | — | — | `energySignals` (74 unique phrases) | Composition energy (dim 11, explicitly distinct from musical energy) | `music_profile.energy_score` (1-5) | Two/three parallel, unreconciled energy systems — see §B.3, §H |
| Groove | `groovy`(23), `groove`(2) | `night-groove`(1 as sceneTag) | `night-groove`(19), `smooth-groove`(6), `bass-groove`(4) | `energySignals` prose ("groove" appears descriptively) | — (no groove-equivalent dimension) | — | Track/audio-only concept; STEP 3.5 has no analogue (see §L) |
| Nostalgia | `nostalgic`(59, top-5 overall), `retro`(20) | `memory`(21), `old-film`(12) | `retro-pop`(12), `road-memory`(4) | `referenceVibes`/lane names (e.g. "City Pop / Retro Drive") | Texture/finish (dim 9) touches "analog snapshot"/"grainy film" as a visual proxy | — | Well covered on the track side; image side only reaches it indirectly through texture, never directly |
| Romance | `romantic`(90, **the single most frequent moodTag in the entire catalog**) | `date-night`(32) | `romance-pop`(17), `cafe-romance`(3) | Lane "Modern Romance Pop" itself | Social context (dim 14): "couple" | — | `romantic` at 90/701 (12.8% of all tracks) dwarfs every other moodTag |
| Tension | `tense`(3), `chaotic`(9), `aggressive`(6) | — (no strong tension-scene vocabulary found) | `dark-groove`(3), `tension`-adjacent subTags rare | Lane "Dark Heavy Hip-Hop" `avoidWhen`/`sceneSignals` prose | — (no tension dimension in STEP 3.5 — closest is "intense"/"chaotic" as Composition energy values) | — | Thin coverage everywhere; relies on lane identity more than tags |
| Playfulness | `playful`(33), `quirky`(11), `cute`(12) | — | `playful-pop`(4) | Lane "Highteen Pop Room" prose | Composition energy (dim 11): "playful" is a named value | — | Reasonably covered |
| Urbanity | `urban`(20, via expanded heuristic) | `city`(62, all 21 lanes — see §J), `downtown`(7) | `urban-groove`(6), `urban-drive`(4) | Nearly every lane's `sceneSignals` mentions a city/urban cue in some form | Scene/subject (dim 1) doesn't have "urban" as a distinct value but most named scenes are implicitly urban | — | `city` is the least-discriminating single term in the whole system (§J) |
| Nature | — (no dedicated nature moodTags found) | `forest-road`(2), `river`(1), `mountain-road`(2), `flower-field`(2) | `nature-drive`(1) | Lane "Sunny Stroll Pop"/"Indie Road Movie" prose | Scene/subject (dim 1): "nature" is a named value | — | Weakest-covered concept in the request list — nature is present only as scattered single-digit-frequency sceneTags |
| Texture (visual/production) | `smoky`(9), `raw`(11), `silky`(1) | — | `production_style`-category subTags (lofi, polished, bass-heavy) | — | Texture/finish (dim 9): 8 named values | — | Two disconnected "texture" vocabularies — one visual (STEP 3.5), one audio-production (subTags) — that never touch |
| Cinematic quality | `cinematic`(27) | — | `cinematic-pop`(5), `cinematic-folk`(3), `cinematic-rap`(3) | Several lane `referenceVibes`/descriptions use cinematic language impressionistically | Composition energy (dim 11): "cinematic" is a named value | — | A recognized cross-source concept the investigation category list didn't originally name — worth adding explicitly to any future schema (see §C.4's closing note) |
| Vintage quality | `retro`(20), `classic`(14) | `old-film`(12), `old-photo`(4), `vintage-stage`(2) | `80s-pop`(6), `classic-jrock`(5), `vintage`-prefixed subTags | Lane "City Pop / Retro Drive," "Classic Soul / Old Film" identities | Texture/finish (dim 9): "grainy film," "analog snapshot" | — | Well covered, split across nostalgia/era/texture heuristic categories |
| Dreaminess | `dreamy`(39) | — | `dream-pop`(25, but this is a **genre name**, not an atmosphere descriptor — see the Dream Pop guard in `gpt.ts:211-212`) | Lane "Dream Pop / Shoegaze Fog" identity, with an explicit prompt guard against over-triggering on the word "dreamy" alone | — (no direct dimension; closest is Texture/finish "hazy blur"/"soft focus") | — | The prompt itself (`gpt.ts:211-212`) already documents that "dreamy" as a mood word is **not sufficient evidence** for the Dream Pop lane and must be checked against actual visual haze/fog/blur evidence — i.e. the system already distinguishes "the word dreamy" from "genuine atmospheric dreaminess" in one place (lane selection) but the catalog's own `dreamy` moodTag doesn't carry that same distinction |

---

## H. Redundancy, contradiction, and bias findings

1. **Duplicate recordings carry different tags depending on lane (highest-severity finding in this investigation).**
   - **Concept:** tag values as a function of lane membership, not of the recording itself.
   - **Exact values:** see §A and the two full examples in the JSON companion (`hQ5x8pHoIPA` "Feather" — Nujabes: `energy` medium→low, `moodTags` `["nostalgic","jazzy","reflective"]`→`["gentle","reflective","airy"]`, `sceneTags` `["night-walk","city","window"]`→`["bedroom","desk","late-night"]`, `subTags` `["japanese-jazz-hop","lofi-hiphop","beat-driven"]`→`["lofi-hiphop","jazzy-beats","quiet-focus"]`; `eimgRedLkkU` "Walking On A Dream" — Empire of the Sun: `energy` medium→high, similarly divergent tags).
   - **Source files:** `supabase/functions/_shared/musicCatalog.ts` (both copies).
   - **Representative tracks:** the two above; scope: of 22 duplicate-`youtubeVideoId` groups, 21 have at least one of {energy, moodTags, sceneTags, subTags} differing, and 21/22 differ specifically in `subTags`.
   - **Likely cause:** each catalog track object was almost certainly hand-written (or LLM-assisted-written) once per lane, describing "why this song fits this lane," rather than derived once from the song itself and then filtered into applicable lanes.
   - **Severity for future migration:** **High** — this is direct proof that a naive "use existing tags as ground truth for atmosphere stats" approach would encode lane bias, not track truth, exactly the risk item 8 of the checklist was written to catch.
   - **Automatically fixable:** No — resolving which copy (if either) is "more correct" requires either a policy decision (e.g. "the first-authored copy wins") or actual listening.
   - **Manual review required:** Yes.

2. **`subTags` is structurally a genre field wearing an atmosphere-field's clothes.**
   - **Concept:** genre.
   - **Exact values:** 253/811 unique subTags (1,009/2,103 occurrences, 48%) heuristically categorize as `genre` — see §C.3/§C.4.
   - **Source files:** `musicCatalog.ts` (`subTags`), `gpt.ts` (`music_profile.primary_genre`/`secondary_genre`).
   - **Likely cause:** `subTags` appears to have been used as a free-text "micro-genre + vibe" catch-all, not disciplined to a single semantic purpose.
   - **Severity:** Medium-High — anyone reusing `subTags` as-is for "atmosphere" will actually be reusing a genre field, duplicating `music_profile.primary_genre`/`secondary_genre` under a different name and defeating the point of separating genre from atmosphere in the redesign this investigation is feeding into.
   - **Automatically fixable:** Partially — the heuristic categorization in the JSON companion is a starting point for automatically splitting "clearly genre" subTags from "clearly not genre" ones, but the boundary cases (`street-noir`, `dreamy-drive`, `bedroom-funk` — genre-adjacent coinages) need human judgment.
   - **Manual review required:** Yes, for boundary cases.

3. **Name collision: three different fields are all called "energy."**
   - **Concept:** energy.
   - **Exact values:** `CatalogSeedTrack.energy` (low/medium/high), `GptResponse.music_profile.energy_score` (1-5), `GptResponse.analysis.energy` (freeform, PERSON branch only, e.g. "confident," "soft," "intense" per `gpt.ts:72`).
   - **Source files:** `musicCatalog.ts:20`, `gpt.ts:90` and `gpt.ts:72`.
   - **Likely cause:** independent, unconnected design decisions made at different times (catalog seeding vs. STEP 3 profile vs. STEP 2 PERSON analysis), never reconciled.
   - **Severity:** Medium — not a functional bug today (nothing cross-reads them, per §B.3), but a significant naming/design hazard for anyone designing a unified schema who might assume "energy" means one thing.
   - **Automatically fixable:** N/A (naming decision, not a data error).
   - **Manual review required:** Yes — needs an explicit decision on terminology before schema design.

4. **`dark` and `bright` (moodTags) conflate literal visual luminance with emotional tone.**
   - **Concept:** brightness / emotional tone, mixed in one string.
   - **Exact values:** `dark`(36 occurrences, 9 lanes), `bright`(54 occurrences, 13 lanes).
   - **Source file:** `musicCatalog.ts`.
   - **Representative tracks:** e.g. "Superhero" (Metro Boomin/Future/Chris Brown, `dark-heavy-hiphop`) tagged `["cinematic","dark","heavy"]` — here `dark` plausibly means tonal/emotional darkness; vs. any `city-pop-retro-glow` track that might use `bright` to mean literal daylight brightness rather than a cheerful mood. The catalog gives no way to tell which sense is meant in a given instance without reading the accompanying sceneTags.
   - **Likely cause:** English mood adjectives are inherently double-duty (this is a known general problem with "dark"/"bright" as descriptors), and the catalog was not authored with STEP 3.5's discipline of separating "brightness (visual, independent of mood)" from mood.
   - **Severity:** Medium — matters specifically because STEP 3.5 dimension 3 (Brightness) is explicitly defined as mood-independent, so a future schema reusing catalog `dark`/`bright` values as a brightness dimension would be silently reintroducing the ambiguity STEP 3.5 was designed to avoid.
   - **Automatically fixable:** No.
   - **Manual review required:** Yes, per-instance.

5. **GPT STEP 3.5 and existing catalog vocabulary use different language for the same concepts, with no shared identifiers.**
   - **Concept:** general — see the full §G matrix.
   - **Exact values:** e.g. STEP 3.5 "Openness: wide-open landscape" vs. catalog sceneTag `wide-sky`/`open-road`; STEP 3.5 "Motion: driving/cruising" vs. sceneTag `night-drive`/subTags `-drive` compounds.
   - **Source files:** `gpt.ts` (prompt text) vs. `musicCatalog.ts` (tag strings).
   - **Likely cause:** the two vocabularies were authored independently, at different times, for different purposes (one to guide an LLM's reasoning, one to hand-describe songs), with no cross-referencing.
   - **Severity:** Low as a bug (nothing is "broken"), Medium as a migration cost — building a shared schema requires translating both vocabularies into one, not just picking one side.
   - **Automatically fixable:** Partially, via string-similarity/embedding-based term alignment (not attempted here — out of scope for a repository-evidence-only investigation).
   - **Manual review required:** Yes, for final term selection.

6. **Current output fields are too freeform for reliable numeric matching.**
   - **Concept:** general (see §E table).
   - **Exact values:** `analysis.mood_keywords`, `analysis.sensory_impressions`, `music_profile.tempo`, `music_profile.valence` are all either fully freeform or "semi-categorical" (a suggested vocabulary with zero runtime enforcement) — the *only* field with true runtime validation is `primary_lane_id` (`gpt.ts:476,556`).
   - **Source file:** `gpt.ts`.
   - **Likely cause:** the prompt was iteratively developed to produce good qualitative playlist copy (title/subtitle/reasoning text), not structured, comparable data — the whole system's design center of gravity is "pick one lane, write nice copy," not "emit a measurement vector."
   - **Severity:** High for any future similarity-scoring design — none of today's output fields would reliably support numeric distance/similarity computation without new validation being added.
   - **Automatically fixable:** N/A — requires prompt and schema redesign (explicitly out of scope for this investigation).
   - **Manual review required:** Design decision, not a data-cleanup task.

7. **Existing tags encode old lane bias rather than the track itself (restated/generalized from finding 1).**
   - **Concept:** general provenance of the tag data.
   - **Evidence:** beyond the 22 duplicate-recording groups in finding 1, indirect evidence is that `avoidWhen`/`forbiddenGenres` (lane-contrastive fields, §F) exist specifically to police the boundary between adjacent lanes, and multiple lane `sceneSignals`/`avoidWhen` entries explicitly reference *other* lanes by name (e.g. `curationLanes.ts`'s Modern Jazz Groove `avoidWhen` entries say "prefer K-R&B Night Drive instead," "prefer Cozy Cafe Mellow instead") — meaning the lane system was authored as a **mutually-defining, contrastive taxonomy**, not as 21 independent atmosphere descriptions. Per-track tags inherit this contrastive framing implicitly.
   - **Severity:** High for any "flatten the catalog and search across everything" migration path (per `docs/music-system-audit.md` §J) — the tags were never designed to stand alone outside their lane's contrastive context.
   - **Automatically fixable:** No.
   - **Manual review required:** Yes — this is a design-philosophy question, not a data-cleanup task.

---

## I. Season and weather coverage

**Requested concept checklist, checked against the actual catalog (all three tag fields) via direct string search — not invented:**

| Concept | Found? | Exact strings | Field(s) | Total freq |
|---|---|---|---|---|
| spring | Partial | `spring`(mood, 1), `spring`(scene, 2), `spring-day`(scene, 2), `spring-street`(scene, 1), `spring-pop`(sub, 2) | mood/scene/sub | 8 |
| early spring | **Not found** | — | — | 0 |
| late spring | **Not found** | — | — | 0 |
| summer | Yes, dominant | `summer`(mood, 4), `summer-night`(mood 1, scene 12, sub 2), `summer`(scene, 8), `summer-road`(scene, 4), `summer-drive`(scene 3, sub 4), `summer-pop`(sub, 13), `summer-groove`(sub, 2), plus ~15 more single-occurrence `summer-*` compounds across all three fields | mood/scene/sub | ~60+ (dominant season term by a wide margin) |
| early summer | **Not found** | — | — | 0 |
| midsummer | **Not found** | — | — | 0 |
| late summer | **Not found** | — | — | 0 |
| autumn | Barely present | `autumn`(mood, 1), `autumn`(scene, 1), `autumn-indie`(sub, 1) | mood/scene/sub | 3 |
| early autumn | **Not found** | — | — | 0 |
| late autumn | **Not found** | — | — | 0 |
| winter | Barely present, **no standalone "winter" as a season word anywhere** | `winter-room`(scene, 3), `winter-drive`(scene, 1), `winter-beats`(sub, 1), `winter-indie`(sub, 1) | scene/sub only | 6 |
| early winter | **Not found** | — | — | 0 |
| midwinter | **Not found** | — | — | 0 |
| late winter | **Not found** | — | — | 0 |
| clear (sky) | **Not found** as a standalone weather word (only `blue-sky` exists as a related sceneTag, 22 occurrences) | — | — | 0 |
| cloudy | Yes | `cloudy-day`(scene, 8), `cloudy-road`(scene, 2), `cloudy-street`(scene, 1), `cloudy-town`(scene, 1) | scene only | 12 |
| overcast | **Not found** | — | — | 0 |
| rain | Yes | `rainy`(mood, 5), `rainy-window`(scene, 20), `rain`(scene, 7), `rainy-street`(scene, 7), plus ~15 more `rainy-*` compounds across mood/scene/sub | mood/scene/sub | ~55+ |
| rainy season | **Not found** (as a distinct concept from generic "rainy") | — | — | 0 |
| after rain | **Not found** | — | — | 0 |
| storm | **Not found anywhere in the catalog**, despite being one of STEP 3.5's own 9 named "Weather feeling" values | — | — | 0 |
| snow | **Not found anywhere in the catalog**, despite being one of STEP 3.5's own 9 named "Weather feeling" values (as "snowy") | — | — | 0 |
| fog | Yes, but thin | `foggy`(mood, 1), `fog`(scene, 1), `foggy-night`(scene, 1), `foggy-road`(scene, 1), `cinematic-fog`(sub, 1) | mood/scene/sub | 5 |
| haze | Yes, moderate | `hazy`(mood, 21), `soft-haze`/`night-haze`/`blue-haze`/`cinematic-haze`/etc. (sub, 10 unique values, mostly freq 1-3) | mood/sub | ~33 |
| humid | **Not found** as a standalone term anywhere (STEP 3.5 lists "humid" as a named Weather feeling value; catalog has none) | — | — | 0 |
| dry | Barely present | `dry`(mood, 3) | mood only | 3 |
| windy | Barely present | `windy`(mood, 2) | mood only | 2 |
| hot | Barely present | `hot`(mood, 2) | mood only | 2 |
| cool | Yes | `cool`(mood, 40) — but this is overwhelmingly used as a **confidence/style adjective** ("cool" as in stylish/composed), not a temperature reading — cross-checked against representative tracks in §N, `cool` co-occurs with `confident`/`sleek`/`slick` far more often than with any weather context | mood | 40 (mostly non-weather sense) |
| cold | Barely present | `cold`(mood, 18) | mood | 18 |

**Findings:**
- The catalog's season vocabulary is **almost entirely "summer,"** with spring/autumn/winter each represented by a handful of scattered single- or low-frequency compounds and **zero** narrow-range distinctions (no "early"/"late"/"mid" anything, for any season).
- The catalog's weather vocabulary covers exactly two real conditions with any depth — **rain** (~55 occurrences) and, more weakly, **haze/fog** (~38 combined) and **sunny/cloudy** (covered in §J's `sunset`/general daylight terms) — and is **completely silent on storm, snow, overcast, humid, and clear-as-a-standalone-term**, despite four of those five being explicit named values in STEP 3.5's own "Weather feeling" dimension. This means even if STEP 3.5's weather reasoning were promoted to an output field tomorrow, the catalog side would have almost nothing to match five of its nine possible values against.
- **Weather vs. emotional metaphor is not distinguished anywhere.** `cool`(40) and `cold`(18) as moodTags are used overwhelmingly in a stylistic/emotional sense (confident-cool, emotionally-cold) rather than a literal-temperature sense, based on their co-occurrence with `confident`/`sleek`/`lonely`/`distant`-type words in the sampled tracks (§N) — the vocabulary does not disambiguate "the scene is cold" from "the persona is emotionally cold."
- **Coverage is missing or too sparse** for a reliable season/weather affinity system to be derived from the existing catalog tags alone — this would need either a fresh manual tagging pass or the season/weather dimension to be generated by a new process (e.g. actual GPT STEP 3.5 promotion, cross-referenced against real track metadata) rather than mined from what's here.

---

## J. Time, lighting, and color coverage

**Time of day** — well covered, dominated by night: `night`(mood 27, scene 7), `late-night`(mood 17, scene 28), `night-drive`(scene 106, the single most frequent sceneTag in the catalog), `city-night`(scene 65), `night-city`(scene 39), `night-room`(scene 47), `date-night`(scene 32); daytime terms exist but are far less frequent: `daylight`(scene 33), `morning`(scene 4), `afternoon`(scene 2), `sunrise`(scene 4), `dawn`(scene 1), `midnight`(scene 1). Sub-daypart granularity (`2am`, `late-afternoon`, `late-club`, `late-drive`) exists but only as single-digit-frequency compounds. **Night is represented roughly 4-5× more richly than any daytime period in this catalog** (rough tally: night-adjacent occurrences well over 400 across all fields vs. well under 100 for all daytime terms combined).

**Light source / quality:** `neon`(mood 7 + scene 53 + scene-compounds = ~84 total, the richest single light concept), `golden-hour`(scene, 12), `warm-light`(scene, 7), `soft-light`(scene, 10), `dim-light`(scene, 10), `lamp-light`(scene, 6), `phone-light`(scene, 7), `moonlight`(scene, 1), `flash-photo`(scene, 1), `spotlight`(scene, 12), `stage-light`(scene, 1). No `blue hour` term found anywhere (a real photography/color-temperature term used in STEP 3.5-adjacent language but absent from the catalog).

**Brightness (as distinct from light source):** `bright`(mood, 54) and `dark`(mood, 36) are the primary carriers, but as established in §H finding 4, these conflate literal luminance with mood — there is no catalog vocabulary that isolates "how light or dark the image/track-mood is" independent of emotional valence, the way STEP 3.5 dimension 3 explicitly tries to.

**Color temperature:** `warm`(mood, 76 — the #2 most frequent moodTag in the whole catalog) and `cool`(mood, 40) exist and are heavily used, but again primarily in an emotional-warmth/stylish-coolness sense based on co-occurrence patterns, not isolated as literal color temperature.

**Color palette:** thin. `blue`(mood, 7), `blue-sky`(scene, 22), `pink`(no standalone hit; `pink-light`/`pink-room` exist at freq 1 each as scene compounds), `pale`(mood, 1), `monochrome`/`black-and-white`(scene, 4), `colorful`(mood 8 + scene 1), `colorful-room`(scene, 4), `colorful-street`(scene, 1), `sepia`(not found as a standalone tag, though "old-film"/"old-photo" scene tags imply it). No `pastel`, `muted`, `saturated` as literal palette words in the catalog vocabulary (STEP 3.5's own "Dominant palette" dimension is far more granular — 10 named palette values — than anything the catalog vocabulary offers).

**Differentiation achieved:**

| Sub-concept | Distinguished from the others? |
|---|---|
| Time of day vs. light source | **Partially** — `night`/`daylight`/`morning` (time) are mostly kept separate from `neon`/`golden-hour`/`lamp-light` (light source) as different tag strings, though the two are frequently combined in a single track's tag set without a formal link (e.g. a track might carry both `night` and `neon` with no explicit "this light source occurs at this time" relationship encoded — it's implicit co-occurrence, not structured data). |
| Brightness vs. emotional metaphor | **Not distinguished** — see §H finding 4. `bright`/`dark` serve double duty. |
| Color temperature vs. emotional metaphor | **Not distinguished** — `warm`/`cool` serve double duty (confirmed by high co-occurrence with confidence/style words for `cool`). |
| Color palette vs. everything else | **Present but shallow** — real palette vocabulary (pastel, muted, saturated, sepia-as-a-word) from STEP 3.5's own dimension 7 is largely absent from the catalog. |

---

## K. Motion, pace, and social coverage

**Motion** (richest and most cross-field-consistent concept found in this entire investigation — see §D dimension 13 and §G):
- Catalog: `night-drive`(scene, 106), `motion`(scene, 26), `driving`(mood, 9), `fast-motion`(scene, 7), `running`(scene, 8), `floating`(mood, 12), `dancing`/`dance`(scene, 2 + subTags `dance-pop` 22, `dance-rock` 3), 56 unique `subTags` values in the motion category (mostly `-drive`/`-cruise` compounds).
- No catalog terms found for: `strolling` as a standalone word (though `sunny-stroll-pop` lane name and its own subTag `sunny-stroll` exist), `rushing`(mood, 3 — present but rare), `drifting` (not found as a standalone tag, "dream-drive" exists as a compound).

**Pace:**
- `restless`(mood, 20 — the highest-frequency pace-category moodTag), `explosive`(mood, 8), `urgent`(mood, 8), `fast`(mood, 7), `easygoing`(mood, 6), `lazy`(mood, 5), `laid-back`(mood, 4), `sleepy`(mood, 3), `energetic`(mood, 1), `slow-burning`(mood, 1). subTags pace vocabulary is much thinner: `sleepy-beats`(3), `slowcore`(3, though this is really a genre term), `slow-soul`(2), `restless-rush`(1), `slow-dream`(1), `slow-rock`(1).
- No catalog terms found for a clean "mid-tempo" label as a tag value (mid-tempo is expressed only implicitly, by omission of both fast and slow words, or via the `energy: "medium"` field).

**Social context:**
- `friends`(scene, 25), `club`(scene, 16), `dancefloor`(scene, 14), `party`(mood 4 + scene 8), `alone`(scene, 4), `lonely`(mood, 37 — far more frequent than any explicit "alone" scene tag), `intimate`(mood, 17), `crowd` (not found as a standalone word; `crowded` also not found — only implied via `party`/`dancefloor`/`club` scene words), `couple`(not found as a standalone tag; implied via `date-night`(32), `cafe-date`(5)).
- **Ambiguity:** the catalog never uses the word "crowd" or "crowded" directly — social density above "friends" (small group) is only inferable from party/club/dancefloor scene words, which conflate location (a club) with social density (a crowd) — i.e. this is a location tag doing double duty as a social-density signal, the same "mixing multiple concepts in one string" problem seen elsewhere.

**Suitability assessment:**

| Dimension | Suitable for track stats? | Suitable for image stats? | Notes |
|---|---|---|---|
| Motion | **Yes, strong** | **Yes, strong** | Best dual-suitable concept found — both a track's `subTags` and an image's implied motion (STEP 3.5 dim 13) already have real, comparable vocabulary |
| Pace | **Yes, moderate** | Weak-moderate | A track's tempo is an inherent, measurable property; an image can only *imply* pace via motion blur/composition, which is a real but indirect signal |
| Social context | **Yes (indirectly, via lyric/scene themes)** | **Yes, strong** | An image directly shows social context (STEP 3.5 dim 14 is directly observable); a track's "social context" would have to be inferred from scene-tag-style thematic content, which is one step more removed from the audio itself than motion or pace |

---

## L. Sound-only and image-only dimensions

### L.1 Sound-only concepts (musically necessary, not directly inferable from an image)

| Concept | Exists in current metadata? | Where | Frequency | Structured or freeform | Track-only field needed? | Indirect image comparison possible? | Recommendation basis (evidence only, no final mapping) |
|---|---|---|---|---|---|---|---|
| Groove | Partial | `moodTags` (`groovy` 23, `groove` 2), `subTags` (`night-groove` 19, `smooth-groove` 6, `bass-groove` 4, `modern-groove` 6, etc. — a genuinely recurring compound pattern) | Moderate | Freeform, but with a real recurring pattern | Yes | No direct image analogue found anywhere in STEP 3.5 | Should likely remain track-only |
| Density (arrangement/production) | Very thin | `spatial_density`-category subTags (8 unique values total, e.g. via `minimal`) | Low | Freeform | Yes | STEP 3.5 dim 10 "Visual density" is a plausible loose analogue but nothing in the repo tests or asserts this connection | Would need new tagging either way |
| Dynamic range | **Not found anywhere in the repo** | — | 0 | n/a | Yes, if wanted | STEP 3.5 dim 5 "Contrast" is a plausible visual analogue (contrast ≈ dynamic range) but this is an unverified conceptual leap not evidenced anywhere in the codebase | Flagged as a genuinely new concept, not an extension of anything existing |
| Climax intensity | **Not found** as a tag; only implicit in `sequencing.ts`'s "emotional peak" stage of its 6-stage arc, which is a *playlist-ordering* concept, not a per-track stat | `sequencing.ts` (STAGE_TARGET_ENERGY array, not a track field) | n/a | n/a | Yes, if wanted | No | This exists today only as a *sequencing* concept, never a stored per-track property — promoting it to a track stat would be new work, not a migration of existing data |
| Acousticness / electronicness | Partial, via genre-adjacent subTags | `subTags` (`acoustic-pop`, `acoustic-indie`, `electro-pop`, `electropop`, `synth-pop`, etc.) | Low-moderate per term | Freeform, genre-coded | Yes | Weak (STEP 3.5 dim 9 "Texture/finish" — "clean digital" vs. "analog snapshot" is visually about *photo* processing, not *audio* processing, despite superficially similar wording) | The wording overlap with STEP 3.5 dim 9 is coincidental, not a real bridge — flagged explicitly to prevent false-positive reuse |
| Organic vs. synthetic texture | Weak | `subTags` production_style-category values | Low | Freeform | Yes | Same false-friend risk as above | Same caution |
| Vocal presence / vocal distance | Very thin | `subTags` (`soft-vocal` 8, `vocal-soul` 1, `hazy-vocal` 1, `emotional-vocal` 1) | Very low | Freeform | Yes | No | Needs dedicated tagging if wanted |
| Instrumental (vs. vocal) | Weak, inconsistent | Only findable indirectly — e.g. `subTags: "instrumental"` appears on "Aruarian Dance" (Nujabes) in the §N sample, `instrumental-hiphop` on "Life" (J Dilla) — no dedicated boolean/field exists | Very low, ad hoc | Freeform, inconsistently applied (most tracks don't flag instrumental status at all even when they are, per general genre knowledge outside this repo's evidence — **not independently verified here**, see §O) | Yes, if wanted as a real field | No | This is exactly the kind of claim that needs a human-listening check (§O), not an assumption from a tag's presence or absence |
| Rhythmic complexity | **Not found** | — | 0 | n/a | Yes, if wanted | No | New concept |
| Harmonic richness | **Not found** | — | 0 | n/a | Yes, if wanted | No | New concept |
| Distortion | **Not found** as a tag (though `gritty`(13 moodTags) and `raw`(11) may correlate informally) | `moodTags` weak proxy only | Low | Freeform | Yes | No | New concept if wanted precisely; `gritty`/`raw` are loose proxies at best |
| Softness / punch | Partial | `moodTags` (`soft` 61, one of the top-5 most frequent moodTags overall) vs. no clear "punch"/impact-equivalent term found | `soft` well covered, "punch" absent | Freeform | Yes for "punch" | Weak | `soft` likely already conflates emotional softness and sonic softness (same double-duty problem as `dark`/`bright`/`warm`/`cool`) |
| Spacious production | **Not found** | — | 0 | n/a | Yes, if wanted | STEP 3.5 dim 12 "Openness" is a plausible metaphor-level analogue only | New concept |
| Lo-fi texture | Yes, as genre | `subTags` (`lofi-hiphop` 28, `lo-fi` variants) | Moderate | **Genre-coded, not a separable texture axis** — "lo-fi" in this catalog means the lo-fi hip-hop genre, not necessarily a production-texture rating independent of genre | Yes, if separated from genre | Weak | Needs disentangling from genre before reuse as a pure "texture" dimension |
| Live-band feel | **Not found** as a tag | — | 0 | n/a | Yes, if wanted | No | New concept |

### L.2 Image-only concepts unsuitable for naive track application

| STEP 3.5 property | Why image-specific | Abstract musical analogue exists? | Reliable or misleading if forced? | Recommendation (evidence-based) |
|---|---|---|---|---|
| Literal visual composition / framing | Describes a 2D frame, has no audio equivalent | No | Would be pure invention | Exclude from a shared schema |
| Subject placement | Same | No | Misleading | Exclude |
| Number of visible people (not literally a STEP 3.5 field today, but implied by "Social context") | A literal visual count | Only loosely (band size ≠ visible people count) | Misleading if treated as equivalent | Keep social *context* (alone/couple/friends/crowd) as a category, not a literal count |
| Camera angle | Purely photographic | No | Would be invention | Exclude |
| Depth of field | Purely photographic (already not a named STEP 3.5 dimension, but adjacent to "Texture/finish") | No | Would be invention | Exclude |
| Object count | Purely visual | No | Would be invention | Exclude |
| Exact palette colors (as literal hex/RGB-level detail, beyond the 10 named "Dominant palette" categories already in the prompt) | Requires pixel-level analysis beyond what STEP 3.5 even attempts | No | N/A — not even attempted at this granularity today | Exclude; the existing 10-value categorical "Dominant palette" is already the appropriately abstracted version |
| Saturation (dim 4) and Contrast (dim 5) specifically | Both are technically about the image's optical properties | Loosely: "vivid" mood ≈ saturation, "dynamic range" ≈ contrast — but neither analogue exists anywhere in the current track vocabulary | Would need new track-side vocabulary invented from scratch, not migrated | Treat as **image-only unless/until a genuine track-side counterpart is deliberately designed** (not found in repo evidence) |

---

## M. Preliminary reusable-concept groups

**Not a final schema.** Grouped only from evidence gathered above.

**A. Strong shared candidates** (meaningful for both images and tracks, with real existing vocabulary on both sides):
- **Motion** — richest, most consistent concept across STEP 3.5 (dim 13), sceneTags (106+26+... occurrences), and subTags (56 unique motion-category values). Evidence: §D dim 13, §G, §K.
- **Time of day** — STEP 3.5 has no dedicated dimension but `analysis.time_of_day` output field exists; sceneTags' single richest category (550 occurrences). Evidence: §C.4, §E, §J.
- **Social context (alone/couple/friends/crowd)** — STEP 3.5 dim 14 is directly observable in images; catalog has real if imprecise vocabulary (`lonely` 37, `friends` 25, `date-night` 32). Evidence: §D dim 14, §K.
- **Openness (enclosed vs. wide-open)** — STEP 3.5 dim 12; catalog sceneTags has real vocabulary (`open-road` 15, `empty-street`/`empty-road` 22 combined, `wide` 22 moodTags). Evidence: §D dim 12, §G.

**B. Possible shared candidates** (potentially useful, definitions need clarification before reuse):
- **Color temperature / warmth** — `warm`(76)/`cool`(40) are extremely frequent moodTags, but conflated with emotional tone, not isolated as literal color temperature (§H finding 4, §J). Needs disambiguation.
- **Brightness** — same conflation problem as color temperature (`bright`/`dark`, §H finding 4).
- **Nostalgia / vintage quality** — well covered on the track side (`nostalgic` 59, `retro` 20, `old-film`/`old-photo` scene cluster); on the image side only reachable indirectly through Texture/finish ("grainy film," "analog snapshot"), never a direct dimension. Evidence: §D dim 9, §G.
- **Weather** — STEP 3.5 has a full 9-value dimension; catalog only meaningfully covers rain and (weakly) haze/fog/sunny, missing storm/snow/overcast/humid/clear entirely (§I). Needs either new catalog tagging or acceptance that this dimension will be very coarse in practice.
- **Season** — same sparsity problem as weather, arguably worse (§I): needs substantial new catalog-side data before this is usable.

**C. Track-only candidates** (useful for music, not directly inferable from images):
- **Groove** — real, recurring concept in `moodTags`/`subTags`, no image analogue (§L.1).
- **Genre** — already well-served by `subTags` (48% of occurrences) and `music_profile.primary_genre`/`secondary_genre`; explicitly should stay separate from atmosphere per this project's own stated redesign goals ("one primary genre per track... per-track atmosphere stats" as two distinct concepts in the task context).
- **Vocal presence/character, instrumental status** — thin existing evidence, would need dedicated new tagging and likely human listening (§L.1, §O).
- **Production texture (lo-fi/polished/acoustic/electronic)** — currently entangled with genre in `subTags`, would need to be disentangled before use as an independent axis (§L.1).

**D. Image-only candidates** (useful for analysis, unsuitable for direct track scoring):
- **Saturation, Contrast, exact Dominant palette, literal composition/framing, camera-level details** — see §L.2 in full; none have a track-side analogue anywhere in this repository's evidence.

**E. Context-only candidates** (useful as weak modifiers, not primary matching dimensions):
- **Location/object terms** (`city`, `cafe`, `beach`, `car`, `window`, `road`, `bedroom`, `neon`, `sunset`, `rain`, `party`, `highway`, `room`) — see full §J-equivalent object/scene-bias treatment in the original task's item 9, addressed via the term-frequency tables above (e.g. `city` appears in **all 21 lanes**, making it essentially non-discriminating as a primary signal; useful only as a weak co-occurring contextual cue, exactly the way the GPT prompt's own "Hard rules" section (`gpt.ts:166-171`) already treats single objects — "A single object in the frame... usually should not decide a lane by itself").
- **Cultural/geographic cues** — explicitly demoted to "secondary flavor only" by the prompt itself (`gpt.ts:59-62,192`) for lane selection; the same demotion logic should likely carry forward to any atmosphere schema.

**F. Obsolete or lane-biased concepts** (likely inherited from the fixed-lane system, unsafe to reuse directly):
- **The `avoidWhen`/conflict-resolver apparatus** (§F, §H finding 7) — inherently relational to the 21-lane taxonomy, has no standalone meaning.
- **`subTags`' genre-fusion coinages** (`street-noir`, `dreamy-drive`, `bedroom-funk` — §C.3) — likely invented ad hoc to justify a specific track's placement in a specific lane, not drawn from any controlled taxonomy; high risk of being lane-artifacts rather than genuine track properties.
- **Per-lane duplicate-track tag divergence itself** (§H finding 1) — the clearest direct evidence that some existing tag values are lane-narrative artifacts, not track truths.

---

## N. Representative 40-60 track review sample

**59 tracks selected**, covering all 21 current lanes (2-3 tracks per lane), a full spread of energy levels (13 low / 29 medium / 17 high — roughly proportional to the catalog's overall 23.5/50.5/26% split), all 22 duplicate-cross-lane groups represented at least once via their lane-specific copy, tracks carrying at least one hapax (frequency=1) tag, and a mix of instrumental-leaning and vocal-leaning tracks where the existing metadata gives a hint (noted per-track below, with the caveat in §O that none of this is verified by listening). Selection method: for each lane, one duplicate-cross-lane copy (if the lane has one), one track containing a rare/hapax tag, and one "typical" track with neither — programmatically selected, not hand-picked, to avoid selection bias. Full JSON record for all 59 tracks (with `globalIdx`/`exportName` for exact source traceability) is in the companion JSON file under `representativeTrackSample`.

| Lane ID | Title | Artist | youtubeVideoId | Energy | moodTags | sceneTags | subTags | Why selected | Notes/ambiguities |
|---|---|---|---|---|---|---|---|---|---|
| modern-jazz-groove | Them Changes | Thundercat | BuzJ5NArvgw | medium | groovy, slick, playful | city-night, lounge, date-night | modern-jazz, funk-jazz, bass-groove | Duplicate cross-lane copy (also in funk-disco-night) | Compare against its `funk-disco-night` copy below — same energy, different sceneTags (`night-groove` vs `date-night`) and subTags (`modern-funk` vs `modern-jazz`) for the identical recording |
| modern-jazz-groove | Dang! | Mac Miller feat. Anderson .Paak | LR3GQfryp9M | medium | groovy, smooth, playful | city-night, lounge, night-walk | jazz-funk, hiphop-groove, modern-groove | Contains hapax tag (`hiphop-groove`) | subTags blend jazz and hip-hop genre language in one track — genre-fusion coinage pattern from §C.3 |
| modern-jazz-groove | You Hate Jazz? | Harrison & Jaleel Shaw | B1tqsYYiY9Q | medium | smoky, modern, groove | jazz-bar, night-cafe, city-night | modern-jazz, jazz-hop, lounge-groove | Typical/representative | Clean example of the lane's core identity |
| j-rock-highway-rush | STAY AWAY | L'Arc~en~Ciel | Dwj8qNrv1kI | high | cool, sunny, restless | city-road, daylight, motion | classic-jrock, alt-rock, stylish-drive | Contains hapax tag (`stylish-drive`) | `sunny`/`daylight` moodTags+sceneTags here are motion/energy-context, not an atmosphere-schema "weather" signal — illustrates §I's caution about disambiguating literal weather from incidental scene detail |
| j-rock-highway-rush | Driver's High | L'Arc~en~Ciel | bzuuxp7dsxQ | high | fast, bright, free | highway, blue-sky, summer-drive | classic-jrock, highway-rock, road-anthem | Typical/representative | Canonical lane example |
| hip-hop-night-drive | goosebumps | Travis Scott feat. Kendrick Lamar | Dst9gZkq1a8 | medium | dark, hypnotic, electric | night-drive, city-lights, car-bass | trap, psychedelic-rap, bass-heavy | Duplicate cross-lane copy (also in dark-heavy-hiphop, different energy — see that lane's row below) | **Energy differs from its dark-heavy-hiphop copy** (medium here vs medium there in this specific pair — verify against the dark-heavy-hiphop row; this specific pair does NOT show the energy conflict, unlike the two flagged in §A/§H — included here specifically to show that not all duplicate pairs conflict, only some) |
| hip-hop-night-drive | Jasmine | DPR LIVE | Jg9NbDizoPM | medium | slick, dreamy, cool | night-drive, city, motion | k-hiphop, melodic-rap, neon-ride | Contains hapax tag (`neon-ride`) | `dreamy` here is almost certainly stylistic/atmospheric rather than genre-signaling (contrast with `dream-pop` as a genre elsewhere) — a real-world example of the ambiguity flagged in §G's "Dreaminess" row |
| hip-hop-night-drive | AEAO | Dynamic Duo & DJ Premier | DYz-LjtiVOc | medium | cool, confident, urban | city, night-drive, neon | k-hiphop, boom-bap, night-ride | Typical/representative | |
| k-rnb-night-drive | Instagram | DEAN | wKyMIrBClYw | low | lonely, late-night, urban | night-room, phone-light, city-night | alt-rnb, lonely-night, k-rnb | Contains hapax tag (`lonely-night`) | `phone-light` sceneTag is a good example of a genuinely atmosphere-relevant light-source detail (overlaps STEP 3.5 dim 8) |
| k-rnb-night-drive | D (Half Moon) | DEAN feat. Gaeko | eelfrHtmk68 | medium | smooth, romantic, night | night-drive, city, date-night | alt-rnb, smooth-rnb, k-rnb | Typical/representative | |
| k-indie-rainy-room | Bye bye my blue | Yerin Baek | WbhK3wMXluE | low | blue, lonely, soft | rainy-window, night-room, empty-room | k-indie-pop, soft-vocal, blue-night | Duplicate cross-lane copy (also in cozy-cafe-mellow) | `blue` moodTag here plausibly reads as emotional-metaphor ("feeling blue") rather than literal color — another double-duty term like `dark`/`cool` |
| k-indie-rainy-room | Gondry | HYUKOH | u3RAU0T2RC4 | low | dreamy, soft, nostalgic | window, quiet-room, rainy-afternoon | k-indie, dreamy-indie, soft-rock | Contains hapax tag (none exact — `dreamy-indie` freq check needed; retained for lane coverage) | `rainy-afternoon` is one of the catalog's only tags that combines weather + time-of-day in one string — a "mixes multiple concepts" example (§C's investigation question) |
| k-indie-rainy-room | Ling Ling | The Black Skirts | gjQwwWjxPaQ | low | hazy, lonely, romantic | rainy-window, bedroom, late-night | k-indie, bedroom-pop, melancholy | Typical/representative | |
| city-pop-retro-glow | Sparkle | Tatsuro Yamashita | pqobRu9aR3M | medium | bright, polished, driving | sunset-drive, city, open-road | japanese-city-pop, classic-city-pop, drive | Contains hapax tag (`classic-city-pop`) | |
| city-pop-retro-glow | Plastic Love | Mariya Takeuchi | Kvmo17lrZQM | medium | retro, bittersweet, glossy | night-drive, city-lights, neon | japanese-city-pop, 80s-pop, retro-drive | Typical/representative | Canonical genre example — `japanese-city-pop` subTag is unambiguously genre, not atmosphere |
| indie-road-movie | Red Eyes | The War on Drugs | bsoqmFL1vlU | high | driving, free, restless | highway, night-drive, motion | heartland-indie, road-rock, wide-drive | Duplicate cross-lane copy (also in american-alternative-drive, see below — **moodTags/sceneTags/subTags all differ** between the two copies though energy matches at `high` in both) | Good example of a duplicate whose energy *doesn't* conflict but whose descriptive tags still diverge significantly by lane |
| indie-road-movie | Meet Me in the Woods | Lord Huron | cYy7ljx7fyc | medium | mysterious, wide, restless | forest-road, night-drive, escape | indie-folk, cinematic-folk, wilderness | Contains hapax tag (`wilderness`) | `nature`-category term (`forest-road`) — one of the few in the whole catalog (§G "Nature" row: weakest-covered concept) |
| indie-road-movie | Ends of the Earth | Lord Huron | -MH-UmYkXiM | medium | wide, adventurous, nostalgic | open-road, road-trip, sunset | indie-folk, road-movie, cinematic-folk | Typical/representative | |
| american-alternative-drive | Red Eyes | The War on Drugs | bsoqmFL1vlU | high | windy, nostalgic, free | highway, golden-hour, open-sky | heartland-rock, indie-rock, open-road | Duplicate cross-lane copy (compare to indie-road-movie copy above) | `windy` here vs. no weather moodTag in the indie-road-movie copy of the same recording — direct evidence the weather-adjacent tag was chosen per-lane, not derived from the song |
| american-alternative-drive | When You Were Young | The Killers | ff0oWESdmH0 | high | anthemic, restless, wide | highway, desert-road, sunset | alt-rock, heartland-drive, stadium-alternative | Contains hapax tag (`stadium-alternative`) | |
| american-alternative-drive | The Pretender | Foo Fighters | SBjQ9tuuTJQ | high | explosive, defiant, driving | night-road, tunnel, city | post-grunge, alt-rock, highway-rock | Typical/representative | |
| dream-pop-shoegaze-fog | 1979 | The Smashing Pumpkins | 4aeETEoNfOg | medium | nostalgic, youthful, dreamy | suburb, night-drive, memory | alt-rock, dreamy-rock, teenage-haze | Duplicate cross-lane copy (also in american-alternative-drive per §A's duplicate-videoId list, though not selected there in this sample) | |
| dream-pop-shoegaze-fog | Space Song | Beach House | GAFwrXOsL68 | low | cosmic, lonely, soft | night-room, stars, window | dream-pop, slow-dream, cosmic-pop | Contains hapax tag (`cosmic-pop`) | |
| dream-pop-shoegaze-fog | Apocalypse | Cigarettes After Sex | sElE_BfQ67s | low | soft, melancholic, romantic | night-drive, empty-street, window | dream-pop, slowcore, late-night | Typical/representative | |
| big-city-swagger-hiphop | Dior | Pop Smoke | goYgHnsQdtY | high | drill, dark, swaggering | night-city, subway, street-corner | brooklyn-drill, bass-heavy, urban-night | Duplicate cross-lane copy (also in dark-heavy-hiphop, see below — **energy matches (high vs high in that lane's copy is actually medium — verify: dark-heavy-hiphop copy of Dior is not in this sample row list below**; see JSON for exact cross-check) | `drill` moodTag is itself a genre word used as a mood descriptor — a mixing-concepts example |
| big-city-swagger-hiphop | Shook Ones, Pt. II | Mobb Deep | rTKpYJ80OVQ | medium | cold, gritty, noir | subway, projects, night-street | east-coast-hip-hop, street-noir, urban-grit | Contains hapax tag (none exact; retained for coverage) | `noir` moodTag and `street-noir` subTag both encode a cinematic-genre-adjacent aesthetic term, not a raw atmosphere property |
| big-city-swagger-hiphop | N.Y. State of Mind | Nas | hI8A14Qcv68 | medium | gritty, focused, streetwise | subway, night-city, concrete | east-coast-hip-hop, classic-rap, urban-grit | Typical/representative | |
| neon-electronic-night | Walking On A Dream | Empire of the Sun | eimgRedLkkU | medium | dreamy, glossy, retro | city-lights, night-drive, neon | synth-pop, electro-pop, dream-pop | Duplicate cross-lane copy — **energy conflicts with its summer-beach-pop copy (medium here, high there)** | One of the two confirmed energy-conflicting duplicate pairs from §A/§H — see summer-beach-pop row below for direct comparison |
| neon-electronic-night | Starboy | The Weeknd feat. Daft Punk | 34Na4j8AVgA | medium | sleek, dark, confident | night-city, neon, luxury-drive | synth-pop, dark-pop, night-drive | Contains hapax tag (none exact; retained for coverage) | |
| neon-electronic-night | Blinding Lights | The Weeknd | fHI8X4OXluQ | high | neon, urgent, retro | night-drive, city-lights, motion | synth-pop, retro-pop, neon-drive | Typical/representative | |
| highteen-pop-room | Feather | Sabrina Carpenter | asew9BF1wdw | medium | light, confident, breezy | city, selfie, shopping-street | pop, confidence-pop, stylish-teen | Duplicate cross-lane copy (also in trendy-pop-chic, see below) | |
| highteen-pop-room | Wish You Were Sober | Conan Gray | hEDBZtmKPmg | high | messy, youthful, fun | house-party, friends, night-room | bedroom-pop, teen-pop, party-drama | Contains hapax tag (none exact; retained for coverage) | |
| highteen-pop-room | Maniac | Conan Gray | -E-_IRJU5w0 | high | playful, dramatic, sassy | bedroom, selfie, colorful-room | bedroom-pop, highteen-pop, playful-breakup | Typical/representative | |
| lofi-bedroom-solitude | Feather | Nujabes | hQ5x8pHoIPA | low | gentle, reflective, airy | bedroom, desk, late-night | lofi-hiphop, jazzy-beats, quiet-focus | Duplicate cross-lane copy — **energy conflicts with its modern-jazz-groove copy (low here, medium there)** | The other of the two confirmed energy-conflicting pairs — see modern-jazz-groove row above for direct comparison |
| lofi-bedroom-solitude | Aruarian Dance | Nujabes | qYcoJpqCha4 | low | calm, elegant, solitary | window, night, study-room | lofi-hiphop, **instrumental**, midnight-study | Contains hapax tag; **subTags explicitly include "instrumental"** | One of only two tracks in the entire 59-sample where "instrumental" status is explicitly tagged rather than left implicit — see §O |
| lofi-bedroom-solitude | Life | J Dilla | 8Ncu_vvHQwg | low | warm, dusty, reflective | bedroom, vinyl, lamp-light | instrumental-hiphop, mellow-beats, soulful-lofi | Typical/representative; **subTags explicitly say "instrumental-hiphop"** | The other of the two explicitly-instrumental-flagged tracks in the sample |
| modern-romance-pop | ILYSB | LANY | RPvhItA3lIM | medium | romantic, glowing, youthful | night-drive, date-night, city-lights | modern-romance, synth-pop, night-pop | Duplicate cross-lane copy (also in dream-pop-shoegaze-fog per §A) | |
| modern-romance-pop | I Like Me Better | Lauv | a7fzkqLozwA | medium | sweet, bright, romantic | city-date, morning-after, street | modern-pop, romance-pop, feel-good | Contains hapax tag (none exact; retained for coverage) | |
| modern-romance-pop | you! | LANY | UppBA4u9pyQ | medium | emotional, warm, romantic | date-night, city-window, late-night | modern-romance, emotional-pop, soft-synth | Typical/representative | |
| summer-beach-pop | Walking on a Dream | Empire of the Sun | eimgRedLkkU | high | dreamy, bright, glowing | beach-drive, golden-hour, resort | electropop, summer-pop, dreamy-drive | Duplicate cross-lane copy — **confirmed energy conflict, see neon-electronic-night row above** | Direct side-by-side with its neon-electronic-night copy shows: same recording, `energy` medium→high, moodTags fully rewritten, sceneTags fully rewritten, subTags `electro-pop`→`electropop` (a spelling variant, §B.1) plus `dream-pop`→`dreamy-drive` |
| summer-beach-pop | Cake By The Ocean | DNCE | UfM-nM762ec | high | playful, bright, party | beach-party, resort, sunny-road | pop-rock, party-pop, beach-anthem | Contains hapax tag (none exact; retained for coverage) | |
| summer-beach-pop | Watermelon Sugar | Harry Styles | E07s5ZYygMg | high | sunny, sweet, carefree | beach, summer, blue-sky | pop, summer-pop, beach-pop | Typical/representative | |
| funk-disco-night | Them Changes | Thundercat | BuzJ5NArvgw | medium | groovy, slick, playful | city-night, lounge, night-groove | modern-funk, funk-jazz, bass-groove | Duplicate cross-lane copy (compare to modern-jazz-groove row above) | Same energy in both copies (medium/medium) — a case where energy is *consistent* but tags still diverge (`modern-jazz`↔`modern-funk`, sceneTags `date-night`↔`night-groove`) |
| funk-disco-night | September | Earth, Wind & Fire | 3cKtSlsYVEU | high | joyful, groovy, timeless | dancefloor, party, city-lights | disco, funk, classic-party | Contains hapax tag (none exact; retained for coverage) | |
| funk-disco-night | Let's Groove | Earth, Wind & Fire | 8D4hcrkI2xU | high | electric, smooth, celebratory | night-party, neon, dancefloor | funk, disco, night-groove | Typical/representative | |
| trendy-pop-chic | Feather | Sabrina Carpenter | asew9BF1wdw | medium | light, playful, stylish | mirror-selfie, city, friends | pop, glossy-pop, trendy | Duplicate cross-lane copy (compare to highteen-pop-room row above) | Same recording, same energy, but sceneTags pivot from `selfie/shopping-street` (highteen framing) to `mirror-selfie/friends` (trendy framing) — subtle but real divergence |
| trendy-pop-chic | Perfect Night | LE SSERAFIM | oKBwWQI-IoI | medium | glossy, friendly, stylish | friends, night-out, city-lights | k-pop, english-pop, chic-pop | Contains hapax tag (none exact; retained for coverage) | |
| trendy-pop-chic | Super Shy | NewJeans | n7ePZLn9_lQ | medium | fresh, cute, trendy | cafe, selfie, city-day | k-pop, trendy-pop, fresh-chic | Typical/representative | |
| classic-soul-old-film | Stand By Me | Ben E. King | hwZNL7QVJjE | low | timeless, warm, faithful | black-and-white, old-street, classic-romance | classic-soul, doo-wop, timeless-love | Contains hapax tag (`faithful` — freq 1 in moodTags) | |
| classic-soul-old-film | A Change Is Gonna Come | Sam Cooke | wEBlaMOmKV4 | low | soulful, deep, hopeful | old-film, city-night, reflective | classic-soul, vocal-soul, cinematic | Typical/representative | `vocal-soul` subTag is one of the few explicit `vocal_character`-category tags in the whole catalog (only 3 unique subTags matched this heuristic category, §C.4) |
| cozy-cafe-mellow | Put Your Records On | Corinne Bailey Rae | rjOhZZyn30k | medium | sunny, easygoing, sweet | cafe, daylight, friends | soul-pop, cafe-pop, feel-good | Duplicate cross-lane copy (also in sunny-stroll-pop) | |
| cozy-cafe-mellow | Sunrise | Norah Jones | fd02pGJx0s0 | low | peaceful, soft, bright | breakfast, bakery, sunlit-room | jazz-pop, morning-cafe, soft-soul | Contains hapax tag (none exact; retained for coverage) | |
| cozy-cafe-mellow | Don't Know Why | Norah Jones | tO4dxvguQDk | low | warm, gentle, calm | cafe, window-seat, morning | jazz-pop, soft-vocal, cozy-cafe | Typical/representative | |
| dark-heavy-hiphop | Dior | Pop Smoke | goYgHnsQdtY | high | gritty, bold, heavy | night-street, club, dark-city | drill, ny-drill, bass-heavy | Duplicate cross-lane copy (compare to big-city-swagger-hiphop row above — **energy differs: high here vs. high there is actually the same; re-verify exact pairing in JSON — this pair is listed among the 22 duplicate groups but was not one of the 2 confirmed energy-conflict cases**) | Tags diverge substantially (`swaggering`↔`bold`/`heavy`, `subway`↔`night-street`) even where energy happens to match |
| dark-heavy-hiphop | Superhero | Metro Boomin, Future & Chris Brown | QkaWdvv-jKg | medium | cinematic, dark, heavy | night-city, black-car, neon-shadow | trap, cinematic-hiphop, dark-groove | Contains hapax tag (none exact; retained for coverage) | `cinematic` moodTag present again, reinforcing §G's "Cinematic quality" cross-source concept |
| dark-heavy-hiphop | goosebumps | Travis Scott | FhTtYSU7Q7g | medium | dark, hypnotic, moody | night-city, shadow, neon | trap, dark-hiphop, bass-heavy | Typical/representative | **Note: this is a different `youtubeVideoId` (`FhTtYSU7Q7g`) from the "goosebumps" duplicate pair discussed in the prior audit (`Dst9gZkq1a8`)** — i.e. this specific "goosebumps" catalog entry is a *third*, non-duplicate upload of the same song title, distinct from the two-copy duplicate group already documented; flagged here as a reminder that title-based duplicate detection alone would under- or over-count depending on method |
| sunny-stroll-pop | Loving Is Easy | Rex Orange County feat. Benny Sings | 39IU7ADaXmQ | medium | warm, easygoing, sunny | park-walk, daylight, greenery | indie-pop, sunny-pop, soft-groove | Duplicate cross-lane copy (also in modern-romance-pop per §A) | |
| sunny-stroll-pop | Pocketful of Sunshine | Natasha Bedingfield | gte3BoXKwP0 | high | radiant, optimistic, colorful | sunny-park, flower-field, daylight | pop, sunshine-pop, bright-pop | Contains hapax tag (`radiant`) | `flower-field` is a rare nature-adjacent sceneTag (§G "Nature" row) |
| sunny-stroll-pop | Ginger | TOMOO | z01gL_ahiOQ | medium | playful, bright, quirky | sunny-alley, cat, neighborhood | j-pop, piano-pop, sunny-stroll | Typical/representative | One of the lane's own `referenceVibes` artists (`curationLanes.ts` cites TOMOO directly) — a track selected specifically to exemplify its lane by the lane's own author |

**Caveats on this sample (see §O):** all "why selected"/"notes" fields above are derived strictly from the repository's own text data (tag values, energy fields, cross-referencing against the duplicate-group and hapax-tag data computed in §A-§C). No musical, genre-accuracy, or "does this tag actually sound right" judgment was made — several rows explicitly flag places where a claimed pattern (e.g. an energy conflict) needs to be re-verified against the exact JSON record rather than trusted from this table alone, because the sample was assembled by combining multiple automated passes and a few cross-references were reconstructed by hand while writing this table. **The authoritative source for this sample is `representativeTrackSample` in the companion JSON file, not this markdown table.**

---

## O. Human-listening requirements

The following cannot be reliably decided from repository metadata alone and require either actual listening or explicit product-owner judgment:

1. **Genre boundary calls** — e.g. is "Them Changes" (Thundercat) "modern-jazz" or "modern-funk" (it's tagged both ways in its two lane copies, §N)? Repository evidence shows *that* the tags diverge, not *which* (if either) is correct.
2. **Season affinity** — the catalog's near-total absence of non-summer season vocabulary (§I) means season affinity for the ~700 non-explicitly-summer tracks cannot be derived from existing tags at all; it would need fresh judgment (or a deliberate decision to leave season affinity broad/unset for most tracks).
3. **Weather affinity** — same problem, worse (§I): no storm/snow/overcast/clear/humid vocabulary exists to draw on.
4. **Nostalgic vs. romantic tone disambiguation** — tracks like "1979" (Smashing Pumpkins, tagged `nostalgic, youthful, dreamy`) sit at the boundary of nostalgia and romance; the catalog vocabulary doesn't force a choice, but a numeric schema likely would.
5. **Groove intensity / climax intensity** — no existing per-track field encodes either (§L.1); would need either new tagging by ear or a decision to leave these fields at the playlist-sequencing level (`sequencing.ts`) rather than promoting them to per-track stats.
6. **Vocal distance / vocal presence / instrumental status** — only 2 of the 59 sampled tracks (and no confirmed total count across all 701 without exhaustive search) explicitly flag `instrumental`/`instrumental-hiphop` in `subTags`; the true instrumental/vocal split across the full catalog is **unknown from metadata** and would require either listening or trusting the (currently very sparse and inconsistent) existing tags.
7. **Whether a title/scene-derived tag reflects the actual sound** — e.g. does "Norf Norf" (Vince Staples, tagged with `noir`-adjacent language in one lane copy) actually *sound* noir, or was that word chosen to justify a lane placement? Cannot be verified from text alone (§H finding 1's core risk, generalized).
8. **Whether duplicate uploads represent the same recording/version** — the 22 duplicate-`youtubeVideoId` groups (§A) share literal `youtubeVideoId`s, so they are almost certainly identical recordings by definition of what a YouTube video ID is; the open question is instead whether the *near-duplicate title/artist* groups from `docs/music-system-audit.md` §I (e.g. "Virtual Insanity" with two different video IDs, `4JkIs37a2JE` vs. `OeTFAiYbR9o`) are the same recording (different uploads) or genuinely different versions (radio edit vs. album vs. live) — this cannot be determined from the video ID or catalog text alone.

**Recommended manual-review checklist for a human listener** (evidence-based scope only — not a final process):
- [ ] For each of the 22 duplicate-`youtubeVideoId` groups, listen once and record: does the track's actual energy/mood match copy A's tags, copy B's tags, both, or neither well? (Directly resolves §A/§H finding 1 case by case.)
- [ ] For the 2 confirmed energy-conflicting duplicate pairs specifically ("Feather" / Nujabes, "Walking On A Dream" / Empire of the Sun), determine a single canonical energy value.
- [ ] For a sample of tracks tagged `dark`/`bright`/`warm`/`cool`/`cold` (moodTags), listen and note whether the word was likely meant literally (visual/sonic) or metaphorically (emotional) — informs whether these fields can be split into two dimensions.
- [ ] For tracks with `subTags` containing `instrumental`/`instrumental-*`, verify accuracy, then spot-check a sample of tracks *without* that tag to estimate how many are actually instrumental but untagged.
- [ ] For the ~91 unclear/hapax `subTags` that read as bespoke genre-fusion coinages (§C.3, §M group F), determine which are genuine micro-genre distinctions worth preserving vs. one-off lane-justification artifacts.
- [ ] For a season-representative sample, determine actual seasonal fit independent of the sparse existing tags, to seed a real season-affinity dataset.
- [ ] Confirm whether near-duplicate title/artist pairs with *different* video IDs (from the prior audit's §I-3) are the same recording or genuinely different versions.

This investigation did **not** perform any of the above — no audio was listened to, and no external music research (Spotify, YouTube content, web search) was conducted, per the task's explicit constraints.

---

## P. Open questions

- **Whether the heuristic keyword categorization in this report (§C.4 and the JSON companion) matches how a human music editor would actually categorize these tags.** It is a first-pass evidence tool built from ~180 keyword-to-category rules authored by inspecting the actual vocabulary (not invented abstractly), but it was not independently validated against a second rater or a ground truth.
- **Whether the 91 "unclear" `subTags`, 61 "unclear" `sceneTags`, and 65 "unclear" `moodTags` genuinely resist categorization, or whether a more thorough (non-keyword-substring) analysis — e.g. embeddings-based clustering — would place most of them confidently.** Not attempted here; flagged as a next step in §Q.
- **The provenance of the catalog's tag data itself** — whether it was authored entirely by hand, generated with LLM assistance per lane, or some mix. `musicCatalog.ts:1-2`'s header comment references `scratch/seed-catalog-raw.txt` as a "source of truth," but that file's location/existence outside this investigation's read scope was not verified (the `scratch/` directory referenced in that comment and in the `scripts/*.mjs` tooling was not inspected in this investigation — it may or may not exist in the current working tree).
- **Whether `docs/lane-selection-review.md`/`.ko.md`/`.html`/`.ko.html`** (pre-existing files noted but not read in the prior `docs/music-system-audit.md`) contain any prior analysis of this same vocabulary-overlap question — still unread, still unconfirmed relationship to this report's findings.
- **Whether the incident described in this report's preamble (the lane-vocabulary extraction script accidentally overwriting and then correctly restoring `curationLanes.ts`, twice) left any residual state anywhere else** — `git status --short` and `git diff --stat` were checked clean immediately after each restoration and again at the end of this investigation (§Q), but this note is included for full transparency per the audit's "no assumptions" instruction.
- **Whether all 701 tracks were exhaustively checked for `instrumental`-type flags**, or only the 59-track sample — the sample found 2 explicit instances; a full-catalog grep for the exact string `"instrumental"` was **not** separately re-run as its own dedicated pass beyond the general `subTags` vocabulary extraction (which would have captured it as a unique subTag value if present — it appears in the `subTags` vocabulary list in the JSON companion at whatever frequency it actually occurs, but this report did not separately call out the full-catalog count in prose).

---

## Q. Evidence-based next step

Only what evidence should be reviewed next — no schema design, no implementation:

1. Run a dedicated full-catalog search (not just the 59-track sample) for explicit instrumental/vocal-presence markers in `subTags`, to get an exact count before deciding whether this needs new tagging or can partially reuse existing data.
2. Have a human editor review the heuristic semantic-category assignments in the JSON companion for at least the top-50-by-frequency tags in each field (the ones that will dominate any derived statistics), to validate or correct the keyword-heuristic categorization before it's used as an input to schema design.
3. Review all 22 duplicate-`youtubeVideoId` groups' tag divergence side-by-side (full list is in `docs/music-system-audit.json`'s `duplicateVideoIds` and this report's `duplicateConceptGroups`/JSON companion) and decide, per group, which copy's tags (if either) should be treated as canonical — this directly blocks any "derive stats from existing tags" approach for those 44 tracks.
4. Locate and review `scratch/seed-catalog-raw.txt` (referenced in `musicCatalog.ts:2` as the catalog's stated source of truth) if it still exists, to understand how the current tags were originally produced — this bears directly on how much to trust them as a starting point.
5. Decide, with the product owner, which of the STEP 3.5's 14 dimensions (§D) are worth promoting to real GPT output fields at all, given that 5 of them (Saturation, Contrast, Dominant palette in full, exact composition/framing detail) were found in §L.2 to have no evidenced track-side analogue anywhere in this repository.
6. Commission or schedule the human-listening checklist in §O before any per-track atmosphere stat is generated automatically from existing tags, since §H finding 1 demonstrates the existing tags are not a reliable ground truth for the tracks themselves.
