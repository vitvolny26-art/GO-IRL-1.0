import { describe, expect, it, vi } from "vitest";
import type { ReminderDelivery } from "./types.js";
import { TelegramReminderDispatcher } from "./telegram-dispatcher.js";

const delivery: ReminderDelivery = {
  reminderId: "reminder-1",
  deliveryKey: "delivery-1",
  provider: "telegram",
  recipientId: "123",
  leadMinutes: 60,
  language: "ru",
  attemptCount: 1,
  event: {
    eventId: "event-1",
    title: "Волейбол",
    dateTime: "30 июл. 2026 г. · 18:00",
    location: "ZŠ Demlova",
    openUrl: "https://go-irl.example/event",
    calendarUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Olomouc",
  },
};

const response = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("TelegramReminderDispatcher", () => {
  it("sends the localized reminder with three URL actions", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => response(200, {
      ok: true,
      result: { message_id: 42 },
    }));
    const dispatcher = new TelegramReminderDispatcher({
      botToken: "test-token",
      fetchImpl,
    });

    await expect(dispatcher.send(delivery)).resolves.toEqual({
      status: "sent",
      providerMessageId: "42",
    });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain("bottest-token/sendMessage");
    const body = JSON.parse(String(init?.body));
    expect(body.chat_id).toBe("123");
    expect(body.text).toContain("Событие начнётся через 1 ч");
    expect(body.reply_markup.inline_keyboard).toHaveLength(3);
  });

  it("cancels without a network call when consent or identity is unavailable", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const dispatcher = new TelegramReminderDispatcher({
      botToken: "test-token",
      fetchImpl,
    });
    await expect(dispatcher.send({
      ...delivery,
      cancelReason: "provider_consent_missing",
    })).resolves.toEqual({
      status: "cancelled",
      reason: "provider_consent_missing",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("cancels a blocked recipient and retries transient Telegram failures", async () => {
    const blocked = new TelegramReminderDispatcher({
      botToken: "test-token",
      fetchImpl: vi.fn<typeof fetch>(async () => response(403, {
        ok: false,
        description: "Forbidden: bot was blocked by the user",
      })),
    });
    await expect(blocked.send(delivery)).resolves.toMatchObject({
      status: "cancelled",
    });

    const transient = new TelegramReminderDispatcher({
      botToken: "test-token",
      fetchImpl: vi.fn<typeof fetch>(async () => response(503, {
        ok: false,
        description: "Service unavailable",
      })),
    });
    await expect(transient.send(delivery)).rejects.toThrow("telegram_503");
  });
});
