import { describe, expect, it } from "vitest";
import { buildMetaMessengerReferralUrl, metaEventPreviewCopy } from "./event-preview.js";

describe("Meta event preview copy", () => {
  it("localizes all public actions for every supported language", () => {
    expect(metaEventPreviewCopy.ru).toEqual({
      calendar: "Добавить в календарь",
      map: "Открыть карту",
      telegram: "Присоединиться в Telegram",
    });
    expect(metaEventPreviewCopy.uk.calendar).toBe("Додати до календаря");
    expect(metaEventPreviewCopy.cs.telegram).toBe("Připojit se v Telegramu");
    expect(metaEventPreviewCopy.en).toEqual({
      calendar: "Add to calendar",
      map: "Open map",
      telegram: "Join in Telegram",
    });
  });

  it("builds the Messenger event referral consumed by the rich-card webhook flow", () => {
    expect(buildMetaMessengerReferralUrl("3b172dd9-d5e2-4328-86a4-d4107a6359fc", "123456789"))
      .toBe("https://m.me/123456789?ref=event%3A3b172dd9-d5e2-4328-86a4-d4107a6359fc");
  });
});
