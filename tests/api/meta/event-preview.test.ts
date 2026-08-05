import { describe, expect, it } from "vitest";
import {
  metaEventPreviewCopy,
  setCardImageResponseHeaders,
} from "../../../api/meta/event-preview.js";
import vercel from "../../../vercel.json";
import source from "../../../api/meta/event-preview.ts?raw";

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

  it("returns Telegram-compatible attachment headers only for downloads", () => {
    const attachmentHeaders = new Map<string, string>();
    setCardImageResponseHeaders({
      setHeader: (name, value) => attachmentHeaders.set(name, value),
    }, 1234, true);
    expect(attachmentHeaders.get("Content-Type")).toBe("image/jpeg");
    expect(attachmentHeaders.get("Content-Length")).toBe("1234");
    expect(attachmentHeaders.get("Content-Disposition")).toContain("attachment");
    expect(attachmentHeaders.get("Access-Control-Allow-Origin")).toBe("https://web.telegram.org");

    const previewHeaders = new Map<string, string>();
    setCardImageResponseHeaders({
      setHeader: (name, value) => previewHeaders.set(name, value),
    }, 1234);
    expect(previewHeaders.get("Access-Control-Allow-Origin")).toBe("*");
    expect(previewHeaders.has("Content-Disposition")).toBe(false);
  });

  it("routes Activity downloads through attachment mode and Beauty through the canonical renderer", () => {
    expect(source.match(/format === "image" \|\| format === "download"/g)).toHaveLength(2);
    expect(source).toContain("renderBeautyShareCardJpeg");
    expect(source).toContain('image.searchParams.set("v", "10")');
    expect(source).toContain('og:image:height" content="1350"');
  });
});
