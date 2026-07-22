import { afterEach, describe, expect, it, vi } from "vitest";
import { buildMessengerEventShareTarget, openExternalShareTarget, openMessengerShareTarget, openTelegramShareTarget } from "./cardShareNavigation";

const content = { title: "Volleyball", date: "Tomorrow", address: "Olomouc", url: "https://go-irl-1-0.vercel.app/?startapp=39e31319-a4fc-4d41-bf1e-d713178290d1" };

afterEach(() => vi.unstubAllGlobals());

describe("openTelegramShareTarget", () => {
  it("uses Telegram navigation inside the Mini App", () => {
    const openTelegramLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openTelegramLink } }, open: vi.fn(), location: { origin: "https://go-irl.test" } });
    openTelegramShareTarget("https://t.me/share/url?url=x");
    expect(openTelegramLink).toHaveBeenCalledWith("https://t.me/share/url?url=x");
  });

  it("falls back to a browser window outside Telegram", () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open, location: { origin: "https://go-irl.test" } });
    openTelegramShareTarget("https://t.me/share/url?url=x");
    expect(open).toHaveBeenCalledWith("https://t.me/share/url?url=x", "_blank", "noopener,noreferrer");
  });
});

describe("openExternalShareTarget", () => {
  it("uses Telegram openLink for HTTPS targets inside the Mini App", () => {
    const openLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openLink } }, open: vi.fn(), location: { origin: "https://go-irl.test" } });
    openExternalShareTarget("https://example.com");
    expect(openLink).toHaveBeenCalledWith("https://example.com");
  });
});

describe("Messenger event share routing", () => {
  it("builds a first-party Messenger referral entrypoint for event URLs", () => {
    vi.stubGlobal("window", { location: { origin: "https://go-irl.test" }, open: vi.fn() });
    expect(buildMessengerEventShareTarget(content)).toBe("https://go-irl.test/api/messenger/share?event=39e31319-a4fc-4d41-bf1e-d713178290d1");
  });

  it("opens the first-party referral entrypoint from Telegram", () => {
    const openLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openLink } }, open: vi.fn(), location: { origin: "https://go-irl.test" } });
    openMessengerShareTarget(content);
    expect(openLink).toHaveBeenCalledWith("https://go-irl.test/api/messenger/share?event=39e31319-a4fc-4d41-bf1e-d713178290d1");
  });
});
