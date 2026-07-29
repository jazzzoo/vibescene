# Stat Time-Affinity Sensitivity Analysis

**Generated:** 2026-07-29T13:49:03Z  
**Type:** Offline — no API calls, no image reads  
**Inputs:** 15 saved GPT profiles (5 images x 3 runs) · 30-track validation subset

---

## Scenario Scorecard

| Scenario | Avg Top5 | Avg Top10 OL | Avg Spearman | img04 Top5 | img05 Top5 | Unique C5 | Cross Jacc | HowSweet T5 | ACA T5 |
|---|---|---|---|---|---|---|---|---|---|
| `A_STORED_ORIGINAL` | 4.2 | 93% | 0.9823 | 3/5 | 4/5 | 14 | 0.128 | 11 | 11 |
| `B_NORMALIZED_BASELINE` | 4.6 | 95% | 0.9885 | 5/5 | 5/5 | 17 | 0.085 | 3 | 3 |
| `C_TIME_WEIGHT_025` | 4.4 | 97% | 0.9899 | 5/5 | 4/5 | 16 | 0.087 | 3 | 3 |
| `D_TIME_WEIGHT_010` | 4.4 | 97% | 0.9902 | 5/5 | 4/5 | 16 | 0.102 | 3 | 3 |
| `E_NO_TIME_AFFINITY` | 4.4 | 97% | 0.9898 | 5/5 | 4/5 | 16 | 0.102 | 3 | 3 |
| `F_MERGED_TIME_3_BUCKET` | 4.6 | 97% | 0.9896 | 5/5 | 5/5 | 17 | 0.097 | 3 | 3 |
| `G_CONTINUOUS_TIME_CENTER` | 4.4 | 97% | 0.9901 | 5/5 | 4/5 | 16 | 0.102 | 3 | 3 |

**Best (composite score):** `F_MERGED_TIME_3_BUCKET`  
**Ranked:** F_MERGED_TIME_3_BUCKET > B_NORMALIZED_BASELINE > G_CONTINUOUS_TIME_CENTER > D_TIME_WEIGHT_010 > E_NO_TIME_AFFINITY > C_TIME_WEIGHT_025 > A_STORED_ORIGINAL

## Per-Scenario Details

### A_STORED_ORIGINAL
*Stored original (unnormalized)*

- Avg 3-way Top5 common: **4.2/5**
- Avg pairwise Top10 overlap: **93%**
- Avg Spearman: **0.9823**
- Max rank movement: **8**
- image-04 Top5 common: **3/5** (Spearman 0.9555)
- image-05 Top5 common: **4/5** (Spearman 0.9841)
- Unique tracks in consensus Top5: **14**
- Avg cross-image consensus5 Jaccard: **0.128**
- Avg time contrib variance: **1.17e-03**

**Consensus Top5 per image:**
- `image-01`: Always Shine, Plastic Love, How Sweet, Rearviewmirror, Put Your Records On
- `image-02`: Ends of the Earth, Velocities, The Night We Met, How Sweet
- `image-03`: Everything, How Sweet, Rearviewmirror, Put Your Records On, A Change Is Gonna Come
- `image-04`: Ends of the Earth, Walking On A Dream, A Change Is Gonna Come
- `image-05`: Luv(sic.) Part 3, From The Start, Best Part, A Change Is Gonna Come

### B_NORMALIZED_BASELINE
*Normalized baseline (timeW=0.55)*

- Avg 3-way Top5 common: **4.6/5**
- Avg pairwise Top10 overlap: **95%**
- Avg Spearman: **0.9885**
- Max rank movement: **7**
- image-04 Top5 common: **5/5** (Spearman 0.9933)
- image-05 Top5 common: **5/5** (Spearman 0.9887)
- Unique tracks in consensus Top5: **17**
- Avg cross-image consensus5 Jaccard: **0.085**
- Avg time contrib variance: **4.70e-05**

**Consensus Top5 per image:**
- `image-01`: Virtual Insanity, Always Shine, How Sweet, Rearviewmirror
- `image-02`: Ends of the Earth, Space Song, The Night We Met, snowfall
- `image-03`: Vibin' Out, The Night We Met, From The Start, Put Your Records On, A Change Is Gonna Come
- `image-04`: Ends of the Earth, Space Song, snowfall, Video Games, Walking On A Dream
- `image-05`: Luv(sic.) Part 3, From The Start, Video Games, Feather, Best Part

### C_TIME_WEIGHT_025
*Lower time weight (timeW=0.25)*

- Avg 3-way Top5 common: **4.4/5**
- Avg pairwise Top10 overlap: **97%**
- Avg Spearman: **0.9899**
- Max rank movement: **5**
- image-04 Top5 common: **5/5** (Spearman 0.9953)
- image-05 Top5 common: **4/5** (Spearman 0.9915)
- Unique tracks in consensus Top5: **16**
- Avg cross-image consensus5 Jaccard: **0.087**
- Avg time contrib variance: **1.00e-05**

**Consensus Top5 per image:**
- `image-01`: Virtual Insanity, Always Shine, How Sweet, Rearviewmirror
- `image-02`: Ends of the Earth, Space Song, The Night We Met, snowfall
- `image-03`: Vibin' Out, The Night We Met, From The Start, Put Your Records On, A Change Is Gonna Come
- `image-04`: Ends of the Earth, Space Song, snowfall, Video Games, Walking On A Dream
- `image-05`: Luv(sic.) Part 3, From The Start, Video Games, Feather

### D_TIME_WEIGHT_010
*Very low time weight (timeW=0.10)*

- Avg 3-way Top5 common: **4.4/5**
- Avg pairwise Top10 overlap: **97%**
- Avg Spearman: **0.9902**
- Max rank movement: **5**
- image-04 Top5 common: **5/5** (Spearman 0.9957)
- image-05 Top5 common: **4/5** (Spearman 0.9923)
- Unique tracks in consensus Top5: **16**
- Avg cross-image consensus5 Jaccard: **0.102**
- Avg time contrib variance: **2.00e-06**

**Consensus Top5 per image:**
- `image-01`: Virtual Insanity, Always Shine, How Sweet, Rearviewmirror
- `image-02`: Space Song, The Night We Met, snowfall, Video Games
- `image-03`: Virtual Insanity, Vibin' Out, From The Start, Put Your Records On, A Change Is Gonna Come
- `image-04`: Ends of the Earth, Space Song, snowfall, Video Games, Walking On A Dream
- `image-05`: Luv(sic.) Part 3, From The Start, Video Games, Feather

### E_NO_TIME_AFFINITY
*No time affinity (timeW=0.0)*

- Avg 3-way Top5 common: **4.4/5**
- Avg pairwise Top10 overlap: **97%**
- Avg Spearman: **0.9898**
- Max rank movement: **5**
- image-04 Top5 common: **5/5** (Spearman 0.9957)
- image-05 Top5 common: **4/5** (Spearman 0.9917)
- Unique tracks in consensus Top5: **16**
- Avg cross-image consensus5 Jaccard: **0.102**
- Avg time contrib variance: **0.00e+00**

**Consensus Top5 per image:**
- `image-01`: Virtual Insanity, Always Shine, How Sweet, Rearviewmirror
- `image-02`: Space Song, The Night We Met, snowfall, Video Games
- `image-03`: Virtual Insanity, Vibin' Out, From The Start, Put Your Records On, A Change Is Gonna Come
- `image-04`: Ends of the Earth, Space Song, snowfall, Video Games, Walking On A Dream
- `image-05`: Luv(sic.) Part 3, From The Start, Video Games, Feather

### F_MERGED_TIME_3_BUCKET
*Merged 3-bucket time (timeW=0.25)*

- Avg 3-way Top5 common: **4.6/5**
- Avg pairwise Top10 overlap: **97%**
- Avg Spearman: **0.9896**
- Max rank movement: **5**
- image-04 Top5 common: **5/5** (Spearman 0.9954)
- image-05 Top5 common: **5/5** (Spearman 0.9926)
- Unique tracks in consensus Top5: **17**
- Avg cross-image consensus5 Jaccard: **0.097**
- Avg time contrib variance: **3.97e-07** *(near-zero; rounds to 0.000000 at 6 d.p. — not mathematically exact zero)*

**Consensus Top5 per image:**
- `image-01`: Virtual Insanity, Always Shine, How Sweet, Rearviewmirror
- `image-02`: Space Song, The Night We Met, snowfall, Video Games
- `image-03`: Virtual Insanity, Vibin' Out, From The Start, Put Your Records On, A Change Is Gonna Come
- `image-04`: Ends of the Earth, Space Song, snowfall, Video Games, Walking On A Dream
- `image-05`: Luv(sic.) Part 3, From The Start, Video Games, Feather, Best Part

### G_CONTINUOUS_TIME_CENTER
*Continuous time center (timeW=0.25)*

- Avg 3-way Top5 common: **4.4/5**
- Avg pairwise Top10 overlap: **97%**
- Avg Spearman: **0.9901**
- Max rank movement: **5**
- image-04 Top5 common: **5/5** (Spearman 0.9957)
- image-05 Top5 common: **4/5** (Spearman 0.9920)
- Unique tracks in consensus Top5: **16**
- Avg cross-image consensus5 Jaccard: **0.102**
- Avg time contrib variance: **1.00e-06**

**Consensus Top5 per image:**
- `image-01`: Virtual Insanity, Always Shine, How Sweet, Rearviewmirror
- `image-02`: Space Song, The Night We Met, snowfall, Video Games
- `image-03`: Virtual Insanity, Vibin' Out, From The Start, Put Your Records On, A Change Is Gonna Come
- `image-04`: Ends of the Earth, Space Song, snowfall, Video Games, Walking On A Dream
- `image-05`: Luv(sic.) Part 3, From The Start, Video Games, Feather

## image-04 and image-05 Stability Across Scenarios

| Scenario | img04 Top5 | img04 Spear | img05 Top5 | img05 Spear |
|---|---|---|---|---|
| `A_STORED_ORIGINAL` | 3/5 | 0.9555 | 4/5 | 0.9841 |
| `B_NORMALIZED_BASELINE` | 5/5 | 0.9933 | 5/5 | 0.9887 |
| `C_TIME_WEIGHT_025` | 5/5 | 0.9953 | 4/5 | 0.9915 |
| `D_TIME_WEIGHT_010` | 5/5 | 0.9957 | 4/5 | 0.9923 |
| `E_NO_TIME_AFFINITY` | 5/5 | 0.9957 | 4/5 | 0.9917 |
| `F_MERGED_TIME_3_BUCKET` | 5/5 | 0.9954 | 5/5 | 0.9926 |
| `G_CONTINUOUS_TIME_CENTER` | 5/5 | 0.9957 | 4/5 | 0.9920 |

### `Rearviewmirror` (Pearl Jam) in image-04 runs

- `A_STORED_ORIGINAL`: [out, out, out] — in runs: none
- `B_NORMALIZED_BASELINE`: [out, out, out] — in runs: none
- `C_TIME_WEIGHT_025`: [out, out, out] — in runs: none
- `D_TIME_WEIGHT_010`: [out, out, out] — in runs: none
- `E_NO_TIME_AFFINITY`: [out, out, out] — in runs: none
- `F_MERGED_TIME_3_BUCKET`: [out, out, out] — in runs: none
- `G_CONTINUOUS_TIME_CENTER`: [out, out, out] — in runs: none

## Spotlight Track Appearances (Total Top5 / 15 runs)

| Track | A_STORED_ORIGINAL | B_NORMALIZED_BASELINE | C_TIME_WEIGHT_025 | D_TIME_WEIGHT_010 | E_NO_TIME_AFFINITY | F_MERGED_TIME_3_BUCKET | G_CONTINUOUS_TIME_CENTER |
|---|---|---|---|---|---|---|---|
| How Sweet (NewJeans) | 11/15 | 3/15 | 3/15 | 3/15 | 3/15 | 3/15 | 3/15 |
| A Change Is Gonna Come (Sam Cooke) | 11/15 | 3/15 | 3/15 | 3/15 | 3/15 | 3/15 | 3/15 |
| Rearviewmirror (Pearl Jam) | 7/15 | 3/15 | 3/15 | 3/15 | 3/15 | 3/15 | 3/15 |
| Ends of the Earth (Lord Huron) | 6/15 | 6/15 | 6/15 | 5/15 | 5/15 | 5/15 | 5/15 |
| Put Your Records On (Corinne Bailey Rae) | 6/15 | 3/15 | 3/15 | 3/15 | 3/15 | 3/15 | 3/15 |

## Cross-Image Differentiation

| Scenario | Unique C5 tracks | Avg C5 Jaccard | Avg Top10 Jaccard |
|---|---|---|---|
| `A_STORED_ORIGINAL` | 14 | 0.128 | 0.283 |
| `B_NORMALIZED_BASELINE` | 17 | 0.085 | 0.298 |
| `C_TIME_WEIGHT_025` | 16 | 0.087 | 0.314 |
| `D_TIME_WEIGHT_010` | 16 | 0.102 | 0.341 |
| `E_NO_TIME_AFFINITY` | 16 | 0.102 | 0.341 |
| `F_MERGED_TIME_3_BUCKET` | 17 | 0.097 | 0.314 |
| `G_CONTINUOUS_TIME_CENTER` | 16 | 0.102 | 0.367 |

## Recommendation

**Recommended scenario: `F_MERGED_TIME_3_BUCKET`** — Merged 3-bucket time (timeW=0.25)

### Why

- Avg 3-way Top5 common = 4.6/5, Avg Spearman = 0.9896
- image-04 Top5 = 5/5, image-05 Top5 = 5/5
- Unique consensus Top5 tracks = 17 — images remain differentiated
- Avg cross-image Jaccard = 0.097 — no collapse toward generic ranking
- Avg time contrib variance = 3.97e-07 (rounds to 0.00e+00 at 6 d.p.; near-zero, not mathematically exact) — lowest sensitivity to boundary instability among non-zero scenarios

### Runtime implementation note

Apply the normalized group-distance formula (mean of squared diffs within each affinity group) with the recommended time-of-day group weight. No schema change required — the 30-dimension profile is unchanged.


## Verification Note (added post-generation)

An independent verification pass confirmed that `time contribution variance = 0.00e+00` as originally
reported was a **rounded display zero**, not a mathematically exact zero (verdict: meaning 2).

True value: `3.97e-07` (average across 5 images):

| Image | True variance |
|---|---|
| image-01 | 2.36e-07 |
| image-02 | 0.0 (exact) |
| image-03 | 0.0 (exact) |
| image-04 | 1.53e-06 |
| image-05 | 2.21e-07 |

The correction does not change the best scenario (F_MERGED_TIME_3_BUCKET remains first),
the ranking order, or any metric other than the variance display.
All ranking metrics reproduced exactly against the original report.

## Limitations

- Only 5 images tested — small sample, results may not generalize
- Only 30 tracks ranked — not the full catalog
- Track stats are rule-based draft estimates, not measured audio features
- No diversity logic applied — raw similarity only
- No human blind preference study performed
- Improved stability does not prove improved musical fit
- Repeated-track concentration may reflect validation subset composition
- temperature=0 GPT profiles reduce but do not eliminate non-determinism

---
*Offline analysis only — no OpenAI calls, no image reads, no Supabase deployments.*