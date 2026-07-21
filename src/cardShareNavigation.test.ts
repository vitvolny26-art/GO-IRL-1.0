import { afterEach, describe, expect, it, vi } from "vitest";
import { openExternalShareTarget, openMessengerShareTarget, openTelegramShareTarget } from "./cardShareNavigation";

const content = { title: "Volleyball", date: "Tomorrow", address: "Olomouc", url: "https://go-irl-1-0.vercel.app/?startapp=39e31319-a4fc-4d41-bf1e-d713178290d1" };

afterEach(() => vi.unstubAllGlobals());

describe("openTelegramShareTarget", () => {
  it("uses Telegram navigation inside the Mini App", () => {
    const openTelegramLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openTelegramLink } }, open: vi.fn() });
    openTelegramShareTarget("https://t.me/share/url?url=x");
    expect(openTelegramLink).toHaveBeenCalledWith("https://t.me/share/url?url=x");
  });

  it("falls back to a browser window outside Telegram", () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    openTelegramShareTarget("https://t.me/share/url?url=x");
    expect(open).toHaveBeenCalledWith("https://t.me/share/url?url=x", "_blank", "noopener,noreferrer");
  });
});

describe("openExternalShareTarget", () => {
  it("uses Telegram openLink for HTTPS targets inside the Mini App", () => {
    const openLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openLink } }, open: vi.fn() });
    openExternalShareTarget("https://www.facebook.com/dialog/send?app_id=1");
    expect(openLink).toHaveBeenCalledWith("https://www.facebook.com/dialog/send?app_id=1");
  });

  it("opens HTTPS targets in a browser window outside Telegram", () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    openExternalShareTarget("https://www.facebook.com/dialog/send?app_id=1");
    expect(open).toHaveBeenCalledWith(
      "https://www.facebook.com/dialog/send?app_id=1",
      "_blank",
      "noopener,noreferrer",
    );
  });
});

describe("openMessengerShareTarget", () => {
  it("uses the HTTPS share bridge on Android to avoid Meta 4202", () => {
    const openLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openLink } }, open: vi.fn() });
    openMessengerShareTarget(content, "Mozilla/5.0 (Linux; Android 14)");
    expect(openLink).toHaveBeenCalledWith(expect.stringContaining("/messenger-share.html?"));
  });

  it("uses the HTTPS share bridge on iOS", () => {
    const openLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openLink } }, open: vi.fn() });
    openMessengerShareTarget(content, "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)");
    expect(openLink).toHaveBeenCalledWith(expect.stringContaining("/messenger-share.html?"));
  });

  it("keeps the Meta Send Dialog for desktop browsers", () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    openMessengerShareTarget(content, "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    expect(open).toHaveBeenCalledWith(expect.stringContaining("https://www.facebook.com/dialog/send"), "_blank", "noopener,noreferrer");
  });
});
