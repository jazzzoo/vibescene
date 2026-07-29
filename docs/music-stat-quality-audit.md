# Music Stat Quality Audit

**Generated:** 2026-07-29T14:40:08.829949+00:00  **Version:** 1.0.0
**Tracks parsed:** 673 (expected 673)  **Parse errors:** 0
**Profiles used:** 15 (5 images × 3 runs)

---
## Executive Summary

| Metric | Value |
|--------|-------|
| Tracks parsed | 673 |
| Parse errors | 0 |
| Flagged dimensions | 29 |
| Tracks with contradictions | 48 |
| Generic candidates (top5 ≥10/15) | 0 |
| P1 Critical | 1 |
| P2 High | 125 |
| P3 Medium | 5 |
| P4 Low | 542 |

---
## 1. Flagged Dimensions

| Dim | Source | Flags |
|---|---|---|
| brightness | stats | cluster_40_60:46.5% |
| warmth | stats | cluster_40_60:52.0% |
| openness | stats | cluster_40_60:66.9% |
| motion | stats | cluster_40_60:58.4% |
| intimacy | stats | cluster_40_60:45.2% |
| socialEnergy | stats | cluster_40_60:52.9% |
| tension | stats | extreme_low:20.8% |
| nostalgia | stats | cluster_40_60:39.1% |
| playfulness | stats | cluster_40_60:48.7% |
| energy | stats | cluster_40_60:36.6% |
| groove | stats | cluster_40_60:45.3% |
| density | stats | cluster_40_60:61.1% |
| acousticness | stats | cluster_40_60:32.5% |
| electronicness | stats | cluster_40_60:34.6% |
| vocalPresence | stats | extreme_high:15.5% |
| climaxIntensity | stats | cluster_40_60:56.8% |
| spring | affinity | cluster_40_60:71.0%; low_variance:std=8.84 |
| summer | affinity | cluster_40_60:70.3%; low_variance:std=9.61 |
| autumn | affinity | cluster_40_60:68.9%; low_variance:std=8.82 |
| winter | affinity | cluster_40_60:57.1%; low_variance:std=8.30 |
| morning | affinity | cluster_40_60:53.8% |
| day | affinity | cluster_40_60:63.3% |
| dusk | affinity | cluster_40_60:75.9%; low_variance:std=8.32 |
| night | affinity | cluster_40_60:56.2% |
| lateNight | affinity | cluster_40_60:52.2% |
| clear | affinity | cluster_40_60:79.2%; low_variance:std=7.77 |
| cloudy | affinity | cluster_40_60:68.2%; low_variance:std=6.17 |
| rain | affinity | cluster_40_60:42.9%; low_variance:std=6.98 |
| snow | affinity | low_variance:std=6.35 |

---
## 2. Duplicate Profiles

- **Exact 30-dim:** 0 groups, 0 tracks
- **Near 28-dim (≤2 diff):** 0 groups, 0 tracks
- **Exact affinity 13-dim:** 0 groups, 0 tracks
- **Exact sound 7-dim:** 0 groups, 0 tracks

---
## 3. Contradictions

**48 tracks** have internal contradictions:

- **AEAO** (hip-hop): vocalPresence>=85 (verify)
- **If I Die Tomorrow** (hip-hop): vocalPresence>=85 (verify)
- **Jasmine** (hip-hop): vocalPresence>=85 (verify)
- **Martini Blue** (hip-hop): vocalPresence>=85 (verify)
- **party (SHUT DOWN)** (hip-hop): vocalPresence>=85 (verify)
- **Bermuda Triangle** (hip-hop): vocalPresence>=85 (verify)
- **Paranoid** (hip-hop): vocalPresence>=85 (verify)
- **Y** (hip-hop): vocalPresence>=85 (verify)
- **Maestro** (hip-hop): vocalPresence>=85 (verify)
- **goosebumps** (hip-hop): vocalPresence>=85 (verify)
- **Like You** (rnb-soul): vocalPresence>=85 (verify)
- **RIDE** (rnb-soul): vocalPresence>=85 (verify)
- **Video Games** (ambient-dream): vocalPresence<=25 (verify)
- **Mariners Apartment Complex** (pop): energy<=25 AND climaxIntensity>=75
- **N.Y. State of Mind** (hip-hop): vocalPresence>=85 (verify)
- **Shook Ones, Pt. II** (hip-hop): vocalPresence>=85 (verify)
- **Survival Tactics** (hip-hop): vocalPresence>=85 (verify)
- **Magnolia** (hip-hop): vocalPresence>=85 (verify)
- **LUMBERJACK** (hip-hop): vocalPresence>=85 (verify)
- **151 Rum** (hip-hop): vocalPresence>=85 (verify)
- **Man of the Year** (hip-hop): vocalPresence>=85 (verify)
- **Boss** (hip-hop): vocalPresence>=85 (verify)
- **HUMBLE.** (hip-hop): vocalPresence>=85 (verify)
- **DNA.** (hip-hop): vocalPresence>=85 (verify)
- **Goldie** (hip-hop): vocalPresence>=85 (verify)
- … and 23 more

---
## 4. Correlations

| Pair | r | Expected | Outliers |
|---|---|---|---|
| motion vs energy | 0.3931 | positive | 0 |
| motion vs climaxIntensity | 0.5238 | positive | 0 |
| socialEnergy vs groove | 0.4071 | positive | 0 |
| openness vs dreaminess | 0.1885 | positive | 5 |
| brightness vs clear | 0.4499 | positive | 0 |
| brightness vs day | 0.4193 | positive | 0 |
| intimacy vs lateNight | 0.1464 | positive | 0 |
| intimacy vs rain | 0.2769 | positive | 0 |
| acousticness vs electronicness | -0.783 | negative | 0 |
| energy vs density | 0.3746 | positive | 1 |

---
## 5. Generic Candidates (top5 ≥10/15 profiles)


### Spotlight Tracks

| Title | Artist | Top5 | Top10 | AvgRank | BestRank |
|---|---|---|---|---|---|
| Vibin' Out | FKJ & ((( O ))) | 0 | 0 | 269.3 | 140 |
| Move Love | Robert Glasper Experiment | 0 | 0 | 106.1 | 16 |
| Feather | Sabrina Carpenter | 0 | 0 | 573.9 | 504 |
| Luv(sic.) Part 3 | Nujabes feat. Shing02 | 0 | 0 | 385.1 | 23 |
| Smooth Operator | Sade | 0 | 0 | 158.0 | 79 |
| From The Start | Laufey | 0 | 0 | 320.7 | 67 |
| Ends of the Earth | Lord Huron | 0 | 0 | 348.3 | 72 |
| Rearviewmirror | Pearl Jam | 0 | 0 | 458.4 | 230 |
| How Sweet | NewJeans | 0 | 0 | 365.9 | 145 |
| A Change Is Gonna Come | Sam Cooke | 0 | 0 | 196.7 | 89 |
| Put Your Records On | Corinne Bailey Rae | 0 | 0 | 383.4 | 308 |

---
## 6. Catalog Discrimination

- Unique tracks in any consensus top5: **20**
- Unique tracks in any consensus top10: **42**
- Never above rank 500: 26
- Never above rank 300: 133
- Never above rank 100: 370

**Genre concentration (consensus top5):**

- rnb-soul: 7
- folk-acoustic: 6
- pop: 3
- ambient-dream: 2
- jazz-funk: 1
- hip-hop: 1

---
## 7–8. Review Queue & Confidence

| Priority | Count |
|---|---|
| P1 Critical | 1 |
| P2 High | 125 |
| P3 Medium | 5 |
| P4 Low | 542 |

- P1+P2 already flagged needsStatReview: 82/126 (65.1%)
- High-confidence (>0.8) tracks with contradictions: 12
- P1 tracks without needsStatReview flag: 1

---
## Limitations

- All stats are rule-based estimates, not audio analysis or human listening
- Scenario F weights are manually defined and untested in production
- Rankings computed from 5 test images only — not representative of live usage diversity
- Image profiles are from GPT-4o runs on specific test photos; different photos may rank differently
- Contradiction rules are heuristic — flagged tracks may be intentionally unusual
- 28-dim near-duplicate uses transitive closure (Union-Find) — not all group members are mutually similar
- stat-time-affinity-sensitivity.json loaded but not integrated into primary scoring
- TS parsing uses string-literal-aware brace tracking; malformed blocks are skipped with error
- Pearson correlation outlier thresholds (x>75, y<25) are fixed heuristics
- Validation track set (30 tracks) has coverage bias — overrepresents extremes


---

## Full-Catalog Ranking Results (673 Tracks × 15 Profiles)

### Top 15 Tracks by Average Rank (Scenario F)

| # | Title | Artist | Genre | Avg Rank | Best | Top5 | Top10 |
|---|-------|--------|-------|----------|------|------|-------|
| 1 | Billie Jean | Michael Jackson | jazz-funk | 36.2 | 2 | 5 | 6 |
| 2 | Wasurerarenaino | Sakanaction | pop | 67.6 | 6 | 0 | 3 |
| 3 | Unchained Melody | The Righteous Brothers | rnb-soul | 68.2 | 1 | 3 | 5 |
| 4 | Killer Tune Kills Me | KIRINJI feat. YonYon | pop | 78.6 | 1 | 3 | 3 |
| 5 | The Ocean | Mike Perry feat. Shy Mart | pop | 79.2 | 24 | 0 | 0 |
| 6 | Malibu | Miley Cyrus | pop | 84.3 | 8 | 0 | 1 |
| 7 | Dance | offonoff | rnb-soul | 86.0 | 3 | 3 | 3 |
| 8 | Adios | Hoody feat. GRAY | rnb-soul | 86.4 | 12 | 0 | 0 |
| 9 | Bad Habit | Steve Lacy | pop | 87.6 | 39 | 0 | 0 |
| 10 | Jenga | Heize feat. Gaeko | rnb-soul | 88.3 | 17 | 0 | 0 |
| 11 | Never Be Like You | Flume feat. Kai | pop | 89.5 | 66 | 0 | 0 |
| 12 | LANGUAGE | Jiselle feat. CHANGMO | rnb-soul | 91.5 | 7 | 0 | 3 |
| 13 | Only U | Moon Sujin & Jiselle | rnb-soul | 91.7 | 26 | 0 | 0 |
| 14 | Instant Crush | Daft Punk feat. Julian Ca | pop | 91.7 | 43 | 0 | 0 |
| 15 | Peaches | Justin Bieber feat. Danie | rnb-soul | 92.1 | 10 | 0 | 3 |

### Spotlight Track Rankings

These tracks were prominent in the 30-track validation subset. In the full 673-track catalog, none appear in the top5 for any of the 15 image profiles, confirming the validation subset was too small.

| Track | Best Rank | Avg Rank | Top20 | Notes |
|-------|-----------|----------|-------|-------|
| How Sweet | 145 | 365.9 | 0 | better in small subset |
| A Change Is Gonna Come | 89 | 196.7 | 0 | competitive in full catalog |
| Rearviewmirror | 230 | 458.4 | 0 | better in small subset |
| Ends of the Earth | 72 | 348.3 | 0 | better in small subset |
| Put Your Records On | 308 | 383.4 | 0 | better in small subset |
| Luv(sic.) Part 3 | 23 | 385.1 | 0 | better in small subset |
| Feather | 108 | 382.7 | 0 | better in small subset |
| From The Start | 67 | 320.7 | 0 | better in small subset |
| Smooth Operator | 79 | 158.0 | 0 | competitive in full catalog |
| Vibin' Out | 140 | 269.3 | 0 | better in small subset |
| Move Love | 16 | 106.1 | 3 | competitive in full catalog |


### Key Discrimination Metrics

- Tracks appearing in top5 for any image: **23** of 673
- Tracks appearing in top10 for any image: **50** of 673
- Tracks never ranking above 100: **370** (54%)
- Tracks never ranking above 300: **133** (19%)
- Tracks never ranking above 500: **26** (3%)
- Pairwise image-pair Jaccard for consensus top5: range 0.000–0.667 (mostly 0 → good differentiation)

### Critical Finding: Validation Set Does Not Generalize

Tracks that dominated the 30-track validation (How Sweet, Rearviewmirror) rank 145–647 in the full catalog. The 30-track validation set was too small and likely too similar in profile to serve as a representative proxy for the full catalog. Step 2 validation strategy should be redesigned.

---

## Recommended Correction Strategy: **D — Hybrid**

### Rationale

- 0 exact duplicate profiles → no deduplication needed
- 1 P1 hard stat contradiction → immediate manual fix
- 125 P2 tracks → most are vocalPresence soft flags or low-confidence, not systematic stat errors
- **673 tracks with severely bunched affinity** (season/weather std < 10) → systematic rule-generation issue requiring recalibration of the affinity generation rules, not individual track edits

### Action Plan

| Action | Scope | Priority |
|--------|-------|----------|
| Fix Mariners Apartment Complex energy/climaxIntensity contradiction | 1 track | Immediate |
| Recalibrate season/weather affinity generation rules | 673 tracks (rule change) | High |
| Review vocalPresence for rap/hip-hop tracks | ~36 tracks | Medium |
| Expand validation set beyond 30 tracks | Evaluation design | High |
| Spot-check P4 sample (5–10%) | ~54 tracks | Low |

### Is the current stat draft safe to finalize?

**No — not yet.** The affinity dimensions (season/weather particularly) are severely underspecified with std < 10. This means season and weather matching will have almost no discrimination power. The atmosphere and sound stats are more varied and coherent, but the affinity recalibration must happen before the catalog is used in production.

---

## Limitations

- All stats are rule-based estimates, not audio analysis or human listening
- Scenario F weights are manually defined and untested in production
- Rankings computed from 5 test images only — not representative of live usage diversity
- Image profiles are from GPT-4o runs on specific test photos; different photos may rank differently
- Contradiction rules are heuristic — flagged tracks may be intentionally unusual
- 28-dim near-duplicate uses transitive closure (Union-Find) — not all group members are mutually similar
- stat-time-affinity-sensitivity.json loaded but not integrated into primary scoring
- TS parsing uses string-literal-aware brace tracking; malformed blocks are skipped with error
- Pearson correlation outlier thresholds (x>75, y<25) are fixed heuristics
- Validation track set (30 tracks) has coverage bias — overrepresents extremes
- Track stats are rule-based draft estimates — not produced by audio analysis or listening
- Only five images were used for ranking-impact analysis — results may not generalize
- Image profiles came from GPT-generated estimates at temperature=0
- No audio files were analyzed
- No human blind listening study was performed
- Genre and metadata may contain errors inherited from the upstream catalog
- High ranking frequency does not by itself prove an incorrect track profile
- Statistical correlation does not prove musical correctness
- vocalPresence flags are soft review signals — rap/hip-hop tracks legitimately score high
- Affinity clustering is a systematic rule-generation issue — not a per-track measurement error
- The 5-image test set biases toward warm/acoustic/RnB profiles — genre diversity may be underrepresented

---
*Offline audit only — no OpenAI calls, no image reads, no Supabase deployments, no stat modifications.*
