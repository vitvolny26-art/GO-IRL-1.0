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

const createDispatcher = (payload: unknown, status: number) => {
  const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  }));
  return {
    dispatcher: new EventNotificationDispatcher({
      telegramBotToken: "test-token",
      graphVersion: "v23.0",
      fetchImpl,
    }),
    fetchImpl,
  };
};

describe("EventNotificationDispatcher Telegram", () => {
  it("opens lifecycle notifications in the Telegram Mini App", async () => {
    const { dispatcher, fetchImpl } = createDispatcher({
      ok: true,
      result: { message_id: 42 },
    }, 200);

    await dispatcher.send(telegramDelivery);

    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body.reply_markup.inline_keyboard[0][0].url).toBe(
      `https://t.me/GOirl_bot?startapp=${eventId}`,
    );
    expect(body.reply_markup.inline_keyboard[0][0].url).not.toContain("/join/");
  });

  it("cancels delivery when Telegram reports chat not found", async () => {
    const { dispatcher } = createDispatcher({
      ok: false,
      error_code: 400,
      description: "Bad Request: chat not found",
    }, 400);

    await expect(dispatcher.send(telegramDelivery)).resolves.toEqual({
      status: "cancelled",
      reason: "telegram_chat_not_found",
    });
  });

  it("cancels delivery when the user blocked the bot", async () => {
    const { dispatcher } = createDispatcher({
      ok: false,
      error_code: 403,
      description: "Forbidden: bot was blocked by the user",
    }, 403);

    await expect(dispatcher.send(telegramDelivery)).resolves.toEqual({
      status: "cancelled",
      reason: "telegram_bot_blocked",
    });
  });

  it("keeps unknown Telegram 400 responses diagnosable", async () => {
    const { dispatcher } = createDispatcher({
      ok: false,
      error_code: 400,
      description: "Bad Request: unexpected payload",
    }, 400);

    await expect(dispatcher.send(telegramDelivery)).resolves.toEqual({
      status: "failed",
      errorCode: "telegram_400",
    });
  });
});
