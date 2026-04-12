# Ecological Connections — Design

Cross-data correlations and enhanced data sections for the California Nature Dashboard.

## New sections

### Migration Pulse (top of data column)
- eBird daily stats for US-CA, past 30 days
- Hero: today's species count, full-width 30-day sparkline
- Secondary: checklists + observers
- API: `product/stats/US-CA/{y}/{m}/{d}` × 30 days, cached 6h

### Ecological Connections (between birds and pollinators)
- Conditional field journal entries computed from existing API data
- Topics: shorebird habitat (river flow), pollinator conditions (weather), tidal exposure (tide timing), seasonal signal (migration trend), plant–pollinator coupling
- 2-5 entries depending on what data supports today
- No new API calls

## Enhanced existing sections

### Tides: add ocean water temperature
- NOAA `product=water_temperature` per station, fetched in parallel with predictions
- Displayed as single temp value below hi/lo annotation

### Rivers: add precipitation sparkline
- Open-Meteo 7-day daily precip at each gauge lat/lng
- 12px-tall green-700 sparkline stacked above existing flow sparkline
- Shows rain→flow lag visually

### Conditions: add weekly precipitation
- Open-Meteo `daily=precipitation_sum` past 7 days per city
- Summed, shown inline: "1.2″ this week"

## Implementation order

1. eBird stats API route + Migration Pulse component
2. NOAA water temp added to tides API + tide strip update
3. River precipitation API route + river card enhancement
4. Weather API enhanced with weekly precip + conditions update
5. Ecological Connections section (computed from all existing data)
