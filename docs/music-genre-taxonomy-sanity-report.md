# Music Genre Taxonomy — Sanity Report (Step 3-1)

**Scope:** Narrow taxonomy sanity pass over the existing Step 3-1 draft. Not a full reclassification. Three concerns addressed: crossover overuse, missing genre families, tiny/oversized subgenres.

**Inputs:** `docs/music-catalog-genre-classification-draft.ts` (673 tracks, unchanged, preserved for comparison).
**Output:** `docs/music-catalog-genre-classification-revised-draft.ts` (673 tracks; only `genreClassification.subgenre`, `.crossoverGenres`, `.needsGenreReview`, `.genreReason` differ from the original draft on affected tracks; `primaryGenre` unchanged for every track).

---

## 1. Crossover overuse audit

- Before: **552/673** tracks (82.0%) had ≥1 crossover genre; 626 total crossover assignments.
- After: **374/673** tracks (55.6%) have ≥1 crossover genre; 393 total crossover assignments.
- Distribution before → after: 0 crossover 121→299, 1: 480→355, 2: 70→19, 3: 2→0.
- 210 tracks had their crossover set changed by this audit.

**Method:** Every crossover-bearing entry was traced to its classification source (track-level override, artist-level override, or the tag-derived heuristic) and re-checked against a strict test: *"can this track sit inside a playlist centered on that OTHER genre without a noticeable flow break?"* — not influence, shared instrumentation, shared mood, or an artist's other work.

- **track/artist-level entries** (≈150 tracks): each was individually re-judged on real musical grounds (kept or removed one at a time; see `docs/music-catalog-genre-classification-revised-draft.ts` `genreReason` field for the specific note on every changed track).
- **tag-derived entries** (the majority): checked against a curated whitelist of genuinely playlist-compatible subgenre pairs (e.g. `dream-pop~shoegaze`, `jazz-hop~lofi-hiphop`, `city-pop~disco-funk`, `k-pop~dance-pop`); anything not on the whitelist was removed as influence-only. A small "regional-scene" block was added for j-rock/k-indie-rock crossing into generic Western alternative-rock/indie-rock — same guitar-band genre grammar, but a different-language scene is a real playlist-flow risk, not just an adjacency.

### Removals by crossover genre (top 20)

| Crossover value removed | Count |
|---|---:|
| soft-pop | 34 |
| disco-funk | 16 |
| alternative-rock | 12 |
| power-pop | 11 |
| alt-rnb | 11 |
| teen-pop | 11 |
| contemporary-rnb | 10 |
| indie-pop | 9 |
| dream-pop | 9 |
| synth-pop | 9 |
| hip-hop | 8 |
| k-pop | 8 |
| mainstream-rap | 7 |
| electropop | 6 |
| neo-soul | 5 |
| synthwave | 5 |
| indie-folk | 5 |
| classic-soul | 4 |
| indie-rock | 4 |
| trap | 4 |

**Biggest single cause: `soft-pop`** (34 removals). It had become a catch-all secondary tag with no specific playlist-compatibility meaning — removed everywhere it appeared as a crossover target, regardless of source primary genre.

### Retentions by crossover genre (top 20)

| Crossover value retained | Count |
|---|---:|
| disco-funk | 26 |
| alternative-rock | 22 |
| neo-soul | 21 |
| dance-pop | 18 |
| trap | 15 |
| k-rnb | 15 |
| americana | 15 |
| alternative-hip-hop | 12 |
| synth-pop | 12 |
| motown-soul | 12 |
| alt-rnb | 11 |
| bedroom-pop | 11 |
| nu-disco | 10 |
| mainstream-rap | 9 |
| indie-pop | 9 |
| dream-pop | 9 |
| house | 9 |
| melodic-rap | 8 |
| shoegaze | 8 |
| electropop | 8 |

### Tracks retaining 2–3 crossover genres (19)

All are genuinely dense, well-connected genre clusters (electropop↔dance-pop/future-bass/synthwave/house family; k-hiphop↔trap/mainstream-rap/alternative-hip-hop; jazz-hop↔lounge-jazz/lofi-hiphop; house↔disco/nu-disco) — exactly the case where multiple simultaneous playlist-fits are genuinely defensible.

| Track | Artist | Subgenre | Crossover |
|---|---|---|---|
| Aruarian Dance | Nujabes | jazz-hop | lounge-jazz, lofi-hiphop |
| Naimononedari | KANA-BOON | indie-rock | power-pop, alternative-rock |
| Bermuda Triangle | ZICO, Crush, DEAN | k-hiphop | alternative-hip-hop, mainstream-rap |
| Simon Dominic | Simon Dominic | k-hiphop | trap, mainstream-rap |
| INVITATION | JUNNY feat. Gaeko | k-rnb | alt-rnb, contemporary-rnb |
| Caffeine | Eyedi | city-pop | synth-pop, disco-funk |
| Just A Joke | Yurie Kokubu | city-pop | disco-funk, disco |
| Sweetness | Jimmy Eat World | alternative-rock | pop-punk, power-pop |
| Runaway | Kanye West feat. Pusha T | alternative-hip-hop | mainstream-rap, art-pop |
| Hypnotize | The Notorious B.I.G. | east-coast-hip-hop | boom-bap, mainstream-rap |
| Stay | Zedd & Alessia Cara | electropop | dance-pop, future-bass |
| Rather Be | Clean Bandit feat. Jess Glynne | electropop | dance-pop, synthwave |
| Shelter | Porter Robinson & Madeon | electropop | future-bass, synthwave |
| Clearest Blue | CHVRCHES | synthwave | synth-pop, electropop |
| Moth To A Flame | Swedish House Mafia & The Weeknd | electropop | house, synthwave |
| We Found Love | Rihanna feat. Calvin Harris | dance-pop | electropop, house |
| Titanium | David Guetta feat. Sia | electropop | dance-pop, progressive-house |
| Music Sounds Better With You | Stardust | house | nu-disco, disco |
| Lady (Hear Me Tonight) | Modjo | house | nu-disco, disco-funk |

### Questionable artist-wide crossover patterns (retained, but flagged for extra scrutiny)

| Artist | Crossover | Tracks | Note |
|---|---|---:|---|
| NewJeans | house | 5 | Applied to every NewJeans track in the catalog from one artist-level judgment (UK-garage/house-informed production). Genuinely defensible for the group's sound overall, but worth a human sanity-check per song rather than treating it as automatic. |
| Lana Del Rey | dream-pop | 3 | Already flagged needsGenreReview=true; the most subjective of the retained artist-level crossovers -- her 'pop' identity vs. 'dream-pop' coloring genuinely varies by song and era. |
| M83 | ambient-electronic | 3 | Applied uniformly across M83's catalog presence; representative of the act's overall sound but not verified per individual track. |

### Examples: retained vs. removed

**Retained (playlist-compatible):**
- Chic → disco-funk (disco~disco-funk: same continuum, DJs blend constantly)
- Nujabes "Aruarian Dance" → lounge-jazz + lofi-hiphop (jazz-hop is the literal midpoint of both scenes)
- NewJeans → house (UK-garage/house-informed production, well documented for this act)

**Removed (influence-only):**
- Laufey "From The Start" (jazz/lounge-jazz) — removed soft-pop crossover: generic catch-all, not a specific playlist claim
- Coldplay "Yellow"/"The Scientist" (rock/alternative-rock) — removed soft-pop crossover: same generic-catch-all issue
- Thundercat "Them Changes" (jazz/modern-jazz) — removed disco-funk, kept acid-jazz: acid-jazz~disco-funk is a real lineage, but the *modern-jazz* primary itself reaching all the way to disco-funk was a step too far
- Prince → removed bare `pop` crossover: too broad to be a specific playlist-compatibility claim

## 2. Missing genre families

**Decision: no new primary genre added.**

A full-catalog tag scan (subTags/moodTags/sceneTags/legacy.tags across all 673 tracks) for reggae/ska/dub/dancehall/latin/salsa/cumbia/reggaeton/soundtrack/score/orchestral/classical/composition/chamber-adjacent markers found only one genuine hit: Sublime 'Santeria' (subTags: ska-pop, surf-rock, west-coast). 'Bossa nova' (3 tracks) is already represented as a jazz subgenre, which is standard genre-taxonomy practice and not evidence for a separate Latin primary. 'Cinematic'-prefixed tags (cinematic-pop, cinematic-rock, cinematic-folk, cinematic-electronic, cinematic-rap, cinematic-ambient) are all mood modifiers on existing genres, not evidence of actual instrumental film-score/orchestral tracks -- no soundtrack-cinematic or classical-modern-composition cluster exists in this catalog. One track alone does not meet the task's bar ('multiple catalog tracks or a musically essential distinct cluster') for a new primary genre.

### Santeria — Sublime

Represented as **rock/alternative-rock**, crossoverGenres: `[]`, needsGenreReview: **true**.

Sublime's ska-punk sound is dominantly a full-band, guitar/drums, verse-chorus ROCK identity with a reggae/ska-influenced upstroke rhythm guitar -- accurately representable as rock/alternative-rock. No existing taxonomy subgenre is a genuinely playlist-compatible crossover target for its reggae/ska character (disco-funk, its v1 crossover, was influence-only and has been removed), so crossoverGenres is now empty and the track is flagged needsGenreReview with an explicit taxonomy-gap note for future reconsideration if more reggae/ska tracks are added to the catalog.

## 3. Tiny subgenres

| Subgenre | Tracks (before) | Decision | Reasoning |
|---|---:|---|---|
| ambient-experimental/ambient-electronic | 2 | retain | Tycho 'A Walk' + 'Awake' (now 3 with the lofi-ambient merge below). Genuinely distinct instrumental, texture-first identity -- no vocals, no beat-driven structure, no verse-chorus pop structure. Merging into any other subgenre would misrepresent these tracks. |
| folk-acoustic/americana | 1 | retain | The Gaslight Anthem 'The '59 Sound' -- confidence 87, subTags explicitly confirm 'heartland-punk, road-rock, americana-drive'. Americana is a real, distinct genre (not a manufactured microscopic label) and already has ecosystem support as a crossover target on 3 other tracks (War on Drugs, Lord Huron, Gregory Alan Isakov). Secondary observation for the reviewer: this specific track is a full-band punk/heartland-rock recording, not acoustic folk -- its folk-acoustic PRIMARY placement (inherited from the legacy genre field) is in tension with its actual instrumentation, but reassigning primary genre is outside this narrow audit's scope; flagged as a note only, not auto-changed. |
| hip-hop/boom-bap | 1 | merge → east-coast-hip-hop | Joey Bada$$ 'Survival Tactics' -- boom-bap is a real, canonical genre, but with only 1 track it can't seed its own playlist. Its own subTags already co-tag 'east-coast-hip-hop', which is the historically accurate parent (boom-bap IS the classic NY/east-coast sound) and already present in the taxonomy. Clean, well-supported merge. |
| electronic/future-bass | 1 | retain | ODESZA 'A Moment Apart' -- ODESZA are canonical future-bass genre-definers. None of the other 5 electronic subgenres (house/deep-house/progressive-house/tropical-house/synthwave) are a clean parent fit (different rhythmic structure and era). Forcing a merge would misrepresent a real, important, distinct EDM subgenre. |
| ambient-experimental/lofi-ambient | 1 | merge → ambient-electronic | Øneheart & reidenshi 'snowfall' -- a real, distinct 'sad lofi ambient' aesthetic, but the distinction from Tycho's ambient-electronic is subtle for playlist purposes and this primary only had 3 tracks total catalog-wide; keeping two 1-2-track buckets within a 3-track primary was needless fragmentation. |

## 4. Oversized subgenres

| Subgenre | Tracks | Decision | Reasoning |
|---|---:|---|---|
| pop/city-pop | 38 | coherent, no split | 38 tracks across 31 distinct artists. City pop is a genuinely large, real-world scene with a consistent sonic palette (synth-driven, funk bass, ~100-120bpm, nostalgic). No widely-recognized canonical internal split exists the way e.g. house has (deep vs progressive). Retained as-is. |
| pop/dance-pop | 38 → 33 | coherent, but masking found and fixed | 5 tracks (SOLO/JENNIE, Standing Next to You/Jung Kook, Magnetic/ILLIT, Touch/KATSEYE, 3D/Jung Kook feat. Jack Harlow) carried an explicit 'k-pop' subTag on an idol-group track but were outweighed by generic dance-pop signal in v1's tag-heuristic scoring, masking a more useful k-pop identity for playlist construction. Reclassified to pop/k-pop (primary genre unchanged). The remaining 33 dance-pop tracks (Dua Lipa, Katy Perry, Sabrina Carpenter, Tate McRae, Michael Jackson, etc.) are genuinely coherent uptempo dance-oriented pop; not split further. |
| rnb-soul/classic-soul | 28 | coherent, no split | 28 tracks, 18 distinct artists, spanning Stax/Atlantic/Motown-adjacent 60s-70s soul. Genuinely one coherent vintage-soul playlist category for this catalog's needs; not split. |
| rock/alternative-rock | 27 | coherent, no split | Spans 90s-2010s mainstream/classic alt-rock (Coldplay, Foo Fighters, Pearl Jam, Killers, Kings of Leon, etc.). A real-world 'Alternative Rock' playlist commonly runs into the hundreds of tracks; 27 is not oversized for this catalog. The two boundary-case tracks already correctly carry needsGenreReview (Tame Impala, and the ambiguous-crossover-flagged The Cure track). Not split. |
| rock/dream-pop | 27 | coherent, no split | Checked specifically for a masked shoegaze cluster: only Slowdive 'Sugar for the Pill' carries an explicit shoegaze-adjacent subTag among these 27, and it already correctly carries a shoegaze crossover. The remaining 26 lean softer/more minimal-synth than genuine wall-of-noise shoegaze. No hidden split found; not split. |

## 5. Limitations

- This is a narrow sanity pass, not a full reclassification — only crossover values, 2 tiny-subgenre merges, and 5 oversized-subgenre reclassifications were touched.
- No audio was analyzed, no external API/database/web call was made.
- The "questionable artist-wide crossover patterns" above are retained on individual editorial judgment, not mechanically re-verified per song — flagged, not resolved.
- Step 3-2 has not begun.
