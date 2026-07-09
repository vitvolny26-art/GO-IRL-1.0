import { describe, expect, it } from "vitest";
import { formatEventDateTime, formatEventTime, hasEventTime } from "./eventTime";

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

  it("formats timezone datetime values without shifting the displayed event time", () => {
    expect(formatEventTime("2026-07-12T18:30:00Z")).toBe("18:30");
    expect(formatEventTime("2026-07-12T18:30:00+02:00")).toBe("18:30");
  });

  it("returns empty string for invalid or missing time", () => {
    expect(formatEventTime("")).toBe("");
    expect(formatEventTime(null)).toBe("");
    expect(formatEventTime("bad value")).toBe("");
    expect(formatEventTime("25:00")).toBe("");
    expect(formatEventTime("12:99")).toBe("");
  });
});

describe("hasEventTime", () => {
  it("detects valid event time", () => {
    expect(hasEventTime("18:00")).toBe(true);
    expect(hasEventTime("bad value")).toBe(false);
  });
});

describe("formatEventDateTime", () => {
  it("joins date and time only when valid time exists", () => {
    expect(formatEventDateTime("Сегодня", "18:00")).toBe("Сегодня · 18:00");
    expect(formatEventDateTime("Сегодня", "")).toBe("Сегодня");
  });
});
