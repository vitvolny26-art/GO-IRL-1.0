import { describe, expect, it } from "vitest";
import { buildDurationOptions, formatDurationOption } from "./durationOptions";

describe("duration options", () => {
  it("uses 15-minute steps through 120 and 30-minute steps through 480", () => {
    expect(buildDurationOptions()).toEqual([
      15, 30, 45, 60, 75, 90, 105, 120,
      150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480,
    ]);
  });

  it("preserves a non-canonical existing duration for editing", () => {
    expect(buildDurationOptions(95)).toContain(95);
  });

  it("formats localized hour and minute labels", () => {
    expect(formatDurationOption(90, "ru")).toBe("1 ч 30 мин");
    expect(formatDurationOption(90, "uk")).toBe("1 год 30 хв");
    expect(formatDurationOption(90, "cs")).toBe("1 h 30 min");
    expect(formatDurationOption(45, "en")).toBe("45 min");
  });
});
