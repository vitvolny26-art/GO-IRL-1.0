import { describe, expect, it } from "vitest";
import {
  buildNotificationDeduplicationKey,
  canDisableNotification,
  getNotificationRegistryEntry,
  notificationRegistry,
} from "./contracts";

describe("notification data model contracts", () => {
  it("registers every kind exactly once", () => {
    const kinds = notificationRegistry.map((entry) => entry.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
    expect(kinds).toContain("participation.event_cancelled");
    expect(kinds).toContain("communication.mention");
    expect(kinds).toContain("weather.thunderstorm");
  });

  it("keeps service-critical notifications enabled", () => {
    expect(canDisableNotification("participation.event_cancelled")).toBe(false);
    expect(canDisableNotification("organizer.new_request")).toBe(false);
    expect(canDisableNotification("communication.message")).toBe(true);
  });

  it("assigns in-app delivery to every registry entry", () => {
    expect(notificationRegistry.every((entry) => entry.defaultChannels.includes("in_app"))).toBe(true);
  });

  it("builds stable recipient and occurrence scoped deduplication keys", () => {
    expect(buildNotificationDeduplicationKey(
      "telegram:42",
      "participation.event_time_changed",
      { type: "activity", id: "event 1" },
      "2026-07-26T18:00:00Z",
    )).toBe(
      "telegram%3A42:participation.event_time_changed:activity:event%201:2026-07-26T18%3A00%3A00Z",
    );
  });

  it("fails closed for unknown runtime registry values", () => {
    expect(() => getNotificationRegistryEntry("unknown" as never)).toThrow("unknown_notification_kind:unknown");
  });
});
