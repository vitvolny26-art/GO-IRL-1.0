import { describe, expect, it } from "vitest";
import { formatEventTime } from "./eventTime";

describe("formatEventTime", () => {
  it("formats standard time", () => {
    expect(formatEventTime("18:00")).toBe("18:00");
    expect(formatEventTime("8:05")).toBe("08:05");
  });

  it("formats database time with seconds", () => {
    expect(formatEventTime("18:00:00")).toBe("18:00");
  });

  it("formats iso-like datetime values", () => {
    expect(formatEventTime("2026-07-12T18:30:00")).toBe("18:30");
  });

  it("returns empty string for invalid or missing time", () => {
    expect(formatEventTime("")).toBe("");
    expect(formatEventTime(null)).toBe("");
    expect(formatEventTime("bad value")).toBe("");
    expect(formatEventTime("25:00")).toBe("");
    expect(formatEventTime("12:99")).toBe("");
  });
});
