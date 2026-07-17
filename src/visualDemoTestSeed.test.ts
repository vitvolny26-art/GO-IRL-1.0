import { describe, expect, it } from "vitest";
import { activityOptions } from "./data";
import { buildVisualDemoTestActivities } from "./visualDemoTestSeed";

describe("visual demo 40-event seed", () => {
  const activities = buildVisualDemoTestActivities();

  it("creates every taxonomy variant exactly once", () => {
    const expectedNames = Object.values(activityOptions)
      .flat()
      .map((option) => option.name.en);

    expect(activities).toHaveLength(40);
    expect(activities.map((activity) => activity.title.en)).toEqual(expectedNames);
    expect(new Set(activities.map((activity) => activity.id)).size).toBe(40);
  });

  it("places all events on August 1, 2026 in Olomouc", () => {
    expect(activities.every((activity) => activity.date === "2026-08-01")).toBe(true);
    expect(activities.every((activity) => activity.cityId === "olomouc")).toBe(true);
  });

  it("covers all six event categories", () => {
    const counts = activities.reduce<Record<string, number>>((result, activity) => {
      result[activity.categoryId] = (result[activity.categoryId] ?? 0) + 1;
      return result;
    }, {});

    expect(counts).toEqual({
      sport: 10,
      activities: 7,
      party: 6,
      nature: 7,
      social: 5,
      creativity: 5,
    });
  });
});
