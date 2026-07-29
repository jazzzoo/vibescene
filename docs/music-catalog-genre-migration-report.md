# Music Catalog Genre Migration — Draft Report

**Status:** First-pass migration draft. Review artifact only. Nothing in this report or its companion files has been deployed, staged, committed, or pushed, and no existing source file was modified.
**Inputs:** `supabase/functions/_shared/musicCatalog.ts` (701 track objects, 21 lane arrays, read-only), cross-checked against `docs/music-system-audit.md`/`.json` and `docs/music-atmosphere-vocabulary-audit.md`/`.json`.
**Outputs:** `docs/music-catalog-genre-migration-draft.ts`, `docs/music-catalog-genre-migration-report.md` (this file), `docs/music-catalog-genre-migration-report.json`.
**Method:** A deterministic, rule-based pipeline (five scripts, run in an isolated temp directory outside the repository, never touching any tracked file) — flatten → deduplicate → classify genre → classify tags → resolve energy → assemble → validate. No audio was listened to. No web research was performed. Every uncertain decision was routed to a review-status flag rather than guessed silently.

---

## A. Executive summary

The 701 track objects spread across 21 `*_SEED_TRACKS` lane arrays in `musicCatalog.ts` were flattened into **673 canonical tracks** (28 source objects merged away as duplicates: 22 exact-`youtubeVideoId` duplicates already documented in the prior audit, plus 6 additional same-song/different-upload groups found by this migration's own title+artist matching). Every canonical track was assigned exactly one `primaryGenre` from the 12-value taxonomy, using `subTags` pattern-matching as the primary automated signal (per the task's evidence-priority order) and a small set of well-known-artist overrides as a secondary check — **lane identity was never read by the genre classifier**, confirmed by code inspection (`classifyGroup()` in the pipeline never accesses `laneId`).

**210 of 673 tracks (31%)** fell below the 0.72 genre-confidence threshold and are queued for human review — this is not a defect in coverage so much as an honest reflection of how many tracks in this catalog are genuine genre-fusion cases (`jazz-rap`, `neo-soul-jazz`, `jazz-funk`, `lofi-hiphop`, etc.), which the task's own genre-taxonomy notes anticipated ("jazz rap should normally use hip-hop-rap as primary and jazz-groove as secondary... neo-soul may use rnb or soul-funk-disco as primary depending on..."). **6 tracks** need dedup review (same-song-different-upload merges that could not be verified without listening), **225 tracks** need tag review (mostly ambiguous `sceneTags`/`subTags` whose meaning genuinely depends on context or listening), and **2 tracks** need metadata review (duplicate copies whose source `energy` values disagree and were not resolved silently).

**Most important warning before any production conversion:** three iterative bugs were found and fixed *during this migration's own development* — a heuristic-keyword false positive that routed literal locations (`jazz-bar`, `beach-house`, `disco-floor`) into `subGenres`, and two separate leaks that let location/time/season-contaminated compound tags (`open-road`, `night-pop`, `retro-summer`) slip into `retainedTags`/`subGenres` before being caught by this report's own quality checks. This means **the automated classification logic itself is young and imperfect**, and the review queues below — especially the 210-track genre queue — should be read as a floor on the manual-review effort required, not a ceiling.

---

## B. Source count and canonical count

| Metric | Count |
|---|---|
| Original source track objects (`musicCatalog.ts`) | 701 |
| Canonical tracks after deduplication | 673 |
| Source objects merged away | 28 |
| — merged via exact `youtubeVideoId` match | 22 (44 source objects → 22 canonical) |
| — merged via same normalized title + compatible artist credit, different `youtubeVideoId` | 6 (12 source objects → 6 canonical, each additionally flagged `needs-dedup-review`) |
| Total source entries preserved in `legacy.sourceEntries` across all canonical tracks | 701 (validated — every original object appears exactly once) |

---

## C. Genre distribution

| Primary genre | Canonical tracks | % of 673 |
|---|---|---|
| pop | 162 | 24.1% |
| hip-hop-rap | 122 | 18.1% |
| rock-alternative | 89 | 13.2% |
| indie-pop | 48 | 7.1% |
| rnb | 46 | 6.8% |
| soul-funk-disco | 43 | 6.4% |
| retro-pop-city-pop | 39 | 5.8% |
| jazz-groove | 35 | 5.2% |
| dream-pop-ambient | 26 | 3.9% |
| vintage-soul-oldies | 25 | 3.7% |
| folk-acoustic | 24 | 3.6% |
| electronic-dance | 14 | 2.1% |

Spot-checked against lane origin for sanity (lane was **not** used as classification input — this is a post-hoc cross-check only): `j-rock-highway-rush` → 29/31 `rock-alternative`; `city-pop-retro-glow` → 39/40 `retro-pop-city-pop`; `dark-heavy-hiphop` → 32/32 `hip-hop-rap`. These near-unanimous results on lanes with an unambiguous genre identity are a reasonable sanity signal that the subTags-driven classifier is behaving sensibly, not that lane leaked into the classification.

---

## D. Secondary-genre distribution

| Secondary genre | Canonical tracks carrying it as a secondary |
|---|---|
| pop | 102 |
| soul-funk-disco | 40 |
| electronic-dance | 37 |
| jazz-groove | 35 |
| rnb | 35 |
| rock-alternative | 15 |
| indie-pop | 16 |
| retro-pop-city-pop | 12 |
| dream-pop-ambient | 12 |
| folk-acoustic | 10 |
| hip-hop-rap | 7 |
| vintage-soul-oldies | 1 |

`pop` dominates as a secondary genre because many fusion subTag rules in this draft's classifier (e.g. `synth-pop`, `dance-pop`, `retro-pop`) attach `pop` as a corroborating secondary alongside a more specific primary — this is expected given how much of the catalog's subTag vocabulary is pop-adjacent (see `docs/music-atmosphere-vocabulary-audit.md` §C.3).

---

## E. Most common subgenres

Top 30 of 388 unique `subGenres` values assigned (post-cleanup — season/weather/time-contaminated compounds like `night-pop`/`retro-summer` were stripped out during this migration's own quality-check pass, see §P):

| Subgenre | Tracks |
|---|---|
| k-rnb | 28 |
| lofi-hiphop | 26 |
| dream-pop | 25 |
| japanese-city-pop | 25 |
| alt-rock | 23 |
| k-pop | 23 |
| k-hiphop | 22 |
| trap | 22 |
| dance-pop | 22 |
| classic-soul | 20 |
| indie-rock | 19 |
| indie-folk | 19 |
| romance-pop | 17 |
| k-indie-pop | 16 |
| soft-pop | 16 |
| synth-pop | 16 |
| pop-rock | 15 |
| alt-rnb | 15 |
| bedroom-pop | 15 |
| alt-pop | 15 |
| feel-good | 15 |
| k-indie | 14 |
| modern-jrock | 12 |
| melodic-rap | 12 |
| retro-pop | 12 |
| funk | 12 |
| electronic-pop | 11 |
| disco | 11 |
| jazz-pop | 10 |

The full 388-item list, with per-track linkage, is in `docs/music-catalog-genre-migration-report.json`'s `subGenreVocabulary`.

---

## F. Deduplication results

- **22 exact-`youtubeVideoId` groups** (44 source objects) collapsed automatically — these are unambiguously the same recording by definition (same video ID) and were merged with `dedupConfidence` 0.95–1.0.
- **6 additional groups** (12 source objects) matched by normalized title + compatible artist credit but had *different* `youtubeVideoId`s — these were merged into one canonical track with `alternateVideoIds`, per the task's "normally become one canonical track" rule, but every one of them is also flagged `needs-dedup-review` (`dedupConfidence` 0.65) because the merge could not be verified without listening. Full list (also in §L):
  1. **Virtual Insanity** — Jamiroquai (`4JkIs37a2JE` + alt `OeTFAiYbR9o`)
  2. **From The Start** — Laufey (`VArOUfVOjqI` + alt `lSD_L-xic9o`)
  3. **goosebumps** — Travis Scott (feat. credit varies between copies) (`Dst9gZkq1a8` + alt `FhTtYSU7Q7g`) — 3 source objects merge into this one: two share `Dst9gZkq1a8` exactly, the third is a differently-credited upload
  4. **Robbers** — The 1975 (`wjHgiSx0RNQ` + alt `Iyy3YOpxL2k`)
  5. **DNA.** — Kendrick Lamar (`NLZRYQMLDW4` + alt `ue4xoNqdc2I`)
  6. **Mask Off** — Future (`xvZqHgFz51I` + alt `aWb8z-KhZdo`)
- A version-marker scan (searching all 701 original titles for `live`, `remix`, `acoustic`, `cover`, `edit`, `remaster`, `version`, `demo`, `instrumental`, `extended`) found exactly 5 hits: 3 were false positives from the substring "live" inside `Stay Alive`/`Stayin' Alive`/`Live Forever` (not actual live recordings), and 2 were genuine official-remix titles (`Cheerleader (Felix Jaehn Remix)` — OMI; `Waves (Robin Schulz Remix Radio Edit)` — Mr. Probz), each a **singleton** in the catalog with no other copy to potentially merge with — kept as their own distinct canonical tracks, consistent with the rule that remixes/edits should not be silently merged with a hypothetical original.

### Special case: "Runaway" — Kanye West feat. Pusha T

Both source copies (`BIG_CITY_SWAGGER_HIPHOP_SEED_TRACKS` index and `DARK_HEAVY_HIPHOP_SEED_TRACKS` index) share the exact same `youtubeVideoId` (`cv1naUa3_3g`) and are **byte-for-byte identical** in every field except which array they physically sit in — confirming the prior audit's finding that the `DARK_HEAVY_HIPHOP_SEED_TRACKS` copy carries a mislabeled `laneId` field (`"big-city-swagger-hiphop"` instead of `"dark-heavy-hiphop"`). Per the "same YouTube video ID = one canonical recording" rule, this **merged automatically into a single canonical track** (`kanye-west-feat-pusha-t--runaway`), `dedupConfidence` 0.95. Both original source objects are preserved verbatim in `legacy.sourceEntries`, so the mismatch between `sourceArray: "DARK_HEAVY_HIPHOP_SEED_TRACKS"` and `laneId: "big-city-swagger-hiphop"` on the second entry remains visible as evidence for future review — it was **not** carried into genre classification, which used only the track's `subTags` (`mainstream-rap`, `cinematic-rap`) → `primaryGenre: "hip-hop-rap"`, `secondaryGenres: ["jazz-groove"]`, confidence 0.85, `reviewStatus: ["auto-approved"]`.

---

## G. Tag decision totals

Across all 673 canonical tracks, every unique `moodTags`/`sceneTags`/`subTags` value carried by that track's source entries was classified exactly once into one of four outcomes:

| Outcome | Count |
|---|---|
| Retained (track descriptor) | 2,049 |
| Moved to subGenres | 1,383 |
| Discarded | 2,558 |
| Needs review | 221 |
| **Total decisions** | **6,211** |

Discard reasons:

| Reason | Count |
|---|---|
| literal-scene | 1,992 |
| location-object | 431 |
| demographic-persona | 84 |
| duplicate-concept | 38 |
| activity-context | 13 |

(`lane-narrative`, `too-vague`, `conflicting-metadata`, and `other` were available reason codes but were not needed given how cleanly the other five reasons covered the observed discard population — no tag was force-fit into a wrong bucket to use them.)

---

## H. Retained-tag vocabulary

356 unique retained values across the catalog. Top 30 by track count:

| Tag | Tracks |
|---|---|
| romantic | 89 |
| warm | 76 |
| smooth | 68 |
| soft | 59 |
| nostalgic | 58 |
| bright | 54 |
| confident | 40 |
| cool | 39 |
| dreamy | 37 |
| lonely | 37 |
| dark | 34 |
| playful | 32 |
| glossy | 30 |
| glowing | 29 |
| stylish | 28 |
| bittersweet | 27 |
| motion | 26 |
| emotional | 26 |
| cinematic | 26 |
| sleek | 24 |
| gentle | 23 |
| groovy | 22 |
| wide | 22 |
| sweet | 21 |
| reflective | 20 |
| restless | 20 |
| retro | 20 |
| intimate | 19 |
| electric | 16 |
| melancholic | 15 |

This list is dominated almost exactly by the task's own example list of "potentially retainable concepts" (dreamy, warm, dark, bright, groovy, soft, intimate, nostalgic, playful, cinematic all appear near the top) — a reasonable sign the retain/discard split lines up with the task's intent. Synonym consolidation removed a small number of near-duplicates (`slick`→`sleek`, `solitary`→`lonely`, `chill`/`relaxed`→`easygoing`, `fun`→`playful`, `happy`→`joyful`, `dancey`→`danceable`) — see the `duplicate-concept` discard reason (38 instances) for the full list.

---

## I. Moved-to-subgenre vocabulary

1,383 individual tag→subgenre decisions, collapsing to 388 unique subGenre values (see §E for the top 30). Source-field breakdown: the overwhelming majority came from `subTags` (as expected, since `subTags` is the most genre-dense field per the prior vocabulary audit — 48% of its occurrences are genre-category by frequency), with a smaller number from `moodTags` (e.g. `jazzy`, `soulful`, `drill`, `tropical`) and a handful from `sceneTags` genuinely naming a genre/style rather than a location (rare — most `sceneTags` genre-looking matches turned out to be false positives from substring collision, see §J and §P).

---

## J. Discarded-tag vocabulary and reasons

Top 30 of 598 unique discarded (sourceField, value) pairs by frequency:

| Tag | Field | Reason | Tracks |
|---|---|---|---|
| night-drive | sceneTags | literal-scene | 102 |
| city-lights | sceneTags | literal-scene | 74 |
| city-night | sceneTags | literal-scene | 63 |
| city | sceneTags | literal-scene | 61 |
| neon | sceneTags | literal-scene | 53 |
| bedroom | sceneTags | literal-scene | 49 |
| night-room | sceneTags | literal-scene | 47 |
| youthful | moodTags | demographic-persona | 47 |
| window | sceneTags | location-object | 38 |
| night-city | sceneTags | literal-scene | 37 |
| daylight | sceneTags | literal-scene | 33 |
| date-night | sceneTags | literal-scene | 31 |
| late-night | sceneTags | literal-scene | 28 |
| cafe | sceneTags | literal-scene | 27 |
| breezy | moodTags | literal-scene | 27 |
| night | moodTags | literal-scene | 27 |
| street | sceneTags | literal-scene | 25 |
| friends | sceneTags | literal-scene | 25 |
| blue-sky | sceneTags | literal-scene | 22 |
| sunset | sceneTags | literal-scene | 21 |
| hazy | moodTags | literal-scene | 21 |
| urban | moodTags | location-object | 20 |
| lounge | sceneTags | location-object | 19 |
| slick | moodTags | duplicate-concept | 19 |
| night-groove | subTags | literal-scene | 19 |
| city-window | sceneTags | literal-scene | 19 |
| rainy-window | sceneTags | literal-scene | 19 |
| fashion | sceneTags | location-object | 19 |
| coast-road | sceneTags | literal-scene | 18 |
| late-night | moodTags | literal-scene | 17 |

`night-drive` alone (102 tracks) — the single most frequent `sceneTag` in the entire catalog per the prior vocabulary audit — was discarded from every track that carried it, consistent with the task's explicit example ("night drive is not a genre") and its broader instruction to discard lane-narrative scene tags.

---

## K. Genre review queue

**210 tracks** (31% of 673), `genreConfidence < 0.72`. This queue is dominated by genuinely fusion-genre tracks where the subTags evidence itself is ambiguous (e.g. `jazz-rap`, `neo-soul-jazz`, `jazz-funk`), not by tracks with no evidence at all. Representative examples:

| Title | Artist | primaryGenre (provisional) | Confidence | Why |
|---|---|---|---|---|
| Them Changes | Thundercat | soul-funk-disco | 0.60 | subTags split across jazz-groove/soul-funk-disco (`modern-jazz`, `funk-jazz`, `modern-funk`); artist-knowledge (Thundercat → jazz-groove) conflicts and was added only as a secondary, not used to override |
| Dang! | Mac Miller feat. Anderson .Paak | soul-funk-disco | 0.50 | `jazz-funk` and `hiphop-groove` split evenly between soul-funk-disco and hip-hop-rap |
| Vibin' Out | FKJ & ((( O ))) | jazz-groove | 0.60 | single subTag match (`nu-jazz`), no corroborating second signal |
| Always Shine | Robert Glasper Experiment feat. Lupe Fiasco & Bilal | hip-hop-rap | 0.50 | `jazz-rap` and `neo-soul-jazz` both present — genuinely double-genre |
| Tadow | Masego & FKJ | soul-funk-disco | 0.50 | `jazz-soul` and `neo-soul` split soul-funk-disco vs. rnb |
| Navajo | Masego | hip-hop-rap | 0.50 | `trap-jazz` and `sax-pop` disagree entirely |

Full 210-entry queue (title, artist, provisional primaryGenre/secondaryGenres, confidence, and the exact subTag evidence trail behind each decision) is in `docs/music-catalog-genre-migration-report.json`'s `genreReviewQueue`, and inline on every affected track's `migration.genreEvidence` in the `.ts` draft.

---

## L. Dedup review queue

**6 tracks** — the full list, with source entries, is in §F above and reproduced with complete detail (all original title/artist/videoId/laneId per copy) in `docs/music-catalog-genre-migration-report.json`'s `dedupReviewQueue`. None of these show any version-marker language (no "live"/"remix"/"acoustic"/"cover" in either copy's title), which is corroborating (not conclusive) evidence they are the same studio recording uploaded twice — but this was not verified by listening and each is explicitly flagged.

---

## M. Tag review queue

**225 tracks** flagged `needs-tag-review`, for one or both of:
- At least one of that track's unique tag values landed in `needsReview` (couldn't be confidently placed in retain/subgenre/discard) — 221 individual tag-level review items across these tracks, concentrated in ambiguous `sceneTags` (`memory`, `road-movie`, `fashion` at the boundary of theme-vs-scene) and bespoke genre-fusion `subTags` coinages this migration's rule set didn't recognize.
- The track's source copies disagree on their full `moodTags`/`sceneTags`/`subTags` sets (26 tracks — same as §N's descriptor-conflict count), meaning the retained/discarded/subgenre decision was made from the *union* of both copies' tags rather than a single authoritative source, which itself deserves a human sanity check.

Full queue (per-track needs-review items with reasons, and a flag for source-copy tag conflicts) is in `docs/music-catalog-genre-migration-report.json`'s `tagReviewQueue`.

---

## N. Metadata/energy review queue

**2 tracks** — both already documented in the prior vocabulary audit as the catalog's only confirmed cross-lane energy conflicts for literal duplicate recordings:

| Title | Artist | Source energies | Provisional value | Note |
|---|---|---|---|---|
| Feather | Nujabes feat. Cise Starr & Akin | `modern-jazz-groove`=medium, `lofi-bedroom-solitude`=low | medium | Provisional value taken from the earliest-authored copy by source order, **not** derived from listening or from either lane's identity. |
| Walking On A Dream | Empire of the Sun | `neon-electronic-night`=medium, `summer-beach-pop`=high | medium | Same provisional method. |

No other canonical track has an energy conflict — every other multi-source-entry track had identical `energy` across all its copies.

---

## O. 50 representative migrated track examples

Selected programmatically (not hand-picked) to guarantee coverage of: every one of the 6 dedup-review tracks, both metadata-review tracks, the "Runaway" special case, and a round-robin spread across all 12 primary genres. Abbreviated view (title / artist / primaryGenre / secondaryGenres / energy / reviewStatus) — full records including `subGenres`, `retainedTags`, `alternateVideoIds`, and `genreConfidence` are in `docs/music-catalog-genre-migration-report.json`'s `representativeTracks` (50 entries) and in full detail in the `.ts` draft:

| Title | Artist | primaryGenre | secondaryGenres | Energy | Review status |
|---|---|---|---|---|---|
| Virtual Insanity | Jamiroquai | jazz-groove | soul-funk-disco | medium | needs-dedup-review |
| From The Start | Laufey | jazz-groove | — | medium | needs-dedup-review |
| goosebumps | Travis Scott feat. Kendrick Lamar | hip-hop-rap | — | medium | needs-dedup-review |
| Robbers | The 1975 | rock-alternative | pop | medium | needs-dedup-review |
| DNA. | Kendrick Lamar | hip-hop-rap | — | high | needs-dedup-review |
| Mask Off | Future | hip-hop-rap | — | medium | needs-dedup-review |
| Feather | Nujabes feat. Cise Starr & Akin | hip-hop-rap | jazz-groove | medium | needs-metadata-review, needs-genre-review |
| Walking On A Dream | Empire of the Sun | electronic-dance | retro-pop-city-pop, pop | medium | needs-metadata-review |
| Runaway | Kanye West feat. Pusha T | hip-hop-rap | jazz-groove | medium | auto-approved |
| You Hate Jazz? | Harrison & Jaleel Shaw | jazz-groove | — | medium | auto-approved |
| Driver's High | L'Arc~en~Ciel | rock-alternative | — | high | auto-approved |
| AEAO | Dynamic Duo & DJ Premier | hip-hop-rap | — | medium | auto-approved |
| D (Half Moon) | DEAN feat. Gaeko | rnb | — | medium | auto-approved |
| Ling Ling | The Black Skirts | indie-pop | — | low | needs-genre-review |
| Plastic Love | Mariya Takeuchi | retro-pop-city-pop | — | medium | auto-approved |
| Ends of the Earth | Lord Huron | folk-acoustic | — | medium | auto-approved |
| The Pretender | Foo Fighters | rock-alternative | — | high | auto-approved |
| Apocalypse | Cigarettes After Sex | dream-pop-ambient | — | low | auto-approved |
| N.Y. State of Mind | Nas | hip-hop-rap | — | medium | auto-approved |
| Blinding Lights | The Weeknd | electronic-dance | retro-pop-city-pop, pop, rnb | high | needs-genre-review |

(20 of 50 shown for readability; the complete 50-track set — including examples for every primary genre, every dedup case, and both metadata conflicts — is in the JSON companion file's `representativeTracks` array.)

---

## P. Risks before production conversion

1. **This is a first-pass automated draft, not a validated catalog.** 210 tracks (31%) need genre review, 225 (33%) need tag review, and the classifier's own bugs (found and fixed mid-migration — see §A) are strong evidence more exist that this pass didn't catch. Do not promote `GENRE_BASED_CATALOG_DRAFT` to a runtime data source without a human review pass over at least the review-queued tracks.
2. **The subTags→genre keyword mapping is heuristic and was corrected reactively, not exhaustively.** Three concrete bugs were found only by manually inspecting spot-check output during this migration (jazz-bar/beach-house/disco-floor false genre matches; open-road/warm-road/home leaking into retainedTags; night-pop/retro-summer/rainy-rnb leaking into subGenres). The fixes applied are targeted, not systematic — a full audit of the remaining 388 subGenre values and 356 retainedTag values against the task's rules (§9 quality checks) was only partially completed (5 residual retainedTags still contain borderline location language: `highway-rush`, `home`, `bedroom-calm`, `club-classic`, `club-chic` — see the JSON companion's `qualityChecks.retainedTagsWithLocationLanguage`).
3. **Dedup merges beyond exact-videoId matches are unverified.** The 6 title+artist cross-videoId merges (§F, §L) are plausible but not confirmed identical recordings — merging was chosen as the "normal" default per the task's own instruction, but every one is flagged and none should be trusted without a listen.
4. **Energy conflicts were resolved by source order, not by evidence.** The 2 metadata-review tracks (§N) have a coin-flip-equivalent provisional energy value; if energy matters for any downstream feature before review, treat these 2 as unknown, not as their provisional value.
5. **No external genre research was performed.** Per task constraints, no web search, no Spotify/YouTube browsing, and no audio listening occurred. All genre and dedup decisions rest entirely on repository-internal evidence (subTags, artist-name pattern matches from training knowledge, and title/artist string comparison) — the same limitation the underlying vocabulary audit already flagged for its own tag data.
6. **The 12-genre taxonomy will not stay balanced at scale.** `electronic-dance` (14 tracks) and `vintage-soul-oldies` (25 tracks) are thin relative to `pop` (162) and `hip-hop-rap` (122) — this may be an accurate reflection of the source catalog's actual genre mix (it was built around 21 mood/scene lanes, not genre balance) rather than a classifier defect, but should be checked against product expectations before this taxonomy is treated as final.
7. **`musicCatalog.ts` and all runtime selection/sequencing code are completely unaffected by this draft.** This was verified continuously during the migration (`git status`/`git diff --stat` checked after every write) and holds as of this report's generation — see §Q's validation confirmation.

---

## Q. Exact recommended next action

Do not implement or wire up this draft catalog yet. The concrete next step is a **human review pass over the four review queues in priority order**:

1. First, the **6-track dedup queue** (§L) and **2-track metadata queue** (§N) — small, bounded, and blocking (a wrong merge or wrong energy value here propagates into every downstream field for that track).
2. Second, a **spot audit of the residual quality-check findings** (§P item 2) — re-run the `qualityChecks` block in `docs/music-catalog-genre-migration-report.json` against the current draft and manually inspect the small remaining lists (5 retainedTags, plus any new ones a re-run surfaces) rather than assuming they're exhaustively fixed.
3. Third, the **210-track genre-review queue** (§K), prioritized by track popularity/visibility if such data exists elsewhere, since this is the largest queue and the one most likely to affect user-facing genre labels.
4. Only after (1)-(3), triage the **225-track tag-review queue** (§M) — lower risk per-track since it affects only `retainedTags`/`subGenres` cosmetics, not `primaryGenre` or track identity.

No schema, prompt, selection-logic, or database change should be scoped until this review pass is complete and a second migration draft (or an approved version of this one) exists.
