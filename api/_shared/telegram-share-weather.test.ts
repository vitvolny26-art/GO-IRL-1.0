import { describe, expect, it, vi } from "vitest";
import { loadTelegramShareWeather, shouldLoadTelegramShareWeather } from "./telegram-share-weather";

describe("Telegram Share weather", () => {
  it("loads forecast for an outdoor event in a supported city", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      hourly: {
        time: ["2026-07-20T16:00", "2026-07-20T17:00"],
        temperature_2m: [18.4, 17.8],
        precipitation_probability: [42, 55],
        wind_speed_10m: [11.2, 13.7],
        weather_code: [61, 63],
      },
    }), { status: 200 }));

    const result = await loadTelegramShareWeather({
      eventDate: "2026-07-20",
      time: "16:30",
      cityId: "olomouc",
      activity: "Прогулка",
      now: new Date("2026-07-19T10:00:00Z"),
      fetchImpl,
    });

    expect(result).toEqual({ icon: "🌧️", temperature: 18, rain: 42, wind: 11 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const url = new URL(String(fetchImpl.mock.calls[0]?.[0]));
    expect(url.hostname).toBe("api.open-meteo.com");
    expect(url.searchParams.get("timezone")).toBe("Europe/Prague");
  });

  it("uses explicit environment before category defaults", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));

    expect(shouldLoadTelegramShareWeather({ activity: "Бег", environment: "indoor" })).toBe(false);
    expect(shouldLoadTelegramShareWeather({ activity: "Волейбол", environment: "outdoor" })).toBe(true);

    const result = await loadTelegramShareWeather({
      eventDate: "2026-07-20",
      time: "16:30",
      cityId: "olomouc",
      activity: "Бег",
      environment: "indoor",
      now: new Date("2026-07-19T10:00:00Z"),
      fetchImpl,
    });

    expect(result).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns no weather when the provider fails", async () => {
    const result = await loadTelegramShareWeather({
      eventDate: "2026-07-20",
      time: "16:30",
      cityId: "olomouc",
      activity: "Park walk",
      now: new Date("2026-07-19T10:00:00Z"),
      fetchImpl: vi.fn(async () => { throw new Error("offline"); }),
    });

    expect(result).toBeNull();
  });

  it("skips unsupported cities and dates outside the forecast window", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));

    expect(await loadTelegramShareWeather({
      eventDate: "2026-07-20",
      time: "16:30",
      cityId: "brno",
      activity: "Park walk",
      now: new Date("2026-07-19T10:00:00Z"),
      fetchImpl,
    })).toBeNull();

    expect(await loadTelegramShareWeather({
      eventDate: "2026-08-20",
      time: "16:30",
      cityId: "olomouc",
      activity: "Park walk",
      now: new Date("2026-07-19T10:00:00Z"),
      fetchImpl,
    })).toBeNull();

    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
