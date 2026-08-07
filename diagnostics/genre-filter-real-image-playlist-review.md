# Genre-First Real-Image Playlist Review (20-Track)

Source: diagnostics/genre-filter-real-image-evaluation.json
Generated (source run): 2026-08-06T05:23:54.506Z | Repository HEAD: 305828e | Model: gpt-4o

**PARTIAL RESULT: 7/12 images succeeded.** Three consecutive real-GPT run attempts (20s, 35s, 45s
inter-request pacing) were made; the remaining images repeatedly failed with a generic
`이미지 분석 중 오류가 발생했습니다.` / `이미지 분석 결과를 처리하지 못했습니다.` SafeError from the OpenAI request
step itself (not a genre-filter or scoring failure) — the underlying OpenAI error detail is not
exposed to the client by design (SafeError pattern) and this CLI version has no `supabase functions logs`
command to inspect server-side logs. Failed images are listed at the end of this file. No fabricated
or synthetic results are included for the failed images — only genuinely completed real analyses appear below.

This document performs **no new scoring, no new sequencing, no genre expansion** — it extracts and
reorganizes the real GPT + real catalog-filter + real scoring + real sequencing output already produced
by this run. `genreEligibleCatalogCount` below is recomputed locally (pure, zero-cost, deterministic)
via the real `filterEligibleByGenre` using each image's ACTUAL GPT-selected primaryGenres/subgenres —
not fabricated or estimated.

## 1. 050e0c11047a97bc23cbd3be7458e6c7.jpg

- **playlist_concept**: Snowy Evening Quietude
- **primary_lane_id**: lofi-bedroom-solitude
- **image analysis**: SCENE (confidence 0.95) — Outdoor (countryside), Evening, Winter; mood: peaceful, melancholic, dreamy; sensory: cold, crisp, snowy.
- **primaryGenres**: folk-acoustic
- **subgenres**: indie-folk, cinematic-folk
- **eligible catalog count** (genre-filtered, before scoring): 47
- **scored candidate count** (CATALOG_CANDIDATE_POOL_SIZE): 30

**Final 20 tracks (sequenced order)**

| pos | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | The Lumineers | Ophelia | pTOC_q0NLTk | folk-acoustic | folk-pop | 77.71 | 82.70 | 88.29 | 60.75 | 83.80 | 59.50 | medium |
| 2 | Vance Joy | Riptide | TL_oroU9eN8 | folk-acoustic | folk-pop | 77.61 | 80.60 | 84.71 | 68.00 | 84.00 | 62.75 | medium |
| 3 | The Lumineers | Cleopatra | aN5s9N_pTUs | folk-acoustic | folk-pop | 77.13 | 78.20 | 90.43 | 64.25 | 85.40 | 55.75 | medium |
| 4 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | folk-acoustic | indie-folk | 76.84 | 79.70 | 90.43 | 62.75 | 80.60 | 55.50 | medium |
| 5 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 82.42 | 86.00 | 88.57 | 69.25 | 89.00 | 71.75 | low |
| 6 | The Gaslight Anthem | The '59 Sound | G1lq40tR72Q | folk-acoustic | americana | 77.44 | 82.10 | 84.43 | 63.25 | 86.20 | 62.50 | high |
| 7 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | folk-acoustic | indie-folk | 81.67 | 85.90 | 91.14 | 67.25 | 83.80 | 67.25 | low |
| 8 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | folk-acoustic | singer-songwriter | 81.07 | 84.70 | 92.29 | 66.25 | 83.20 | 64.75 | low |
| 9 | José González | Heartbeats | ik_BQYbbZ5U | folk-acoustic | singer-songwriter | 80.85 | 84.00 | 90.71 | 68.75 | 86.00 | 63.50 | low |
| 10 | Rinko Nagai | 雨宿らず | dWd5mWQ_bpA | folk-acoustic | singer-songwriter | 80.05 | 84.10 | 88.14 | 66.75 | 82.40 | 67.50 | low |
| 11 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | folk-acoustic | singer-songwriter | 79.63 | 81.70 | 89.00 | 68.75 | 80.20 | 67.25 | low |
| 12 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | folk-acoustic | singer-songwriter | 78.72 | 82.10 | 91.71 | 65.75 | 81.60 | 57.00 | low |
| 13 | Alexi Murdoch | All My Days | 5NFkFVe93NM | folk-acoustic | singer-songwriter | 78.29 | 77.20 | 91.29 | 66.75 | 85.80 | 61.00 | low |
| 14 | Raffy Bushman | Abraham | cJ3Pm-HpG_o | folk-acoustic | singer-songwriter | 78.09 | 81.70 | 86.14 | 64.00 | 79.00 | 68.25 | low |
| 15 | Lord Huron | The Night We Met | KtlgYxa6BMU | folk-acoustic | cinematic-folk | 77.84 | 86.30 | 86.71 | 62.25 | 79.00 | 58.00 | low |
| 16 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | folk-acoustic | singer-songwriter | 77.64 | 82.50 | 90.29 | 62.75 | 75.80 | 58.75 | low |
| 17 | strings & heart | evergreen love | QJBm_SE4fC0 | folk-acoustic | indie-folk | 77.63 | 80.80 | 89.00 | 58.75 | 79.40 | 66.25 | low |
| 18 | Jack Johnson | Banana Pancakes | YdgoG8hTMUw | folk-acoustic | singer-songwriter | 77.35 | 77.30 | 91.43 | 65.75 | 86.60 | 54.75 | low |
| 19 | Sufjan Stevens | Mystery of Love | 4WTt69YO2VI | folk-acoustic | indie-folk | 77.30 | 80.20 | 87.43 | 66.25 | 79.60 | 60.75 | low |
| 20 | Bon Iver | Holocene | MjxA25Tj1Ks | folk-acoustic | indie-folk | 77.26 | 79.00 | 90.00 | 61.75 | 82.60 | 60.25 | low |

**YouTube watch URLs**

- https://www.youtube.com/watch?v=pTOC_q0NLTk
- https://www.youtube.com/watch?v=TL_oroU9eN8
- https://www.youtube.com/watch?v=aN5s9N_pTUs
- https://www.youtube.com/watch?v=jwC06Izp1a8
- https://www.youtube.com/watch?v=dzoxC8dedXw
- https://www.youtube.com/watch?v=G1lq40tR72Q
- https://www.youtube.com/watch?v=yFTvbcNhEgc
- https://www.youtube.com/watch?v=lz2qpnRB5_E
- https://www.youtube.com/watch?v=ik_BQYbbZ5U
- https://www.youtube.com/watch?v=dWd5mWQ_bpA
- https://www.youtube.com/watch?v=JgumMOMHpns
- https://www.youtube.com/watch?v=Nd-A-iiPoLg
- https://www.youtube.com/watch?v=5NFkFVe93NM
- https://www.youtube.com/watch?v=cJ3Pm-HpG_o
- https://www.youtube.com/watch?v=KtlgYxa6BMU
- https://www.youtube.com/watch?v=RGVmhrfQqzg
- https://www.youtube.com/watch?v=QJBm_SE4fC0
- https://www.youtube.com/watch?v=YdgoG8hTMUw
- https://www.youtube.com/watch?v=4WTt69YO2VI
- https://www.youtube.com/watch?v=MjxA25Tj1Ks

PHOTO_FIT:
BEST_TRACKS:
WRONG_TRACKS:
MISSING_DIRECTION:
PLAYLIST_COHERENCE:
REPETITIVENESS:
NOTES:

---

## 2. 0ea78a4ffc3af667e68e52ea29867a9b.jpg

- **playlist_concept**: Neon Reflections
- **primary_lane_id**: k-rnb-night-drive
- **image analysis**: SCENE (confidence 0.95) — Indoor (hotel room), Night, Autumn; mood: introspective, peaceful, moody; sensory: cool, still, muted.
- **primaryGenres**: rnb-soul
- **subgenres**: k-rnb, alt-rnb
- **eligible catalog count** (genre-filtered, before scoring): 127
- **scored candidate count** (CATALOG_CANDIDATE_POOL_SIZE): 30

**Final 20 tracks (sequenced order)**

| pos | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Jiselle feat. CHANGMO | LANGUAGE | nL23IBHgyYk | rnb-soul | alt-rnb | 83.58 | 86.30 | 86.29 | 84.50 | 78.40 | 75.25 | medium |
| 2 | Otis Redding | Try a Little Tenderness | pli44utBOwo | rnb-soul | classic-soul | 82.96 | 85.90 | 83.71 | 80.25 | 77.80 | 81.75 | medium |
| 3 | 채옐 | He's Something | PjREBqcLHCo | rnb-soul | k-rnb | 82.78 | 84.60 | 82.57 | 80.50 | 81.40 | 82.75 | medium |
| 4 | Colde | Control Me | Rf-ctwR7P-M | rnb-soul | alt-rnb | 81.78 | 85.40 | 80.29 | 85.50 | 79.60 | 75.25 | medium |
| 5 | DEAN | Bonnie & Clyde | 3ze6drtwiE4 | rnb-soul | alt-rnb | 81.41 | 82.90 | 84.57 | 81.75 | 79.20 | 73.25 | medium |
| 6 | Heize feat. Gaeko | Jenga | uw_HR9jIJww | rnb-soul | k-rnb | 81.27 | 86.10 | 83.00 | 77.75 | 83.00 | 70.50 | medium |
| 7 | Four Tops | Reach Out I'll Be There | AUZ3INx3-KA | rnb-soul | classic-soul | 81.19 | 84.60 | 81.57 | 81.75 | 73.40 | 78.25 | medium |
| 8 | Hoody feat. GRAY | Adios | 3JrDhzPoLkU | rnb-soul | k-rnb | 81.11 | 84.70 | 84.43 | 81.25 | 73.80 | 72.00 | medium |
| 9 | GSoul | Hate Everything | AW9jdH56MzM | rnb-soul | contemporary-rnb | 84.25 | 85.60 | 90.57 | 86.25 | 79.60 | 70.00 | low |
| 10 | Bill Withers | Ain't No Sunshine | YuKfiH0Scao | rnb-soul | classic-soul | 83.71 | 88.20 | 91.00 | 81.00 | 76.00 | 68.00 | low |
| 11 | Etta James | I'd Rather Go Blind | Bcus42ihkTI | rnb-soul | classic-soul | 83.49 | 86.60 | 86.43 | 83.50 | 81.40 | 72.75 | low |
| 12 | Joji | SLOW DANCING IN THE DARK | K3Qzzggn--s | rnb-soul | alt-rnb | 83.01 | 87.50 | 82.86 | 83.50 | 83.20 | 73.75 | low |
| 13 | Childish Gambino | Redbone | k49I5m1J6Is | rnb-soul | alt-rnb | 82.88 | 85.50 | 84.71 | 82.25 | 83.80 | 74.00 | low |
| 14 | Heize feat. Shin Yong Jae | You, Clouds, Rain | afxLaQiLu-o | rnb-soul | k-rnb | 82.32 | 84.80 | 88.00 | 82.25 | 74.20 | 71.50 | low |
| 15 | offonoff feat. Tablo & Miso | Cigarette | AamatUtxev4 | rnb-soul | alt-rnb | 82.27 | 86.00 | 86.00 | 76.75 | 85.40 | 70.75 | low |
| 16 | Ray Charles | Georgia On My Mind | ggGzE5KfCio | rnb-soul | classic-soul | 81.98 | 82.20 | 87.14 | 78.25 | 80.40 | 76.00 | low |
| 17 | Otis Redding | (Sittin' On) The Dock of the Bay | 7C-VscEQugk | rnb-soul | classic-soul | 81.61 | 83.80 | 87.29 | 78.75 | 77.80 | 71.25 | low |
| 18 | Colde | WA-R-R | mjVq7Ha_WtQ | rnb-soul | alt-rnb | 81.47 | 83.60 | 87.00 | 76.50 | 76.40 | 74.50 | low |
| 19 | The Righteous Brothers | Unchained Melody | Zv8czIoAw5w | rnb-soul | classic-soul | 81.44 | 82.00 | 88.86 | 75.75 | 78.00 | 73.50 | low |
| 20 | offonoff feat. DEAN | Gold | cgeijHtv0ic | rnb-soul | alt-rnb | 81.36 | 82.70 | 88.29 | 74.50 | 78.60 | 73.50 | low |

**YouTube watch URLs**

- https://www.youtube.com/watch?v=nL23IBHgyYk
- https://www.youtube.com/watch?v=pli44utBOwo
- https://www.youtube.com/watch?v=PjREBqcLHCo
- https://www.youtube.com/watch?v=Rf-ctwR7P-M
- https://www.youtube.com/watch?v=3ze6drtwiE4
- https://www.youtube.com/watch?v=uw_HR9jIJww
- https://www.youtube.com/watch?v=AUZ3INx3-KA
- https://www.youtube.com/watch?v=3JrDhzPoLkU
- https://www.youtube.com/watch?v=AW9jdH56MzM
- https://www.youtube.com/watch?v=YuKfiH0Scao
- https://www.youtube.com/watch?v=Bcus42ihkTI
- https://www.youtube.com/watch?v=K3Qzzggn--s
- https://www.youtube.com/watch?v=k49I5m1J6Is
- https://www.youtube.com/watch?v=afxLaQiLu-o
- https://www.youtube.com/watch?v=AamatUtxev4
- https://www.youtube.com/watch?v=ggGzE5KfCio
- https://www.youtube.com/watch?v=7C-VscEQugk
- https://www.youtube.com/watch?v=mjVq7Ha_WtQ
- https://www.youtube.com/watch?v=Zv8czIoAw5w
- https://www.youtube.com/watch?v=cgeijHtv0ic

PHOTO_FIT:
BEST_TRACKS:
WRONG_TRACKS:
MISSING_DIRECTION:
PLAYLIST_COHERENCE:
REPETITIVENESS:
NOTES:

---

## 3. 28ebe33dc58b3a9c88fe09467727db27.jpg

- **playlist_concept**: Afternoon Alley Pop
- **primary_lane_id**: sunny-stroll-pop
- **image analysis**: SCENE (confidence 1) — Outdoor street, Afternoon, Spring; mood: charming, nostalgic, peaceful; sensory: warm, breezy, floral.
- **primaryGenres**: pop
- **subgenres**: indie-pop, city-pop, soft-pop
- **eligible catalog count** (genre-filtered, before scoring): 226
- **scored candidate count** (CATALOG_CANDIDATE_POOL_SIZE): 30

**Final 20 tracks (sequenced order)**

| pos | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | pop | teen-pop | 87.58 | 86.40 | 93.86 | 85.00 | 81.20 | 84.25 | medium |
| 2 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | pop | city-pop | 87.58 | 90.70 | 93.00 | 87.00 | 74.20 | 80.00 | medium |
| 3 | RIIZE | Get A Guitar | iUw3LPM7OBU | pop | k-pop | 87.36 | 89.20 | 93.57 | 81.25 | 80.00 | 82.25 | medium |
| 4 | Anri | Windy Summer | uQ9nsr9YoCQ | pop | city-pop | 87.00 | 89.10 | 92.57 | 81.75 | 73.40 | 86.00 | medium |
| 5 | DORI | Thursday Taco Man | oyInMEY3Daw | pop | bedroom-pop | 86.97 | 87.30 | 92.86 | 88.25 | 78.00 | 79.25 | medium |
| 6 | a!ka | All Bark No Bite | r7cz6RMoMKM | pop | city-pop | 86.97 | 86.80 | 92.57 | 87.75 | 76.60 | 82.25 | medium |
| 7 | The Furthermores | Show Me How | 4j6kHKqDV1k | pop | indie-pop | 86.66 | 89.00 | 92.14 | 84.50 | 76.40 | 80.00 | medium |
| 8 | Toshiki Kadomatsu | Airport Lady | fLxQtcrzTlA | pop | city-pop | 86.64 | 89.20 | 94.29 | 82.50 | 68.80 | 82.25 | medium |
| 9 | KIRINJI feat. YonYon | Killer Tune Kills Me | Y36b8_WFejI | pop | city-pop | 86.45 | 87.00 | 93.57 | 88.00 | 76.00 | 76.50 | medium |
| 10 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | pop | city-pop | 86.39 | 85.80 | 92.00 | 87.00 | 76.60 | 82.25 | medium |
| 11 | Carly Rae Jepsen | Cut To The Feeling | Qlsu7RhOnsQ | pop | teen-pop | 85.73 | 86.70 | 91.86 | 85.50 | 79.80 | 75.75 | high |
| 12 | Young Gun Silver Fox | Just for Kicks | D0ivy-_PEIA | pop | city-pop | 86.07 | 90.00 | 92.71 | 79.50 | 72.20 | 80.75 | medium |
| 13 | Miki Matsubara | Stay With Me | QNYT9wVwQ8A | pop | city-pop | 86.05 | 87.80 | 94.14 | 83.50 | 79.20 | 73.50 | medium |
| 14 | Jung Kook feat. Jack Harlow | 3D | mHNCM-YALSA | pop | k-pop | 85.99 | 87.00 | 92.29 | 83.75 | 80.20 | 77.50 | medium |
| 15 | Steve Lacy | Bad Habit | VF-FGf_ZZiI | pop | bedroom-pop | 85.90 | 87.50 | 93.86 | 85.00 | 82.80 | 69.75 | medium |
| 16 | PREP | Cheapest Flight | rqvA7T5FUTQ | pop | city-pop | 86.02 | 92.40 | 94.86 | 78.50 | 70.80 | 73.25 | low |
| 17 | Sade | Smooth Operator | 4TYv2PhG89A | pop | city-pop | 85.89 | 89.50 | 90.57 | 82.75 | 73.40 | 80.75 | medium |
| 18 | Doja Cat | Say So | uAYG46w1SCA | pop | dance-pop | 85.86 | 86.30 | 93.00 | 85.50 | 75.80 | 77.75 | medium |
| 19 | Clairo | Amoeba | VR8ooa3G_5M | pop | bedroom-pop | 85.83 | 87.60 | 91.86 | 82.50 | 75.80 | 80.25 | medium |
| 20 | LANY | you! | UppBA4u9pyQ | pop | electropop | 85.74 | 87.80 | 90.86 | 81.00 | 78.80 | 80.75 | medium |

**YouTube watch URLs**

- https://www.youtube.com/watch?v=TOuzKcsWZaE
- https://www.youtube.com/watch?v=kVo0tv9am7U
- https://www.youtube.com/watch?v=iUw3LPM7OBU
- https://www.youtube.com/watch?v=uQ9nsr9YoCQ
- https://www.youtube.com/watch?v=oyInMEY3Daw
- https://www.youtube.com/watch?v=r7cz6RMoMKM
- https://www.youtube.com/watch?v=4j6kHKqDV1k
- https://www.youtube.com/watch?v=fLxQtcrzTlA
- https://www.youtube.com/watch?v=Y36b8_WFejI
- https://www.youtube.com/watch?v=ztlUuIR0Ab0
- https://www.youtube.com/watch?v=Qlsu7RhOnsQ
- https://www.youtube.com/watch?v=D0ivy-_PEIA
- https://www.youtube.com/watch?v=QNYT9wVwQ8A
- https://www.youtube.com/watch?v=mHNCM-YALSA
- https://www.youtube.com/watch?v=VF-FGf_ZZiI
- https://www.youtube.com/watch?v=rqvA7T5FUTQ
- https://www.youtube.com/watch?v=4TYv2PhG89A
- https://www.youtube.com/watch?v=uAYG46w1SCA
- https://www.youtube.com/watch?v=VR8ooa3G_5M
- https://www.youtube.com/watch?v=UppBA4u9pyQ

PHOTO_FIT:
BEST_TRACKS:
WRONG_TRACKS:
MISSING_DIRECTION:
PLAYLIST_COHERENCE:
REPETITIVENESS:
NOTES:

---

## 4. 402c17af72fc0eec89e1f5e3589de7bb.jpg

- **playlist_concept**: Rainy Alley Reveries
- **primary_lane_id**: k-indie-rainy-room
- **image analysis**: MIXED (confidence 0.95) — Outdoor (alley), Day, Autumn; mood: nostalgic, peaceful, melancholic; sensory: cool, rain, crisp.
- **primaryGenres**: folk-acoustic
- **subgenres**: singer-songwriter, indie-folk, americana
- **eligible catalog count** (genre-filtered, before scoring): 47
- **scored candidate count** (CATALOG_CANDIDATE_POOL_SIZE): 30

**Final 20 tracks (sequenced order)**

| pos | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | The Lumineers | Ophelia | pTOC_q0NLTk | folk-acoustic | folk-pop | 82.23 | 83.70 | 88.29 | 66.25 | 87.00 | 80.00 | medium |
| 2 | The Lumineers | Cleopatra | aN5s9N_pTUs | folk-acoustic | folk-pop | 79.16 | 79.40 | 90.43 | 62.25 | 76.60 | 74.75 | medium |
| 3 | The Head and the Heart | Lost in My Mind | is7rrC-jH_A | folk-acoustic | indie-folk | 78.85 | 78.30 | 91.00 | 61.50 | 79.20 | 72.75 | medium |
| 4 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | folk-acoustic | indie-folk | 78.84 | 77.50 | 92.71 | 60.25 | 84.60 | 68.50 | medium |
| 5 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 84.17 | 90.00 | 89.14 | 75.75 | 77.00 | 75.75 | low |
| 6 | The Gaslight Anthem | The '59 Sound | G1lq40tR72Q | folk-acoustic | americana | 79.70 | 79.10 | 87.29 | 70.25 | 82.20 | 73.50 | high |
| 7 | Rinko Nagai | 雨宿らず | dWd5mWQ_bpA | folk-acoustic | singer-songwriter | 83.74 | 85.70 | 91.00 | 72.25 | 69.20 | 86.50 | low |
| 8 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | folk-acoustic | singer-songwriter | 81.60 | 81.10 | 93.14 | 66.25 | 81.80 | 74.75 | low |
| 9 | José González | Heartbeats | ik_BQYbbZ5U | folk-acoustic | singer-songwriter | 81.26 | 83.00 | 92.71 | 60.75 | 85.60 | 72.50 | low |
| 10 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | folk-acoustic | indie-folk | 81.04 | 81.50 | 91.14 | 60.75 | 87.00 | 76.25 | low |
| 11 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | folk-acoustic | singer-songwriter | 80.78 | 80.50 | 92.29 | 65.25 | 83.20 | 72.25 | low |
| 12 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | folk-acoustic | singer-songwriter | 80.15 | 82.90 | 89.00 | 65.25 | 81.80 | 70.75 | low |
| 13 | Alexi Murdoch | Orange Sky | vy_Em1i9BAA | folk-acoustic | singer-songwriter | 79.66 | 78.20 | 92.29 | 58.75 | 83.40 | 75.75 | low |
| 14 | Raffy Bushman | Abraham | cJ3Pm-HpG_o | folk-acoustic | singer-songwriter | 79.62 | 81.70 | 89.00 | 69.50 | 72.20 | 71.75 | low |
| 15 | Bon Iver | Holocene | MjxA25Tj1Ks | folk-acoustic | indie-folk | 79.34 | 78.00 | 92.57 | 62.25 | 76.20 | 74.75 | low |
| 16 | Lord Huron | The Night We Met | KtlgYxa6BMU | folk-acoustic | cinematic-folk | 79.28 | 80.90 | 88.14 | 68.75 | 79.80 | 68.50 | low |
| 17 | Alexi Murdoch | All My Days | 5NFkFVe93NM | folk-acoustic | singer-songwriter | 79.13 | 77.00 | 91.29 | 62.75 | 80.60 | 74.50 | low |
| 18 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | folk-acoustic | singer-songwriter | 78.90 | 79.90 | 91.43 | 56.25 | 80.40 | 73.50 | low |
| 19 | strings & heart | evergreen love | QJBm_SE4fC0 | folk-acoustic | indie-folk | 78.77 | 79.40 | 91.86 | 66.25 | 71.40 | 68.75 | low |
| 20 | Sufjan Stevens | Mystery of Love | 4WTt69YO2VI | folk-acoustic | indie-folk | 78.41 | 82.00 | 87.43 | 61.25 | 74.80 | 72.75 | low |

**YouTube watch URLs**

- https://www.youtube.com/watch?v=pTOC_q0NLTk
- https://www.youtube.com/watch?v=aN5s9N_pTUs
- https://www.youtube.com/watch?v=is7rrC-jH_A
- https://www.youtube.com/watch?v=jwC06Izp1a8
- https://www.youtube.com/watch?v=dzoxC8dedXw
- https://www.youtube.com/watch?v=G1lq40tR72Q
- https://www.youtube.com/watch?v=dWd5mWQ_bpA
- https://www.youtube.com/watch?v=RGVmhrfQqzg
- https://www.youtube.com/watch?v=ik_BQYbbZ5U
- https://www.youtube.com/watch?v=yFTvbcNhEgc
- https://www.youtube.com/watch?v=lz2qpnRB5_E
- https://www.youtube.com/watch?v=JgumMOMHpns
- https://www.youtube.com/watch?v=vy_Em1i9BAA
- https://www.youtube.com/watch?v=cJ3Pm-HpG_o
- https://www.youtube.com/watch?v=MjxA25Tj1Ks
- https://www.youtube.com/watch?v=KtlgYxa6BMU
- https://www.youtube.com/watch?v=5NFkFVe93NM
- https://www.youtube.com/watch?v=Nd-A-iiPoLg
- https://www.youtube.com/watch?v=QJBm_SE4fC0
- https://www.youtube.com/watch?v=4WTt69YO2VI

PHOTO_FIT:
BEST_TRACKS:
WRONG_TRACKS:
MISSING_DIRECTION:
PLAYLIST_COHERENCE:
REPETITIVENESS:
NOTES:

---

## 5. 5d26f76472131c2904c9a2729e850a22.jpg

- **playlist_concept**: Golden Road at Dusk
- **primary_lane_id**: indie-road-movie
- **image analysis**: SCENE (confidence 0.98) — Outdoor, Evening, Autumn; mood: nostalgic, dreamy, liberating; sensory: warm, dry, still.
- **primaryGenres**: folk-acoustic, rock
- **subgenres**: indie-rock, americana, folk-pop
- **eligible catalog count** (genre-filtered, before scoring): 208
- **scored candidate count** (CATALOG_CANDIDATE_POOL_SIZE): 30

**Final 20 tracks (sequenced order)**

| pos | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | E:um | Today's Journey | I0eLBDc82Tk | folk-acoustic | indie-folk | 83.73 | 86.10 | 94.43 | 74.75 | 67.00 | 77.75 | medium |
| 2 | Cocteau Twins | Heaven or Las Vegas | 6KnYw4EwYGc | rock | dream-pop | 80.41 | 89.10 | 87.00 | 72.50 | 68.80 | 65.50 | medium |
| 3 | Jordan Lee | Love Ride | j7wBND-RyCM | folk-acoustic | indie-folk | 79.90 | 82.00 | 91.71 | 72.00 | 65.20 | 69.75 | medium |
| 4 | wave to earth | surf. | K45Ibt2xKj8 | rock | dream-pop | 78.55 | 82.00 | 84.14 | 70.00 | 65.40 | 77.75 | medium |
| 5 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | folk-acoustic | indie-folk | 78.55 | 84.60 | 83.00 | 69.00 | 76.40 | 68.50 | medium |
| 6 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | rock | indie-rock | 78.52 | 79.10 | 88.86 | 76.00 | 73.20 | 62.75 | medium |
| 7 | Gloria Tells | Climb Down From Your Pedestal | TxwAPQDErPw | folk-acoustic | singer-songwriter | 78.46 | 78.40 | 90.43 | 76.00 | 67.40 | 64.50 | medium |
| 8 | The Lumineers | Ophelia | pTOC_q0NLTk | folk-acoustic | folk-pop | 78.41 | 82.00 | 85.43 | 75.00 | 75.60 | 62.50 | medium |
| 9 | Travis | Why Does It Always Rain On Me? | PXatLOWjr-k | rock | britpop | 78.36 | 77.20 | 89.43 | 78.25 | 69.20 | 64.75 | medium |
| 10 | Weezer | Say It Ain't So | OoPHItnUFkw | rock | power-pop | 78.34 | 74.50 | 87.57 | 84.00 | 74.40 | 64.50 | medium |
| 11 | Lord Huron | Meet Me in the Woods | cYy7ljx7fyc | folk-acoustic | cinematic-folk | 78.15 | 84.70 | 86.29 | 69.25 | 75.80 | 59.25 | medium |
| 12 | The Lumineers | Cleopatra | aN5s9N_pTUs | folk-acoustic | folk-pop | 77.96 | 80.10 | 85.86 | 71.00 | 73.60 | 67.75 | medium |
| 13 | Keane | Somewhere Only We Know | Oextk-If8HQ | rock | britpop | 77.92 | 77.50 | 91.00 | 75.00 | 66.00 | 63.50 | medium |
| 14 | Vance Joy | Riptide | TL_oroU9eN8 | folk-acoustic | folk-pop | 77.79 | 83.50 | 87.29 | 64.75 | 69.00 | 66.25 | medium |
| 15 | Finn Askew | Aftertaste | HFQyMYzEoNo | folk-acoustic | singer-songwriter | 79.65 | 84.50 | 91.86 | 76.00 | 66.80 | 57.75 | low |
| 16 | Natalie Layne | Grateful For | W4XjEvvq7W8 | folk-acoustic | singer-songwriter | 79.31 | 83.30 | 90.43 | 74.50 | 67.20 | 62.00 | low |
| 17 | Penelope Road | Chance Encounter | G8NzCr3J1_w | folk-acoustic | indie-folk | 79.29 | 83.80 | 91.71 | 74.00 | 67.20 | 58.75 | low |
| 18 | strings & heart | evergreen love | QJBm_SE4fC0 | folk-acoustic | indie-folk | 78.82 | 84.10 | 86.71 | 72.50 | 67.60 | 66.25 | low |
| 19 | Alexi Murdoch | All My Days | 5NFkFVe93NM | folk-acoustic | singer-songwriter | 78.06 | 80.10 | 86.71 | 71.50 | 72.40 | 67.00 | low |
| 20 | The Vaniers | Milk & Honey | OMmz0ZgwvWk | folk-acoustic | singer-songwriter | 78.01 | 84.40 | 88.29 | 73.75 | 65.20 | 57.50 | low |

**YouTube watch URLs**

- https://www.youtube.com/watch?v=I0eLBDc82Tk
- https://www.youtube.com/watch?v=6KnYw4EwYGc
- https://www.youtube.com/watch?v=j7wBND-RyCM
- https://www.youtube.com/watch?v=K45Ibt2xKj8
- https://www.youtube.com/watch?v=jwC06Izp1a8
- https://www.youtube.com/watch?v=Bt0A59LsU4E
- https://www.youtube.com/watch?v=TxwAPQDErPw
- https://www.youtube.com/watch?v=pTOC_q0NLTk
- https://www.youtube.com/watch?v=PXatLOWjr-k
- https://www.youtube.com/watch?v=OoPHItnUFkw
- https://www.youtube.com/watch?v=cYy7ljx7fyc
- https://www.youtube.com/watch?v=aN5s9N_pTUs
- https://www.youtube.com/watch?v=Oextk-If8HQ
- https://www.youtube.com/watch?v=TL_oroU9eN8
- https://www.youtube.com/watch?v=HFQyMYzEoNo
- https://www.youtube.com/watch?v=W4XjEvvq7W8
- https://www.youtube.com/watch?v=G8NzCr3J1_w
- https://www.youtube.com/watch?v=QJBm_SE4fC0
- https://www.youtube.com/watch?v=5NFkFVe93NM
- https://www.youtube.com/watch?v=OMmz0ZgwvWk

PHOTO_FIT:
BEST_TRACKS:
WRONG_TRACKS:
MISSING_DIRECTION:
PLAYLIST_COHERENCE:
REPETITIVENESS:
NOTES:

---

## 6. 63124baa245a1133a63c9f6978f701ef.jpg

- **playlist_concept**: Streetside Dreams
- **primary_lane_id**: indie-road-movie
- **image analysis**: SCENE (confidence 0.98) — Outdoor city, Day, Autumn; mood: nostalgic, mysterious, dreamy; sensory: cool, damp earth, breezy; cultural context: Urban, Western architecture.
- **primaryGenres**: rock
- **subgenres**: indie-rock, britpop, alternative-rock
- **eligible catalog count** (genre-filtered, before scoring): 161
- **scored candidate count** (CATALOG_CANDIDATE_POOL_SIZE): 30

**Final 20 tracks (sequenced order)**

| pos | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | rock | indie-rock | 92.05 | 88.40 | 96.71 | 94.75 | 86.20 | 91.25 | medium |
| 2 | Oasis | Wonderwall | bx1Bh8ZvH84 | rock | britpop | 89.30 | 88.50 | 89.71 | 93.50 | 87.60 | 87.00 | medium |
| 3 | 잭킹콩 | Blur | Eqz5YPSJI_k | rock | k-indie-rock | 88.29 | 90.40 | 90.43 | 92.75 | 79.40 | 81.25 | medium |
| 4 | Phoebe Bridgers | Motion Sickness | 9sfYpolGCu8 | rock | indie-rock | 87.98 | 82.80 | 92.43 | 94.25 | 89.00 | 82.50 | medium |
| 5 | The Verve | Bitter Sweet Symphony | 1lyu1KKwC74 | rock | britpop | 87.89 | 86.10 | 89.29 | 90.75 | 91.00 | 83.75 | medium |
| 6 | The Verve | Lucky Man | MH6TJU0qWoY | rock | britpop | 87.84 | 87.10 | 88.00 | 94.50 | 91.00 | 80.25 | medium |
| 7 | NELL | 지구가 태양을 네 번 | g5cVE-i5wHI | rock | k-indie-rock | 87.70 | 85.80 | 89.71 | 92.50 | 87.20 | 83.00 | medium |
| 8 | Oasis | Champagne Supernova | tI-5uv4wryI | rock | britpop | 87.55 | 87.70 | 88.86 | 88.25 | 84.80 | 85.75 | medium |
| 9 | Keane | Everybody's Changing | Zx4Hjq6KwO0 | rock | britpop | 87.55 | 83.40 | 90.00 | 93.75 | 89.00 | 83.75 | medium |
| 10 | Band of Horses | The Funeral | cMFWFhTFohk | rock | indie-rock | 87.51 | 85.20 | 89.57 | 93.50 | 86.00 | 83.00 | medium |
| 11 | Oasis | Live Forever | TDe1DqxwJoc | rock | britpop | 87.41 | 86.10 | 87.71 | 93.50 | 86.00 | 84.25 | high |
| 12 | Interpol | Obstacle 1 | NwYKAsbx8SU | rock | alternative-rock | 87.05 | 84.80 | 88.71 | 90.00 | 86.00 | 86.00 | high |
| 13 | Keane | Somewhere Only We Know | Oextk-If8HQ | rock | britpop | 87.34 | 86.40 | 89.43 | 88.75 | 89.00 | 82.50 | medium |
| 14 | Travis | Why Does It Always Rain On Me? | PXatLOWjr-k | rock | britpop | 87.23 | 84.90 | 89.29 | 89.50 | 84.60 | 87.25 | medium |
| 15 | ASIAN KUNG-FU GENERATION | Solanin | xZD1B1TskXs | rock | j-rock | 87.18 | 85.40 | 92.14 | 89.00 | 84.20 | 81.00 | medium |
| 16 | The Shins | New Slang | kGpAMPS_t8U | rock | indie-rock | 88.52 | 84.30 | 90.86 | 96.25 | 89.40 | 84.00 | low |
| 17 | Snow Patrol | Chasing Cars | GemKqzILV4w | rock | britpop | 87.39 | 83.80 | 91.71 | 90.00 | 89.40 | 82.00 | low |
| 18 | Reliably Bad | Make It Out | WxMZCHZyeSE | rock | indie-rock | 87.18 | 83.60 | 90.00 | 87.75 | 89.60 | 86.50 | medium |
| 19 | Doves | There Goes The Fear | SneuvKIkM3A | rock | britpop | 87.11 | 84.10 | 87.29 | 93.25 | 92.20 | 83.25 | medium |
| 20 | Death Cab for Cutie | Cath... | uY1ahFCYT5k | rock | indie-rock | 86.99 | 87.10 | 83.57 | 96.25 | 88.60 | 83.25 | medium |

**YouTube watch URLs**

- https://www.youtube.com/watch?v=Bt0A59LsU4E
- https://www.youtube.com/watch?v=bx1Bh8ZvH84
- https://www.youtube.com/watch?v=Eqz5YPSJI_k
- https://www.youtube.com/watch?v=9sfYpolGCu8
- https://www.youtube.com/watch?v=1lyu1KKwC74
- https://www.youtube.com/watch?v=MH6TJU0qWoY
- https://www.youtube.com/watch?v=g5cVE-i5wHI
- https://www.youtube.com/watch?v=tI-5uv4wryI
- https://www.youtube.com/watch?v=Zx4Hjq6KwO0
- https://www.youtube.com/watch?v=cMFWFhTFohk
- https://www.youtube.com/watch?v=TDe1DqxwJoc
- https://www.youtube.com/watch?v=NwYKAsbx8SU
- https://www.youtube.com/watch?v=Oextk-If8HQ
- https://www.youtube.com/watch?v=PXatLOWjr-k
- https://www.youtube.com/watch?v=xZD1B1TskXs
- https://www.youtube.com/watch?v=kGpAMPS_t8U
- https://www.youtube.com/watch?v=GemKqzILV4w
- https://www.youtube.com/watch?v=WxMZCHZyeSE
- https://www.youtube.com/watch?v=SneuvKIkM3A
- https://www.youtube.com/watch?v=uY1ahFCYT5k

PHOTO_FIT:
BEST_TRACKS:
WRONG_TRACKS:
MISSING_DIRECTION:
PLAYLIST_COHERENCE:
REPETITIVENESS:
NOTES:

---

## 7. acadefe72ef776bdd8913a4b1df8aaab.jpg

- **playlist_concept**: Urban Night Groove
- **primary_lane_id**: city-pop-retro-glow
- **image analysis**: SCENE (confidence 1) — Outdoor, street market, Evening, Summer; mood: vibrant, social, energetic, lively; sensory: warm, aromatic street food, breezy; cultural context: Asian city market.
- **primaryGenres**: pop
- **subgenres**: city-pop, k-pop, j-pop
- **eligible catalog count** (genre-filtered, before scoring): 226
- **scored candidate count** (CATALOG_CANDIDATE_POOL_SIZE): 30

**Final 20 tracks (sequenced order)**

| pos | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | pop | city-pop | 87.92 | 92.00 | 92.14 | 82.00 | 76.60 | 84.75 | medium |
| 2 | a!ka | All Bark No Bite | r7cz6RMoMKM | pop | city-pop | 87.81 | 90.80 | 91.86 | 83.75 | 77.40 | 84.75 | medium |
| 3 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | pop | teen-pop | 87.23 | 90.80 | 88.86 | 83.50 | 78.00 | 86.75 | medium |
| 4 | Sade | Smooth Operator | 4TYv2PhG89A | pop | city-pop | 86.57 | 91.70 | 91.29 | 79.75 | 73.00 | 82.75 | medium |
| 5 | Rex Orange County feat. Benny Sings | Loving Is Easy | 39IU7ADaXmQ | pop | indie-pop | 86.51 | 88.80 | 91.14 | 78.50 | 79.60 | 85.25 | medium |
| 6 | Flume feat. Tove Lo | Say It | hZe5K1DN4ec | pop | electropop | 86.40 | 91.00 | 90.86 | 78.50 | 78.80 | 81.25 | medium |
| 7 | Anri | Windy Summer | uQ9nsr9YoCQ | pop | city-pop | 86.34 | 86.90 | 94.14 | 84.25 | 68.60 | 83.50 | medium |
| 8 | CORTIS | FaSHioN | 42wfEs7oIP8 | pop | k-pop | 86.32 | 92.60 | 89.43 | 79.25 | 76.00 | 81.50 | medium |
| 9 | Harry Styles | Late Night Talking | RwT77rlp2CE | pop | soft-pop | 86.31 | 90.00 | 92.14 | 80.00 | 75.20 | 81.00 | medium |
| 10 | Clairo | Amoeba | VR8ooa3G_5M | pop | bedroom-pop | 86.16 | 92.00 | 88.29 | 79.50 | 77.40 | 82.75 | medium |
| 11 | 외동아들 김승기 | SNL | LSrHTs2gd9Y | pop | dance-pop | 87.10 | 89.50 | 92.43 | 83.00 | 77.00 | 82.50 | high |
| 12 | Shawn Mendes | There's Nothing Holdin' Me Back | dT2owtxkU8k | pop | soft-pop | 86.85 | 88.60 | 95.00 | 78.75 | 78.80 | 80.50 | high |
| 13 | Calvin Harris | Summer | ebXbLfLACGM | pop | dance-pop | 85.99 | 90.30 | 89.71 | 78.50 | 81.40 | 80.50 | high |
| 14 | Harry Styles | Watermelon Sugar | E07s5ZYygMg | pop | soft-pop | 85.87 | 89.60 | 94.71 | 75.00 | 77.40 | 77.25 | high |
| 15 | Troye Sivan | Rush | Vih7BTyVcj4 | pop | electropop | 85.85 | 88.00 | 92.86 | 80.50 | 74.40 | 80.50 | high |
| 16 | khai dreams | Sunkissed | EO_i9nHvCEk | pop | indie-pop | 85.95 | 90.10 | 91.14 | 77.50 | 81.40 | 78.75 | medium |
| 17 | Bronze feat. Yukika | Orange Road | Uoutn3GVHqs | pop | city-pop | 85.88 | 91.60 | 88.00 | 80.75 | 74.80 | 82.75 | medium |
| 18 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | pop | city-pop | 85.72 | 88.10 | 91.14 | 80.50 | 75.00 | 82.50 | medium |
| 19 | MAKTUB feat. Lee Raon | To You My Light | kNYA3H1jSSs | pop | k-pop | 85.62 | 87.40 | 91.71 | 79.50 | 76.20 | 82.25 | medium |
| 20 | Katy Perry feat. Snoop Dogg | California Gurls | F57P9C4SAW4 | pop | dance-pop | 85.66 | 88.60 | 91.86 | 79.00 | 76.00 | 80.50 | high |

**YouTube watch URLs**

- https://www.youtube.com/watch?v=ztlUuIR0Ab0
- https://www.youtube.com/watch?v=r7cz6RMoMKM
- https://www.youtube.com/watch?v=TOuzKcsWZaE
- https://www.youtube.com/watch?v=4TYv2PhG89A
- https://www.youtube.com/watch?v=39IU7ADaXmQ
- https://www.youtube.com/watch?v=hZe5K1DN4ec
- https://www.youtube.com/watch?v=uQ9nsr9YoCQ
- https://www.youtube.com/watch?v=42wfEs7oIP8
- https://www.youtube.com/watch?v=RwT77rlp2CE
- https://www.youtube.com/watch?v=VR8ooa3G_5M
- https://www.youtube.com/watch?v=LSrHTs2gd9Y
- https://www.youtube.com/watch?v=dT2owtxkU8k
- https://www.youtube.com/watch?v=ebXbLfLACGM
- https://www.youtube.com/watch?v=E07s5ZYygMg
- https://www.youtube.com/watch?v=Vih7BTyVcj4
- https://www.youtube.com/watch?v=EO_i9nHvCEk
- https://www.youtube.com/watch?v=Uoutn3GVHqs
- https://www.youtube.com/watch?v=kVo0tv9am7U
- https://www.youtube.com/watch?v=kNYA3H1jSSs
- https://www.youtube.com/watch?v=F57P9C4SAW4

PHOTO_FIT:
BEST_TRACKS:
WRONG_TRACKS:
MISSING_DIRECTION:
PLAYLIST_COHERENCE:
REPETITIVENESS:
NOTES:

---

## Images that did not complete (real OpenAI-side failures across 3 attempts, not re-attempted further)

| filename | error category |
|---|---|
| 02066cb88c44980a81e5f04ef2150af5.jpg | json_parse_or_lane_invalid |
| 46c4e1d11c241e35871c1c4661a8ef9f.jpg | openai_request_failed |
| a716b5df798161f7a5c77ed701b8fc1b.jpg | openai_request_failed |
| aa14821f6828dd6f63cf1fcc74050a29.jpg | openai_request_failed |
| d37e4abbcb1fb66e75e1254e0ed5ccec.jpg | openai_request_failed |
