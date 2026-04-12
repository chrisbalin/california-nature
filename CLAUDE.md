@AGENTS.md

---
name: naturalist-dashboard
description: Design guidelines for the California Nature Dashboard. Reference before building or modifying any component, visualization, or layout.
---

# Design System — California Nature Dashboard

A modern naturalist's field dashboard. The visual language is 19th century scientific illustration meets live data. Think Maria Sibylla Merian's specimen plates, Audubon's birds, and the great comparative charts — but fed by APIs.

## The Rule

**The illustration is the data.** There is no decorative layer. There is no data layer. There is one unified thing. Every visual element encodes real information. If a butterfly appears, it's because butterflies were observed. If a river line is thick, flow is high. If a flower is present, plants were documented in that region. Nothing is ornamental. Beauty comes from the care of the rendering, not from decoration.

## Typography

| Role | Treatment |
|------|-----------|
| Section headers | Serif, uppercase, `tracking-[0.2em]`, `text-sm`, `text-stone-500`. Like a plate title. |
| Scientific names | Serif, italic. *Apis mellifera*, *Danaus plexippus*. Always italic. |
| Common names | Serif, regular weight. |
| Annotations / labels | Serif, `text-xs`, `text-stone-500`. Like map labels. |
| Data values (numbers) | `font-mono tabular-nums text-right`. The one modern convention. |
| Location names | Serif, regular, `text-sm`. |
| Timestamps | Serif, `text-xs`, `text-stone-400`. Relative when recent ("9h ago"), date when older. |

**Font**: Crimson Pro, Libre Baskerville, or similar refined serif. Load via `next/font/google`. Never Inter, Arial, system-ui, or geometric sans-serif.

## Color Palette

Warm, natural, muted. Ink on cream paper.

| Role | Token | Hex |
|------|-------|-----|
| Background (paper) | `stone-50` | `#fafaf9` |
| Primary text (ink) | `stone-800` | `#292524` |
| Secondary text | `stone-500` | `#78716c` |
| Data lines / sparklines | `stone-700` | `#44403c` |
| Water (tides, rivers) | `sky-600` to `sky-800` | `#0284c7` - `#075985` |
| Low flow / dry | `amber-600` | `#d97706` |
| High flow / wet | `sky-600` | `#0284c7` |
| Critical (drought/flood) | `red-700` | `#b91c1c` |
| Vegetation / plants | `green-700` | `#15803d` |
| Bees / pollinators | `amber-500` | `#f59e0b` |
| Rare / notable | `red-700` | `#b91c1c` |
| Dividers | `stone-200` | `#e7e5e4` |

**Rule**: The page should feel mostly cream and dark ink. Color appears sparingly — for water, for ecological signal, for specimen illustrations. If everything is colorful, nothing stands out.

## Component Specs

### Section Header
```
── COASTAL TIDES ──────────────────────────────────
```
Serif, uppercase, `tracking-[0.2em]`, `text-sm`, `text-stone-500`. A thin `border-stone-200` rule extends to the right. No background, no icon.

### Sparkline (base)
```
Width: 80-120px | Height: 18-24px | Stroke: 1.5px
Color: stone-700 default, sky-600 for water data
No axes, no gridlines, no background
Optional: dot on rightmost point (current value)
Stroke-linecap: round (feels hand-drawn)
```

### Tide Coastal Cross-Section
The tides section is rendered as a single continuous illustration: a simplified California coastal profile from Humboldt (north) to La Jolla (south). Water levels are shown as a filled blue area that rises and falls at each station. Stations are labeled directly on the coast in `text-xs` serif. Next high/low time + height annotated beside each station.

This is the most illustrative component — it should feel like a naturalist's coastal survey drawing.

### River Comparative Chart
Rivers arranged side by side, inspired by 19th century comparative charts. Each river shows:
- River name (serif, uppercase, small)
- Current flow in CFS (mono, tabular-nums)
- 7-day sparkline (sky-600 or amber-600 depending on flow vs normal)
- Sort: by current flow descending, not alphabetical

All rivers share consistent sparkline scales so visual comparison is meaningful.

### Bird Sightings
Each notable sighting rendered as a specimen entry:
```
[illustration]  Haliaeetus leucocephalus
                Bald Eagle · Lake Merced
                2 individuals · 9h ago
```
- Illustration: 40-60px, from `public/illustrations/birds/` if available, omitted if not
- Scientific name: italic serif
- Common name + location: regular serif
- Count + time: `text-xs text-stone-400`
- Rare species: `border-l-2 border-red-700` accent on the left

### Pollinator Specimen Plate
Layout inspired by a naturalist's specimen plate. Top species listed with:
- Illustration (40-60px) from `public/illustrations/`
- Scientific name in italic
- Common name below
- Observation count to the right
- Arranged in a clean grid, 2-3 per row

### Weather Strip
Bottom of the page. Minimal. Serif. No weather icons — describe in words.
```
San Francisco, clear, 58°F · Sacramento, clear, 72°F · Los Angeles, partly cloudy, 68°F
```

### Specimen Label (reusable component)
Used wherever a species is referenced:
```tsx
<SpecimenLabel
  scientificName="Apis mellifera"
  commonName="Western Honey Bee"
  detail="93 observations"
  illustration="/illustrations/bees/western-honey-bee.png"  // optional
/>
```
Renders: illustration (if provided) + scientific name (italic) + common name + detail text.

## Layout

Single page, vertical scroll, no routing. Reads top to bottom like a broadsheet chart.

```
[Title block]
[Coastal tides — illustrated cross-section]
[Rivers — comparative chart grid]
[Notable birds — specimen entries]
[Pollinators — specimen plate]
[Weather — text strip]
[Footer — sources, timestamp]
```

Page max-width: `max-w-5xl` (1024px). Centered with generous side margins. The content should feel like a well-set page, not a full-bleed app.

Section spacing: `space-y-10` to `space-y-12`. Let sections breathe — this is a field journal, not a cramped dashboard.

## Background and Texture

- `bg-stone-50` base
- Optional: very subtle paper grain via CSS noise filter (`opacity: 0.02`)
- Optional: faint topo contour pattern behind the rivers section (`stone-200`, `opacity: 0.04`)
- No card backgrounds. No card shadows. No card borders unless they are fine ruling lines (`border-stone-200`).

## Illustration Integration

Illustrations are static assets in `public/illustrations/`, generated externally. They are NOT inline SVG shapes or emoji.

**When illustration is available**: Render it at 40-80px, positioned left of the species label.

**When illustration is not available**: Render just the text label. No placeholder, no icon, no fallback illustration. The dashboard works without illustrations and gets richer as they're added.

**Animation**: In v1, illustrations are static. In a future version, a single butterfly may follow a slow CSS path across the page — cinematic, not cute. But this is a stretch goal.

## Density Targets

| Element | Target |
|---------|--------|
| Body text | `text-sm` (14px) serif |
| Data values | `text-sm` font-mono tabular-nums |
| Annotations | `text-xs` (12px) serif, stone-500 |
| Section headers | `text-sm` uppercase tracking-[0.2em] |
| Illustration size | 40-80px |
| Section spacing | `space-y-10` to `space-y-12` |
| River card gap | `gap-4` to `gap-6` |
| Bird entry height | 48-60px |
| Page max-width | `max-w-5xl` (1024px) |
| Page padding | `px-6` to `px-8` |

## Anti-Patterns

Do NOT build:
- Programmatic SVG bees/butterflies buzzing around the screen
- A "decorative layer" that toggles on and off
- Weather icons or emoji
- Card-based layouts with shadows and rounded corners
- Sans-serif typography
- Cold gray (`zinc`) backgrounds — use warm `stone`
- Loading spinners — load sections progressively
- Tooltips as the only way to see data
- Color-coding that requires a legend
- Pie charts, donut charts, gauges
- Any animation that delays comprehension
- Illustrations that overlap or obscure data text
- Placeholder illustrations or generic icons when real illustrations aren't available
- Centered text in data displays
