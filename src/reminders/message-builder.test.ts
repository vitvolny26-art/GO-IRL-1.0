import { describe, expect, it } from "vitest";
import {
  buildReminderMessage,
  isSafeReminderActionUrl,
  validateReminderMessage,
} from "./message-builder";
import type { ReminderDelivery } from "./types";

const delivery: ReminderDelivery = {
  reminderId: "00000000-0000-4000-8000-000000000211",
  deliveryKey: "reminder:telegram:1:event:1",
  provider: "telegram",
  recipientId: "990000011",
  leadMinutes: 60,
  language: "ru",
  attemptCount: 1,
  event: {
    eventId: "00000000-0000-4000-8000-000000000212",
    title: "Волейбол",
    dateTime: "23 июл. · 18:00",
    location: "ZŠ Demlova, Olomouc",
    openUrl: "https://go-irl-1-0.vercel.app/api/meta/event-preview?event=x",
    calendarUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Olomouc",
  },
};

describe("reminder message builder", () => {
  it("builds localized content and all available actions", () => {
    const message = buildReminderMessage(delivery);
    expect(message.heading).toBe("Событие начнётся через 1 ч");
    expect(message.body).toContain("Волейбол");
    expect(message.actions.map((action) => action.kind)).toEqual(["open", "calendar", "map"]);
    expect(validateReminderMessage(message)).toBe(true);
  });

  it("uses the tomorrow copy for a one-day reminder", () => {
    expect(buildReminderMessage({ ...delivery, language: "en", leadMinutes: 1440 }).heading)
      .toBe("Your event is tomorrow");
  });

  it("rejects non-HTTPS and malformed action URLs", () => {
    expect(isSafeReminderActionUrl("https://goirl.app/event")).toBe(true);
    expect(isSafeReminderActionUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeReminderActionUrl("not-a-url")).toBe(false);
    expect(validateReminderMessage({
      ...buildReminderMessage(delivery),
      actions: [{ kind: "open", label: "Open", url: "http://example.com" }],
    })).toBe(false);
  });
});
