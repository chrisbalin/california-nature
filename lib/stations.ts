// NOAA tide stations, ordered north to south
export const TIDE_STATIONS = [
  { id: "9418767", name: "Humboldt", fullName: "North Spit (Humboldt)", lat: 40.7667, lng: -124.2167 },
  { id: "9415020", name: "Pt Reyes", fullName: "Point Reyes", lat: 37.9961, lng: -122.9767 },
  { id: "9414290", name: "San Francisco", fullName: "San Francisco", lat: 37.8063, lng: -122.4659 },
  { id: "9414750", name: "Alameda", fullName: "Alameda", lat: 37.7717, lng: -122.3000 },
  { id: "9413450", name: "Monterey", fullName: "Monterey", lat: 36.6050, lng: -121.8883 },
  { id: "9411340", name: "Santa Barbara", fullName: "Santa Barbara", lat: 34.4083, lng: -119.6850 },
  { id: "9410660", name: "Los Angeles", fullName: "Los Angeles", lat: 33.7200, lng: -118.2717 },
  { id: "9410230", name: "La Jolla", fullName: "La Jolla", lat: 32.8667, lng: -117.2583 },
] as const;

// USGS river gauging sites
export const RIVER_SITES = [
  { id: "11377100", name: "Sacramento River", river: "Sacramento", fullName: "Sacramento R at Bend Bridge", lat: 40.2913, lng: -122.1862 },
  { id: "11303500", name: "San Joaquin River", river: "San Joaquin", fullName: "San Joaquin R near Vernalis", lat: 37.6758, lng: -121.2650 },
  { id: "11463000", name: "Russian River", river: "Russian", fullName: "Russian R near Guerneville", lat: 38.5069, lng: -122.9290 },
  { id: "11523200", name: "Klamath River", river: "Klamath", fullName: "Klamath R at Orleans", lat: 41.3024, lng: -123.5330 },
  { id: "11186000", name: "Kern River", river: "Kern", fullName: "Kern R near Kernville", lat: 35.7547, lng: -118.4247 },
  { id: "11446500", name: "American River", river: "American", fullName: "American R at Fair Oaks", lat: 38.6317, lng: -121.2261 },
  { id: "11158600", name: "Salinas River", river: "Salinas", fullName: "Salinas R near Chualar", lat: 36.5556, lng: -121.5217 },
  { id: "11477000", name: "Eel River", river: "Eel", fullName: "Eel R at Scotia", lat: 40.4915, lng: -124.0997 },
  { id: "11092450", name: "Los Angeles River", river: "Los Angeles", fullName: "LA R at Sepulveda Dam", lat: 34.1617, lng: -118.4667 },
  { id: "11074000", name: "Santa Ana River", river: "Santa Ana", fullName: "Santa Ana R below Prado Dam", lat: 33.8833, lng: -117.6453 },
  { id: "11109000", name: "Santa Clara River", river: "Santa Clara", fullName: "Santa Clara R near Piru", lat: 34.4036, lng: -118.7392 },
] as const;

// Weather cities for conditions strip
export const WEATHER_CITIES = [
  { name: "SF", fullName: "San Francisco", lat: 37.77, lng: -122.42 },
  { name: "Sac", fullName: "Sacramento", lat: 38.58, lng: -121.49 },
  { name: "LA", fullName: "Los Angeles", lat: 34.05, lng: -118.24 },
  { name: "Eureka", fullName: "Eureka", lat: 40.80, lng: -124.16 },
] as const;

// Major California reservoirs (CDEC station IDs)
// Capacity in acre-feet from DWR
export const RESERVOIRS = [
  { id: "SHA", name: "Shasta Lake", capacity: 4552000, lat: 40.72, lng: -122.42 },
  { id: "ORO", name: "Lake Oroville", capacity: 3537577, lat: 39.54, lng: -121.48 },
  { id: "CLE", name: "Trinity Lake", capacity: 2447650, lat: 40.80, lng: -122.76 },
  { id: "NML", name: "New Melones", capacity: 2400000, lat: 37.95, lng: -120.53 },
  { id: "SNL", name: "San Luis", capacity: 2041000, lat: 37.06, lng: -121.07 },
  { id: "FOL", name: "Folsom Lake", capacity: 977000, lat: 38.71, lng: -121.16 },
  { id: "MIL", name: "Millerton Lake", capacity: 520500, lat: 37.00, lng: -119.70 },
] as const;

// iNaturalist taxon IDs
export const TAXON_IDS = {
  bees: 630955,      // Apoidea
  plants: 47126,     // Plantae
  butterflies: 47224, // Lepidoptera
  insects: 47158,    // Insecta
} as const;

// California place ID for iNaturalist
export const INAT_CALIFORNIA_PLACE_ID = 14;
