import { describe, expect, it, vi } from "vitest";
import {
  BeautyBookingTelegramDispatcher,
  buildBeautyBookingNotificationText,
  runBeautyBookingNotificationWorker,
  type BeautyBookingNotificationDelivery,
  type BeautyBookingNotificationOutcome,
} from "./beautyBookingNotifications";

const delivery: BeautyBookingNotificationDelivery = {
  sourceEventId: "event-1",
  bookingId: "booking-1",
  recipientUserKey: "telegram:123",
  recipientTelegramId: "123",
  kind: "booking_confirmed",
  attemptCount: 1,
  language: "en",
  startsAt: "2026-08-08T08:30:00.000Z",
  professionalName: "Studio Vita",
  clientName: "Anna",
  serviceName: { en: "Gel manicure", cs: "Gelová manikúra" },
  publicLocation: "Olomouc centre",
  openUrl: "https://goirl.example/services",
};

const responseMock = (payload: unknown, status: number) => vi.fn(async (
  ...args: Parameters<typeof fetch>
) => {
  void args;
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
});

const finishMock = () => vi.fn(async (
  ...args: [BeautyBookingNotificationDelivery, BeautyBookingNotificationOutcome]
) => {
  void args;
});

describe("Beauty booking Telegram notifications", () => {
  it("builds a minimal localized transactional message", () => {
    const text = buildBeautyBookingNotificationText(delivery);
    expect(text).toContain("Booking confirmed");
    expect(text).toContain("Gel manicure");
    expect(text).toContain("Studio Vita");
    expect(text).toContain("Olomouc centre");
  });

  it("sends through Telegram and preserves provider message evidence", async () => {
    const fetchImpl = responseMock({ ok: true, result: { message_id: 812 } }, 200);
    const dispatcher = new BeautyBookingTelegramDispatcher({ botToken: "test-token", fetchImpl });
    const outcome = await dispatcher.send(delivery);

    expect(outcome).toEqual({ status: "sent", providerMessageId: "812" });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [, init] = fetchImpl.mock.calls[0];
    expect(String(init?.body)).toContain('"chat_id":"123"');
    expect(String(init?.body)).toContain("goirl.example/services");
  });

  it("retries transient Telegram failures and records the retry outcome", async () => {
    const finish = finishMock();
    const repository = {
      claim: async () => [delivery],
      finish,
    };
    const dispatcher = {
      send: async () => {
        throw new Error("telegram_503");
      },
    };

    const summary = await runBeautyBookingNotificationWorker(repository, dispatcher);

    expect(summary).toMatchObject({ claimed: 1, retried: 1, sent: 0, failed: 0 });
    expect(finish).toHaveBeenCalledOnce();
    expect(finish.mock.calls[0][1]).toMatchObject({
      status: "retry",
      errorCode: "telegram_503",
    });
  });

  it("stops retrying after the fifth attempt", async () => {
    const finish = finishMock();
    const repository = {
      claim: async () => [{ ...delivery, attemptCount: 5 }],
      finish,
    };
    const dispatcher = {
      send: async () => {
        throw new Error("telegram_503");
      },
    };

    const summary = await runBeautyBookingNotificationWorker(repository, dispatcher);

    expect(summary.failed).toBe(1);
    expect(finish.mock.calls[0][1]).toEqual({ status: "failed", errorCode: "telegram_503" });
  });

  it("treats a blocked Telegram recipient as cancelled instead of retrying", async () => {
    const fetchImpl = responseMock({ ok: false, error_code: 403 }, 403);
    const dispatcher = new BeautyBookingTelegramDispatcher({ botToken: "test-token", fetchImpl });

    await expect(dispatcher.send(delivery)).resolves.toEqual({
      status: "cancelled",
      reason: "telegram_403",
    });
  });
});
