import { describe, expect, it, vi } from "vitest";
import { loadShareWeather } from "./share-weather";

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});

describe("share weather", () => {
  it("does not call the provider when weather is disabled", async () => {
    const fetchImpl = vi.fn();
    const result = await loadShareWeather({
      date: "2026-07-20",
      time: "18:30",
      cityId: "olomouc",
      enabled: false,
    }, fetchImpl as unknown as typeof fetch);

    expect(result).toBeUndefined();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("selects the nearest forecast hour", async () => {
    const fetchImpl = vi.fn(async () => response({
      hourly: {
        time: ["2026-07-20T17:00", "2026-07-20T18:00", "2026-07-20T19:00"],
        temperature_2m: [21.1, 19.4, 18.8],
        precipitation_probability: [10, 65, 80],
        wind_speed_10m: [4.2, 7.6, 9.1],
        weather_code: [1, 63, 65],
      },
    }));

    const result = await loadShareWeather({
      date: "2026-07-20",
      time: "18:20",
      cityId: "olomouc",
      enabled: true,
    }, fetchImpl as unknown as typeof fetch);

    expect(result).toEqual({ icon: "🌧️", temperature: 19, rain: 65, wind: 8 });
    expect(String(fetchImpl.mock.calls[0]?.[0])).toContain("start_date=2026-07-20");
  });

  it("degrades to no weather when the provider fails", async () => {
    const fetchImpl = vi.fn(async () => response({}, 503));
    const result = await loadShareWeather({
      date: "2026-07-20",
      time: "18:30",
      cityId: "olomouc",
      enabled: true,
    }, fetchImpl as unknown as typeof fetch);

    expect(result).toBeUndefined();
  });
});
