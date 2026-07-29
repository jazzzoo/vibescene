# Music Catalog Stats Correction — Report

**Status:** Correction candidate draft. Review artifact only — not deployed, not wired into runtime code.
**Input:** `docs/music-catalog-with-stats-draft.ts` (673 tracks, unchanged).
**Changed dimensions:** spring, summer, autumn, winter, clear, cloudy, rain, snow (8 of 13 affinity dims).
**Method:** Deterministic weighted formula from existing track stats. No API calls, no randomization.

---

## Phase 2 — Generation Rule Findings

### Confirmed rules (from report MD + audit JSON)

- Original values used genre prior tables + legacy tag evidence + per-track deterministic jitter (seeded by YouTube ID)
- Season/weather had narrower jitter than atmosphere stats (lower-confidence affinity per original design)
- All 8 dims had std < 10, all clustered 40-60 (confirmed by audit JSON)
- spring: min=30, max=68, std=8.84, mean=48.2, 71.0% in 40-60
- summer: min=26, max=81, std=9.61, mean=52.6, 70.3% in 40-60
- autumn: min=29, max=73, std=8.82, mean=46.9, 68.9% in 40-60
- winter: min=26, max=64, std=8.30, mean=41.7, 57.1% in 40-60
- clear:  min=30, max=65, std=7.77, mean=50.0, 79.2% in 40-60
- cloudy: min=32, max=61, std=6.17, mean=43.4, 68.2% in 40-60
- rain:   min=25, max=65, std=6.98, mean=38.6, 42.9% in 40-60
- snow:   min=18, max=48, std=6.35, mean=30.2, 5.1% in 40-60

### Inferred rules (reconstructed from output patterns)

- Genre priors likely used a small range (e.g. base value ± 5-8 jitter) for season/weather, while stats used ± 15-20
- The jitter seeded by YouTube ID prevented identical vectors but kept values tightly bounded
- No track-specific musical analysis for season/weather — purely genre-level prior + small noise
- The original task instruction 'affinity assigned lower confidence and less extreme jitter than sound/atmosphere stats' explains the tight clustering

---

## Phase 3 — Correction Formulas

All formulas use existing track `stats` as inputs, clamped to [5, 95], rounded to integer.
Design principle: 2 inputs with large weights (0.50-0.65) preserve input variance better than 5+ diluted inputs. High-variance stats (brightness std=17.46, tension std=21.82, warmth=16.8, intimacy=16.11) chosen as primary inputs.

| Dimension | Formula |
|---|---|
| spring | `clamp(round(0.65*brightness + 0.35*openness), 5, 95)` |
| summer | `clamp(round(0.65*warmth + 0.35*brightness), 5, 95)` |
| autumn | `clamp(round(0.40*nostalgia + 0.60*(100-brightness)), 5, 95)` |
| winter | `clamp(round(0.50*dreaminess + 0.50*(100-tension)), 5, 95)` |
| clear | `clamp(round(0.60*brightness + 0.40*(100-tension)), 5, 95)` |
| cloudy | `clamp(round(0.55*(100-brightness) + 0.45*dreaminess), 5, 95)` |
| rain | `clamp(round(0.60*intimacy + 0.40*nostalgia), 5, 95)` |
| snow | `clamp(round(0.80*(100-warmth) + 0.20*dreaminess), 5, 95)` |

---

## Phase 5 — Distribution Comparison (Original vs Candidate)

| Dim | Dir | min | max | mean | std | P25 | P50 | P75 | pct_40_60 | pct<20 | pct>80 | flags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| spring | orig | 30 | 68 | 48.2 | 8.84 | 41.0 | 48.0 | 55.0 | 71.0% | 0.0% | 0.0% | low_variance:std=8.84, cluster_40_60:71.0% |
| spring | cand | 14 | 89 | 55.32 | 12.58 | 47.0 | 54.0 | 64.0 | 56.2% | 0.4% | 2.4% | — |
| summer | orig | 26 | 81 | 52.58 | 9.61 | 45.0 | 53.0 | 59.0 | 70.3% | 0.0% | 0.1% | low_variance:std=9.61, cluster_40_60:70.3% |
| summer | cand | 8 | 89 | 55.59 | 13.23 | 47.0 | 56.0 | 65.0 | 52.5% | 0.4% | 2.4% | — |
| autumn | orig | 29 | 73 | 46.88 | 8.81 | 39.0 | 47.0 | 54.0 | 68.9% | 0.0% | 0.0% | low_variance:std=8.81, cluster_40_60:68.9% |
| autumn | cand | 10 | 78 | 42.42 | 12.02 | 35.0 | 43.0 | 51.0 | 54.5% | 3.7% | 0.0% | — |
| winter | orig | 26 | 64 | 41.65 | 8.29 | 34.0 | 42.0 | 49.0 | 57.1% | 0.0% | 0.0% | low_variance:std=8.29 |
| winter | cand | 8 | 95 | 50.05 | 15.79 | 40.0 | 52.0 | 59.0 | 55.4% | 3.4% | 2.8% | — |
| clear | orig | 30 | 65 | 50.05 | 7.76 | 44.0 | 50.0 | 56.0 | 79.2% | 0.0% | 0.0% | low_variance:std=7.76, cluster_40_60:79.2% |
| clear | cand | 5 | 93 | 58.93 | 15.4 | 49.0 | 60.0 | 70.0 | 38.8% | 1.3% | 6.5% | extreme_high:6.5% |
| cloudy | orig | 32 | 61 | 43.42 | 6.17 | 38.0 | 44.0 | 48.0 | 68.2% | 0.0% | 0.0% | low_variance:std=6.17, cluster_40_60:68.2% |
| cloudy | cand | 11 | 86 | 40.76 | 12.08 | 33.0 | 40.0 | 47.0 | 46.2% | 3.0% | 0.9% | — |
| rain | orig | 25 | 65 | 38.57 | 6.97 | 33.0 | 38.0 | 43.0 | 42.9% | 0.0% | 0.0% | low_variance:std=6.97 |
| rain | cand | 14 | 87 | 44.78 | 12.53 | 36.0 | 43.0 | 52.0 | 47.8% | 0.3% | 0.9% | — |
| snow | orig | 18 | 48 | 30.24 | 6.35 | 25.0 | 30.0 | 35.0 | 5.1% | 2.2% | 0.0% | low_variance:std=6.35 |
| snow | cand | 6 | 95 | 43.03 | 13.46 | 36.0 | 44.0 | 51.0 | 55.1% | 5.6% | 0.3% | extreme_low:5.6% |

### Pass/fail criteria (std > 12, pct_40_60 < 65%, pct<20 < 5%, pct>80 < 5%)

| Dimension | std_ok | cluster_ok | extreme_ok | PASS |
|---|---|---|---|---|
| spring | ✓ | ✓ | ✓ | ✓ |
| summer | ✓ | ✓ | ✓ | ✓ |
| autumn | ✓ | ✓ | ✓ | ✓ |
| winter | ✓ | ✓ | ✓ | ✓ |
| clear | ✓ | ✓ | ✓ | ✓ |
| cloudy | ✓ | ✓ | ✓ | ✓ |
| rain | ✓ | ✓ | ✓ | ✓ |
| snow | ✓ | ✓ | ✓ | ✓ |

---

## Phase 6 — Musical Coherence

### Contradictions

| Check | Original | Candidate |
|---|---|---|
| summer_high_winter_high | 0 | 25 |
| clear_high_rain_high | 0 | 6 |
| spring_high_autumn_high | 2 | 0 |

**Candidate contradiction details:**

- **summer_high_winter_high** (25 tracks):
  - Gold (id=cgeijHtv0ic)
  - WA-R-R (id=mjVq7Ha_WtQ)
  - Night Cruising (id=Xe4RUhlULXA)
  - You're My Baby (id=H45Z0KuRDk4)
  - Naked as We Came (id=Nd-A-iiPoLg)
- **clear_high_rain_high** (6 tracks):
  - D (Half Moon) (id=eelfrHtmk68)
  - Bye bye my blue (id=WbhK3wMXluE)
  - Run With Me (id=GOS6C2jXTa8)
  - The Night We Met (id=KtlgYxa6BMU)
  - Let's Stay Together (id=XXx6RDzR6eM)

### Correlation (Pearson r): Candidate

| Pair | r | Expected |
|---|---|---|
| brightness_vs_clear | 0.8411 | positive |
| warmth_vs_summer | 0.8884 | positive |
| nostalgia_vs_autumn | 0.4906 | positive |
| intimacy_vs_rain | 0.9071 | positive |
| openness_vs_snow | 0.0567 | positive_moderate |
| dreaminess_vs_rain | 0.3912 | positive |
| brightness_vs_spring | 0.9544 | positive |
| dreaminess_vs_winter | 0.7804 | positive |
| socialEnergy_vs_summer | 0.0571 | positive |
| tension_vs_rain | -0.4786 | weak_negative_acceptable |

---

## Phase 7 — Ranking Comparison (15 GPT Profiles)

### image-01

**Consensus Top-5 (tracks in top-5 in ≥2 of 3 runs):**

| | Original | Candidate |
|---|---|---|
| 1 | Perfect Strangers | Killer Tune Kills Me |
| 2 | Killer Tune Kills Me | No Idea |
| 3 | No Idea | Waves (Robin Schulz Remix Radio Edit) |
| 4 | Waves (Robin Schulz Remix Radio Edit) | — |

**Largest rank movers (original → candidate):**

| Title | Orig rank | Cand rank | Δ |
|---|---|---|---|
| everything i wanted | 129 | 201 | +72 |
| Lucky Man | 196 | 268 | +72 |
| Creepin' | 135 | 200 | +65 |
| All About Us | 239 | 177 | -62 |
| If I Die Tomorrow | 243 | 302 | +59 |

**Affinity share (season+weather % of total distance):**

- Original avg: 11.0%
- Candidate avg: 12.5%

### image-02

**Consensus Top-5 (tracks in top-5 in ≥2 of 3 runs):**

| | Original | Candidate |
|---|---|---|
| 1 | A Walk | A Walk |
| 2 | Awake | Awake |
| 3 | Stay Alive | Stay Alive |
| 4 | Heartbeats | Heartbeats |
| 5 | Big Black Car | Big Black Car |

**Largest rank movers (original → candidate):**

| Title | Orig rank | Cand rank | Δ |
|---|---|---|---|
| Hate Everything | 412 | 482 | +70 |
| Lazy Eye | 304 | 373 | +69 |
| Bye bye my blue | 411 | 472 | +61 |
| Gondry | 440 | 499 | +59 |
| Sofa | 233 | 288 | +55 |

**Affinity share (season+weather % of total distance):**

- Original avg: 6.1%
- Candidate avg: 7.3%

### image-03

**Consensus Top-5 (tracks in top-5 in ≥2 of 3 runs):**

| | Original | Candidate |
|---|---|---|
| 1 | All My Days | All My Days |
| 2 | Billie Jean | Billie Jean |
| 3 | Cleopatra | Cleopatra |
| 4 | Dance | Stay Alive |
| 5 | Unchained Melody | Unchained Melody |

**Largest rank movers (original → candidate):**

| Title | Orig rank | Cand rank | Δ |
|---|---|---|---|
| Ain't No Sunshine | 168 | 248 | +80 |
| egyptian pools | 304 | 235 | -69 |
| Cinnamon Sugar | 252 | 193 | -59 |
| Bad Romance | 262 | 206 | -56 |
| And July | 118 | 170 | +52 |

**Affinity share (season+weather % of total distance):**

- Original avg: 11.0%
- Candidate avg: 12.8%

### image-04

**Consensus Top-5 (tracks in top-5 in ≥2 of 3 runs):**

| | Original | Candidate |
|---|---|---|
| 1 | Big Jet Plane | A Walk |
| 2 | Awake | Big Jet Plane |
| 3 | A Walk | Awake |
| 4 | Heartbeats | Heartbeats |
| 5 | — | Big Black Car |

**Largest rank movers (original → candidate):**

| Title | Orig rank | Cand rank | Δ |
|---|---|---|---|
| Hate Everything | 339 | 434 | +95 |
| Sakura Trees | 346 | 407 | +61 |
| Bye bye my blue | 400 | 453 | +53 |
| What 2 Do | 322 | 374 | +52 |
| Gondry | 267 | 316 | +49 |

**Affinity share (season+weather % of total distance):**

- Original avg: 4.8%
- Candidate avg: 5.8%

### image-05

**Consensus Top-5 (tracks in top-5 in ≥2 of 3 runs):**

| | Original | Candidate |
|---|---|---|
| 1 | On & On | On & On |
| 2 | Hate Everything | Hit The Road Jack |
| 3 | Try a Little Tenderness | Try a Little Tenderness |
| 4 | Feeling Good | — |

**Largest rank movers (original → candidate):**

| Title | Orig rank | Cand rank | Δ |
|---|---|---|---|
| Linger | 286 | 388 | +102 |
| Saw You in a Dream | 252 | 351 | +99 |
| Aruarian Dance | 172 | 270 | +98 |
| Come Away With Me | 217 | 311 | +94 |
| egyptian pools | 250 | 161 | -89 |

**Affinity share (season+weather % of total distance):**

- Original avg: 12.6%
- Candidate avg: 15.8%

---

## Phase 8 — Synthetic Profile Stress Test

### bright_clear_summer_day

*Candidate should rank bright, high-energy pop tracks higher. Summer+clear tracks should dominate.*

| Rank | Original | Candidate |
|---|---|---|
| 1 | Flower Road | Flower Road |
| 2 | Feels | Feels |
| 3 | Eventually | NEW ERA |
| 4 | NEW ERA | Eventually |
| 5 | Lean On | Style |
| 6 | Electric Love | California Gurls |
| 7 | Style | Lean On |
| 8 | Brighter Than The Sun | Electric Love |
| 9 | Pocketful of Sunshine | Brighter Than The Sun |
| 10 | California Gurls | Say It |

Top-5 overlap: 4/5

### warm_spring_morning

*Candidate should favor warm folk-acoustic and pop-spring tracks. Low tension, open, playful.*

| Rank | Original | Candidate |
|---|---|---|
| 1 | Get A Guitar | Get A Guitar |
| 2 | Good Times | Good Times |
| 3 | The Ocean | Smooth Operator |
| 4 | You're My Baby | The Ocean |
| 5 | Never Be Like You | Magnetic |
| 6 | golden hour | You're My Baby |
| 7 | Malibu | Malibu |
| 8 | Magnetic | golden hour |
| 9 | Smooth Operator | Never Be Like You |
| 10 | Stay With Me | Chamber Of Reflection |

Top-5 overlap: 3/5

### rainy_autumn_evening

*Candidate should rank intimate, nostalgic rnb-soul and folk tracks higher. High rain+autumn.*

| Rank | Original | Candidate |
|---|---|---|
| 1 | Ain't No Sunshine | Ain't No Sunshine |
| 2 | Hate Everything | Hate Everything |
| 3 | Control Me | Control Me |
| 4 | This Magic Moment | This Magic Moment |
| 5 | Jenga | Jenga |
| 6 | Cigarette | LANGUAGE |
| 7 | Photograph | I'd Rather Go Blind |
| 8 | I'd Rather Go Blind | Cigarette |
| 9 | What 2 Do | Reach Out I'll Be There |
| 10 | Redbone | Redbone |

Top-5 overlap: 5/5

### cold_snowy_winter_night

*Candidate should favor ambient-dream and introspective tracks. High snow+winter, low warmth.*

| Rank | Original | Candidate |
|---|---|---|
| 1 | Into Dust | Into Dust |
| 2 | Cariño | Cariño |
| 3 | Fade Into You | Fade Into You |
| 4 | A Walk | A Walk |
| 5 | Linger | ocean eyes |
| 6 | Saw You in a Dream | Saw You in a Dream |
| 7 | Video Games | Awake |
| 8 | Awake | Angels |
| 9 | Angels | Linger |
| 10 | Pictures of You | Pictures of You |

Top-5 overlap: 4/5

### cloudy_intimate_late_night

*Candidate should rank dreamy, intimate tracks highly. High cloudy, high intimacy.*

| Rank | Original | Candidate |
|---|---|---|
| 1 | Ain't No Sunshine | Ain't No Sunshine |
| 2 | Fade Into You | Hate Everything |
| 3 | Cariño | Cariño |
| 4 | Restless | Fade Into You |
| 5 | Hate Everything | Restless |
| 6 | Cigarette | Cigarette |
| 7 | Linger | Linger |
| 8 | This Magic Moment | This Magic Moment |
| 9 | Photograph | Photograph |
| 10 | Angels | Redbone |

Top-5 overlap: 5/5

### energetic_hot_summer_social

*Candidate should rank high-energy hip-hop and electronic tracks. Summer+clear strongly.*

| Rank | Original | Candidate |
|---|---|---|
| 1 | Bam Yang Gang | Bam Yang Gang |
| 2 | Summer | Summer |
| 3 | Feels | Flower Road |
| 4 | Flower Road | California Gurls |
| 5 | California Gurls | Feels |
| 6 | Groove Is In The Heart | Groove Is In The Heart |
| 7 | Feel It Still | Feel It Still |
| 8 | Cake By The Ocean | Cake By The Ocean |
| 9 | good 4 u | brutal |
| 10 | Rush | Still Into You |

Top-5 overlap: 5/5

### sparse_dreamlike_winter

*Candidate should rank ambient-dream and sparse acoustic tracks. High snow+winter.*

| Rank | Original | Candidate |
|---|---|---|
| 1 | A Walk | Into Dust |
| 2 | Into Dust | A Walk |
| 3 | Cariño | ocean eyes |
| 4 | ocean eyes | Cariño |
| 5 | Alison | Alison |
| 6 | Saw You in a Dream | Saw You in a Dream |
| 7 | Linger | Awake |
| 8 | Awake | Linger |
| 9 | Fade Into You | Fade Into You |
| 10 | Apocalypse | Apocalypse |

Top-5 overlap: 5/5

### neutral_control

*Neutral control — candidate and original should produce similar mid-range rankings.*

| Rank | Original | Candidate |
|---|---|---|
| 1 | Obstacle 1 | Obstacle 1 |
| 2 | Never Be Like You | Never Be Like You |
| 3 | Jenga | Keep On |
| 4 | Hit The Road Jack | Billie Jean |
| 5 | Keep On | Jenga |
| 6 | Billie Jean | Hit The Road Jack |
| 7 | Control Me | Chaotic |
| 8 | Chaotic | Control Me |
| 9 | Agua De Beber | Loungin' |
| 10 | Loungin' | Stay |

Top-5 overlap: 4/5

---

## Phase 9 — Confidence Proposal

### Proposed updated rules

- **rule_1_hard_contradiction:** Mark needsStatReview=true if acousticness>=75 AND electronicness>=75, OR intimacy>=80 AND socialEnergy>=80, OR energy>=80 AND motion<=20
- **rule_2_vocal_anomaly:** Mark needsStatReview=true if genre in {pop, rnb-soul} AND vocalPresence<30, OR genre in {ambient-dream} AND vocalPresence>85
- **rule_3_large_affinity_change:** Mark needsStatReview=true if any season/weather dim changed >20 points from original AND statConfidence<0.75
- **rule_4_high_impact_low_confidence:** Mark needsStatReview=true if track appears in top-50 avg rank across profiles AND statConfidence<0.75
- **rule_5_undetected_contradiction:** Mark needsStatReview=true for any hard-contradiction track currently marked needsStatReview=false

### Thresholds

- **hard_contradiction:** >=75/>=75 for acou+elec, >=80/>=80 for inti+social, >=80/<=20 for energy+motion
- **vocal_low:** 30
- **vocal_high:** 85
- **large_change:** 20
- **high_impact_rank:** 50
- **confidence_min:** 0.75

### Flag counts in candidate

| Flag type | Count |
|---|---|
| large_affinity_change_gt20 | 538 |

---

## Phase 10 — Decision

**Recommendation:** ACCEPT

**Reasoning:** Distribution criteria met for all 8 dims (std>12, pct_40_60<65%, extremes<5%). Correlations confirm musical coherence. summer+winter contradictions (25) are all-season neutral tracks — not hard contradictions. clear+rain contradictions (6) within acceptable threshold (<10).

| Readiness check | Status |
|---|---|
| Season affinity | Yes |
| Weather affinity | Yes |
| vocalPresence | No — not changed in this pass; inherits original distribution (mean=67.3, std=14.86, min=25). A separate vocal presence correction pass is needed. |
| Full catalog | No — season/weather correction only. Time-of-day still compressed (dusk std=8.32, pct_40_60=75.9%). vocalPresence not corrected. Both require separate passes. |

---

## Input File Hashes (SHA-256)

| File | SHA-256 |
|---|---|
| music-catalog-with-stats-draft.ts | `538b26a9e7ed94f8a777f7e5c55e85813fb1f211f9129edc9f26fc827a98df4c` |
| music-catalog-with-stats-report.json | `922b70eafe1c2bc6f1d78041b593779afc451c7e29906312ec453b5aee159340` |
| music-stat-quality-audit.json | `6d7b722fd804cfc1756cdbb02b3eed253e5782f11ea658b7a867bb7b893e7be4` |
| music-stat-review-queue.json | `bc45a103305494efb0661642657fe50dcc01faeefe644bf5700abe89f74ac845` |
| stat-image-profile-precheck.json | `9b11d9bd023b1e21dc3b25708e90af4f7cde0fd06a41250cb8964b53f7dbc6b2` |
| stat-time-affinity-sensitivity.json | `13b8b24bafbec4dd67cba88b92836bc3df9ac4ad1c6c7cfc78a7b36795e72028` |
