import type { TelegramEventCardInput } from "./telegram-event-card.js";

type ShareWeather = NonNullable<TelegramEventCardInput["weather"]>;
type FetchLike = typeof fetch;

type OpenMeteoResponse = {
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    wind_speed_10m?: number[];
    weather_code?: number[];
  };
};

const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  olomouc: { latitude: 49.5938, longitude: 17.2509 },
  praha: { latitude: 50.0755, longitude: 14.4378 },
};

const codeIcon = (code: number) => {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌤️";
};

export async function loadShareWeather(input: {
  date: string;
  time: string;
  cityId: string;
  enabled: boolean;
}, fetchImpl: FetchLike = fetch): Promise<ShareWeather | undefined> {
  if (!input.enabled) return undefined;
  const coordinates = cityCoordinates[input.cityId];
  if (!coordinates || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_500);

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(coordinates.latitude));
    url.searchParams.set("longitude", String(coordinates.longitude));
    url.searchParams.set("hourly", "temperature_2m,precipitation_probability,wind_speed_10m,weather_code");
    url.searchParams.set("timezone", "Europe/Prague");
    url.searchParams.set("start_date", input.date);
    url.searchParams.set("end_date", input.date);

    const response = await fetchImpl(url, { signal: controller.signal });
    if (!response.ok) return undefined;

    const data = await response.json() as OpenMeteoResponse;
    const times = data.hourly?.time || [];
    if (!times.length) return undefined;

    const normalizedTime = /^\d{2}:\d{2}/.test(input.time) ? input.time.slice(0, 5) : "12:00";
    const targetMs = new Date(`${input.date}T${normalizedTime}:00`).getTime();
    const nearest = times.reduce((bestIndex, value, index) => {
      const bestDiff = Math.abs(new Date(times[bestIndex]).getTime() - targetMs);
      const currentDiff = Math.abs(new Date(value).getTime() - targetMs);
      return currentDiff < bestDiff ? index : bestIndex;
    }, 0);

    const temperature = Math.round(data.hourly?.temperature_2m?.[nearest] ?? Number.NaN);
    if (Number.isNaN(temperature)) return undefined;

    return {
      icon: codeIcon(Number(data.hourly?.weather_code?.[nearest] || 0)),
      temperature,
      rain: Math.round(data.hourly?.precipitation_probability?.[nearest] || 0),
      wind: Math.round(data.hourly?.wind_speed_10m?.[nearest] || 0),
    };
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}
