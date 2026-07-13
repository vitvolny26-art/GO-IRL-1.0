import { describe, expect, it } from "vitest";
import { buildTelegramEventCard } from "./telegram-event-card";

const input = {
  eventId: "3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  title: "Волейбол <вечером>",
  activity: "Волейбол",
  date: "19 июл.",
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
  it("builds a native Telegram photo with event and map buttons", () => {
    const imageUrl = "https://go-irl-1-0.vercel.app/api/telegram/event-share-card?token=signed";
    const result = buildTelegramEventCard(input, imageUrl);

    expect(result.type).toBe("photo");
    expect(result.id).toBe(input.eventId);
    expect(result.photo_url).toBe(imageUrl);
    expect(result.caption).toContain("Волейбол &lt;вечером&gt;");
    expect(result.caption).toContain("ZŠ Demlova &amp; park");
    expect(result.caption).toContain("3 / 8");
    expect(result.caption).not.toContain(input.inviteUrl);
    expect(result.reply_markup.inline_keyboard[0][0]).toEqual({
      text: "Открыть событие",
      url: input.inviteUrl,
    });
    expect(result.reply_markup.inline_keyboard[0][1]).toEqual({ text: "Карта", url: input.mapUrl });
  });

  it("does not repeat the activity when it matches the title", () => {
    const result = buildTelegramEventCard({ ...input, title: "Волейбол" }, "https://example.com/card.jpg");
    expect(result.caption.match(/Волейбол/g)).toHaveLength(1);
  });
});
