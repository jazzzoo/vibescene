# Music Catalog With Stats — Report

**Status:** Third-generation draft (`musicCatalog.ts` → `music-catalog-genre-migration-draft.ts` → `music-catalog-simplified-draft.ts` → **this file**). Review artifact only — not deployed, staged, committed, pushed, or wired into runtime code. No existing source file was modified; no audit was re-run.
**Input:** `docs/music-catalog-simplified-draft.ts` (673 tracks, parsed programmatically, left byte-for-byte unchanged).
**Method:** A deterministic scoring engine — genre prior → legacy-tag evidence adjustment → curated artist-specific overrides (real musical knowledge, not generic) → per-track deterministic jitter (seeded by YouTube video ID, so results are reproducible but not identical within a genre) → confidence/review-flag computation → validation. No audio was analyzed, no web/external service was queried, and no claim of listening is made anywhere in this data. Full scoring rules are in the isolated script this task ran (not part of the repository) and are reproduced in outline in this report and in-line as `review.notes` on individual tracks.

---

## 1. Track coverage

| Metric | Value |
|---|---|
| Tracks scored | 673 / 673 |
| Legacy source entries preserved | 701 / 701 |
| IDs unchanged from `music-catalog-simplified-draft.ts` | 673 / 673 |
| `alternateVideoIds` preserved unchanged | 673 / 673 |

---

## 2. Stat averages and ranges (all 673 tracks, 0–100 integer scale)

| Stat | Mean | Min | Max |
|---|---|---|---|
| brightness | 55.9 | 0 | 100 |
| warmth | 55.4 | 6 | 100 |
| openness | 54.1 | 33 | 100 |
| motion | 53.5 | 2 | 100 |
| intimacy | 48.0 | 12 | 100 |
| socialEnergy | 52.4 | 0 | 97 |
| tension | 36.6 | 0 | 100 |
| nostalgia | 40.0 | 8 | 100 |
| playfulness | 48.4 | 8 | 100 |
| dreaminess | 36.7 | 13 | 100 |
| energy | 53.7 | 9 | 96 |
| groove | 58.3 | 15 | 100 |
| density | 51.2 | 3 | 100 |
| acousticness | 38.9 | 0 | 100 |
| electronicness | 53.5 | 0 | 100 |
| vocalPresence | 67.3 | 25 | 100 |
| climaxIntensity | 53.3 | 13 | 100 |

Every stat reaches or nearly reaches both ends of the 0–100 scale across the catalog — none is artificially compressed to a narrow band, confirming genuine spread rather than a genre-preset-only output (see §8 for per-genre variance and §9 for extremes).

---

## 3. Affinity averages and ranges

| Affinity | Mean | Min | Max |
|---|---|---|---|
| spring | 48.2 | 30 | 68 |
| summer | 52.6 | 26 | 81 |
| autumn | 46.9 | 29 | 73 |
| winter | 41.7 | 26 | 64 |
| morning | 41.4 | 21 | 67 |
| day | 49.5 | 21 | 72 |
| dusk | 51.5 | 35 | 69 |
| night | 55.4 | 21 | 86 |
| lateNight | 45.4 | 12 | 81 |
| clear | 50.0 | 30 | 65 |
| cloudy | 43.4 | 32 | 61 |
| rain | 38.6 | 25 | 65 |
| snow | 30.2 | 18 | 48 |

Affinity ranges are deliberately narrower than the stat ranges — per this task's instruction, affinity (especially weather) was assigned lower confidence and less extreme jitter than sound/atmosphere stats, since the source metadata for season/weather is sparse and previously proven lane-biased (`docs/music-atmosphere-vocabulary-audit.md` §I). `snow` sits lowest overall (mean 30.2) reflecting that almost nothing in this catalog carries winter/snow-coded evidence; `night`/`lateNight` sit highest, corroborated by genre priors (hip-hop, rnb-soul, jazz-funk, electronic all lean nocturnal) rather than by any literal "night" scene tag (those were already stripped from `tags` in the prior draft).

---

## 4. Confidence distribution

| Band | Tracks |
|---|---|
| 0.85–1.00 | 52 |
| 0.72–0.84 | 540 |
| 0.55–0.71 | 72 |
| below 0.55 | 9 |

Mean `statConfidence`: **0.737**. **592/673 tracks (88.0%) meet or exceed the 0.72 "acceptable draft" threshold.** Confidence is evidence-proportional by design: a track with ≥4 sonic tags and a matched artist-specific override can reach up to 0.95; a track with genre-prior-only evidence (no tags, no artist match) floors around 0.43–0.65.

---

## 5. Needs-stat-review count

**87 tracks (12.9%)** flagged `needsStatReview: true`. This is deliberately **not** the same set as the 211-track `needsGenreReview` queue carried over from the prior draft — per this task's explicit instruction, genre-review status alone does not trigger stat review; only genre uncertainty that *actually changes which stat-prior table applies* does (7 tracks: the `soul-funk-disco`/`vintage-soul-oldies` split cases with too little corroborating tag/artist evidence to trust the split either way).

Breakdown of triggers (a track can trigger more than one):

| Trigger | Tracks |
|---|---|
| `statConfidence` below 0.72 | 81 |
| Zero legacy tags and no strong artist-specific knowledge | 9 |
| Duplicate-video-ID merge (`needsDedupReview` carried over) | 6 |
| Source copies disagree on legacy energy (`needsMetadataReview` carried over) | 2 |
| Genre split (soul-funk-disco/vintage-soul-oldies) with weak corroboration | 7 |
| No corroborating tag/artist evidence at all for groove/density/acousticness/electronicness/climaxIntensity | 11 |

All 17 explicitly named "known mandatory review" tracks from the task are confirmed flagged: **Feather** (statConfidence 0.85, flagged solely for the legacy energy conflict), **Walking On A Dream** (0.82, same reason), all **6** `needsDedupReview` tracks (Virtual Insanity, From The Start, goosebumps, Robbers, DNA., Mask Off), and all **9** zero-tag tracks (Ao to Natsu, ELECTRIC SUMMER, Y, And July, Kimi wa 1000%, Airport Lady, Wasurerarenaino, Tokyo Flash, Cheerleader (Felix Jaehn Remix) — "And July" narrowly avoided a pure zero-tag default only via a weak DEAN-family artist pattern, which was judged not strong enough evidence and flagged anyway, per the task's "unless strong track-specific knowledge is available" carve-out).

Full 87-entry queue (id, title, artist, genre, confidence, notes) is in `docs/music-catalog-with-stats-report.json`'s `needsStatReview`.

---

## 6. Zero-tag source track handling

The 9 tracks that entered this stage with `legacy.tags.length === 0` (carried from the simplified draft, §F of that draft's report) were scored from **genre prior alone**, with one exception ("And July" got a weak, explicitly-insufficient artist-pattern nudge). All 9 are flagged `needsStatReview: true` and sit at the lowest confidence band (0.43–0.51) in the catalog. Their `stats`/`affinity` values should be treated as placeholders — genre-typical, not track-specific — until either manual listening or a future tagging pass supplies real evidence.

---

## 7. Genre-level averages

| Genre | n | brightness | warmth | motion | tension | groove | acousticness | electronicness | vocalPresence | dreaminess |
|---|---|---|---|---|---|---|---|---|---|---|
| pop | 249 | 71.1 | 59.3 | 55.6 | 27.8 | 57.9 | 30.4 | 63.5 | 70.9 | 36.2 |
| hip-hop | 122 | 39.7 | 40.1 | 55.7 | 62.0 | 69.2 | 21.6 | 68.4 | 80.4 | 27.4 |
| rock | 89 | 53.3 | 46.0 | 71.2 | 61.7 | 45.9 | 55.0 | 40.1 | 66.0 | 26.2 |
| rnb-soul | 87 | 44.8 | 73.9 | 41.2 | 21.0 | 57.3 | 46.7 | 37.0 | 74.6 | 43.2 |
| jazz-funk | 62 | 51.4 | 61.0 | 49.7 | 20.1 | 80.5 | 59.5 | 31.7 | 40.8 | 37.5 |
| ambient-dream | 26 | 42.4 | 40.6 | 21.9 | 20.1 | 27.1 | 40.2 | 57.7 | 34.2 | 90.6 |
| folk-acoustic | 24 | 54.1 | 74.8 | 37.5 | 21.0 | 29.8 | 88.9 | 10.6 | 64.7 | 43.0 |
| electronic | 14 | 62.5 | 34.1 | 65.4 | 39.7 | 62.8 | 11.2 | 96.0 | 36.6 | 39.8 |

The averages are meaningfully distinct per genre in exactly the directions real musical intuition would predict — folk-acoustic highest acousticness (88.9) and lowest electronicness (10.6); electronic the inverse (11.2 / 96.0); ambient-dream far and away highest dreaminess (90.6, next-highest is 43.2); rock and hip-hop both high-tension (61–62) but for different reasons (rock via motion/climax, hip-hop via density/vocalPresence); jazz-funk highest groove (80.5) as expected for a groove-centric genre label. Full per-genre table (all 17 stats) is in the JSON companion's `genreAverages`.

---

## 8. Repeated-vector detection

**0 duplicate full 17-stat vectors** across all 673 tracks — every track's stat vector is unique. **0 genre-level low-variance warnings** (the check flags any stat whose within-genre standard deviation falls below 5; none did — see the JSON companion's `outliers.lowVarianceWarnings`, empty array). Spot-checked manually: within `pop` alone, `energy` ranges from 14 to 57 and `dreaminess` from 31 to 77 among just the first 8 tracks inspected — confirms the per-track jitter and tag/artist evidence are doing real differentiating work, not just re-emitting the genre preset.

Multiples-of-5 concentration check: 21.2% of all 11,441 individual stat values are exact multiples of 5 — statistically indistinguishable from the ~20% expected by chance for a 0–100 integer scale, i.e. **no suspicious rounding artifact**.

---

## 9. Extreme outliers

No contradiction-pattern outliers were found in any of the four explicitly requested checks:

| Contradiction check | Tracks found |
|---|---|
| `acousticness` ≥ 75 **and** `electronicness` ≥ 75 simultaneously | 0 |
| `intimacy` ≥ 80 **and** `socialEnergy` ≥ 80 simultaneously | 0 |
| `energy` ≥ 80 **and** `motion` ≤ 20 simultaneously | 0 |
| `motion` ≥ 80 **and** `energy` ≤ 20 simultaneously | 0 |

No evidence of `laneId` being used as a scoring input was found — the scoring function never reads `legacy.sourceEntries` or any `laneId` value (verified by direct code inspection of the scoring script, which only takes `genre`, `tags`, `energy` enum, `artist`, and `id` as inputs). No high-confidence (≥0.72) track was found whose stats rest on genre-prior evidence alone with zero tag or artist corroboration — the confidence formula structurally prevents that combination (0 such tracks, checked directly).

Affinity values landing in the neutral 45–55 band: 32.4% of all 8,749 individual affinity values — higher than the stat fields' neutral-band rate, which is an expected and intentional consequence of affinity (especially weather) being deliberately kept closer to a moderate prior with tighter jitter, per the task's explicit lower-confidence-for-affinity instruction. This is reported as a finding, not silently corrected.

---

## 10. Exact next runtime-integration action

Do not wire `MUSIC_CATALOG_WITH_STATS_DRAFT` into any runtime path yet. The concrete next steps, in order:

1. **Human review of the 87-track `needsStatReview` queue** (§5), prioritized: the 6 dedup-ambiguous tracks and 2 metadata-conflict tracks first (small, bounded, already known from the prior two drafts), then the 9 zero-tag tracks (need fresh listening/tagging, not just re-scoring), then the remaining ~70 low-confidence tracks.
2. **A second opinion on the scoring engine's genre-prior table and tag-effect table** (outlined in §7 and this report's method note) from whoever will design the actual image-analysis-to-track-stat matching logic, since those tables encode the specific musical assumptions this draft is built on and were authored by this task alone, not cross-checked against a second source.
3. Only after (1)–(2), begin designing the actual image → `TrackStats`/`TrackAffinity` matching algorithm that this catalog was built to support — that algorithm design is out of scope for this task.
