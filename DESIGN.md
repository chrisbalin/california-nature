# California Nature Dashboard

A modern naturalist's field dashboard — showing the living pulse of California's ecosystems through the visual language of 19th century scientific illustration and comparative charts. Tides, rivers, birds, pollinators, and weather, rendered with the density of Tufte and the craft of Merian.

## Vision

One screen that answers: "What's happening in California's natural world right now?"

The aesthetic precedent is the great comparative charts of the 1800s — the ones that showed every river's length and every mountain's height in a single engraved view. In those charts, the illustration IS the data. Rivers aren't decorated; their lengths are proportional. Mountains aren't decorative; their heights are accurate. But the rendering has the beauty of a hand-drawn naturalist plate.

This dashboard is the modern version of that tradition. It is NOT two layers (data + decoration). It is ONE unified thing: data rendered as illustration. The river sparklines evoke flowing water. The tide visualizations feel like a coastal cross-section. Butterflies appear near real observation clusters, labeled in fine italic serif like a specimen plate annotation. Every visual element earns its place by encoding real data, but it's drawn with care because information deserves to be beautiful.

**Reference lineage:**
- Maria Sibylla Merian — insects and plants rendered with scientific accuracy and artistic beauty
- John James Audubon — *The Birds of America*, dramatic and precise
- 19th century comparative charts — rivers, mountains, all the world's data in one engraved view
- Edward Tufte — data density, small multiples, no chart junk, direct labeling
- USGS topographic maps — the restrained beauty of contour lines and careful typography

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui for structural elements, custom for all data viz
- **Charts**: Custom SVG — no charting library. All visualizations are hand-crafted to match the naturalist aesthetic.
- **Illustration assets**: Pre-generated PNG/SVG illustrations (butterflies, bees, flowers, birds) created via image generation in the style of natural history plates. Placed programmatically at data-driven positions.
- **Data fetching**: Server-side API routes (`app/api/`) to proxy external APIs, SWR or React Query on the client
- **Deployment**: Vercel

## Art Direction

### The feel

Imagine opening a naturalist's field journal that somehow has live data. The paper is warm cream. The typography is a careful serif. The charts are drawn with the precision of an engraver. In the margins, a hand-painted butterfly sits near the cluster of observations where it was actually spotted. A bee illustration appears beside the pollinator count, labeled in Latin italic. The rivers flow downward on the page like the comparative charts of the 1800s.

It should feel like something a 19th century naturalist would have made if they had APIs.

### Typography

- **Display / section headers**: A refined serif — Crimson Pro, Libre Baskerville, or similar. Uppercase tracked headers feel like plate titles on a naturalist chart.
- **Species names and annotations**: Italic serif for Latin/scientific names. Regular weight serif for common names and descriptive annotations.
- **Data values (numbers)**: Monospace with `tabular-nums` for alignment. This is the one place the modern data-dashboard convention overrides the naturalist aesthetic — numbers need to scan fast.
- **Small labels**: `text-xs`, serif, `text-stone-500`. Think of the tiny labels on a topographic map.

Avoid: Inter, system fonts, geometric sans-serifs. The typography should feel considered and humanist, not generic.

### Color palette

The palette is muted, natural, and warm — not the cold zinc of a typical dashboard.

| Role | Color | Notes |
|------|-------|-------|
| Background | `stone-50` / `#fafaf9` | Warm cream, like aged paper |
| Primary text | `stone-800` / `#292524` | Dark warm gray, not black |
| Secondary text | `stone-500` | Annotations, labels, timestamps |
| Ink / data lines | `stone-700` | Sparklines, chart strokes — like ink on paper |
| Water / rivers / tides | `sky-600` to `sky-800` | Blues for all water data |
| River low flow | `amber-600` | Rivers below normal |
| River high flow | `sky-600` | Rivers above normal |
| River critical | `red-700` | Drought or flood |
| Vegetation / plants | `green-700` to `emerald-700` | Plant observations, wildflowers |
| Pollinator (bees) | `amber-500` | Warm gold |
| Pollinator (butterflies) | `orange-400` / varies | Species-appropriate colors |
| Notable / rare | `red-700` ink | Rare bird sighting accent |
| Paper texture | `stone-100` at low opacity | Subtle grain overlay |

### Illustration assets

These are pre-generated images (PNG with transparency or detailed SVG) in the style of natural history plates. They are NOT programmatic SVG shapes. They should look hand-painted.

**Assets needed:**
- Western Honey Bee (side view, wings folded and extended variants)
- 2-3 butterfly species common to California (Monarch, Painted Lady, Swallowtail)
- 3-4 wildflower species (California Poppy, Lupine, Coast Sunflower)
- 2-3 bird illustrations for the notable sightings section
- Decorative corner/border elements inspired by naturalist plate frames (optional)

**Generation prompt template:**
```
Natural history scientific illustration of [species common name] ([Latin name]),
watercolor and fine ink on cream paper, in the style of Maria Sibylla Merian,
detailed specimen study, isolated on white background, no text, no labels,
botanically/entomologically accurate, soft natural colors
```

**Placement rules:**
- Illustrations are placed at DATA-DRIVEN positions. A butterfly illustration appears near the geographic region where butterfly observations are concentrated. A bee appears beside the pollinator count.
- Illustrations are sized to complement, not dominate. Roughly 40-80px in their primary dimension.
- Each illustration gets a fine-print annotation label: species name in italic serif, observation count or context in regular weight.
- Think of them as specimen plates pinned into the margins of a working document.

### Background and texture

- Base: `bg-stone-50` (warm cream)
- Subtle paper grain texture via CSS: a noise SVG filter at very low opacity (0.02-0.03), or a tiling paper texture image
- Optional: very faint topo contour lines as a background pattern in the rivers section, evoking USGS quad maps. `stone-200` at 4-5% opacity.
- Borders and dividers: `border-stone-200`, fine (1px), or none. Use whitespace to separate sections when possible.

### Illustrated data visualizations

The visualizations themselves should feel drawn, not computed:

**Tide cross-section**: Instead of a row of disconnected sparklines, consider rendering the California coast as a simplified illustrated profile (north to south), with water level shown as a filled area that rises and falls. Each station is labeled directly on the coast. The water fill uses a subtle blue gradient. This is one continuous illustration with data mapped into it.

**River comparative chart**: Inspired directly by the 19th century comparative charts. Rivers rendered as vertical or flowing lines, with current flow (CFS) encoded as line thickness or as a labeled value. Arranged side by side for comparison. Each river could have a tiny illustrated element at its source or mouth — a mountain, a bay.

**Bird sightings**: A compact table, but with a small illustration of the most notable species beside its entry. Species names in italic serif. Locations feel like handwritten annotations.

**Pollinator summary**: A specimen plate layout — the top observed species illustrated and labeled, with observation counts as small figures beside each specimen.

**Weather strip**: Minimal, at the bottom. Temperatures in serif. Conditions described in words ("Clear, 58°F") rather than icons.

## Data Sources

### 1. NOAA Tides & Currents (coastal)

**API**: `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter`
**Auth**: None required. Include `application=CalNatureDashboard` as courtesy.
**CORS**: Yes, browser-friendly.

Key California stations:
| Station ID | Name |
|-----------|------|
| 9414290 | San Francisco |
| 9414750 | Alameda |
| 9415020 | Point Reyes |
| 9410230 | La Jolla |
| 9410660 | Los Angeles |
| 9411340 | Santa Barbara |
| 9413450 | Monterey |
| 9418767 | North Spit (Humboldt) |

**Products to fetch**:
- `predictions` — tide predictions (high/low with `interval=hilo`, or 6-min intervals without)
- `water_level` — actual measured water levels (real-time)
- `water_temperature` — ocean temp
- `air_temperature`, `wind` — coastal weather

**Example request**:
```
/datagetter?date=today&station=9414290&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=metric&format=json
```

**Response shape**:
```json
{
  "predictions": [
    { "t": "2026-04-10 03:42", "v": "1.743", "type": "H" },
    { "t": "2026-04-10 10:18", "v": "0.152", "type": "L" }
  ]
}
```

For 6-minute interval data (sparkline-ready), omit `interval=hilo`.

### 2. USGS Water Services (rivers & reservoirs)

**API**: `https://waterservices.usgs.gov/nwis/iv/` (instantaneous values)
**Auth**: None required.
**CORS**: Yes.

Key California rivers:
| Site ID | Name | River |
|---------|------|-------|
| 11377100 | Sacramento R at Bend Bridge | Sacramento |
| 11303500 | San Joaquin R near Vernalis | San Joaquin |
| 11463000 | Russian R near Guerneville | Russian |
| 11523200 | Klamath R at Orleans | Klamath |
| 11186000 | Kern R near Kernville | Kern |
| 11446500 | American R at Fair Oaks | American |
| 11158600 | Salinas R near Chualar | Salinas |

**Parameters**:
- `00060` = Discharge (cubic feet per second)
- `00065` = Gage height (feet)

**Example request**:
```
/iv/?sites=11377100,11303500,11463000&parameterCd=00060,00065&period=P7D&format=json
```

### 3. eBird API 2.0 (birds)

**API**: `https://api.ebird.org/v2/`
**Auth**: API key required (free, instant). Header: `X-eBirdApiToken: <key>`
**CORS**: Proxy through Next.js API route.

**Key endpoints**:
- `data/obs/geo/recent/notable` — rare/unusual sightings
- `data/obs/{regionCode}/recent` — recent obs in a region (e.g., `US-CA`)

**Example request**:
```
GET /v2/data/obs/geo/recent/notable?lat=37.77&lng=-122.42&dist=50
X-eBirdApiToken: YOUR_KEY
```

**Response shape**:
```json
[
  {
    "speciesCode": "baleag",
    "comName": "Bald Eagle",
    "sciName": "Haliaeetus leucocephalus",
    "locName": "Lake Merced",
    "obsDt": "2026-04-09 14:30",
    "howMany": 2,
    "lat": 37.7285,
    "lng": -122.4936
  }
]
```

### 4. Open-Meteo (weather)

**API**: `https://api.open-meteo.com/v1/forecast`
**Auth**: None required.
**CORS**: Yes.

**Example request**:
```
/v1/forecast?latitude=37.77&longitude=-122.42&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&timezone=America/Los_Angeles&past_days=7
```

### 5. iNaturalist (bees, butterflies, wildflowers)

**API**: `https://api.inaturalist.org/v1/observations`
**Auth**: None for read-only.
**Rate limits**: 100 requests/minute (aim for 60/min).
**CORS**: Yes.

**Example requests**:
- Bees: `?taxon_id=630955&place_id=14&d1=2026-04-03&quality_grade=research&per_page=200`
- Butterflies: `?taxon_id=47224&place_id=14&d1=2026-04-03&quality_grade=research&per_page=200`
- Plants: `?taxon_id=47126&place_id=14&d1=2026-04-03&quality_grade=research&per_page=200`

Taxon IDs: `630955` = Apoidea (bees), `47224` = Lepidoptera (butterflies/moths), `47126` = Plantae.
Place IDs: `14` = California.

## Architecture

```
app/
├── api/
│   ├── tides/route.ts          # Proxy NOAA — aggregate multiple stations
│   ├── rivers/route.ts         # Proxy USGS — curated CA rivers
│   ├── birds/route.ts          # Proxy eBird (required — CORS)
│   ├── weather/route.ts        # Proxy Open-Meteo
│   └── pollinators/route.ts    # Proxy iNaturalist (bees, butterflies, plants)
├── page.tsx                     # Main dashboard — single page, no routing
├── components/
│   ├── tide-coast.tsx           # Illustrated coastal cross-section with tide data
│   ├── river-chart.tsx          # Comparative chart of CA rivers
│   ├── river-sparkline.tsx      # Illustrated inline sparkline for river flow
│   ├── bird-sightings.tsx       # Notable sightings with species illustrations
│   ├── pollinator-plate.tsx     # Specimen plate layout for pollinators
│   ├── weather-strip.tsx        # Minimal conditions strip
│   ├── section-header.tsx       # Serif uppercase plate-title style headers
│   ├── sparkline.tsx            # Base SVG sparkline component
│   ├── specimen-label.tsx       # Italic species name + annotation component
│   └── paper-texture.tsx        # Background texture overlay
├── lib/
│   ├── api.ts                   # Fetch helpers with caching
│   ├── stations.ts              # Station/site metadata (IDs, names, coords)
│   ├── species.ts               # Species metadata, illustration file mappings
│   ├── format.ts                # Number formatting, date formatting
│   └── types.ts                 # TypeScript types for API responses
├── public/
│   └── illustrations/           # Pre-generated naturalist illustration assets
│       ├── bees/
│       │   └── western-honey-bee.png
│       ├── butterflies/
│       │   ├── monarch.png
│       │   ├── painted-lady.png
│       │   └── swallowtail.png
│       ├── flowers/
│       │   ├── california-poppy.png
│       │   ├── lupine.png
│       │   └── coast-sunflower.png
│       ├── birds/
│       │   ├── bald-eagle.png
│       │   └── red-tailed-hawk.png
│       └── elements/
│           ├── plate-border.svg
│           └── compass-rose.svg
└── styles/
    └── globals.css              # Paper textures, serif font imports, base styles
```

## Visual Layout

Single page, vertical scroll. The page reads like a naturalist's comparative chart — dense, illustrated, and continuous.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   C A L I F O R N I A   N A T U R E   D A S H B O A R D│
│   ─────────────────────────────────────────────────────  │
│   A living survey of the state's ecosystems             │
│   April 10, 2026                                        │
│                                                         │
│   ── COASTAL TIDES ──────────────────────────────────── │
│                                                         │
│   [Illustrated coastal profile, north to south]         │
│   Water level rises and falls as filled blue area       │
│   Stations labeled directly on the coast:               │
│   Humboldt · Pt Reyes · SF · Monterey · SB · LA        │
│   Next high/low annotated beside each station           │
│                                                         │
│   ── RIVERS ─────────────────────────────────────────── │
│                                                         │
│   [Comparative chart layout]                            │
│   Sacramento   San Joaquin   Russian   Klamath          │
│   ║             │             │          ║              │
│   ║ 11,500      │ 2,360       │ 319      ║ 333         │
│   ║ cfs         │ cfs         │ cfs      ║ cfs         │
│   ║▁▂▃▅▇        │▁▁▂▃▃        │▃▅▇▅▃     ║▁▁▂▂▁        │
│                                                         │
│   American      Salinas       Kern                      │
│   │ 2,020       │ 16          │ —                       │
│   │▂▃▅▅▃        │▁▁▁          │                         │
│                                                         │
│   ── NOTABLE BIRD SIGHTINGS ─────────────────────────── │
│                                                         │
│   [illustration]  Haliaeetus leucocephalus              │
│                   Bald Eagle · Lake Merced              │
│                   2 individuals · 9h ago                │
│                                                         │
│   [illustration]  Charadrius nivosus                    │
│                   Snowy Plover · Ocean Beach             │
│                   4 individuals · 12h ago               │
│   ...                                                   │
│                                                         │
│   ── POLLINATORS ────────────────────────────────────── │
│                                                         │
│   431 bee observations · 3,005 Lepidoptera              │
│   15,350 plant observations · last 7 days               │
│                                                         │
│   [specimen plate layout]                               │
│   [bee illus]  Apis mellifera            93 obs         │
│                Western Honey Bee                        │
│                                                         │
│   [bee illus]  Bombus crotchii           22 obs         │
│                Crotch's Bumble Bee                       │
│                                                         │
│   [butterfly]  Danaus plexippus          48 obs         │
│                Monarch                                  │
│   ...                                                   │
│                                                         │
│   ── CONDITIONS ─────────────────────────────────────── │
│   San Francisco, clear, 58°F                            │
│   Sacramento, clear, 72°F                               │
│   Los Angeles, partly cloudy, 68°F                      │
│   Eureka, rain, 54°F                                    │
│                                                         │
│   ─────────────────────────────────────────────────────  │
│   Data: NOAA · USGS · eBird · iNaturalist · Open-Meteo  │
│   Last updated 2:34 PM PDT                              │
└─────────────────────────────────────────────────────────┘
```

## Design Principles

Tufte's principles, reinterpreted for the naturalist aesthetic:

1. **The illustration is the data.** Every visual element encodes real information. A butterfly illustration appears because butterflies were actually observed. A river line is thick because flow is high. Nothing is decorative.

2. **Data-ink ratio still applies.** The illustrations are information-dense, not ornamental. A specimen plate of pollinators shows species, count, and relative abundance. A coastal cross-section shows 8 stations, their current levels, and predicted highs/lows.

3. **Direct labeling.** Species names in italic serif directly beside the illustration. Station names directly on the coast. Flow values directly beside the river. No legends, no color keys.

4. **Small multiples.** Rivers side by side with consistent scales. Tide stations along one continuous coast. The comparative chart tradition IS small multiples.

5. **Comparisons are default.** Rivers sorted by flow, not alphabetically. Tide stations ordered geographically so you can see the tidal wave propagate.

6. **Color encodes data.** Water is blue. Vegetation is green. Warnings are warm (amber, red). Everything else is the warm neutral palette of ink on paper.

7. **No chart junk — but illustration is not junk.** A hand-painted bee beside a data point is not a decorative icon. It's a visual identifier that's faster to parse than text. The test: does this element help you understand the data faster? If yes, it stays.

## Density Targets

| Element | Target |
|---------|--------|
| Body text | `text-sm` (14px) serif |
| Data values | `text-sm` font-mono tabular-nums |
| Labels | `text-xs` (12px) serif, stone-500 |
| Section headers | `text-sm` uppercase tracking-[0.2em] serif |
| Species names | `text-sm` italic serif |
| Illustration size | 40-80px primary dimension |
| Section spacing | `space-y-8` to `space-y-10` |
| River card gap | `gap-4` |
| Bird sighting row height | 48-56px (taller for illustrations) |

## Data Refresh Strategy

| Source | Refresh interval | Rationale |
|--------|-----------------|-----------|
| Tides | 6 minutes | Matches NOAA measurement interval |
| Rivers | 15 minutes | USGS updates ~15min |
| Birds | 30 minutes | Sightings trickle in |
| Weather | 30 minutes | Conditions change slowly |
| Pollinators | 1 hour | Research-grade obs are slow to appear |

Use SWR with `refreshInterval` per section. Show last-updated timestamp per section in `text-xs text-stone-400` serif.

## Environment Variables

```env
EBIRD_API_KEY=           # Required. Get from https://ebird.org/api/keygen
# All other APIs are keyless
```

## Getting Started

```bash
npx create-next-app@latest california-nature --typescript --tailwind --app --src-dir=false
cd california-nature
npx shadcn@latest init
# Add serif font (Crimson Pro or Libre Baskerville) via next/font/google
# Start building from app/api/ routes, then components, then page.tsx
```

## Illustration Asset Pipeline

Illustrations should be generated separately (via ChatGPT/DALL-E, Midjourney, or similar) and placed in `public/illustrations/`. They are static assets, not generated at runtime.

**Generation approach:**
1. Generate each specimen illustration as a standalone image on white/transparent background
2. Style: natural history / scientific illustration, watercolor and ink, Merian-inspired
3. Resolution: 512x512 or higher, displayed at 40-80px so detail matters at retina
4. Format: PNG with transparency preferred
5. Each illustration should be a single specimen, not a scene

**Prompt template:**
```
Natural history scientific illustration of [species common name] ([Latin name]),
watercolor and fine ink on cream paper, in the style of Maria Sibylla Merian,
detailed specimen study, isolated on white background, no text, no labels,
botanically/entomologically accurate, soft natural colors
```

Illustrations can be added incrementally. The dashboard works without them (falling back to just the text label) and gets richer as illustrations are added.

## Stretch Goals (not v1)

- Animated butterfly: a single high-quality butterfly illustration that follows a slow CSS path across the page, from edge to data and back. Cinematic, not cute.
- Coastal map section using real California coastline geometry
- California DWR snowpack + reservoir data
- Historical comparison (this year vs last year, rendered as overlaid line in lighter ink)
- Moon phase indicator (affects tides)
- Seasonal view: how the dashboard changes January vs July
- Print stylesheet: the dashboard should print beautifully as a single broadsheet
- Shareable URL with date parameter
