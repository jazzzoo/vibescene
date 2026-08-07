# VibeScene Music Engine — Step 5-C Real-Image Evaluation

Generated: 2026-08-07T06:03:08.847Z  
Repository HEAD: 5f243fc  
Model: gpt-4o

## Execution summary

- Images attempted: 12 | succeeded: 8 | failed: 4
- This-script-level requests made: 16 (4 image(s) needed a script-level retry); true OpenAI call count may be up to 2x this if gpt.ts's own internal correction retry also fired

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

- lane: dream-pop-shoegaze-fog | image_type: SCENE | confidence: 0.95
- playlist_concept: Snowy Evening Serenity
- targetStats: brightness=30 warmth=40 openness=60 motion=10 intimacy=70 socialEnergy=10 tension=20 nostalgia=80 playfulness=10 dreaminess=90 energy=20 groove=10 density=30 acousticness=70 electronicness=60 vocalPresence=30 climaxIntensity=20
- contextAffinity: spring=10 summer=0 autumn=20 winter=80 morning=20 day=30 dusk=70 night=10 lateNight=0 clear=40 cloudy=60 rain=0 snow=100

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Tycho | A Walk | SDNA934EEVk | ambient-experimental | ambient-electronic | 81.86 | 86.6 | 91.71 | 68.75 | 74.8 | 70.5 |
| 2 | Øneheart & reidenshi | snowfall | OtLcqr3RQJY | ambient-experimental | ambient-electronic | 81.42 | 85.5 | 89 | 74.25 | 64.6 | 76.5 |
| 3 | Tycho | Awake | dm4tkSNKfFI | ambient-experimental | ambient-electronic | 80.68 | 85.2 | 88 | 69.5 | 75 | 72 |
| 4 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 76.13 | 83 | 79 | 64.25 | 75 | 69.25 |
| 5 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | folk-acoustic | indie-folk | 75.35 | 81.7 | 80.29 | 62.25 | 77 | 64.75 |
| 6 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | folk-acoustic | singer-songwriter | 75.05 | 79.7 | 82.57 | 61.25 | 78.4 | 62.25 |
| 7 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | folk-acoustic | singer-songwriter | 74.11 | 78.9 | 79.29 | 63.75 | 73.8 | 64.75 |
| 8 | José González | Heartbeats | ik_BQYbbZ5U | folk-acoustic | singer-songwriter | 73.91 | 81.6 | 77.86 | 63.75 | 73.6 | 61 |
| 9 | Rinko Nagai | 雨宿らず | dWd5mWQ_bpA | folk-acoustic | singer-songwriter | 73.5 | 83.1 | 76.71 | 61.75 | 69.2 | 62.5 |
| 10 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | folk-acoustic | singer-songwriter | 73.03 | 79.9 | 82.86 | 60.75 | 69.2 | 54.5 |
| 11 | Alexi Murdoch | All My Days | 5NFkFVe93NM | folk-acoustic | singer-songwriter | 72.02 | 74.2 | 81.29 | 61.75 | 73.4 | 58.5 |
| 12 | strings & heart | evergreen love | QJBm_SE4fC0 | folk-acoustic | indie-folk | 71.87 | 79.8 | 78.14 | 53.75 | 68.6 | 63.75 |
| 13 | Raffy Bushman | Abraham | cJ3Pm-HpG_o | folk-acoustic | singer-songwriter | 71.62 | 79.7 | 74.71 | 59 | 65.8 | 65.75 |
| 14 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | folk-acoustic | indie-folk | 71.42 | 75.9 | 81 | 57.75 | 77.4 | 53 |
| 15 | The Lumineers | Ophelia | pTOC_q0NLTk | folk-acoustic | folk-pop | 71.37 | 79.7 | 76.29 | 55.75 | 76.6 | 57 |
| 16 | Jack Johnson | Banana Pancakes | YdgoG8hTMUw | folk-acoustic | singer-songwriter | 71.26 | 75.3 | 79.14 | 60.75 | 79.8 | 52.25 |
| 17 | Sufjan Stevens | Mystery of Love | 4WTt69YO2VI | folk-acoustic | indie-folk | 71.26 | 79.2 | 74.57 | 61.25 | 72 | 58.25 |
| 18 | The Lumineers | Cleopatra | aN5s9N_pTUs | folk-acoustic | folk-pop | 71.24 | 76.2 | 80.14 | 59.25 | 74.6 | 53.25 |
| 19 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | folk-acoustic | singer-songwriter | 71.16 | 79.5 | 77.43 | 57.75 | 69.8 | 56.25 |
| 20 | The Gaslight Anthem | The '59 Sound | G1lq40tR72Q | folk-acoustic | americana | 70.7 | 78.3 | 72.71 | 58.25 | 76.6 | 60 |
| 21 | Vance Joy | Riptide | TL_oroU9eN8 | folk-acoustic | folk-pop | 70.41 | 75.6 | 74.14 | 63 | 70 | 60.25 |
| 22 | Lord Huron | The Night We Met | KtlgYxa6BMU | folk-acoustic | cinematic-folk | 70.32 | 82.1 | 73.86 | 57.25 | 66.2 | 55.5 |
| 23 | Broccoli, you too | 앵콜요청금지 | xvmwqB4fjQ4 | folk-acoustic | indie-folk | 70.22 | 70.8 | 76.71 | 62.25 | 71 | 63.5 |
| 24 | Bon Iver | Holocene | MjxA25Tj1Ks | folk-acoustic | indie-folk | 69.98 | 76 | 77.14 | 56.75 | 68.6 | 57.75 |
| 25 | Jack Johnson | Better Together | fqxNYjDFJUk | folk-acoustic | singer-songwriter | 69.76 | 72.2 | 79.29 | 58.5 | 76.6 | 52.5 |
| 26 | Alexi Murdoch | Orange Sky | vy_Em1i9BAA | folk-acoustic | singer-songwriter | 69.57 | 76 | 78.57 | 50.75 | 78.2 | 51.75 |
| 27 | Lord Huron | Meet Me in the Woods | cYy7ljx7fyc | folk-acoustic | cinematic-folk | 69.47 | 73.4 | 73.43 | 54.5 | 76.8 | 63.75 |
| 28 | The Vaniers | Milk & Honey | OMmz0ZgwvWk | folk-acoustic | singer-songwriter | 69.22 | 75.9 | 74 | 52.5 | 66.2 | 65 |
| 29 | Penelope Road | Chance Encounter | G8NzCr3J1_w | folk-acoustic | indie-folk | 69.02 | 76.7 | 73.14 | 51.25 | 68.2 | 63.75 |
| 30 | Finn Askew | Aftertaste | HFQyMYzEoNo | folk-acoustic | singer-songwriter | 68.96 | 76.6 | 72.43 | 52.75 | 67.8 | 63.75 |

**Final 20 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 4 | Victor Lundberg | Come Back Again | dzoxC8dedXw | 76.13 | 83 | 79 | 64.25 | 75 | 69.25 | medium |
| 2 | 14 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | 71.42 | 75.9 | 81 | 57.75 | 77.4 | 53 | medium |
| 3 | 15 | The Lumineers | Ophelia | pTOC_q0NLTk | 71.37 | 79.7 | 76.29 | 55.75 | 76.6 | 57 | medium |
| 4 | 18 | The Lumineers | Cleopatra | aN5s9N_pTUs | 71.24 | 76.2 | 80.14 | 59.25 | 74.6 | 53.25 | medium |
| 5 | 1 | Tycho | A Walk | SDNA934EEVk | 81.86 | 86.6 | 91.71 | 68.75 | 74.8 | 70.5 | low |
| 6 | 20 | The Gaslight Anthem | The '59 Sound | G1lq40tR72Q | 70.7 | 78.3 | 72.71 | 58.25 | 76.6 | 60 | high |
| 7 | 2 | Øneheart & reidenshi | snowfall | OtLcqr3RQJY | 81.42 | 85.5 | 89 | 74.25 | 64.6 | 76.5 | low |
| 8 | 3 | Tycho | Awake | dm4tkSNKfFI | 80.68 | 85.2 | 88 | 69.5 | 75 | 72 | low |
| 9 | 5 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | 75.35 | 81.7 | 80.29 | 62.25 | 77 | 64.75 | low |
| 10 | 6 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | 75.05 | 79.7 | 82.57 | 61.25 | 78.4 | 62.25 | low |
| 11 | 7 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | 74.11 | 78.9 | 79.29 | 63.75 | 73.8 | 64.75 | low |
| 12 | 8 | José González | Heartbeats | ik_BQYbbZ5U | 73.91 | 81.6 | 77.86 | 63.75 | 73.6 | 61 | low |
| 13 | 9 | Rinko Nagai | 雨宿らず | dWd5mWQ_bpA | 73.5 | 83.1 | 76.71 | 61.75 | 69.2 | 62.5 | low |
| 14 | 10 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | 73.03 | 79.9 | 82.86 | 60.75 | 69.2 | 54.5 | low |
| 15 | 11 | Alexi Murdoch | All My Days | 5NFkFVe93NM | 72.02 | 74.2 | 81.29 | 61.75 | 73.4 | 58.5 | low |
| 16 | 12 | strings & heart | evergreen love | QJBm_SE4fC0 | 71.87 | 79.8 | 78.14 | 53.75 | 68.6 | 63.75 | low |
| 17 | 13 | Raffy Bushman | Abraham | cJ3Pm-HpG_o | 71.62 | 79.7 | 74.71 | 59 | 65.8 | 65.75 | low |
| 18 | 16 | Jack Johnson | Banana Pancakes | YdgoG8hTMUw | 71.26 | 75.3 | 79.14 | 60.75 | 79.8 | 52.25 | low |
| 19 | 17 | Sufjan Stevens | Mystery of Love | 4WTt69YO2VI | 71.26 | 79.2 | 74.57 | 61.25 | 72 | 58.25 | low |
| 20 | 19 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | 71.16 | 79.5 | 77.43 | 57.75 | 69.8 | 56.25 | low |

**Track catalog stats (17 dims, for image-stats <-> music-stats validation)**

| final pos | artist | title | brightness | warmth | openness | motion | intimacy | socialEnergy | tension | nostalgia | playfulness | dreaminess | energy | groove | density | acousticness | electronicness | vocalPresence | climaxIntensity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Victor Lundberg | Come Back Again | 45 | 55 | 45 | 25 | 60 | 25 | 30 | 60 | 20 | 45 | 45 | 30 | 35 | 60 | 20 | 62 | 35 |
| 2 | The Head and the Heart | Rivers and Roads | 61 | 70 | 64 | 47 | 56 | 32 | 9 | 72 | 37 | 33 | 43 | 20 | 31 | 93 | 22 | 68 | 20 |
| 3 | The Lumineers | Ophelia | 44 | 91 | 49 | 47 | 56 | 21 | 29 | 81 | 23 | 48 | 66 | 23 | 33 | 80 | 7 | 57 | 34 |
| 4 | The Lumineers | Cleopatra | 51 | 84 | 49 | 33 | 65 | 34 | 10 | 59 | 34 | 35 | 40 | 33 | 29 | 88 | 15 | 56 | 26 |
| 5 | Tycho | A Walk | 41 | 40 | 85 | 21 | 55 | 27 | 13 | 55 | 19 | 76 | 11 | 18 | 31 | 46 | 54 | 40 | 20 |
| 6 | The Gaslight Anthem | The '59 Sound | 46 | 61 | 64 | 67 | 55 | 38 | 24 | 80 | 26 | 34 | 76 | 26 | 32 | 89 | 14 | 75 | 27 |
| 7 | Øneheart & reidenshi | snowfall | 51 | 6 | 74 | 13 | 70 | 2 | 22 | 33 | 16 | 100 | 17 | 31 | 28 | 36 | 60 | 27 | 34 |
| 8 | Tycho | Awake | 46 | 35 | 68 | 30 | 45 | 14 | 0 | 52 | 13 | 71 | 13 | 35 | 41 | 42 | 56 | 32 | 27 |
| 9 | Angus & Julia Stone | Big Jet Plane | 46 | 69 | 79 | 25 | 62 | 27 | 23 | 58 | 46 | 72 | 28 | 36 | 27 | 85 | 7 | 53 | 30 |
| 10 | Gregory Alan Isakov | Amsterdam | 45 | 60 | 79 | 37 | 52 | 37 | 9 | 76 | 31 | 49 | 21 | 27 | 32 | 89 | 19 | 58 | 34 |
| 11 | Gregory Alan Isakov | Big Black Car | 50 | 61 | 49 | 29 | 61 | 0 | 31 | 41 | 39 | 48 | 29 | 36 | 3 | 77 | 16 | 58 | 24 |
| 12 | José González | Heartbeats | 49 | 71 | 60 | 30 | 63 | 20 | 11 | 48 | 29 | 53 | 24 | 31 | 18 | 86 | 6 | 67 | 31 |
| 13 | Rinko Nagai | 雨宿らず | 45 | 58 | 55 | 38 | 80 | 32 | 30 | 65 | 28 | 62 | 28 | 38 | 35 | 80 | 15 | 82 | 35 |
| 14 | Iron & Wine | Naked as We Came | 57 | 79 | 66 | 35 | 71 | 24 | 8 | 55 | 23 | 51 | 11 | 19 | 30 | 89 | 17 | 53 | 37 |
| 15 | Alexi Murdoch | All My Days | 43 | 82 | 56 | 43 | 58 | 40 | 6 | 48 | 37 | 39 | 33 | 23 | 24 | 81 | 20 | 60 | 38 |
| 16 | strings & heart | evergreen love | 62 | 82 | 60 | 30 | 82 | 35 | 12 | 70 | 35 | 62 | 30 | 35 | 35 | 78 | 15 | 75 | 35 |
| 17 | Raffy Bushman | Abraham | 55 | 68 | 65 | 40 | 75 | 35 | 30 | 62 | 35 | 58 | 35 | 38 | 35 | 80 | 15 | 82 | 42 |
| 18 | Jack Johnson | Banana Pancakes | 63 | 85 | 65 | 21 | 74 | 31 | 6 | 39 | 42 | 49 | 21 | 42 | 22 | 92 | 12 | 60 | 25 |
| 19 | Sufjan Stevens | Mystery of Love | 58 | 66 | 56 | 30 | 80 | 20 | 32 | 45 | 30 | 47 | 36 | 28 | 41 | 89 | 1 | 60 | 45 |
| 20 | Iron & Wine | Flightless Bird, American Mouth | 47 | 75 | 62 | 23 | 62 | 41 | 17 | 65 | 31 | 30 | 24 | 25 | 21 | 90 | 4 | 73 | 31 |

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
- playlist_concept: Urban Night Reflections
- targetStats: brightness=20 warmth=50 openness=30 motion=10 intimacy=70 socialEnergy=10 tension=30 nostalgia=40 playfulness=10 dreaminess=60 energy=20 groove=40 density=30 acousticness=50 electronicness=50 vocalPresence=60 climaxIntensity=20
- contextAffinity: spring=30 summer=20 autumn=50 winter=70 morning=10 day=5 dusk=40 night=90 lateNight=80 clear=30 cloudy=50 rain=40 snow=20

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Childish Gambino | Redbone | k49I5m1J6Is | rnb-soul | alt-rnb | 84.33 | 85.4 | 84.71 | 84.75 | 79.8 | 84 |
| 2 | BIBI | Restless | se4Xsgb0qGk | rnb-soul | k-rnb | 84.32 | 86.7 | 91.29 | 86 | 63.6 | 77.75 |
| 3 | Jiselle feat. CHANGMO | LANGUAGE | nL23IBHgyYk | rnb-soul | alt-rnb | 84.26 | 85 | 85.43 | 86 | 74.4 | 85.25 |
| 4 | 채옐 | He's Something | PjREBqcLHCo | rnb-soul | k-rnb | 84.22 | 84.5 | 82.57 | 83 | 77.4 | 92.75 |
| 5 | offonoff feat. Tablo & Miso | Cigarette | AamatUtxev4 | rnb-soul | alt-rnb | 83.99 | 84.1 | 86 | 84.75 | 81.4 | 80.75 |
| 6 | Joji | SLOW DANCING IN THE DARK | K3Qzzggn--s | rnb-soul | alt-rnb | 83.81 | 87 | 82.86 | 83.5 | 79.2 | 82.75 |
| 7 | GSoul | Hate Everything | AW9jdH56MzM | rnb-soul | contemporary-rnb | 83.65 | 82.3 | 90.57 | 80.75 | 76.8 | 80 |
| 8 | Etta James | I'd Rather Go Blind | Bcus42ihkTI | rnb-soul | classic-soul | 83.6 | 83.1 | 86.43 | 82 | 81 | 82.25 |
| 9 | offonoff feat. DEAN | Gold | cgeijHtv0ic | rnb-soul | alt-rnb | 83.52 | 82 | 88.29 | 83 | 74.6 | 83.5 |
| 10 | Bill Withers | Ain't No Sunshine | YuKfiH0Scao | rnb-soul | classic-soul | 83.25 | 82.5 | 91 | 82 | 72 | 78 |
| 11 | Daniel Caesar | Japanese Denim | 4MXruqqZb8Q | rnb-soul | alt-rnb | 83.17 | 83.4 | 85.71 | 86.25 | 78.4 | 77.75 |
| 12 | DEAN | Instagram | wKyMIrBClYw | rnb-soul | alt-rnb | 83.12 | 83.1 | 84.29 | 82.5 | 83.8 | 81 |
| 13 | The Righteous Brothers | Unchained Melody | Zv8czIoAw5w | rnb-soul | classic-soul | 83.04 | 81.9 | 88.86 | 83.25 | 74 | 79.5 |
| 14 | Khalid | Location | by3yRdlQvzs | rnb-soul | contemporary-rnb | 82.96 | 82.2 | 88.29 | 83.5 | 74.4 | 79 |
| 15 | Colde | WA-R-R | mjVq7Ha_WtQ | rnb-soul | alt-rnb | 82.94 | 80.9 | 87 | 82.5 | 75.2 | 84.5 |
| 16 | Otis Redding | Try a Little Tenderness | pli44utBOwo | rnb-soul | classic-soul | 82.89 | 82.8 | 83.71 | 77.75 | 77.4 | 90.25 |
| 17 | Heize feat. DEAN & DJ Friz | And July | rCeM57e2BfU | rnb-soul | k-rnb | 82.6 | 83.5 | 81.71 | 88 | 78.4 | 80 |
| 18 | The Supremes | You Can't Hurry Love | ovoBi3pXD_A | rnb-soul | motown-soul | 82.51 | 78.8 | 85 | 82.25 | 77.6 | 88.5 |
| 19 | Heize feat. Shin Yong Jae | You, Clouds, Rain | afxLaQiLu-o | rnb-soul | k-rnb | 82.43 | 82.5 | 88 | 81.75 | 70.2 | 80 |
| 20 | The Drifters | This Magic Moment | Fx6teMogBSs | rnb-soul | classic-soul | 82.39 | 83.6 | 85.43 | 85.5 | 68.6 | 80 |
| 21 | Zion.T feat. G-DRAGON | Complex | vLzgATepxzg | rnb-soul | k-rnb | 82.36 | 82.7 | 85.14 | 83.75 | 77.8 | 77.75 |
| 22 | Hoody | Like You | JaSIPgnclCU | rnb-soul | k-rnb | 82.33 | 77.3 | 88.71 | 80.75 | 73.6 | 87 |
| 23 | Percy Sledge | When a Man Loves a Woman | KwPxhWU1koE | rnb-soul | classic-soul | 82.19 | 84.7 | 82.43 | 79 | 78.6 | 82.25 |
| 24 | Masego & FKJ | Tadow | hC8CH0Z3L54 | rnb-soul | neo-soul | 82.13 | 82.4 | 78.71 | 89.5 | 80 | 82.5 |
| 25 | Smokey Robinson | Cruisin' | Gx77P0VH6FA | rnb-soul | classic-soul | 82.07 | 82.7 | 86.57 | 79 | 74.4 | 80 |
| 26 | HONNE | Location Unknown | btIQvYcLNoI | rnb-soul | alt-rnb | 82.01 | 77.9 | 88.86 | 79 | 74.2 | 84.75 |
| 27 | Hoody feat. GRAY | Adios | 3JrDhzPoLkU | rnb-soul | k-rnb | 81.98 | 81.2 | 84.43 | 86.75 | 69.8 | 82 |
| 28 | Otis Redding | (Sittin' On) The Dock of the Bay | 7C-VscEQugk | rnb-soul | classic-soul | 81.97 | 81.1 | 87.29 | 80.25 | 73.8 | 80.25 |
| 29 | Erykah Badu | On & On | TW28iWV7nxE | rnb-soul | neo-soul | 81.8 | 80.4 | 84.86 | 81 | 71 | 86.5 |
| 30 | Ray Charles | Hit The Road Jack | uSiHqxgE2d0 | rnb-soul | classic-soul | 81.75 | 79.8 | 84.29 | 83.75 | 76.6 | 82 |

**Final 20 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 3 | Jiselle feat. CHANGMO | LANGUAGE | nL23IBHgyYk | 84.26 | 85 | 85.43 | 86 | 74.4 | 85.25 | medium |
| 2 | 4 | 채옐 | He's Something | PjREBqcLHCo | 84.22 | 84.5 | 82.57 | 83 | 77.4 | 92.75 | medium |
| 3 | 16 | Otis Redding | Try a Little Tenderness | pli44utBOwo | 82.89 | 82.8 | 83.71 | 77.75 | 77.4 | 90.25 | medium |
| 4 | 17 | Heize feat. DEAN & DJ Friz | And July | rCeM57e2BfU | 82.6 | 83.5 | 81.71 | 88 | 78.4 | 80 | medium |
| 5 | 18 | The Supremes | You Can't Hurry Love | ovoBi3pXD_A | 82.51 | 78.8 | 85 | 82.25 | 77.6 | 88.5 | medium |
| 6 | 1 | Childish Gambino | Redbone | k49I5m1J6Is | 84.33 | 85.4 | 84.71 | 84.75 | 79.8 | 84 | low |
| 7 | 2 | BIBI | Restless | se4Xsgb0qGk | 84.32 | 86.7 | 91.29 | 86 | 63.6 | 77.75 | low |
| 8 | 5 | offonoff feat. Tablo & Miso | Cigarette | AamatUtxev4 | 83.99 | 84.1 | 86 | 84.75 | 81.4 | 80.75 | low |
| 9 | 6 | Joji | SLOW DANCING IN THE DARK | K3Qzzggn--s | 83.81 | 87 | 82.86 | 83.5 | 79.2 | 82.75 | low |
| 10 | 7 | GSoul | Hate Everything | AW9jdH56MzM | 83.65 | 82.3 | 90.57 | 80.75 | 76.8 | 80 | low |
| 11 | 8 | Etta James | I'd Rather Go Blind | Bcus42ihkTI | 83.6 | 83.1 | 86.43 | 82 | 81 | 82.25 | low |
| 12 | 9 | offonoff feat. DEAN | Gold | cgeijHtv0ic | 83.52 | 82 | 88.29 | 83 | 74.6 | 83.5 | low |
| 13 | 10 | Bill Withers | Ain't No Sunshine | YuKfiH0Scao | 83.25 | 82.5 | 91 | 82 | 72 | 78 | low |
| 14 | 11 | Daniel Caesar | Japanese Denim | 4MXruqqZb8Q | 83.17 | 83.4 | 85.71 | 86.25 | 78.4 | 77.75 | low |
| 15 | 12 | DEAN | Instagram | wKyMIrBClYw | 83.12 | 83.1 | 84.29 | 82.5 | 83.8 | 81 | low |
| 16 | 13 | The Righteous Brothers | Unchained Melody | Zv8czIoAw5w | 83.04 | 81.9 | 88.86 | 83.25 | 74 | 79.5 | low |
| 17 | 14 | Khalid | Location | by3yRdlQvzs | 82.96 | 82.2 | 88.29 | 83.5 | 74.4 | 79 | low |
| 18 | 15 | Colde | WA-R-R | mjVq7Ha_WtQ | 82.94 | 80.9 | 87 | 82.5 | 75.2 | 84.5 | low |
| 19 | 19 | Heize feat. Shin Yong Jae | You, Clouds, Rain | afxLaQiLu-o | 82.43 | 82.5 | 88 | 81.75 | 70.2 | 80 | low |
| 20 | 20 | The Drifters | This Magic Moment | Fx6teMogBSs | 82.39 | 83.6 | 85.43 | 85.5 | 68.6 | 80 | low |

**Track catalog stats (17 dims, for image-stats <-> music-stats validation)**

| final pos | artist | title | brightness | warmth | openness | motion | intimacy | socialEnergy | tension | nostalgia | playfulness | dreaminess | energy | groove | density | acousticness | electronicness | vocalPresence | climaxIntensity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Jiselle feat. CHANGMO | LANGUAGE | 28 | 61 | 43 | 37 | 63 | 46 | 22 | 46 | 21 | 37 | 41 | 50 | 42 | 49 | 53 | 81 | 54 |
| 2 | 채옐 | He's Something | 45 | 62 | 48 | 38 | 68 | 40 | 25 | 40 | 40 | 55 | 42 | 55 | 45 | 30 | 40 | 72 | 48 |
| 3 | Otis Redding | Try a Little Tenderness | 34 | 88 | 46 | 30 | 66 | 29 | 43 | 52 | 24 | 38 | 59 | 52 | 41 | 49 | 38 | 70 | 49 |
| 4 | Heize feat. DEAN & DJ Friz | And July | 38 | 54 | 49 | 47 | 77 | 40 | 16 | 42 | 31 | 47 | 65 | 52 | 54 | 49 | 38 | 65 | 49 |
| 5 | The Supremes | You Can't Hurry Love | 41 | 74 | 44 | 33 | 66 | 50 | 30 | 36 | 68 | 36 | 63 | 49 | 42 | 45 | 38 | 68 | 36 |
| 6 | Childish Gambino | Redbone | 29 | 74 | 37 | 50 | 82 | 30 | 25 | 46 | 18 | 45 | 32 | 64 | 49 | 45 | 39 | 63 | 53 |
| 7 | BIBI | Restless | 40 | 65 | 34 | 31 | 80 | 11 | 5 | 39 | 41 | 65 | 20 | 47 | 25 | 53 | 43 | 84 | 35 |
| 8 | offonoff feat. Tablo & Miso | Cigarette | 42 | 64 | 53 | 40 | 79 | 14 | 16 | 48 | 31 | 46 | 35 | 53 | 55 | 52 | 46 | 81 | 38 |
| 9 | Joji | SLOW DANCING IN THE DARK | 35 | 54 | 54 | 31 | 84 | 15 | 31 | 40 | 24 | 28 | 17 | 44 | 53 | 36 | 26 | 80 | 52 |
| 10 | GSoul | Hate Everything | 13 | 59 | 39 | 47 | 87 | 28 | 43 | 65 | 40 | 48 | 37 | 57 | 36 | 52 | 46 | 65 | 35 |
| 11 | Etta James | I'd Rather Go Blind | 37 | 57 | 50 | 49 | 83 | 30 | 34 | 50 | 20 | 31 | 19 | 51 | 37 | 54 | 28 | 79 | 51 |
| 12 | offonoff feat. DEAN | Gold | 33 | 83 | 54 | 45 | 75 | 39 | 11 | 45 | 26 | 59 | 27 | 65 | 35 | 47 | 43 | 72 | 43 |
| 13 | Bill Withers | Ain't No Sunshine | 50 | 48 | 50 | 33 | 71 | 32 | 38 | 72 | 38 | 51 | 21 | 47 | 27 | 55 | 46 | 87 | 36 |
| 14 | Daniel Caesar | Japanese Denim | 44 | 60 | 37 | 39 | 78 | 51 | 10 | 38 | 29 | 66 | 24 | 71 | 34 | 57 | 27 | 75 | 36 |
| 15 | DEAN | Instagram | 50 | 71 | 38 | 29 | 89 | 23 | 14 | 36 | 34 | 45 | 18 | 60 | 45 | 40 | 34 | 72 | 55 |
| 16 | The Righteous Brothers | Unchained Melody | 54 | 59 | 35 | 39 | 65 | 39 | 15 | 48 | 33 | 36 | 33 | 49 | 40 | 47 | 45 | 84 | 34 |
| 17 | Khalid | Location | 54 | 65 | 41 | 35 | 75 | 32 | 6 | 45 | 36 | 49 | 15 | 62 | 45 | 41 | 40 | 66 | 35 |
| 18 | Colde | WA-R-R | 37 | 84 | 42 | 51 | 76 | 26 | 19 | 54 | 40 | 50 | 25 | 59 | 40 | 51 | 43 | 78 | 51 |
| 19 | Heize feat. Shin Yong Jae | You, Clouds, Rain | 45 | 61 | 34 | 31 | 76 | 52 | 30 | 69 | 25 | 38 | 14 | 64 | 28 | 43 | 32 | 73 | 34 |
| 20 | The Drifters | This Magic Moment | 47 | 62 | 46 | 36 | 77 | 46 | 34 | 45 | 36 | 65 | 37 | 59 | 37 | 40 | 43 | 74 | 48 |

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

- lane: city-pop-retro-glow | image_type: SCENE | confidence: 0.95
- playlist_concept: Lively Urban Rhythm
- targetStats: brightness=70 warmth=65 openness=65 motion=55 intimacy=40 socialEnergy=65 tension=30 nostalgia=60 playfulness=55 dreaminess=40 energy=60 groove=60 density=65 acousticness=30 electronicness=45 vocalPresence=70 climaxIntensity=50
- contextAffinity: spring=55 summer=70 autumn=50 winter=5 morning=30 day=70 dusk=40 night=5 lateNight=5 clear=60 cloudy=40 rain=10 snow=0

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | pop | city-pop | 91.81 | 95.6 | 95.29 | 89.5 | 76.2 | 90 |
| 2 | a!ka | All Bark No Bite | r7cz6RMoMKM | pop | city-pop | 91.45 | 92.7 | 95.43 | 89.75 | 78.6 | 91.25 |
| 3 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | pop | city-pop | 91.12 | 92.3 | 94.86 | 89.5 | 78.6 | 91.25 |
| 4 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | pop | teen-pop | 90.76 | 91.7 | 94.71 | 87.5 | 83.2 | 89.25 |
| 5 | The Furthermores | Show Me How | 4j6kHKqDV1k | pop | indie-pop | 90.59 | 94.5 | 93.57 | 88 | 78.4 | 87.5 |
| 6 | Young Gun Silver Fox | Just for Kicks | D0ivy-_PEIA | pop | city-pop | 89.19 | 94.9 | 93.57 | 87 | 73.4 | 81.75 |
| 7 | Young Gun Silver Fox | Winner | cYjb-vpl9Ow | pop | city-pop | 88.84 | 93.8 | 92.29 | 87 | 74.8 | 83.25 |
| 8 | Anri | Windy Summer | uQ9nsr9YoCQ | pop | city-pop | 88.62 | 93.6 | 92.57 | 85.25 | 74.6 | 83.5 |
| 9 | Jung Kook feat. Jack Harlow | 3D | mHNCM-YALSA | pop | k-pop | 88.29 | 92.7 | 91.43 | 83.75 | 82.6 | 81.5 |
| 10 | DORI | Thursday Taco Man | oyInMEY3Daw | pop | bedroom-pop | 87.97 | 87.8 | 90 | 88.25 | 80 | 89.25 |
| 11 | Cavetown | Boys Will Be Bugs | uREGk0fT0GQ | pop | bedroom-pop | 87.91 | 92.4 | 91 | 83.75 | 81 | 81.5 |
| 12 | Astels | Real Things | LaJEW4OsixA | pop | indie-pop | 87.52 | 93.3 | 90.14 | 87 | 76.6 | 78.5 |
| 13 | Bronze feat. Yukika | Orange Road | Uoutn3GVHqs | pop | city-pop | 87.31 | 91.7 | 90.14 | 83.25 | 75.6 | 84.75 |
| 14 | Piper | Summer Breeze | z8UYBunE6Kk | pop | city-pop | 87.2 | 89.6 | 91.14 | 83.25 | 79.6 | 83.5 |
| 15 | 외동아들 김승기 | 여튼 | mhzO0YLO5QQ | pop | dance-pop | 87.13 | 87.3 | 92.71 | 83.75 | 77 | 85.75 |
| 16 | Meiko Nakahara | Dance In The Memories | OYr736N9GEs | pop | city-pop | 87.01 | 94.9 | 88 | 82.75 | 81.8 | 77 |
| 17 | Disclosure feat. Sam Smith | Latch | 93ASUImTedo | pop | electropop | 86.98 | 92.2 | 90 | 81.25 | 76.8 | 83 |
| 18 | Junko Ohashi | Telephone Number | XJWqHmY-g9U | pop | city-pop | 86.86 | 95 | 90.29 | 78.5 | 75.4 | 79.75 |
| 19 | Anri | Remember Summer Days | yHKb38-nl3U | pop | city-pop | 86.84 | 91.9 | 94.29 | 80.5 | 71 | 78.75 |
| 20 | Katy Perry | Last Friday Night (T.G.I.F.) | IVB9Yjjvw54 | pop | dance-pop | 86.83 | 90.1 | 93.86 | 81.25 | 70.8 | 82.5 |
| 21 | Harry Styles | As It Was | H5v3kku4y6Q | pop | soft-pop | 86.78 | 92.8 | 91.43 | 81.25 | 77.4 | 77.25 |
| 22 | CORTIS | FaSHioN | 42wfEs7oIP8 | pop | k-pop | 86.74 | 88.3 | 92.43 | 82.75 | 73.6 | 85 |
| 23 | Jung Kook | Standing Next to You | UNo0TG9LwwI | pop | k-pop | 86.74 | 93.1 | 88.14 | 80.75 | 81.8 | 80.5 |
| 24 | Kim Hyun Chul | A Night Like Tonight | GQ7eGz3zJZ4 | pop | city-pop | 86.72 | 92.1 | 91.57 | 79.75 | 81.4 | 76.75 |
| 25 | 외동아들 김승기 | SNL | LSrHTs2gd9Y | pop | dance-pop | 86.71 | 83.4 | 90.29 | 88 | 79 | 90 |
| 26 | Jakubi | Couch Potato | uX8yoT9ct6k | pop | indie-pop | 86.58 | 91.2 | 90.86 | 86.5 | 73.6 | 77.5 |
| 27 | Doja Cat | Say So | uAYG46w1SCA | pop | dance-pop | 86.57 | 90.6 | 93.29 | 78.5 | 77.4 | 79.25 |
| 28 | Zedd & Alessia Cara | Stay | h--P8HzYZ74 | pop | electropop | 86.56 | 93.3 | 89.14 | 83.25 | 76 | 78.25 |
| 29 | Maggie Lindemann | self sabotage | COPcgCmEktY | pop | teen-pop | 86.55 | 90.5 | 92.14 | 80.25 | 77.2 | 80 |
| 30 | Clairo | Bags | L9HYJbe9Y18 | pop | bedroom-pop | 86.55 | 92.4 | 90.14 | 82 | 78.6 | 77.5 |

**Final 20 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | 91.81 | 95.6 | 95.29 | 89.5 | 76.2 | 90 | medium |
| 2 | 2 | a!ka | All Bark No Bite | r7cz6RMoMKM | 91.45 | 92.7 | 95.43 | 89.75 | 78.6 | 91.25 | medium |
| 3 | 3 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | 91.12 | 92.3 | 94.86 | 89.5 | 78.6 | 91.25 | medium |
| 4 | 4 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | 90.76 | 91.7 | 94.71 | 87.5 | 83.2 | 89.25 | medium |
| 5 | 5 | The Furthermores | Show Me How | 4j6kHKqDV1k | 90.59 | 94.5 | 93.57 | 88 | 78.4 | 87.5 | medium |
| 6 | 6 | Young Gun Silver Fox | Just for Kicks | D0ivy-_PEIA | 89.19 | 94.9 | 93.57 | 87 | 73.4 | 81.75 | medium |
| 7 | 7 | Young Gun Silver Fox | Winner | cYjb-vpl9Ow | 88.84 | 93.8 | 92.29 | 87 | 74.8 | 83.25 | medium |
| 8 | 8 | Anri | Windy Summer | uQ9nsr9YoCQ | 88.62 | 93.6 | 92.57 | 85.25 | 74.6 | 83.5 | medium |
| 9 | 9 | Jung Kook feat. Jack Harlow | 3D | mHNCM-YALSA | 88.29 | 92.7 | 91.43 | 83.75 | 82.6 | 81.5 | medium |
| 10 | 10 | DORI | Thursday Taco Man | oyInMEY3Daw | 87.97 | 87.8 | 90 | 88.25 | 80 | 89.25 | medium |
| 11 | 20 | Katy Perry | Last Friday Night (T.G.I.F.) | IVB9Yjjvw54 | 86.83 | 90.1 | 93.86 | 81.25 | 70.8 | 82.5 | high |
| 12 | 11 | Cavetown | Boys Will Be Bugs | uREGk0fT0GQ | 87.91 | 92.4 | 91 | 83.75 | 81 | 81.5 | medium |
| 13 | 12 | Astels | Real Things | LaJEW4OsixA | 87.52 | 93.3 | 90.14 | 87 | 76.6 | 78.5 | medium |
| 14 | 13 | Bronze feat. Yukika | Orange Road | Uoutn3GVHqs | 87.31 | 91.7 | 90.14 | 83.25 | 75.6 | 84.75 | medium |
| 15 | 14 | Piper | Summer Breeze | z8UYBunE6Kk | 87.2 | 89.6 | 91.14 | 83.25 | 79.6 | 83.5 | medium |
| 16 | 15 | 외동아들 김승기 | 여튼 | mhzO0YLO5QQ | 87.13 | 87.3 | 92.71 | 83.75 | 77 | 85.75 | medium |
| 17 | 16 | Meiko Nakahara | Dance In The Memories | OYr736N9GEs | 87.01 | 94.9 | 88 | 82.75 | 81.8 | 77 | medium |
| 18 | 17 | Disclosure feat. Sam Smith | Latch | 93ASUImTedo | 86.98 | 92.2 | 90 | 81.25 | 76.8 | 83 | medium |
| 19 | 18 | Junko Ohashi | Telephone Number | XJWqHmY-g9U | 86.86 | 95 | 90.29 | 78.5 | 75.4 | 79.75 | medium |
| 20 | 19 | Anri | Remember Summer Days | yHKb38-nl3U | 86.84 | 91.9 | 94.29 | 80.5 | 71 | 78.75 | medium |

**Track catalog stats (17 dims, for image-stats <-> music-stats validation)**

| final pos | artist | title | brightness | warmth | openness | motion | intimacy | socialEnergy | tension | nostalgia | playfulness | dreaminess | energy | groove | density | acousticness | electronicness | vocalPresence | climaxIntensity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | WhiteUsedSocks | How I Wish! | 65 | 58 | 62 | 55 | 40 | 58 | 22 | 55 | 62 | 38 | 58 | 68 | 55 | 30 | 45 | 62 | 55 |
| 2 | a!ka | All Bark No Bite | 68 | 55 | 60 | 58 | 35 | 62 | 25 | 45 | 70 | 30 | 62 | 65 | 55 | 25 | 45 | 68 | 58 |
| 3 | 박문치 | J U S T F U N (with 죠지) | 62 | 62 | 65 | 58 | 40 | 65 | 20 | 35 | 75 | 32 | 60 | 70 | 55 | 30 | 42 | 65 | 58 |
| 4 | Mikayla Geier | Ring Pop | 75 | 55 | 62 | 55 | 45 | 62 | 20 | 30 | 72 | 40 | 58 | 52 | 45 | 30 | 45 | 72 | 55 |
| 5 | The Furthermores | Show Me How | 68 | 55 | 60 | 58 | 40 | 60 | 25 | 40 | 60 | 40 | 60 | 55 | 50 | 35 | 35 | 68 | 58 |
| 6 | Young Gun Silver Fox | Just for Kicks | 72 | 70 | 65 | 62 | 52 | 62 | 18 | 62 | 58 | 35 | 58 | 68 | 55 | 38 | 55 | 72 | 55 |
| 7 | Young Gun Silver Fox | Winner | 75 | 68 | 62 | 65 | 48 | 65 | 15 | 65 | 60 | 32 | 62 | 70 | 55 | 42 | 52 | 75 | 58 |
| 8 | Anri | Windy Summer | 78 | 68 | 68 | 62 | 45 | 58 | 18 | 70 | 62 | 38 | 58 | 65 | 52 | 32 | 62 | 78 | 55 |
| 9 | Jung Kook feat. Jack Harlow | 3D | 64 | 65 | 52 | 47 | 33 | 64 | 32 | 45 | 67 | 31 | 50 | 63 | 57 | 21 | 64 | 63 | 54 |
| 10 | DORI | Thursday Taco Man | 60 | 50 | 55 | 45 | 45 | 50 | 20 | 30 | 72 | 40 | 48 | 50 | 42 | 35 | 42 | 58 | 45 |
| 11 | Katy Perry | Last Friday Night (T.G.I.F.) | 54 | 56 | 57 | 56 | 29 | 67 | 40 | 23 | 57 | 43 | 68 | 57 | 59 | 38 | 50 | 67 | 60 |
| 12 | Cavetown | Boys Will Be Bugs | 63 | 67 | 49 | 45 | 41 | 65 | 32 | 43 | 71 | 35 | 57 | 55 | 39 | 23 | 48 | 59 | 58 |
| 13 | Astels | Real Things | 72 | 68 | 65 | 58 | 60 | 58 | 20 | 50 | 62 | 45 | 58 | 55 | 48 | 55 | 35 | 78 | 52 |
| 14 | Bronze feat. Yukika | Orange Road | 61 | 70 | 67 | 65 | 32 | 67 | 32 | 30 | 55 | 25 | 48 | 45 | 61 | 34 | 71 | 76 | 48 |
| 15 | Piper | Summer Breeze | 54 | 71 | 44 | 66 | 46 | 56 | 28 | 37 | 62 | 37 | 51 | 48 | 54 | 38 | 50 | 78 | 59 |
| 16 | 외동아들 김승기 | 여튼 | 55 | 48 | 50 | 45 | 35 | 58 | 25 | 35 | 68 | 25 | 48 | 45 | 45 | 30 | 45 | 68 | 48 |
| 17 | Meiko Nakahara | Dance In The Memories | 71 | 59 | 63 | 57 | 29 | 71 | 35 | 66 | 58 | 31 | 56 | 85 | 47 | 20 | 58 | 71 | 63 |
| 18 | Disclosure feat. Sam Smith | Latch | 54 | 60 | 63 | 62 | 40 | 69 | 30 | 27 | 65 | 39 | 42 | 62 | 54 | 40 | 60 | 70 | 64 |
| 19 | Junko Ohashi | Telephone Number | 68 | 63 | 63 | 54 | 33 | 63 | 20 | 44 | 58 | 45 | 46 | 81 | 57 | 34 | 56 | 61 | 49 |
| 20 | Anri | Remember Summer Days | 54 | 50 | 49 | 55 | 33 | 66 | 27 | 49 | 64 | 43 | 63 | 61 | 49 | 35 | 50 | 79 | 51 |

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

- lane: k-indie-rainy-room | image_type: SCENE | confidence: 0.98
- playlist_concept: Rainy Autumn Walk
- targetStats: brightness=40 warmth=60 openness=50 motion=20 intimacy=70 socialEnergy=20 tension=30 nostalgia=80 playfulness=20 dreaminess=60 energy=20 groove=20 density=40 acousticness=80 electronicness=10 vocalPresence=70 climaxIntensity=30
- contextAffinity: spring=40 summer=20 autumn=90 winter=50 morning=40 day=70 dusk=50 night=20 lateNight=10 clear=30 cloudy=70 rain=90 snow=10

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Rinko Nagai | 雨宿らず | dWd5mWQ_bpA | folk-acoustic | singer-songwriter | 87.97 | 92.3 | 92.43 | 82.25 | 72.4 | 86.5 |
| 2 | The Lumineers | Ophelia | pTOC_q0NLTk | folk-acoustic | folk-pop | 86.66 | 90.5 | 89.14 | 76.25 | 91 | 81.5 |
| 3 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 86.47 | 93 | 88.14 | 85.75 | 79 | 75.75 |
| 4 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | folk-acoustic | singer-songwriter | 85.12 | 86.5 | 93.14 | 76.25 | 85.8 | 74.75 |
| 5 | José González | Heartbeats | ik_BQYbbZ5U | folk-acoustic | singer-songwriter | 84.84 | 88.6 | 92.71 | 70.75 | 89.6 | 72.5 |
| 6 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | folk-acoustic | singer-songwriter | 84.79 | 86.7 | 92.86 | 75.25 | 88 | 72.25 |
| 7 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | folk-acoustic | indie-folk | 84.56 | 86.9 | 91.14 | 70.75 | 91 | 76.25 |
| 8 | Raffy Bushman | Abraham | cJ3Pm-HpG_o | folk-acoustic | singer-songwriter | 84.05 | 88.7 | 90.43 | 79.5 | 76.2 | 71.75 |
| 9 | The Gaslight Anthem | The '59 Sound | G1lq40tR72Q | folk-acoustic | americana | 83.61 | 86.1 | 87 | 80.25 | 86.2 | 73.5 |
| 10 | Alexi Murdoch | Orange Sky | vy_Em1i9BAA | folk-acoustic | singer-songwriter | 83.52 | 84.8 | 91.71 | 68.75 | 87.4 | 76.75 |
| 11 | Sufjan Stevens | Mystery of Love | 4WTt69YO2VI | folk-acoustic | indie-folk | 83.51 | 89 | 90.29 | 71.25 | 81.2 | 72.75 |
| 12 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | folk-acoustic | singer-songwriter | 83.4 | 87.9 | 87.29 | 75.25 | 89.4 | 70.75 |
| 13 | Bon Iver | Holocene | MjxA25Tj1Ks | folk-acoustic | indie-folk | 83.34 | 85 | 92.57 | 72.25 | 80.2 | 74.75 |
| 14 | strings & heart | evergreen love | QJBm_SE4fC0 | folk-acoustic | indie-folk | 83.2 | 86.4 | 93.29 | 76.25 | 75.4 | 68.75 |
| 15 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | folk-acoustic | singer-songwriter | 82.9 | 86.9 | 91.43 | 66.25 | 84.4 | 73.5 |
| 16 | Alexi Murdoch | All My Days | 5NFkFVe93NM | folk-acoustic | singer-songwriter | 82.53 | 82 | 91.29 | 72.75 | 84.6 | 74.5 |
| 17 | The Lumineers | Cleopatra | aN5s9N_pTUs | folk-acoustic | folk-pop | 82.46 | 85.2 | 89.29 | 72.25 | 80.6 | 74.75 |
| 18 | Lord Huron | The Night We Met | KtlgYxa6BMU | folk-acoustic | cinematic-folk | 82.44 | 85.1 | 88.14 | 78.75 | 83.8 | 68.5 |
| 19 | The Head and the Heart | Lost in My Mind | is7rrC-jH_A | folk-acoustic | indie-folk | 81.88 | 83.3 | 89.29 | 69.5 | 83.2 | 75.75 |
| 20 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | folk-acoustic | indie-folk | 81.71 | 82.9 | 90.14 | 70.25 | 89.8 | 68.5 |
| 21 | The Vaniers | Milk & Honey | OMmz0ZgwvWk | folk-acoustic | singer-songwriter | 81.41 | 82.9 | 90 | 75 | 79.4 | 69 |
| 22 | Gregory Alan Isakov | The Stable Song | jGDjO9kuKyY | folk-acoustic | singer-songwriter | 81.39 | 81.6 | 93.57 | 64.5 | 81.4 | 73.5 |
| 23 | Lord Huron | Meet Me in the Woods | cYy7ljx7fyc | folk-acoustic | cinematic-folk | 81.05 | 82.4 | 88 | 70.5 | 85.2 | 72.25 |
| 24 | Finn Askew | Aftertaste | HFQyMYzEoNo | folk-acoustic | singer-songwriter | 81.05 | 84 | 84.71 | 78.25 | 78.6 | 72.25 |
| 25 | Jack Johnson | Better Together | fqxNYjDFJUk | folk-acoustic | singer-songwriter | 80.98 | 79.2 | 91.57 | 62.5 | 88.2 | 77 |
| 26 | Lord Huron | Ends of the Earth | -MH-UmYkXiM | folk-acoustic | cinematic-folk | 80.75 | 83.4 | 85 | 69.25 | 88.2 | 73.5 |
| 27 | Penelope Road | Chance Encounter | G8NzCr3J1_w | folk-acoustic | indie-folk | 80.61 | 83.7 | 85.43 | 75.25 | 79 | 71.25 |
| 28 | Jack Johnson | Banana Pancakes | YdgoG8hTMUw | folk-acoustic | singer-songwriter | 80.19 | 82.3 | 90 | 61.25 | 86.2 | 71.25 |
| 29 | Stacey Ryan | Good To Be Alone (feat. Cory Henry) | BKv-HXnZBTM | folk-acoustic | singer-songwriter | 79.15 | 81.9 | 83.57 | 75.75 | 75 | 71 |
| 30 | Gloria Tells | Climb Down From Your Pedestal | TxwAPQDErPw | folk-acoustic | singer-songwriter | 79.03 | 78.9 | 83.29 | 75.75 | 84.4 | 70.5 |

**Final 20 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2 | The Lumineers | Ophelia | pTOC_q0NLTk | 86.66 | 90.5 | 89.14 | 76.25 | 91 | 81.5 | medium |
| 2 | 3 | Victor Lundberg | Come Back Again | dzoxC8dedXw | 86.47 | 93 | 88.14 | 85.75 | 79 | 75.75 | medium |
| 3 | 17 | The Lumineers | Cleopatra | aN5s9N_pTUs | 82.46 | 85.2 | 89.29 | 72.25 | 80.6 | 74.75 | medium |
| 4 | 19 | The Head and the Heart | Lost in My Mind | is7rrC-jH_A | 81.88 | 83.3 | 89.29 | 69.5 | 83.2 | 75.75 | medium |
| 5 | 20 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | 81.71 | 82.9 | 90.14 | 70.25 | 89.8 | 68.5 | medium |
| 6 | 9 | The Gaslight Anthem | The '59 Sound | G1lq40tR72Q | 83.61 | 86.1 | 87 | 80.25 | 86.2 | 73.5 | high |
| 7 | 1 | Rinko Nagai | 雨宿らず | dWd5mWQ_bpA | 87.97 | 92.3 | 92.43 | 82.25 | 72.4 | 86.5 | low |
| 8 | 4 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | 85.12 | 86.5 | 93.14 | 76.25 | 85.8 | 74.75 | low |
| 9 | 5 | José González | Heartbeats | ik_BQYbbZ5U | 84.84 | 88.6 | 92.71 | 70.75 | 89.6 | 72.5 | low |
| 10 | 6 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | 84.79 | 86.7 | 92.86 | 75.25 | 88 | 72.25 | low |
| 11 | 7 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | 84.56 | 86.9 | 91.14 | 70.75 | 91 | 76.25 | low |
| 12 | 8 | Raffy Bushman | Abraham | cJ3Pm-HpG_o | 84.05 | 88.7 | 90.43 | 79.5 | 76.2 | 71.75 | low |
| 13 | 10 | Alexi Murdoch | Orange Sky | vy_Em1i9BAA | 83.52 | 84.8 | 91.71 | 68.75 | 87.4 | 76.75 | low |
| 14 | 11 | Sufjan Stevens | Mystery of Love | 4WTt69YO2VI | 83.51 | 89 | 90.29 | 71.25 | 81.2 | 72.75 | low |
| 15 | 12 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | 83.4 | 87.9 | 87.29 | 75.25 | 89.4 | 70.75 | low |
| 16 | 13 | Bon Iver | Holocene | MjxA25Tj1Ks | 83.34 | 85 | 92.57 | 72.25 | 80.2 | 74.75 | low |
| 17 | 14 | strings & heart | evergreen love | QJBm_SE4fC0 | 83.2 | 86.4 | 93.29 | 76.25 | 75.4 | 68.75 | low |
| 18 | 15 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | 82.9 | 86.9 | 91.43 | 66.25 | 84.4 | 73.5 | low |
| 19 | 16 | Alexi Murdoch | All My Days | 5NFkFVe93NM | 82.53 | 82 | 91.29 | 72.75 | 84.6 | 74.5 | low |
| 20 | 18 | Lord Huron | The Night We Met | KtlgYxa6BMU | 82.44 | 85.1 | 88.14 | 78.75 | 83.8 | 68.5 | low |

**Track catalog stats (17 dims, for image-stats <-> music-stats validation)**

| final pos | artist | title | brightness | warmth | openness | motion | intimacy | socialEnergy | tension | nostalgia | playfulness | dreaminess | energy | groove | density | acousticness | electronicness | vocalPresence | climaxIntensity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | The Lumineers | Ophelia | 44 | 91 | 49 | 47 | 56 | 21 | 29 | 81 | 23 | 48 | 66 | 23 | 33 | 80 | 7 | 57 | 34 |
| 2 | Victor Lundberg | Come Back Again | 45 | 55 | 45 | 25 | 60 | 25 | 30 | 60 | 20 | 45 | 45 | 30 | 35 | 60 | 20 | 62 | 35 |
| 3 | The Lumineers | Cleopatra | 51 | 84 | 49 | 33 | 65 | 34 | 10 | 59 | 34 | 35 | 40 | 33 | 29 | 88 | 15 | 56 | 26 |
| 4 | The Head and the Heart | Lost in My Mind | 57 | 90 | 64 | 43 | 59 | 23 | 39 | 58 | 28 | 30 | 45 | 24 | 34 | 94 | 20 | 65 | 19 |
| 5 | The Head and the Heart | Rivers and Roads | 61 | 70 | 64 | 47 | 56 | 32 | 9 | 72 | 37 | 33 | 43 | 20 | 31 | 93 | 22 | 68 | 20 |
| 6 | The Gaslight Anthem | The '59 Sound | 46 | 61 | 64 | 67 | 55 | 38 | 24 | 80 | 26 | 34 | 76 | 26 | 32 | 89 | 14 | 75 | 27 |
| 7 | Rinko Nagai | 雨宿らず | 45 | 58 | 55 | 38 | 80 | 32 | 30 | 65 | 28 | 62 | 28 | 38 | 35 | 80 | 15 | 82 | 35 |
| 8 | Iron & Wine | Flightless Bird, American Mouth | 47 | 75 | 62 | 23 | 62 | 41 | 17 | 65 | 31 | 30 | 24 | 25 | 21 | 90 | 4 | 73 | 31 |
| 9 | José González | Heartbeats | 49 | 71 | 60 | 30 | 63 | 20 | 11 | 48 | 29 | 53 | 24 | 31 | 18 | 86 | 6 | 67 | 31 |
| 10 | Gregory Alan Isakov | Amsterdam | 45 | 60 | 79 | 37 | 52 | 37 | 9 | 76 | 31 | 49 | 21 | 27 | 32 | 89 | 19 | 58 | 34 |
| 11 | Angus & Julia Stone | Big Jet Plane | 46 | 69 | 79 | 25 | 62 | 27 | 23 | 58 | 46 | 72 | 28 | 36 | 27 | 85 | 7 | 53 | 30 |
| 12 | Raffy Bushman | Abraham | 55 | 68 | 65 | 40 | 75 | 35 | 30 | 62 | 35 | 58 | 35 | 38 | 35 | 80 | 15 | 82 | 42 |
| 13 | Alexi Murdoch | Orange Sky | 58 | 87 | 89 | 23 | 64 | 26 | 29 | 74 | 43 | 37 | 30 | 25 | 20 | 73 | 1 | 75 | 28 |
| 14 | Sufjan Stevens | Mystery of Love | 58 | 66 | 56 | 30 | 80 | 20 | 32 | 45 | 30 | 47 | 36 | 28 | 41 | 89 | 1 | 60 | 45 |
| 15 | Gregory Alan Isakov | Big Black Car | 50 | 61 | 49 | 29 | 61 | 0 | 31 | 41 | 39 | 48 | 29 | 36 | 3 | 77 | 16 | 58 | 24 |
| 16 | Bon Iver | Holocene | 54 | 67 | 85 | 31 | 79 | 27 | 33 | 55 | 40 | 41 | 24 | 27 | 20 | 91 | 7 | 69 | 36 |
| 17 | strings & heart | evergreen love | 62 | 82 | 60 | 30 | 82 | 35 | 12 | 70 | 35 | 62 | 30 | 35 | 35 | 78 | 15 | 75 | 35 |
| 18 | Iron & Wine | Naked as We Came | 57 | 79 | 66 | 35 | 71 | 24 | 8 | 55 | 23 | 51 | 11 | 19 | 30 | 89 | 17 | 53 | 37 |
| 19 | Alexi Murdoch | All My Days | 43 | 82 | 56 | 43 | 58 | 40 | 6 | 48 | 37 | 39 | 33 | 23 | 24 | 81 | 20 | 60 | 38 |
| 20 | Lord Huron | The Night We Met | 61 | 44 | 68 | 28 | 62 | 14 | 22 | 100 | 36 | 32 | 13 | 39 | 26 | 94 | 6 | 65 | 50 |

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
- playlist_concept: Sunlit Journey Soundtrack
- targetStats: brightness=80 warmth=85 openness=90 motion=60 intimacy=30 socialEnergy=20 tension=20 nostalgia=70 playfulness=50 dreaminess=80 energy=50 groove=60 density=40 acousticness=70 electronicness=30 vocalPresence=60 climaxIntensity=50
- contextAffinity: spring=30 summer=60 autumn=70 winter=10 morning=20 day=40 dusk=80 night=30 lateNight=10 clear=90 cloudy=20 rain=10 snow=0

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | E:um | Today's Journey | I0eLBDc82Tk | folk-acoustic | indie-folk | 85.51 | 85.7 | 95.29 | 78.5 | 74 | 80.25 |
| 2 | Jordan Lee | Love Ride | j7wBND-RyCM | folk-acoustic | indie-folk | 82.31 | 82.6 | 93.71 | 75.75 | 72.2 | 72.25 |
| 3 | wave to earth | surf. | K45Ibt2xKj8 | rock | dream-pop | 81.77 | 83 | 88.43 | 73.75 | 72.4 | 80.25 |
| 4 | Finn Askew | Aftertaste | HFQyMYzEoNo | folk-acoustic | singer-songwriter | 81.12 | 83.1 | 92.71 | 79.75 | 73.8 | 60.25 |
| 5 | Natalie Layne | Grateful For | W4XjEvvq7W8 | folk-acoustic | singer-songwriter | 80.95 | 81.3 | 92.43 | 78.25 | 74.2 | 64.5 |
| 6 | The 1975 | About You | tGv7CUutzqU | rock | indie-rock | 80.77 | 82.9 | 86.43 | 69.25 | 85.6 | 73.5 |
| 7 | Penelope Road | Chance Encounter | G8NzCr3J1_w | folk-acoustic | indie-folk | 80.76 | 82.4 | 92.57 | 77.75 | 74.2 | 61.25 |
| 8 | Cocteau Twins | Heaven or Las Vegas | 6KnYw4EwYGc | rock | dream-pop | 80.16 | 87.1 | 82.71 | 76.25 | 75.8 | 68 |
| 9 | Weezer | Say It Ain't So | OoPHItnUFkw | rock | power-pop | 80 | 74.3 | 87.86 | 87.75 | 81.4 | 67 |
| 10 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | rock | indie-rock | 79.94 | 76.1 | 91.14 | 79.75 | 80.2 | 65.25 |
| 11 | Travis | Why Does It Always Rain On Me? | PXatLOWjr-k | rock | britpop | 79.52 | 78.2 | 86.86 | 82 | 76.2 | 67.25 |
| 12 | Modest Mouse | Float On | CTAud5O7Qqk | rock | indie-rock | 79.46 | 73 | 89.86 | 82.75 | 75 | 71.25 |
| 13 | Spoon | The Underdog | p50JG49loH8 | rock | indie-rock | 79.24 | 75.8 | 92.14 | 73 | 72.2 | 71.25 |
| 14 | Stereophonics | Maybe Tomorrow | 2q9_ZEtuTR8 | rock | britpop | 79.22 | 76.7 | 91.29 | 77.75 | 76.4 | 63.5 |
| 15 | Oasis | Don't Look Back In Anger | cmpRLQZkTb8 | rock | britpop | 79.18 | 78.7 | 88.43 | 79.75 | 71.8 | 66 |
| 16 | ASIAN KUNG-FU GENERATION | Solanin | xZD1B1TskXs | rock | j-rock | 79.17 | 75.9 | 88.86 | 79 | 76.2 | 68.5 |
| 17 | Wilco | Heavy Metal Drummer | yeuIQFF7z6E | rock | indie-rock | 79.16 | 75.4 | 87.43 | 88 | 77 | 62.75 |
| 18 | strings & heart | evergreen love | QJBm_SE4fC0 | folk-acoustic | indie-folk | 79.13 | 81.1 | 85.29 | 76.25 | 74.6 | 68.75 |
| 19 | Lorde | Ribs | b7pE8AG1jjE | rock | dream-pop | 79.03 | 80.2 | 85.57 | 70.75 | 79.2 | 71.75 |
| 20 | Gloria Tells | Climb Down From Your Pedestal | TxwAPQDErPw | folk-acoustic | singer-songwriter | 79.01 | 76.2 | 89 | 79.75 | 74.4 | 67 |
| 21 | The Vaniers | Milk & Honey | OMmz0ZgwvWk | folk-acoustic | singer-songwriter | 78.97 | 83 | 87.43 | 77.5 | 72.2 | 60 |
| 22 | The Lumineers | Ophelia | pTOC_q0NLTk | folk-acoustic | folk-pop | 78.96 | 79.8 | 84 | 78.75 | 82.6 | 65 |
| 23 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | folk-acoustic | indie-folk | 78.91 | 81.6 | 82.14 | 72.75 | 82.2 | 71 |
| 24 | Stacey Ryan | Good To Be Alone (feat. Cory Henry) | BKv-HXnZBTM | folk-acoustic | singer-songwriter | 78.9 | 82 | 90.71 | 77.25 | 70.2 | 56.5 |
| 25 | Broccoli, you too | 보편적인 노래 | zrXHySXfdhk | folk-acoustic | indie-folk | 78.8 | 82.6 | 81.86 | 66.75 | 79.8 | 76.5 |
| 26 | NELL | 지구가 태양을 네 번 | g5cVE-i5wHI | rock | k-indie-rock | 78.73 | 73.5 | 91.29 | 80 | 78.4 | 63 |
| 27 | DAY6 | Time of Our Life | vnS_jn2uibs | rock | k-indie-rock | 78.71 | 76.5 | 85.43 | 75.5 | 78.6 | 73 |
| 28 | JANNABI | For Lovers Who Hesitate | GdoNGNe5CSg | rock | k-indie-rock | 78.71 | 82.3 | 82.57 | 76 | 69 | 73 |
| 29 | Oasis | Champagne Supernova | tI-5uv4wryI | rock | britpop | 78.7 | 77.4 | 90.71 | 75.75 | 77.2 | 61.25 |
| 30 | José González | Stay Alive | NucJk8TxyRg | folk-acoustic | singer-songwriter | 78.58 | 83.4 | 79.43 | 70.25 | 79.8 | 74.75 |

**Final 20 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | E:um | Today's Journey | I0eLBDc82Tk | 85.51 | 85.7 | 95.29 | 78.5 | 74 | 80.25 | medium |
| 2 | 2 | Jordan Lee | Love Ride | j7wBND-RyCM | 82.31 | 82.6 | 93.71 | 75.75 | 72.2 | 72.25 | medium |
| 3 | 3 | wave to earth | surf. | K45Ibt2xKj8 | 81.77 | 83 | 88.43 | 73.75 | 72.4 | 80.25 | medium |
| 4 | 6 | The 1975 | About You | tGv7CUutzqU | 80.77 | 82.9 | 86.43 | 69.25 | 85.6 | 73.5 | medium |
| 5 | 8 | Cocteau Twins | Heaven or Las Vegas | 6KnYw4EwYGc | 80.16 | 87.1 | 82.71 | 76.25 | 75.8 | 68 | medium |
| 6 | 9 | Weezer | Say It Ain't So | OoPHItnUFkw | 80 | 74.3 | 87.86 | 87.75 | 81.4 | 67 | medium |
| 7 | 10 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | 79.94 | 76.1 | 91.14 | 79.75 | 80.2 | 65.25 | medium |
| 8 | 11 | Travis | Why Does It Always Rain On Me? | PXatLOWjr-k | 79.52 | 78.2 | 86.86 | 82 | 76.2 | 67.25 | medium |
| 9 | 12 | Modest Mouse | Float On | CTAud5O7Qqk | 79.46 | 73 | 89.86 | 82.75 | 75 | 71.25 | medium |
| 10 | 13 | Spoon | The Underdog | p50JG49loH8 | 79.24 | 75.8 | 92.14 | 73 | 72.2 | 71.25 | medium |
| 11 | 14 | Stereophonics | Maybe Tomorrow | 2q9_ZEtuTR8 | 79.22 | 76.7 | 91.29 | 77.75 | 76.4 | 63.5 | medium |
| 12 | 15 | Oasis | Don't Look Back In Anger | cmpRLQZkTb8 | 79.18 | 78.7 | 88.43 | 79.75 | 71.8 | 66 | medium |
| 13 | 16 | ASIAN KUNG-FU GENERATION | Solanin | xZD1B1TskXs | 79.17 | 75.9 | 88.86 | 79 | 76.2 | 68.5 | medium |
| 14 | 17 | Wilco | Heavy Metal Drummer | yeuIQFF7z6E | 79.16 | 75.4 | 87.43 | 88 | 77 | 62.75 | medium |
| 15 | 19 | Lorde | Ribs | b7pE8AG1jjE | 79.03 | 80.2 | 85.57 | 70.75 | 79.2 | 71.75 | medium |
| 16 | 4 | Finn Askew | Aftertaste | HFQyMYzEoNo | 81.12 | 83.1 | 92.71 | 79.75 | 73.8 | 60.25 | low |
| 17 | 5 | Natalie Layne | Grateful For | W4XjEvvq7W8 | 80.95 | 81.3 | 92.43 | 78.25 | 74.2 | 64.5 | low |
| 18 | 7 | Penelope Road | Chance Encounter | G8NzCr3J1_w | 80.76 | 82.4 | 92.57 | 77.75 | 74.2 | 61.25 | low |
| 19 | 18 | strings & heart | evergreen love | QJBm_SE4fC0 | 79.13 | 81.1 | 85.29 | 76.25 | 74.6 | 68.75 | low |
| 20 | 20 | Gloria Tells | Climb Down From Your Pedestal | TxwAPQDErPw | 79.01 | 76.2 | 89 | 79.75 | 74.4 | 67 | medium |

**Track catalog stats (17 dims, for image-stats <-> music-stats validation)**

| final pos | artist | title | brightness | warmth | openness | motion | intimacy | socialEnergy | tension | nostalgia | playfulness | dreaminess | energy | groove | density | acousticness | electronicness | vocalPresence | climaxIntensity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | E:um | Today's Journey | 70 | 68 | 78 | 55 | 45 | 50 | 18 | 45 | 48 | 55 | 52 | 45 | 42 | 68 | 25 | 55 | 48 |
| 2 | Jordan Lee | Love Ride | 70 | 72 | 68 | 58 | 62 | 55 | 18 | 55 | 58 | 45 | 52 | 52 | 42 | 72 | 22 | 80 | 48 |
| 3 | wave to earth | surf. | 68 | 65 | 68 | 62 | 52 | 55 | 15 | 50 | 60 | 58 | 52 | 58 | 48 | 45 | 62 | 72 | 50 |
| 4 | The 1975 | About You | 71 | 66 | 64 | 63 | 45 | 60 | 22 | 62 | 43 | 38 | 57 | 57 | 40 | 30 | 58 | 73 | 46 |
| 5 | Cocteau Twins | Heaven or Las Vegas | 72 | 60 | 75 | 45 | 42 | 30 | 18 | 62 | 28 | 92 | 48 | 35 | 60 | 35 | 62 | 65 | 52 |
| 6 | Weezer | Say It Ain't So | 50 | 64 | 58 | 59 | 35 | 53 | 70 | 67 | 33 | 15 | 56 | 48 | 52 | 57 | 44 | 73 | 65 |
| 7 | 딕펑스 | 평행성 (feat. Jukjae) | 50 | 58 | 55 | 45 | 55 | 45 | 32 | 45 | 40 | 45 | 48 | 55 | 52 | 40 | 30 | 68 | 55 |
| 8 | Travis | Why Does It Always Rain On Me? | 50 | 69 | 66 | 71 | 43 | 50 | 52 | 60 | 50 | 28 | 41 | 46 | 60 | 58 | 44 | 59 | 72 |
| 9 | Modest Mouse | Float On | 57 | 57 | 46 | 66 | 28 | 56 | 58 | 50 | 59 | 16 | 59 | 52 | 48 | 59 | 40 | 71 | 64 |
| 10 | Spoon | The Underdog | 72 | 41 | 45 | 68 | 37 | 44 | 46 | 43 | 49 | 28 | 46 | 49 | 52 | 63 | 33 | 57 | 65 |
| 11 | Stereophonics | Maybe Tomorrow | 55 | 72 | 53 | 57 | 71 | 47 | 40 | 63 | 28 | 42 | 61 | 50 | 41 | 42 | 26 | 65 | 52 |
| 12 | Oasis | Don't Look Back In Anger | 47 | 48 | 85 | 67 | 34 | 46 | 44 | 62 | 56 | 17 | 67 | 49 | 61 | 58 | 35 | 57 | 62 |
| 13 | ASIAN KUNG-FU GENERATION | Solanin | 60 | 44 | 65 | 56 | 32 | 49 | 56 | 60 | 40 | 16 | 59 | 50 | 56 | 46 | 29 | 56 | 64 |
| 14 | Wilco | Heavy Metal Drummer | 40 | 63 | 59 | 74 | 25 | 49 | 65 | 76 | 46 | 30 | 46 | 36 | 49 | 59 | 51 | 54 | 63 |
| 15 | Lorde | Ribs | 71 | 52 | 65 | 63 | 42 | 69 | 24 | 54 | 54 | 37 | 44 | 58 | 39 | 29 | 63 | 74 | 46 |
| 16 | Finn Askew | Aftertaste | 65 | 72 | 62 | 48 | 72 | 42 | 22 | 62 | 48 | 55 | 45 | 48 | 42 | 70 | 22 | 82 | 48 |
| 17 | Natalie Layne | Grateful For | 65 | 72 | 65 | 50 | 75 | 45 | 22 | 48 | 45 | 55 | 45 | 52 | 45 | 62 | 25 | 80 | 52 |
| 18 | Penelope Road | Chance Encounter | 62 | 68 | 65 | 48 | 72 | 45 | 20 | 55 | 48 | 60 | 42 | 48 | 42 | 65 | 22 | 75 | 48 |
| 19 | strings & heart | evergreen love | 62 | 82 | 60 | 30 | 82 | 35 | 12 | 70 | 35 | 62 | 30 | 35 | 35 | 78 | 15 | 75 | 35 |
| 20 | Gloria Tells | Climb Down From Your Pedestal | 62 | 60 | 68 | 52 | 60 | 50 | 45 | 40 | 42 | 38 | 55 | 42 | 42 | 75 | 18 | 85 | 60 |

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

- lane: american-alternative-drive | image_type: SCENE | confidence: 0.95
- playlist_concept: City Street Reverie
- targetStats: brightness=40 warmth=30 openness=60 motion=20 intimacy=30 socialEnergy=40 tension=50 nostalgia=70 playfulness=20 dreaminess=40 energy=50 groove=40 density=60 acousticness=30 electronicness=20 vocalPresence=60 climaxIntensity=50
- contextAffinity: spring=30 summer=20 autumn=60 winter=50 morning=30 day=60 dusk=50 night=40 lateNight=30 clear=20 cloudy=70 rain=40 snow=10

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | rock | indie-rock | 86.35 | 83.4 | 91.71 | 85.75 | 86.2 | 82.25 |
| 2 | Oasis | Wonderwall | bx1Bh8ZvH84 | rock | britpop | 85.73 | 85.9 | 87.57 | 85.5 | 91.6 | 78 |
| 3 | The Verve | Lucky Man | MH6TJU0qWoY | rock | britpop | 85.14 | 86.3 | 88.71 | 83.5 | 95 | 70.75 |
| 4 | NELL | 기억을 걷는 시간 | QnqVpRDaQ90 | rock | k-indie-rock | 85.06 | 86.4 | 88 | 84 | 90.4 | 74 |
| 5 | Phoebe Bridgers | Motion Sickness | 9sfYpolGCu8 | rock | indie-rock | 84.99 | 83.2 | 89.71 | 84.25 | 87 | 78.5 |
| 6 | Keane | Everybody's Changing | Zx4Hjq6KwO0 | rock | britpop | 84.83 | 81.6 | 91 | 81.25 | 89 | 79.75 |
| 7 | Wilco | Heavy Metal Drummer | yeuIQFF7z6E | rock | indie-rock | 84.82 | 84.1 | 86 | 81 | 93.8 | 81.75 |
| 8 | Kings of Leon | Use Somebody | gnhXHvRoUd0 | rock | alternative-rock | 84.63 | 82.9 | 91.14 | 85 | 86.4 | 73.5 |
| 9 | Death Cab for Cutie | Cath... | uY1ahFCYT5k | rock | indie-rock | 84.61 | 85.5 | 85.71 | 83.75 | 91 | 77.25 |
| 10 | Avril Lavigne | Complicated | 5NPBIwQyPWE | rock | pop-punk | 84.42 | 85.4 | 87.14 | 83.25 | 91.4 | 73.5 |
| 11 | Band of Horses | The Funeral | cMFWFhTFohk | rock | indie-rock | 83.91 | 82.4 | 88.57 | 83.5 | 88.4 | 75 |
| 12 | The White Stripes | Seven Nation Army | 0J2QdDbelmY | rock | garage-rock | 83.9 | 84.2 | 83.14 | 85.5 | 94 | 76.5 |
| 13 | 잭킹콩 | Blur | Eqz5YPSJI_k | rock | k-indie-rock | 83.89 | 82.2 | 89.71 | 86.25 | 79.4 | 76.25 |
| 14 | The Shins | New Slang | kGpAMPS_t8U | rock | indie-rock | 83.82 | 84.3 | 86.14 | 83.25 | 91 | 74 |
| 15 | Travis | Sing | eYO1-gGWJyo | rock | britpop | 83.78 | 83.7 | 89.43 | 81.25 | 87.8 | 72.5 |
| 16 | Queens of the Stone Age | No One Knows | s88r_q7oufE | rock | alternative-rock | 83.67 | 84.8 | 82 | 84.75 | 92.6 | 77.75 |
| 17 | The Smashing Pumpkins | 1979 | 4aeETEoNfOg | rock | alternative-rock | 83.67 | 86.2 | 81.29 | 87.25 | 85.2 | 78.75 |
| 18 | Yeah Yeah Yeahs | Maps | oIIxlgcuQRU | rock | garage-rock | 83.65 | 80.4 | 87.14 | 86.5 | 97.6 | 71 |
| 19 | Beck | E-Pro | RIrG6xBW5Wk | rock | alternative-rock | 83.63 | 86.7 | 83.29 | 82.25 | 94.2 | 72.5 |
| 20 | SURL | Snow | SV6bIRBiPeQ | rock | dream-pop | 83.61 | 84.9 | 85.86 | 86 | 90.2 | 69.75 |
| 21 | Weezer | Say It Ain't So | OoPHItnUFkw | rock | power-pop | 83.5 | 83.6 | 85.57 | 76.75 | 95.4 | 78 |
| 22 | Jaurim | 스물다섯, 스물하나 | LrB-fJn-3w4 | rock | k-indie-rock | 83.5 | 86.3 | 88.14 | 82 | 87.8 | 67.25 |
| 23 | ASIAN KUNG-FU GENERATION | Solanin | xZD1B1TskXs | rock | j-rock | 83.42 | 85.4 | 90.57 | 76.5 | 85 | 71 |
| 24 | Keane | Somewhere Only We Know | Oextk-If8HQ | rock | britpop | 83.36 | 81.6 | 91.57 | 76.25 | 91 | 72.5 |
| 25 | The Smashing Pumpkins | Mayonaise | Vbu_K41efvY | rock | alternative-rock | 83.35 | 80.8 | 83.57 | 84.5 | 94.8 | 79.25 |
| 26 | Oasis | Live Forever | TDe1DqxwJoc | rock | britpop | 83.26 | 85.1 | 83 | 83.5 | 86.4 | 77.75 |
| 27 | Pixies | Where Is My Mind? | 49FB9hhoO6c | rock | indie-rock | 83.25 | 83.4 | 86.71 | 82.75 | 90 | 72 |
| 28 | Oasis | Don't Look Back In Anger | cmpRLQZkTb8 | rock | britpop | 83.18 | 82 | 87.86 | 81.25 | 89.4 | 74 |
| 29 | HYUKOH | Tomboy | pC6tPEaAiYU | rock | k-indie-rock | 83.11 | 80.2 | 88.57 | 80.5 | 88.2 | 77.25 |
| 30 | NELL | 지구가 태양을 네 번 | g5cVE-i5wHI | rock | k-indie-rock | 83.08 | 83.2 | 86.43 | 80 | 87.2 | 76.5 |

**Final 20 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | 86.35 | 83.4 | 91.71 | 85.75 | 86.2 | 82.25 | medium |
| 2 | 2 | Oasis | Wonderwall | bx1Bh8ZvH84 | 85.73 | 85.9 | 87.57 | 85.5 | 91.6 | 78 | medium |
| 3 | 3 | The Verve | Lucky Man | MH6TJU0qWoY | 85.14 | 86.3 | 88.71 | 83.5 | 95 | 70.75 | medium |
| 4 | 4 | NELL | 기억을 걷는 시간 | QnqVpRDaQ90 | 85.06 | 86.4 | 88 | 84 | 90.4 | 74 | medium |
| 5 | 5 | Phoebe Bridgers | Motion Sickness | 9sfYpolGCu8 | 84.99 | 83.2 | 89.71 | 84.25 | 87 | 78.5 | medium |
| 6 | 6 | Keane | Everybody's Changing | Zx4Hjq6KwO0 | 84.83 | 81.6 | 91 | 81.25 | 89 | 79.75 | medium |
| 7 | 7 | Wilco | Heavy Metal Drummer | yeuIQFF7z6E | 84.82 | 84.1 | 86 | 81 | 93.8 | 81.75 | medium |
| 8 | 8 | Kings of Leon | Use Somebody | gnhXHvRoUd0 | 84.63 | 82.9 | 91.14 | 85 | 86.4 | 73.5 | medium |
| 9 | 9 | Death Cab for Cutie | Cath... | uY1ahFCYT5k | 84.61 | 85.5 | 85.71 | 83.75 | 91 | 77.25 | medium |
| 10 | 10 | Avril Lavigne | Complicated | 5NPBIwQyPWE | 84.42 | 85.4 | 87.14 | 83.25 | 91.4 | 73.5 | medium |
| 11 | 12 | The White Stripes | Seven Nation Army | 0J2QdDbelmY | 83.9 | 84.2 | 83.14 | 85.5 | 94 | 76.5 | high |
| 12 | 16 | Queens of the Stone Age | No One Knows | s88r_q7oufE | 83.67 | 84.8 | 82 | 84.75 | 92.6 | 77.75 | high |
| 13 | 19 | Beck | E-Pro | RIrG6xBW5Wk | 83.63 | 86.7 | 83.29 | 82.25 | 94.2 | 72.5 | high |
| 14 | 11 | Band of Horses | The Funeral | cMFWFhTFohk | 83.91 | 82.4 | 88.57 | 83.5 | 88.4 | 75 | medium |
| 15 | 13 | 잭킹콩 | Blur | Eqz5YPSJI_k | 83.89 | 82.2 | 89.71 | 86.25 | 79.4 | 76.25 | medium |
| 16 | 14 | The Shins | New Slang | kGpAMPS_t8U | 83.82 | 84.3 | 86.14 | 83.25 | 91 | 74 | low |
| 17 | 15 | Travis | Sing | eYO1-gGWJyo | 83.78 | 83.7 | 89.43 | 81.25 | 87.8 | 72.5 | medium |
| 18 | 17 | The Smashing Pumpkins | 1979 | 4aeETEoNfOg | 83.67 | 86.2 | 81.29 | 87.25 | 85.2 | 78.75 | medium |
| 19 | 18 | Yeah Yeah Yeahs | Maps | oIIxlgcuQRU | 83.65 | 80.4 | 87.14 | 86.5 | 97.6 | 71 | medium |
| 20 | 20 | SURL | Snow | SV6bIRBiPeQ | 83.61 | 84.9 | 85.86 | 86 | 90.2 | 69.75 | medium |

**Track catalog stats (17 dims, for image-stats <-> music-stats validation)**

| final pos | artist | title | brightness | warmth | openness | motion | intimacy | socialEnergy | tension | nostalgia | playfulness | dreaminess | energy | groove | density | acousticness | electronicness | vocalPresence | climaxIntensity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 딕펑스 | 평행성 (feat. Jukjae) | 50 | 58 | 55 | 45 | 55 | 45 | 32 | 45 | 40 | 45 | 48 | 55 | 52 | 40 | 30 | 68 | 55 |
| 2 | Oasis | Wonderwall | 43 | 53 | 63 | 69 | 25 | 54 | 44 | 60 | 39 | 31 | 44 | 42 | 53 | 56 | 44 | 57 | 69 |
| 3 | The Verve | Lucky Man | 49 | 36 | 80 | 57 | 41 | 57 | 50 | 67 | 39 | 25 | 52 | 45 | 65 | 47 | 47 | 67 | 66 |
| 4 | NELL | 기억을 걷는 시간 | 44 | 43 | 46 | 55 | 41 | 43 | 66 | 74 | 36 | 20 | 49 | 37 | 51 | 55 | 31 | 74 | 71 |
| 5 | Phoebe Bridgers | Motion Sickness | 42 | 42 | 51 | 85 | 36 | 50 | 67 | 44 | 33 | 32 | 51 | 53 | 56 | 62 | 36 | 61 | 55 |
| 6 | Keane | Everybody's Changing | 45 | 50 | 64 | 90 | 27 | 57 | 72 | 56 | 42 | 33 | 46 | 38 | 68 | 45 | 48 | 59 | 55 |
| 7 | Wilco | Heavy Metal Drummer | 40 | 63 | 59 | 74 | 25 | 49 | 65 | 76 | 46 | 30 | 46 | 36 | 49 | 59 | 51 | 54 | 63 |
| 8 | Kings of Leon | Use Somebody | 38 | 34 | 83 | 69 | 51 | 47 | 61 | 61 | 48 | 23 | 49 | 44 | 67 | 46 | 39 | 65 | 60 |
| 9 | Death Cab for Cutie | Cath... | 43 | 51 | 62 | 64 | 37 | 53 | 59 | 64 | 45 | 25 | 64 | 33 | 69 | 54 | 48 | 57 | 65 |
| 10 | Avril Lavigne | Complicated | 48 | 37 | 54 | 60 | 32 | 53 | 56 | 37 | 44 | 33 | 61 | 42 | 54 | 50 | 43 | 64 | 74 |
| 11 | The White Stripes | Seven Nation Army | 41 | 34 | 54 | 67 | 42 | 49 | 68 | 47 | 45 | 27 | 85 | 42 | 48 | 47 | 34 | 77 | 71 |
| 12 | Queens of the Stone Age | No One Knows | 39 | 37 | 65 | 72 | 41 | 44 | 63 | 42 | 38 | 27 | 78 | 38 | 87 | 64 | 38 | 68 | 59 |
| 13 | Beck | E-Pro | 49 | 36 | 57 | 58 | 42 | 46 | 50 | 43 | 29 | 17 | 88 | 60 | 69 | 54 | 30 | 73 | 53 |
| 14 | Band of Horses | The Funeral | 41 | 47 | 73 | 58 | 60 | 43 | 46 | 38 | 45 | 27 | 54 | 50 | 58 | 62 | 29 | 56 | 69 |
| 15 | 잭킹콩 | Blur | 52 | 55 | 62 | 55 | 62 | 42 | 38 | 58 | 38 | 68 | 52 | 48 | 58 | 42 | 48 | 72 | 58 |
| 16 | The Shins | New Slang | 47 | 49 | 62 | 67 | 28 | 57 | 46 | 73 | 51 | 15 | 32 | 44 | 49 | 49 | 49 | 57 | 63 |
| 17 | Travis | Sing | 55 | 47 | 64 | 68 | 29 | 48 | 41 | 47 | 53 | 35 | 51 | 35 | 61 | 55 | 29 | 75 | 68 |
| 18 | The Smashing Pumpkins | 1979 | 38 | 42 | 56 | 67 | 34 | 59 | 68 | 72 | 41 | 49 | 41 | 36 | 64 | 64 | 52 | 76 | 82 |
| 19 | Yeah Yeah Yeahs | Maps | 45 | 42 | 45 | 66 | 66 | 59 | 44 | 47 | 42 | 28 | 49 | 40 | 50 | 55 | 44 | 68 | 72 |
| 20 | SURL | Snow | 47 | 13 | 66 | 59 | 37 | 44 | 57 | 47 | 42 | 21 | 51 | 45 | 57 | 64 | 42 | 53 | 77 |

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

- lane: city-pop-retro-glow | image_type: SCENE | confidence: 0.97
- playlist_concept: Night Market Groove
- targetStats: brightness=70 warmth=80 openness=60 motion=70 intimacy=50 socialEnergy=80 tension=30 nostalgia=40 playfulness=70 dreaminess=30 energy=75 groove=80 density=60 acousticness=30 electronicness=70 vocalPresence=85 climaxIntensity=60
- contextAffinity: spring=60 summer=90 autumn=40 winter=10 morning=30 day=40 dusk=80 night=70 lateNight=50 clear=80 cloudy=20 rain=10 snow=0

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Anri | Windy Summer | uQ9nsr9YoCQ | pop | city-pop | 88.58 | 87.9 | 91.14 | 93.25 | 79.8 | 86 |
| 2 | a!ka | All Bark No Bite | r7cz6RMoMKM | pop | city-pop | 87.67 | 91.8 | 88.29 | 87.75 | 81.4 | 82.25 |
| 3 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | pop | city-pop | 87.32 | 91 | 88.57 | 87 | 80.6 | 82.25 |
| 4 | Young Gun Silver Fox | Winner | cYjb-vpl9Ow | pop | city-pop | 87.11 | 90.7 | 90 | 83 | 79.6 | 83.25 |
| 5 | Tatsuro Yamashita | Sparkle | pqobRu9aR3M | pop | city-pop | 86.85 | 88.7 | 91 | 82.25 | 83.4 | 81.75 |
| 6 | Harry Styles | Late Night Talking | RwT77rlp2CE | pop | soft-pop | 86.82 | 90.6 | 90 | 81 | 79.6 | 83.5 |
| 7 | Rex Orange County | Sunflower | V0X-SWiDr1g | pop | indie-pop | 86.72 | 88 | 91.57 | 88.5 | 78.4 | 78.25 |
| 8 | Young Gun Silver Fox | Just for Kicks | D0ivy-_PEIA | pop | city-pop | 86.5 | 90.4 | 89.29 | 82 | 81.8 | 80.75 |
| 9 | Shawn Mendes | There's Nothing Holdin' Me Back | dT2owtxkU8k | pop | soft-pop | 86.28 | 89.8 | 91.71 | 78.75 | 82.4 | 78.5 |
| 10 | MAKTUB feat. Lee Raon | To You My Light | kNYA3H1jSSs | pop | k-pop | 86.27 | 89.4 | 90.43 | 80.5 | 79.8 | 81.75 |
| 11 | Lauv | I Like Me Better | a7fzkqLozwA | pop | electropop | 86.26 | 89.2 | 89.57 | 79.5 | 82.2 | 83.25 |
| 12 | Sade | Smooth Operator | 4TYv2PhG89A | pop | city-pop | 86.25 | 90.3 | 89.43 | 80.25 | 81.8 | 80.75 |
| 13 | Clairo | Amoeba | VR8ooa3G_5M | pop | bedroom-pop | 86.2 | 92.2 | 87.57 | 82.5 | 78.6 | 80.25 |
| 14 | NewJeans | Hype Boy | 11cta61wi0g | pop | k-pop | 86.13 | 86.9 | 90.86 | 77 | 86.2 | 84.25 |
| 15 | Bronze feat. Yukika | Orange Road | Uoutn3GVHqs | pop | city-pop | 86.01 | 90.6 | 87.29 | 83.25 | 81.2 | 80.25 |
| 16 | Katy Perry feat. Snoop Dogg | California Gurls | F57P9C4SAW4 | pop | dance-pop | 86.01 | 89.8 | 88.29 | 79 | 82.8 | 83 |
| 17 | Tomoko Aran | I'm in Love | uP9JBYk2Mcs | pop | city-pop | 85.99 | 90.2 | 89.86 | 79.25 | 82 | 79.25 |
| 18 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | pop | city-pop | 85.95 | 88.5 | 87.57 | 85.5 | 83 | 80 |
| 19 | BOYNEXTDOOR | Earth, Wind & Fire | u9nP3qXQA4o | pop | k-pop | 85.93 | 88.5 | 92 | 78.75 | 83.4 | 77.5 |
| 20 | Harry Styles | Watermelon Sugar | E07s5ZYygMg | pop | soft-pop | 85.9 | 90.2 | 92 | 77 | 81 | 77.25 |
| 21 | 5 Seconds of Summer | Youngblood | -RJSbO8UZVY | pop | synth-pop | 85.87 | 90.6 | 91.43 | 84.25 | 85 | 67.5 |
| 22 | Takako Mamiya | LOVE TRIP | M0HmUICJRZc | pop | city-pop | 85.82 | 89.7 | 88.14 | 78 | 88.4 | 79.5 |
| 23 | CORTIS | FaSHioN | 42wfEs7oIP8 | pop | k-pop | 85.82 | 90 | 86.71 | 80.75 | 88.4 | 79 |
| 24 | Troye Sivan | Rush | Vih7BTyVcj4 | pop | electropop | 85.76 | 89.2 | 92.14 | 80.5 | 73.6 | 79.5 |
| 25 | Rex Orange County feat. Benny Sings | Loving Is Easy | 39IU7ADaXmQ | pop | indie-pop | 85.75 | 87.2 | 90.43 | 82.5 | 76 | 83.25 |
| 26 | Eyedi | Caffeine | ZLjs8rfejcU | pop | city-pop | 85.67 | 89.6 | 90.71 | 80 | 78.8 | 78 |
| 27 | Charlie Puth feat. Jung Kook | Left and Right | a7GITgqwDVg | pop | dance-pop | 85.64 | 90.6 | 88.86 | 79.75 | 87.8 | 73.75 |
| 28 | 외동아들 김승기 | SNL | LSrHTs2gd9Y | pop | dance-pop | 85.63 | 87.5 | 88.86 | 85.5 | 79 | 80 |
| 29 | Taylor Swift | Style | 66TQBtlRKc4 | pop | soft-pop | 85.53 | 91.6 | 89.86 | 77 | 78.4 | 78 |
| 30 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | pop | teen-pop | 85.52 | 89.8 | 85.29 | 88.5 | 70.8 | 84.25 |

**Final 20 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | Anri | Windy Summer | uQ9nsr9YoCQ | 88.58 | 87.9 | 91.14 | 93.25 | 79.8 | 86 | medium |
| 2 | 2 | a!ka | All Bark No Bite | r7cz6RMoMKM | 87.67 | 91.8 | 88.29 | 87.75 | 81.4 | 82.25 | medium |
| 3 | 3 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | 87.32 | 91 | 88.57 | 87 | 80.6 | 82.25 | medium |
| 4 | 4 | Young Gun Silver Fox | Winner | cYjb-vpl9Ow | 87.11 | 90.7 | 90 | 83 | 79.6 | 83.25 | medium |
| 5 | 5 | Tatsuro Yamashita | Sparkle | pqobRu9aR3M | 86.85 | 88.7 | 91 | 82.25 | 83.4 | 81.75 | medium |
| 6 | 6 | Harry Styles | Late Night Talking | RwT77rlp2CE | 86.82 | 90.6 | 90 | 81 | 79.6 | 83.5 | medium |
| 7 | 7 | Rex Orange County | Sunflower | V0X-SWiDr1g | 86.72 | 88 | 91.57 | 88.5 | 78.4 | 78.25 | medium |
| 8 | 8 | Young Gun Silver Fox | Just for Kicks | D0ivy-_PEIA | 86.5 | 90.4 | 89.29 | 82 | 81.8 | 80.75 | medium |
| 9 | 10 | MAKTUB feat. Lee Raon | To You My Light | kNYA3H1jSSs | 86.27 | 89.4 | 90.43 | 80.5 | 79.8 | 81.75 | medium |
| 10 | 11 | Lauv | I Like Me Better | a7fzkqLozwA | 86.26 | 89.2 | 89.57 | 79.5 | 82.2 | 83.25 | medium |
| 11 | 9 | Shawn Mendes | There's Nothing Holdin' Me Back | dT2owtxkU8k | 86.28 | 89.8 | 91.71 | 78.75 | 82.4 | 78.5 | high |
| 12 | 16 | Katy Perry feat. Snoop Dogg | California Gurls | F57P9C4SAW4 | 86.01 | 89.8 | 88.29 | 79 | 82.8 | 83 | high |
| 13 | 19 | BOYNEXTDOOR | Earth, Wind & Fire | u9nP3qXQA4o | 85.93 | 88.5 | 92 | 78.75 | 83.4 | 77.5 | high |
| 14 | 20 | Harry Styles | Watermelon Sugar | E07s5ZYygMg | 85.9 | 90.2 | 92 | 77 | 81 | 77.25 | high |
| 15 | 12 | Sade | Smooth Operator | 4TYv2PhG89A | 86.25 | 90.3 | 89.43 | 80.25 | 81.8 | 80.75 | medium |
| 16 | 13 | Clairo | Amoeba | VR8ooa3G_5M | 86.2 | 92.2 | 87.57 | 82.5 | 78.6 | 80.25 | medium |
| 17 | 14 | NewJeans | Hype Boy | 11cta61wi0g | 86.13 | 86.9 | 90.86 | 77 | 86.2 | 84.25 | medium |
| 18 | 15 | Bronze feat. Yukika | Orange Road | Uoutn3GVHqs | 86.01 | 90.6 | 87.29 | 83.25 | 81.2 | 80.25 | medium |
| 19 | 17 | Tomoko Aran | I'm in Love | uP9JBYk2Mcs | 85.99 | 90.2 | 89.86 | 79.25 | 82 | 79.25 | medium |
| 20 | 18 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | 85.95 | 88.5 | 87.57 | 85.5 | 83 | 80 | medium |

**Track catalog stats (17 dims, for image-stats <-> music-stats validation)**

| final pos | artist | title | brightness | warmth | openness | motion | intimacy | socialEnergy | tension | nostalgia | playfulness | dreaminess | energy | groove | density | acousticness | electronicness | vocalPresence | climaxIntensity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Anri | Windy Summer | 78 | 68 | 68 | 62 | 45 | 58 | 18 | 70 | 62 | 38 | 58 | 65 | 52 | 32 | 62 | 78 | 55 |
| 2 | a!ka | All Bark No Bite | 68 | 55 | 60 | 58 | 35 | 62 | 25 | 45 | 70 | 30 | 62 | 65 | 55 | 25 | 45 | 68 | 58 |
| 3 | 박문치 | J U S T F U N (with 죠지) | 62 | 62 | 65 | 58 | 40 | 65 | 20 | 35 | 75 | 32 | 60 | 70 | 55 | 30 | 42 | 65 | 58 |
| 4 | Young Gun Silver Fox | Winner | 75 | 68 | 62 | 65 | 48 | 65 | 15 | 65 | 60 | 32 | 62 | 70 | 55 | 42 | 52 | 75 | 58 |
| 5 | Tatsuro Yamashita | Sparkle | 80 | 70 | 52 | 83 | 37 | 56 | 24 | 62 | 65 | 28 | 52 | 79 | 67 | 20 | 72 | 70 | 55 |
| 6 | Harry Styles | Late Night Talking | 74 | 75 | 47 | 57 | 45 | 71 | 11 | 41 | 93 | 28 | 63 | 75 | 48 | 34 | 53 | 77 | 48 |
| 7 | Rex Orange County | Sunflower | 63 | 100 | 45 | 52 | 60 | 56 | 41 | 41 | 75 | 39 | 59 | 53 | 61 | 34 | 64 | 81 | 61 |
| 8 | Young Gun Silver Fox | Just for Kicks | 72 | 70 | 65 | 62 | 52 | 62 | 18 | 62 | 58 | 35 | 58 | 68 | 55 | 38 | 55 | 72 | 55 |
| 9 | MAKTUB feat. Lee Raon | To You My Light | 76 | 85 | 57 | 49 | 51 | 57 | 28 | 32 | 46 | 43 | 52 | 66 | 48 | 39 | 68 | 80 | 58 |
| 10 | Lauv | I Like Me Better | 82 | 88 | 50 | 65 | 63 | 63 | 27 | 26 | 57 | 43 | 61 | 55 | 57 | 35 | 63 | 81 | 45 |
| 11 | Shawn Mendes | There's Nothing Holdin' Me Back | 71 | 65 | 69 | 56 | 60 | 52 | 29 | 24 | 65 | 27 | 74 | 55 | 54 | 37 | 57 | 81 | 58 |
| 12 | Katy Perry feat. Snoop Dogg | California Gurls | 86 | 64 | 44 | 64 | 40 | 63 | 27 | 43 | 56 | 29 | 88 | 66 | 58 | 36 | 51 | 71 | 46 |
| 13 | BOYNEXTDOOR | Earth, Wind & Fire | 76 | 60 | 54 | 58 | 31 | 63 | 38 | 42 | 79 | 46 | 69 | 62 | 58 | 26 | 68 | 75 | 46 |
| 14 | Harry Styles | Watermelon Sugar | 73 | 62 | 67 | 47 | 42 | 80 | 21 | 44 | 83 | 43 | 74 | 56 | 55 | 23 | 63 | 78 | 55 |
| 15 | Sade | Smooth Operator | 67 | 70 | 62 | 50 | 41 | 50 | 22 | 29 | 67 | 31 | 56 | 65 | 54 | 37 | 66 | 66 | 64 |
| 16 | Clairo | Amoeba | 66 | 71 | 51 | 60 | 38 | 59 | 23 | 38 | 66 | 30 | 41 | 80 | 46 | 29 | 57 | 67 | 53 |
| 17 | NewJeans | Hype Boy | 88 | 66 | 49 | 54 | 31 | 60 | 39 | 28 | 72 | 40 | 44 | 76 | 57 | 32 | 64 | 68 | 59 |
| 18 | Bronze feat. Yukika | Orange Road | 61 | 70 | 67 | 65 | 32 | 67 | 32 | 30 | 55 | 25 | 48 | 45 | 61 | 34 | 71 | 76 | 48 |
| 19 | Tomoko Aran | I'm in Love | 83 | 72 | 53 | 58 | 63 | 62 | 34 | 37 | 57 | 37 | 58 | 56 | 54 | 33 | 74 | 73 | 55 |
| 20 | WhiteUsedSocks | How I Wish! | 65 | 58 | 62 | 55 | 40 | 58 | 22 | 55 | 62 | 38 | 58 | 68 | 55 | 30 | 45 | 62 | 55 |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### d37e4abbcb1fb66e75e1254e0ed5ccec.jpg

- lane: sunny-stroll-pop | image_type: SCENE | confidence: 0.95
- playlist_concept: Blooming Afternoon Melodies
- targetStats: brightness=90 warmth=85 openness=75 motion=40 intimacy=60 socialEnergy=40 tension=10 nostalgia=30 playfulness=60 dreaminess=70 energy=75 groove=60 density=50 acousticness=70 electronicness=20 vocalPresence=80 climaxIntensity=60
- contextAffinity: spring=90 summer=60 autumn=20 winter=10 morning=50 day=80 dusk=30 night=10 lateNight=5 clear=85 cloudy=20 rain=10 snow=5

**Top 30 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Natasha Bedingfield | Unwritten | b7k0a5hYnSI | pop | soft-pop | 85.42 | 84.8 | 90.57 | 85 | 76.8 | 82.5 |
| 2 | E:um | Today's Journey | I0eLBDc82Tk | folk-acoustic | indie-folk | 84.38 | 87 | 87.14 | 77.5 | 81 | 82.75 |
| 3 | the lee | Love! | hp_9JKymJDM | pop | bedroom-pop | 84.35 | 87 | 90.29 | 79.5 | 75.4 | 78 |
| 4 | Astels | Real Things | LaJEW4OsixA | pop | indie-pop | 84.28 | 86.2 | 90.86 | 78 | 78.4 | 77.5 |
| 5 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | pop | teen-pop | 83.79 | 83.8 | 84.57 | 81.5 | 84.2 | 84.25 |
| 6 | Calvin Harris feat. Pharrell Williams, Katy Perry & Big Sean | Feels | ozv4q2ov3Mk | pop | dance-pop | 83.75 | 84.6 | 86.29 | 81 | 76.6 | 84.5 |
| 7 | Shawn Mendes | There's Nothing Holdin' Me Back | dT2owtxkU8k | pop | soft-pop | 83.56 | 85.4 | 88.14 | 81.75 | 74.6 | 78.5 |
| 8 | Jordan Lee | Love Ride | j7wBND-RyCM | folk-acoustic | indie-folk | 83.49 | 86.5 | 92.14 | 75.25 | 74 | 74.75 |
| 9 | Colbie Caillat | Brighter Than The Sun | KU5o6M7S5nQ | folk-acoustic | folk-pop | 83.49 | 85.6 | 84 | 84 | 76 | 82.75 |
| 10 | Natasha Bedingfield | Pocketful of Sunshine | gte3BoXKwP0 | pop | soft-pop | 83.23 | 86.9 | 82 | 80.5 | 80 | 83.25 |
| 11 | Daybreak | Flower Road | 49HfFYsh43Y | pop | soft-pop | 82.95 | 84.2 | 82.14 | 84.5 | 77 | 84.5 |
| 12 | The Furthermores | Show Me How | 4j6kHKqDV1k | pop | indie-pop | 82.87 | 82 | 88 | 79.5 | 79.4 | 80 |
| 13 | AKMU | Give Love | x2XX3cNW4K0 | folk-acoustic | folk-pop | 82.76 | 82.7 | 82.57 | 82.75 | 82.4 | 83.5 |
| 14 | The Temper Trap | Sweet Disposition | jxKjOOR9sPU | pop | indie-pop | 82.72 | 85.2 | 82 | 86.75 | 72.8 | 81.75 |
| 15 | Jinto Yoshida | 背伸びのキス | rvN4NqxBLDA | pop | city-pop | 82.68 | 85.9 | 87.43 | 78.75 | 73.6 | 76.75 |
| 16 | Jonas Blue feat. JP Cooper | Perfect Strangers | Ey_hgKCCYU4 | pop | dance-pop | 82.65 | 80.2 | 86.43 | 85.5 | 75 | 82.25 |
| 17 | Nicky Youre & dazy | Sunroof | G5xSLbYMr-I | pop | dance-pop | 82.63 | 85 | 85.71 | 82.25 | 70.4 | 80.25 |
| 18 | siopaolo | it's very nice to meet you! | 4WXavHlUS1w | pop | bedroom-pop | 82.58 | 89.2 | 87 | 76.75 | 74.4 | 71.75 |
| 19 | Troye Sivan | YOUTH | XYAghEq5Lfw | pop | electropop | 82.54 | 87.6 | 83.29 | 80 | 68.6 | 82.75 |
| 20 | Ellie Goulding | Burn | CGyEd0aKWZE | pop | electropop | 82.51 | 87 | 81.43 | 83.5 | 76.8 | 78.5 |
| 21 | BØRNS | Electric Love | RYr96YYEaZY | pop | indie-pop | 82.51 | 85.3 | 83.29 | 81.75 | 75.2 | 81 |
| 22 | Carly Rae Jepsen | Cut To The Feeling | Qlsu7RhOnsQ | pop | teen-pop | 82.51 | 81.7 | 87.43 | 83.5 | 78.8 | 75.75 |
| 23 | Dayglow | Can I Call You Tonight? | hh1WeQxfCX0 | pop | indie-pop | 82.5 | 84.9 | 81.43 | 85 | 77 | 81 |
| 24 | Anri | Windy Summer | uQ9nsr9YoCQ | pop | city-pop | 82.48 | 82.7 | 84.14 | 76.75 | 76.4 | 88.5 |
| 25 | Major Lazer & DJ Snake feat. MØ | Lean On | YqeW9_5kURI | pop | dance-pop | 82.43 | 81.8 | 85.14 | 83 | 75.2 | 82.5 |
| 26 | Beach Bunny | Cloud 9 | _3vTWUeS80Y | pop | indie-pop | 82.36 | 81.3 | 84.29 | 86.75 | 75.2 | 81 |
| 27 | IU | Blueming | D1PvIWdJ8xo | pop | k-pop | 82.29 | 82.7 | 84.29 | 81.5 | 74.8 | 83.25 |
| 28 | Nulbarich | NEW ERA | 5pkBqmX2ymc | pop | city-pop | 82.29 | 82 | 82.86 | 82 | 80.8 | 83 |
| 29 | AKMU | 200% | 0Oi8jDMvd_w | folk-acoustic | folk-pop | 82.29 | 80.7 | 85 | 81.75 | 82 | 80.75 |
| 30 | MAKTUB feat. Lee Raon | To You My Light | kNYA3H1jSSs | pop | k-pop | 82.23 | 87.2 | 84 | 75.5 | 72.8 | 81.75 |

**Final 20 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | total | atmo | sound | season | time | weather | energy |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2 | E:um | Today's Journey | I0eLBDc82Tk | 84.38 | 87 | 87.14 | 77.5 | 81 | 82.75 | medium |
| 2 | 3 | the lee | Love! | hp_9JKymJDM | 84.35 | 87 | 90.29 | 79.5 | 75.4 | 78 | medium |
| 3 | 4 | Astels | Real Things | LaJEW4OsixA | 84.28 | 86.2 | 90.86 | 78 | 78.4 | 77.5 | medium |
| 4 | 5 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | 83.79 | 83.8 | 84.57 | 81.5 | 84.2 | 84.25 | medium |
| 5 | 8 | Jordan Lee | Love Ride | j7wBND-RyCM | 83.49 | 86.5 | 92.14 | 75.25 | 74 | 74.75 | medium |
| 6 | 12 | The Furthermores | Show Me How | 4j6kHKqDV1k | 82.87 | 82 | 88 | 79.5 | 79.4 | 80 | medium |
| 7 | 13 | AKMU | Give Love | x2XX3cNW4K0 | 82.76 | 82.7 | 82.57 | 82.75 | 82.4 | 83.5 | medium |
| 8 | 14 | The Temper Trap | Sweet Disposition | jxKjOOR9sPU | 82.72 | 85.2 | 82 | 86.75 | 72.8 | 81.75 | medium |
| 9 | 19 | Troye Sivan | YOUTH | XYAghEq5Lfw | 82.54 | 87.6 | 83.29 | 80 | 68.6 | 82.75 | medium |
| 10 | 1 | Natasha Bedingfield | Unwritten | b7k0a5hYnSI | 85.42 | 84.8 | 90.57 | 85 | 76.8 | 82.5 | high |
| 11 | 6 | Calvin Harris feat. Pharrell Williams, Katy Perry & Big Sean | Feels | ozv4q2ov3Mk | 83.75 | 84.6 | 86.29 | 81 | 76.6 | 84.5 | high |
| 12 | 7 | Shawn Mendes | There's Nothing Holdin' Me Back | dT2owtxkU8k | 83.56 | 85.4 | 88.14 | 81.75 | 74.6 | 78.5 | high |
| 13 | 9 | Colbie Caillat | Brighter Than The Sun | KU5o6M7S5nQ | 83.49 | 85.6 | 84 | 84 | 76 | 82.75 | high |
| 14 | 10 | Natasha Bedingfield | Pocketful of Sunshine | gte3BoXKwP0 | 83.23 | 86.9 | 82 | 80.5 | 80 | 83.25 | high |
| 15 | 11 | Daybreak | Flower Road | 49HfFYsh43Y | 82.95 | 84.2 | 82.14 | 84.5 | 77 | 84.5 | high |
| 16 | 15 | Jinto Yoshida | 背伸びのキス | rvN4NqxBLDA | 82.68 | 85.9 | 87.43 | 78.75 | 73.6 | 76.75 | low |
| 17 | 18 | siopaolo | it's very nice to meet you! | 4WXavHlUS1w | 82.58 | 89.2 | 87 | 76.75 | 74.4 | 71.75 | low |
| 18 | 16 | Jonas Blue feat. JP Cooper | Perfect Strangers | Ey_hgKCCYU4 | 82.65 | 80.2 | 86.43 | 85.5 | 75 | 82.25 | high |
| 19 | 17 | Nicky Youre & dazy | Sunroof | G5xSLbYMr-I | 82.63 | 85 | 85.71 | 82.25 | 70.4 | 80.25 | high |
| 20 | 20 | Ellie Goulding | Burn | CGyEd0aKWZE | 82.51 | 87 | 81.43 | 83.5 | 76.8 | 78.5 | high |

**Track catalog stats (17 dims, for image-stats <-> music-stats validation)**

| final pos | artist | title | brightness | warmth | openness | motion | intimacy | socialEnergy | tension | nostalgia | playfulness | dreaminess | energy | groove | density | acousticness | electronicness | vocalPresence | climaxIntensity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | E:um | Today's Journey | 70 | 68 | 78 | 55 | 45 | 50 | 18 | 45 | 48 | 55 | 52 | 45 | 42 | 68 | 25 | 55 | 48 |
| 2 | the lee | Love! | 78 | 72 | 65 | 58 | 65 | 58 | 12 | 48 | 72 | 48 | 55 | 58 | 42 | 58 | 38 | 80 | 52 |
| 3 | Astels | Real Things | 72 | 68 | 65 | 58 | 60 | 58 | 20 | 50 | 62 | 45 | 58 | 55 | 48 | 55 | 35 | 78 | 52 |
| 4 | Mikayla Geier | Ring Pop | 75 | 55 | 62 | 55 | 45 | 62 | 20 | 30 | 72 | 40 | 58 | 52 | 45 | 30 | 45 | 72 | 55 |
| 5 | Jordan Lee | Love Ride | 70 | 72 | 68 | 58 | 62 | 55 | 18 | 55 | 58 | 45 | 52 | 52 | 42 | 72 | 22 | 80 | 48 |
| 6 | The Furthermores | Show Me How | 68 | 55 | 60 | 58 | 40 | 60 | 25 | 40 | 60 | 40 | 60 | 55 | 50 | 35 | 35 | 68 | 58 |
| 7 | AKMU | Give Love | 88 | 57 | 48 | 50 | 44 | 54 | 26 | 24 | 75 | 31 | 60 | 61 | 39 | 32 | 69 | 79 | 67 |
| 8 | The Temper Trap | Sweet Disposition | 91 | 49 | 83 | 48 | 47 | 71 | 23 | 31 | 60 | 33 | 65 | 53 | 44 | 31 | 55 | 63 | 48 |
| 9 | Troye Sivan | YOUTH | 85 | 73 | 62 | 49 | 60 | 61 | 20 | 33 | 44 | 35 | 63 | 50 | 51 | 27 | 52 | 66 | 55 |
| 10 | Natasha Bedingfield | Unwritten | 85 | 72 | 88 | 62 | 60 | 72 | 25 | 48 | 62 | 38 | 72 | 52 | 52 | 42 | 25 | 88 | 72 |
| 11 | Calvin Harris feat. Pharrell Williams, Katy Perry & Big Sean | Feels | 88 | 63 | 53 | 63 | 36 | 52 | 18 | 33 | 66 | 38 | 82 | 72 | 53 | 41 | 48 | 68 | 65 |
| 12 | Shawn Mendes | There's Nothing Holdin' Me Back | 71 | 65 | 69 | 56 | 60 | 52 | 29 | 24 | 65 | 27 | 74 | 55 | 54 | 37 | 57 | 81 | 58 |
| 13 | Colbie Caillat | Brighter Than The Sun | 90 | 61 | 71 | 57 | 41 | 49 | 28 | 40 | 70 | 37 | 81 | 58 | 61 | 37 | 69 | 74 | 55 |
| 14 | Natasha Bedingfield | Pocketful of Sunshine | 90 | 66 | 61 | 47 | 43 | 66 | 10 | 34 | 72 | 38 | 85 | 59 | 40 | 27 | 54 | 63 | 49 |
| 15 | Daybreak | Flower Road | 91 | 59 | 66 | 60 | 35 | 59 | 20 | 31 | 60 | 23 | 79 | 66 | 45 | 25 | 57 | 63 | 49 |
| 16 | Jinto Yoshida | 背伸びのキス | 68 | 70 | 62 | 52 | 68 | 52 | 15 | 60 | 62 | 48 | 48 | 58 | 45 | 55 | 42 | 75 | 48 |
| 17 | siopaolo | it's very nice to meet you! | 72 | 78 | 65 | 45 | 72 | 52 | 15 | 52 | 62 | 55 | 40 | 52 | 42 | 62 | 30 | 80 | 38 |
| 18 | Jonas Blue feat. JP Cooper | Perfect Strangers | 88 | 53 | 50 | 46 | 40 | 65 | 34 | 27 | 43 | 26 | 75 | 64 | 43 | 34 | 62 | 77 | 57 |
| 19 | Nicky Youre & dazy | Sunroof | 99 | 52 | 59 | 45 | 43 | 54 | 17 | 28 | 73 | 36 | 77 | 49 | 51 | 40 | 66 | 76 | 54 |
| 20 | Ellie Goulding | Burn | 88 | 48 | 65 | 51 | 46 | 60 | 18 | 33 | 62 | 47 | 83 | 45 | 51 | 27 | 62 | 70 | 49 |

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
| brightness | 20 | 90 | 55 | 55 | 23.98 | 6 | 0 | 1 | 2 |
| warmth | 30 | 85 | 61.88 | 62.5 | 19.52 | 7 | 0 | 2 | 3 |
| openness | 30 | 90 | 61.25 | 60 | 16.35 | 6 | 0 | 1 | 4 |
| motion | 10 | 70 | 35.63 | 30 | 22.28 | 6 | 2 | 0 | 3 |
| intimacy | 30 | 70 | 52.5 | 55 | 16.39 | 5 | 0 | 0 | 3 |
| socialEnergy | 10 | 80 | 35.63 | 30 | 24.17 | 5 | 2 | 0 | 2 |
| tension | 10 | 50 | 27.5 | 30 | 10.9 | 4 | 1 | 0 | 1 |
| nostalgia | 30 | 80 | 58.75 | 65 | 18.33 | 5 | 0 | 0 | 3 |
| playfulness | 10 | 70 | 36.88 | 35 | 22.77 | 6 | 2 | 0 | 3 |
| dreaminess | 30 | 90 | 58.75 | 60 | 19.65 | 6 | 0 | 1 | 4 |
| energy | 20 | 75 | 46.25 | 50 | 22.19 | 4 | 0 | 0 | 3 |
| groove | 10 | 80 | 46.25 | 50 | 21.76 | 5 | 1 | 0 | 5 |
| density | 30 | 65 | 46.88 | 45 | 12.98 | 5 | 0 | 0 | 5 |
| acousticness | 30 | 80 | 53.75 | 60 | 19.96 | 4 | 0 | 0 | 1 |
| electronicness | 10 | 70 | 38.13 | 37.5 | 19.99 | 7 | 1 | 0 | 3 |
| vocalPresence | 30 | 85 | 64.38 | 65 | 15.7 | 5 | 0 | 1 | 3 |
| climaxIntensity | 20 | 60 | 42.5 | 50 | 15.61 | 4 | 0 | 0 | 5 |
| spring | 10 | 90 | 43.13 | 35 | 23.04 | 6 | 1 | 1 | 3 |
| summer | 0 | 90 | 42.5 | 40 | 29.47 | 5 | 1 | 1 | 2 |
| autumn | 20 | 90 | 50 | 50 | 22.36 | 6 | 0 | 1 | 4 |
| winter | 5 | 80 | 35.63 | 30 | 28.44 | 5 | 4 | 0 | 2 |
| morning | 10 | 50 | 28.75 | 30 | 11.66 | 5 | 1 | 0 | 2 |
| day | 5 | 80 | 49.38 | 50 | 23.51 | 6 | 1 | 0 | 3 |
| dusk | 30 | 80 | 55 | 50 | 18.03 | 5 | 0 | 0 | 4 |
| night | 5 | 90 | 34.38 | 25 | 28.88 | 7 | 3 | 1 | 1 |
| lateNight | 0 | 80 | 23.75 | 10 | 26.31 | 6 | 5 | 0 | 1 |
| clear | 20 | 90 | 54.38 | 50 | 26.15 | 7 | 0 | 2 | 2 |
| cloudy | 20 | 70 | 43.75 | 45 | 20.58 | 5 | 0 | 0 | 3 |
| rain | 0 | 90 | 26.25 | 10 | 27.81 | 4 | 5 | 1 | 2 |
| snow | 0 | 100 | 18.13 | 7.5 | 31.62 | 5 | 6 | 1 | 0 |

## Most similar / most different image-vector pairs

Most similar:
- 28ebe33dc58b3a9c88fe09467727db27.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg: meanAbsDistance=15.17
- 402c17af72fc0eec89e1f5e3589de7bb.jpg vs 63124baa245a1133a63c9f6978f701ef.jpg: meanAbsDistance=15.67
- 28ebe33dc58b3a9c88fe09467727db27.jpg vs d37e4abbcb1fb66e75e1254e0ed5ccec.jpg: meanAbsDistance=16.17
- 28ebe33dc58b3a9c88fe09467727db27.jpg vs 5d26f76472131c2904c9a2729e850a22.jpg: meanAbsDistance=16.67
- 5d26f76472131c2904c9a2729e850a22.jpg vs d37e4abbcb1fb66e75e1254e0ed5ccec.jpg: meanAbsDistance=16.83
Most different:
- 050e0c11047a97bc23cbd3be7458e6c7.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg: meanAbsDistance=42
- 402c17af72fc0eec89e1f5e3589de7bb.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg: meanAbsDistance=37.67
- 0ea78a4ffc3af667e68e52ea29867a9b.jpg vs d37e4abbcb1fb66e75e1254e0ed5ccec.jpg: meanAbsDistance=37.17
- 050e0c11047a97bc23cbd3be7458e6c7.jpg vs d37e4abbcb1fb66e75e1254e0ed5ccec.jpg: meanAbsDistance=36.67
- 050e0c11047a97bc23cbd3be7458e6c7.jpg vs 28ebe33dc58b3a9c88fe09467727db27.jpg: meanAbsDistance=34.5

## Recommendation overlap

Highest top16-overlap pairs:
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 402c17af72fc0eec89e1f5e3589de7bb.jpg: overlap=25, jaccard=0.71
- 28ebe33dc58b3a9c88fe09467727db27.jpg <-> acadefe72ef776bdd8913a4b1df8aaab.jpg: overlap=10, jaccard=0.2
- 402c17af72fc0eec89e1f5e3589de7bb.jpg <-> 5d26f76472131c2904c9a2729e850a22.jpg: overlap=8, jaccard=0.15
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 5d26f76472131c2904c9a2729e850a22.jpg: overlap=6, jaccard=0.11
- 5d26f76472131c2904c9a2729e850a22.jpg <-> 63124baa245a1133a63c9f6978f701ef.jpg: overlap=6, jaccard=0.11
Lowest top16-overlap pairs:
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 0ea78a4ffc3af667e68e52ea29867a9b.jpg: overlap=0, jaccard=0
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 28ebe33dc58b3a9c88fe09467727db27.jpg: overlap=0, jaccard=0
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 63124baa245a1133a63c9f6978f701ef.jpg: overlap=0, jaccard=0
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> acadefe72ef776bdd8913a4b1df8aaab.jpg: overlap=0, jaccard=0
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> d37e4abbcb1fb66e75e1254e0ed5ccec.jpg: overlap=0, jaccard=0

## Global recurrence

Recurring tracks: 49
- Mikayla Geier - Ring Pop: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- Anri - Windy Summer: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- The Lumineers - Ophelia: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- strings & heart - evergreen love: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- The Head and the Heart - Rivers and Roads: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- Finn Askew - Aftertaste: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- Penelope Road - Chance Encounter: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- The Vaniers - Milk & Honey: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- a!ka - All Bark No Bite: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- 박문치 - J U S T F U N (with 죠지): images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- WhiteUsedSocks - How I Wish!: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- Young Gun Silver Fox - Winner: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- Young Gun Silver Fox - Just for Kicks: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- The Furthermores - Show Me How: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- Bronze feat. Yukika - Orange Road: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- CORTIS - FaSHioN: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- 외동아들 김승기 - SNL: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- Astels - Real Things: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- E:um - Today's Journey: images=2 (5d26f76472131c2904c9a2729e850a22.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- Shawn Mendes - There's Nothing Holdin' Me Back: images=2 (acadefe72ef776bdd8913a4b1df8aaab.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
Recurring artists: 47
- anri: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- finn askew: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- josé gonzález: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- mikayla geier: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- penelope road: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- strings & heart: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- the head and the heart: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- the lumineers: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- the vaniers: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,5d26f76472131c2904c9a2729e850a22.jpg)
- 딕펑스: images=2 (5d26f76472131c2904c9a2729e850a22.jpg,63124baa245a1133a63c9f6978f701ef.jpg)
- 박문치: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- 외동아들 김승기: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- a!ka: images=2 (28ebe33dc58b3a9c88fe09467727db27.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- alexi murdoch: images=2 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg)
- angus & julia stone: images=2 (050e0c11047a97bc23cbd3be7458e6c7.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg)

## Genre / artist concentration

- primaryGenre concentration: **scene-specific concentration** ("pop" dominant in 3/8)
- subgenre concentration: **scene-specific concentration** ("singer-songwriter" dominant in 2/8)
- artist repetition: **frequent within an image** (max in one top16=3, max image-recurrence=3)

## Sequencing observation

Every image preserved all scored top-10 tracks in the final 10 with no outside tracks introduced.

## Final diagnostic classification


**q1_distinctVectors**: 8 images produced 8 distinct full 30-dim vectors.

**q2_midpointCollapseEvidence**: 0 of 30 dimensions have >=75% of images landing in [40,60]. Dimensions: none.

**q3_nearlyIdenticalVectors**: Most similar pair: 28ebe33dc58b3a9c88fe09467727db27.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg, meanAbsDistance=15.17.

**q4_distinctVectorsDistinctRankings**: Mean pairwise top16 Jaccard across all image pairs = 0.05.

**q5_oneTrackDominatesUnrelatedImages**: 49 track(s) recur across >1 image; max image-recurrence = 3.

**q6_oneArtistDominatesUnrelatedImages**: Max artist image-recurrence = 3 of 8 images.

**q7_oneGenreDominatesUnrelatedImages**: "pop" dominant in 3/8 images -> scene-specific concentration.

**q8_seasonVariesMeaningfully**: Season field stats: spring sd=23.04, summer sd=29.47, autumn sd=22.36, winter sd=28.44

**q9_timeVariesMeaningfully**: Time field stats: morning sd=11.66, day sd=23.51, dusk sd=18.03, night sd=28.88, lateNight sd=26.31

**q10_weatherVariesMeaningfully**: Weather field stats: clear sd=26.15, cloudy sd=20.58, rain sd=27.81, snow sd=31.62

**q11_desiredSoundVariesMeaningfully**: Desired-sound field stats: energy sd=22.19, groove sd=21.76, density sd=12.98, acousticness sd=19.96, electronicness sd=19.99, vocalPresence sd=15.7, climaxIntensity sd=15.61

**q12_scoreSpreadsInformative**: Mean top16 scoreSpread across images = 4.58.

**q13_ranks11to16CloseEnoughFor20Track**: Mean (rank1-10 avg minus rank11-16 avg) gap across images = 1.96.

**q14_sequencingPreservesScoredTop10**: Yes — every image had all scored top-10 tracks present in final-10 with no outside tracks introduced.

**q15_hardGenreCapEvidence**: NOT SUPPORTED BY CURRENT EVIDENCE

**q16_hardArtistCapEvidence**: NOT SUPPORTED BY CURRENT EVIDENCE

**q17_vectorRedundancyEvidence**: Not separately computed as a track-vs-track metric in this real-image run; see pairwiseVectorDistances for image-vector-level similarity. Requires manual/human review of whether visually distinct source photos are producing recommendation sets that feel redundant.

**q18_humanReviewStillRequired**: Yes — human-review fields in perImageResults[].humanReview are intentionally blank and required before any quality claim.

**q19_candidatePoolExpansionReadiness**: Technically: yes, the scoring/ranking pipeline runs over the full 795-track catalog and returns as many ranked candidates as requested. Quality readiness is not established by this diagnostic alone.

**q20_twentyTrackReadiness**: technically ready (pipeline can score/rank/select beyond 16 without code changes) — NOT quality-validated (human-review fields are blank) and NOT enabled in production (CATALOG_CANDIDATE_POOL_SIZE/FINAL_TRACK_COUNT unchanged by this task).