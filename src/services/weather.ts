import { formatEventTime } from "../eventTime";

export type WeatherHour = {
  time: string;
  temperature: number;
  rain: number;
  wind: number;
};

export type WeatherResult = {
  text: string;
  temperature: number;
  rain: number;
  wind: number;
  hours: WeatherHour[];
};

const geoCache = new Map<string, Promise<{ lat: number; lon: number } | null>>();
const weatherCache = new Map<string, Promise<WeatherResult | null>>();

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

const toIsoHour = (date: string, time: string) => {
  const normalizedTime = formatEventTime(time) || "12:00";
  return `${date}T${normalizedTime}`;
};

const weatherHourFromData = (data: any, times: string[], index: number): WeatherHour | null => {
  const time = times[index];
  if (!time) return null;

  const temperature = Math.round(data.hourly.temperature_2m?.[index]);
  if (Number.isNaN(temperature)) return null;

  return {
    time,
    temperature,
    rain: Number(data.hourly.precipitation_probability?.[index] ?? 0),
    wind: Math.round(data.hourly.wind_speed_10m?.[index] ?? 0),
  };
};

const detailHoursAround = (data: any, times: string[], targetIndex: number) => {
  const start = Math.max(targetIndex - 2, 0);
  const end = Math.min(targetIndex + 2, times.length - 1);
  const hours: WeatherHour[] = [];

  for (let index = start; index <= end; index += 1) {
    const hour = weatherHourFromData(data, times, index);
    if (hour) hours.push(hour);
  }

  return hours;
};

const daysFromNow = (date: string) => {
  const target = new Date(`${date}T12:00:00`).getTime();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((target - today.getTime()) / 86400000);
};

async function geocode(address: string, city: string) {
  const query = [address, city, "Czech Republic"].filter(Boolean).join(", ");
  if (!geoCache.has(query)) {
    geoCache.set(query, fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
      headers: { "Accept": "application/json" },
    }).then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      const first = data?.[0];
      if (!first) return null;
      return { lat: Number(first.lat), lon: Number(first.lon) };
    }).catch(() => null));
  }
  return geoCache.get(query)!;
}

export async function getEventWeather(input: {
  date: string;
  time: string;
  address?: string;
  city: string;
}): Promise<WeatherResult | null> {
  const offset = daysFromNow(input.date);
  if (offset < 0 || offset > 7) return null;

  const cacheKey = `${input.date}|${input.time}|${input.address || ""}|${input.city}`;
  if (weatherCache.has(cacheKey)) return weatherCache.get(cacheKey)!;

  const promise = (async () => {
    const coords = await geocode(input.address || "", input.city);
    if (!coords) return null;

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(coords.lat));
    url.searchParams.set("longitude", String(coords.lon));
    url.searchParams.set("hourly", "temperature_2m,precipitation_probability,wind_speed_10m,weather_code");
    url.searchParams.set("timezone", "Europe/Prague");
    url.searchParams.set("forecast_days", "8");

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const times: string[] = data?.hourly?.time || [];
    if (!times.length) return null;

    const target = toIsoHour(input.date, input.time);
    let index = times.indexOf(target);

    if (index < 0) {
      const targetMs = new Date(target).getTime();
      index = times.reduce((best, value, current) => {
        const bestDiff = Math.abs(new Date(times[best]).getTime() - targetMs);
        const currentDiff = Math.abs(new Date(value).getTime() - targetMs);
        return currentDiff < bestDiff ? current : best;
      }, 0);
    }

    const temp = Math.round(data.hourly.temperature_2m?.[index]);
    const rain = data.hourly.precipitation_probability?.[index];
    const wind = Math.round(data.hourly.wind_speed_10m?.[index]);
    const code = Number(data.hourly.weather_code?.[index] || 0);

    if (Number.isNaN(temp)) return null;

    const hours = detailHoursAround(data, times, index);

    return {
      text: `${codeIcon(code)} ${temp}°C · ☔ ${rain ?? 0}% · 💨 ${wind || 0} km/h`,
      temperature: temp,
      rain: rain ?? 0,
      wind: wind || 0,
      hours,
    };
  })();

  weatherCache.set(cacheKey, promise);
  return promise;
}
