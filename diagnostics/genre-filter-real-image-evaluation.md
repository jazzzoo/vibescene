# VibeScene Music Engine — Step 5-C Real-Image Evaluation

Generated: 2026-08-06T05:23:54.506Z  
Repository HEAD: 305828e  
Model: gpt-4o

## Execution summary

- Images attempted: 12 | succeeded: 7 | failed: 5
- Total requests: not individually observable via the remote endpoint; expected 12-24 hosted OpenAI calls

## Source image inventory

| filename | bytes | dimensions | sha256 (prefix) |
|---|---|---|---|
| 02066cb88c44980a81e5f04ef2150af5.jpg | 144968 | 686x1200 | a76f36217d709dcb... |
| 050e0c11047a97bc23cbd3be7458e6c7.jpg | 119052 | 736x1104 | 48ee16b96bb140b8... |
| 0ea78a4ffc3af667e68e52ea29867a9b.jpg | 83931 | 675x1200 | 6d7f6762392cc9eb... |
| 28ebe33dc58b3a9c88fe09467727db27.jpg | 243840 | 736x1104 | b02cf19e33579274... |
| 402c17af72fc0eec89e1f5e3589de7bb.jpg | 155754 | 673x1200 | a34e97c93a886c32... |
| 46c4e1d11c241e35871c1c4661a8ef9f.jpg | 105710 | 1080x1618 | 2bc800d69d459d96... |
| 5d26f76472131c2904c9a2729e850a22.jpg | 122513 | 736x1104 | 3de917573337c34f... |
| 63124baa245a1133a63c9f6978f701ef.jpg | 186266 | 736x1308 | f5de1d1bc868d2ed... |
| a716b5df798161f7a5c77ed701b8fc1b.jpg | 73670 | 736x1308 | b545d173e8ae1f03... |
| aa14821f6828dd6f63cf1fcc74050a29.jpg | 158737 | 736x1308 | cbc659d054ef6f95... |
| acadefe72ef776bdd8913a4b1df8aaab.jpg | 94221 | 736x1104 | 685a52aa0104d4c5... |
| d37e4abbcb1fb66e75e1254e0ed5ccec.jpg | 286744 | 1080x1920 | fe2ac518a3f85289... |

## Per-image results


### 050e0c11047a97bc23cbd3be7458e6c7.jpg

- lane: lofi-bedroom-solitude | image_type: SCENE | confidence: 0.95
- playlist_concept: Snowy Evening Quietude
- targetStats: brightness=40 warmth=30 openness=70 motion=10 intimacy=60 socialEnergy=10 tension=20 nostalgia=80 playfulness=20 dreaminess=70 energy=20 groove=10 density=30 acousticness=80 electronicness=10 vocalPresence=60 climaxIntensity=20
- contextAffinity: spring=20 summer=10 autumn=30 winter=90 morning=20 day=30 dusk=60 night=40 lateNight=30 clear=30 cloudy=60 rain=10 snow=90

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 82.42 | 86 | 88.57 | 69.25 | 89 | 71.75 |
| 2 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | folk-acoustic | indie-folk | 81.67 | 85.9 | 91.14 | 67.25 | 83.8 | 67.25 |
| 3 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | folk-acoustic | singer-songwriter | 81.07 | 84.7 | 92.29 | 66.25 | 83.2 | 64.75 |
| 4 | José González | Heartbeats | ik_BQYbbZ5U | folk-acoustic | singer-songwriter | 80.85 | 84 | 90.71 | 68.75 | 86 | 63.5 |
| 5 | Rinko Nagai | 雨宿らず | dWd5mWQ_bpA | folk-acoustic | singer-songwriter | 80.05 | 84.1 | 88.14 | 66.75 | 82.4 | 67.5 |
| 6 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | folk-acoustic | singer-songwriter | 79.63 | 81.7 | 89 | 68.75 | 80.2 | 67.25 |
| 7 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | folk-acoustic | singer-songwriter | 78.72 | 82.1 | 91.71 | 65.75 | 81.6 | 57 |
| 8 | Alexi Murdoch | All My Days | 5NFkFVe93NM | folk-acoustic | singer-songwriter | 78.29 | 77.2 | 91.29 | 66.75 | 85.8 | 61 |
| 9 | Raffy Bushman | Abraham | cJ3Pm-HpG_o | folk-acoustic | singer-songwriter | 78.09 | 81.7 | 86.14 | 64 | 79 | 68.25 |
| 10 | Lord Huron | The Night We Met | KtlgYxa6BMU | folk-acoustic | cinematic-folk | 77.84 | 86.3 | 86.71 | 62.25 | 79 | 58 |
| 11 | The Lumineers | Ophelia | pTOC_q0NLTk | folk-acoustic | folk-pop | 77.71 | 82.7 | 88.29 | 60.75 | 83.8 | 59.5 |
| 12 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | folk-acoustic | singer-songwriter | 77.64 | 82.5 | 90.29 | 62.75 | 75.8 | 58.75 |
| 13 | strings & heart | evergreen love | QJBm_SE4fC0 | folk-acoustic | indie-folk | 77.63 | 80.8 | 89 | 58.75 | 79.4 | 66.25 |
| 14 | Vance Joy | Riptide | TL_oroU9eN8 | folk-acoustic | folk-pop | 77.61 | 80.6 | 84.71 | 68 | 84 | 62.75 |
| 15 | The Gaslight Anthem | The '59 Sound | G1lq40tR72Q | folk-acoustic | americana | 77.44 | 82.1 | 84.43 | 63.25 | 86.2 | 62.5 |
| 16 | Jack Johnson | Banana Pancakes | YdgoG8hTMUw | folk-acoustic | singer-songwriter | 77.35 | 77.3 | 91.43 | 65.75 | 86.6 | 54.75 |
| 17 | Sufjan Stevens | Mystery of Love | 4WTt69YO2VI | folk-acoustic | indie-folk | 77.3 | 80.2 | 87.43 | 66.25 | 79.6 | 60.75 |
| 18 | Bon Iver | Holocene | MjxA25Tj1Ks | folk-acoustic | indie-folk | 77.26 | 79 | 90 | 61.75 | 82.6 | 60.25 |
| 19 | The Lumineers | Cleopatra | aN5s9N_pTUs | folk-acoustic | folk-pop | 77.13 | 78.2 | 90.43 | 64.25 | 85.4 | 55.75 |
| 20 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | folk-acoustic | indie-folk | 76.84 | 79.7 | 90.43 | 62.75 | 80.6 | 55.5 |
| 21 | Lord Huron | Meet Me in the Woods | cYy7ljx7fyc | folk-acoustic | cinematic-folk | 76.67 | 78.4 | 86.29 | 59.5 | 84 | 66.25 |
| 22 | Alexi Murdoch | Orange Sky | vy_Em1i9BAA | folk-acoustic | singer-songwriter | 76.09 | 80.2 | 89.43 | 55.75 | 87 | 54.25 |
| 23 | José González | Stay Alive | NucJk8TxyRg | folk-acoustic | singer-songwriter | 76.06 | 78.7 | 86 | 61.75 | 85 | 59.25 |
| 24 | Jack Johnson | Better Together | fqxNYjDFJUk | folk-acoustic | singer-songwriter | 75.91 | 75.2 | 91.86 | 63.5 | 80.2 | 55 |
| 25 | The Vaniers | Milk & Honey | OMmz0ZgwvWk | folk-acoustic | singer-songwriter | 75.7 | 78.5 | 84.86 | 57.5 | 79.4 | 67.5 |
| 26 | The Head and the Heart | Lost in My Mind | is7rrC-jH_A | folk-acoustic | indie-folk | 75.45 | 78.1 | 89.57 | 57.5 | 81.6 | 55.75 |
| 27 | Lord Huron | Ends of the Earth | -MH-UmYkXiM | folk-acoustic | cinematic-folk | 75.32 | 79.4 | 85.29 | 58.75 | 81 | 60 |
| 28 | Gregory Alan Isakov | The Stable Song | jGDjO9kuKyY | folk-acoustic | singer-songwriter | 74.68 | 77.8 | 87.86 | 59.5 | 82.6 | 52 |
| 29 | Penelope Road | Chance Encounter | G8NzCr3J1_w | folk-acoustic | indie-folk | 73.8 | 78.7 | 79.71 | 56.25 | 79 | 66.25 |
| 30 | Finn Askew | Aftertaste | HFQyMYzEoNo | folk-acoustic | singer-songwriter | 73.68 | 78 | 79 | 57.75 | 79.8 | 66.25 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 11 | The Lumineers | Ophelia | pTOC_q0NLTk | medium |
| 2 | 14 | Vance Joy | Riptide | TL_oroU9eN8 | medium |
| 3 | 19 | The Lumineers | Cleopatra | aN5s9N_pTUs | medium |
| 4 | 20 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | medium |
| 5 | 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | low |
| 6 | 15 | The Gaslight Anthem | The '59 Sound | G1lq40tR72Q | high |
| 7 | 2 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | low |
| 8 | 3 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | low |
| 9 | 4 | José González | Heartbeats | ik_BQYbbZ5U | low |
| 10 | 5 | Rinko Nagai | 雨宿らず | dWd5mWQ_bpA | low |
| 11 | 6 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | low |
| 12 | 7 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | low |
| 13 | 8 | Alexi Murdoch | All My Days | 5NFkFVe93NM | low |
| 14 | 9 | Raffy Bushman | Abraham | cJ3Pm-HpG_o | low |
| 15 | 10 | Lord Huron | The Night We Met | KtlgYxa6BMU | low |
| 16 | 12 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | low |
| 17 | 13 | strings & heart | evergreen love | QJBm_SE4fC0 | low |
| 18 | 16 | Jack Johnson | Banana Pancakes | YdgoG8hTMUw | low |
| 19 | 17 | Sufjan Stevens | Mystery of Love | 4WTt69YO2VI | low |
| 20 | 18 | Bon Iver | Holocene | MjxA25Tj1Ks | low |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### 0ea78a4ffc3af667e68e52ea29867a9b.jpg

- lane: k-rnb-night-drive | image_type: SCENE | confidence: 0.95
- playlist_concept: Neon Reflections
- targetStats: brightness=20 warmth=45 openness=50 motion=10 intimacy=70 socialEnergy=20 tension=30 nostalgia=60 playfulness=10 dreaminess=50 energy=20 groove=40 density=30 acousticness=50 electronicness=60 vocalPresence=60 climaxIntensity=30
- contextAffinity: spring=20 summer=10 autumn=60 winter=50 morning=10 day=5 dusk=30 night=80 lateNight=60 clear=30 cloudy=40 rain=20 snow=10

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | GSoul | Hate Everything | AW9jdH56MzM | rnb-soul | contemporary-rnb | 84.25 | 85.6 | 90.57 | 86.25 | 79.6 | 70 |
| 2 | Bill Withers | Ain't No Sunshine | YuKfiH0Scao | rnb-soul | classic-soul | 83.71 | 88.2 | 91 | 81 | 76 | 68 |
| 3 | Jiselle feat. CHANGMO | LANGUAGE | nL23IBHgyYk | rnb-soul | alt-rnb | 83.58 | 86.3 | 86.29 | 84.5 | 78.4 | 75.25 |
| 4 | Etta James | I'd Rather Go Blind | Bcus42ihkTI | rnb-soul | classic-soul | 83.49 | 86.6 | 86.43 | 83.5 | 81.4 | 72.75 |
| 5 | Joji | SLOW DANCING IN THE DARK | K3Qzzggn--s | rnb-soul | alt-rnb | 83.01 | 87.5 | 82.86 | 83.5 | 83.2 | 73.75 |
| 6 | Otis Redding | Try a Little Tenderness | pli44utBOwo | rnb-soul | classic-soul | 82.96 | 85.9 | 83.71 | 80.25 | 77.8 | 81.75 |
| 7 | Childish Gambino | Redbone | k49I5m1J6Is | rnb-soul | alt-rnb | 82.88 | 85.5 | 84.71 | 82.25 | 83.8 | 74 |
| 8 | 채옐 | He's Something | PjREBqcLHCo | rnb-soul | k-rnb | 82.78 | 84.6 | 82.57 | 80.5 | 81.4 | 82.75 |
| 9 | Heize feat. Shin Yong Jae | You, Clouds, Rain | afxLaQiLu-o | rnb-soul | k-rnb | 82.32 | 84.8 | 88 | 82.25 | 74.2 | 71.5 |
| 10 | offonoff feat. Tablo & Miso | Cigarette | AamatUtxev4 | rnb-soul | alt-rnb | 82.27 | 86 | 86 | 76.75 | 85.4 | 70.75 |
| 11 | Ray Charles | Georgia On My Mind | ggGzE5KfCio | rnb-soul | classic-soul | 81.98 | 82.2 | 87.14 | 78.25 | 80.4 | 76 |
| 12 | Colde | Control Me | Rf-ctwR7P-M | rnb-soul | alt-rnb | 81.78 | 85.4 | 80.29 | 85.5 | 79.6 | 75.25 |
| 13 | Otis Redding | (Sittin' On) The Dock of the Bay | 7C-VscEQugk | rnb-soul | classic-soul | 81.61 | 83.8 | 87.29 | 78.75 | 77.8 | 71.25 |
| 14 | Colde | WA-R-R | mjVq7Ha_WtQ | rnb-soul | alt-rnb | 81.47 | 83.6 | 87 | 76.5 | 76.4 | 74.5 |
| 15 | The Righteous Brothers | Unchained Melody | Zv8czIoAw5w | rnb-soul | classic-soul | 81.44 | 82 | 88.86 | 75.75 | 78 | 73.5 |
| 16 | DEAN | Bonnie & Clyde | 3ze6drtwiE4 | rnb-soul | alt-rnb | 81.41 | 82.9 | 84.57 | 81.75 | 79.2 | 73.25 |
| 17 | offonoff feat. DEAN | Gold | cgeijHtv0ic | rnb-soul | alt-rnb | 81.36 | 82.7 | 88.29 | 74.5 | 78.6 | 73.5 |
| 18 | Heize feat. Gaeko | Jenga | uw_HR9jIJww | rnb-soul | k-rnb | 81.27 | 86.1 | 83 | 77.75 | 83 | 70.5 |
| 19 | Four Tops | Reach Out I'll Be There | AUZ3INx3-KA | rnb-soul | classic-soul | 81.19 | 84.6 | 81.57 | 81.75 | 73.4 | 78.25 |
| 20 | Hoody feat. GRAY | Adios | 3JrDhzPoLkU | rnb-soul | k-rnb | 81.11 | 84.7 | 84.43 | 81.25 | 73.8 | 72 |
| 21 | BIBI | SHE GOT IT | lcEtCd4I8DE | rnb-soul | k-rnb | 81.08 | 83 | 82.43 | 81.75 | 75.6 | 77.5 |
| 22 | Zion.T feat. G-DRAGON | Complex | vLzgATepxzg | rnb-soul | k-rnb | 81.05 | 84 | 85.14 | 76.25 | 81.8 | 71.25 |
| 23 | Hoody | Like You | JaSIPgnclCU | rnb-soul | k-rnb | 81.03 | 80.4 | 88.71 | 72.75 | 77.6 | 77.5 |
| 24 | Crush | Sofa | cb6RNAkQU5g | rnb-soul | k-rnb | 80.99 | 85 | 88 | 77.25 | 79.4 | 63.75 |
| 25 | Aretha Franklin | (You Make Me Feel Like) A Natural Woman | 8jCFzreP1ng | rnb-soul | classic-soul | 80.98 | 83.4 | 82.43 | 76 | 77.2 | 80.75 |
| 26 | Ray Charles | Hit The Road Jack | uSiHqxgE2d0 | rnb-soul | classic-soul | 80.89 | 81.1 | 84.29 | 80.25 | 80.6 | 74.5 |
| 27 | Erykah Badu | On & On | TW28iWV7nxE | rnb-soul | neo-soul | 80.8 | 83.5 | 84.86 | 74 | 74.2 | 78.5 |
| 28 | Heize feat. DEAN & DJ Friz | And July | rCeM57e2BfU | rnb-soul | k-rnb | 80.74 | 85.2 | 81.71 | 79.5 | 82.4 | 70 |
| 29 | The Supremes | You Can't Hurry Love | ovoBi3pXD_A | rnb-soul | motown-soul | 80.7 | 79.1 | 85 | 78.25 | 78.8 | 79 |
| 30 | Jungle | Busy Earnin' | BcsfftwLUf0 | rnb-soul | neo-soul | 80.61 | 86.7 | 80.57 | 78.5 | 77.8 | 72.5 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 3 | Jiselle feat. CHANGMO | LANGUAGE | nL23IBHgyYk | medium |
| 2 | 6 | Otis Redding | Try a Little Tenderness | pli44utBOwo | medium |
| 3 | 8 | 채옐 | He's Something | PjREBqcLHCo | medium |
| 4 | 12 | Colde | Control Me | Rf-ctwR7P-M | medium |
| 5 | 16 | DEAN | Bonnie & Clyde | 3ze6drtwiE4 | medium |
| 6 | 18 | Heize feat. Gaeko | Jenga | uw_HR9jIJww | medium |
| 7 | 19 | Four Tops | Reach Out I'll Be There | AUZ3INx3-KA | medium |
| 8 | 20 | Hoody feat. GRAY | Adios | 3JrDhzPoLkU | medium |
| 9 | 1 | GSoul | Hate Everything | AW9jdH56MzM | low |
| 10 | 2 | Bill Withers | Ain't No Sunshine | YuKfiH0Scao | low |
| 11 | 4 | Etta James | I'd Rather Go Blind | Bcus42ihkTI | low |
| 12 | 5 | Joji | SLOW DANCING IN THE DARK | K3Qzzggn--s | low |
| 13 | 7 | Childish Gambino | Redbone | k49I5m1J6Is | low |
| 14 | 9 | Heize feat. Shin Yong Jae | You, Clouds, Rain | afxLaQiLu-o | low |
| 15 | 10 | offonoff feat. Tablo & Miso | Cigarette | AamatUtxev4 | low |
| 16 | 11 | Ray Charles | Georgia On My Mind | ggGzE5KfCio | low |
| 17 | 13 | Otis Redding | (Sittin' On) The Dock of the Bay | 7C-VscEQugk | low |
| 18 | 14 | Colde | WA-R-R | mjVq7Ha_WtQ | low |
| 19 | 15 | The Righteous Brothers | Unchained Melody | Zv8czIoAw5w | low |
| 20 | 17 | offonoff feat. DEAN | Gold | cgeijHtv0ic | low |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### 28ebe33dc58b3a9c88fe09467727db27.jpg

- lane: sunny-stroll-pop | image_type: SCENE | confidence: 1
- playlist_concept: Afternoon Alley Pop
- targetStats: brightness=70 warmth=80 openness=60 motion=30 intimacy=40 socialEnergy=40 tension=20 nostalgia=60 playfulness=50 dreaminess=40 energy=50 groove=60 density=50 acousticness=30 electronicness=50 vocalPresence=70 climaxIntensity=40
- contextAffinity: spring=60 summer=50 autumn=30 winter=10 morning=40 day=80 dusk=30 night=10 lateNight=0 clear=80 cloudy=20 rain=10 snow=0

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | pop | teen-pop | 87.58 | 86.4 | 93.86 | 85 | 81.2 | 84.25 |
| 2 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | pop | city-pop | 87.58 | 90.7 | 93 | 87 | 74.2 | 80 |
| 3 | RIIZE | Get A Guitar | iUw3LPM7OBU | pop | k-pop | 87.36 | 89.2 | 93.57 | 81.25 | 80 | 82.25 |
| 4 | Anri | Windy Summer | uQ9nsr9YoCQ | pop | city-pop | 87 | 89.1 | 92.57 | 81.75 | 73.4 | 86 |
| 5 | DORI | Thursday Taco Man | oyInMEY3Daw | pop | bedroom-pop | 86.97 | 87.3 | 92.86 | 88.25 | 78 | 79.25 |
| 6 | a!ka | All Bark No Bite | r7cz6RMoMKM | pop | city-pop | 86.97 | 86.8 | 92.57 | 87.75 | 76.6 | 82.25 |
| 7 | The Furthermores | Show Me How | 4j6kHKqDV1k | pop | indie-pop | 86.66 | 89 | 92.14 | 84.5 | 76.4 | 80 |
| 8 | Toshiki Kadomatsu | Airport Lady | fLxQtcrzTlA | pop | city-pop | 86.64 | 89.2 | 94.29 | 82.5 | 68.8 | 82.25 |
| 9 | KIRINJI feat. YonYon | Killer Tune Kills Me | Y36b8_WFejI | pop | city-pop | 86.45 | 87 | 93.57 | 88 | 76 | 76.5 |
| 10 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | pop | city-pop | 86.39 | 85.8 | 92 | 87 | 76.6 | 82.25 |
| 11 | Young Gun Silver Fox | Just for Kicks | D0ivy-_PEIA | pop | city-pop | 86.07 | 90 | 92.71 | 79.5 | 72.2 | 80.75 |
| 12 | Miki Matsubara | Stay With Me | QNYT9wVwQ8A | pop | city-pop | 86.05 | 87.8 | 94.14 | 83.5 | 79.2 | 73.5 |
| 13 | PREP | Cheapest Flight | rqvA7T5FUTQ | pop | city-pop | 86.02 | 92.4 | 94.86 | 78.5 | 70.8 | 73.25 |
| 14 | Jung Kook feat. Jack Harlow | 3D | mHNCM-YALSA | pop | k-pop | 85.99 | 87 | 92.29 | 83.75 | 80.2 | 77.5 |
| 15 | Steve Lacy | Bad Habit | VF-FGf_ZZiI | pop | bedroom-pop | 85.9 | 87.5 | 93.86 | 85 | 82.8 | 69.75 |
| 16 | Sade | Smooth Operator | 4TYv2PhG89A | pop | city-pop | 85.89 | 89.5 | 90.57 | 82.75 | 73.4 | 80.75 |
| 17 | Doja Cat | Say So | uAYG46w1SCA | pop | dance-pop | 85.86 | 86.3 | 93 | 85.5 | 75.8 | 77.75 |
| 18 | Clairo | Amoeba | VR8ooa3G_5M | pop | bedroom-pop | 85.83 | 87.6 | 91.86 | 82.5 | 75.8 | 80.25 |
| 19 | LANY | you! | UppBA4u9pyQ | pop | electropop | 85.74 | 87.8 | 90.86 | 81 | 78.8 | 80.75 |
| 20 | Carly Rae Jepsen | Cut To The Feeling | Qlsu7RhOnsQ | pop | teen-pop | 85.73 | 86.7 | 91.86 | 85.5 | 79.8 | 75.75 |
| 21 | Eyedi | Caffeine | ZLjs8rfejcU | pop | city-pop | 85.71 | 90.4 | 91.57 | 82 | 71.2 | 78 |
| 22 | Flume feat. Tove Lo | Say It | hZe5K1DN4ec | pop | electropop | 85.64 | 85.2 | 90.71 | 84 | 80.8 | 81.25 |
| 23 | Hiroshi Sato | You're My Baby | H45Z0KuRDk4 | pop | city-pop | 85.59 | 91.1 | 92.29 | 77 | 73.2 | 78 |
| 24 | Young Gun Silver Fox | Winner | cYjb-vpl9Ow | pop | city-pop | 85.58 | 88.5 | 90.86 | 79.5 | 73.6 | 83.25 |
| 25 | Stella Jang | Colors | CRHPclhtlN0 | pop | indie-pop | 85.55 | 82.4 | 95.14 | 81.5 | 74.6 | 84 |
| 26 | Vaundy | Tokyo Flash | SIuF37EWaLU | pop | j-pop | 85.51 | 88.1 | 95.14 | 83.25 | 73.2 | 71.5 |
| 27 | 외동아들 김승기 | 여튼 | mhzO0YLO5QQ | pop | dance-pop | 85.47 | 84.2 | 94.71 | 86.25 | 75 | 75.75 |
| 28 | Meiko Nakahara | Fantasy | 2Kt8HP1VEPU | pop | city-pop | 85.42 | 87.3 | 91.86 | 82.75 | 78.6 | 76 |
| 29 | Daft Punk feat. Julian Casablancas | Instant Crush | a5uQMwRMHcs | pop | electropop | 85.36 | 88.1 | 92.57 | 85.75 | 74.2 | 72.5 |
| 30 | Jakubi | Couch Potato | uX8yoT9ct6k | pop | indie-pop | 85.31 | 89.7 | 92.29 | 79 | 72.4 | 77.5 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 1 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | medium |
| 2 | 2 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | medium |
| 3 | 3 | RIIZE | Get A Guitar | iUw3LPM7OBU | medium |
| 4 | 4 | Anri | Windy Summer | uQ9nsr9YoCQ | medium |
| 5 | 5 | DORI | Thursday Taco Man | oyInMEY3Daw | medium |
| 6 | 6 | a!ka | All Bark No Bite | r7cz6RMoMKM | medium |
| 7 | 7 | The Furthermores | Show Me How | 4j6kHKqDV1k | medium |
| 8 | 8 | Toshiki Kadomatsu | Airport Lady | fLxQtcrzTlA | medium |
| 9 | 9 | KIRINJI feat. YonYon | Killer Tune Kills Me | Y36b8_WFejI | medium |
| 10 | 10 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | medium |
| 11 | 20 | Carly Rae Jepsen | Cut To The Feeling | Qlsu7RhOnsQ | high |
| 12 | 11 | Young Gun Silver Fox | Just for Kicks | D0ivy-_PEIA | medium |
| 13 | 12 | Miki Matsubara | Stay With Me | QNYT9wVwQ8A | medium |
| 14 | 14 | Jung Kook feat. Jack Harlow | 3D | mHNCM-YALSA | medium |
| 15 | 15 | Steve Lacy | Bad Habit | VF-FGf_ZZiI | medium |
| 16 | 13 | PREP | Cheapest Flight | rqvA7T5FUTQ | low |
| 17 | 16 | Sade | Smooth Operator | 4TYv2PhG89A | medium |
| 18 | 17 | Doja Cat | Say So | uAYG46w1SCA | medium |
| 19 | 18 | Clairo | Amoeba | VR8ooa3G_5M | medium |
| 20 | 19 | LANY | you! | UppBA4u9pyQ | medium |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### 402c17af72fc0eec89e1f5e3589de7bb.jpg

- lane: k-indie-rainy-room | image_type: MIXED | confidence: 0.95
- playlist_concept: Rainy Alley Reveries
- targetStats: brightness=40 warmth=30 openness=20 motion=10 intimacy=60 socialEnergy=20 tension=30 nostalgia=70 playfulness=20 dreaminess=60 energy=20 groove=20 density=30 acousticness=80 electronicness=10 vocalPresence=70 climaxIntensity=20
- contextAffinity: spring=20 summer=10 autumn=90 winter=40 morning=20 day=80 dusk=50 night=30 lateNight=10 clear=30 cloudy=70 rain=100 snow=20

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 84.17 | 90 | 89.14 | 75.75 | 77 | 75.75 |
| 2 | Rinko Nagai | 雨宿らず | dWd5mWQ_bpA | folk-acoustic | singer-songwriter | 83.74 | 85.7 | 91 | 72.25 | 69.2 | 86.5 |
| 3 | The Lumineers | Ophelia | pTOC_q0NLTk | folk-acoustic | folk-pop | 82.23 | 83.7 | 88.29 | 66.25 | 87 | 80 |
| 4 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | folk-acoustic | singer-songwriter | 81.6 | 81.1 | 93.14 | 66.25 | 81.8 | 74.75 |
| 5 | José González | Heartbeats | ik_BQYbbZ5U | folk-acoustic | singer-songwriter | 81.26 | 83 | 92.71 | 60.75 | 85.6 | 72.5 |
| 6 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | folk-acoustic | indie-folk | 81.04 | 81.5 | 91.14 | 60.75 | 87 | 76.25 |
| 7 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | folk-acoustic | singer-songwriter | 80.78 | 80.5 | 92.29 | 65.25 | 83.2 | 72.25 |
| 8 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | folk-acoustic | singer-songwriter | 80.15 | 82.9 | 89 | 65.25 | 81.8 | 70.75 |
| 9 | The Gaslight Anthem | The '59 Sound | G1lq40tR72Q | folk-acoustic | americana | 79.7 | 79.1 | 87.29 | 70.25 | 82.2 | 73.5 |
| 10 | Alexi Murdoch | Orange Sky | vy_Em1i9BAA | folk-acoustic | singer-songwriter | 79.66 | 78.2 | 92.29 | 58.75 | 83.4 | 75.75 |
| 11 | Raffy Bushman | Abraham | cJ3Pm-HpG_o | folk-acoustic | singer-songwriter | 79.62 | 81.7 | 89 | 69.5 | 72.2 | 71.75 |
| 12 | Bon Iver | Holocene | MjxA25Tj1Ks | folk-acoustic | indie-folk | 79.34 | 78 | 92.57 | 62.25 | 76.2 | 74.75 |
| 13 | Lord Huron | The Night We Met | KtlgYxa6BMU | folk-acoustic | cinematic-folk | 79.28 | 80.9 | 88.14 | 68.75 | 79.8 | 68.5 |
| 14 | The Lumineers | Cleopatra | aN5s9N_pTUs | folk-acoustic | folk-pop | 79.16 | 79.4 | 90.43 | 62.25 | 76.6 | 74.75 |
| 15 | Alexi Murdoch | All My Days | 5NFkFVe93NM | folk-acoustic | singer-songwriter | 79.13 | 77 | 91.29 | 62.75 | 80.6 | 74.5 |
| 16 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | folk-acoustic | singer-songwriter | 78.9 | 79.9 | 91.43 | 56.25 | 80.4 | 73.5 |
| 17 | The Head and the Heart | Lost in My Mind | is7rrC-jH_A | folk-acoustic | indie-folk | 78.85 | 78.3 | 91 | 61.5 | 79.2 | 72.75 |
| 18 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | folk-acoustic | indie-folk | 78.84 | 77.5 | 92.71 | 60.25 | 84.6 | 68.5 |
| 19 | strings & heart | evergreen love | QJBm_SE4fC0 | folk-acoustic | indie-folk | 78.77 | 79.4 | 91.86 | 66.25 | 71.4 | 68.75 |
| 20 | Sufjan Stevens | Mystery of Love | 4WTt69YO2VI | folk-acoustic | indie-folk | 78.41 | 82 | 87.43 | 61.25 | 74.8 | 72.75 |
| 21 | Lord Huron | Meet Me in the Woods | cYy7ljx7fyc | folk-acoustic | cinematic-folk | 77.49 | 77.4 | 88 | 60.5 | 79.6 | 72.25 |
| 22 | Lord Huron | Ends of the Earth | -MH-UmYkXiM | folk-acoustic | cinematic-folk | 77.41 | 76.8 | 87.86 | 59.25 | 81 | 73.5 |
| 23 | Jack Johnson | Better Together | fqxNYjDFJUk | folk-acoustic | singer-songwriter | 76.79 | 72.2 | 93.86 | 52.5 | 83 | 72 |
| 24 | The Vaniers | Milk & Honey | OMmz0ZgwvWk | folk-acoustic | singer-songwriter | 76.72 | 75.9 | 87.71 | 65 | 75.4 | 69 |
| 25 | Gregory Alan Isakov | The Stable Song | jGDjO9kuKyY | folk-acoustic | singer-songwriter | 76.43 | 76 | 90.71 | 54.5 | 77.4 | 70 |
| 26 | Jack Johnson | Banana Pancakes | YdgoG8hTMUw | folk-acoustic | singer-songwriter | 76.29 | 75.3 | 91.43 | 51.25 | 79 | 71.25 |
| 27 | Finn Askew | Aftertaste | HFQyMYzEoNo | folk-acoustic | singer-songwriter | 76.19 | 77 | 81.86 | 68.25 | 74.6 | 72.25 |
| 28 | Penelope Road | Chance Encounter | G8NzCr3J1_w | folk-acoustic | indie-folk | 75.76 | 76.7 | 82.57 | 65.25 | 75 | 71.25 |
| 29 | José González | Stay Alive | NucJk8TxyRg | folk-acoustic | singer-songwriter | 75.72 | 75.3 | 88.86 | 57.75 | 81 | 64.75 |
| 30 | Gloria Tells | Climb Down From Your Pedestal | TxwAPQDErPw | folk-acoustic | singer-songwriter | 75.38 | 73.9 | 80.43 | 69.75 | 80.4 | 70.5 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 3 | The Lumineers | Ophelia | pTOC_q0NLTk | medium |
| 2 | 14 | The Lumineers | Cleopatra | aN5s9N_pTUs | medium |
| 3 | 17 | The Head and the Heart | Lost in My Mind | is7rrC-jH_A | medium |
| 4 | 18 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | medium |
| 5 | 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | low |
| 6 | 9 | The Gaslight Anthem | The '59 Sound | G1lq40tR72Q | high |
| 7 | 2 | Rinko Nagai | 雨宿らず | dWd5mWQ_bpA | low |
| 8 | 4 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | low |
| 9 | 5 | José González | Heartbeats | ik_BQYbbZ5U | low |
| 10 | 6 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | low |
| 11 | 7 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | low |
| 12 | 8 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | low |
| 13 | 10 | Alexi Murdoch | Orange Sky | vy_Em1i9BAA | low |
| 14 | 11 | Raffy Bushman | Abraham | cJ3Pm-HpG_o | low |
| 15 | 12 | Bon Iver | Holocene | MjxA25Tj1Ks | low |
| 16 | 13 | Lord Huron | The Night We Met | KtlgYxa6BMU | low |
| 17 | 15 | Alexi Murdoch | All My Days | 5NFkFVe93NM | low |
| 18 | 16 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | low |
| 19 | 19 | strings & heart | evergreen love | QJBm_SE4fC0 | low |
| 20 | 20 | Sufjan Stevens | Mystery of Love | 4WTt69YO2VI | low |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### 5d26f76472131c2904c9a2729e850a22.jpg

- lane: indie-road-movie | image_type: SCENE | confidence: 0.98
- playlist_concept: Golden Road at Dusk
- targetStats: brightness=85 warmth=90 openness=95 motion=50 intimacy=40 socialEnergy=30 tension=20 nostalgia=70 playfulness=40 dreaminess=75 energy=50 groove=40 density=60 acousticness=70 electronicness=20 vocalPresence=60 climaxIntensity=50
- contextAffinity: spring=30 summer=60 autumn=85 winter=10 morning=10 day=40 dusk=90 night=20 lateNight=5 clear=95 cloudy=20 rain=5 snow=0

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | E:um | Today's Journey | I0eLBDc82Tk | folk-acoustic | indie-folk | 83.73 | 86.1 | 94.43 | 74.75 | 67 | 77.75 |
| 2 | Cocteau Twins | Heaven or Las Vegas | 6KnYw4EwYGc | rock | dream-pop | 80.41 | 89.1 | 87 | 72.5 | 68.8 | 65.5 |
| 3 | Jordan Lee | Love Ride | j7wBND-RyCM | folk-acoustic | indie-folk | 79.9 | 82 | 91.71 | 72 | 65.2 | 69.75 |
| 4 | Finn Askew | Aftertaste | HFQyMYzEoNo | folk-acoustic | singer-songwriter | 79.65 | 84.5 | 91.86 | 76 | 66.8 | 57.75 |
| 5 | Natalie Layne | Grateful For | W4XjEvvq7W8 | folk-acoustic | singer-songwriter | 79.31 | 83.3 | 90.43 | 74.5 | 67.2 | 62 |
| 6 | Penelope Road | Chance Encounter | G8NzCr3J1_w | folk-acoustic | indie-folk | 79.29 | 83.8 | 91.71 | 74 | 67.2 | 58.75 |
| 7 | strings & heart | evergreen love | QJBm_SE4fC0 | folk-acoustic | indie-folk | 78.82 | 84.1 | 86.71 | 72.5 | 67.6 | 66.25 |
| 8 | wave to earth | surf. | K45Ibt2xKj8 | rock | dream-pop | 78.55 | 82 | 84.14 | 70 | 65.4 | 77.75 |
| 9 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | folk-acoustic | indie-folk | 78.55 | 84.6 | 83 | 69 | 76.4 | 68.5 |
| 10 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | rock | indie-rock | 78.52 | 79.1 | 88.86 | 76 | 73.2 | 62.75 |
| 11 | Gloria Tells | Climb Down From Your Pedestal | TxwAPQDErPw | folk-acoustic | singer-songwriter | 78.46 | 78.4 | 90.43 | 76 | 67.4 | 64.5 |
| 12 | The Lumineers | Ophelia | pTOC_q0NLTk | folk-acoustic | folk-pop | 78.41 | 82 | 85.43 | 75 | 75.6 | 62.5 |
| 13 | Travis | Why Does It Always Rain On Me? | PXatLOWjr-k | rock | britpop | 78.36 | 77.2 | 89.43 | 78.25 | 69.2 | 64.75 |
| 14 | Weezer | Say It Ain't So | OoPHItnUFkw | rock | power-pop | 78.34 | 74.5 | 87.57 | 84 | 74.4 | 64.5 |
| 15 | Lord Huron | Meet Me in the Woods | cYy7ljx7fyc | folk-acoustic | cinematic-folk | 78.15 | 84.7 | 86.29 | 69.25 | 75.8 | 59.25 |
| 16 | Alexi Murdoch | All My Days | 5NFkFVe93NM | folk-acoustic | singer-songwriter | 78.06 | 80.1 | 86.71 | 71.5 | 72.4 | 67 |
| 17 | The Vaniers | Milk & Honey | OMmz0ZgwvWk | folk-acoustic | singer-songwriter | 78.01 | 84.4 | 88.29 | 73.75 | 65.2 | 57.5 |
| 18 | The Lumineers | Cleopatra | aN5s9N_pTUs | folk-acoustic | folk-pop | 77.96 | 80.1 | 85.86 | 71 | 73.6 | 67.75 |
| 19 | Keane | Somewhere Only We Know | Oextk-If8HQ | rock | britpop | 77.93 | 77.5 | 91 | 75 | 66 | 63.5 |
| 20 | Vance Joy | Riptide | TL_oroU9eN8 | folk-acoustic | folk-pop | 77.79 | 83.5 | 87.29 | 64.75 | 69 | 66.25 |
| 21 | ASIAN KUNG-FU GENERATION | Solanin | xZD1B1TskXs | rock | j-rock | 77.77 | 76.1 | 89.43 | 75.25 | 69.2 | 66 |
| 22 | Alexi Murdoch | Orange Sky | vy_Em1i9BAA | folk-acoustic | singer-songwriter | 77.76 | 85.5 | 80.86 | 67.5 | 77.2 | 66.75 |
| 23 | DAY6 | Time of Our Life | vnS_jn2uibs | rock | k-indie-rock | 77.68 | 77.1 | 86.86 | 71.75 | 71.6 | 70.5 |
| 24 | The Head and the Heart | Lost in My Mind | is7rrC-jH_A | folk-acoustic | indie-folk | 77.67 | 82 | 84.71 | 70.25 | 66.6 | 69.75 |
| 25 | José González | Stay Alive | NucJk8TxyRg | folk-acoustic | singer-songwriter | 77.67 | 84.4 | 80.86 | 66.5 | 72.8 | 72.25 |
| 26 | 10-FEET | RIVER | uANAsqHkMDs | rock | garage-rock | 77.66 | 78.3 | 86.86 | 70.75 | 70.4 | 69.75 |
| 27 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | folk-acoustic | singer-songwriter | 77.62 | 83 | 84.57 | 71.5 | 77.4 | 59.25 |
| 28 | ELLEGARDEN | Marry Me | 5HCPeTjVgfQ | rock | j-rock | 77.52 | 74.9 | 88.57 | 77.25 | 68 | 67.25 |
| 29 | Gregory Alan Isakov | The Stable Song | jGDjO9kuKyY | folk-acoustic | singer-songwriter | 77.42 | 84.7 | 82.14 | 63.25 | 70 | 72.5 |
| 30 | Oasis | Don't Look Back In Anger | cmpRLQZkTb8 | rock | britpop | 77.4 | 76.5 | 90.14 | 76 | 64.8 | 63.5 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 1 | E:um | Today's Journey | I0eLBDc82Tk | medium |
| 2 | 2 | Cocteau Twins | Heaven or Las Vegas | 6KnYw4EwYGc | medium |
| 3 | 3 | Jordan Lee | Love Ride | j7wBND-RyCM | medium |
| 4 | 8 | wave to earth | surf. | K45Ibt2xKj8 | medium |
| 5 | 9 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | medium |
| 6 | 10 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | medium |
| 7 | 11 | Gloria Tells | Climb Down From Your Pedestal | TxwAPQDErPw | medium |
| 8 | 12 | The Lumineers | Ophelia | pTOC_q0NLTk | medium |
| 9 | 13 | Travis | Why Does It Always Rain On Me? | PXatLOWjr-k | medium |
| 10 | 14 | Weezer | Say It Ain't So | OoPHItnUFkw | medium |
| 11 | 15 | Lord Huron | Meet Me in the Woods | cYy7ljx7fyc | medium |
| 12 | 18 | The Lumineers | Cleopatra | aN5s9N_pTUs | medium |
| 13 | 19 | Keane | Somewhere Only We Know | Oextk-If8HQ | medium |
| 14 | 20 | Vance Joy | Riptide | TL_oroU9eN8 | medium |
| 15 | 4 | Finn Askew | Aftertaste | HFQyMYzEoNo | low |
| 16 | 5 | Natalie Layne | Grateful For | W4XjEvvq7W8 | low |
| 17 | 6 | Penelope Road | Chance Encounter | G8NzCr3J1_w | low |
| 18 | 7 | strings & heart | evergreen love | QJBm_SE4fC0 | low |
| 19 | 16 | Alexi Murdoch | All My Days | 5NFkFVe93NM | low |
| 20 | 17 | The Vaniers | Milk & Honey | OMmz0ZgwvWk | low |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### 63124baa245a1133a63c9f6978f701ef.jpg

- lane: indie-road-movie | image_type: SCENE | confidence: 0.98
- playlist_concept: Streetside Dreams
- targetStats: brightness=30 warmth=50 openness=70 motion=45 intimacy=40 socialEnergy=55 tension=35 nostalgia=60 playfulness=30 dreaminess=65 energy=40 groove=55 density=50 acousticness=40 electronicness=30 vocalPresence=60 climaxIntensity=50
- contextAffinity: spring=50 summer=40 autumn=65 winter=35 morning=30 day=70 dusk=60 night=40 lateNight=30 clear=50 cloudy=70 rain=40 snow=20

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | rock | indie-rock | 92.05 | 88.4 | 96.71 | 94.75 | 86.2 | 91.25 |
| 2 | Oasis | Wonderwall | bx1Bh8ZvH84 | rock | britpop | 89.3 | 88.5 | 89.71 | 93.5 | 87.6 | 87 |
| 3 | The Shins | New Slang | kGpAMPS_t8U | rock | indie-rock | 88.52 | 84.3 | 90.86 | 96.25 | 89.4 | 84 |
| 4 | 잭킹콩 | Blur | Eqz5YPSJI_k | rock | k-indie-rock | 88.29 | 90.4 | 90.43 | 92.75 | 79.4 | 81.25 |
| 5 | Phoebe Bridgers | Motion Sickness | 9sfYpolGCu8 | rock | indie-rock | 87.98 | 82.8 | 92.43 | 94.25 | 89 | 82.5 |
| 6 | The Verve | Bitter Sweet Symphony | 1lyu1KKwC74 | rock | britpop | 87.89 | 86.1 | 89.29 | 90.75 | 91 | 83.75 |
| 7 | The Verve | Lucky Man | MH6TJU0qWoY | rock | britpop | 87.84 | 87.1 | 88 | 94.5 | 91 | 80.25 |
| 8 | NELL | 지구가 태양을 네 번 | g5cVE-i5wHI | rock | k-indie-rock | 87.7 | 85.8 | 89.71 | 92.5 | 87.2 | 83 |
| 9 | Oasis | Champagne Supernova | tI-5uv4wryI | rock | britpop | 87.55 | 87.7 | 88.86 | 88.25 | 84.8 | 85.75 |
| 10 | Keane | Everybody's Changing | Zx4Hjq6KwO0 | rock | britpop | 87.55 | 83.4 | 90 | 93.75 | 89 | 83.75 |
| 11 | Band of Horses | The Funeral | cMFWFhTFohk | rock | indie-rock | 87.51 | 85.2 | 89.57 | 93.5 | 86 | 83 |
| 12 | Oasis | Live Forever | TDe1DqxwJoc | rock | britpop | 87.41 | 86.1 | 87.71 | 93.5 | 86 | 84.25 |
| 13 | Snow Patrol | Chasing Cars | GemKqzILV4w | rock | britpop | 87.39 | 83.8 | 91.71 | 90 | 89.4 | 82 |
| 14 | Keane | Somewhere Only We Know | Oextk-If8HQ | rock | britpop | 87.34 | 86.4 | 89.43 | 88.75 | 89 | 82.5 |
| 15 | Travis | Why Does It Always Rain On Me? | PXatLOWjr-k | rock | britpop | 87.23 | 84.9 | 89.29 | 89.5 | 84.6 | 87.25 |
| 16 | ASIAN KUNG-FU GENERATION | Solanin | xZD1B1TskXs | rock | j-rock | 87.18 | 85.4 | 92.14 | 89 | 84.2 | 81 |
| 17 | Reliably Bad | Make It Out | WxMZCHZyeSE | rock | indie-rock | 87.18 | 83.6 | 90 | 87.75 | 89.6 | 86.5 |
| 18 | Doves | There Goes The Fear | SneuvKIkM3A | rock | britpop | 87.11 | 84.1 | 87.29 | 93.25 | 92.2 | 83.25 |
| 19 | Interpol | Obstacle 1 | NwYKAsbx8SU | rock | alternative-rock | 87.05 | 84.8 | 88.71 | 90 | 86 | 86 |
| 20 | Death Cab for Cutie | Cath... | uY1ahFCYT5k | rock | indie-rock | 86.99 | 87.1 | 83.57 | 96.25 | 88.6 | 83.25 |
| 21 | Wilco | Heavy Metal Drummer | yeuIQFF7z6E | rock | indie-rock | 86.94 | 81.9 | 87.86 | 94.5 | 89.8 | 85.75 |
| 22 | Oasis | Don't Look Back In Anger | cmpRLQZkTb8 | rock | britpop | 86.93 | 84.4 | 88.29 | 93.25 | 85.4 | 84 |
| 23 | Weezer | Say It Ain't So | OoPHItnUFkw | rock | power-pop | 86.83 | 83.8 | 88 | 89.25 | 93 | 84 |
| 24 | ELLEGARDEN | Marry Me | 5HCPeTjVgfQ | rock | j-rock | 86.75 | 85.4 | 89 | 88.5 | 87.4 | 82.75 |
| 25 | Yeah Yeah Yeahs | Maps | oIIxlgcuQRU | rock | garage-rock | 86.73 | 83 | 88.14 | 93 | 93.6 | 80.5 |
| 26 | Stereophonics | Maybe Tomorrow | 2q9_ZEtuTR8 | rock | britpop | 86.71 | 85.2 | 93.14 | 85.25 | 81.2 | 82 |
| 27 | Beck | E-Pro | RIrG6xBW5Wk | rock | alternative-rock | 86.63 | 84.9 | 85.43 | 94.75 | 90.2 | 82 |
| 28 | Jaurim | 스물다섯, 스물하나 | LrB-fJn-3w4 | rock | k-indie-rock | 86.51 | 83.5 | 90 | 94.5 | 87 | 77.25 |
| 29 | NELL | 기억을 걷는 시간 | QnqVpRDaQ90 | rock | k-indie-rock | 86.51 | 83.6 | 88.71 | 95.5 | 86.4 | 79 |
| 30 | Coldplay | Yellow | yKNxeF4KMsY | rock | alternative-rock | 86.48 | 86.3 | 86.86 | 88.5 | 88.8 | 82.5 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 1 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | medium |
| 2 | 2 | Oasis | Wonderwall | bx1Bh8ZvH84 | medium |
| 3 | 4 | 잭킹콩 | Blur | Eqz5YPSJI_k | medium |
| 4 | 5 | Phoebe Bridgers | Motion Sickness | 9sfYpolGCu8 | medium |
| 5 | 6 | The Verve | Bitter Sweet Symphony | 1lyu1KKwC74 | medium |
| 6 | 7 | The Verve | Lucky Man | MH6TJU0qWoY | medium |
| 7 | 8 | NELL | 지구가 태양을 네 번 | g5cVE-i5wHI | medium |
| 8 | 9 | Oasis | Champagne Supernova | tI-5uv4wryI | medium |
| 9 | 10 | Keane | Everybody's Changing | Zx4Hjq6KwO0 | medium |
| 10 | 11 | Band of Horses | The Funeral | cMFWFhTFohk | medium |
| 11 | 12 | Oasis | Live Forever | TDe1DqxwJoc | high |
| 12 | 19 | Interpol | Obstacle 1 | NwYKAsbx8SU | high |
| 13 | 14 | Keane | Somewhere Only We Know | Oextk-If8HQ | medium |
| 14 | 15 | Travis | Why Does It Always Rain On Me? | PXatLOWjr-k | medium |
| 15 | 16 | ASIAN KUNG-FU GENERATION | Solanin | xZD1B1TskXs | medium |
| 16 | 3 | The Shins | New Slang | kGpAMPS_t8U | low |
| 17 | 13 | Snow Patrol | Chasing Cars | GemKqzILV4w | low |
| 18 | 17 | Reliably Bad | Make It Out | WxMZCHZyeSE | medium |
| 19 | 18 | Doves | There Goes The Fear | SneuvKIkM3A | medium |
| 20 | 20 | Death Cab for Cutie | Cath... | uY1ahFCYT5k | medium |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### acadefe72ef776bdd8913a4b1df8aaab.jpg

- lane: city-pop-retro-glow | image_type: SCENE | confidence: 1
- playlist_concept: Urban Night Groove
- targetStats: brightness=70 warmth=80 openness=60 motion=70 intimacy=40 socialEnergy=80 tension=20 nostalgia=30 playfulness=70 dreaminess=20 energy=75 groove=70 density=60 acousticness=30 electronicness=60 vocalPresence=80 climaxIntensity=60
- contextAffinity: spring=40 summer=80 autumn=30 winter=10 morning=10 day=20 dusk=40 night=30 lateNight=20 clear=70 cloudy=20 rain=10 snow=0

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | pop | city-pop | 87.92 | 92 | 92.14 | 82 | 76.6 | 84.75 |
| 2 | a!ka | All Bark No Bite | r7cz6RMoMKM | pop | city-pop | 87.81 | 90.8 | 91.86 | 83.75 | 77.4 | 84.75 |
| 3 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | pop | teen-pop | 87.23 | 90.8 | 88.86 | 83.5 | 78 | 86.75 |
| 4 | 외동아들 김승기 | SNL | LSrHTs2gd9Y | pop | dance-pop | 87.1 | 89.5 | 92.43 | 83 | 77 | 82.5 |
| 5 | Shawn Mendes | There's Nothing Holdin' Me Back | dT2owtxkU8k | pop | soft-pop | 86.85 | 88.6 | 95 | 78.75 | 78.8 | 80.5 |
| 6 | Sade | Smooth Operator | 4TYv2PhG89A | pop | city-pop | 86.57 | 91.7 | 91.29 | 79.75 | 73 | 82.75 |
| 7 | Rex Orange County feat. Benny Sings | Loving Is Easy | 39IU7ADaXmQ | pop | indie-pop | 86.51 | 88.8 | 91.14 | 78.5 | 79.6 | 85.25 |
| 8 | Flume feat. Tove Lo | Say It | hZe5K1DN4ec | pop | electropop | 86.4 | 91 | 90.86 | 78.5 | 78.8 | 81.25 |
| 9 | Anri | Windy Summer | uQ9nsr9YoCQ | pop | city-pop | 86.34 | 86.9 | 94.14 | 84.25 | 68.6 | 83.5 |
| 10 | CORTIS | FaSHioN | 42wfEs7oIP8 | pop | k-pop | 86.32 | 92.6 | 89.43 | 79.25 | 76 | 81.5 |
| 11 | Harry Styles | Late Night Talking | RwT77rlp2CE | pop | soft-pop | 86.31 | 90 | 92.14 | 80 | 75.2 | 81 |
| 12 | Clairo | Amoeba | VR8ooa3G_5M | pop | bedroom-pop | 86.16 | 92 | 88.29 | 79.5 | 77.4 | 82.75 |
| 13 | Calvin Harris | Summer | ebXbLfLACGM | pop | dance-pop | 85.99 | 90.3 | 89.71 | 78.5 | 81.4 | 80.5 |
| 14 | khai dreams | Sunkissed | EO_i9nHvCEk | pop | indie-pop | 85.95 | 90.1 | 91.14 | 77.5 | 81.4 | 78.75 |
| 15 | Bronze feat. Yukika | Orange Road | Uoutn3GVHqs | pop | city-pop | 85.89 | 91.6 | 88 | 80.75 | 74.8 | 82.75 |
| 16 | Harry Styles | Watermelon Sugar | E07s5ZYygMg | pop | soft-pop | 85.87 | 89.6 | 94.71 | 75 | 77.4 | 77.25 |
| 17 | Troye Sivan | Rush | Vih7BTyVcj4 | pop | electropop | 85.85 | 88 | 92.86 | 80.5 | 74.4 | 80.5 |
| 18 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | pop | city-pop | 85.72 | 88.1 | 91.14 | 80.5 | 75 | 82.5 |
| 19 | Katy Perry feat. Snoop Dogg | California Gurls | F57P9C4SAW4 | pop | dance-pop | 85.66 | 88.6 | 91.86 | 79 | 76 | 80.5 |
| 20 | MAKTUB feat. Lee Raon | To You My Light | kNYA3H1jSSs | pop | k-pop | 85.62 | 87.4 | 91.71 | 79.5 | 76.2 | 82.25 |
| 21 | Rex Orange County | Sunflower | V0X-SWiDr1g | pop | indie-pop | 85.57 | 84 | 93.71 | 82 | 78.4 | 80.75 |
| 22 | Calvin Harris feat. Pharrell Williams, Katy Perry & Big Sean | Feels | ozv4q2ov3Mk | pop | dance-pop | 85.54 | 89.2 | 92 | 74 | 81.6 | 79.5 |
| 23 | Stella Jang | Colors | CRHPclhtlN0 | pop | indie-pop | 85.54 | 86.6 | 91 | 79 | 77.4 | 84.5 |
| 24 | Duke Dumont | Ocean Drive | KDxJlW6cxRk | pop | dance-pop | 85.53 | 90 | 89.57 | 79 | 74 | 82.75 |
| 25 | Young Gun Silver Fox | Winner | cYjb-vpl9Ow | pop | city-pop | 85.49 | 89.1 | 93.57 | 78 | 68.8 | 80.75 |
| 26 | Daybreak | Flower Road | 49HfFYsh43Y | pop | soft-pop | 85.48 | 90.2 | 91.57 | 73.5 | 80 | 79.5 |
| 27 | NewJeans | Hype Boy | 11cta61wi0g | pop | k-pop | 85.28 | 86.9 | 91.57 | 77 | 77 | 83.25 |
| 28 | mxmtoon | Prom Dress | vDPxVVyZzAY | pop | bedroom-pop | 85.2 | 90.5 | 86.43 | 82.25 | 77.8 | 80 |
| 29 | RIIZE | Get A Guitar | iUw3LPM7OBU | pop | k-pop | 85.17 | 91 | 85.71 | 77.75 | 81.6 | 82.25 |
| 30 | Taylor Swift | Style | 66TQBtlRKc4 | pop | soft-pop | 85.09 | 89.4 | 91.43 | 77 | 74.4 | 79 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 1 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | medium |
| 2 | 2 | a!ka | All Bark No Bite | r7cz6RMoMKM | medium |
| 3 | 3 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | medium |
| 4 | 6 | Sade | Smooth Operator | 4TYv2PhG89A | medium |
| 5 | 7 | Rex Orange County feat. Benny Sings | Loving Is Easy | 39IU7ADaXmQ | medium |
| 6 | 8 | Flume feat. Tove Lo | Say It | hZe5K1DN4ec | medium |
| 7 | 9 | Anri | Windy Summer | uQ9nsr9YoCQ | medium |
| 8 | 10 | CORTIS | FaSHioN | 42wfEs7oIP8 | medium |
| 9 | 11 | Harry Styles | Late Night Talking | RwT77rlp2CE | medium |
| 10 | 12 | Clairo | Amoeba | VR8ooa3G_5M | medium |
| 11 | 4 | 외동아들 김승기 | SNL | LSrHTs2gd9Y | high |
| 12 | 5 | Shawn Mendes | There's Nothing Holdin' Me Back | dT2owtxkU8k | high |
| 13 | 13 | Calvin Harris | Summer | ebXbLfLACGM | high |
| 14 | 16 | Harry Styles | Watermelon Sugar | E07s5ZYygMg | high |
| 15 | 17 | Troye Sivan | Rush | Vih7BTyVcj4 | high |
| 16 | 14 | khai dreams | Sunkissed | EO_i9nHvCEk | medium |
| 17 | 15 | Bronze feat. Yukika | Orange Road | Uoutn3GVHqs | medium |
| 18 | 18 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | medium |
| 19 | 20 | MAKTUB feat. Lee Raon | To You My Light | kNYA3H1jSSs | medium |
| 20 | 19 | Katy Perry feat. Snoop Dogg | California Gurls | F57P9C4SAW4 | high |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

## Vector-dimension distribution summary

| field | min | max | mean | median | sd | unique | <20 | >80 | 40-60 |
|---|---|---|---|---|---|---|---|---|---|
| brightness | 20 | 85 | 50.71 | 40 | 22.43 | 5 | 0 | 1 | 2 |
| warmth | 30 | 90 | 57.86 | 50 | 23.28 | 5 | 0 | 1 | 2 |
| openness | 20 | 95 | 60.71 | 60 | 21.12 | 5 | 0 | 1 | 3 |
| motion | 10 | 70 | 32.14 | 30 | 22.02 | 5 | 3 | 0 | 2 |
| intimacy | 40 | 70 | 50 | 40 | 11.95 | 3 | 0 | 0 | 6 |
| socialEnergy | 10 | 80 | 36.43 | 30 | 22.47 | 6 | 1 | 0 | 2 |
| tension | 20 | 35 | 25 | 20 | 5.98 | 3 | 0 | 0 | 0 |
| nostalgia | 30 | 80 | 61.43 | 60 | 14.57 | 4 | 0 | 0 | 3 |
| playfulness | 10 | 70 | 34.29 | 30 | 19.17 | 6 | 1 | 0 | 2 |
| dreaminess | 20 | 75 | 54.29 | 60 | 17.81 | 7 | 0 | 0 | 3 |
| energy | 20 | 75 | 39.29 | 40 | 19.35 | 4 | 0 | 0 | 3 |
| groove | 10 | 70 | 42.14 | 40 | 19.97 | 6 | 1 | 0 | 4 |
| density | 30 | 60 | 44.29 | 50 | 12.94 | 3 | 0 | 0 | 4 |
| acousticness | 30 | 80 | 54.29 | 50 | 20.6 | 5 | 0 | 0 | 2 |
| electronicness | 10 | 60 | 34.29 | 30 | 20.6 | 5 | 2 | 0 | 3 |
| vocalPresence | 60 | 80 | 65.71 | 60 | 7.28 | 3 | 0 | 0 | 4 |
| climaxIntensity | 20 | 60 | 38.57 | 40 | 14.57 | 5 | 0 | 0 | 4 |
| spring | 20 | 60 | 34.29 | 30 | 14.98 | 5 | 0 | 0 | 3 |
| summer | 10 | 80 | 37.14 | 40 | 26.03 | 5 | 3 | 0 | 3 |
| autumn | 30 | 90 | 55.71 | 60 | 24.26 | 5 | 0 | 2 | 1 |
| winter | 10 | 90 | 35 | 35 | 27.12 | 5 | 3 | 1 | 2 |
| morning | 10 | 40 | 20 | 20 | 10.69 | 4 | 3 | 0 | 1 |
| day | 5 | 80 | 46.43 | 40 | 28.12 | 6 | 1 | 0 | 1 |
| dusk | 30 | 90 | 51.43 | 50 | 19.59 | 5 | 0 | 1 | 4 |
| night | 10 | 80 | 35.71 | 30 | 20.6 | 5 | 1 | 0 | 2 |
| lateNight | 0 | 60 | 22.14 | 20 | 18.87 | 6 | 3 | 0 | 1 |
| clear | 30 | 95 | 55 | 50 | 24.93 | 5 | 0 | 1 | 1 |
| cloudy | 20 | 70 | 42.86 | 40 | 21.85 | 4 | 0 | 0 | 2 |
| rain | 5 | 100 | 27.86 | 10 | 31.38 | 5 | 4 | 1 | 1 |
| snow | 0 | 90 | 20 | 10 | 29.76 | 4 | 4 | 1 | 0 |

## Most similar / most different image-vector pairs

Most similar:
- 28ebe33dc58b3a9c88fe09467727db27.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg: meanAbsDistance=14.5
- 050e0c11047a97bc23cbd3be7458e6c7.jpg vs 402c17af72fc0eec89e1f5e3589de7bb.jpg: meanAbsDistance=16
- 28ebe33dc58b3a9c88fe09467727db27.jpg vs 5d26f76472131c2904c9a2729e850a22.jpg: meanAbsDistance=17.5
- 28ebe33dc58b3a9c88fe09467727db27.jpg vs 63124baa245a1133a63c9f6978f701ef.jpg: meanAbsDistance=18.5
- 050e0c11047a97bc23cbd3be7458e6c7.jpg vs 0ea78a4ffc3af667e68e52ea29867a9b.jpg: meanAbsDistance=19
Most different:
- 402c17af72fc0eec89e1f5e3589de7bb.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg: meanAbsDistance=38.5
- 050e0c11047a97bc23cbd3be7458e6c7.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg: meanAbsDistance=36.5
- 050e0c11047a97bc23cbd3be7458e6c7.jpg vs 28ebe33dc58b3a9c88fe09467727db27.jpg: meanAbsDistance=32
- 0ea78a4ffc3af667e68e52ea29867a9b.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg: meanAbsDistance=30.5
- 28ebe33dc58b3a9c88fe09467727db27.jpg vs 402c17af72fc0eec89e1f5e3589de7bb.jpg: meanAbsDistance=30

## Recommendation overlap

Highest top16-overlap pairs:
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 402c17af72fc0eec89e1f5e3589de7bb.jpg: overlap=29, jaccard=0.94
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 5d26f76472131c2904c9a2729e850a22.jpg: overlap=15, jaccard=0.33
- 402c17af72fc0eec89e1f5e3589de7bb.jpg <-> 5d26f76472131c2904c9a2729e850a22.jpg: overlap=15, jaccard=0.33
- 28ebe33dc58b3a9c88fe09467727db27.jpg <-> acadefe72ef776bdd8913a4b1df8aaab.jpg: overlap=11, jaccard=0.22
- 5d26f76472131c2904c9a2729e850a22.jpg <-> 63124baa245a1133a63c9f6978f701ef.jpg: overlap=7, jaccard=0.13
Lowest top16-overlap pairs:
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 0ea78a4ffc3af667e68e52ea29867a9b.jpg: overlap=0, jaccard=0
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 28ebe33dc58b3a9c88fe09467727db27.jpg: overlap=0, jaccard=0
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 63124baa245a1133a63c9f6978f701ef.jpg: overlap=0, jaccard=0
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> acadefe72ef776bdd8913a4b1df8aaab.jpg: overlap=0, jaccard=0
- 0ea78a4ffc3af667e68e52ea29867a9b.jpg <-> 28ebe33dc58b3a9c88fe09467727db27.jpg: overlap=0, jaccard=0

## Global recurrence

Recurring tracks: 49
- Gregory Alan Isakov - Amsterdam: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- The Lumineers - Ophelia: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- Alexi Murdoch - All My Days: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- strings & heart - evergreen love: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- The Lumineers - Cleopatra: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- The Head and the Heart - Rivers and Roads: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- Alexi Murdoch - Orange Sky: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- Lord Huron - Meet Me in the Woods: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- The Head and the Heart - Lost in My Mind: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- The Vaniers - Milk & Honey: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- Finn Askew - Aftertaste: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- José González - Stay Alive: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- Penelope Road - Chance Encounter: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- Gregory Alan Isakov - The Stable Song: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- Mikayla Geier - Ring Pop: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- a!ka - All Bark No Bite: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- 박문치 - J U S T F U N (with 죠지): images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- Anri - Windy Summer: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- WhiteUsedSocks - How I Wish!: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- RIIZE - Get A Guitar: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
Recurring artists: 40
- alexi murdoch: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- finn askew: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- gregory alan isakov: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- josé gonzález: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- lord huron: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- penelope road: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- strings & heart: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- the head and the heart: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- the lumineers: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- the vaniers: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- 딕펑스: images=2 (5d26f76472131c2904c9a2729e850a22.jpg,63124baa245a1133a63c9f6978f701ef.jpg)
- 박문치: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- 외동아들 김승기: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- a!ka: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- angus & julia stone: images=2 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg)

## Genre / artist concentration

- primaryGenre concentration: **scene-specific concentration** ("folk-acoustic" dominant in 3/7)
- subgenre concentration: **scene-specific concentration** ("singer-songwriter" dominant in 3/7)
- artist repetition: **frequent within an image** (max in one top16=4, max image-recurrence=3)

## Sequencing observation

Every image preserved all scored top-10 tracks in the final 10 with no outside tracks introduced.

## Final diagnostic classification


**q1_distinctVectors**: 7 images produced 7 distinct full 30-dim vectors.

**q2_midpointCollapseEvidence**: 1 of 30 dimensions have >=75% of images landing in [40,60]. Dimensions: intimacy.

**q3_nearlyIdenticalVectors**: Most similar pair: 28ebe33dc58b3a9c88fe09467727db27.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg, meanAbsDistance=14.5.

**q4_distinctVectorsDistinctRankings**: Mean pairwise top16 Jaccard across all image pairs = 0.09.

**q5_oneTrackDominatesUnrelatedImages**: 49 track(s) recur across >1 image; max image-recurrence = 3.

**q6_oneArtistDominatesUnrelatedImages**: Max artist image-recurrence = 3 of 7 images.

**q7_oneGenreDominatesUnrelatedImages**: "folk-acoustic" dominant in 3/7 images -> scene-specific concentration.

**q8_seasonVariesMeaningfully**: Season field stats: spring sd=14.98, summer sd=26.03, autumn sd=24.26, winter sd=27.12

**q9_timeVariesMeaningfully**: Time field stats: morning sd=10.69, day sd=28.12, dusk sd=19.59, night sd=20.6, lateNight sd=18.87

**q10_weatherVariesMeaningfully**: Weather field stats: clear sd=24.93, cloudy sd=21.85, rain sd=31.38, snow sd=29.76

**q11_desiredSoundVariesMeaningfully**: Desired-sound field stats: energy sd=19.35, groove sd=19.97, density sd=12.94, acousticness sd=20.6, electronicness sd=20.6, vocalPresence sd=7.28, climaxIntensity sd=14.57

**q12_scoreSpreadsInformative**: Mean top16 scoreSpread across images = 3.92.

**q13_ranks11to16CloseEnoughFor20Track**: Mean (rank1-10 avg minus rank11-16 avg) gap across images = 1.48.

**q14_sequencingPreservesScoredTop10**: Yes — every image had all scored top-10 tracks present in final-10 with no outside tracks introduced.

**q15_hardGenreCapEvidence**: NOT SUPPORTED BY CURRENT EVIDENCE

**q16_hardArtistCapEvidence**: NOT SUPPORTED BY CURRENT EVIDENCE

**q17_vectorRedundancyEvidence**: Not separately computed as a track-vs-track metric in this real-image run; see pairwiseVectorDistances for image-vector-level similarity. Requires manual/human review of whether visually distinct source photos are producing recommendation sets that feel redundant.

**q18_humanReviewStillRequired**: Yes — human-review fields in perImageResults[].humanReview are intentionally blank and required before any quality claim.

**q19_candidatePoolExpansionReadiness**: Technically: yes, the scoring/ranking pipeline runs over the full 795-track catalog and returns as many ranked candidates as requested. Quality readiness is not established by this diagnostic alone.

**q20_twentyTrackReadiness**: technically ready (pipeline can score/rank/select beyond 16 without code changes) — NOT quality-validated (human-review fields are blank) and NOT enabled in production (CATALOG_CANDIDATE_POOL_SIZE/FINAL_TRACK_COUNT unchanged by this task).