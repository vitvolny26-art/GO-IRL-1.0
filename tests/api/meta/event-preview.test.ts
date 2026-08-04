import { describe, expect, it } from "vitest";
import { metaEventPreviewCopy } from "../../../api/meta/event-preview.js";
import vercel from "../../../vercel.json";

describe("Meta event preview copy", () => {
  it("localizes the same two public actions as the Telegram card", () => {
    expect(metaEventPreviewCopy.ru).toEqual({ open: "Открыть GO IRL", calendar: "В календарь" });
    expect(metaEventPreviewCopy.uk).toEqual({ open: "Відкрити GO IRL", calendar: "У календар" });
    expect(metaEventPreviewCopy.cs).toEqual({ open: "Otevřít GO IRL", calendar: "Do kalendáře" });
    expect(metaEventPreviewCopy.en).toEqual({ open: "Open GO IRL", calendar: "Add to calendar" });
  });

  it("routes short Activity and Service landings to the HTML preview handler", () => {
    expect(vercel.rewrites).toContainEqual({
      source: "/e/:id",
      destination: "/api/meta/event-preview?event=:id",
    });
    expect(vercel.rewrites).toContainEqual({
      source: "/s/:slug",
      destination: "/api/meta/event-preview?slug=:slug",
    });
  });
});
