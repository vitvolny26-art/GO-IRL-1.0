import { describe, expect, it } from "vitest";
import { buildEventNotificationText } from "./message-builder";
import type { EventNotificationDelivery } from "./types";

const delivery = (kind: EventNotificationDelivery["kind"]): EventNotificationDelivery => ({
  id: "notification-1",
  userKey: "user:1",
  activityId: "event-1",
  kind,
  payload: {
    eventId: "event-1",
    title: { ru: "Волейбол" },
    date: "2026-07-24",
    time: "18:30:00",
    address: "ZŠ Demlova",
    changedFields: ["time", "location"],
  },
  attemptCount: 1,
  provider: "telegram",
  recipientId: "123",
  language: "ru",
  openUrl: "https://go-irl-1-0.vercel.app/join/event-1",
});

describe("event notification messages", () => {
  it("renders a join confirmation with event details", () => {
    expect(buildEventNotificationText(delivery("join_confirmed"))).toContain("Вы участвуете");
    expect(buildEventNotificationText(delivery("join_confirmed"))).toContain("Волейбол");
  });

  it("lists changed event fields", () => {
    expect(buildEventNotificationText(delivery("event_changed"))).toContain("time, location");
  });
});

