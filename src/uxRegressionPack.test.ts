import { describe, expect, it } from "vitest";
import type { Activity } from "./types";
import {
  isIndoorDefaultSportLabel,
  resolveBrandCopy,
  resolveEffectiveSportEnvironment,
} from "./uxRegressionPack";

const sportActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: "test-sport",
  type: "sport",
  categoryId: "sport",
  activity: { ru: "🧘 Йога", uk: "🧘 Йога", cs: "🧘 Jóga", en: "🧘 Yoga" },
  title: { ru: "[ТЕСТ] Йога", uk: "[ТЕСТ] Йога", cs: "[TEST] Jóga", en: "[TEST] Yoga" },
  description: { ru: "", uk: "", cs: "", en: "" },
  date: "2026-08-01",
  time: "10:00",
  cityId: "olomouc",
  address: "Horní náměstí, Olomouc",
  locationUrl: "",
  participantNote: "",
  price: 0,
  capacity: 8,
  participants: 1,
  members: [],
  organizer: "GO IRL Demo",
  organizerKey: "demo:sport",
  visibility: "public",
  popular: false,
  metadata: {
    sport: {
      sportType: "Yoga",
      environment: "outdoor",
      durationMinutes: 90,
    },
  },
  ...overrides,
});

describe("ux regression pack", () => {
  it("provides language-specific hero copy", () => {
    expect(resolveBrandCopy("ru").tagline).toBe("Меньше скролла, больше жизни");
    expect(resolveBrandCopy("cs").tagline).toBe("Méně scrollování, více života");
  });

  it("recognizes indoor-by-default sports in supported languages", () => {
    expect(isIndoorDefaultSportLabel("🏋️ Тренажёрный зал")).toBe(true);
    expect(isIndoorDefaultSportLabel("Stolní tenis")).toBe(true);
    expect(isIndoorDefaultSportLabel("Football")).toBe(false);
  });

  it("corrects defaulted test activities without overriding real outdoor choices", () => {
    expect(resolveEffectiveSportEnvironment(sportActivity())).toBe("indoor");
    expect(resolveEffectiveSportEnvironment(sportActivity({
      organizer: "Real organizer",
      title: { ru: "Йога в парке", uk: "Йога в парку", cs: "Jóga v parku", en: "Yoga in the park" },
    }))).toBe("outdoor");
  });
});
