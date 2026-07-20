import { resolveEventArtworkCode } from "./event-artwork.js";
import type { TelegramEventCardInput } from "./telegram-event-card.js";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type ShareWeather = NonNullable<TelegramEventCardInput["weather"]>;

type OpenMeteoResponse = {
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    wind_speed_10m?: number[];
    weather_code?: number[];
  };
};

const cityCoordinates: Readonly<Record<string, { latitude: number; longitude: number }>> = {
  olomouc: { latitude: 49.5938, longitude: 17.2509 },
  praha: { latitude: 50.0755, longitude: 14.4378 },
};

const outdoorArtworkCodes = new Set(["RN", "CY", "SK", "HK", "WK", "PC", "CP", "FI", "KY", "CT", "PH"]);
const outdoorValues = new Set(["outdoor", "outdoors", "outside", "venku", "na ulici", "на улице", "надворі"]);
const indoorValues = new Set(["indoor", "inside", "uvnitr", "uvnitř", "v mistnosti", "v místnosti", "в помещении", "у приміщенні"]);

const normalize = (value: unknown) => String(value ?? "")
  .trim()
  .toLocaleLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "");

const weatherIcon = (code: number) => {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌤️";
};

const pragueDate = (value: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

const dayOffset = (eventDate: string, now: Date) => {
  const eventMs = Date.parse(`${eventDate}T12:00:00Z`);
  const todayMs = Date.parse(`${pragueDate(now)}T12:00:00Z`);
  if (!Number.isFinite(eventMs) || !Number.isFinite(todayMs)) return Number.NaN;
  return Math.round((eventMs - todayMs) / 86_400_000);
};

const comparableTime = (value: string) => {
  const normalized = value.length === 16 ? `${value}:00Z` : `${value}Z`;
  return Date.parse(normalized);
};

export const shouldLoadTelegramShareWeather = (input: {
  activity: string;
  environment?: unknown;
}) => {
  const environment = normalize(input.environment);
  if (indoorValues.has(environment)) return false;
  if (outdoorValues.has(environment)) return true;
  return outdoorArtworkCodes.has(resolveEventArtworkCode({ activity: input.activity, title: input.activity }));
};

export async function loadTelegramShareWeather(input: {
  eventDate: string;
  time: string;
  cityId: string;
  activity: string;
  environment?: unknown;
  now?: Date;
  fetchImpl?: FetchLike;
}): Promise<ShareWeather | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.eventDate) || !/^\d{2}:\d{2}$/.test(input.time)) return null;
  if (!shouldLoadTelegramShareWeather(input)) return null;

  const coordinates = cityCoordinates[input.cityId];
  if (!coordinates) return null;

  const offset = dayOffset(input.eventDate, input.now || new Date());
  if (!Number.isFinite(offset) || offset < 0 || offset > 7) return null;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(coordinates.latitude));
  url.searchParams.set("longitude", String(coordinates.longitude));
  url.searchParams.set("hourly", "temperature_2m,precipitation_probability,wind_speed_10m,weather_code");
  url.searchParams.set("timezone", "Europe/Prague");
  url.searchParams.set("forecast_days", "8");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3_000);

  try {
    const response = await (input.fetchImpl || fetch)(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const data = await response.json() as OpenMeteoResponse;
    const times = data.hourly?.time || [];
    if (!times.length) return null;

    const target = `${input.eventDate}T${input.time}`;
    const targetMs = comparableTime(target);
    let index = times.indexOf(target);

    if (index < 0 && Number.isFinite(targetMs)) {
      index = times.reduce((best, current, currentIndex) => {
        const currentMs = comparableTime(current);
        const bestMs = comparableTime(times[best] || "");
        if (!Number.isFinite(currentMs)) return best;
        if (!Number.isFinite(bestMs)) return currentIndex;
        return Math.abs(currentMs - targetMs) < Math.abs(bestMs - targetMs) ? currentIndex : best;
      }, 0);
    }

    if (index < 0) return null;

    const temperature = Math.round(data.hourly?.temperature_2m?.[index] ?? Number.NaN);
    const rain = Math.round(data.hourly?.precipitation_probability?.[index] ?? 0);
    const wind = Math.round(data.hourly?.wind_speed_10m?.[index] ?? 0);
    const code = Number(data.hourly?.weather_code?.[index] ?? 0);

    if (!Number.isFinite(temperature)) return null;

    return {
      icon: weatherIcon(code),
      temperature,
      rain: Number.isFinite(rain) ? rain : 0,
      wind: Number.isFinite(wind) ? wind : 0,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
