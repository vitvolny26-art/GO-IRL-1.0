import { describe, expect, it } from "vitest";
import { buildTelegramEventCard } from "./telegram-event-card";

const input = {
  eventId: "3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  title: "Волейбол <вечером>",
  activity: "Волейбол",
  date: "19 июл.",
  eventDate: "2026-07-19",
  time: "16:30",
  address: "ZŠ Demlova & park",
  participants: 3,
  capacity: 8,
  icon: "🏐",
  inviteUrl: "https://t.me/GOirl_bot?startapp=3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  mapUrl: "https://mapy.cz/zakladni?q=Z%C5%A0%20Demlova",
  city: "Оломоуц",
  durationMinutes: 90,
  price: 0,
  level: "Любитель",
  format: "Любительский",
  environment: "На улице",
  language: "ru" as const,
};

describe("buildTelegramEventCard", () => {
  it("builds a captionless photo with open-event and Prague calendar buttons", () => {
    const imageUrl = "https://go-irl-1-0.vercel.app/api/telegram/event-share-card?token=signed";
    const result = buildTelegramEventCard(input, imageUrl);

    expect(result.type).toBe("photo");
    expect(result.id).toBe(input.eventId);
    expect(result.photo_url).toBe(imageUrl);
    expect(result.caption).toBe("");
    expect(result.reply_markup.inline_keyboard[0][0]).toEqual({
      text: "Открыть событие",
      url: input.inviteUrl,
    });
    const calendarButton = result.reply_markup.inline_keyboard[0][1];
    expect(calendarButton?.text).toBe("В календарь");
    const calendarUrl = new URL(calendarButton?.url || "");
    expect(calendarUrl.origin + calendarUrl.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(calendarUrl.searchParams.get("ctz")).toBe("Europe/Prague");
    expect(calendarUrl.searchParams.get("dates")).toBe("20260719T163000/20260719T180000");
    expect(calendarUrl.searchParams.get("text")).toBe(input.title);
    expect(calendarUrl.searchParams.get("location")).toBe("ZŠ Demlova & park, Оломоуц");
    expect(calendarUrl.searchParams.get("details")).toContain(input.inviteUrl);
  });

  it("does not build a calendar action from the localized compact date", () => {
    const result = buildTelegramEventCard({ ...input, eventDate: "" }, "https://example.com/card.jpg");
    expect(result.caption).toBe("");
    expect(result.reply_markup.inline_keyboard[0]).toEqual([{
      text: "Открыть событие",
      url: input.inviteUrl,
    }]);
  });

  it("rolls the calendar end into the next Prague day", () => {
    const result = buildTelegramEventCard({
      ...input,
      eventDate: "2026-10-24",
      time: "23:30",
      durationMinutes: 90,
    }, "https://example.com/card.jpg");
    const calendarUrl = new URL(result.reply_markup.inline_keyboard[0][1]?.url || "");
    expect(calendarUrl.searchParams.get("dates")).toBe("20261024T233000/20261025T010000");
    expect(calendarUrl.searchParams.get("ctz")).toBe("Europe/Prague");
  });
});
