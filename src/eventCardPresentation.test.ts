import { describe, expect, it } from "vitest";
import { eventDurationLabel, sportLevelFormatLabel } from "./eventCardPresentation";

describe("event card presentation", () => {
  it("shows duration only when it exists", () => {
    expect(eventDurationLabel(undefined, "мин")).toBeNull();
    expect(eventDurationLabel(90, "мин")).toBe("90 мин");
  });

  it("does not repeat equivalent casual level and format meanings", () => {
    expect(sportLevelFormatLabel("intermediate", "casual", "ru")).toBe("Любитель");
    expect(sportLevelFormatLabel("intermediate", "casual", "en")).toBe("Casual");
    expect(sportLevelFormatLabel("beginner", "training", "ru")).toBe("Новичок · Тренировка");
  });
});
