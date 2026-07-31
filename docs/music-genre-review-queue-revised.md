# Music Genre Review Queue — Revised (post taxonomy sanity pass)

**Total flagged tracks:** 45 of 673 (6.7%)

- P1 (unclear primary / conflicting metadata / weak confidence): **13**
- P2 (ambiguous crossover removed pending review / artist inconsistency / moderate confidence): **28**
- P3 (minor refinement only): **4**

This supersedes `docs/music-genre-review-queue.md` for review purposes; the original is preserved unchanged for comparison. New in this revision: tracks where an ambiguous crossover value (e.g. alternative-rock~dream-pop) was conservatively removed rather than kept are now explicitly flagged P2 here so a human can decide whether to re-add it.

---

## P1 (13)

| Track | Artist | Previous lane | Proposed genre | Crossover | Confidence | Alternatives | Reason |
|---|---|---|---|---|---:|---|---|
| e2Z0sON2UPc — Ain't No Rest for the Wicked | Cage The Elephant | american-alternative-drive | rock/alternative-rock | — | 58 | indie-rock, dream-pop, shoegaze | [tag-derived] no genre-bearing subtags found; fell back to legacy genre 'rock' + lane default (american-alternative-drive). |
| VuNIsY6JdUw — You Belong With Me | Taylor Swift | highteen-pop-room | pop/soft-pop | — | 58 | dance-pop, synth-pop, electropop | [artist-knowledge] Catalog spans pop, country and indie-folk eras; track-level identity genuinely varies, defaulted conservatively. [Step 3-1 sanity pass: removed indie-folk (catalog-wide generalization, not a defensible per-song playlist claim at the artist-default level).] |
| AgFeZr5ptV8 — 22 | Taylor Swift | highteen-pop-room | pop/soft-pop | — | 58 | dance-pop, synth-pop, electropop | [artist-knowledge] Catalog spans pop, country and indie-folk eras; track-level identity genuinely varies, defaulted conservatively. [Step 3-1 sanity pass: removed indie-folk (catalog-wide generalization, not a defensible per-song playlist claim at the artist-default level).] |
| cvUAzpn48xA — Lover | Taylor Swift | modern-romance-pop | pop/soft-pop | — | 58 | dance-pop, synth-pop, electropop | [artist-knowledge] Catalog spans pop, country and indie-folk eras; track-level identity genuinely varies, defaulted conservatively. [Step 3-1 sanity pass: removed indie-folk (catalog-wide generalization, not a defensible per-song playlist claim at the artist-default level).] |
| 66TQBtlRKc4 — Style | Taylor Swift | modern-romance-pop | pop/soft-pop | — | 58 | dance-pop, synth-pop, electropop | [artist-knowledge] Catalog spans pop, country and indie-folk eras; track-level identity genuinely varies, defaulted conservatively. [Step 3-1 sanity pass: removed indie-folk (catalog-wide generalization, not a defensible per-song playlist claim at the artist-default level).] |
| UM9XNpgrqVk — Kaiju no Hanauta | Vaundy | j-rock-highway-rush | pop/j-pop | j-rock | 62 | j-rock, dance-pop, synth-pop | [artist-knowledge] Genre-fluid modern Japanese artist moving between J-pop, rock and R&B; track-level identity varies. |
| SIuF37EWaLU — Tokyo Flash | Vaundy | city-pop-retro-glow | pop/j-pop | j-rock | 62 | j-rock, dance-pop, synth-pop | [artist-knowledge] Genre-fluid modern Japanese artist moving between J-pop, rock and R&B; track-level identity varies. |
| AEYN5w4T_aM — Santeria | Sublime | summer-beach-pop | rock/alternative-rock | — | 62 | indie-rock, dream-pop, shoegaze | [artist-knowledge] Ska-punk/reggae-rock hybrid the taxonomy has no dedicated bucket for; filed under alternative-rock with a funk/groove crossover as the closest fit. [Step 3-1 sanity pass: removed disco-funk (weak/generic). See taxonomy-gap note: catalog has no reggae-ska primary/subgenre and only this one track shows that character, so no crossover target is genuinely playlist-compatible; represented as rock/alternative-rock with an explicit taxonomy-gap flag instead.] |
| EgBJmlPo8Xw — everything i wanted | Billie Eilish | dream-pop-shoegaze-fog | pop/bedroom-pop | — | 65 | dance-pop, synth-pop, electropop | [artist-knowledge] Broadly alt-pop/bedroom-pop artist; individual tracks vary (see track-level override for 'ocean eyes'). [Step 3-1 sanity pass: removed dream-pop at the artist-default level (ambiguous; kept only on the individually-verified 'ocean eyes' track override).] |
| iquhBgM-Qv0 — Adore You | Harry Styles | modern-romance-pop | pop/soft-pop | — | 65 | dance-pop, synth-pop, electropop | [artist-knowledge] Blends 70s glam/pop-rock influence with contemporary pop; stylistically broad catalog. [Step 3-1 sanity pass: removed power-pop (influence-only at the artist-default level).] |
| RwT77rlp2CE — Late Night Talking | Harry Styles | modern-romance-pop | pop/soft-pop | — | 65 | dance-pop, synth-pop, electropop | [artist-knowledge] Blends 70s glam/pop-rock influence with contemporary pop; stylistically broad catalog. [Step 3-1 sanity pass: removed power-pop (influence-only at the artist-default level).] |
| E07s5ZYygMg — Watermelon Sugar | Harry Styles | summer-beach-pop | pop/soft-pop | — | 65 | dance-pop, synth-pop, electropop | [artist-knowledge] Blends 70s glam/pop-rock influence with contemporary pop; stylistically broad catalog. [Step 3-1 sanity pass: removed power-pop (influence-only at the artist-default level).] |
| H5v3kku4y6Q — As It Was | Harry Styles | trendy-pop-chic | pop/soft-pop | — | 65 | dance-pop, synth-pop, electropop | [artist-knowledge] Blends 70s glam/pop-rock influence with contemporary pop; stylistically broad catalog. [Step 3-1 sanity pass: removed power-pop (influence-only at the artist-default level).] |

## P2 (28)

| Track | Artist | Previous lane | Proposed genre | Crossover | Confidence | Alternatives | Reason |
|---|---|---|---|---|---:|---|---|
| GxgqpCdOKak — Hold On, We're Going Home | Drake feat. Majid Jordan | hip-hop-night-drive | rnb-soul/alt-rnb | contemporary-rnb | 67 | contemporary-rnb, neo-soul, classic-soul | [tag-derived] subtag/mood evidence -> alt-rnb. |
| FEoveD68H_Q — Good Life | OneRepublic | summer-beach-pop | rock/alternative-rock | — | 67 | indie-rock, dream-pop, shoegaze | [tag-derived] subtag/mood evidence -> alternative-rock. |
| 5JxgDJvqGmM — The Ocean | Mike Perry feat. Shy Martin | summer-beach-pop | electronic/tropical-house | — | 67 | house, deep-house, progressive-house | [tag-derived] subtag/mood evidence -> tropical-house. |
| 8Ee4QjCEHHc — Slide | Calvin Harris feat. Frank Ocean & Migos | summer-beach-pop | funk-disco/disco-funk | — | 67 | classic-funk, disco, nu-disco | [tag-derived] subtag/mood evidence -> disco-funk. |
| v_B3qkp4nO4 — Shotgun | George Ezra | summer-beach-pop | folk-acoustic/folk-pop | — | 67 | indie-folk, singer-songwriter, americana | [tag-derived] subtag/mood evidence -> folk-pop. |
| KT7F15T9VBI — Heat Waves | Glass Animals | summer-beach-pop | rock/dream-pop | — | 67 | alternative-rock, indie-rock, shoegaze | [tag-derived] subtag/mood evidence -> dream-pop. |
| jGflUbPQfW8 — Cheerleader (Felix Jaehn Remix) | OMI | summer-beach-pop | electronic/tropical-house | — | 67 | house, deep-house, progressive-house | [tag-derived] subtag/mood evidence -> tropical-house. |
| pUjE9H8QlA4 — Waves (Robin Schulz Remix Radio Edit) | Mr. Probz | summer-beach-pop | electronic/tropical-house | — | 67 | house, deep-house, progressive-house | [tag-derived] subtag/mood evidence -> tropical-house. |
| RSSUa2qW4tc — yes, and? | Ariana Grande | trendy-pop-chic | electronic/house | disco-funk | 67 | disco-funk, deep-house, progressive-house | [tag-derived] subtag/mood evidence -> house. |
| -gykpFAst7I — Just the Two of Us | Grover Washington, Jr. feat. Bill Withers | classic-soul-old-film | jazz/acid-jazz | — | 67 | modern-jazz, nu-jazz, jazz-hop | [tag-derived] subtag/mood evidence -> acid-jazz. |
| VMs-l9Hru-I — Don't Lose Sight | Lawrence | sunny-stroll-pop | rnb-soul/classic-soul | — | 67 | contemporary-rnb, neo-soul, motown-soul | [tag-derived] subtag/mood evidence -> classic-soul. |
| 1cEy4UyYHI0 — Outro | M83 | dream-pop-shoegaze-fog | rock/dream-pop | ambient-electronic | 70 | ambient-electronic, alternative-rock, indie-rock | [artist-knowledge] Electronic-tinged dream-pop; genuinely straddles rock and electronic production. |
| dX3k_QDnzHE — Midnight City | M83 | neon-electronic-night | rock/dream-pop | ambient-electronic | 70 | ambient-electronic, alternative-rock, indie-rock | [artist-knowledge] Electronic-tinged dream-pop; genuinely straddles rock and electronic production. |
| LIlZCmETvsY — Shin Takarajima | Sakanaction | j-rock-highway-rush | rock/j-rock | — | 72 | alternative-rock, indie-rock, dream-pop | [artist-knowledge] Blends rock-band instrumentation with electronic/dance production; genuinely hybrid. [Step 3-1 sanity pass: removed synthwave (shares electronic instrumentation only, not synthwave's specific retro aesthetic -- influence-only).] |
| 65Ah1Yj59zA — Aoi | Sakanaction | j-rock-highway-rush | rock/j-rock | — | 72 | alternative-rock, indie-rock, dream-pop | [artist-knowledge] Blends rock-band instrumentation with electronic/dance production; genuinely hybrid. [Step 3-1 sanity pass: removed synthwave (shares electronic instrumentation only, not synthwave's specific retro aesthetic -- influence-only).] |
| m34DPnRUfMU — Ao to Natsu | Mrs. GREEN APPLE | j-rock-highway-rush | rock/j-rock | j-pop | 72 | j-pop, alternative-rock, indie-rock | [artist-knowledge] Straddles J-rock band sound and mainstream J-pop songwriting fairly evenly. |
| OTUtF7ZxRN8 — StaRt | Mrs. GREEN APPLE | j-rock-highway-rush | rock/j-rock | j-pop | 72 | j-pop, alternative-rock, indie-rock | [artist-knowledge] Straddles J-rock band sound and mainstream J-pop songwriting fairly evenly. |
| SV6bIRBiPeQ — Snow | SURL | k-indie-rainy-room | rock/dream-pop | k-indie-rock | 72 | k-indie-rock, alternative-rock, indie-rock | [artist-knowledge] Korean dream-pop/shoegaze-adjacent indie act. |
| gnm7VTl96MM — Dry Flower | SURL | k-indie-rainy-room | rock/dream-pop | k-indie-rock | 72 | k-indie-rock, alternative-rock, indie-rock | [artist-knowledge] Korean dream-pop/shoegaze-adjacent indie act. |
| BxqYUbNR-c0 — Wasurerarenaino | Sakanaction | city-pop-retro-glow | rock/j-rock | — | 72 | alternative-rock, indie-rock, dream-pop | [artist-knowledge] Blends rock-band instrumentation with electronic/dance production; genuinely hybrid. [Step 3-1 sanity pass: removed synthwave (shares electronic instrumentation only, not synthwave's specific retro aesthetic -- influence-only).] |
| iQnRCdtECl8 — Wait | M83 | dream-pop-shoegaze-fog | rock/dream-pop | ambient-electronic | 72 | ambient-electronic, alternative-rock, indie-rock | [track-verified] Cinematic vocal ballad with dense synth atmosphere; sits between dream-pop and ambient-electronic — dream-pop chosen for its song/verse structure and vocal lead. |
| o3SqUUoJjW8 — West Coast | Lana Del Rey | dream-pop-shoegaze-fog | pop/soft-pop | dream-pop | 72 | dream-pop, dance-pop, synth-pop | [artist-knowledge] Cinematic baroque-pop artist straddling pop and dream-pop; track-level identity varies. |
| cE6wxDqdOV0 — Video Games | Lana Del Rey | dream-pop-shoegaze-fog | pop/soft-pop | dream-pop | 72 | dream-pop, dance-pop, synth-pop | [artist-knowledge] Cinematic baroque-pop artist straddling pop and dream-pop; track-level identity varies. |
| wycjnCCgUes — Feels Like We Only Go Backwards | Tame Impala | dream-pop-shoegaze-fog | rock/alternative-rock | — | 72 | indie-rock, dream-pop, shoegaze | [artist-knowledge] Psychedelic rock act with heavy synth/production crossover into dream-pop and electronic. [Step 3-1 sanity pass: removed dream-pop (ambiguous alternative-rock~dream-pop boundary; tag-derived instances of this pair are conservatively removed pending human review, and this artist-level default follows the same rule).] |
| GHe8kKO8uds — Eventually | Tame Impala | dream-pop-shoegaze-fog | rock/alternative-rock | — | 72 | indie-rock, dream-pop, shoegaze | [artist-knowledge] Psychedelic rock act with heavy synth/production crossover into dream-pop and electronic. [Step 3-1 sanity pass: removed dream-pop (ambiguous alternative-rock~dream-pop boundary; tag-derived instances of this pair are conservatively removed pending human review, and this artist-level default follows the same rule).] |
| 1uFv9Ts7Sdw — Mariners Apartment Complex | Lana Del Rey | dream-pop-shoegaze-fog | pop/soft-pop | dream-pop | 72 | dream-pop, dance-pop, synth-pop | [artist-knowledge] Cinematic baroque-pop artist straddling pop and dream-pop; track-level identity varies. |
| viimfQi_pUw — ocean eyes | Billie Eilish | dream-pop-shoegaze-fog | rock/dream-pop | bedroom-pop | 75 | bedroom-pop, alternative-rock, indie-rock | [track-verified] Billie Eilish's debut single leans dream-pop/ambient in production though her broader catalog is alt-pop; flagged given artist identity ambiguity. |
| D88J_57QgxY — Pictures of You | The Cure | dream-pop-shoegaze-fog | rock/dream-pop | — | 79 | alternative-rock, indie-rock, shoegaze | [tag-derived] subtag/mood evidence -> dream-pop; agrees with legacy genre 'ambient-dream'; agrees with lane default (dream-pop-shoegaze-fog). [Step 3-1 sanity pass: ambiguous crossover(s) removed pending human review: alternative-rock.] |

## P3 (4)

| Track | Artist | Previous lane | Proposed genre | Crossover | Confidence | Alternatives | Reason |
|---|---|---|---|---|---:|---|---|
| EkHTsc9PU2A — I'm Yours | Jason Mraz | summer-beach-pop | folk-acoustic/folk-pop | — | 79 | indie-folk, singer-songwriter, americana | [tag-derived] subtag/mood evidence -> folk-pop. |
| 9Sc-ir2UwGU — Firestone | Kygo feat. Conrad Sewell | summer-beach-pop | electronic/tropical-house | — | 79 | house, deep-house, progressive-house | [tag-derived] subtag/mood evidence -> tropical-house. |
| tyKu0uZS86Q — Valentine | Laufey | cozy-cafe-mellow | pop/soft-pop | — | 79 | dance-pop, synth-pop, electropop | [tag-derived] subtag/mood evidence -> soft-pop. |
| acvIVA9-FMQ — Lucky | Jason Mraz feat. Colbie Caillat | cozy-cafe-mellow | pop/soft-pop | — | 79 | dance-pop, synth-pop, electropop | [tag-derived] subtag/mood evidence -> soft-pop. |

