import { describe, expect, it } from "vitest";
import { weatherIconFromCode } from "./weather";

describe("weatherIconFromCode", () => {
  it("maps Open-Meteo conditions to stable icons", () => {
    expect(weatherIconFromCode(0)).toBe("☀️");
    expect(weatherIconFromCode(2)).toBe("⛅");
    expect(weatherIconFromCode(48)).toBe("🌫️");
    expect(weatherIconFromCode(63)).toBe("🌧️");
    expect(weatherIconFromCode(75)).toBe("❄️");
    expect(weatherIconFromCode(95)).toBe("⛈️");
    expect(weatherIconFromCode(999)).toBe("🌤️");
  });
});
