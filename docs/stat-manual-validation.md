# Stat Manual Validation — Season/Weather Correction Candidate Review

> Generated for Step 2 manual listening validation. This document does not make the adoption decision for the season/weather correction candidate — it only reports what changed and why, mathematically.

- Repository checkpoint: `music/stat-catalog-correction` @ `fcf94bfa69a02aad75c92b16442f4f6bcc2f34db`
- Generated at: 2026-07-30T03:40:42.681Z
- Model: gpt-4o, temperature 0, image detail high
- Images analyzed: 12 (successful calls: 12, structural retries: 0)

## Known discrepancy (input hash)

- **music-catalog-stats-correction-report.json > inputFiles['music-catalog-with-stats-draft.ts'].sha256**: reported `538b26a9e7ed94f8a777f7e5c55e85813fb1f211f9129edc9f26fc827a98df4c` vs actual `a516becf42dd0f5c8bed0574a24bc06a5d70bc8dcb5d2123cae3d130f6f9ba6f`.
  Mismatch found during Phase 1 validation. The original draft file itself is unchanged since commit 6d97c6e (git diff clean, actual hash matches the committed git blob exactly). The reported hash does not match any file currently in docs/. Treated as a recording error in the correction-report generation step, not evidence of file tampering. User confirmed proceeding with this understood as a limitation.

## Scoring method (Scenario F)

- Atmosphere weights: {"brightness":1,"warmth":1,"openness":0.9,"motion":1.3,"intimacy":1,"socialEnergy":1,"tension":1,"nostalgia":0.8,"playfulness":0.8,"dreaminess":1.1}
- Sound weights: {"energy":1.3,"groove":0.8,"density":0.6,"acousticness":0.5,"electronicness":0.5,"vocalPresence":0.3,"climaxIntensity":0.6}
- seasonWeight=0.35, weatherWeight=0.4, timeWeight=0.25
- Distance: squaredDistance = ((imageValue - trackValue) / 100)^2; similarity = 1 / (1 + totalDistance)
- derivedDay: Math.round((day * 2 + dusk) / 3); derivedNight: Math.round((night * 2 + lateNight + dusk) / 4)

## Per-image comparison

### manual-01

- Local image: `test-assets/stat-manual-validation/02066cb88c44980a81e5f04ef2150af5.jpg` (sha256 `a76f36217d709dcb...`)
- Dominant visual attributes (stats): openness (90), dreaminess (70), brightness (60)
- Strongest season affinities: autumn (60), winter (50)
- Strongest weather affinities: clear (70), cloudy (30)
- GPT profile confidence: 90

**Original Top 5**

1. **A Walk** — Tycho (`SDNA934EEVk`, similarity 0.7782)
2. **Awake** — Tycho (`dm4tkSNKfFI`, similarity 0.7350)
3. **Sugar for the Pill** — Slowdive (`BxwAPBxc0lU`, similarity 0.7140)
4. **When the Sun Hits** — Slowdive (`MKYY0IlTMw4`, similarity 0.7004)
5. **Myth** — Beach House (`NyQ9p5S9jBk`, similarity 0.6851)

**Candidate Top 5**

1. **A Walk** — Tycho (`SDNA934EEVk`, similarity 0.7647)
2. **Awake** — Tycho (`dm4tkSNKfFI`, similarity 0.7248)
3. **When the Sun Hits** — Slowdive (`MKYY0IlTMw4`, similarity 0.6972)
4. **Sugar for the Pill** — Slowdive (`BxwAPBxc0lU`, similarity 0.6948)
5. **Wait** — M83 (`iQnRCdtECl8`, similarity 0.6637)

- Top 5 overlap: 4/5, Top 10 overlap: 9/10
- Entering candidate Top 5: iQnRCdtECl8
- Leaving original Top 5: NyQ9p5S9jBk
- Entering candidate Top 10: lz2qpnRB5_E
- Leaving original Top 10: _nW5AF0m9Zw
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0097 vs avg |weather delta| 0.0141 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: Give Me the Night (196→168, +28); Soulful (308→283, +25); Prom Dress (396→371, +25)

Demoted: Hate Everything (200→237, -37); Sunroof (367→397, -30); How Sweet (366→395, -29)

---

### manual-02

- Local image: `test-assets/stat-manual-validation/050e0c11047a97bc23cbd3be7458e6c7.jpg` (sha256 `48ee16b96bb140b8...`)
- Dominant visual attributes (stats): openness (90), dreaminess (80), brightness (70)
- Strongest season affinities: winter (90), autumn (30)
- Strongest weather affinities: snow (90), clear (50)
- GPT profile confidence: 90

**Original Top 5**

1. **A Walk** — Tycho (`SDNA934EEVk`, similarity 0.7302)
2. **Sugar for the Pill** — Slowdive (`BxwAPBxc0lU`, similarity 0.6714)
3. **Awake** — Tycho (`dm4tkSNKfFI`, similarity 0.6676)
4. **Myth** — Beach House (`NyQ9p5S9jBk`, similarity 0.6560)
5. **Alison** — Slowdive (`Ak43tAU5QuA`, similarity 0.6496)

**Candidate Top 5**

1. **A Walk** — Tycho (`SDNA934EEVk`, similarity 0.7413)
2. **Sugar for the Pill** — Slowdive (`BxwAPBxc0lU`, similarity 0.6885)
3. **Awake** — Tycho (`dm4tkSNKfFI`, similarity 0.6836)
4. **Alison** — Slowdive (`Ak43tAU5QuA`, similarity 0.6567)
5. **Myth** — Beach House (`NyQ9p5S9jBk`, similarity 0.6494)

- Top 5 overlap: 5/5, Top 10 overlap: 8/10
- Entering candidate Top 10: viimfQi_pUw, OtLcqr3RQJY
- Leaving original Top 10: yFTvbcNhEgc, _nW5AF0m9Zw
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0129 vs avg |weather delta| 0.0174 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: L$D (276→238, +38); Chaotic (273→236, +37); Kingdom in Blue (215→179, +36)

Demoted: Bring It On Home to Me (339→403, -64); Perfect (413→462, -49); Stand By Me (225→271, -46)

---

### manual-03

- Local image: `test-assets/stat-manual-validation/0ea78a4ffc3af667e68e52ea29867a9b.jpg` (sha256 `6d7f6762392cc9eb...`)
- Dominant visual attributes (stats): openness (70), dreaminess (70), intimacy (60)
- Strongest season affinities: winter (60), autumn (50)
- Strongest weather affinities: clear (50), cloudy (50)
- GPT profile confidence: 90

**Original Top 5**

1. **Cariño** — The Marías (`QHVp9xiUr9U`, similarity 0.8086)
2. **Into Dust** — Mazzy Star (`04J0ihSeIuI`, similarity 0.7736)
3. **Fade Into You** — Mazzy Star (`yfzsBA5dZdE`, similarity 0.7692)
4. **Wait** — M83 (`iQnRCdtECl8`, similarity 0.7628)
5. **Sextape** — Deftones (`f0pdwd0miqs`, similarity 0.7604)

**Candidate Top 5**

1. **Cariño** — The Marías (`QHVp9xiUr9U`, similarity 0.7874)
2. **Wait** — M83 (`iQnRCdtECl8`, similarity 0.7538)
3. **Fade Into You** — Mazzy Star (`yfzsBA5dZdE`, similarity 0.7501)
4. **A Walk** — Tycho (`SDNA934EEVk`, similarity 0.7487)
5. **Sextape** — Deftones (`f0pdwd0miqs`, similarity 0.7453)

- Top 5 overlap: 4/5, Top 10 overlap: 10/10
- Entering candidate Top 5: SDNA934EEVk
- Leaving original Top 5: 04J0ihSeIuI
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0083 vs avg |weather delta| 0.0162 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: Soulful (254→235, +19); Get Down On It (338→319, +19); Summer Breeze (339→320, +19)

Demoted: redrum (479→517, -38); Walking On A Dream (173→206, -33); SHYNESS BOY (464→491, -27)

---

### manual-04

- Local image: `test-assets/stat-manual-validation/28ebe33dc58b3a9c88fe09467727db27.jpg` (sha256 `b02cf19e33579274...`)
- Dominant visual attributes (stats): warmth (70), brightness (60), intimacy (60)
- Strongest season affinities: summer (70), spring (60)
- Strongest weather affinities: clear (80), cloudy (20)
- GPT profile confidence: 90

**Original Top 5**

1. **Respect** — Aretha Franklin (`A134hShx_gw`, similarity 0.8091)
2. **Reach Out I'll Be There** — Four Tops (`AUZ3INx3-KA`, similarity 0.8034)
3. **Jenga** — Heize feat. Gaeko (`uw_HR9jIJww`, similarity 0.8025)
4. **Every Summertime** — NIKI (`a0OHkWX7B-E`, similarity 0.7975)
5. **Peaches** — Justin Bieber feat. Daniel Caesar & Giveon (`tQ0yjYUFKAE`, similarity 0.7953)

**Candidate Top 5**

1. **Respect** — Aretha Franklin (`A134hShx_gw`, similarity 0.8125)
2. **Peaches** — Justin Bieber feat. Daniel Caesar & Giveon (`tQ0yjYUFKAE`, similarity 0.7947)
3. **Billie Jean** — Michael Jackson (`Kr4EQDVETuA`, similarity 0.7904)
4. **Chain of Fools** — Aretha Franklin (`5C4FnlftQt4`, similarity 0.7882)
5. **Try a Little Tenderness** — Otis Redding (`pli44utBOwo`, similarity 0.7880)

- Top 5 overlap: 2/5, Top 10 overlap: 9/10
- Entering candidate Top 5: Kr4EQDVETuA, 5C4FnlftQt4, pli44utBOwo
- Leaving original Top 5: AUZ3INx3-KA, uw_HR9jIJww, a0OHkWX7B-E
- Entering candidate Top 10: zIxV-Gd5gxw
- Leaving original Top 10: a0OHkWX7B-E
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0065 vs avg |weather delta| 0.0165 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: L-O-V-E (181→137, +44); Disco Yes (202→159, +43); Valentine (236→194, +42)

Demoted: Hate Everything (263→357, -94); Photograph (135→193, -58); Ain't No Sunshine (96→145, -49)

---

### manual-05

- Local image: `test-assets/stat-manual-validation/402c17af72fc0eec89e1f5e3589de7bb.jpg` (sha256 `a34e97c93a886c32...`)
- Dominant visual attributes (stats): nostalgia (80), warmth (70), brightness (60)
- Strongest season affinities: autumn (90), spring (30)
- Strongest weather affinities: rain (80), cloudy (50)
- GPT profile confidence: 90

**Original Top 5**

1. **Photograph** — offonoff (`2b1E-zu-QEM`, similarity 0.7070)
2. **On & On** — Erykah Badu (`TW28iWV7nxE`, similarity 0.7068)
3. **Ain't No Sunshine** — Bill Withers (`YuKfiH0Scao`, similarity 0.6988)
4. **Peaches** — Justin Bieber feat. Daniel Caesar & Giveon (`tQ0yjYUFKAE`, similarity 0.6953)
5. **Ophelia** — The Lumineers (`pTOC_q0NLTk`, similarity 0.6895)

**Candidate Top 5**

1. **Ain't No Sunshine** — Bill Withers (`YuKfiH0Scao`, similarity 0.7011)
2. **On & On** — Erykah Badu (`TW28iWV7nxE`, similarity 0.7010)
3. **Try a Little Tenderness** — Otis Redding (`pli44utBOwo`, similarity 0.6929)
4. **Ophelia** — The Lumineers (`pTOC_q0NLTk`, similarity 0.6853)
5. **Photograph** — offonoff (`2b1E-zu-QEM`, similarity 0.6834)

- Top 5 overlap: 4/5, Top 10 overlap: 8/10
- Entering candidate Top 5: pli44utBOwo
- Leaving original Top 5: tQ0yjYUFKAE
- Entering candidate Top 10: a0OHkWX7B-E, Rf-ctwR7P-M
- Leaving original Top 10: tQ0yjYUFKAE, AamatUtxev4
- Change mathematically driven mainly by: **season** (avg |season delta| 0.0241 vs avg |weather delta| 0.0212 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: Cath... (238→168, +70); Heavy Metal Drummer (205→147, +58); That's All (260→206, +54)

Demoted: Walking On A Dream (392→499, -107); Sunrise (174→248, -74); I Like You (336→403, -67)

---

### manual-06

- Local image: `test-assets/stat-manual-validation/46c4e1d11c241e35871c1c4661a8ef9f.jpg` (sha256 `2bc800d69d459d96...`)
- Dominant visual attributes (stats): openness (95), brightness (90), warmth (80)
- Strongest season affinities: summer (100), spring (60)
- Strongest weather affinities: clear (100), cloudy (0)
- GPT profile confidence: 100

**Original Top 5**

1. **Big Jet Plane** — Angus & Julia Stone (`yFTvbcNhEgc`, similarity 0.6054)
2. **Banana Pancakes** — Jack Johnson (`YdgoG8hTMUw`, similarity 0.6042)
3. **Riptide** — Vance Joy (`TL_oroU9eN8`, similarity 0.5828)
4. **Orange Sky** — Alexi Murdoch (`vy_Em1i9BAA`, similarity 0.5772)
5. **Stay Alive** — José González (`NucJk8TxyRg`, similarity 0.5654)

**Candidate Top 5**

1. **Banana Pancakes** — Jack Johnson (`YdgoG8hTMUw`, similarity 0.6113)
2. **Big Jet Plane** — Angus & Julia Stone (`yFTvbcNhEgc`, similarity 0.5885)
3. **Riptide** — Vance Joy (`TL_oroU9eN8`, similarity 0.5834)
4. **Stay Alive** — José González (`NucJk8TxyRg`, similarity 0.5809)
5. **Orange Sky** — Alexi Murdoch (`vy_Em1i9BAA`, similarity 0.5801)

- Top 5 overlap: 5/5, Top 10 overlap: 9/10
- Entering candidate Top 10: lAx7C_uUhFo
- Leaving original Top 10: lz2qpnRB5_E
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0136 vs avg |weather delta| 0.0207 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: Treasure (130→82, +48); Smart (266→220, +46); Got to Be Real (188→143, +45)

Demoted: ocean eyes (151→258, -107); Cariño (215→307, -92); Saw You in a Dream (243→329, -86)

---

### manual-07

- Local image: `test-assets/stat-manual-validation/5d26f76472131c2904c9a2729e850a22.jpg` (sha256 `3de917573337c34f...`)
- Dominant visual attributes (stats): openness (95), warmth (90), brightness (80)
- Strongest season affinities: summer (80), autumn (60)
- Strongest weather affinities: clear (90), cloudy (10)
- GPT profile confidence: 90

**Original Top 5**

1. **Meet Me in the Woods** — Lord Huron (`cYy7ljx7fyc`, similarity 0.6303)
2. **Riptide** — Vance Joy (`TL_oroU9eN8`, similarity 0.5931)
3. **Big Jet Plane** — Angus & Julia Stone (`yFTvbcNhEgc`, similarity 0.5861)
4. **Stay Alive** — José González (`NucJk8TxyRg`, similarity 0.5678)
5. **Lost in My Mind** — The Head and the Heart (`is7rrC-jH_A`, similarity 0.5636)

**Candidate Top 5**

1. **Meet Me in the Woods** — Lord Huron (`cYy7ljx7fyc`, similarity 0.6196)
2. **Riptide** — Vance Joy (`TL_oroU9eN8`, similarity 0.5902)
3. **Stay Alive** — José González (`NucJk8TxyRg`, similarity 0.5764)
4. **Big Jet Plane** — Angus & Julia Stone (`yFTvbcNhEgc`, similarity 0.5691)
5. **Lost in My Mind** — The Head and the Heart (`is7rrC-jH_A`, similarity 0.5676)

- Top 5 overlap: 5/5, Top 10 overlap: 10/10
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0110 vs avg |weather delta| 0.0186 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: Cinnamon Sugar (301→262, +39); L-O-V-E (191→154, +37); Music Sounds Better With You (502→465, +37)

Demoted: ocean eyes (169→258, -89); Lazy Eye (277→347, -70); Saw You in a Dream (193→263, -70)

---

### manual-08

- Local image: `test-assets/stat-manual-validation/63124baa245a1133a63c9f6978f701ef.jpg` (sha256 `f5de1d1bc868d2ed...`)
- Dominant visual attributes (stats): nostalgia (70), openness (60), social energy (60)
- Strongest season affinities: autumn (60), winter (50)
- Strongest weather affinities: cloudy (80), rain (30)
- GPT profile confidence: 90

**Original Top 5**

1. **Lucky Man** — The Verve (`MH6TJU0qWoY`, similarity 0.8448)
2. **스물다섯, 스물하나** — Jaurim (`LrB-fJn-3w4`, similarity 0.8280)
3. **Runaway** — Kanye West feat. Pusha T (`cv1naUa3_3g`, similarity 0.7949)
4. **Cath...** — Death Cab for Cutie (`uY1ahFCYT5k`, similarity 0.7941)
5. **Solanin** — ASIAN KUNG-FU GENERATION (`xZD1B1TskXs`, similarity 0.7925)

**Candidate Top 5**

1. **Lucky Man** — The Verve (`MH6TJU0qWoY`, similarity 0.8393)
2. **스물다섯, 스물하나** — Jaurim (`LrB-fJn-3w4`, similarity 0.8073)
3. **Cath...** — Death Cab for Cutie (`uY1ahFCYT5k`, similarity 0.8064)
4. **Runaway** — Kanye West feat. Pusha T (`cv1naUa3_3g`, similarity 0.7910)
5. **지구가 태양을 네 번** — NELL (`g5cVE-i5wHI`, similarity 0.7802)

- Top 5 overlap: 4/5, Top 10 overlap: 9/10
- Entering candidate Top 5: g5cVE-i5wHI
- Leaving original Top 5: xZD1B1TskXs
- Entering candidate Top 10: 5NPBIwQyPWE
- Leaving original Top 10: OHTSxw6zN1E
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0097 vs avg |weather delta| 0.0225 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: Superhero (226→168, +58); Paranoid (221→172, +49); Midnight Driver (253→208, +45)

Demoted: SHYNESS BOY (404→468, -64); Perfect Night (393→455, -62); ray (308→367, -59)

---

### manual-09

- Local image: `test-assets/stat-manual-validation/a716b5df798161f7a5c77ed701b8fc1b.jpg` (sha256 `b545d173e8ae1f03...`)
- Dominant visual attributes (stats): openness (90), dreaminess (80), brightness (60)
- Strongest season affinities: autumn (70), spring (60)
- Strongest weather affinities: cloudy (60), clear (40)
- GPT profile confidence: 90

**Original Top 5**

1. **A Walk** — Tycho (`SDNA934EEVk`, similarity 0.7098)
2. **Awake** — Tycho (`dm4tkSNKfFI`, similarity 0.6998)
3. **Alison** — Slowdive (`Ak43tAU5QuA`, similarity 0.6675)
4. **Big Jet Plane** — Angus & Julia Stone (`yFTvbcNhEgc`, similarity 0.6655)
5. **Wait** — M83 (`iQnRCdtECl8`, similarity 0.6652)

**Candidate Top 5**

1. **A Walk** — Tycho (`SDNA934EEVk`, similarity 0.6978)
2. **Awake** — Tycho (`dm4tkSNKfFI`, similarity 0.6833)
3. **Big Jet Plane** — Angus & Julia Stone (`yFTvbcNhEgc`, similarity 0.6564)
4. **Wait** — M83 (`iQnRCdtECl8`, similarity 0.6548)
5. **Alison** — Slowdive (`Ak43tAU5QuA`, similarity 0.6468)

- Top 5 overlap: 5/5, Top 10 overlap: 9/10
- Entering candidate Top 10: G6Kspj3OO0s
- Leaving original Top 10: BxwAPBxc0lU
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0077 vs avg |weather delta| 0.0185 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: Heavy Metal Drummer (358→339, +19); Midnight Driver (407→390, +17); I'm Yours (396→380, +16)

Demoted: Perfect Night (324→356, -32); How Sweet (424→455, -31); SHYNESS BOY (371→399, -28)

---

### manual-10

- Local image: `test-assets/stat-manual-validation/aa14821f6828dd6f63cf1fcc74050a29.jpg` (sha256 `cbc659d054ef6f95...`)
- Dominant visual attributes (stats): tension (80), motion (70), dreaminess (70)
- Strongest season affinities: autumn (50), spring (40)
- Strongest weather affinities: rain (90), cloudy (50)
- GPT profile confidence: 90

**Original Top 5**

1. **A Long Dream** — SE SO NEON (`tzL4A8hyXc8`, similarity 0.7046)
2. **Always Shine** — Robert Glasper Experiment feat. Lupe Fiasco & Bilal (`CGFFbJpfZQQ`, similarity 0.6971)
3. **1979** — The Smashing Pumpkins (`4aeETEoNfOg`, similarity 0.6921)
4. **L$D** — A$AP Rocky (`Gx4JEBwVlXo`, similarity 0.6897)
5. **N.Y. State of Mind** — Nas (`hI8A14Qcv68`, similarity 0.6771)

**Candidate Top 5**

1. **A Long Dream** — SE SO NEON (`tzL4A8hyXc8`, similarity 0.6959)
2. **Always Shine** — Robert Glasper Experiment feat. Lupe Fiasco & Bilal (`CGFFbJpfZQQ`, similarity 0.6947)
3. **1979** — The Smashing Pumpkins (`4aeETEoNfOg`, similarity 0.6931)
4. **Mayonaise** — The Smashing Pumpkins (`Vbu_K41efvY`, similarity 0.6835)
5. **L$D** — A$AP Rocky (`Gx4JEBwVlXo`, similarity 0.6748)

- Top 5 overlap: 4/5, Top 10 overlap: 8/10
- Entering candidate Top 5: Vbu_K41efvY
- Leaving original Top 5: hI8A14Qcv68
- Entering candidate Top 10: uY1ahFCYT5k, 9sfYpolGCu8
- Leaving original Top 10: pJ-c5NsKjXo, a3ErfnRuT6Q
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0098 vs avg |weather delta| 0.0174 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: Nothing (502→464, +38); Strawberries & Cigarettes (476→442, +34); Everything (450→418, +32)

Demoted: Midnight City (144→193, -49); Levitating (432→480, -48); I Like You (481→521, -40)

---

### manual-11

- Local image: `test-assets/stat-manual-validation/acadefe72ef776bdd8913a4b1df8aaab.jpg` (sha256 `685a52aa0104d4c5...`)
- Dominant visual attributes (stats): social energy (80), warmth (70), playfulness (70)
- Strongest season affinities: summer (70), spring (50)
- Strongest weather affinities: clear (80), cloudy (20)
- GPT profile confidence: 90

**Original Top 5**

1. **As It Was** — Harry Styles (`H5v3kku4y6Q`, similarity 0.8742)
2. **Boys Will Be Bugs** — Cavetown (`uREGk0fT0GQ`, similarity 0.8599)
3. **Watermelon Sugar** — Harry Styles (`E07s5ZYygMg`, similarity 0.8350)
4. **Island In The Sun** — Weezer (`erG5rgNYSdk`, similarity 0.8323)
5. **Uptown Funk** — Mark Ronson feat. Bruno Mars (`7Ya2U8XN_Zw`, similarity 0.8314)

**Candidate Top 5**

1. **As It Was** — Harry Styles (`H5v3kku4y6Q`, similarity 0.8623)
2. **Boys Will Be Bugs** — Cavetown (`uREGk0fT0GQ`, similarity 0.8568)
3. **Uptown Funk** — Mark Ronson feat. Bruno Mars (`7Ya2U8XN_Zw`, similarity 0.8356)
4. **Island In The Sun** — Weezer (`erG5rgNYSdk`, similarity 0.8310)
5. **Watermelon Sugar** — Harry Styles (`E07s5ZYygMg`, similarity 0.8300)

- Top 5 overlap: 5/5, Top 10 overlap: 9/10
- Entering candidate Top 10: mHNCM-YALSA
- Leaving original Top 10: RYr96YYEaZY
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0065 vs avg |weather delta| 0.0165 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: Music Sounds Better With You (419→383, +36); Cinnamon Sugar (394→363, +31); Kiss (110→80, +30)

Demoted: Stayin' Alive (101→148, -47); Lady Brown (198→241, -43); If I Die Tomorrow (292→328, -36)

---

### manual-12

- Local image: `test-assets/stat-manual-validation/d37e4abbcb1fb66e75e1254e0ed5ccec.jpg` (sha256 `fe2ac518a3f85289...`)
- Dominant visual attributes (stats): brightness (95), openness (90), warmth (80)
- Strongest season affinities: spring (100), summer (70)
- Strongest weather affinities: clear (100), cloudy (0)
- GPT profile confidence: 90

**Original Top 5**

1. **Riptide** — Vance Joy (`TL_oroU9eN8`, similarity 0.5573)
2. **Stay Alive** — José González (`NucJk8TxyRg`, similarity 0.5346)
3. **Big Jet Plane** — Angus & Julia Stone (`yFTvbcNhEgc`, similarity 0.5180)
4. **Banana Pancakes** — Jack Johnson (`YdgoG8hTMUw`, similarity 0.5111)
5. **Heartbeats** — José González (`ik_BQYbbZ5U`, similarity 0.4953)

**Candidate Top 5**

1. **Riptide** — Vance Joy (`TL_oroU9eN8`, similarity 0.5569)
2. **Stay Alive** — José González (`NucJk8TxyRg`, similarity 0.5444)
3. **Banana Pancakes** — Jack Johnson (`YdgoG8hTMUw`, similarity 0.5145)
4. **Big Jet Plane** — Angus & Julia Stone (`yFTvbcNhEgc`, similarity 0.5063)
5. **Boat** — george (`lAx7C_uUhFo`, similarity 0.4936)

- Top 5 overlap: 4/5, Top 10 overlap: 10/10
- Entering candidate Top 5: lAx7C_uUhFo
- Leaving original Top 5: ik_BQYbbZ5U
- Change mathematically driven mainly by: **weather** (avg |season delta| 0.0170 vs avg |weather delta| 0.0207 across all 673 tracks)
- No suspicious large-jump entrants into candidate Top 10 (no track ranked below 300 in the original entered the candidate Top 10).

**Largest movers (this image)**

Promoted: Smart (278→216, +62); I Like Me Better (289→236, +53); Don't Lose Sight (250→200, +50)

Demoted: Saw You in a Dream (212→317, -105); Cariño (203→294, -91); ocean eyes (80→166, -86)

---

## Cross-image diagnostics

### Images with the largest ranking changes (lowest Top 5 overlap)

- manual-04: Top5 overlap 2/5, Top10 overlap 9/10
- manual-01: Top5 overlap 4/5, Top10 overlap 9/10
- manual-03: Top5 overlap 4/5, Top10 overlap 10/10

### Images that are nearly identical (highest Top 5 overlap)

- manual-11: Top5 overlap 5/5, Top10 overlap 9/10
- manual-09: Top5 overlap 5/5, Top10 overlap 9/10
- manual-07: Top5 overlap 5/5, Top10 overlap 10/10

### Tracks repeatedly promoted by the correction (appear as a top mover in 2+ images)

- **Soulful** — L'indécis (`7ZguAEoNpZw`): images manual-01, manual-02, manual-03, total movement +80
- **Cinnamon Sugar** — Philanthrope & G Mills (`ZnA01HoOIO4`): images manual-04, manual-07, manual-11, total movement +110
- **HIGHEST IN THE ROOM** — Travis Scott (`tfSS1e3kYeo`): images manual-02, manual-08, total movement +77
- **L-O-V-E** — Nat King Cole (`UZWmtxLiiFE`): images manual-04, manual-07, total movement +81
- **Disco Yes** — Tom Misch feat. Poppy Ajudha (`EXWOJvlDwbU`): images manual-04, manual-06, total movement +87
- **Valentine** — Laufey (`tyKu0uZS86Q`): images manual-04, manual-07, total movement +73
- **Heavy Metal Drummer** — Wilco (`yeuIQFF7z6E`): images manual-05, manual-09, total movement +77
- **Smart** — LE SSERAFIM (`vPn_c61mW9s`): images manual-06, manual-12, total movement +108
- **Music Sounds Better With You** — Stardust (`FQlAEiCb8m0`): images manual-07, manual-11, total movement +73
- **Kiss** — Prince (`H9tEvfIsDyo`): images manual-07, manual-11, total movement +61
- **Midnight Driver** — Minako Yoshida (`tp_ojywTBWE`): images manual-08, manual-09, total movement +62

### Tracks repeatedly demoted by the correction (appear as a top mover in 2+ images)

- **SHYNESS BOY** — Anri (`50qu96dvhH8`): images manual-03, manual-05, manual-08, manual-09, total movement -183
- **I Like You** — DAY6 (`daoMYJv8i0c`): images manual-03, manual-05, manual-10, total movement -131
- **Perfect Night** — LE SSERAFIM (`oKBwWQI-IoI`): images manual-03, manual-08, manual-09, total movement -118
- **ocean eyes** — Billie Eilish (`viimfQi_pUw`): images manual-06, manual-07, manual-12, total movement -282
- **Saw You in a Dream** — The Japanese House (`NwnZyZ82UEs`): images manual-06, manual-07, manual-12, total movement -261
- **Hate Everything** — GSoul (`AW9jdH56MzM`): images manual-01, manual-04, total movement -131
- **Sunroof** — Nicky Youre & dazy (`G5xSLbYMr-I`): images manual-01, manual-09, total movement -57
- **How Sweet** — NewJeans (`Q3K0TOvTOno`): images manual-01, manual-09, total movement -60
- **Walking On A Dream** — Empire of the Sun (`eimgRedLkkU`): images manual-03, manual-05, total movement -140
- **Cariño** — The Marías (`QHVp9xiUr9U`): images manual-06, manual-12, total movement -183
- **Silver Soul** — Beach House (`0hCzhBNzIBw`): images manual-06, manual-12, total movement -165
- **Apocalypse** — Cigarettes After Sex (`sElE_BfQ67s`): images manual-06, manual-07, total movement -134
- **Lazy Eye** — Silversun Pickups (`j1DsAXoU-Yw`): images manual-07, manual-10, total movement -110
- **Alison** — Slowdive (`Ak43tAU5QuA`): images manual-07, manual-12, total movement -147

### Repeated candidate Top 10 tracks across multiple images

- **Big Jet Plane** — Angus & Julia Stone (`yFTvbcNhEgc`): images manual-01, manual-06, manual-07, manual-09, manual-12
- **A Walk** — Tycho (`SDNA934EEVk`): images manual-01, manual-02, manual-03, manual-09
- **When the Sun Hits** — Slowdive (`MKYY0IlTMw4`): images manual-01, manual-02, manual-03, manual-09
- **ocean eyes** — Billie Eilish (`viimfQi_pUw`): images manual-01, manual-02, manual-03, manual-09
- **Awake** — Tycho (`dm4tkSNKfFI`): images manual-01, manual-02, manual-09
- **Wait** — M83 (`iQnRCdtECl8`): images manual-01, manual-03, manual-09
- **Alison** — Slowdive (`Ak43tAU5QuA`): images manual-01, manual-02, manual-09
- **Riptide** — Vance Joy (`TL_oroU9eN8`): images manual-06, manual-07, manual-12
- **Stay Alive** — José González (`NucJk8TxyRg`): images manual-06, manual-07, manual-12
- **Orange Sky** — Alexi Murdoch (`vy_Em1i9BAA`): images manual-06, manual-07, manual-12
- **Boat** — george (`lAx7C_uUhFo`): images manual-06, manual-07, manual-12
- **Sugar for the Pill** — Slowdive (`BxwAPBxc0lU`): images manual-01, manual-02
- **Myth** — Beach House (`NyQ9p5S9jBk`): images manual-01, manual-02
- **Into Dust** — Mazzy Star (`04J0ihSeIuI`): images manual-02, manual-03
- **Cariño** — The Marías (`QHVp9xiUr9U`): images manual-03, manual-09
- **Respect** — Aretha Franklin (`A134hShx_gw`): images manual-04, manual-07
- **Try a Little Tenderness** — Otis Redding (`pli44utBOwo`): images manual-04, manual-05
- **Jenga** — Heize feat. Gaeko (`uw_HR9jIJww`): images manual-04, manual-05
- **Ophelia** — The Lumineers (`pTOC_q0NLTk`): images manual-05, manual-07
- **Banana Pancakes** — Jack Johnson (`YdgoG8hTMUw`): images manual-06, manual-12
- **Heartbeats** — José González (`ik_BQYbbZ5U`): images manual-06, manual-12
- **The Stable Song** — Gregory Alan Isakov (`jGDjO9kuKyY`): images manual-06, manual-12
- **Big Black Car** — Gregory Alan Isakov (`JgumMOMHpns`): images manual-06, manual-12
- **Meet Me in the Woods** — Lord Huron (`cYy7ljx7fyc`): images manual-07, manual-12
- **Cath...** — Death Cab for Cutie (`uY1ahFCYT5k`): images manual-08, manual-10

### Genre concentration in candidate Top 10 (across all 12 images, 120 slots)

- ambient-dream: 37
- folk-acoustic: 30
- rnb-soul: 21
- rock: 13
- pop: 11
- hip-hop: 6
- jazz-funk: 2

### Coverage vs. the original 5 precheck images

The original reproducibility precheck (`docs/stat-image-profile-precheck.json`) used 5 images that never triggered autumn, winter, rain, or snow affinity (all min=max=0), and had a narrower stats range. The 12 new manual-validation images span the full 0-100 range on season and weather affinities, meaningfully expanding coverage beyond the original 5:

| Dimension | Precheck (5 images) range | New (12 images) range |
|---|---|---|
| affinity.spring | 0-50 | 20-100 |
| affinity.summer | 0-80 | 10-100 |
| affinity.autumn | 0-0 | 10-90 |
| affinity.winter | 0-0 | 0-90 |
| affinity.clear | 0-80 | 10-100 |
| affinity.cloudy | 0-20 | 0-80 |
| affinity.rain | 0-0 | 0-90 |
| affinity.snow | 0-0 | 0-90 |
| stats.motion | 10-30 | 10-70 |
| stats.dreaminess | 10-70 | 30-80 |
| stats.tension | 20-40 | 5-80 |

## Root Cause: Top-Level Contribution Scale Imbalance

Follow-up investigation into why `manual-01`, `manual-02`, `manual-03`, and `manual-09` produce near-identical candidate playlists despite visually distinct scenes.

**manual-01/02/03/09 have genuinely different season/weather/time profiles.** Their GPT-generated affinity values are not close:

| image | spring | summer | autumn | winter | morning | night | lateNight | clear | cloudy | rain | snow |
|---|---|---|---|---|---|---|---|---|---|---|---|
| manual-01 | 40 | 30 | 60 | 50 | 50 | 30 | 20 | 70 | 30 | 10 | 10 |
| manual-02 | 20 | 10 | 30 | 90 | 60 | 10 | 10 | 50 | 50 | 10 | 90 |
| manual-03 | 30 | 40 | 50 | 60 | 10 | 80 | 70 | 50 | 50 | 20 | 10 |
| manual-09 | 60 | 50 | 70 | 40 | 80 | 20 | 10 | 40 | 60 | 20 | 10 |

manual-02 is a clear winter/snow scene (winter=90, snow=90), manual-03 is a clear night scene (night=80, lateNight=70), manual-09 is a clear morning/autumn scene (morning=80, autumn=70), and manual-01 sits in a moderate autumn/clear zone. **Insufficient image diversity is not the primary cause of the observed playlist convergence.**

**The repeatedly-recommended tracks share very similar atmosphere/desiredSound vectors.** The six tracks that dominate these four images' Top 10s — "A Walk" / "Awake" (Tycho), "When the Sun Hits" / "Alison" (Slowdive), "ocean eyes" (Billie Eilish), "Wait" (M83), all `ambient-dream` genre — all sit in a tight atmosphere/sound band: dreaminess 71-100, motion 8-30 (low), stats.energy 11-41 (low), acousticness 31-46. This matches the atmosphere/desiredSound targets these four images request (all dreamy, low-motion, low-energy) almost regardless of which specific season/weather values each image carries.

**Measured contribution-share breakdown** (candidate catalog, current production formula, computed across the 6 repeated tracks × the 4 images = 24 track-image pairs, from `contribution / totalDistance`):

| group | share of total distance |
|---|---|
| atmosphere | 35.4–65.5% |
| desiredSound | 20.3–44.5% |
| weather | 5.4–20.6% |
| season | 2.3–7.5% |
| time | 0.9–8.1% |

**Why this happens structurally:**
- `atmosphere` sums 10 individually-weighted dimensions (`ATMOSPHERE_WEIGHTS` sum ≈ 9.9); `desiredSound` sums 7 individually-weighted dimensions (`SOUND_WEIGHTS` sum ≈ 4.0). Neither is divided back down to a 0–1 scale — the group's contribution ceiling is its weight sum.
- `season` and `weather` are each first averaged across their 4 fields down to a single 0–1 value, then multiplied by one small scalar (`seasonWeight=0.35`, `weatherWeight=0.4`). `time` is averaged across its Scenario F 3-bucket value, then multiplied by `timeWeight=0.25`.
- Net effect: atmosphere+desiredSound's combined contribution ceiling (~13.9) is roughly **14x** larger than season+weather+time's combined ceiling (1.0). The four top-level groups are not on the same scale.
- Even though the season/weather correction candidate moved these six tracks' winter/snow values by 20-35 points each (e.g. "Alison" winter 58→94, snow 44→64), that shift only ever reaches 2-8% (season) or 5-21% (weather) of total distance — not enough to meaningfully reorder a Top 5/Top 10 dominated by a ~14x-larger atmosphere/desiredSound term.

**Primary cause: matcher contribution-scale imbalance** (top-level group weights are not normalized to a common scale before being summed into `totalDistance`).

**Secondary cause: `ambient-dream` track-stat homogeneity** (many tracks in that genre cluster carry very similar atmosphere/desiredSound values by genre-prior design, so even a scale-corrected matcher will still find several near-tied candidates within that cluster — see the bounded calibration experiment below for how much this residual effect persists after rebalancing).

This is a diagnostic finding only. No matcher weights, catalog values, or production code were changed as part of this investigation — see `docs/stat-matcher-calibration.md` for the bounded offline calibration experiment run against this root cause.

## Limitations

- Only 12 manual-validation images were tested; this is not a statistically representative sample.
- Images were selected intentionally (from a Pinterest-sourced local set) rather than randomly.
- Image profiles are GPT-4o-generated estimates (temperature 0, single successful call per image with at most one structural retry) -- not ground truth.
- Track stats and season/weather affinity values remain rule-based estimates, not derived from audio analysis or listening.
- Season/weather corrections in the candidate catalog are derived mathematically from existing stats, not from new source data.
- No audio file was analyzed as part of this validation.
- No blind listening study has occurred yet.
- Manual user ratings (docs/stat-manual-validation-ratings-template.json) are still empty and required before any Step 2 adoption decision.
- Mathematical ranking changes (rank movement, overlap, contribution deltas) describe what changed and why mathematically -- they do not by themselves prove improved musical fit. That judgment requires human listening.
- The correction-report's recorded input-file hash for the original draft does not match the actual file (see knownDiscrepancies); treated as a report-generation recording error, not a data-integrity issue, per user confirmation.

## Distinguishing levels of judgment

1. **Mathematical change** — reported above (rank movement, contribution deltas, overlap). This is fully computed and objective given the fixed Scenario F formula.
2. **Profile coherence** — whether the GPT-generated image profile itself looks internally consistent and plausible for the image (requires a human to view the image and profile side by side; see the HTML review page).
3. **Human musical-fit judgment** — whether the resulting tracks actually sound right for the image. Not evaluated here; requires listening.
4. **VibeScene sensitivity judgment** — whether the result matches the product's specific taste/brand sensitivity, beyond generic musical fit. Not evaluated here; requires the user's judgment.

This document does not conclude whether the correction candidate should be adopted. Fill in `docs/stat-manual-validation-ratings-template.json` after listening, then make the Step 2 decision.
