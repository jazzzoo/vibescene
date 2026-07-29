# Music Catalog Simplified Draft — Report

**Status:** Second-pass draft, derived entirely from the existing `docs/music-catalog-genre-migration-draft.ts` (no re-audit of `musicCatalog.ts` was performed for this task). Review artifact only — nothing here has been deployed, staged, committed, pushed, or wired into runtime code, and no existing source file was modified.
**Why this exists:** The prior migration draft's 12-value genre taxonomy with `primaryGenre`/`secondaryGenres`/`subGenres` was over-engineered for VibeScene's actual design — VibeScene will primarily classify and match tracks using atmosphere/sound stats (not yet added; out of scope for this task), with genre reduced to a broad catalog-management/playlist-diversity field only.
**Inputs:** `docs/music-catalog-genre-migration-draft.ts` (673 tracks, parsed programmatically and left byte-for-byte unchanged), cross-checked against `docs/music-catalog-genre-migration-report.md`/`.json`.
**Method:** A deterministic transform (parse → remap genre → filter/normalize tags → reassemble with YouTube-ID-based identity → validate), run in an isolated temp directory outside the repository. No audio was listened to, no web research was performed, no new atmosphere stats were added.

---

## A. Executive summary

The prior draft's 673 canonical tracks were carried forward unchanged in identity and count — this task only **re-expresses** each track's genre and tags in a simpler shape; it does not re-run deduplication or re-derive canonical tracks from `musicCatalog.ts`. Every track's `id` is now its representative YouTube video ID (previously a generated slug like `harrison-jaleel-shaw--you-hate-jazz`); the 12-value `primaryGenre`/`secondaryGenres`/`subGenres` structure was collapsed into one `genre` field from an 8-value taxonomy; `retainedTags` was renamed to `tags` and further filtered to remove residual genre/era/location/persona-flavored entries that the prior draft's own report had already flagged as imperfect (`highway-rush`, `home`, `club-chic`, etc.) plus a broader class of similar compounds discovered while building this simplification (e.g. every `*-groove`, `*-romance`, `classic-*`, `retro-*`, `urban-*` compound).

**Zero validation errors.** 673 canonical tracks, 701 legacy source entries preserved exactly, every `id` a valid 11-character YouTube video ID matching the prior draft's representative video ID for that track, no duplicate IDs, no `primaryGenre`/`secondaryGenres`/`subGenres`/top-level `youtubeVideoId`/`laneId` fields anywhere, every tag lowercase kebab-case, no track above 8 tags.

---

## B. Source and canonical counts

| Metric | Count |
|---|---|
| Original `musicCatalog.ts` source track objects (carried forward from the prior draft, not re-derived) | 701 |
| Canonical tracks | 673 |
| Legacy source entries preserved across all canonical tracks | 701 (validated) |

---

## C. Broad genre distribution

| Genre | Tracks | % of 673 |
|---|---|---|
| pop | 249 | 37.0% |
| hip-hop | 122 | 18.1% |
| rock | 89 | 13.2% |
| rnb-soul | 87 | 12.9% |
| jazz-funk | 62 | 9.2% |
| ambient-dream | 26 | 3.9% |
| folk-acoustic | 24 | 3.6% |
| electronic | 14 | 2.1% |

`pop` grew substantially relative to the prior draft's `pop` primary genre (162) because `indie-pop` (48) and `retro-pop-city-pop` (39) both map directly to `pop` under the simplified taxonomy (162+48+39 = 249, exact match — confirms the direct-mapping arithmetic is correct). `rnb-soul` (87) is the sum of the prior draft's `rnb` (46) plus most of `vintage-soul-oldies` (25) and a soul-leaning portion of `soul-funk-disco` (43); `jazz-funk` (62) is the prior draft's `jazz-groove` (35) plus the funk/disco-leaning portion of `soul-funk-disco`. See §D for exactly how that split was decided.

---

## D. Genre-mapping method (for the ambiguous cases)

Direct 1:1 mappings (no ambiguity): `pop`→pop, `indie-pop`→pop, `retro-pop-city-pop`→pop, `rock-alternative`→rock, `hip-hop-rap`→hip-hop, `rnb`→rnb-soul, `jazz-groove`→jazz-funk, `electronic-dance`→electronic, `folk-acoustic`→folk-acoustic, `dream-pop-ambient`→ambient-dream.

Two prior genres required a per-track judgment call, decided by scoring the prior draft's own `subGenres` list for that track against funk/disco-flavored vs. soul/rnb-flavored keyword patterns:

- **`soul-funk-disco` (43 tracks)** → scored `disco`/`funk`/`groove`-pattern subGenres against `soul`/`rnb`/`romance`-pattern subGenres. Funk/disco-dominant tracks (e.g. "September", "Let's Groove", "Super Freak" — subGenres like `disco`, `funk`) became **jazz-funk**. Soul/rnb-dominant tracks (e.g. "Maybe Tomorrow" — `soul-rock`, `soulful`) became **rnb-soul**. Genuinely tied tracks (e.g. "Tadow" — `jazz-soul`, `neo-soul`, evenly split) defaulted to **rnb-soul** and were flagged `needsGenreReview`.
- **`vintage-soul-oldies` (25 tracks)** → scored `soul`/`motown`/`doo-wop`-pattern subGenres against plain-pop-pattern subGenres. All 25 tracks had unambiguous soul/motown vocabulary (`classic-soul`, `motown`, `doo-wop`, `vocal-soul`, etc.) and mapped cleanly to **rnb-soul** with no review flag needed from this step specifically.

This is a lightweight heuristic re-using evidence already collected in the prior draft, **not** a new investigation — per this task's explicit constraint against further genre research.

---

## E. Tag vocabulary summary

**256 unique tags** across the catalog (down from 356 in the prior draft — the reduction is the filtering described in §A, not new discardable content). Tag-count distribution per track:

| Tags per track | Track count |
|---|---|
| 0 | 9 |
| 1 | 54 |
| 2 | 230 |
| 3 | 294 |
| 4 | 74 |
| 5 | 7 |
| 6 | 3 |
| 7 | 1 |
| 8 | 1 |

524 of 673 tracks (78%) fall in the requested 2–3 tag sweet spot; 524+74+7+3+1+1 = 610 of 673 (91%) fall within the "normally 2–6" target range; every track is at or under the hard maximum of 8.

Top 20 tags by frequency:

| Tag | Tracks |
|---|---|
| romantic | 90 |
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
| bittersweet | 27 |
| emotional | 26 |
| cinematic | 26 |
| sleek | 24 |
| gentle | 23 |
| groovy | 22 |

Full 256-value vocabulary with frequencies is in `docs/music-catalog-simplified-report.json`'s `tagVocabulary`.

**Filtering applied beyond the prior draft's own retain/discard pass:** the task's explicit removal list (`modern`, `classic`, `retro`, `stylish`, `trendy`, `youthful`, `party`, `motion`, `groove`, `modern-groove`, `urban-groove`, `lounge-groove`, `soft-rock`, `modern-romance`, `club-chic`, `club-classic`, `highway-rush`, `bedroom-calm`, `home`) was generalized into a broader rule: **any hyphenated tag containing an era/persona/lane-narrative modifier segment** (`urban`, `harlem`, `classic`, `retro`, `modern`, `vintage`, `chic`, `lounge`, `teen`, `highteen`, `groove`, `romance`, `80s`/`90s`/`70s`, `internet`, `viral`, `swagger`, `old`, `future`, `glam`, `oldies`) as one of its hyphen-separated parts was removed — this caught residual compounds like `bass-groove`, `dark-groove`, `urban-swagger`, `harlem-swagger`, `teen-romance`, `retro-indie`, `modern-swagger`, `80s-groove`, `classic-groove`, `old-film`, `luxury-groove` that the prior draft's own retain/discard pass had not caught (disclosed as a known residual-imperfection risk in that draft's report §P). Synonym normalization applied: `slick`→`sleek`, `melancholy`→`melancholic`, `chill`/`relaxed`→`easygoing`, `solitary`→`lonely`, `fun`→`playful`, `dancey`→`danceable`, `romance`→`romantic` (new in this pass).

**Residual imperfection, disclosed rather than hidden:** a small number of frequency-1 compounds still read as borderline (e.g. `stylish-jrock`, `young-love`, `friends`, `internet`) — each affects exactly one track, was not worth a further filtering pass at this task's scope, and is visible in the full vocabulary in the JSON companion.

---

## F. Tracks with zero tags

**9 tracks.** For most, the prior draft's `retainedTags` array was already very short (1–2 entries) and every entry happened to match a removed pattern; two tracks ("Ao to Natsu", "ELECTRIC SUMMER") had already lost all retained tags in the *prior* draft (0 tags there too — not a regression introduced by this simplification), and one ("Cheerleader (Felix Jaehn Remix)") likewise started at 0.

| Title | Artist | Genre | Why |
|---|---|---|---|
| Ao to Natsu | Mrs. GREEN APPLE | rock | Already 0 retainedTags in the prior draft |
| ELECTRIC SUMMER | Base Ball Bear | rock | Already 0 retainedTags in the prior draft |
| Y | FANXY CHILD | hip-hop | Both prior tags matched a removed pattern |
| And July | Heize feat. DEAN & DJ Friz | rnb-soul | Both prior tags matched a removed pattern |
| Kimi wa 1000% | 1986 Omega Tribe | pop | Only prior tag matched a removed pattern; also genre-review flagged |
| Airport Lady | Toshiki Kadomatsu | pop | Only prior tag matched a removed pattern |
| Wasurerarenaino | Sakanaction | pop | Both prior tags matched a removed pattern; also genre-review flagged |
| Tokyo Flash | Vaundy | pop | Only prior tag matched a removed pattern; also genre-review flagged |
| Cheerleader (Felix Jaehn Remix) | OMI | pop | Already 0 retainedTags in the prior draft |

All 9 are candidates for manual re-tagging before use in any downstream recommendation feature — none should be assumed "tagless by design."

---

## G. Tracks with more than six tags

**2 tracks** (both within the hard 8-tag maximum):

| Title | Artist | Tag count | Tags |
|---|---|---|---|
| Bye bye my blue | Yerin Baek | 8 | alone, blue, gentle, intimate, lonely, melancholic, soft, soft-vocal |
| DNA. | Kendrick Lamar | 7 | bass-heavy, commanding, confident, explosive, focused, intense, sharp |

Both were left as-is (not truncated further) since the task's cap is 8, not 6 — "target 2–6" was read as guidance, not a hard rule, per the task's own phrasing ("normally 2–6 tags... maximum 8 tags").

---

## H. Genre review queue

**211 tracks** flagged `needsGenreReview` — 210 carried forward directly from the prior draft's own `genreConfidence < 0.72` flag (unchanged confidence basis, just re-expressed under the new 8-value genre), plus 1 additional track ("Tadow" — Masego & FKJ) newly flagged because the `soul-funk-disco`→rnb-soul/jazz-funk split for it was evenly tied. Representative entries:

| Title | Artist | New genre | Confidence | Note |
|---|---|---|---|---|
| Them Changes | Thundercat | jazz-funk | 0.65 | Prior draft confidence 0.60 for `soul-funk-disco` |
| Dang! | Mac Miller feat. Anderson .Paak | jazz-funk | 0.75 | Prior draft confidence 0.70 for `soul-funk-disco` (still flagged since the *prior* confidence triggered review) |
| Always Shine | Robert Glasper Experiment feat. Lupe Fiasco & Bilal | hip-hop | 0.50 | Prior draft confidence 0.50 for `hip-hop-rap` — genuine jazz-rap/neo-soul-jazz fusion |
| Tadow | Masego & FKJ | rnb-soul | 0.75 | Newly flagged: `soul-funk-disco` split evenly between funk/disco and soul/rnb subGenres |
| Navajo | Masego | hip-hop | 0.70 | Prior draft confidence 0.70 for `hip-hop-rap` |

**Reading the confidence column:** it reflects the *new* genre's confidence after remapping (sometimes nudged up slightly for a clean direct mapping), while the `needsGenreReview` flag itself is sticky — once a track's prior-draft confidence was below 0.72, it stays flagged here even if the simplified confidence number looks acceptable, since the underlying uncertainty (usually genuine genre-fusion, e.g. jazz-rap, neo-soul-jazz) doesn't go away just because the taxonomy got coarser. Full 211-entry queue is in `docs/music-catalog-simplified-report.json`'s `genreReviewQueue`.

---

## I. Dedup review queue

**6 tracks**, unchanged in substance from the prior draft's dedup-review queue (canonicalization itself was preserved, not re-run, per this task's instruction):

| Title | Artist | id (representative) | alternateVideoIds |
|---|---|---|---|
| Virtual Insanity | Jamiroquai | `4JkIs37a2JE` | `OeTFAiYbR9o` |
| From The Start | Laufey | `VArOUfVOjqI` | `lSD_L-xic9o` |
| goosebumps | Travis Scott feat. Kendrick Lamar | `Dst9gZkq1a8` | `FhTtYSU7Q7g` |
| Robbers | The 1975 | `wjHgiSx0RNQ` | `Iyy3YOpxL2k` |
| DNA. | Kendrick Lamar | `NLZRYQMLDW4` | `ue4xoNqdc2I` |
| Mask Off | Future | `xvZqHgFz51I` | `aWb8z-KhZdo` |

None of these merges have been verified by listening; the representative `id` in every case is simply the prior draft's chosen representative `youtubeVideoId`.

---

## J. Metadata review queue

**2 tracks**, unchanged from the prior draft — both are the catalog's only confirmed cross-copy energy conflicts for literal duplicate recordings:

| Title | Artist | id | Provisional energy | Conflict |
|---|---|---|---|---|
| Feather | Nujabes feat. Cise Starr & Akin | `hQ5x8pHoIPA` | medium | `modern-jazz-groove` copy=medium vs. `lofi-bedroom-solitude` copy=low |
| Walking On A Dream | Empire of the Sun | `eimgRedLkkU` | medium | `neon-electronic-night` copy=medium vs. `summer-beach-pop` copy=high |

---

## K. ID validation

| Check | Result |
|---|---|
| Exactly 673 canonical tracks | ✅ Pass |
| Exactly 701 legacy source entries | ✅ Pass |
| Every canonical `id` is a valid 11-character YouTube video ID | ✅ Pass (673/673) |
| Every canonical `id` equals that record's representative YouTube ID from the prior draft | ✅ Pass (673/673) |
| No generated slug IDs remain | ✅ Pass |
| No top-level `youtubeVideoId` field remains | ✅ Pass |
| Every `alternateVideoIds` entry is a valid YouTube video ID | ✅ Pass |
| No canonical `id` is duplicated | ✅ Pass |
| No alternate ID duplicates another canonical track's `id` | ✅ Pass (0 collisions) |
| Every track has exactly one `genre` from the approved 8-value taxonomy | ✅ Pass (673/673) |
| No `primaryGenre` / `secondaryGenres` / `subGenres` field exists | ✅ Pass |
| Every tag is lowercase kebab-case | ✅ Pass |
| No track has more than 8 tags | ✅ Pass (max observed: 8) |
| No `laneId` exists outside `legacy.sourceEntries` | ✅ Pass |
| All `legacy.sourceEntries` unchanged from the prior draft | ✅ Pass (673/673 identical) |
| `docs/music-catalog-genre-migration-draft.ts`/`.md`/`.json` byte-for-byte unchanged | ✅ Pass (verified via `git diff --stat` before and after this task) |
| `musicCatalog.ts` byte-for-byte unchanged | ✅ Pass (7,266 lines, empty `git diff`) |

**A false-positive caught and fixed during this task's own validation script development:** an early version of the "no generated slug id" check flagged legitimate YouTube video IDs that happen to contain a literal `--` substring (e.g. `K3Qzzggn--s`, `h--P8HzYZ74` — both valid 11-character IDs; YouTube's base64url-style ID alphabet allows `-`/`_` anywhere, including consecutively). The check was corrected to validate length/format only, since ID provenance (matches the prior draft's representative `youtubeVideoId` exactly) was already independently verified by a separate check.

---

## L. Exact next action

Do not wire this file into any runtime path yet. The concrete next step is to **add the atmosphere/sound-stat fields this simplification was explicitly scoped to exclude**, using `tags` (256-value vocabulary, §E) and `energy` as the starting point, while carrying the four review-queue flags (`needsGenreReview`, `needsDedupReview`, `needsMetadataReview`, and the 9 zero-tag tracks in §F) forward as pre-existing known gaps rather than re-discovering them. The genre/dedup/metadata review queues themselves (§H–§J) still need the same human pass recommended in the prior draft's report (§Q there) before either file is treated as authoritative — this task only made the data model simpler, it did not resolve any of the underlying uncertainty.
