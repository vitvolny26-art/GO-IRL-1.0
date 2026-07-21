import { describe, expect, it } from "vitest";
import {
  buildCardShareTarget,
  buildCardShareText,
  buildMessengerPreviewUrl,
  buildMessengerShareBridgeTarget,
} from "./cardShare";

const eventId = "3b172dd9-d5e2-4328-86a4-d4107a6359fc";
const content = {
  title: "Ролики в парке",
  date: "16 июл. · 18:00",
  address: "Smetanovy sady, Olomouc",
  url: `https://t.me/GOirl_bot?startapp=${eventId}`,
};

const previewUrl = `https://go-irl-1-0.vercel.app/api/meta/event-preview?event=${eventId}&language=ru`;

describe("card share", () => {
  it("keeps the exact event deep link in the share text", () => {
    expect(buildCardShareText(content)).toBe(`GO IRL: Ролики в парке\n16 июл. · 18:00\nSmetanovy sady, Olomouc\n\n${content.url}`);
  });

  it("keeps Telegram and WhatsApp on the exact event deep link", () => {
    expect(decodeURIComponent(buildCardShareTarget("telegram", content))).toContain(content.url);
    expect(decodeURIComponent(buildCardShareTarget("whatsapp", content))).toContain(content.url);
  });

  it("builds the Messenger preview URL for the same event", () => {
    expect(buildMessengerPreviewUrl(content)).toBe(previewUrl);
  });

  it("uses the dynamic event preview in the Messenger Send Dialog", () => {
    const target = new URL(buildCardShareTarget("messenger", content));
    expect(target.origin + target.pathname).toBe("https://www.facebook.com/dialog/send");
    expect(target.searchParams.get("app_id")).toBe("2315026155981238");
    expect(target.searchParams.get("link")).toBe(previewUrl);
  });

  it("uses an HTTPS share bridge with the dynamic preview and exact event data", () => {
    const target = new URL(buildMessengerShareBridgeTarget(content));
    expect(target.protocol).toBe("https:");
    expect(target.pathname).toBe("/messenger-share.html");
    expect(target.searchParams.get("title")).toBe(content.title);
    expect(target.searchParams.get("date")).toBe(content.date);
    expect(target.searchParams.get("address")).toBe(content.address);
    expect(target.searchParams.get("url")).toBe(previewUrl);
  });

  it("falls back to the original URL when no valid event id is present", () => {
    const fallback = { ...content, url: "https://example.com/event" };
    expect(buildMessengerPreviewUrl(fallback)).toBe(fallback.url);
  });
});
