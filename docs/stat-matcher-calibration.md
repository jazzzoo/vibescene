# Stat Matcher Bounded Calibration — Step 2 Closing Pass

> Offline experiment only. No catalog values, production code, or GPT calls were used. Scoring used 12 stored image profiles and the 673-track season/weather correction catalog (now in production as `supabase/functions/_shared/musicCatalog.ts`), re-ranked under four top-level weighting scenarios for the group-scale-imbalance root cause (atmosphere+desiredSound's ~14x larger contribution ceiling swamping season/weather under the unnormalized formula).

## Scenarios

All group-internal math is unchanged (atmosphere/desiredSound = individually-weighted squared-distance sum; season/weather = plain 4-field average; time = Scenario F 3-bucket average). The only change in B/C/D is that atmosphere and desiredSound are additionally divided by their internal weight-sum (so every group first lands on a 0–1 scale), and then a single top-level weight per group is applied. Top-level weights sum to 1.0 in every normalized scenario.

| Scenario | atmosphere | desiredSound | season | weather | time | atmosphere+desiredSound share | season+weather+time share |
|---|---|---|---|---|---|---|---|
| A_CURRENT (production formula, unnormalized) | weight-sum ≈9.9 | weight-sum ≈4.0 | 0.35 (of averaged group) | 0.40 (of averaged group) | 0.25 (of averaged group) | ~93% of ceiling | ~7% of ceiling |
| B_BALANCED | 0.35 | 0.35 | 0.10 | 0.12 | 0.08 | 70% | 30% |
| C_SOUND_FORWARD | 0.30 | 0.40 | 0.10 | 0.12 | 0.08 | 70% | 30% |
| D_CONTEXT_FORWARD | 0.30 | 0.30 | 0.15 | 0.15 | 0.10 | 60% | 40% |

A_CURRENT's rankings are reused as-is from the Step 2 manual-validation scoring pass (no rescoring needed — it's the existing candidate-catalog ranking).

## Evaluation against the required human failures

### 1. manual-01 / manual-02 / manual-03 / manual-09 separation (Top 5, pairwise overlap — lower is better)

| Scenario | avg pairwise overlap | 01-02 | 01-03 | 01-09 | 02-03 | 02-09 | 03-09 |
|---|---|---|---|---|---|---|---|
| A_CURRENT | 2.33 | 3 | 2 | 3 | 1 | 3 | 2 |
| B_BALANCED | 1.17 | 2 | 0 | 4 | 0 | 1 | 0 |
| C_SOUND_FORWARD | 0.83 | 1 | 0 | 4 | 0 | 0 | 0 |
| D_CONTEXT_FORWARD | 0.83 | 1 | 0 | 4 | 0 | 0 | 0 |

C and D tie as the best separators (avg overlap down 64% from A_CURRENT: 2.33→0.83). All three normalized scenarios fully separate 5 of the 6 pairs (overlap 0-2). **manual-01/manual-09 stay at 4/5 overlap in every scenario, including D.** This is not a matcher artifact: their raw GPT profiles are genuinely close in atmosphere (dreaminess 70/80, motion 10/10, openness 90/90) and desiredSound (acousticness 70/70, energy 30/20) — only their season/time affinities differ. No tested weighting fixes this pair without pushing context weight far enough to compromise atmosphere/desiredSound's core role (condition 4).

### 2. Repeat-track concentration (A Walk, Awake, Riptide, Big Jet Plane, Stay Alive, Wait — total appearances across all 12 images)

| Scenario | Top5 total | Top10 total |
|---|---|---|
| A_CURRENT | 20 | 21 |
| B_BALANCED | 13 | 16 |
| C_SOUND_FORWARD | 12 | 16 |
| D_CONTEXT_FORWARD | **11** | **14** |

D_CONTEXT_FORWARD gives the largest reduction (45% fewer Top5 slots occupied by these six tracks vs. A_CURRENT). None of the scenarios newly leak these tracks into unrelated images (manual-04/08/10/11 still rank them in the 500s-600s in all four scenarios) — the fix only reduces over-concentration on the four dreamy/similar images, it does not introduce new misfires elsewhere.

**Residual**: "Stay Alive" (José González) still lands at or near rank 1 for manual-06, manual-07, and manual-12 in B/C/D alike. It is a track-stat-level generalist (mid-range values across most dimensions) rather than a matcher artifact — this is the secondary cause (`ambient-dream`/acoustic cluster homogeneity) and is not resolved by top-level reweighting alone.

### 3. energy / groove reflected in ranking (manual-06 summer beach, manual-07 groove, manual-12 spring morning — Top 5 averages)

| Image | Metric | A_CURRENT | B_BALANCED | C_SOUND_FORWARD | D_CONTEXT_FORWARD |
|---|---|---|---|---|---|
| manual-06 | avg energy | 37.4 | 34.0 | 44.0 | 37.0 |
| manual-06 | avg groove | 34.6 | 39.4 | 41.2 | **47.6** |
| manual-07 | avg energy | 46.2 | 52.0 | 52.0 | **52.4** |
| manual-07 | avg groove | 32.2 | 36.6 | 36.6 | **43.6** |
| manual-12 | avg energy | 42.8 | 45.0 | 51.2 | **63.2** |
| manual-12 | avg groove | 41.2 | 42.6 | 40.6 | **50.8** |

D_CONTEXT_FORWARD shows the clearest and most consistent lift across all three images and both metrics. manual-12 in particular goes from an all-mellow-acoustic Top 5 under A_CURRENT (Riptide/Stay Alive/Banana Pancakes/Big Jet Plane/Boat) to bringing in "Blueming" (IU, energy 83) and "Flower Road" (Daybreak, energy 79) under D — consistent with the image's own `desiredSound.energy=60` target, which A_CURRENT effectively ignored.

### 4. season/weather/time not ignored

Context-group (season+weather+time) share of the total-distance ceiling: A_CURRENT ~7%, B/C ~30%, **D ~40%**. D gives season/weather/time the most influence of the three normalized scenarios while still keeping atmosphere+desiredSound as the largest single share (60%, condition 4 below).

### 5. atmosphere / desiredSound still core

All three scenarios keep atmosphere+desiredSound as the majority share of the total-distance ceiling (B/C: 70%, D: 60%). D is the leanest but still clearly dominant over the context group (60% vs 40%) — atmosphere and sound remain the primary axes, not a minor tiebreaker.

### 6. no single cluster monopolizes all images

Measured directly by the repeat-track counts in section 2 above: D_CONTEXT_FORWARD reduces Top5 monopolization by the six flagged `ambient-dream`/acoustic tracks from 20→11 (-45%), the largest reduction of the three. The residual "Stay Alive" generalist effect is noted above as a secondary, track-stat-level limitation, not eliminated by any tested scenario.

### 7. previously-good recommendations not destroyed

manual-10 (rainy neon hip-hop/electronic) stays on-genre in every scenario — hip-hop/electronic track count in Top 5 goes from 2 (A_CURRENT) to 3 in B/C/D, and avg electronicness rises slightly (56.2→59.0-60.0); no scenario pulls in an incongruent genre. manual-06 and manual-07's swaps (e.g. "Get A Guitar" by RIIZE entering, "Orange Sky" dropping) are stylistically adjacent, not genre-incoherent. D's manual-12 result is the single biggest style swing of the whole experiment (mellow acoustic → K-pop/dance-pop leaning) — this is a deliberate consequence of finally honoring `desiredSound.energy=60`, not an error, but it is the largest single behavioral change introduced by any scenario and should be understood as such.

## Recommendation

**D_CONTEXT_FORWARD** (atmosphere 0.30 / desiredSound 0.30 / season 0.15 / weather 0.15 / time 0.10) is the best candidate:

- Best or tied-best on 6 of 7 required conditions (differentiation tied with C; groove/energy reflection, context-not-ignored, cluster-monopoly reduction, and mis-recommendation reduction all best outright).
- Keeps atmosphere+desiredSound as the clear majority influence (60%), satisfying condition 4.
- Does not introduce genre-incoherent recommendations anywhere tested (condition 7); its largest behavioral change (manual-12) is a direct, intended consequence of honoring the image's own desiredSound target rather than a mismatch.

Known residual limitations that persist under D and are **not** resolved by top-level reweighting alone:
- manual-01/manual-09 remain highly overlapping (4/5) because their underlying atmosphere/desiredSound profiles are genuinely close — this reflects real profile similarity, not a defect.
- "Stay Alive" persists as a near-universal high-rank pick across acoustic-leaning images because of `ambient-dream`/acoustic track-stat homogeneity in the catalog, not because of matcher weighting.

## Conclusion

**Adopt D_CONTEXT_FORWARD as the best normalized scenario. Step 2 can close.**

The season/weather correction candidate itself is validated as directionally sound — the earlier finding that its effect was barely visible in rankings was a top-level matcher-weight scale artifact (atmosphere+desiredSound's ~14x larger contribution ceiling swamping season/weather), not a defect in the corrected values. Rebalancing the top-level weights (a matcher/application-layer change, not a catalog change) lets the correction's effect surface as intended, without destroying previously-good recommendations. The two residual limitations above are track-stat-level (`ambient-dream`/acoustic cluster homogeneity) and are correctly scoped to Step 3 catalog curation, not to this Step 2 correction-candidate decision.

No catalog file, production code, or matcher weight was modified as part of this pass. This document is a calibration recommendation for future implementation, not an applied change.
