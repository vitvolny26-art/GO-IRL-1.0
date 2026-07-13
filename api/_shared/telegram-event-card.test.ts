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
  language: "ru" as const,
};

describe("buildTelegramEventCard", () => {
  it("builds a native Telegram article with a separate event button", () => {
    const result = buildTelegramEventCard(input);

    expect(result.type).toBe("article");
    expect(result.id).toBe(input.eventId);
    expect(result.input_message_content.message_text).toContain("Волейбол &lt;вечером&gt;");
    expect(result.input_message_content.message_text).toContain("ZŠ Demlova &amp; park");
    expect(result.input_message_content.message_text).toContain("3 / 8");
    expect(result.input_message_content.message_text).not.toContain(input.inviteUrl);
    expect(result.reply_markup.inline_keyboard[0][0]).toEqual({
      text: "Открыть событие",
      url: input.inviteUrl,
    });
  });

  it("does not repeat the activity when it matches the title", () => {
    const result = buildTelegramEventCard({ ...input, title: "Волейбол" });
    expect(result.input_message_content.message_text.match(/Волейбол/g)).toHaveLength(1);
  });
});
