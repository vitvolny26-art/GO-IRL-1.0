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

const cityCoordinates: Readonly<Record<string, {