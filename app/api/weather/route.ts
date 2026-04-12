import { NextResponse } from "next/server";
import { WEATHER_CITIES } from "@/lib/stations";
import type { CityWeather, WeatherResponse } from "@/lib/types";
import { cToF } from "@/lib/format";

export const revalidate = 1800;

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 49) return "Fog";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Showers";
  if (code <= 94) return "T-storm";
  return "Storm";
}

export async function GET() {
  try {
    const lats = WEATHER_CITIES.map((c) => c.lat).join(",");
    const lngs = WEATHER_CITIES.map((c) => c.lng).join(",");

    const params = new URLSearchParams({
      latitude: lats,
      longitude: lngs,
      current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
      daily: "sunrise,sunset,precipitation_sum",
      timezone: "America/Los_Angeles",
      temperature_unit: "celsius",
      past_days: "7",
      forecast_days: "1",
    });

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
    const raw = await res.json();

    const results = Array.isArray(raw) ? raw : [raw];

    const cities: CityWeather[] = results.map((r, i) => {
      // Sum past 7 days of precipitation (mm → inches)
      const dailyPrecip: number[] = r.daily?.precipitation_sum ?? [];
      // Past 7 days = all but the last entry (which is today/forecast)
      const past7 = dailyPrecip.slice(0, -1);
      const totalMm = past7.reduce((s: number, v: number) => s + (v ?? 0), 0);
      const totalIn = totalMm / 25.4;

      return {
        city: WEATHER_CITIES[i].name,
        temperature: cToF(r.current.temperature_2m),
        condition: weatherLabel(r.current.weather_code),
        windSpeed: r.current.wind_speed_10m,
        humidity: r.current.relative_humidity_2m,
        weeklyPrecipIn: Math.round(totalIn * 100) / 100,
      };
    });

    // SF sunrise/sunset for reference
    const sfResult = results[0];
    const sunriseArr = sfResult.daily?.sunrise ?? [];
    const sunsetArr = sfResult.daily?.sunset ?? [];

    const response: WeatherResponse = {
      cities,
      sunrise: sunriseArr[sunriseArr.length - 1] ?? "",
      sunset: sunsetArr[sunsetArr.length - 1] ?? "",
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
