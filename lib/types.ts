// NOAA Tides
export interface TidePrediction {
  t: string; // "2026-04-10 03:42"
  v: string; // "1.743"
  type?: "H" | "L"; // only present with interval=hilo
}

export interface TideStationData {
  stationId: string;
  name: string;
  predictions: TidePrediction[];
  hiLo: TidePrediction[]; // high/low only
  waterTempC: number | null;
}

export interface TidesResponse {
  stations: TideStationData[];
  fetchedAt: string;
}

// USGS Rivers
export interface RiverReading {
  value: string;
  dateTime: string;
}

export interface RiverSiteData {
  siteId: string;
  name: string;
  river: string;
  discharge: RiverReading[]; // cfs over time
  currentFlow: number | null;
  waterTempC: number | null;
}

export interface RiversResponse {
  sites: RiverSiteData[];
  fetchedAt: string;
}

// eBird
export interface BirdSighting {
  speciesCode: string;
  comName: string;
  sciName: string;
  locName: string;
  obsDt: string;
  howMany: number | null;
  lat: number;
  lng: number;
  obsValid: boolean;
  obsReviewed: boolean;
}

export interface BirdsResponse {
  sightings: BirdSighting[];
  fetchedAt: string;
}

// eBird Migration Stats
export interface MigrationDayStat {
  date: string;
  numSpecies: number;
  numChecklists: number;
  numContributors: number;
}

export interface MigrationResponse {
  stats: MigrationDayStat[];
  today: MigrationDayStat | null;
  avg7d: number;
  fetchedAt: string;
  error?: string;
}

// Monarch Migration
export interface MonarchMonthCount {
  month: string; // "2025-05"
  label: string; // "May"
  count: number;
  observations: { lat: number; lng: number }[];
}

export interface MonarchResponse {
  monthlyCounts: MonarchMonthCount[];
  currentMonthCount: number;
  lastYearSameWeekCount: number;
  thisWeekCount: number;
  fetchedAt: string;
}

// Snowpack
export interface SnowpackZone {
  name: string; // "Northern Sierra", "Central Sierra", "Southern Sierra"
  avgSweInches: number;
  stationCount: number;
  lat: number; // zone centroid for map positioning
  lng: number;
}

export interface SnowpackResponse {
  zones: SnowpackZone[];
  statewideAvgSwe: number;
  fetchedAt: string;
}

// Cetaceans (iNaturalist)
export interface CetaceanSpecies {
  name: string;
  scientificName: string;
  count: number;
}

export interface CetaceanObservation {
  lat: number;
  lng: number;
  species: string;
}

export interface CetaceansResponse {
  totalObservations: number;
  species: CetaceanSpecies[];
  observations: CetaceanObservation[];
  fetchedAt: string;
}

// Reservoirs (CDEC)
export interface ReservoirData {
  id: string;
  name: string;
  storageCurrent: number; // acre-feet
  storageCapacity: number; // acre-feet
  percentFull: number;
  lat: number;
  lng: number;
}

export interface ReservoirsResponse {
  reservoirs: ReservoirData[];
  fetchedAt: string;
}

// River Precipitation (Open-Meteo per gauge site)
export interface RiverPrecipSite {
  siteId: string;
  dailyPrecipMm: number[]; // 7 days, oldest first
}

export interface RiverPrecipResponse {
  sites: RiverPrecipSite[];
  fetchedAt: string;
}

// Open-Meteo Weather
export interface CityWeather {
  city: string;
  temperature: number; // fahrenheit
  condition: string;
  windSpeed: number;
  humidity: number;
  weeklyPrecipIn: number; // total inches past 7 days
}

export interface WeatherResponse {
  cities: CityWeather[];
  sunrise: string;
  sunset: string;
  fetchedAt: string;
}

// iNaturalist Pollinators
export interface PollinatorObservation {
  id: number;
  taxonName: string;
  commonName: string;
  lat: number;
  lng: number;
  observedOn: string;
}

export interface SpeciesCount {
  name: string;
  scientificName: string;
  count: number;
}

export interface PollinatorSummary {
  beeCount: number;
  topBeeSpecies: SpeciesCount[];
  butterflyCount: number;
  topButterflySpecies: SpeciesCount[];
  plantCount: number;
  topPlantSpecies: SpeciesCount[];
  observations: PollinatorObservation[];
}

export interface PollinatorsResponse {
  summary: PollinatorSummary;
  fetchedAt: string;
}
