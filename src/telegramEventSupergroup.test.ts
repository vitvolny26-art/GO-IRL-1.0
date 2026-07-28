import { beforeEach, describe, expect, it, vi } from "vitest";

const { invoke, openTelegramLink } = vi.hoisted(() => ({
  invoke: vi.fn(),
  openTelegramLink: vi.fn(),
}));

vi.mock("./supabase", () => ({
  supabase: {
    functions: { invoke },
  },
}));

vi.mock("./telegram", () => ({
  getTelegramWebApp: () => ({ openTelegramLink }),
}));

import {
  createEventSupergroupBinding,
  openEventSupergroupBinding,
} from "./telegramEventSupergroup";

describe("event Telegram supergroup handshake", () => {
  beforeEach(() => {
    invoke.mockReset();
    openTelegramLink.mockReset();
  });

  it("requests an event-bound startgroup token", async () => {
    invoke.mockResolvedValue({
      data: {
        startGroupUrl: "https://t.me/GOirl_bot?startgroup=abcdefghijklmnopqrstuvwxyz_123456",
        expiresAt: "2026-07-28T18:00:00.000Z",
      },
      error: null,
    });

    await expect(createEventSupergroupBinding("f8aa4975-acde-4d58-a247-3be70f2fcf73")).resolves.toEqual({
      startGroupUrl: "https://t.me/GOirl_bot?startgroup=abcdefghijklmnopqrstuvwxyz_123456",
      expiresAt: "2026-07-28T18:00:00.000Z",
    });
    expect(invoke).toHaveBeenCalledWith("telegramEventSupergroup", {
      body: {
        action: "create_binding",
        activityId: "f8aa4975-acde-4d58-a247-3be70f2fcf73",
      },
    });
  });

  it("rejects an untrusted binding URL", async () => {
    invoke.mockResolvedValue({
      data: {
        startGroupUrl: "https://evil.example/startgroup=abcdefghijklmnopqrstuvwxyz_123456",
        expiresAt: "2026-07-28T18:00:00.000Z",
      },
      error: null,
    });

    await expect(createEventSupergroupBinding("activity-id")).rejects.toThrow("invalid_supergroup_binding_response");
  });

  it("opens only a validated startgroup URL", () => {
    const url = "https://t.me/GOirl_bot?startgroup=abcdefghijklmnopqrstuvwxyz_123456";
    expect(openEventSupergroupBinding(url)).toBe(true);
    expect(openTelegramLink).toHaveBeenCalledWith(url);
    expect(openEventSupergroupBinding("https://t.me/GOirl_bot?startgroup=short")).toBe(false);
  });
});
