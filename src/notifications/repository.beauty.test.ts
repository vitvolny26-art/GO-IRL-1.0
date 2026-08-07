import { describe, expect, it } from "vitest";
import { buildEventNotificationOpenUrl } from "./repository";

describe("event notification open URLs", () => {
  it("uses the canonical services path for Beauty bookings", () => {
    expect(buildEventNotificationOpenUrl(
      "https://goirl.example/",
      { subjectType: "beauty_booking", bookingId: "booking-1", openPath: "/services" },
      null,
    )).toBe("https://goirl.example/services");
  });

  it("keeps the existing activity join fallback", () => {
    expect(buildEventNotificationOpenUrl(
      "https://goirl.example",
      { eventId: "event 1" },
      null,
    )).toBe("https://goirl.example/join/event%201");
  });
});
