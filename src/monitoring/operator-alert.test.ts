import { describe, expect, it, vi } from "vitest";
import {
  buildMessagingHealthAlert,
  sendClaimedTelegramAlert,
  type MessagingHealthSnapshot,
} from "./operator-alert.js";

const health = (overrides: Partial<MessagingHealthSnapshot> = {}): MessagingHealthSnapshot => ({
  ok: true,
  workerEnabled: true,
  providers: ["telegram"],
  reminders: { failed: 0 },
  notifications: { failed: 0 },
  oldestDueAgeSeconds: 0,
  checkedAt: "2026-07-23T12:00:00.000Z",
  ...overrides,
});

describe("operator alert", () => {
  it("does not create an alert for a healthy worker", () => {
    expect(buildMessagingHealthAlert(health())).toBeNull();
  });

  it("describes disabled workers and overdue delivery", () => {
    expect(buildMessagingHealthAlert(health({
      ok: false,
      workerEnabled: false,
      oldestDueAgeSeconds: 901,
      reminders: { failed: 2 },
      notifications: { failed: 3 },
    }))).toContain("worker выключен; очередь просрочена на 901 сек.");
  });

  it("does not call Telegram while the alert is in cooldown", async () => {
    const fetchImpl = vi.fn();
    await expect(sendClaimedTelegramAlert("delivery-backlog", "alert", {
      botToken: "token",
      chatId: "123",
      claim: async () => false,
      fetchImpl,
    })).resolves.toEqual({ sent: false, reason: "cooldown" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("sends a claimed alert without link previews", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    await expect(sendClaimedTelegramAlert("worker failure / unsafe", "alert", {
      botToken: "token",
      chatId: "123",
      claim: async (key, cooldown) => {
        expect(key).toBe("worker_failure___unsafe");
        expect(cooldown).toBe(1_800);
        return true;
      },
      fetchImpl,
    })).resolves.toEqual({ sent: true, reason: "sent" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.telegram.org/bottoken/sendMessage",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          chat_id: "123",
          text: "alert",
          disable_web_page_preview: true,
        }),
      }),
    );
  });
});

