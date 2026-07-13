import { describe, expect, it } from "vitest";
import { activityIconFromText, cleanEventDetailText } from "./eventVisualPolish";

describe("event visual polish", () => {
  it("uses the inline skating icon for roller events", () => {
    expect(activityIconFromText("Ролики Пападоця")).toBe("🛼");
    expect(activityIconFromText("Inline skating evening")).toBe("🛼");
  });

  it("prefers the most specific activity name", () => {
    expect(activityIconFromText("Настольный теннис после работы")).toBe("🏓");
  });

  it("removes emoji from detail title and activity label", () => {
    expect(cleanEventDetailText("🛼 Пападоця")).toBe("Пападоця");
    expect(cleanEventDetailText("АКТИВНОСТИ · 🛼 Ролики")).toBe("АКТИВНОСТИ · Ролики");
  });

  it("keeps ordinary detail text unchanged", () => {
    expect(cleanEventDetailText("АКТИВНОСТИ · Ролики")).toBe("АКТИВНОСТИ · Ролики");
  });
});
