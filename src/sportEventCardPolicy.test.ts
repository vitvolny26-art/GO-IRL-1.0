import { describe, expect, it } from "vitest";
import type { NewActivity } from "./types";
import { applySportFormSelection } from "./sportEventCardPolicy";

const activity: NewActivity = {
  type: "sport",
  categoryId: "sport",
  activityText: "Volleyball",
  titleText: "Evening volleyball",
  descriptionText: "Casual game",
  date: "2026-08-01",
  time: "18:00",
  cityId: "olomouc",
  address: "Olomouc",
  price: 0,
  capacity: 10,
  visibility: "public",
  metadata: {
    sport: {
      sportType: "Volleyball",
      level: "intermediate",
      format: "casual",
      environment: "outdoor",
      durationMinutes: 90,
    },
  },
};

describe("sport event card policy", () => {
  it("removes optional level and format when the organizer leaves them empty", () => {
    const result = applySportFormSelection(activity, { environment: "indoor" });
    expect(result.metadata?.sport?.level).toBeUndefined();
    expect(result.metadata?.sport?.format).toBeUndefined();
    expect(result.metadata?.sport?.environment).toBe("indoor");
    expect(result.metadata?.sport?.durationMinutes).toBe(90);
  });

  it("preserves explicitly selected optional metadata", () => {
    const result = applySportFormSelection(activity, {
      level: "advanced",
      format: "competition",
      environment: "outdoor",
    });
    expect(result.metadata?.sport).toMatchObject({
      level: "advanced",
      format: "competition",
      environment: "outdoor",
    });
  });

  it("does not modify non-sport activities", () => {
    const generic = { ...activity, type: "custom" as const, categoryId: "social" };
    expect(applySportFormSelection(generic, {})).toEqual(generic);
  });
});
