import { describe, expect, it } from "vitest";
import {
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

  it("resolves registered kinds from the runtime registry", () => {
    expect(getNotificationRegistryEntry("communication.message")).toMatchObject({
      category: "communication",
      serviceCritical: false,
    });
  });
});