import { describe, expect, it, vi } from "vitest";
import { EventNotificationDispatcher } from "./dispatcher";
import type { EventNotificationDelivery } from "./types";

const eventId = "39e31319-a4fc-4d41-bf1e-d713178290d1";

const telegramDelivery: EventNotificationDelivery = {
  id: "notification-1",
  userKey: "telegram:1",
  activityId: eventId,
  kind: "join_confirmed",
  payload: {
    eventId,
    title: { ru: "Volejbal" },
    date: "2026-07-29",
    time: "18:00",
    address: "Sobacov",
  },
  attemptCount: 1,
  provider: "telegram",
  recipientId: "1",
  language: "ru",
  openUrl: `https://go-irl-1-0.vercel.app/join/${eventId}`,
};

describe("EventNotificationDispatcher Telegram links", () => {
  it("opens lifecycle notifications in the Telegram Mini App", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      result: { message_id: 42 },
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    const dispatcher = new EventNotificationDispatcher({
      telegramBotToken: "test-token",
      graphVersion: "v23.0",
      fetchImpl,
    });

    await dispatcher.send(telegramDelivery);

    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body.reply_markup.inline_keyboard[0][0].url).toBe(
      `https://t.me/GOirl_bot?startapp=${eventId}`,
    );
    expect(body.reply_markup.inline_keyboard[0][0].url).not.toContain("/join/");
  });
});
