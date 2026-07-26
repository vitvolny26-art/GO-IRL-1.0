import { describe, expect, it, vi } from "vitest";
import {
  canAccessExternalTelegramChat,
  normalizeExternalTelegramChatUrl,
  openExternalTelegramChat,
  resolveExternalTelegramChatLifecycle,
} from "./externalTelegramChat";

describe("external Telegram chat links", () => {
  it("normalizes supported Telegram group links and rejects unsafe URLs", () => {
    expect(normalizeExternalTelegramChatUrl("https://telegram.me/+AbC_123-xyz/")).toBe("https://t.me/+AbC_123-xyz");
    expect(normalizeExternalTelegramChatUrl("https://t.me/joinchat/AbC_123-xyz")).toBe("https://t.me/joinchat/AbC_123-xyz");
    expect(normalizeExternalTelegramChatUrl("https://t.me/example_group")).toBe("https://t.me/example_group");
    expect(normalizeExternalTelegramChatUrl("http://t.me/example_group")).toBeNull();
    expect(normalizeExternalTelegramChatUrl("https://evil.example/t.me/example_group")).toBeNull();
    expect(normalizeExternalTelegramChatUrl("https://t.me/example_group?start=unsafe")).toBeNull();
  });

  it("allows only the organizer and joined participants", () => {
    const base = { currentUserKey: "user:2", organizerUserKey: "user:1" };
    expect(canAccessExternalTelegramChat({ ...base, currentUserKey: "user:1" })).toBe(true);
    expect(canAccessExternalTelegramChat({ ...base, membershipStatus: "joined" })).toBe(true);
    expect(canAccessExternalTelegramChat({ ...base, membershipStatus: "pending" })).toBe(false);
    expect(canAccessExternalTelegramChat({ ...base, membershipStatus: "waiting" })).toBe(false);
    expect(canAccessExternalTelegramChat({ ...base, currentUserKey: null, membershipStatus: "joined" })).toBe(false);
  });

  it("resolves event and permanent team lifecycle policy", () => {
    const now = new Date("2026-07-26T12:00:00.000Z");
    expect(resolveExternalTelegramChatLifecycle({ kind: "team", now })).toBe("active");
    expect(resolveExternalTelegramChatLifecycle({ kind: "event", eventEndsAt: "2026-07-25T13:00:01.000Z", now })).toBe("active");
    expect(resolveExternalTelegramChatLifecycle({ kind: "event", eventEndsAt: "2026-07-25T12:00:00.000Z", now })).toBe("locked");
    expect(resolveExternalTelegramChatLifecycle({ kind: "event", eventEndsAt: "2026-07-19T12:00:00.000Z", now })).toBe("deletion_due");
    expect(resolveExternalTelegramChatLifecycle({ kind: "event", eventEndsAt: "2026-07-19T12:00:00.000Z", keepArchive: true, now })).toBe("archived");
  });

  it("uses Telegram WebApp opening when available", () => {
    const openTelegramLink = vi.fn();
    const openBrowser = vi.fn();

    expect(openExternalTelegramChat("https://t.me/example_group", { openTelegramLink, openBrowser })).toBe(true);
    expect(openTelegramLink).toHaveBeenCalledWith("https://t.me/example_group");
    expect(openBrowser).not.toHaveBeenCalled();
    expect(openExternalTelegramChat("javascript:alert(1)", { openTelegramLink, openBrowser })).toBe(false);
  });
});
