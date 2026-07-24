import { describe, expect, it } from "vitest";
import {
  buildEventMapEmbedUrl,
  buildEventMapProviderUrl,
  loadPreferredEventMapProvider,
  savePreferredEventMapProvider,
} from "./eventMapProviders";
import type { Activity } from "./types";

const activity = {
  id: "event-1",
  categoryId: "sport",
  activity: { ru: "Волейбол", uk: "Волейбол", cs: "Volejbal", en: "Volleyball" },
  title: { ru: "Игра", uk: "Гра", cs: "Hra", en: "Game" },
  description: { ru: "Описание", uk: "Опис", cs: "Popis", en: "Description" },
  date: "2026-07-30",
  time: "18:00",
  cityId: "olomouc",
  address: "Smetanovy sady",
  locationUrl: "https://www.openstreetmap.org/?mlat=49.593800&mlon=17.250900#map=16/49.593800/17.250900",
  price: 0,
  capacity: 8,
  participants: 2,
  members: [],
  organizer: "GO IRL",
  organizerKey: "telegram:1",
  visibility: "public",
} satisfies Activity;

describe("event map providers", () => {
  it("builds exact Mapy.com, Google Maps, and Apple Maps targets", () => {
    expect(buildEventMapProviderUrl(activity, "Olomouc", "mapy"))
      .toBe("https://mapy.com/fnc/v1/showmap?mapset=basic&center=17.250900,49.593800&zoom=17&marker=true");
    expect(decodeURIComponent(buildEventMapProviderUrl(activity, "Olomouc", "google")))
      .toContain("query=49.5938,17.2509");
    const apple = new URL(buildEventMapProviderUrl(activity, "Olomouc", "apple"));
    expect(apple.hostname).toBe("maps.apple.com");
    expect(apple.searchParams.get("ll")).toBe("49.5938,17.2509");
  });

  it("builds a no-key OpenStreetMap preview around the exact point", () => {
    const embed = new URL(buildEventMapEmbedUrl(activity) || "");
    expect(embed.hostname).toBe("www.openstreetmap.org");
    expect(embed.searchParams.get("marker")).toBe("49.5938,17.2509");
    expect(embed.searchParams.get("bbox")).toBeTruthy();
  });

  it("persists the selected provider and rejects unknown values", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) || null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    savePreferredEventMapProvider("apple", storage);
    expect(loadPreferredEventMapProvider(storage)).toBe("apple");
    values.set("go-irl-event-map-provider-v1", "unknown");
    expect(loadPreferredEventMapProvider(storage)).toBe("mapy");
  });
});
