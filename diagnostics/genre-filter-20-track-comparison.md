# Genre-First Catalog Filter + 20-Track Expansion — Fixture Comparison

Generated: 2026-08-07T02:16:12.935Z

**Mode: fixture-only.** No OpenAI calls were made. Every `primaryGenres`/`subgenres` selection below is a
manually declared, real canonical id from `musicGenreTaxonomy.ts` — not derived from any GPT response.
This validates the filter/scoring/sequencing pipeline mechanics only. It does **not** validate whether
GPT reliably picks good canonical genres for a real photo — that requires a new real 12-image GPT run
(see the caveat at the bottom of this file).

Catalog: 795 total tracks, 795 with a verified youtubeVideoId.
FINAL_TRACK_COUNT = 20, CATALOG_CANDIDATE_POOL_SIZE = 30.

Checks: 134 run, 134 passed, 0 failed.

## Fixture results (all genuinely valid AND adequate — every one reaches exactly 20)

| fixture | primaryGenres | subgenres | genre-eligible | candidate pool | final tracks | reached 20 |
|---|---|---|---|---|---|---|
| dream-pop + shoegaze | rock | dream-pop, shoegaze | 161 | 30 | 20 | yes |
| folk-acoustic + singer-songwriter | folk-acoustic | singer-songwriter, indie-folk | 47 | 30 | 20 | yes |
| rock + indie-rock + alternative-rock † | rock | indie-rock, alternative-rock | 161 | 30 | 20 | yes |
| rnb-soul + k-rnb + alt-rnb | rnb-soul | k-rnb, alt-rnb | 127 | 30 | 20 | yes |
| hip-hop + jazz-rap + lofi-hiphop | hip-hop | jazz-rap, lofi-hiphop | 120 | 30 | 20 | yes |
| jazz + jazz-hop + nu-jazz | jazz | jazz-hop, nu-jazz | 51 | 30 | 20 | yes |
| pop + city-pop | pop | city-pop | 226 | 30 | 20 | yes |
| pop + bright-feeling subgenres † | pop | teen-pop, dance-pop | 226 | 30 | 20 | yes |
| mixed K-R&B + hip-hop + jazz | rnb-soul, hip-hop, jazz | k-rnb, jazz-rap, nu-jazz | 298 | 30 | 20 | yes |
| narrow-but-adequate single primary genre near minimum eligible count † | jazz | jazz-hop, nu-jazz | 51 | 30 | 20 | yes |

† Notes:
- **rock + indie-rock + alternative-rock**: requested "folk-rock" is not a real taxonomy subgenre id — substituted with alternative-rock (both under rock)
- **pop + bright-feeling subgenres**: requested "bright pop" is not a real taxonomy id — substituted with teen-pop + dance-pop (both real, bright-feeling pop subgenres)
- **narrow-but-adequate single primary genre near minimum eligible count**: jazz alone is the smallest single primaryGenre that still clears FINAL_TRACK_COUNT on its own (50 eligible) — the genuinely narrow ones (electronic=18, ambient-experimental=3) are NOT valid production fixtures anymore: see "Rejected selections" below, they are caught by gpt.ts's adequacy gate before ever reaching this pipeline

## Rejected selections (valid shape, but caught by the Step 6 adequacy gate BEFORE reaching this pipeline)

These are real, schema-valid GPT-reachable selections (1 primaryGenre + 2-6 of its own compatible
subgenres) that `gpt.ts`'s `validateGenreSelectionWithCoverage` rejects — and, per the one-time
correction retry, asks GPT to broaden — because the catalog does not have enough tracks for them alone.

| selection | eligible tracks | meets FINAL_TRACK_COUNT |
|---|---|---|
| ambient-experimental alone | 3 | no |
| electronic alone | 18 | no |
| electronic + ambient-experimental (combined) | 21 | yes |

## Corrected Phase 1 coverage audit: valid single-primaryGenre-alone selections (real 795-track catalog)

Each row uses that one primaryGenre plus its OWN subgenres only (a genuinely valid GPT-output shape —
1 primary + 2-6 compatible subgenres). This is the ONLY way a single-primary selection can be valid,
and it collapses to the primary-alone count since a lone primary's subgenre tracks are a subset of it.

| primaryGenre | eligible tracks | meets FINAL_TRACK_COUNT |
|---|---|---|
| pop | 226 | yes |
| hip-hop | 120 | yes |
| rnb-soul | 127 | yes |
| rock | 161 | yes |
| jazz | 51 | yes |
| electronic | 18 | no |
| folk-acoustic | 47 | yes |
| funk-disco | 42 | yes |
| ambient-experimental | 3 | no |

**Genuinely insufficient valid combinations: exactly 2** — electronic (18 tracks), ambient-experimental (3 tracks).

Any 2-or-3-primaryGenre combination (the other valid shape GPT can produce) was checked against the two
narrowest primaries together (`electronic` + `ambient-experimental`, the worst realistic case) and
already clears the minimum at 21 eligible tracks — so no multi-primary selection is expected to be
insufficient in practice; only a lone narrow primaryGenre is a real risk.

### Excluded as artificial (NOT valid GPT output shapes — audit trail only, not production risk)

A previous, uncorrected version of this report also computed "subgenre alone with zero primaryGenres"
(65 such rows) and generic "primary + first 2 subgenres" combos, and cited 52 of 83 tested selections
as "producing fewer than 20" without first checking whether GPT could ever actually emit that shape.
`primaryGenres` requires 1-3 entries — an empty `primaryGenres` array is invalid and rejected by
`validateGenreSelection` before coverage is ever checked, so those rows were never a real production risk.
This report recomputes them for the record only: 65 artificial "subgenre-alone" rows checked,
48 of them under 20 — none of this is cited as production risk in this report.

## No contradictory fallback in the dominant genre-filtered path

`gpt.ts`'s `analyzeImage()` now rejects (with one correction retry, then an explicit `SafeError`) any
genre selection that does not meet `FINAL_TRACK_COUNT` — so by the time a request reaches `index.ts`,
`genreEligibleCatalogPool.length` is already guaranteed >= `FINAL_TRACK_COUNT`. `index.ts`'s dominant path
now requires `topScoredTracks.length >= FINAL_TRACK_COUNT` (not just `MIN_CATALOG_TRACKS`) to return a
successful result, and throws an explicit `SafeError` instead of falling through to the genre-blind
`selectFlatCatalogTracks` fallback if that upstream guarantee is somehow not met at request time. The
legacy flat-catalog/YouTube-search fallback code is preserved (not deleted) but is dead/unreachable code
under this architecture — see the comments in `index.ts` around the throw.

## Real-GPT validation required

The cached `diagnostics/real-image-music-evaluation.json` (12 real images) only contains the OLD
free-text `primary_genre`/`secondary_genre` fields from before this change — these were NOT fabricated
into canonical `primaryGenres`/`subgenres` arrays for this report. A new real GPT-4o run over the 12
test images (via `scripts/evaluate-real-image-music.mjs`) is required to validate that GPT reliably
selects good, taxonomy-valid canonical genres for real photos end-to-end.
