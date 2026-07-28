import { describe, expect, it } from "vitest";
import type { NewActivity } from "./types";
import { applySportFormSelection, setTextContentIfChanged } from "./sportEventCardPolicy";

const baseActivity: NewActivity = {
  type: "sport",
  categoryId: "sport",
  activityText: "Volleyball",
  titleText: "Evening volleyball",
  descriptionText: "Open game",
  date: "2026-08-01",
  time: "18:00",
  cityId: "olomouc",
  address: "Olomouc",
  price: 0,
  capacity: 10,
  visibility: "public",
  metadata: {
    sport: {
      level: "intermediate",
      format: "casual",
      environment: "outdoor",
      durationMinutes: 120,
    },
  },
};

describe("sport event card policy", () => {
  it("removes optional level and format when the organizer leaves them empty", () => {
    const activity = applySportFormSelection(baseActivity, { environment: "indoor" });

    expect(activity.metadata?.sport?.level).toBeUndefined();
    expect(activity.metadata?.sport?.format).toBeUndefined();
    expect(activity.metadata?.sport?.environment).toBe("indoor");
    expect(activity.metadata?.sport?.durationMinutes).toBe(120);
  });

  it("preserves explicitly selected optional metadata", () => {
    const activity = applySportFormSelection(baseActivity, {
      level: "advanced",
      format: "training",
      environment: "outdoor",
    });

    expect(activity.metadata?.sport).toMatchObject({
      level: "advanced",
      format: "training",
      environment: "outdoor",
      durationMinutes: 120,
    });
  });

  it("does not alter non-sport events", () => {
    const generic: NewActivity = { ...baseActivity, type: "custom", categoryId: "social" };
    expect(applySportFormSelection(generic, {})).toBe(generic);
  });

  it("does not rewrite unchanged form copy and retrigger the mutation observer", () => {
    const node = { textContent: "Optional" };

    expect(setTextContentIfChanged(node, "Optional")).toBe(false);
    expect(node.textContent).toBe("Optional");
    expect(setTextContentIfChanged(node, "Required")).toBe(true);
    expect(node.textContent).toBe("Required");
  });
});
