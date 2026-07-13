import { describe, expect, it } from "vitest";
import { activityIconFromText } from "./activityIcon";

describe("activity icons", () => {
  it("uses the activity icon for inline skating instead of the category fallback", () => {
    expect(activityIconFromText("Ролики в парке", "🏆")).toBe("🛼");
    expect(activityIconFromText("Inline bruslení", "🏆")).toBe("🛼");
  });

  it("keeps common sport mappings", () => {
    expect(activityIconFromText("Волейбол", "🏆")).toBe("🏐");
  });
});
