# California Nature Dashboard

A living survey of California's ecosystems — tides, rivers, birds, pollinators, and weather rendered through the visual language of 19th century scientific illustration.

**Live:** [california-nature.vercel.app](https://california-nature.vercel.app)

## What it does

One page that answers: "What's happening in California's natural world right now?"

The dashboard pulls live data from six public APIs and presents it as a naturalist's field journal — Crimson Pro serif typography, watercolor wash backgrounds, hand-painted specimen illustrations, and an interactive SVG map of California with data-driven rivers, tides, and species observations.

### Data sections

- **Ecological Connections** — computed cross-data insights: shorebird habitat conditions, pollinator activity forecasts, predator-prey overlap, tidal feeding windows, seasonal migration signals
- **Coastal Tides** — 8 NOAA stations from Humboldt to La Jolla with sparklines and next high/low predictions
- **Rivers** — 10 USGS gauging stations with discharge sparklines and water temperature color-coded by ecological health (salmon/steelhead stress thresholds)
- **Lakes & Reservoirs** — 7 major California reservoirs from CDEC with storage levels and percent capacity
- **Monarch Migration** — 12-month interactive sparkline of Western Monarch observations from iNaturalist, with per-month geographic distribution on the map
- **Pollinators & Host Plants** — top bee, butterfly, and plant species with observation counts from iNaturalist's species_counts endpoint
- **Birds** — statewide species diversity stats from eBird plus notable/rare sightings

### Map

The left-column California map is a static SVG with:
- River lines whose stroke width encodes discharge volume
- Tide station dots whose size encodes current water level
- Monarch observation clusters (orange dots) that update when hovering the migration sparkline
- Species observation dots that appear when hovering pollinator/bird entries
- Animated river flow (CSS stroke-dashoffset) and tide breathing (CSS scale pulse)
- Cross-highlight with the data panel via scroll proximity and hover

## Data sources

| Source | What | Auth | Refresh |
|--------|------|------|---------|
| [NOAA Tides & Currents](https://tidesandcurrents.noaa.gov) | Tide predictions, water level, ocean temperature | None | 6 min |
| [USGS Water Services](https://waterservices.usgs.gov) | River discharge, water temperature | None | 15 min |
| [California CDEC](https://cdec.water.ca.gov) | Reservoir storage levels | None | 1 hour |
| [eBird](https://ebird.org) | Notable sightings, daily species stats | API key | 30 min |
| [iNaturalist](https://www.inaturalist.org) | Pollinators, butterflies, plants, monarchs | None | 1 hour |
| [Open-Meteo](https://open-meteo.com) | Weather conditions, air temperature | None | 30 min |

## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Typography:** Crimson Pro serif + Geist Mono
- **Charts:** Custom inline SVG sparklines — no charting library
- **Data fetching:** Server-side API routes with ISR caching, SWR on the client
- **Illustrations:** Pre-generated naturalist watercolor PNGs (Midjourney) with CSS die-cut drop-shadow treatment
- **Deployment:** Vercel

## Getting started

```bash
git clone https://github.com/chrisbalin/california-nature.git
cd california-nature
npm install
```

Create `.env.local`:
```
EBIRD_API_KEY=your_key_here
```

Get a free eBird API key at [ebird.org/api/keygen](https://ebird.org/api/keygen). All other APIs are keyless.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Design

The aesthetic is inspired by Maria Sibylla Merian's specimen plates, Audubon's birds, 19th century comparative charts, and USGS topographic maps. The design system is documented in [CLAUDE.md](CLAUDE.md).

Key principles:
- **The illustration is the data.** Every visual element encodes real information.
- **Warm naturalist palette.** Stone-50 paper background, stone-800 ink, sky-600 water, amber for warnings.
- **Serif typography.** Scientific names always italic. Numbers always monospace.
- **No chart junk.** Sparklines have no axes, no gridlines, no backgrounds.

Watercolor wash textures and specimen illustrations are static assets in `public/`.

## Authors

A field study by [Madeleine Smith](https://madeleineesmith.com) and [Chris Balin](https://chrisbalin.com).

Illustrations generated with Midjourney. Built with [Claude Code](https://claude.ai/code).
