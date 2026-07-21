import { describe, expect, it } from "vitest";
import { metaEventPreviewCopy } from "./event-preview.js";

describe("Meta event preview copy", () => {
  it("localizes both public actions for every supported language", () => {
    expect(metaEventPreviewCopy.ru).toEqual({
      calendar: "Добавить в календарь",
      telegram: "Присоединиться в Telegram",
    });
    expect(metaEventPreviewCopy.uk.calendar).toBe("Додати до календаря");
    expect(metaEventPreviewCopy.cs.telegram).toBe("Připojit se v Telegramu");
    expect(metaEventPreviewCopy.en).toEqual({
      calendar: "Add to calendar",
      telegram: "Join in Telegram",
    });
  });
});
