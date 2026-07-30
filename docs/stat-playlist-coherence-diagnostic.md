# Playlist-Level Coherence Diagnostic

> Offline diagnostic only. No track stats, catalog files, or production code were modified. No GPT calls were made. Extends the bounded matcher calibration in `docs/stat-matcher-calibration.md` with a playlist-coherence audit: a track can have a good individual image-distance score and still feel stylistically disconnected from the rest of the playlist. This document does not claim numeric coherence proves human listening quality — it flags candidates for human review.

## Scope of this pass

- **Part 1** (raw Top 5 outlier scan) was run across all four calibration scenarios (A_CURRENT, B_BALANCED, C_SOUND_FORWARD, D_CONTEXT_FORWARD) × all 12 images, per the task's "for each scoring scenario" instruction.
- **Parts 2-4** (named human-evaluation cases, full per-image diagnostic coherent-selection, and the key tension finding) focus on **D_CONTEXT_FORWARD** — the scenario `stat-matcher-calibration.md` recommended for Step 2 adoption — using **A_CURRENT as the "before" baseline** for the four named cases, since those cases describe problems originally observed under the current production formula. Re-running the full per-image diagnostic-selection narrative for B_BALANCED/C_SOUND_FORWARD was judged out of scope for this pass (they were not the adopted candidate); Part 1's numeric scan already covers them.

## Methodology

**Track-to-track compatibility** uses 11 musical dimensions from `track.stats` only (no artist popularity, no genre as a numeric input): `energy, groove, density, acousticness, electronicness, vocalPresence, climaxIntensity, tension, dreaminess, socialEnergy, intimacy`. Unweighted mean squared distance, same `((a-b)/100)^2` form used elsewhere, converted to `compatibility = 1 / (1 + avgSqDist)`.

**Outlier detection (raw Top 5)**: for each of the 5 tracks, average its compatibility to the other 4. The lowest-compatibility track is the outlier candidate. Classified by the *musical* size of its largest single-dimension gap versus the other 4's average (not by z-score alone — z-scores on this compressed compatibility scale are statistically noisy at n=5):
- **STRONG outlier**: top dimension gap ≥35 points (of 100), or 2+ dimensions each ≥25.
- **borderline**: top dimension gap 25-34, single dimension.
- **healthy variation**: all gaps <25.

**Diagnostic coherent Top 5** (greedy, per the task's exact formula): anchor = raw rank 1. For each remaining slot, from the raw Top 20 pool, pick the unselected candidate maximizing `imageSimilarity * W_img + compatibilityWithSelectedTracks * W_coh` (compatibility averaged against all tracks selected so far). Hard guardrail: no artist selected more than twice. Tested at `W_img/W_coh` = 0.85/0.15, 0.75/0.25, 0.65/0.35. The "allow one controlled contrast track" guardrail is **not** hard-coded into the greedy formula (the formula has no such exception) — it is applied afterward as a human-judgment check on the output, per Part 4 below.

## Part 1 — Raw Top 5 outlier scan, all 4 scenarios × 12 images

| Scenario | STRONG outlier | borderline | healthy |
|---|---|---|---|
| A_CURRENT | 6 | 5 | 1 |
| B_BALANCED | 6 | 1 | 5 |
| C_SOUND_FORWARD | 6 | 1 | 5 |
| D_CONTEXT_FORWARD | **7** | 3 | **2** |

**Finding: D_CONTEXT_FORWARD has the worst raw-Top5 coherence profile of the four scenarios**, despite winning on image-differentiation and repeat-track reduction in the prior calibration. This is the mechanism the task description predicted: sharpening per-track image-fit precision (more weight on desiredSound/season/weather) pulls in tracks that individually fit better on specific axes, at the cost of the raw Top 5 being more heterogeneous as a set. B_BALANCED and C_SOUND_FORWARD — which kept atmosphere+desiredSound at 70% rather than D's 60% — land at 5/12 healthy vs. D's 2/12. **This is a real trade-off the calibration report did not previously surface**, and it means a coherence-selection pass (Part 3/4) is not optional polish for D — it's structurally necessary.

Full per-scenario, per-image detail (lowest-compatibility track, dimension gaps, classification) is in `docs/stat-playlist-coherence-diagnostic.json`.

## Part 2 — Named human-evaluation cases (real data, not hypothetical)

### (a) A dramatic, heavy track surrounded by light tracks

This pattern occurs in the actual data: **manual-08, A_CURRENT**. Raw Top 5 = "Lucky Man" (The Verve), "스물다섯, 스물하나" (Jaurim), "Cath..." (Death Cab for Cutie), **"Runaway" (Kanye West feat. Pusha T)**, "지구가 태양을 네 번" (NELL) — four alt-rock tracks (vocal-forward, moderate acoustic/electronic blend, energy 50-66) plus one hip-hop track with acousticness 16 (vs the other four's 47-63) and vocalPresence 83 (vs 57-69). Classified **STRONG outlier** (acousticness gap 37).

Under **D_CONTEXT_FORWARD**, "Runaway" drops out of the raw Top 5 entirely (replaced by "Always Shine," a hip-hop track with acousticness 49 and climaxIntensity 50 — much closer to the rock cluster's texture). manual-08's D_CONTEXT_FORWARD outlier (Midnight Pretenders, electronicness gap 21) is classified **healthy**. The rebalanced matcher incidentally fixed this specific case as a side effect, without any coherence logic being applied.

### (b) Ambient-dream cluster occupying unrelated images

This is the cross-image homogenization problem already fully documented in `docs/stat-manual-validation.md` § Root Cause and resolved (partially) in `docs/stat-matcher-calibration.md` — manual-01/02/03/09 sharing "A Walk," "Awake," "Alison," "ocean eyes," "Wait" despite different season/weather profiles. It is a **cross-image** repeat-concentration issue, not a **within-playlist** incoherence issue: each of those four playlists is individually fairly homogeneous internally (mostly `ambient-dream`, low variance) — see Part 1, where manual-01/02/09 classify as borderline/healthy under A_CURRENT, not STRONG outliers. Re-flagged here only for completeness; no new finding beyond the calibration report.

### (c) Spring/summer becoming uniformly acoustic despite different desired energy — **the key tension case**

manual-06 (summer beach, `desiredSound.energy=40`) and manual-12 (spring morning, `desiredSound.energy=60`) are exactly this case. Under A_CURRENT, both raw Top 5s are all-acoustic-folk (Riptide/Stay Alive/Banana Pancakes/Big Jet Plane/Boat-type tracks, energy 21-58, classified healthy/borderline — internally coherent, but ignoring the requested energy level). D_CONTEXT_FORWARD's raw Top 5 fixes this at the individual-track level: manual-06 brings in "Super Shy" (NewJeans) and "Get A Guitar" (RIIZE); manual-12 brings in "Blueming" (IU, energy 83) and "Flower Road" (Daybreak, energy 79) — see § 3 of `stat-matcher-calibration.md`.

**But applying the diagnostic coherent-selection layer on top of D_CONTEXT_FORWARD reverses this fix.** At every tested weight — including the lightest coherence weight, 0.85/0.15 — the greedy algorithm drops "Super Shy," "Blueming," and "Flower Road" (at 0.75/0.25 and 0.65/0.35) or demotes "Get A Guitar" to last (at 0.85/0.15), replacing them with the same acoustic-folk generalists (Lost in My Mind, Meet Me in the Woods, Banana Pancakes) that A_CURRENT already over-recommended:

| Image | Config | Coherent Top 5 | Removed (were in raw Top5) | Image-fit loss |
|---|---|---|---|---|
| manual-06 | 0.85/0.15 | Stay Alive, Banana Pancakes, The Stable Song, Lost in My Mind, Lucky | Get A Guitar, Super Shy | 0.0016 |
| manual-06 | 0.75/0.25 | Stay Alive, Lost in My Mind, Lucky, The Stable Song, Banana Pancakes | Get A Guitar, Super Shy | 0.0016 |
| manual-12 | 0.85/0.15 | Stay Alive, Riptide, Lost in My Mind, Meet Me in the Woods, **Get A Guitar** | Blueming, Flower Road | 0.0020 |
| manual-12 | 0.75/0.25 | Stay Alive, Riptide, Lost in My Mind, Meet Me in the Woods, Banana Pancakes | Get A Guitar, Blueming, Flower Road | 0.0037 |

This is exactly the scenario the task guardrails warn against: *"Do not sacrifice image fit merely to maximize homogeneity"* and *"Allow one controlled contrast track only when its image fit remains high and its transition is explainable."* The pure linear-combination formula has no mechanism to preserve a single high-fit contrast track — it either keeps or fully drops each candidate based on the same score. **This is a genuine limitation of the specified greedy method for this case, not a limitation of D_CONTEXT_FORWARD's underlying ranking.**

Manual guardrail application: "Get A Guitar" (RIIZE) is the best candidate to force-keep as the one controlled contrast track for both images — it has high individual image fit (raw rank 2 in both manual-06 and manual-12) and its transition is explainable (K-pop groove track adjacent to acoustic-folk on `groove` and `energy`, its biggest gap dimension is `acousticness`, which is a texture difference, not a mood/tempo clash). "Blueming"/"Flower Road"/"Super Shy" are less defensible as the single contrast pick — they diverge on more dimensions simultaneously (electronicness + socialEnergy + acousticness together), which is closer to genuine incoherence than "Get A Guitar"'s narrower, single-axis divergence.

### (d) Rainy-neon playlist mixing coherent hip-hop/electronic with unrelated dream-rock

**Not observed as described** in this 12-image set. manual-10 (rainy neon, `desiredSound.electronicness=80`) under A_CURRENT actually flags the *hip-hop* track ("L$D," A$AP Rocky) as the outlier relative to a rock-leaning majority (Smashing Pumpkins x2, SE SO NEON), the reverse of the hypothesized pattern. Under D_CONTEXT_FORWARD, the raw Top 5 shifts to 3 hip-hop + Mayonaise (rock) + SHE GOT IT (rnb-soul); the outlier by compatibility is **SHE GOT IT** (tension gap 39), not the rock track.

Checking the actual numbers explains why, and is a useful illustration of why genre labels must not be the compatibility rule: `Mayonaise` (rock) has `tension=82, climaxIntensity=79` — closely matching the hip-hop cluster's `tension=64-85`. `SHE GOT IT` (rnb-soul, nominally genre-closer to hip-hop) has `tension=37, socialEnergy=31` — well below the cluster. **Numeric musical character and genre label diverge here**, and the numeric signal is arguably the more useful one for playlist feel: a hip-hop set built around tension/intensity coheres with a high-tension rock track better than with a low-tension R&B track of the "same" broader genre family.

## Part 3 — Full per-image diagnostic report, D_CONTEXT_FORWARD (weight config 0.75/0.25 unless noted)

| Image | Raw Top5 avg pairwise compat | Coherent Top5 avg pairwise compat | Image-fit loss | Removed | Added (raw rank) | More internally consistent? |
|---|---|---|---|---|---|---|
| manual-01 | 0.9727 | 0.9851 | 0.0002 | A Walk | All My Days (6) | Yes |
| manual-02 | 0.9801 | 0.9823 | 0.0000 | Sugar for the Pill | ocean eyes (6) | Yes (marginal) |
| manual-03 | 0.9497 | 0.9865 | 0.0020 | Time Moves Slow, Sextape, Wait | Unchained Melody (8), Georgia On My Mind (17), On & On (9) | Yes, but 3/5 tracks replaced — large stylistic shift, see caveat below |
| manual-04 | 0.9875 | 0.9889 | 0.0002 | Airport Lady | Fantasy (10) | Yes (marginal) |
| manual-05 | 0.9803 | 0.9882 | 0.0001 | 기억을 걷는 시간 | Control Me (6) | Yes |
| manual-06 | 0.9400 | 0.9841 | 0.0016 | Get A Guitar, Super Shy | Lost in My Mind (6), Lucky (10) | Yes numerically, but reverses the energy fix — see Part 2(c) |
| manual-07 | 0.9521 | 0.9886 | 0.0007 | Boat, To You My Light | Lucky (6), Cleopatra (12) | Yes |
| manual-08 | 0.9815 | 0.9929 | 0.0007 | Always Shine, Midnight Pretenders | Complicated (13), Heavy Metal Drummer (8) | Yes |
| manual-09 | 0.9840 | 0.9858 | 0.0000 | Flightless Bird, American Mouth | Naked as We Came (6) | Yes (marginal) |
| manual-10 | 0.9734 | 0.9792 | 0.0000 | SHE GOT IT | A Long Dream (6) | Marginal — see Part 2(d) caveat on which track "should" be the outlier |
| manual-11 | 0.9860 | 0.9908 | 0.0002 | Psycho | Galaxy (7) | Yes (marginal) |
| manual-12 | 0.9415 | 0.9793 | **0.0037** | Get A Guitar, Blueming, Flower Road | Lost in My Mind (18), Meet Me in the Woods (15), Banana Pancakes (17) | Yes numerically, but reverses the energy fix — see Part 2(c). Largest image-fit loss and largest raw-rank reach (rank 18) of any image tested. |

Weight sensitivity: 8 of 12 images are stable across all three weight configs (identical selection at 0.85/0.15, 0.75/0.25, 0.65/0.35). manual-03, manual-06, manual-12 (the three largest-loss cases) are weight-sensitive — 0.85/0.15 keeps at least one contrast track that 0.75/0.25 and 0.65/0.35 drop. manual-08 is stable in direction but reaches slightly deeper into the pool at higher coherence weight.

## Part 4 — Key finding: coherence-selection can undo the matcher-calibration win it's meant to protect

The single most important finding of this pass: **for manual-06 and manual-12 specifically, running the diagnostic coherent-selection algorithm on top of D_CONTEXT_FORWARD's raw ranking regresses the exact energy/liveliness improvement that motivated recommending D_CONTEXT_FORWARD** in `stat-matcher-calibration.md`. The raw fix and the coherence fix point in opposite directions for these two images, at every tested weight.

This does not undermine the Step 2 matcher-calibration recommendation (D_CONTEXT_FORWARD's *raw* ranking is still the recommended base, and this coherence layer is explicitly diagnostic/offline, not applied to the catalog or production). It does mean: if a coherence-selection step is ever implemented downstream, it must not be a blind top-N greedy re-rank — it needs the "one controlled contrast track" guardrail implemented as an actual rule (e.g., force-keep the single highest-image-fit candidate whose divergence is concentrated in ≤1 dimension), not left to fall out of the linear score. That implementation decision is out of scope for this diagnostic pass.

## Limitations

- This is a numeric diagnostic over 11 stat-based dimensions. It does not listen to audio, does not measure tempo/key compatibility, transition smoothness, or production-era/mastering consistency beyond what `track.stats` happens to encode.
- Outlier/coherence classification thresholds (35-point / 25-point dimension gaps, the compatibility formula's equal weighting of 11 dimensions) are reasoned choices, not empirically validated against human listening.
- The greedy diagnostic-selection algorithm is exactly as specified by the task (anchor + sequential greedy score), not the only possible coherence-aware selection method; Part 4 identifies a specific failure mode of this exact method, not a claim that no coherence-aware method could work.
- **Numeric coherence does not prove human listening quality.** Every "more internally consistent" call in Part 3 is a statement about the 11-dimension stat space, not a claim about how the playlist actually sounds. Human listening (via `docs/stat-manual-validation-review.html`) remains required before any adoption decision.
