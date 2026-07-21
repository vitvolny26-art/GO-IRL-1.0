import { describe, expect, it } from "vitest";
import type { TelegramEventCardInput } from "./telegram-event-card.js";
import { buildMetaEventCalendar } from "./meta-event-calendar.js";

const card: TelegramEventCardInput = {
  eventId: "123e4567-e89b-42d3-a456-426614174000",
  title: "Волейбол, финал",
  activity: "Волейбол",
  date: "21 июл",
  eventDate: "2026-07-21",
  time: "23:30",
  address: "ZŠ Demlova; Olomouc",
  participants: 2,
  capacity: 12,
  icon: "🏐",
  inviteUrl: "https://t.me/GOirl_bot",
  city: "Оломоуц",
  durationMinutes: 120,
  price: 0,
  level: "Любитель",
  format: "Любительский",
  environment: "В помещении",
  language: "ru",
};

describe("Meta event calendar", () => {
  it("builds a portable event from the trusted card facts", () => {
    const result = buildMetaEventCalendar(
      card,
      "https://preview.example",
      new Date("2026-07-20T10:11:12Z"),
    );

    expect(result).toContain("DTSTAMP:20260720T101112Z");
    expect(result).toContain("DTSTART;TZID=Europe/Prague:20260721T233000");
    expect(result).toContain("DTEND;TZID=Europe/Prague:20260722T013000");
    expect(result).toContain("SUMMARY:Волейбол\\, финал");
    expect(result).toContain("LOCATION:ZŠ Demlova\\; Olomouc");
    expect(result).toContain("https://preview.example/api/meta/event-preview?event=123e4567-e89b-42d3-a456-426614174000&language=ru");
    expect(result.endsWith("\r\n")).toBe(true);
  });

  it("clamps unsafe durations", () => {
    const result = buildMetaEventCalendar({ ...card, durationMinutes: 9999 }, "https://goirl.example");
    expect(result).toContain("DTEND;TZID=Europe/Prague:20260722T073000");
  });
});
