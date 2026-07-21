import { afterEach, describe, expect, it, vi } from "vitest";
import { openExternalShareTarget, openTelegramShareTarget } from "./cardShareNavigation";

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
  it("opens the Messenger Send Dialog directly from the Telegram Mini App", () => {
    const openLink = vi.fn();
    vi.stubGlobal("window", { Telegram: { WebApp: { openLink } }, open: vi.fn() });
    openExternalShareTarget("https://www.facebook.com/dialog/send?app_id=1");
    expect(openLink).toHaveBeenCalledWith("https://www.facebook.com/dialog/send?app_id=1");
  });

  it("opens the Messenger Send Dialog directly in a browser window", () => {
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
