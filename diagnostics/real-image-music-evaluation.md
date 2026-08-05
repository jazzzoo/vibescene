# VibeScene Music Engine — Step 5-C Real-Image Evaluation

Generated: 2026-08-05T07:14:18.925Z  
Repository HEAD: 4323eef  
Model: gpt-4o

## Execution summary

- Images attempted: 12 | succeeded: 12 | failed: 0
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


### 02066cb88c44980a81e5f04ef2150af5.jpg

- lane: lofi-bedroom-solitude | image_type: SCENE | confidence: 1
- playlist_concept: Calm Reflections
- targetStats: brightness=60 warmth=40 openness=70 motion=20 intimacy=60 socialEnergy=20 tension=10 nostalgia=50 playfulness=20 dreaminess=70 energy=20 groove=20 density=30 acousticness=60 electronicness=30 vocalPresence=20 climaxIntensity=20
- contextAffinity: spring=50 summer=30 autumn=80 winter=40 morning=50 day=70 dusk=40 night=20 lateNight=10 clear=60 cloudy=40 rain=20 snow=10

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 85.17 | 88 | 87.14 | 88.25 | 75 | 79.25 |
| 2 | Tycho | A Walk | SDNA934EEVk | ambient-experimental | ambient-electronic | 84.75 | 93.8 | 90 | 79.75 | 70 | 71 |
| 3 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | folk-acoustic | singer-songwriter | 83.78 | 85.5 | 85.43 | 80.25 | 88 | 77.75 |
| 4 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | folk-acoustic | singer-songwriter | 83.61 | 89.5 | 85.43 | 71.25 | 84.4 | 80 |
| 5 | The Cranberries | Linger | G6Kspj3OO0s | rock | dream-pop | 83.57 | 89.9 | 91.71 | 76.5 | 75.6 | 67 |
| 6 | José González | Heartbeats | ik_BQYbbZ5U | folk-acoustic | singer-songwriter | 83.55 | 90.6 | 80.71 | 75.75 | 87.2 | 80.5 |
| 7 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | folk-acoustic | singer-songwriter | 83.46 | 84.7 | 82.14 | 80.25 | 91.8 | 81.25 |
| 8 | Incredible Polo | The Ship (Edit) | HXIGisgDjUs | hip-hop | lofi-hiphop | 83.41 | 88.2 | 86.57 | 81.75 | 73.2 | 76 |
| 9 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | folk-acoustic | indie-folk | 83.39 | 88.5 | 83.14 | 75.75 | 90.2 | 76.75 |
| 10 | Lana Del Rey | Video Games | cE6wxDqdOV0 | pop | soft-pop | 83.27 | 89.9 | 89.14 | 84.25 | 70.2 | 66 |
| 11 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | folk-acoustic | singer-songwriter | 83.24 | 84.5 | 80.29 | 81.25 | 89.8 | 84.25 |
| 12 | The Head and the Heart | Rivers and Roads | jwC06Izp1a8 | folk-acoustic | indie-folk | 83.07 | 84.3 | 83.86 | 75.25 | 93.4 | 80 |
| 13 | Alexi Murdoch | All My Days | 5NFkFVe93NM | folk-acoustic | singer-songwriter | 82.96 | 82.8 | 84.14 | 76.75 | 85.4 | 85.5 |
| 14 | The Head and the Heart | Lost in My Mind | is7rrC-jH_A | folk-acoustic | indie-folk | 82.95 | 82.9 | 82.43 | 76.5 | 86.4 | 88.25 |
| 15 | Tycho | Awake | dm4tkSNKfFI | ambient-experimental | ambient-electronic | 82.93 | 92.8 | 86.29 | 78.5 | 67 | 71.5 |
| 16 | The Lumineers | Cleopatra | aN5s9N_pTUs | folk-acoustic | folk-pop | 82.27 | 83.6 | 83 | 77.25 | 80.6 | 84.25 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | low |
| 2 | 2 | Tycho | A Walk | SDNA934EEVk | low |
| 3 | 3 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | low |
| 4 | 4 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | low |
| 5 | 5 | The Cranberries | Linger | G6Kspj3OO0s | low |
| 6 | 6 | José González | Heartbeats | ik_BQYbbZ5U | low |
| 7 | 7 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | low |
| 8 | 8 | Incredible Polo | The Ship (Edit) | HXIGisgDjUs | low |
| 9 | 9 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | low |
| 10 | 10 | Lana Del Rey | Video Games | cE6wxDqdOV0 | low |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### 050e0c11047a97bc23cbd3be7458e6c7.jpg

- lane: dream-pop-shoegaze-fog | image_type: SCENE | confidence: 0.98
- playlist_concept: Snowy Serenity
- targetStats: brightness=30 warmth=40 openness=60 motion=10 intimacy=70 socialEnergy=10 tension=20 nostalgia=80 playfulness=20 dreaminess=90 energy=30 groove=20 density=50 acousticness=40 electronicness=60 vocalPresence=50 climaxIntensity=30
- contextAffinity: spring=0 summer=0 autumn=0 winter=100 morning=0 day=20 dusk=60 night=20 lateNight=0 clear=40 cloudy=60 rain=0 snow=100

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mazzy Star | Into Dust | 04J0ihSeIuI | rock | dream-pop | 81.8 | 87.3 | 89.29 | 61.25 | 78.2 | 78.75 |
| 2 | The Japanese House | Saw You in a Dream | NwnZyZ82UEs | rock | dream-pop | 80.96 | 93.8 | 90.29 | 59.75 | 69.8 | 65.25 |
| 3 | Billie Eilish | ocean eyes | viimfQi_pUw | rock | dream-pop | 80.41 | 91.5 | 87.57 | 63.75 | 66.6 | 69.75 |
| 4 | Øneheart & reidenshi | snowfall | OtLcqr3RQJY | ambient-experimental | ambient-electronic | 80.08 | 85.7 | 89 | 66.25 | 62.6 | 76.5 |
| 5 | Slowdive | Alison | Ak43tAU5QuA | rock | shoegaze | 80 | 91.2 | 89.29 | 60.25 | 65.4 | 68.5 |
| 6 | Lana Del Rey | West Coast | o3SqUUoJjW8 | pop | soft-pop | 79.75 | 87.3 | 89.71 | 58.75 | 69.2 | 72.75 |
| 7 | The Cure | Pictures of You | D88J_57QgxY | rock | dream-pop | 79.68 | 91 | 88.71 | 56 | 69.4 | 69.5 |
| 8 | Tycho | Awake | dm4tkSNKfFI | ambient-experimental | ambient-electronic | 79.63 | 84.8 | 90.29 | 60 | 73 | 72 |
| 9 | M83 | Wait | iQnRCdtECl8 | rock | dream-pop | 79.6 | 89.8 | 90.71 | 57.25 | 65.8 | 68.5 |
| 10 | Mazzy Star | Fade Into You | yfzsBA5dZdE | rock | dream-pop | 79.58 | 90.5 | 92.43 | 57 | 61.4 | 66.75 |
| 11 | Tycho | A Walk | SDNA934EEVk | ambient-experimental | ambient-electronic | 79.54 | 87.4 | 89.71 | 57.25 | 72.4 | 70.5 |
| 12 | The Marías | Cariño | QHVp9xiUr9U | rock | dream-pop | 79.41 | 91.7 | 89.57 | 58.75 | 62 | 66.75 |
| 13 | The Cranberries | Linger | G6Kspj3OO0s | rock | dream-pop | 79.32 | 90.9 | 88.57 | 60 | 68 | 64.5 |
| 14 | Deftones | Sextape | f0pdwd0miqs | rock | shoegaze | 79.21 | 88.2 | 89.29 | 58 | 71.4 | 67.5 |
| 15 | Lana Del Rey | Video Games | cE6wxDqdOV0 | pop | soft-pop | 79.16 | 91.5 | 90.29 | 53.75 | 67.4 | 65.5 |
| 16 | Beach House | Silver Soul | 0hCzhBNzIBw | rock | dream-pop | 79.14 | 91.6 | 86.43 | 61.25 | 61.6 | 69.25 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 6 | Lana Del Rey | West Coast | o3SqUUoJjW8 | medium |
| 2 | 7 | The Cure | Pictures of You | D88J_57QgxY | medium |
| 3 | 1 | Mazzy Star | Into Dust | 04J0ihSeIuI | low |
| 4 | 2 | The Japanese House | Saw You in a Dream | NwnZyZ82UEs | low |
| 5 | 3 | Billie Eilish | ocean eyes | viimfQi_pUw | low |
| 6 | 4 | Øneheart & reidenshi | snowfall | OtLcqr3RQJY | low |
| 7 | 5 | Slowdive | Alison | Ak43tAU5QuA | low |
| 8 | 8 | Tycho | Awake | dm4tkSNKfFI | low |
| 9 | 9 | M83 | Wait | iQnRCdtECl8 | low |
| 10 | 10 | Mazzy Star | Fade Into You | yfzsBA5dZdE | low |

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

- lane: lofi-bedroom-solitude | image_type: SCENE | confidence: 1
- playlist_concept: City Lights Solitude
- targetStats: brightness=40 warmth=30 openness=20 motion=10 intimacy=80 socialEnergy=10 tension=20 nostalgia=50 playfulness=10 dreaminess=70 energy=20 groove=20 density=20 acousticness=60 electronicness=40 vocalPresence=30 climaxIntensity=10
- contextAffinity: spring=20 summer=10 autumn=30 winter=80 morning=5 day=10 dusk=40 night=90 lateNight=70 clear=40 cloudy=30 rain=50 snow=20

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Billie Eilish | ocean eyes | viimfQi_pUw | rock | dream-pop | 83.13 | 87.1 | 89.57 | 77.25 | 80.8 | 69.75 |
| 2 | The xx | Angels | _nW5AF0m9Zw | rock | dream-pop | 82.82 | 85.5 | 90.14 | 77 | 79.6 | 70.75 |
| 3 | Mazzy Star | Into Dust | 04J0ihSeIuI | rock | dream-pop | 82.6 | 83.9 | 89.57 | 81.25 | 76.8 | 71.25 |
| 4 | 주혜린 | 아무것도 | fzhgg7pD1bI | pop | soft-pop | 82.58 | 87.4 | 81 | 75.75 | 84 | 82 |
| 5 | The Marías | Cariño | QHVp9xiUr9U | rock | dream-pop | 82.3 | 84.7 | 88.71 | 76.75 | 77 | 73.75 |
| 6 | The Cranberries | Linger | G6Kspj3OO0s | rock | dream-pop | 82.29 | 83.7 | 91.71 | 74 | 76.2 | 73 |
| 7 | Tycho | A Walk | SDNA934EEVk | ambient-experimental | ambient-electronic | 82.24 | 84.4 | 90 | 76.25 | 73.8 | 74 |
| 8 | The xx | Intro | xMV6l2y67rk | rock | dream-pop | 82.15 | 86.7 | 81.57 | 78.25 | 84.6 | 76.5 |
| 9 | Tycho | Awake | dm4tkSNKfFI | ambient-experimental | ambient-electronic | 82.07 | 85.6 | 86.29 | 77 | 80 | 73 |
| 10 | Beach House | Space Song | GAFwrXOsL68 | rock | dream-pop | 82.06 | 87 | 88.14 | 74.75 | 81 | 68 |
| 11 | Cigarettes After Sex | Apocalypse | sElE_BfQ67s | rock | dream-pop | 82.03 | 84.6 | 91.86 | 72 | 82.8 | 66.75 |
| 12 | Slowdive | Alison | Ak43tAU5QuA | rock | shoegaze | 81.86 | 83 | 90.14 | 73.25 | 82 | 71.5 |
| 13 | Deftones | Sextape | f0pdwd0miqs | rock | shoegaze | 81.72 | 83 | 86.43 | 77 | 76.4 | 78 |
| 14 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 81.69 | 84 | 84.29 | 71.75 | 72 | 88.25 |
| 15 | Mazzy Star | Fade Into You | yfzsBA5dZdE | rock | dream-pop | 81.63 | 84.9 | 88.71 | 77 | 71.6 | 72.25 |
| 16 | Lana Del Rey | Video Games | cE6wxDqdOV0 | pop | soft-pop | 81.2 | 85.9 | 88.86 | 73.75 | 74.4 | 68.5 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 8 | The xx | Intro | xMV6l2y67rk | medium |
| 2 | 1 | Billie Eilish | ocean eyes | viimfQi_pUw | low |
| 3 | 2 | The xx | Angels | _nW5AF0m9Zw | low |
| 4 | 3 | Mazzy Star | Into Dust | 04J0ihSeIuI | low |
| 5 | 4 | 주혜린 | 아무것도 | fzhgg7pD1bI | low |
| 6 | 5 | The Marías | Cariño | QHVp9xiUr9U | low |
| 7 | 6 | The Cranberries | Linger | G6Kspj3OO0s | low |
| 8 | 7 | Tycho | A Walk | SDNA934EEVk | low |
| 9 | 9 | Tycho | Awake | dm4tkSNKfFI | low |
| 10 | 10 | Beach House | Space Song | GAFwrXOsL68 | low |

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

- lane: sunny-stroll-pop | image_type: SCENE | confidence: 0.95
- playlist_concept: Afternoon Alley Pop
- targetStats: brightness=65 warmth=70 openness=55 motion=20 intimacy=60 socialEnergy=40 tension=30 nostalgia=75 playfulness=40 dreaminess=55 energy=40 groove=50 density=50 acousticness=45 electronicness=40 vocalPresence=60 climaxIntensity=35
- contextAffinity: spring=20 summer=70 autumn=10 winter=0 morning=20 day=80 dusk=40 night=10 lateNight=0 clear=70 cloudy=30 rain=0 snow=0

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | DORI | Thursday Taco Man | oyInMEY3Daw | pop | bedroom-pop | 83.68 | 82.3 | 94.29 | 72.25 | 76 | 81.75 |
| 2 | Couch | (I Wanted) Summer With You | 4VhIWghpXQo | rnb-soul | neo-soul | 82.74 | 88.1 | 92 | 68 | 66.2 | 79.25 |
| 3 | PREP | Cheapest Flight | rqvA7T5FUTQ | pop | city-pop | 82.67 | 90.2 | 92.57 | 65 | 68.8 | 74.75 |
| 4 | RIIZE | Get A Guitar | iUw3LPM7OBU | pop | k-pop | 82.39 | 81.4 | 91.86 | 69.25 | 77.6 | 81.75 |
| 5 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | pop | teen-pop | 82.33 | 79.4 | 89 | 72.5 | 79.2 | 86.75 |
| 6 | Meiko Nakahara | Fantasy | 2Kt8HP1VEPU | pop | city-pop | 82.27 | 85.3 | 89 | 69.25 | 78.2 | 78.5 |
| 7 | Jinto Yoshida | 背伸びのキス | rvN4NqxBLDA | pop | city-pop | 81.92 | 87.9 | 91.29 | 65.25 | 68.6 | 76.75 |
| 8 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | pop | city-pop | 81.84 | 84.1 | 88.14 | 70.5 | 72.2 | 82.5 |
| 9 | Emotional Oranges | West Coast Love | PaSON7HvFao | rnb-soul | alt-rnb | 81.83 | 89.9 | 89.29 | 67.5 | 64.4 | 76.75 |
| 10 | John Legend | All of Me | 450p7goxZqg | pop | soft-pop | 81.79 | 85.2 | 87.29 | 70.5 | 78.8 | 77.25 |
| 11 | Jakubi | Couch Potato | uX8yoT9ct6k | pop | indie-pop | 81.76 | 86.9 | 91.43 | 66.5 | 70.4 | 75 |
| 12 | E:um | Today's Journey | I0eLBDc82Tk | folk-acoustic | indie-folk | 81.72 | 86 | 88.43 | 64 | 76 | 81.25 |
| 13 | GSoul | Natural | zIxV-Gd5gxw | rnb-soul | contemporary-rnb | 81.69 | 86.9 | 91.29 | 68 | 72 | 72.25 |
| 14 | The Furthermores | Show Me How | 4j6kHKqDV1k | pop | indie-pop | 81.69 | 82.4 | 89.86 | 68 | 74.4 | 82.5 |
| 15 | Pink Sweat$ | At My Worst | VXzAJd8UJl8 | rnb-soul | alt-rnb | 81.69 | 84.3 | 94.57 | 63.5 | 68 | 78 |
| 16 | wave to earth | surf. | K45Ibt2xKj8 | rock | dream-pop | 81.65 | 85.1 | 89.86 | 67.25 | 70.4 | 80.25 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 1 | DORI | Thursday Taco Man | oyInMEY3Daw | medium |
| 2 | 4 | RIIZE | Get A Guitar | iUw3LPM7OBU | medium |
| 3 | 5 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | medium |
| 4 | 6 | Meiko Nakahara | Fantasy | 2Kt8HP1VEPU | medium |
| 5 | 8 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | medium |
| 6 | 2 | Couch | (I Wanted) Summer With You | 4VhIWghpXQo | low |
| 7 | 3 | PREP | Cheapest Flight | rqvA7T5FUTQ | low |
| 8 | 7 | Jinto Yoshida | 背伸びのキス | rvN4NqxBLDA | low |
| 9 | 9 | Emotional Oranges | West Coast Love | PaSON7HvFao | low |
| 10 | 10 | John Legend | All of Me | 450p7goxZqg | low |

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

- lane: dream-pop-shoegaze-fog | image_type: MIXED | confidence: 0.95
- playlist_concept: Rainy Alley Reverie
- targetStats: brightness=40 warmth=60 openness=50 motion=30 intimacy=50 socialEnergy=20 tension=40 nostalgia=70 playfulness=10 dreaminess=80 energy=20 groove=20 density=60 acousticness=40 electronicness=50 vocalPresence=60 climaxIntensity=40
- contextAffinity: spring=30 summer=10 autumn=90 winter=20 morning=40 day=70 dusk=50 night=10 lateNight=5 clear=20 cloudy=50 rain=90 snow=0

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 82.29 | 90 | 85.71 | 73.25 | 76 | 73.25 |
| 2 | 주혜린 | 아무것도 | fzhgg7pD1bI | pop | soft-pop | 81.73 | 89.6 | 85.29 | 76.75 | 62 | 77 |
| 3 | Nujabes | luv(sic) Part 1 | Y4HWvsGs0rY | hip-hop | jazz-rap | 81.47 | 87.9 | 86.43 | 74.75 | 69 | 73.75 |
| 4 | Ray Charles | Georgia On My Mind | ggGzE5KfCio | rnb-soul | classic-soul | 81.11 | 83.9 | 90.29 | 69.25 | 68.4 | 77.5 |
| 5 | Astels | We Gotta Let Go | 1zml-iR5Oww | pop | indie-pop | 81.03 | 88.7 | 87.57 | 70.25 | 66.6 | 73 |
| 6 | GSoul | Hate Everything | AW9jdH56MzM | rnb-soul | contemporary-rnb | 80.8 | 82.9 | 85.14 | 78.75 | 67.2 | 79 |
| 7 | 잭킹콩 | Blur | Eqz5YPSJI_k | rock | k-indie-rock | 80.29 | 85.8 | 86.29 | 73.75 | 67.6 | 72.25 |
| 8 | Nujabes feat. Shing02 | Luv(sic.) Part 3 | Fwv2gnCFDOc | hip-hop | jazz-rap | 80.22 | 85.1 | 82.71 | 76 | 72.6 | 74.75 |
| 9 | Joji | SLOW DANCING IN THE DARK | K3Qzzggn--s | rnb-soul | alt-rnb | 80.21 | 84 | 86.57 | 72 | 68.8 | 75.75 |
| 10 | Bill Withers | Ain't No Sunshine | YuKfiH0Scao | rnb-soul | classic-soul | 80.21 | 88.1 | 84.14 | 68.5 | 72.4 | 73.5 |
| 11 | Otis Redding | These Arms of Mine | VA3SbP6IlA8 | rnb-soul | classic-soul | 80.06 | 82.6 | 85.29 | 68 | 70.8 | 82.75 |
| 12 | Otis Redding | Try a Little Tenderness | pli44utBOwo | rnb-soul | classic-soul | 79.86 | 86 | 81.43 | 68.75 | 70.6 | 81.75 |
| 13 | Jane & The Boy | Starry Eyed | bJISoKSkdfs | pop | indie-pop | 79.72 | 86.3 | 88.71 | 66.25 | 67 | 70.5 |
| 14 | Colde | Control Me | Rf-ctwR7P-M | rnb-soul | alt-rnb | 79.64 | 85.9 | 83.14 | 74.5 | 68.4 | 72.75 |
| 15 | The Marías | Cariño | QHVp9xiUr9U | rock | dream-pop | 79.62 | 88.1 | 89.29 | 65.75 | 69.8 | 63.75 |
| 16 | DEAN feat. Crush & Jeff Bernat | What 2 Do | gMrYfJGm7kM | rnb-soul | alt-rnb | 79.59 | 83.1 | 86.43 | 69.25 | 63.4 | 80 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 7 | 잭킹콩 | Blur | Eqz5YPSJI_k | medium |
| 2 | 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | low |
| 3 | 2 | 주혜린 | 아무것도 | fzhgg7pD1bI | low |
| 4 | 3 | Nujabes | luv(sic) Part 1 | Y4HWvsGs0rY | low |
| 5 | 4 | Ray Charles | Georgia On My Mind | ggGzE5KfCio | low |
| 6 | 5 | Astels | We Gotta Let Go | 1zml-iR5Oww | low |
| 7 | 6 | GSoul | Hate Everything | AW9jdH56MzM | low |
| 8 | 8 | Nujabes feat. Shing02 | Luv(sic.) Part 3 | Fwv2gnCFDOc | low |
| 9 | 9 | Joji | SLOW DANCING IN THE DARK | K3Qzzggn--s | low |
| 10 | 10 | Bill Withers | Ain't No Sunshine | YuKfiH0Scao | low |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### 46c4e1d11c241e35871c1c4661a8ef9f.jpg

- lane: summer-beach-pop | image_type: SCENE | confidence: 1
- playlist_concept: Blue Sky Retreat
- targetStats: brightness=90 warmth=80 openness=85 motion=50 intimacy=40 socialEnergy=55 tension=10 nostalgia=30 playfulness=70 dreaminess=40 energy=70 groove=70 density=60 acousticness=50 electronicness=30 vocalPresence=65 climaxIntensity=60
- contextAffinity: spring=20 summer=95 autumn=10 winter=5 morning=30 day=90 dusk=20 night=5 lateNight=0 clear=100 cloudy=10 rain=0 snow=0

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | BLU-SWING | 満ちていく体温 | Uv6KzCfRQgU | jazz | nu-jazz | 83.36 | 88 | 97.86 | 67.75 | 69.4 | 70 |
| 2 | Calvin Harris feat. Pharrell Williams, Katy Perry & Big Sean | Feels | ozv4q2ov3Mk | pop | dance-pop | 83.11 | 91.2 | 92 | 64 | 73 | 75 |
| 3 | Couch | Saturday | Cv-pu8ymb-g | rnb-soul | neo-soul | 83.1 | 89.7 | 92.43 | 69 | 66 | 76.75 |
| 4 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | pop | city-pop | 82.39 | 88.8 | 93 | 67 | 69.6 | 72.25 |
| 5 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | pop | teen-pop | 82.13 | 90.8 | 86.86 | 68.5 | 74.2 | 74.25 |
| 6 | Anri | Windy Summer | uQ9nsr9YoCQ | pop | city-pop | 81.85 | 88.1 | 86.71 | 73.25 | 66.4 | 78.5 |
| 7 | Cory Wong & Stephen Day | Tongue Tied | rRZ1DFtsy5s | funk-disco | classic-funk | 81.68 | 87.4 | 93.57 | 65 | 67.6 | 72.5 |
| 8 | Natasha Bedingfield | Unwritten | b7k0a5hYnSI | pop | soft-pop | 81.5 | 89.2 | 89.14 | 64 | 70 | 76 |
| 9 | Natasha Bedingfield | Pocketful of Sunshine | gte3BoXKwP0 | pop | soft-pop | 81.46 | 93.7 | 84.86 | 62.5 | 71.6 | 75.75 |
| 10 | a!ka | All Bark No Bite | r7cz6RMoMKM | pop | city-pop | 81.45 | 86.8 | 91 | 68.75 | 69.6 | 72.25 |
| 11 | Daybreak | Flower Road | 49HfFYsh43Y | pop | soft-pop | 81.31 | 90.2 | 86.71 | 64.5 | 68.6 | 78 |
| 12 | Colbie Caillat | Brighter Than The Sun | KU5o6M7S5nQ | folk-acoustic | folk-pop | 81.09 | 92.2 | 87.14 | 63 | 69.2 | 72.75 |
| 13 | Sade | Smooth Operator | 4TYv2PhG89A | pop | city-pop | 80.97 | 91.3 | 88.71 | 64.75 | 66.4 | 70.75 |
| 14 | Major Lazer & DJ Snake feat. MØ | Lean On | YqeW9_5kURI | pop | dance-pop | 80.81 | 87 | 90.29 | 65.5 | 69.2 | 72.5 |
| 15 | NewJeans | Hype Boy | 11cta61wi0g | pop | k-pop | 80.79 | 89.7 | 87 | 68 | 64.4 | 74.25 |
| 16 | Beach Bunny | Cloud 9 | _3vTWUeS80Y | pop | indie-pop | 80.75 | 87.5 | 90.57 | 63.75 | 65.2 | 75 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 1 | BLU-SWING | 満ちていく体温 | Uv6KzCfRQgU | medium |
| 2 | 3 | Couch | Saturday | Cv-pu8ymb-g | medium |
| 3 | 4 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | medium |
| 4 | 5 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | medium |
| 5 | 6 | Anri | Windy Summer | uQ9nsr9YoCQ | medium |
| 6 | 2 | Calvin Harris feat. Pharrell Williams, Katy Perry & Big Sean | Feels | ozv4q2ov3Mk | high |
| 7 | 8 | Natasha Bedingfield | Unwritten | b7k0a5hYnSI | high |
| 8 | 7 | Cory Wong & Stephen Day | Tongue Tied | rRZ1DFtsy5s | medium |
| 9 | 10 | a!ka | All Bark No Bite | r7cz6RMoMKM | medium |
| 10 | 9 | Natasha Bedingfield | Pocketful of Sunshine | gte3BoXKwP0 | high |

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

- lane: indie-road-movie | image_type: SCENE | confidence: 0.95
- playlist_concept: Golden Road Reverie
- targetStats: brightness=70 warmth=80 openness=90 motion=50 intimacy=40 socialEnergy=30 tension=20 nostalgia=75 playfulness=40 dreaminess=80 energy=50 groove=60 density=40 acousticness=60 electronicness=30 vocalPresence=50 climaxIntensity=40
- contextAffinity: spring=30 summer=50 autumn=80 winter=10 morning=10 day=40 dusk=80 night=20 lateNight=10 clear=70 cloudy=20 rain=10 snow=0

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | E:um | Today's Journey | I0eLBDc82Tk | folk-acoustic | indie-folk | 84.71 | 88.1 | 93.57 | 73.5 | 70 | 81.25 |
| 2 | Couch | (I Wanted) Summer With You | 4VhIWghpXQo | rnb-soul | neo-soul | 82.58 | 86.8 | 91.71 | 68 | 69.4 | 79.25 |
| 3 | Jane & The Boy | Starry Eyed | bJISoKSkdfs | pop | indie-pop | 81.93 | 85.8 | 89.57 | 76.25 | 70.8 | 72 |
| 4 | DORI | Thursday Taco Man | oyInMEY3Daw | pop | bedroom-pop | 81.89 | 77.8 | 90.86 | 76.75 | 75.2 | 81.75 |
| 5 | 도하 | Good Night, My Summer | x13P6vCIZMo | pop | indie-pop | 81.78 | 86.7 | 90.14 | 76.75 | 72 | 66.75 |
| 6 | Jinto Yoshida | 背伸びのキス | rvN4NqxBLDA | pop | city-pop | 81.63 | 83.4 | 91.57 | 71.25 | 69.4 | 76.75 |
| 7 | Uyama Hiroto | Departure | lZKCM2FD2Gw | jazz | jazz-hop | 81.59 | 86 | 91.57 | 71 | 66.8 | 73.25 |
| 8 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | pop | city-pop | 81.56 | 82.6 | 85.29 | 76 | 74.2 | 82.5 |
| 9 | Chic | Good Times | 51r5f5OdIY0 | funk-disco | disco | 81.39 | 79.7 | 94 | 70 | 71.2 | 77.75 |
| 10 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | rock | indie-rock | 81.36 | 81.1 | 89.71 | 79.75 | 76.2 | 70.25 |
| 11 | Yakul | April | _YOcbDB_F5Y | rnb-soul | neo-soul | 81.35 | 86.4 | 93 | 71.25 | 66.8 | 67.75 |
| 12 | Uyama Hiroto | Waltz for Life Will Born | ACao0LBuXTI | jazz | jazz-hop | 81.33 | 80 | 93.43 | 73 | 71.8 | 74.5 |
| 13 | The Furthermores | Show Me How | 4j6kHKqDV1k | pop | indie-pop | 81.16 | 80.5 | 87 | 74.5 | 73.6 | 82.5 |
| 14 | Natalie Layne | Grateful For | W4XjEvvq7W8 | folk-acoustic | singer-songwriter | 81.15 | 85.3 | 90.43 | 73.25 | 70.2 | 69.5 |
| 15 | Ledisi | Alight | Ei3Rn5K-yMc | rnb-soul | neo-soul | 81.08 | 82.7 | 86.29 | 78.75 | 72.8 | 75.25 |
| 16 | BLU-SWING | 満ちていく体温 | Uv6KzCfRQgU | jazz | nu-jazz | 81 | 80.1 | 86.57 | 73.75 | 75.6 | 82.5 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 1 | E:um | Today's Journey | I0eLBDc82Tk | medium |
| 2 | 4 | DORI | Thursday Taco Man | oyInMEY3Daw | medium |
| 3 | 8 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | medium |
| 4 | 9 | Chic | Good Times | 51r5f5OdIY0 | medium |
| 5 | 10 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | medium |
| 6 | 2 | Couch | (I Wanted) Summer With You | 4VhIWghpXQo | low |
| 7 | 3 | Jane & The Boy | Starry Eyed | bJISoKSkdfs | low |
| 8 | 5 | 도하 | Good Night, My Summer | x13P6vCIZMo | low |
| 9 | 6 | Jinto Yoshida | 背伸びのキス | rvN4NqxBLDA | low |
| 10 | 7 | Uyama Hiroto | Departure | lZKCM2FD2Gw | low |

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

- lane: indie-road-movie | image_type: SCENE | confidence: 0.95
- playlist_concept: Urban Streetlight Songs
- targetStats: brightness=40 warmth=30 openness=60 motion=40 intimacy=30 socialEnergy=40 tension=30 nostalgia=70 playfulness=20 dreaminess=50 energy=50 groove=50 density=50 acousticness=60 electronicness=20 vocalPresence=60 climaxIntensity=40
- contextAffinity: spring=40 summer=20 autumn=80 winter=20 morning=20 day=60 dusk=60 night=20 lateNight=10 clear=30 cloudy=70 rain=20 snow=10

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 85.56 | 88 | 90.86 | 80.75 | 79 | 79.25 |
| 2 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | rock | indie-rock | 85.19 | 87 | 91.14 | 79.75 | 78.2 | 79.75 |
| 3 | Phoebe Bridgers | Motion Sickness | 9sfYpolGCu8 | rock | indie-rock | 84.6 | 82.2 | 93.71 | 83.25 | 78.6 | 76.5 |
| 4 | Colde | Control Me | Rf-ctwR7P-M | rnb-soul | alt-rnb | 84.13 | 85.5 | 91.43 | 81.5 | 75.4 | 75.25 |
| 5 | NELL | 기억을 걷는 시간 | QnqVpRDaQ90 | rock | k-indie-rock | 84.1 | 85.4 | 89.14 | 87 | 79.6 | 71.5 |
| 6 | Wilco | Heavy Metal Drummer | yeuIQFF7z6E | rock | indie-rock | 84.02 | 83.1 | 88.57 | 83 | 81.8 | 79.25 |
| 7 | Oasis | Wonderwall | bx1Bh8ZvH84 | rock | britpop | 83.67 | 86.1 | 89 | 78.5 | 79.6 | 76 |
| 8 | Weezer | Say It Ain't So | OoPHItnUFkw | rock | power-pop | 83.54 | 82.6 | 89.29 | 80.75 | 85.4 | 75.5 |
| 9 | DORI | Thursday Taco Man | oyInMEY3Daw | pop | bedroom-pop | 83.37 | 81.3 | 90.86 | 74.25 | 83.2 | 81.75 |
| 10 | NELL | 지구가 태양을 네 번 | g5cVE-i5wHI | rock | k-indie-rock | 83.24 | 82.2 | 91.86 | 80 | 79.2 | 74 |
| 11 | Guru feat. Donald Byrd | Loungin' | nqYF0TSZhZQ | jazz | jazz-hop | 83.21 | 85.8 | 91.57 | 79.5 | 72.4 | 72.25 |
| 12 | Astels | We Gotta Let Go | 1zml-iR5Oww | pop | indie-pop | 83.09 | 86.7 | 87.86 | 77.75 | 73.6 | 78 |
| 13 | 채옐 | He's Something | PjREBqcLHCo | rnb-soul | k-rnb | 82.86 | 85.1 | 87.43 | 78 | 73.6 | 80.25 |
| 14 | 외동아들 김승기 | 여튼 | mhzO0YLO5QQ | pop | dance-pop | 82.72 | 81.6 | 88.14 | 76.25 | 81 | 81.75 |
| 15 | Band of Horses | The Funeral | cMFWFhTFohk | rock | indie-rock | 82.71 | 82.2 | 92 | 78.5 | 78 | 72.5 |
| 16 | Harrison & Jaleel Shaw | You Hate Jazz? | B1tqsYYiY9Q | jazz | modern-jazz | 82.48 | 83.2 | 89.43 | 78.5 | 77.8 | 74.25 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 2 | 딕펑스 | 평행성 (feat. Jukjae) | Bt0A59LsU4E | medium |
| 2 | 3 | Phoebe Bridgers | Motion Sickness | 9sfYpolGCu8 | medium |
| 3 | 4 | Colde | Control Me | Rf-ctwR7P-M | medium |
| 4 | 5 | NELL | 기억을 걷는 시간 | QnqVpRDaQ90 | medium |
| 5 | 6 | Wilco | Heavy Metal Drummer | yeuIQFF7z6E | medium |
| 6 | 7 | Oasis | Wonderwall | bx1Bh8ZvH84 | medium |
| 7 | 8 | Weezer | Say It Ain't So | OoPHItnUFkw | medium |
| 8 | 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | low |
| 9 | 9 | DORI | Thursday Taco Man | oyInMEY3Daw | medium |
| 10 | 10 | NELL | 지구가 태양을 네 번 | g5cVE-i5wHI | medium |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### a716b5df798161f7a5c77ed701b8fc1b.jpg

- lane: dream-pop-shoegaze-fog | image_type: SCENE | confidence: 1
- playlist_concept: Misty Morning Reflections
- targetStats: brightness=40 warmth=30 openness=80 motion=10 intimacy=70 socialEnergy=10 tension=10 nostalgia=70 playfulness=10 dreaminess=80 energy=20 groove=20 density=30 acousticness=70 electronicness=20 vocalPresence=40 climaxIntensity=10
- contextAffinity: spring=30 summer=10 autumn=70 winter=40 morning=80 day=50 dusk=30 night=20 lateNight=10 clear=40 cloudy=60 rain=20 snow=10

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | folk-acoustic | singer-songwriter | 83.4 | 82 | 88.57 | 83.25 | 71 | 84.25 |
| 2 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | folk-acoustic | singer-songwriter | 82.56 | 83.3 | 89.71 | 72.75 | 86.8 | 73.75 |
| 3 | Tycho | A Walk | SDNA934EEVk | ambient-experimental | ambient-electronic | 82.03 | 91 | 88.57 | 72.25 | 66 | 71.5 |
| 4 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | folk-acoustic | indie-folk | 81.86 | 84.5 | 87.43 | 68.25 | 83.8 | 77.75 |
| 5 | The Marías | Cariño | QHVp9xiUr9U | rock | dream-pop | 81.07 | 85.7 | 87.29 | 75.75 | 71.2 | 71.25 |
| 6 | Slowdive | Alison | Ak43tAU5QuA | rock | shoegaze | 80.99 | 90.8 | 88.14 | 74.75 | 57.4 | 69 |
| 7 | The Cranberries | Linger | G6Kspj3OO0s | rock | dream-pop | 80.96 | 87.7 | 86.29 | 73.5 | 71.6 | 70.5 |
| 8 | Mazzy Star | Fade Into You | yfzsBA5dZdE | rock | dream-pop | 80.92 | 87.9 | 87.29 | 75.5 | 65.8 | 69.75 |
| 9 | 주혜린 | 아무것도 | fzhgg7pD1bI | pop | soft-pop | 80.75 | 83.2 | 83.86 | 86.75 | 57 | 79.5 |
| 10 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | folk-acoustic | singer-songwriter | 80.67 | 79.5 | 84.57 | 73.75 | 90.2 | 75.75 |
| 11 | Mazzy Star | Into Dust | 04J0ihSeIuI | rock | dream-pop | 80.31 | 84.9 | 86.43 | 82.25 | 62.6 | 68.75 |
| 12 | Iron & Wine | Naked as We Came | Nd-A-iiPoLg | folk-acoustic | singer-songwriter | 80.17 | 82.1 | 89.71 | 63.75 | 80.4 | 73.5 |
| 13 | Gregory Alan Isakov | Big Black Car | JgumMOMHpns | folk-acoustic | singer-songwriter | 80.14 | 77.9 | 86.43 | 72.75 | 84.2 | 76.75 |
| 14 | Slowdive | When the Sun Hits | MKYY0IlTMw4 | rock | shoegaze | 80.1 | 88.1 | 81.14 | 75 | 69 | 74.5 |
| 15 | José González | Heartbeats | ik_BQYbbZ5U | folk-acoustic | singer-songwriter | 79.81 | 82.4 | 85 | 68.25 | 78.8 | 76.5 |
| 16 | Alexi Murdoch | All My Days | 5NFkFVe93NM | folk-acoustic | singer-songwriter | 79.77 | 75.2 | 88.43 | 70.25 | 81.4 | 80 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 1 | Victor Lundberg | Come Back Again | dzoxC8dedXw | low |
| 2 | 2 | Gregory Alan Isakov | Amsterdam | lz2qpnRB5_E | low |
| 3 | 3 | Tycho | A Walk | SDNA934EEVk | low |
| 4 | 4 | Angus & Julia Stone | Big Jet Plane | yFTvbcNhEgc | low |
| 5 | 5 | The Marías | Cariño | QHVp9xiUr9U | low |
| 6 | 6 | Slowdive | Alison | Ak43tAU5QuA | low |
| 7 | 7 | The Cranberries | Linger | G6Kspj3OO0s | low |
| 8 | 8 | Mazzy Star | Fade Into You | yfzsBA5dZdE | low |
| 9 | 9 | 주혜린 | 아무것도 | fzhgg7pD1bI | low |
| 10 | 10 | Iron & Wine | Flightless Bird, American Mouth | RGVmhrfQqzg | low |

**Human review (blank — manual)**

- PHOTO_VECTOR_PLAUSIBILITY: 
- RECOMMENDATION_FIT_1_TO_5: 
- FIRST_3_TRACK_FIT_1_TO_5: 
- PLAYLIST_COHERENCE_1_TO_5: 
- REPETITIVENESS_1_TO_5: 
- OBVIOUSLY_WRONG_TRACKS: 
- MISSING_MUSICAL_DIRECTION: 
- NOTES: 

### aa14821f6828dd6f63cf1fcc74050a29.jpg

- lane: k-rnb-night-drive | image_type: SCENE | confidence: 0.95
- playlist_concept: Neon Rain Reflections
- targetStats: brightness=30 warmth=40 openness=50 motion=30 intimacy=60 socialEnergy=40 tension=50 nostalgia=60 playfulness=20 dreaminess=80 energy=30 groove=60 density=50 acousticness=20 electronicness=70 vocalPresence=60 climaxIntensity=40
- contextAffinity: spring=20 summer=30 autumn=70 winter=20 morning=10 day=20 dusk=60 night=90 lateNight=80 clear=10 cloudy=40 rain=90 snow=10

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Tomppabeats | Monday Loop | 0-gJSbiLkgA | hip-hop | lofi-hiphop | 84.28 | 87 | 90.71 | 83 | 79.4 | 70.5 |
| 2 | GSoul | Hate Everything | AW9jdH56MzM | rnb-soul | contemporary-rnb | 83.93 | 83.3 | 87.14 | 86.25 | 83.8 | 76.5 |
| 3 | Brock Berrigan | That's All | sOqrwYZGRPc | hip-hop | lofi-hiphop | 83.88 | 83.5 | 90.43 | 83.5 | 83 | 72.5 |
| 4 | Nujabes | luv(sic) Part 1 | Y4HWvsGs0rY | hip-hop | jazz-rap | 83.62 | 87.3 | 87.86 | 81.25 | 82 | 71.25 |
| 5 | Astels | We Gotta Let Go | 1zml-iR5Oww | pop | indie-pop | 83.62 | 88.7 | 88.43 | 77.75 | 82.4 | 70.5 |
| 6 | potsu | just friends | qOif_ni_9zc | hip-hop | lofi-hiphop | 83.32 | 83.8 | 88.86 | 82.25 | 81.6 | 73.5 |
| 7 | Couch | Static & Noise | _DnRvWAu5Q4 | rnb-soul | alt-rnb | 82.97 | 86.1 | 89.29 | 76.75 | 87.2 | 67.5 |
| 8 | 채옐 | He's Something | PjREBqcLHCo | rnb-soul | k-rnb | 82.96 | 85.5 | 88.29 | 78 | 84.4 | 71.25 |
| 9 | 주혜린 | 아무것도 | fzhgg7pD1bI | pop | soft-pop | 82.92 | 89.2 | 78.14 | 84.25 | 89 | 74.5 |
| 10 | Gabriel Jacoby | gutta child | aaiPK3jfa4g | pop | bedroom-pop | 82.57 | 86 | 88.29 | 77.25 | 84.2 | 68.5 |
| 11 | Dr. Dre feat. Snoop Dogg | Still D.R.E. | QqZFpoc59kc | hip-hop | west-coast-hip-hop | 82.5 | 81.1 | 90 | 88.25 | 79.6 | 66.5 |
| 12 | Colde | Control Me | Rf-ctwR7P-M | rnb-soul | alt-rnb | 82.5 | 87.9 | 83.43 | 82 | 82.6 | 70.25 |
| 13 | Childish Gambino | Redbone | k49I5m1J6Is | rnb-soul | alt-rnb | 82.48 | 82.4 | 88.71 | 77.75 | 81.6 | 75.5 |
| 14 | Nujabes feat. Shing02 | Luv(sic.) Part 3 | Fwv2gnCFDOc | hip-hop | jazz-rap | 82.32 | 86.3 | 85.57 | 83.5 | 74 | 72.25 |
| 15 | DEAN feat. Crush & Jeff Bernat | What 2 Do | gMrYfJGm7kM | rnb-soul | alt-rnb | 82.32 | 81.7 | 87.57 | 76.75 | 84 | 77.5 |
| 16 | Nas | N.Y. State of Mind | hI8A14Qcv68 | hip-hop | east-coast-hip-hop | 82.3 | 79.7 | 87.14 | 88.5 | 85.8 | 69.25 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 7 | Couch | Static & Noise | _DnRvWAu5Q4 | medium |
| 2 | 8 | 채옐 | He's Something | PjREBqcLHCo | medium |
| 3 | 1 | Tomppabeats | Monday Loop | 0-gJSbiLkgA | low |
| 4 | 2 | GSoul | Hate Everything | AW9jdH56MzM | low |
| 5 | 3 | Brock Berrigan | That's All | sOqrwYZGRPc | low |
| 6 | 4 | Nujabes | luv(sic) Part 1 | Y4HWvsGs0rY | low |
| 7 | 5 | Astels | We Gotta Let Go | 1zml-iR5Oww | low |
| 8 | 6 | potsu | just friends | qOif_ni_9zc | low |
| 9 | 9 | 주혜린 | 아무것도 | fzhgg7pD1bI | low |
| 10 | 10 | Gabriel Jacoby | gutta child | aaiPK3jfa4g | low |

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

- lane: city-pop-retro-glow | image_type: SCENE | confidence: 0.95
- playlist_concept: Streetlight Serenade
- targetStats: brightness=70 warmth=80 openness=60 motion=40 intimacy=50 socialEnergy=75 tension=20 nostalgia=40 playfulness=60 dreaminess=30 energy=70 groove=70 density=60 acousticness=40 electronicness=50 vocalPresence=65 climaxIntensity=55
- contextAffinity: spring=30 summer=70 autumn=50 winter=10 morning=10 day=40 dusk=70 night=40 lateNight=10 clear=80 cloudy=20 rain=0 snow=0

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | BLU-SWING | 満ちていく体温 | Uv6KzCfRQgU | jazz | nu-jazz | 88.61 | 92.5 | 94.29 | 85.25 | 81.6 | 77.5 |
| 2 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | pop | city-pop | 88.42 | 90.9 | 94.86 | 84.5 | 80.6 | 79.75 |
| 3 | Young Gun Silver Fox | Winner | cYjb-vpl9Ow | pop | city-pop | 88.17 | 91.2 | 95.71 | 82 | 76.8 | 80.75 |
| 4 | a!ka | All Bark No Bite | r7cz6RMoMKM | pop | city-pop | 88.14 | 90.7 | 93.71 | 84.75 | 81.4 | 79.75 |
| 5 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | pop | city-pop | 87.79 | 90.2 | 94.71 | 84.5 | 80.2 | 77.5 |
| 6 | Young Gun Silver Fox | Just for Kicks | D0ivy-_PEIA | pop | city-pop | 87.73 | 91.5 | 95.29 | 82 | 76.6 | 78.25 |
| 7 | Cory Wong & Stephen Day | Tongue Tied | rRZ1DFtsy5s | funk-disco | classic-funk | 86.95 | 91.3 | 93.43 | 81.5 | 74.6 | 79 |
| 8 | The Furthermores | Show Me How | 4j6kHKqDV1k | pop | indie-pop | 86.87 | 91.5 | 91.29 | 83 | 79.6 | 77.5 |
| 9 | Party Pupils & Looking Glass | Brandy (Party Pupils Remix) | uCCNeyfJXmE | funk-disco | nu-disco | 86.84 | 90.7 | 93.29 | 83.25 | 74.2 | 78.25 |
| 10 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | pop | teen-pop | 86.66 | 90.3 | 90.43 | 82.5 | 78 | 81.75 |
| 11 | Kroi feat. Incognito | Kinetic | iK725ck2NIk | funk-disco | disco-funk | 86.61 | 87.8 | 91.14 | 86.25 | 78.8 | 80.75 |
| 12 | Anri | Windy Summer | uQ9nsr9YoCQ | pop | city-pop | 86.44 | 88.6 | 91.71 | 80.25 | 77.8 | 83.5 |
| 13 | Don Blackman | You Ain't Hip | YwTPx_hzY9s | funk-disco | classic-funk | 86.41 | 88.7 | 92.71 | 85.5 | 78 | 75.75 |
| 14 | Rude John | Cosmic Lady | VObUOec4Nvw | funk-disco | classic-funk | 86.39 | 90.8 | 96 | 83.25 | 73.2 | 70.25 |
| 15 | Parcels | Yougotmefeeling | _U6GlgthZmU | funk-disco | disco-funk | 86.18 | 91.1 | 93 | 83.75 | 71 | 75.25 |
| 16 | FunkyMo | Maybe Next Time | P5yYPkY44gw | funk-disco | classic-funk | 86.13 | 91.3 | 94.29 | 82 | 75 | 71 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 1 | BLU-SWING | 満ちていく体温 | Uv6KzCfRQgU | medium |
| 2 | 2 | 박문치 | J U S T F U N (with 죠지) | ztlUuIR0Ab0 | medium |
| 3 | 3 | Young Gun Silver Fox | Winner | cYjb-vpl9Ow | medium |
| 4 | 4 | a!ka | All Bark No Bite | r7cz6RMoMKM | medium |
| 5 | 5 | WhiteUsedSocks | How I Wish! | kVo0tv9am7U | medium |
| 6 | 9 | Party Pupils & Looking Glass | Brandy (Party Pupils Remix) | uCCNeyfJXmE | high |
| 7 | 6 | Young Gun Silver Fox | Just for Kicks | D0ivy-_PEIA | medium |
| 8 | 7 | Cory Wong & Stephen Day | Tongue Tied | rRZ1DFtsy5s | medium |
| 9 | 8 | The Furthermores | Show Me How | 4j6kHKqDV1k | medium |
| 10 | 10 | Mikayla Geier | Ring Pop | TOuzKcsWZaE | medium |

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

- lane: sunny-stroll-pop | image_type: SCENE | confidence: 1
- playlist_concept: Sunny Bloom Vibes
- targetStats: brightness=95 warmth=85 openness=90 motion=60 intimacy=70 socialEnergy=75 tension=20 nostalgia=40 playfulness=80 dreaminess=30 energy=75 groove=70 density=60 acousticness=50 electronicness=30 vocalPresence=80 climaxIntensity=65
- contextAffinity: spring=90 summer=70 autumn=10 winter=0 morning=70 day=95 dusk=10 night=5 lateNight=0 clear=95 cloudy=5 rain=0 snow=0

**Top 16 scored**

| rank | artist | title | youtubeVideoId | primaryGenre | subgenre | total | atmo | sound | season | time | weather |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Natasha Bedingfield | Unwritten | b7k0a5hYnSI | pop | soft-pop | 86.46 | 92.1 | 91.86 | 82.5 | 75 | 76 |
| 2 | Couch | Saturday | Cv-pu8ymb-g | rnb-soul | neo-soul | 83.99 | 88.2 | 93.14 | 74.5 | 69 | 76.75 |
| 3 | Cory Wong & Stephen Day | Tongue Tied | rRZ1DFtsy5s | funk-disco | classic-funk | 83.81 | 89.5 | 93.43 | 76 | 66.6 | 72.5 |
| 4 | Sammy Rae & The Friends | You Just Wanna Get With My Friend | 847bem6lGs0 | jazz | acid-jazz | 83.49 | 89.2 | 95.14 | 73 | 66.6 | 70.5 |
| 5 | Lake Street Dive | Help On the Way | RIp7ZG4lL58 | rock | indie-rock | 82.76 | 87 | 95.14 | 73.75 | 71.2 | 66.25 |
| 6 | Lake Street Dive | Hypotheticals | pWFaKidyD70 | rock | indie-rock | 82.76 | 87.4 | 92.14 | 76.25 | 71.8 | 68.5 |
| 7 | Sammy Rae | Talk It Up | 6om3v5hJC9o | jazz | acid-jazz | 82.68 | 89.5 | 93.43 | 72.75 | 67.6 | 67.5 |
| 8 | BLU-SWING | 満ちていく体温 | Uv6KzCfRQgU | jazz | nu-jazz | 82.6 | 85.9 | 94.86 | 76.25 | 64.4 | 70 |
| 9 | Calvin Harris feat. Pharrell Williams, Katy Perry & Big Sean | Feels | ozv4q2ov3Mk | pop | dance-pop | 82.32 | 84.3 | 92.14 | 78.5 | 63.6 | 75 |
| 10 | Beach Bunny | Cloud 9 | _3vTWUeS80Y | pop | indie-pop | 82.21 | 84.8 | 88.43 | 82.75 | 65.8 | 75 |
| 11 | AKMU | 200% | 0Oi8jDMvd_w | folk-acoustic | folk-pop | 81.94 | 86 | 90 | 77.25 | 69.4 | 70.75 |
| 12 | IU | Blueming | D1PvIWdJ8xo | pop | k-pop | 81.79 | 84.8 | 85.57 | 81 | 64.2 | 80.75 |
| 13 | Lawrence | Don't Lose Sight | VMs-l9Hru-I | rnb-soul | classic-soul | 81.79 | 87.5 | 85 | 83 | 69.8 | 70.75 |
| 14 | Colbie Caillat | Brighter Than The Sun | KU5o6M7S5nQ | folk-acoustic | folk-pop | 81.78 | 86.9 | 87.57 | 81.5 | 63 | 72.75 |
| 15 | the lee | Love! | hp_9JKymJDM | pop | bedroom-pop | 81.77 | 87.9 | 88.71 | 77 | 70.4 | 68 |
| 16 | Daybreak | Flower Road | 49HfFYsh43Y | pop | soft-pop | 81.69 | 85.9 | 84.57 | 83 | 64 | 78 |

**Final 10 sequenced**

| final pos | scored rank | artist | title | youtubeVideoId | energy |
|---|---|---|---|---|---|
| 1 | 2 | Couch | Saturday | Cv-pu8ymb-g | medium |
| 2 | 3 | Cory Wong & Stephen Day | Tongue Tied | rRZ1DFtsy5s | medium |
| 3 | 7 | Sammy Rae | Talk It Up | 6om3v5hJC9o | medium |
| 4 | 8 | BLU-SWING | 満ちていく体温 | Uv6KzCfRQgU | medium |
| 5 | 1 | Natasha Bedingfield | Unwritten | b7k0a5hYnSI | high |
| 6 | 4 | Sammy Rae & The Friends | You Just Wanna Get With My Friend | 847bem6lGs0 | high |
| 7 | 5 | Lake Street Dive | Help On the Way | RIp7ZG4lL58 | high |
| 8 | 6 | Lake Street Dive | Hypotheticals | pWFaKidyD70 | high |
| 9 | 9 | Calvin Harris feat. Pharrell Williams, Katy Perry & Big Sean | Feels | ozv4q2ov3Mk | high |
| 10 | 10 | Beach Bunny | Cloud 9 | _3vTWUeS80Y | high |

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
| brightness | 30 | 95 | 55.83 | 50 | 21.49 | 7 | 0 | 2 | 5 |
| warmth | 30 | 85 | 55.42 | 50 | 21.55 | 6 | 0 | 1 | 4 |
| openness | 20 | 90 | 64.17 | 60 | 19.45 | 8 | 0 | 3 | 6 |
| motion | 10 | 60 | 30.83 | 30 | 16.56 | 6 | 3 | 0 | 5 |
| intimacy | 30 | 80 | 56.67 | 60 | 14.34 | 6 | 0 | 0 | 7 |
| socialEnergy | 10 | 75 | 35.42 | 35 | 22.4 | 6 | 3 | 0 | 4 |
| tension | 10 | 50 | 23.33 | 20 | 11.79 | 5 | 3 | 0 | 2 |
| nostalgia | 30 | 80 | 59.17 | 65 | 15.92 | 7 | 0 | 0 | 5 |
| playfulness | 10 | 80 | 33.33 | 20 | 23.57 | 6 | 3 | 0 | 3 |
| dreaminess | 30 | 90 | 62.92 | 70 | 20.25 | 7 | 0 | 1 | 3 |
| energy | 20 | 75 | 41.25 | 35 | 20.43 | 6 | 0 | 0 | 3 |
| groove | 20 | 70 | 44.17 | 50 | 21.39 | 4 | 0 | 0 | 4 |
| density | 20 | 60 | 46.67 | 50 | 13.12 | 5 | 0 | 0 | 9 |
| acousticness | 20 | 70 | 49.58 | 50 | 12.98 | 6 | 0 | 0 | 10 |
| electronicness | 20 | 70 | 39.17 | 35 | 14.98 | 6 | 0 | 0 | 5 |
| vocalPresence | 20 | 80 | 53.33 | 60 | 15.86 | 7 | 0 | 0 | 7 |
| climaxIntensity | 10 | 65 | 37.08 | 40 | 17.01 | 8 | 2 | 0 | 6 |
| spring | 0 | 90 | 31.67 | 30 | 21.15 | 6 | 1 | 1 | 2 |
| summer | 0 | 95 | 38.75 | 30 | 29.87 | 7 | 4 | 1 | 1 |
| autumn | 0 | 90 | 48.33 | 60 | 32.62 | 7 | 4 | 1 | 1 |
| winter | 0 | 100 | 28.75 | 20 | 30.42 | 7 | 5 | 1 | 2 |
| morning | 0 | 80 | 28.75 | 20 | 25.01 | 9 | 5 | 0 | 2 |
| day | 10 | 95 | 53.75 | 55 | 27.17 | 9 | 1 | 2 | 4 |
| dusk | 10 | 80 | 46.67 | 45 | 19.72 | 8 | 1 | 0 | 7 |
| night | 5 | 90 | 29.17 | 20 | 28.64 | 5 | 4 | 2 | 1 |
| lateNight | 0 | 80 | 17.08 | 10 | 26.34 | 5 | 10 | 0 | 0 |
| clear | 10 | 100 | 54.58 | 50 | 27.8 | 9 | 1 | 2 | 4 |
| cloudy | 5 | 70 | 36.25 | 35 | 19.91 | 8 | 2 | 0 | 5 |
| rain | 0 | 90 | 25 | 15 | 32.27 | 5 | 6 | 2 | 1 |
| snow | 0 | 100 | 13.33 | 5 | 26.87 | 4 | 10 | 1 | 0 |

## Most similar / most different image-vector pairs

Most similar:
- 46c4e1d11c241e35871c1c4661a8ef9f.jpg vs d37e4abbcb1fb66e75e1254e0ed5ccec.jpg: meanAbsDistance=10.17
- 02066cb88c44980a81e5f04ef2150af5.jpg vs a716b5df798161f7a5c77ed701b8fc1b.jpg: meanAbsDistance=10.33
- 5d26f76472131c2904c9a2729e850a22.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg: meanAbsDistance=14
- 46c4e1d11c241e35871c1c4661a8ef9f.jpg vs acadefe72ef776bdd8913a4b1df8aaab.jpg: meanAbsDistance=14.5
- 28ebe33dc58b3a9c88fe09467727db27.jpg vs 5d26f76472131c2904c9a2729e850a22.jpg: meanAbsDistance=15.17
Most different:
- 0ea78a4ffc3af667e68e52ea29867a9b.jpg vs d37e4abbcb1fb66e75e1254e0ed5ccec.jpg: meanAbsDistance=47
- aa14821f6828dd6f63cf1fcc74050a29.jpg vs d37e4abbcb1fb66e75e1254e0ed5ccec.jpg: meanAbsDistance=44.17
- 050e0c11047a97bc23cbd3be7458e6c7.jpg vs d37e4abbcb1fb66e75e1254e0ed5ccec.jpg: meanAbsDistance=43.83
- 0ea78a4ffc3af667e68e52ea29867a9b.jpg vs 46c4e1d11c241e35871c1c4661a8ef9f.jpg: meanAbsDistance=42.17
- 050e0c11047a97bc23cbd3be7458e6c7.jpg vs 46c4e1d11c241e35871c1c4661a8ef9f.jpg: meanAbsDistance=39

## Recommendation overlap

Highest top16-overlap pairs:
- 02066cb88c44980a81e5f04ef2150af5.jpg <-> a716b5df798161f7a5c77ed701b8fc1b.jpg: overlap=10, jaccard=0.45
- 050e0c11047a97bc23cbd3be7458e6c7.jpg <-> 0ea78a4ffc3af667e68e52ea29867a9b.jpg: overlap=10, jaccard=0.45
- 0ea78a4ffc3af667e68e52ea29867a9b.jpg <-> a716b5df798161f7a5c77ed701b8fc1b.jpg: overlap=8, jaccard=0.33
- 46c4e1d11c241e35871c1c4661a8ef9f.jpg <-> d37e4abbcb1fb66e75e1254e0ed5ccec.jpg: overlap=8, jaccard=0.33
- 402c17af72fc0eec89e1f5e3589de7bb.jpg <-> aa14821f6828dd6f63cf1fcc74050a29.jpg: overlap=7, jaccard=0.28
Lowest top16-overlap pairs:
- 02066cb88c44980a81e5f04ef2150af5.jpg <-> 28ebe33dc58b3a9c88fe09467727db27.jpg: overlap=0, jaccard=0
- 02066cb88c44980a81e5f04ef2150af5.jpg <-> 46c4e1d11c241e35871c1c4661a8ef9f.jpg: overlap=0, jaccard=0
- 02066cb88c44980a81e5f04ef2150af5.jpg <-> 5d26f76472131c2904c9a2729e850a22.jpg: overlap=0, jaccard=0
- 02066cb88c44980a81e5f04ef2150af5.jpg <-> aa14821f6828dd6f63cf1fcc74050a29.jpg: overlap=0, jaccard=0
- 02066cb88c44980a81e5f04ef2150af5.jpg <-> acadefe72ef776bdd8913a4b1df8aaab.jpg: overlap=0, jaccard=0

## Global recurrence

Recurring tracks: 46
- Victor Lundberg - Come Back Again: images=5 (02066cb88c44980a81e5f04ef2150af5.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,63124baa245a1133a63c9f6978f701ef.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- BLU-SWING - 満ちていく体温: images=4 (46c4e1d11c241e35871c1c4661a8ef9f.jpg,5d26f76472131c2904c9a2729e850a22.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- Tycho - A Walk: images=4 (02066cb88c44980a81e5f04ef2150af5.jpg,050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- 주혜린 - 아무것도: images=4 (0ea78a4ffc3af667e68e52ea29867a9b.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg,aa14821f6828dd6f63cf1fcc74050a29.jpg)
- The Cranberries - Linger: images=4 (02066cb88c44980a81e5f04ef2150af5.jpg,050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- The Marías - Cariño: images=4 (050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- Cory Wong & Stephen Day - Tongue Tied: images=3 (46c4e1d11c241e35871c1c4661a8ef9f.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- WhiteUsedSocks - How I Wish!: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,5d26f76472131c2904c9a2729e850a22.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- Mikayla Geier - Ring Pop: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,46c4e1d11c241e35871c1c4661a8ef9f.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- The Furthermores - Show Me How: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,5d26f76472131c2904c9a2729e850a22.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- DORI - Thursday Taco Man: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,5d26f76472131c2904c9a2729e850a22.jpg,63124baa245a1133a63c9f6978f701ef.jpg)
- Astels - We Gotta Let Go: images=3 (402c17af72fc0eec89e1f5e3589de7bb.jpg,63124baa245a1133a63c9f6978f701ef.jpg,aa14821f6828dd6f63cf1fcc74050a29.jpg)
- Colde - Control Me: images=3 (402c17af72fc0eec89e1f5e3589de7bb.jpg,63124baa245a1133a63c9f6978f701ef.jpg,aa14821f6828dd6f63cf1fcc74050a29.jpg)
- Mazzy Star - Into Dust: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- Tycho - Awake: images=3 (02066cb88c44980a81e5f04ef2150af5.jpg,050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg)
- Lana Del Rey - Video Games: images=3 (02066cb88c44980a81e5f04ef2150af5.jpg,050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg)
- Slowdive - Alison: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- Mazzy Star - Fade Into You: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- 박문치 - J U S T F U N (with 죠지): images=2 (46c4e1d11c241e35871c1c4661a8ef9f.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
- a!ka - All Bark No Bite: images=2 (46c4e1d11c241e35871c1c4661a8ef9f.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)
Recurring artists: 42
- couch: images=5 (28ebe33dc58b3a9c88fe09467727db27.jpg,46c4e1d11c241e35871c1c4661a8ef9f.jpg,5d26f76472131c2904c9a2729e850a22.jpg,aa14821f6828dd6f63cf1fcc74050a29.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- victor lundberg: images=5 (02066cb88c44980a81e5f04ef2150af5.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,63124baa245a1133a63c9f6978f701ef.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- 주혜린: images=4 (0ea78a4ffc3af667e68e52ea29867a9b.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg,aa14821f6828dd6f63cf1fcc74050a29.jpg)
- blu-swing: images=4 (46c4e1d11c241e35871c1c4661a8ef9f.jpg,5d26f76472131c2904c9a2729e850a22.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- the cranberries: images=4 (02066cb88c44980a81e5f04ef2150af5.jpg,050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- the marías: images=4 (050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- tycho: images=4 (02066cb88c44980a81e5f04ef2150af5.jpg,050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- astels: images=3 (402c17af72fc0eec89e1f5e3589de7bb.jpg,63124baa245a1133a63c9f6978f701ef.jpg,aa14821f6828dd6f63cf1fcc74050a29.jpg)
- colde: images=3 (402c17af72fc0eec89e1f5e3589de7bb.jpg,63124baa245a1133a63c9f6978f701ef.jpg,aa14821f6828dd6f63cf1fcc74050a29.jpg)
- cory wong & stephen day: images=3 (46c4e1d11c241e35871c1c4661a8ef9f.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg,d37e4abbcb1fb66e75e1254e0ed5ccec.jpg)
- dori: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,5d26f76472131c2904c9a2729e850a22.jpg,63124baa245a1133a63c9f6978f701ef.jpg)
- gsoul: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,402c17af72fc0eec89e1f5e3589de7bb.jpg,aa14821f6828dd6f63cf1fcc74050a29.jpg)
- lana del rey: images=3 (02066cb88c44980a81e5f04ef2150af5.jpg,050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg)
- mazzy star: images=3 (050e0c11047a97bc23cbd3be7458e6c7.jpg,0ea78a4ffc3af667e68e52ea29867a9b.jpg,a716b5df798161f7a5c77ed701b8fc1b.jpg)
- mikayla geier: images=3 (28ebe33dc58b3a9c88fe09467727db27.jpg,46c4e1d11c241e35871c1c4661a8ef9f.jpg,acadefe72ef776bdd8913a4b1df8aaab.jpg)

## Genre / artist concentration

- primaryGenre concentration: **scene-specific concentration** ("pop" dominant in 5/12)
- subgenre concentration: **scene-specific concentration** ("city-pop" dominant in 3/12)
- artist repetition: **frequent within an image** (max in one top16=2, max image-recurrence=5)

## Sequencing observation

Every image preserved all scored top-10 tracks in the final 10 with no outside tracks introduced.

## Final diagnostic classification


**q1_distinctVectors**: 12 images produced 12 distinct full 30-dim vectors.

**q2_midpointCollapseEvidence**: 2 of 30 dimensions have >=75% of images landing in [40,60]. Dimensions: density, acousticness.

**q3_nearlyIdenticalVectors**: Most similar pair: 46c4e1d11c241e35871c1c4661a8ef9f.jpg vs d37e4abbcb1fb66e75e1254e0ed5ccec.jpg, meanAbsDistance=10.17.

**q4_distinctVectorsDistinctRankings**: Mean pairwise top16 Jaccard across all image pairs = 0.06.

**q5_oneTrackDominatesUnrelatedImages**: 46 track(s) recur across >1 image; max image-recurrence = 5.

**q6_oneArtistDominatesUnrelatedImages**: Max artist image-recurrence = 5 of 12 images.

**q7_oneGenreDominatesUnrelatedImages**: "pop" dominant in 5/12 images -> scene-specific concentration.

**q8_seasonVariesMeaningfully**: Season field stats: spring sd=21.15, summer sd=29.87, autumn sd=32.62, winter sd=30.42

**q9_timeVariesMeaningfully**: Time field stats: morning sd=25.01, day sd=27.17, dusk sd=19.72, night sd=28.64, lateNight sd=26.34

**q10_weatherVariesMeaningfully**: Weather field stats: clear sd=27.8, cloudy sd=19.91, rain sd=32.27, snow sd=26.87

**q11_desiredSoundVariesMeaningfully**: Desired-sound field stats: energy sd=20.43, groove sd=21.39, density sd=13.12, acousticness sd=12.98, electronicness sd=14.98, vocalPresence sd=15.86, climaxIntensity sd=17.01

**q12_scoreSpreadsInformative**: Mean top16 scoreSpread across images = 2.87.

**q13_ranks11to16CloseEnoughFor20Track**: Mean (rank1-10 avg minus rank11-16 avg) gap across images = 1.08.

**q14_sequencingPreservesScoredTop10**: Yes — every image had all scored top-10 tracks present in final-10 with no outside tracks introduced.

**q15_hardGenreCapEvidence**: NOT SUPPORTED BY CURRENT EVIDENCE

**q16_hardArtistCapEvidence**: NOT SUPPORTED BY CURRENT EVIDENCE

**q17_vectorRedundancyEvidence**: Not separately computed as a track-vs-track metric in this real-image run; see pairwiseVectorDistances for image-vector-level similarity. Requires manual/human review of whether visually distinct source photos are producing recommendation sets that feel redundant.

**q18_humanReviewStillRequired**: Yes — human-review fields in perImageResults[].humanReview are intentionally blank and required before any quality claim.

**q19_candidatePoolExpansionReadiness**: Technically: yes, the scoring/ranking pipeline runs over the full 795-track catalog and returns as many ranked candidates as requested. Quality readiness is not established by this diagnostic alone.

**q20_twentyTrackReadiness**: technically ready (pipeline can score/rank/select beyond 16 without code changes) — NOT quality-validated (human-review fields are blank) and NOT enabled in production (CATALOG_CANDIDATE_POOL_SIZE/FINAL_TRACK_COUNT unchanged by this task).