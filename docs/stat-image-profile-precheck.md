# Stat-Based Image-to-Music Matching — Pre-Check Report

**Status: BLOCKED before execution.** 0 of 12 planned live vision-model calls were made. This report documents what was prepared and exactly what stopped the live test — no results were fabricated or estimated in their place.

---

## 1. What blocked the live pre-check

Two independent blockers, either of which alone would have stopped this test:

1. **No vision-API credential in this environment.** `OPENAI_API_KEY` (and no other OpenAI/Anthropic-style key) is set. The production `analyzeImage()` function (`supabase/functions/analyze-and-search/services/gpt.ts`) fails the same way under this condition.
2. **None of the 4 named test images exist locally.** A full repository search (all `.jpg/.jpeg/.png/.webp/.heic` files, excluding `node_modules`, `.git`, `dist`, `.expo`, `android`, `ios`) found only 6 files, all under `assets/` — app icons and the splash graphic. No file depicting a pavilion/mountain, a city window with sea, a beach, or neon Seoul exists anywhere in the repo, and no test-fixture/sample-image directory exists.

Per the task's own instruction ("if API credentials or test images are unavailable, do not fake results"), sections 3–5 of the requested pre-check (reproducibility test, similarity ranking, human-readable review) were **not executed** and contain no synthetic data.

---

## 2. What was completed instead

### 2.1 30-track validation subset — `docs/stat-precheck-validation-tracks.json`
Built from the 673-track `docs/music-catalog-with-stats-draft.ts` (read-only; unchanged). Contains exactly 30 tracks covering:
- all 8 genres (pop, hip-hop, rock, rnb-soul, jazz-funk, ambient-dream, folk-acoustic, electronic)
- full or near-full 0–100 spread on brightness, warmth, motion, dreaminess, acousticness, electronicness; wide spread on intimacy, socialEnergy, vocalPresence, energy
- 6 `needsStatReview` tracks (≥5 required), including all 4 of the mandatory tracks that happen to carry that flag
- all 6 mandatory tracks: **Feather** (Nujabes feat. Cise Starr & Akin — confirmed against the prior task's `needsStatReview` entry, disambiguated from a same-titled Sabrina Carpenter pop track also in the catalog), **Walking On A Dream**, **Virtual Insanity**, **From The Start**, **Vibin' Out**, **Luv(sic.) Part 3**

### 2.2 Experimental 30-value schema (defined, not yet run)
- **10 shared atmosphere stats** (visible-image profile): brightness, warmth, openness, motion, intimacy, socialEnergy, tension, nostalgia, playfulness, dreaminess
- **13 affinity values** (visible-image profile): spring/summer/autumn/winter, morning/day/dusk/night/lateNight, clear/cloudy/rain/snow
- **7 desired-sound values** (explicitly inferred, never claimed as observed): energy, groove, density, acousticness, electronicness, vocalPresence, climaxIntensity

### 2.3 Proposed (not executed) model/request configuration
Reuses the production vision model (`gpt-4o` via OpenAI Chat Completions) since that is what's already integrated, with two deliberate overrides to remove non-determinism the production code doesn't need to avoid: `temperature: 0` (production leaves this unset) and `image_detail: "high"` (production uses `"auto"`, which can vary internal image tiling run-to-run). Full parameter list and rationale is in the JSON companion's `proposedModelConfig`.

---

## 3. Dimension-quality review (a priori only — not empirical)

No repeated-call data exists, so nothing below is a stability/correlation *measurement*. It is schema-design reasoning, cross-checked against `docs/music-atmosphere-vocabulary-audit.md` and the with-stats catalog report:

| Dimension | Concern | Recommendation |
|---|---|---|
| nostalgia | Purely emotional/associative; audit already found mood tags are the least visually-anchored fields | retain, but prioritize for instability testing once live calls run |
| dreaminess | Risk of being read as a mood label rather than haze/blur visual evidence | redefine — tie explicitly to visible atmospheric evidence |
| intimacy | Conceptually entangled with lateNight/rain (named in the task) | retain, score independently in the prompt |
| socialEnergy | Directly grounded in visible people/crowd density | retain as-is |
| vocalPresence | Zero direct visual evidence — pure inference | down-weight; highest-risk field in the schema |
| climaxIntensity | No visual analogue; likely redundant with motion | re-check for merge with motion once data exists |
| season affinity | Same lane-bias risk the vocabulary audit already found on the catalog side | retain, down-weight |
| weather affinity | More groundable than season, but breaks down for indoor images | retain, add explicit indoor fallback rule |

Named overlap pairs (brightness/clear/day; intimacy/lateNight/rain; motion/energy; openness/dreaminess; acousticness/electronicness): all recommended **retained as distinct fields** for now — `motion`/`energy` correlation is expected by design, the others need an empirical correlation check before any down-weighting or merging decision. Full reasoning per pair is in the JSON companion.

---

## 4. Provisional pass/fail

| Criterion | Result |
|---|---|
| Numeric reproducibility | NOT EVALUATED — 0/12 calls completed |
| Ranking reproducibility | NOT EVALUATED — 0/12 calls completed |
| Plausibility | NOT EVALUATED — 0/12 calls completed |
| **Overall** | **FAIL by default** — a process-blocked non-result, not a negative finding about the approach itself |

---

## 5. What's needed to actually run this test

1. The 4 source images (pavilion/mountain, city window with sea, beach, neon Seoul) — not present anywhere in this repository; need to be supplied.
2. An `OPENAI_API_KEY` (or equivalent) available to the execution environment.
3. Once both exist: run 12 calls (4 images × 3 repeats) against the proposed config in §2.3, against the already-prepared 30-track validation subset and schema — no further prep work is needed on this end.

---

## 6. Scope confirmation

No runtime source file was modified. No feature flag, diversity logic, database migration, or frontend routing was touched or created. Nothing was staged, committed, pushed, or deployed. No chain-of-thought or image binary data is included anywhere in this report or its JSON companion.
