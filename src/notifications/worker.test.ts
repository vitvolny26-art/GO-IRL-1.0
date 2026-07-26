import { describe, expect, it, vi } from "vitest";
import { runEventNotificationWorker } from "./worker";

describe("event notification worker", () => {
  it("finishes successful deliveries once", async () => {
    const delivery = {
      id: "n1", userKey: "user:1", kind: "join_confirmed", payload: { eventId: "e1" },
      attemptCount: 1, provider: "telegram", recipientId: "1", language: "ru",
      openUrl: "https://example.com/join/e1",
    };
    const repository = {
      claim: vi.fn().mockResolvedValue([delivery]),
      finish: vi.fn().mockResolvedValue(undefined),
    };
    const dispatcher = { send: vi.fn().mockResolvedValue({ status: "sent" }) };
    const summary = await runEventNotificationWorker(repository as never, dispatcher as never);
    expect(summary.sent).toBe(1);
    expect(repository.finish).toHaveBeenCalledTimes(1);
  });

  it("retries transient failures", async () => {
    const delivery = {
      id: "n1", userKey: "user:1", kind: "event_changed", payload: { eventId: "e1" },
      attemptCount: 1, provider: "telegram", recipientId: "1", language: "ru",
      openUrl: "https://example.com/join/e1",
    };
    const repository = {
      claim: vi.fn().mockResolvedValue([delivery]),
      finish: vi.fn().mockResolvedValue(undefined),
    };
    const dispatcher = { send: vi.fn().mockRejectedValue(new Error("telegram_503")) };
    const summary = await runEventNotificationWorker(repository as never, dispatcher as never);
    expect(summary.retried).toBe(1);
    expect(repository.finish.mock.calls[0]?.[1]).toMatchObject({ status: "retry" });
  });
});
