import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildMessengerEventShareTarget,
  openExternalShareTarget,
  openMessengerShareTarget,
  openTelegramShareTarget,
} from "./cardShareNavigation";

const eventId = "39e31319-a4fc-4d41-bf1e-d713178290d1";
const content = { title: "Volleyball", date: "Tomorrow", address: "Olomouc", url: `https://go-irl-1-0.vercel.app/?startapp=${eventId}` };

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
  it("builds the existing Meta preview endpoint as a Messenger referral entry", () => {
    vi.stubGlobal("window", { location: { origin: "https://preview.example" } });
    const target = new URL(buildMessengerEventShareTarget(content));
    expect(target.origin).toBe("https://preview.example");
    expect(target.pathname).toBe("/api/meta/event-preview");
    expect(target.searchParams.get("event")).toBe(eventId);
    expect(target.searchParams.get("messenger")).toBe("1");
  });

  it("opens the referral entry through Telegram openLink inside the Mini App", () => {
    const openLink = vi.fn();
    vi.stubGlobal("window", {
      location: { origin: "https://preview.example" },
      Telegram: { WebApp: { openLink } },
      open: vi.fn(),
    });
    openMessengerShareTarget(content);
    expect(openLink).toHaveBeenCalledWith(expect.stringContaining("/api/meta/event-preview?"));
    expect(openLink).toHaveBeenCalledWith(expect.stringContaining("messenger=1"));
  });

  it("opens the referral entry in a browser outside Telegram", () => {
    const open = vi.fn();
    vi.stubGlobal("window", { location: { origin: "https://preview.example" }, open });
    openMessengerShareTarget(content);
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining("/api/meta/event-preview?"),
      "_blank",
      "noopener,noreferrer",
    );
  });
});
