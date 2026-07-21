import { describe, expect, it } from "vitest";
import { buildGoogleCalendarUrl, getCalendarDateRange } from "./googleCalendar";
import type { Activity } from "../types";

const activity: Activity = {
  id: "calendar-1",
  type: "sport",
  categoryId: "sport",
  activity: {
    ru: "🏐 Волейбол",
    uk: "🏐 Волейбол",
    cs: "🏐 Volejbal",
    en: "🏐 Volleyball",
  },
  title: {
    ru: "Волейбол после работы",
    uk: "Волейбол після роботи",
    cs: "Volejbal po práci",
    en: "Volleyball after work",
  },
  description: {
    ru: "Играем спокойно, можно новичкам.",
    uk: "Граємо спокійно, можна новачкам.",
    cs: "Hrajeme v klidu, začátečníci vítáni.",
    en: "Casual game, beginners welcome.",
  },
  date: "2026-07-10",
  time: "18:00",
  cityId: "praha",
  address: "парк Летна",
  locationUrl: "https://example.com/place",
  participantNote: "Возьмите воду",
  price: 0,
  capacity: 8,
  participants: 2,
  members: [],
  organizer: "Vit",
  organizerKey: "guest:test",
  visibility: "public",
};

const queryParams = (url: string) => new URL(url).searchParams;

describe("Google Calendar helper", () => {
  it("builds the same local-time calendar template shape used by Telegram sharing", () => {
    const url = buildGoogleCalendarUrl(activity, {
      language: "ru",
      eventUrl: "https://t.me/GOirl_bot?startapp=calendar-1",
    });
    const params = queryParams(url);

    expect(url.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);
    expect(params.get("action")).toBe("TEMPLATE");
    expect(params.get("text")).toBe("Волейбол после работы");
    expect(params.get("dates")).toBe("20260710T180000/20260710T193000");
    expect(params.get("ctz")).toBe("Europe/Prague");
  });

  it("encodes title and location through URLSearchParams", () => {
    const params = queryParams(buildGoogleCalendarUrl(activity, { language: "ru" }));

    expect(params.get("text")).toBe("Волейбол после работы");
    expect(params.get("location")).toBe("парк Летна, Прага");
  });

  it("uses the default 90 minute duration when no vertical duration exists", () => {
    const { start, end } = getCalendarDateRange(activity);

    expect((end.getTime() - start.getTime()) / 60000).toBe(90);
  });

  it("uses sport duration when provided", () => {
    const withDuration: Activity = {
      ...activity,
      metadata: { sport: { durationMinutes: 45 } },
    };
    const { start, end } = getCalendarDateRange(withDuration);

    expect((end.getTime() - start.getTime()) / 60000).toBe(45);
  });

  it("puts the event link into calendar details", () => {
    const params = queryParams(buildGoogleCalendarUrl(activity, {
      language: "en",
      eventUrl: "https://t.me/GOirl_bot?startapp=calendar-1",
    }));

    expect(params.get("details")).toContain("https://t.me/GOirl_bot?startapp=calendar-1");
    expect(params.get("details")).toContain("GO IRL");
  });
});
