import { describe, expect, it } from "vitest";
import { applyDiscoverFilters, genericRecommendationEngine, plannedRecommendationEngines, searchActivities, simpleRecommendationEngine } from "./recommendations";
import type { Activity } from "./types";

const makeActivity = (overrides: Partial<Activity>): Activity => ({
  id: "event-1",
  categoryId: "activities",
  activity: { ru: "☕ Кофе", uk: "☕ Кава", cs: "☕ Káva", en: "☕ Coffee" },
  title: { ru: "Кофе в центре", uk: "Кава в центрі", cs: "Káva v centru", en: "Coffee downtown" },
  description: { ru: "Для новичков", uk: "Для новачків", cs: "Pro začátečníky", en: "For beginners" },
  date: "2026-07-05",
  time: "18:00",
  cityId: "olomouc",
  address: "Horní náměstí",
  price: 0,
  capacity: 6,
  participants: 2,
  members: [],
  organizer: "Vit",
  organizerKey: "owner",
  visibility: "public",
  ...overrides,
});

describe("SimpleRecommendationEngine", () => {
  it("keeps a stable generic engine contract for future vertical and AI engines", () => {
    expect(genericRecommendationEngine.id).toBe("generic");
    expect(plannedRecommendationEngines).toEqual(expect.arrayContaining(["friends", "dating", "ai"]));
  });

  it("prioritizes user city, interests, date, and free spots", () => {
    const cityInterest = makeActivity({ id: "match", cityId: "olomouc", date: "2026-07-05", participants: 1 });
    const otherCity = makeActivity({ id: "other-city", cityId: "praha", date: "2026-07-05", participants: 1 });
    const fullEvent = makeActivity({ id: "full", cityId: "olomouc", date: "2026-07-05", participants: 6 });

    const result = simpleRecommendationEngine.recommend([otherCity, fullEvent, cityInterest], {
      cityId: "olomouc",
      favoriteActivities: ["Кофе"],
      language: "ru",
      now: new Date("2026-07-04T10:00:00"),
    });

    expect(result.map((activity) => activity.id)).toEqual(["match", "full", "other-city"]);
  });
});

describe("discover filters", () => {
  it("filters instantly by price, visibility, and activity type", () => {
    const freeSkating = makeActivity({
      id: "skating",
      activity: { ru: "🛼 Ролики", uk: "🛼 Ролики", cs: "🛼 Inline bruslení", en: "🛼 Inline skating" },
      price: 0,
      visibility: "public",
    });
    const paidPrivate = makeActivity({ id: "private", price: 300, visibility: "private" });

    const result = applyDiscoverFilters([freeSkating, paidPrivate], ["free", "public-only", "skating"], "ru", new Date("2026-07-04T10:00:00"));

    expect(result).toEqual([freeSkating]);
  });

  it("searches by city and organizer", () => {
    const prague = makeActivity({ id: "praha", cityId: "praha", organizer: "Andrej" });

    expect(searchActivities([prague], "Прага", "ru")).toEqual([prague]);
    expect(searchActivities([prague], "Andrej", "ru")).toEqual([prague]);
  });
});
