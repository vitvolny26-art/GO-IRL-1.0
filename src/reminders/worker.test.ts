import { describe, expect, it, vi } from "vitest";
import type { ReminderDelivery, ReminderDeliveryOutcome } from "./types.js";
import { runReminderWorker } from "./worker.js";

const delivery = (attemptCount: number, id = "reminder-1"): ReminderDelivery => ({
  reminderId: id,
  deliveryKey: `delivery-${id}`,
  provider: "telegram",
  recipientId: "123",
  leadMinutes: 60,
  language: "ru",
  attemptCount,
  event: {
    eventId: "event-1",
    title: "Волейбол",
    dateTime: "Завтра · 18:00",
    location: "Оломоуц",
    openUrl: "https://goirl.example/events/event-1",
  },
});

describe("runReminderWorker", () => {
  it("records successful delivery", async () => {
    const finish = vi.fn<(id: string, outcome: ReminderDeliveryOutcome) => Promise<void>>()
      .mockResolvedValue();
    const result = await runReminderWorker(
      { claim: vi.fn().mockResolvedValue([delivery(1)]), finish },
      { send: vi.fn().mockResolvedValue({ status: "sent", providerMessageId: "msg-1" }) },
    );

    expect(result).toMatchObject({ claimed: 1, sent: 1, retried: 0, failed: 0 });
    expect(finish).toHaveBeenCalledWith("reminder-1", {
      status: "sent",
      providerMessageId: "msg-1",
    });
  });

  it("retries exceptions with bounded exponential backoff", async () => {
    const finish = vi.fn<(id: string, outcome: ReminderDeliveryOutcome) => Promise<void>>()
      .mockResolvedValue();
    await runReminderWorker(
      { claim: vi.fn().mockResolvedValue([delivery(3)]), finish },
      { send: vi.fn().mockRejectedValue(new Error("provider_timeout")) },
      { now: () => new Date("2026-07-23T10:00:00.000Z") },
    );

    expect(finish).toHaveBeenCalledWith("reminder-1", {
      status: "retry",
      errorCode: "provider_timeout",
      retryAt: "2026-07-23T10:04:00.000Z",
    });
  });

  it("stops retrying at the configured attempt limit", async () => {
    const finish = vi.fn<(id: string, outcome: ReminderDeliveryOutcome) => Promise<void>>()
      .mockResolvedValue();
    const result = await runReminderWorker(
      { claim: vi.fn().mockResolvedValue([delivery(5)]), finish },
      { send: vi.fn().mockRejectedValue(new Error("provider_unavailable")) },
      { maxAttempts: 5 },
    );

    expect(result.failed).toBe(1);
    expect(finish).toHaveBeenCalledWith("reminder-1", {
      status: "failed",
      errorCode: "provider_unavailable",
    });
  });

  it("processes a batch sequentially and preserves every outcome", async () => {
    const finish = vi.fn<(id: string, outcome: ReminderDeliveryOutcome) => Promise<void>>()
      .mockResolvedValue();
    const send = vi.fn()
      .mockResolvedValueOnce({ status: "sent" })
      .mockResolvedValueOnce({ status: "cancelled", reason: "event_closed" });
    const result = await runReminderWorker(
      {
        claim: vi.fn().mockResolvedValue([delivery(1), delivery(1, "reminder-2")]),
        finish,
      },
      { send },
      { limit: 500 },
    );

    expect(result).toMatchObject({ claimed: 2, sent: 1, cancelled: 1 });
    expect(send).toHaveBeenCalledTimes(2);
    expect(finish).toHaveBeenCalledTimes(2);
  });
});
