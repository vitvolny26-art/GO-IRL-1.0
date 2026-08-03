import { describe, expect, it } from "vitest";
import { metaEventPreviewCopy } from "../../../api/meta/event-preview.js";
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
});
