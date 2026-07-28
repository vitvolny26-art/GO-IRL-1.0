import { afterEach, describe, expect, it, vi } from "vitest";
import { openExternal, openTelegramExternal } from "./openExternal";

afterEach(() => vi.unstubAllGlobals());

describe("openExternal", () => {
  it("uses Telegram openLink when available", () => {
    const openLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openLink } }, open: vi.fn() });
    openExternal("https://example.com");
    expect(openLink).toHaveBeenCalledWith("https://example.com");
  });

  it("passes Telegram openLink options when provided", () => {
    const openLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openLink } }, open: vi.fn() });
    openExternal("https://example.com", { try_instant_view: false });
    expect(openLink).toHaveBeenCalledWith("https://example.com", { try_instant_view: false });
  });

  it("falls back to a safe browser window", () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    openExternal("https://example.com");
    expect(open).toHaveBeenCalledWith("https://example.com", "_blank", "noopener,noreferrer");
  });
});

describe("openTelegramExternal", () => {
  it("prefers Telegram openTelegramLink", () => {
    const openTelegramLink = vi.fn();
    const openLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openTelegramLink, openLink } }, open: vi.fn() });
    openTelegramExternal("https://t.me/share/url?url=x", { fallbackToOpenLink: true });
    expect(openTelegramLink).toHaveBeenCalledWith("https://t.me/share/url?url=x");
    expect(openLink).not.toHaveBeenCalled();
  });

  it("can fall back to Telegram openLink", () => {
    const openLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openLink } }, open: vi.fn() });
    openTelegramExternal("https://t.me/GOirl_bot?start=bug_report", {
      fallbackToOpenLink: true,
      openLinkOptions: { try_instant_view: false },
    });
    expect(openLink).toHaveBeenCalledWith("https://t.me/GOirl_bot?start=bug_report", { try_instant_view: false });
  });

  it("does not use generic openLink unless explicitly enabled", () => {
    const openLink = vi.fn();
    const open = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openLink } }, open });
    openTelegramExternal("https://t.me/share/url?url=x");
    expect(openLink).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith("https://t.me/share/url?url=x", "_blank", "noopener,noreferrer");
  });
});
