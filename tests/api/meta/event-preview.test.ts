import { describe, expect, it } from "vitest";
import { metaEventPreviewCopy, resolveMetaEventPreviewOrigin } from "../../../api/meta/event-preview.js";
import { whatsappShareCopy } from "../../../src/cardShare.js";

describe("Meta event preview copy", () => {
  it("localizes the same two public actions as the Telegram card", () => {
    expect(metaEventPreviewCopy.ru).toEqual({ open: "Открыть событие", calendar: "В календарь" });
    expect(metaEventPreviewCopy.uk).toEqual({ open: "Відкрити подію", calendar: "У календар" });
    expect(metaEventPreviewCopy.cs).toEqual({ open: "Otevřít událost", calendar: "Do kalendáře" });
    expect(metaEventPreviewCopy.en).toEqual({ open: "Open event", calendar: "Add to calendar" });
  });

  it("keeps WhatsApp primary action wording aligned with the Telegram-standard preview", () => {
    for (const language of ["ru", "uk", "cs", "en"] as const) {
      expect(whatsappShareCopy[language].open).toBe(metaEventPreviewCopy[language].open);
    }
  });

  it("uses the trusted public share request host for canonical and image URLs", () => {
    expect(resolveMetaEventPreviewOrigin({
      headers: { "x-forwarded-host": "go-irl-1-0.vercel.app" },
    })).toBe("https://go-irl-1-0.vercel.app");

    expect(resolveMetaEventPreviewOrigin({
      headers: { host: "go-irl-1-0.vercel.app" },
    })).toBe("https://go-irl-1-0.vercel.app");
  });

  it("rejects arbitrary forwarded hosts", () => {
    expect(resolveMetaEventPreviewOrigin({
      headers: { "x-forwarded-host": "attacker.example" },
    })).not.toBe("https://attacker.example");
  });
});
