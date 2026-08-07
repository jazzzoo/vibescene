# Targeted Track Metadata Corrections — Human Listening Review

Generated: 2026-08-07  
Baseline branch/HEAD at start of this task: `music/catalog-genre-reclassification` @ `a2612786661c53d70c3e2c6200a0a882d7d49715`  
Scope: targeted correction of individual tracks manually identified as suspicious during human listening review — **not** a full-catalog reclassification. Genre-first filtering, GPT prompt, scoring weights, sequencing logic, `FINAL_TRACK_COUNT`, `CATALOG_CANDIDATE_POOL_SIZE`, and `docs/stat-catalog-step2-conclusion.md` were **not** touched.

Authoritative catalog source: `supabase/functions/_shared/musicCatalog.ts` (the sole production source — the earlier draft/generation-pipeline files referenced in `docs/stat-catalog-step2-conclusion.md` were removed from the repo in commit `231d23c`; `scripts/validate-music-catalog.mjs` explicitly rejects any second source or `docs/` import). Corrections were hand-applied directly to `musicCatalog.ts`.

No GPT/API calls were made. The Phase 5 before/after scores below reuse the OLD cached image vectors from `diagnostics/real-image-music-evaluation.json` (generated 2026-08-05, repository HEAD `4323eef`) purely as deterministic scoring fixtures, run through the current, unmodified `rankCatalogTracks`/`scoreCatalogTrack` (`services/scoring.ts`) over the full verified pool (no genre filter) — matching how that cached diagnostic was originally produced. These numbers describe the effect of the metadata correction on the pre-genre-filter scoring surface only; they are not a claim about final-engine (genre-filtered, 20-track) behavior with fresh GPT vectors.

---

## Directly reviewed tracks (explicit human feedback)

### 1. 주혜린 – 아무것도 (`fzhgg7pD1bI`)

- **Classification: A. DEFINITE_METADATA_ERROR**
- Old metadata: `energy: "low"`, `stats.energy: 25`, `stats.groove: 30`. `statConfidence: 0.4`, `needsStatReview: true` — originally title-inferred only ("stats inferred from title... and typical emotional-ballad conventions"), never listening-verified.
- New metadata: `energy: "medium"`, `stats.energy: 48`, `stats.groove: 45`. `statConfidence: 0.55`.
- Reason: direct human listening evidence ("the drum beat is clearly medium rather than low") directly contradicts a low-confidence, non-listening title-inference. `motion` (22), `climaxIntensity` (45), `density` (35), and all `affinity` values were re-audited and left unchanged — no specific evidence was given for those, and the instruction was not to change unrelated fields without evidence.
- Affected old images/ranks: appeared in images 3, 5, 9, 10 of the cached evaluation run. See table below.
- Was the old mismatch metadata-driven, selection-logic-driven, or mixed: **metadata-driven** — the energy/groove values themselves were wrong, independent of genre filtering.

### 2. Victor Lundberg – Come Back Again (`dzoxC8dedXw`)

- **Classification: A (energy) / D (context-affinity breadth) — mixed within one track**
- Old metadata: `energy: "low"`, `stats.energy: 28`. `statConfidence: 0.3`, `needsStatReview: true` — the lowest-confidence entry reviewed here ("artist identity could not be confidently confirmed... a low-confidence estimate based on the reflective, understated tone implied by the title alone").
- New metadata: `energy: "medium"`, `stats.energy: 45`. `statConfidence: 0.4`.
- Reason (energy, A): direct human evidence ("energy should be at least medium") against an admittedly low-confidence, unconfirmed-artist estimate.
- Context affinity (D, **not changed**): human feedback flagged that the track "appeared across many unrelated images and may be overly broad." All 13 affinity values do sit tightly clustered (35–58, close to the 50 midpoint) — the same "midpoint collapse" symptom documented for pre-correction stats in `docs/stat-catalog-step2-conclusion.md` — but the task explicitly instructs "do not deliberately suppress the track just because it recurred; only correct fields that are actually wrong," and no field-specific directional evidence was given (no claim like "this shouldn't feel rainy" or "this shouldn't feel wintery"). Left unchanged; documented as an open observation, not corrected.
- `motion`, `groove`, `climaxIntensity`, `brightness`, `warmth` were re-audited and left unchanged for the same reason — no specific evidence.
- Affected old images/ranks: images 1, 3, 5, 8, 9.
- Was the old mismatch metadata-driven or selection-logic-driven: **mixed** — the energy value was an objective metadata error (A); its cross-image recurrence in genre-incoherent contexts (e.g. image 8's indie-rock scene, image 3) is better explained by the pre-genre-filter selection logic (C), which is already fixed by the genre-first architecture landed in `a261278` and out of scope here.

### 3. Lana Del Rey – West Coast (`o3SqUUoJjW8`)

- **Classification: D. INSUFFICIENT_EVIDENCE — not modified**
- Current metadata: `statConfidence: 0.73`, `needsStatReview: false` (confident, artist-knowledge-based entry, not flagged for review). `brightness: 27`, `tension: 35`, `dreaminess: 87`, `winter: 76`, `snow: 57`.
- Human feedback: "In the snowy winter image it felt much too dark for the scene," asking to re-audit brightness/warmth/tension/dreaminess/winter/snow/daytime-dusk-night affinities.
- Audit finding: the referenced scene (image 2, "Snowy Serenity") itself targets a low `brightness` (30) and high `winter`/`snow` (100/100) — West Coast's values are already close to that target on those specific dimensions, not "too favorable" in the direction the complaint implies. The one dimension that stands out is `tension` (35) vs. the scene's low-tension target (20), but 35 is already below-neutral on a 0–100 scale and is a defensible reading of the song's own moodier, cinematic-noir character (confirmed by its own `moodTags`: "smoky, cinematic, slow-burning") — not an objectively wrong value independent of this one scene.
- The task explicitly warns not to make arbitrary changes just to exclude a track from one image, and this is a confident (`statConfidence 0.73`, not flagged), well-documented artist entry with no field-specific error identified outside the single scene's framing. No change made.

### 4. Bill Withers – Ain't No Sunshine (`YuKfiH0Scao`)

- **Classification: D. INSUFFICIENT_EVIDENCE — not modified**
- Current metadata: `statConfidence: 0.73`, `needsStatReview: false`, `genreConfidence: 82`. `nostalgia: 72`, `rain: 71`, `winter: 56`.
- Human feedback: fit the "rainy alley" playlist but felt "more winter-oriented and out of place" in a brighter context.
- Audit finding: this track did appear in the "Rainy Alley Reverie" scene (image 5) at final position 10 (last position — i.e. weakest fit among the delivered 10, matching "generally fit"). A nostalgic, rain-affine soul ballad legitimately scoring lower in "brighter" scenes and higher in rainy/nostalgic ones is the affinity system working as intended, not a bug — no specific field was claimed to be objectively wrong. No change made.

### 5. Uyama Hiroto – Departure (`lZKCM2FD2Gw`)

- **Classification: C. OLD_SELECTION_LOGIC_ONLY (recurrence) / D for all named fields — not modified**
- Current metadata already: `primaryGenre: "jazz"`, `subgenre: "jazz-hop"` (correct), `vocalPresence: 18` (already accurately reflects the instrumental nature the human feedback asked to preserve), `rain: 45`, `cloudy: 50` (near-neutral, consistent with this track's own `sceneTags`: "morning-journey, open-sky, airport" — an open/clear-sky identity, not a rainy one).
- Audit finding: every field the human asked to re-audit (`vocalPresence`, `groove`, `dreaminess`, `nostalgia`, `rain`, `cloudy`, `day/dusk/night`) was already internally consistent with the track's own established identity. The complaint about "appearing broadly in unrelated road/indie images" is explained by the pre-genre-filter scoring having no genre-coherence gate — already fixed by the genre-first architecture, out of scope here. No change made.

### 6. Uyama Hiroto – Waltz for Life Will Born (`ACao0LBuXTI`)

- **Classification: A. DEFINITE_METADATA_ERROR (vocalPresence only)**
- Old metadata: `vocalPresence: 43`.
- New metadata: `vocalPresence: 20`.
- Reason: human feedback describes both Uyama Hiroto tracks reviewed here as instrumental, and instructs that "instrumental nature must be accurately represented." 43 was a clear outlier against this artist's other instrumental jazz-hop entries in this same catalog (Route16 = 22, Departure = 18); 20 brings it in line.
- `groove` (65), `dreaminess` (35), `nostalgia` (48), `rain` (50), `cloudy` (45), `day/dusk/night` affinities were re-audited and left unchanged — internally consistent with the track's own night-cafe/quiet-street identity, no evidence of error.
- Affected old images/ranks: rank 12 (discarded, never in a delivered final-10) in image 7.
- Was the old mismatch metadata-driven or selection-logic-driven: **metadata-driven** for `vocalPresence` specifically; the "broadly in unrelated road/indie images" complaint (shared with Departure) is selection-logic-driven (C), already fixed.

### 7. potsu – just friends (`qOif_ni_9zc`)

- **Classification: B. LIKELY_METADATA_ERROR (genre + related sonic stats)**
- Old metadata: `primaryGenre: "hip-hop"`, `subgenre: "lofi-hiphop"`, `crossoverGenres: []`, `genreConfidence: 80`, `needsGenreReview: false`, `acousticness: 32`, `electronicness: 55`.
- New metadata: `primaryGenre: "jazz"`, `subgenre: "jazz-hop"`, `crossoverGenres: ["lofi-hiphop"]`, `genreConfidence: 65`, `needsGenreReview: true`, `acousticness: 48`, `electronicness: 45`.
- Reason: human listening review independently identified the track as "clearly jazz-influenced." potsu is a Nujabes-lineage instrumental jazzhop producer and the track shares its title with the jazz standard "Just Friends"; the existing `jazz`/`jazz-hop` subgenre is already used in this catalog for directly comparable artists (Uyama Hiroto). The prior classification carried a generic, non-track-specific justification ("[artist-knowledge] Lofi hip-hop producer.") despite its stated confidence. `acousticness`/`electronicness` were nudged toward this catalog's jazz-hop cluster (Uyama Hiroto entries run acousticness 58–62 / electronicness 35–40) since the task explicitly permitted auditing those fields "if genre correction warrants it." Classified B, not A, because it is a genuine boundary call between two adjacent canonical subgenres, not an unambiguous factual error — flagged `needsGenreReview: true` for future confirmation. `groove` (71, already within this catalog's jazz-hop range) and `vocalPresence` (87, no independent evidence given) were audited and left unchanged.
- Affected old images/ranks: final position 8 in image 10.
- Was the old mismatch metadata-driven or selection-logic-driven: **metadata-driven** (genre field itself).

---

## Secondary inspection — Image 8 / 9 / 10 flagged positions (inspect-only, per task instructions)

Resolved via `diagnostics/real-image-playlist-review.md`. None of these were modified — purpose was only to classify A/B/C per track.

| Image | Position/rank | Track | Finding |
|---|---|---|---|
| 8 (`63124baa...`, "Urban Streetlight Songs", indie-road-movie) | final pos 1 | 딕펑스 – 평행성 (feat. Jukjae) | `rock`/`indie-rock` — genuinely fits the indie-rock scene. No mismatch (N/A). |
| 8 | final pos 6 | Oasis – Wonderwall | `rock`/britpop-adjacent — genuinely fits. No mismatch (N/A). |
| 8 | final pos 8 | Victor Lundberg – Come Back Again | Covered above as track #2 (direct feedback). Cross-genre appearance (`folk-acoustic` in an indie-rock scene) explained by **C. OLD_SELECTION_LOGIC_ONLY** — no genre-coherence gate existed at evaluation time; already fixed. |
| 8 | final pos 9 | DORI – Thursday Taco Man | `pop`/`bedroom-pop` (whimsical/playful) landing in a "nostalgic, urban, melancholic" scene purely on stats proximity. **C. OLD_SELECTION_LOGIC_ONLY** — no independent evidence the track's own metadata is wrong; not modified. |
| 8 | rank 12 | Astels – We Gotta Let Go | `pop`/`indie-pop`, discarded rank (never delivered). **C**, not modified. |
| 8 | rank 13 | 채옐 – He's Something | `rnb-soul`/`k-rnb`, discarded rank. **C**, not modified. |
| 8 | rank 16 | Harrison & Jaleel Shaw – You Hate Jazz? | `jazz`/`modern-jazz`, discarded rank. **C**, not modified. |
| 9 (`a716b5df...`, "Misty Morning Reflections", dream-pop-shoegaze-fog) | final pos 1 | Victor Lundberg – Come Back Again | Same as above — **C**, covered as track #2. |
| 9 | final pos 9 | 주혜린 – 아무것도 | Covered above as track #1 (direct feedback, corrected). |
| 10 (`aa14821f...`, "Neon Rain Reflections", k-rnb-night-drive) | final pos 1 | Couch – Static & Noise | `rnb-soul`/`alt-rnb`, genuinely fits the K-R&B/neon-rain scene (high `night`/`rain` affinity). No mismatch (N/A). |
| 10 | final pos 8 | potsu – just friends | Covered above as track #7 (direct feedback, corrected). |

---

## Before/after score effect (deterministic, old cached vectors, pre-genre-filter full pool)

Computed with the current, unmodified `rankCatalogTracks` against the full 795-track verified pool (no genre filter — matching how the original cached diagnostic was generated), using each image's cached `targetStats`/`contextAffinity` from `diagnostics/real-image-music-evaluation.json`. "Old" = pre-correction field values reconstructed exactly as edited; "New" = current `musicCatalog.ts`. Rank is position within the full 795-track ranked pool for that image, not the delivered top-10/top-16 — most of these movements happen far outside the delivered playlist and are not evidence of new-engine (genre-filtered, 20-track) behavior.

| Track | Image | Old rank | Old score | New rank | New score | Rank delta |
|---|---|---|---|---|---|---|
| Victor Lundberg – Come Back Again | 1 (`02066cb8...`) | 1 | 85.17 | 2 | 84.44 | -1 |
| Victor Lundberg – Come Back Again | 3 (`0ea78a4f...`) | 14 | 81.69 | 16 | 80.96 | -2 |
| Victor Lundberg – Come Back Again | 5 (`402c17af...`) | 1 | 82.29 | 1 | 81.56 | 0 |
| Victor Lundberg – Come Back Again | 8 (`63124baa...`) | 1 | 85.56 | 1 | 86.29 | 0 |
| Victor Lundberg – Come Back Again | 9 (`a716b5df...`) | 1 | 83.40 | 1 | 82.67 | 0 |
| 주혜린 – 아무것도 | 3 (`0ea78a4f...`) | 4 | 82.58 | 17 | 80.95 | -13 |
| 주혜린 – 아무것도 | 5 (`402c17af...`) | 2 | 81.73 | 10 | 80.10 | -8 |
| 주혜린 – 아무것도 | 9 (`a716b5df...`) | 9 | 80.75 | 24 | 79.13 | -15 |
| 주혜린 – 아무것도 | 10 (`aa14821f...`) | 9 | 82.92 | 6 | 83.00 | +3 |
| Uyama Hiroto – Waltz for Life Will Born | 7 (`5d26f764...`) | 12 (discarded) | 81.33 | 38 | 80.35 | -26 |
| potsu – just friends | 10 (`aa14821f...`) | 6 | 83.32 | 16 | 82.21 | -10 |

Interpretation: the 아무것도 and Come Back Again energy corrections lower their fit specifically in the low-energy/dreamy/rainy scenes (images 3, 5, 9) where their previous, wrongly-low energy value was giving them an inflated advantage — the expected and correct direction for that fix. The Waltz for Life Will Born vocalPresence correction lowers its fit in image 7 (which wanted moderate vocal presence), correctly removing a spurious closeness that was never delivered in a final playlist anyway (rank 12, discarded both before and after). The potsu genre-consistency stat nudge lowers its fit for the neon-electronic K-R&B scene (image 10) it was previously borderline-included in — consistent with (and reinforced by) its reclassification out of `hip-hop` for genre-first filtering purposes. No corrected track was pushed into an objectively wrong new context; all deltas move fit in the direction the underlying evidence supports.
