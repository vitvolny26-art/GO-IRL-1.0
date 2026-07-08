import { describe, expect, it } from "vitest";
import { cities, defaultCityId, getCity } from "./cities";
import { languageOptions } from "../i18n";

describe("cities configuration", () => {
  it("keeps the default city available", () => {
    expect(cities.some((city) => city.id === defaultCityId)).toBe(true);
  });

  it("returns the requested city when it exists", () => {
    expect(getCity("olomouc").id).toBe("olomouc");
  });

  it("exposes Praha as a supported city without changing the default", () => {
    expect(defaultCityId).toBe("olomouc");
    expect(getCity("praha").name).toMatchObject({
      ru: "Прага",
      uk: "Прага",
      cs: "Praha",
      en: "Prague",
    });
  });

  it("falls back to the first configured city for unknown ids", () => {
    expect(getCity("unknown-city")).toEqual(cities[0]);
  });

  it("keeps every city localized for supported languages", () => {
    for (const city of cities) {
      for (const language of languageOptions) {
        expect(city.name[language.id]).toBeTruthy();
      }
      expect(city.timezone).toBeTruthy();
    }
  });
});
