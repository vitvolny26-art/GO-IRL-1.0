import { describe, expect, it } from "vitest";
import { metaEventPreviewCopy } from "./event-preview.js";

describe("Meta event preview copy", () => {
  it("localizes all public actions for every supported language", () => {
    expect(metaEventPreviewCopy.ru).toEqual({
      calendar: "Добавить в календарь",
      details: "Подробнее",
      telegram: "Присоединиться в Telegram",
    });
    expect(metaEventPreviewCopy.uk.calendar).toBe("Додати до календаря");
    expect(metaEventPreviewCopy.cs.telegram).toBe("Připojit se v Telegramu");
    expect(metaEventPreviewCopy.en).toEqual({
      calendar: "Add to calendar",
      details: "Details",
      telegram: "Join in Telegram",
    });
  });
});
