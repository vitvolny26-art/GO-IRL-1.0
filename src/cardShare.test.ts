import { describe, expect, it } from "vitest";
import {
  buildCardShareTarget,
  buildCardShareImageUrl,
  buildCardShareLandingUrl,
  buildCardShareText,
  buildFacebookShareTarget,
  buildMessengerAndroidIntentTarget,
  buildMessengerAppTarget,
  buildMessengerPreviewUrl,
  buildMessengerShareBridgeTarget,
  buildMetaEventPreviewUrl,
  buildOrganicCardShareContent,
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

  it("keeps Telegram on the exact event link and gives WhatsApp the short landing", () => {
    expect(decodeURIComponent(buildCardShareTarget("telegram", content))).toContain(content.url);
    const whatsappTarget = new URL(buildCardShareTarget("whatsapp", content));
    expect(whatsappTarget.origin).toBe("https://wa.me");
    expect(whatsappTarget.searchParams.get("text")).toContain(`https://go-irl-1-0.vercel.app/e/${eventId}`);
  });

  it("builds a short Activity landing URL while keeping the API as the image source", () => {
    expect(buildCardShareLandingUrl(content)).toBe(`https://go-irl-1-0.vercel.app/e/${eventId}`);
    expect(buildCardShareImageUrl(content)).toContain("/api/meta/event-preview?");
  });

  it("builds one shared Meta preview URL for the same event", () => {
    expect(buildMetaEventPreviewUrl(content)).toBe(previewUrl);
    expect(buildMessengerPreviewUrl(content)).toBe(previewUrl);
    expect(buildOrganicCardShareContent(content)).toEqual({
      title: "GO IRL: Ролики в парке",
      text: "16 июл. · 18:00\nSmetanovy sady, Olomouc",
      url: previewUrl,
    });
  });

  it("builds a JPEG media URL on the shared preview function", () => {
    const image = new URL(buildCardShareImageUrl(content));
    expect(image.pathname).toBe("/api/meta/event-preview");
    expect(image.searchParams.get("event")).toBe(eventId);
    expect(image.searchParams.get("format")).toBe("image");
  });

  it("keeps Facebook separate from Messenger and never puts preview URL in user text", () => {
    const target = new URL(buildFacebookShareTarget(content));
    expect(target.origin + target.pathname).toBe("https://www.facebook.com/sharer/sharer.php");
    expect(target.searchParams.get("u")).toBe(previewUrl);
    expect(target.searchParams.get("quote")).toContain(content.url);
    expect(target.searchParams.get("quote")).not.toContain("/api/meta/event-preview");
    expect(buildCardShareTarget("facebook", content)).toBe(target.toString());
  });

  it("uses the dynamic event preview in the Messenger Send Dialog", () => {
    const target = new URL(buildCardShareTarget("messenger", content));
    expect(target.origin + target.pathname).toBe("https://www.facebook.com/dialog/send");
    expect(target.searchParams.get("app_id")).toBe("1348703396728256");
    expect(target.searchParams.get("link")).toBe(previewUrl);
  });

  it("builds native Messenger targets for mobile devices", () => {
    expect(buildMessengerAppTarget(content)).toContain("fb-messenger://share/");
    const android = buildMessengerAndroidIntentTarget(content);
    expect(android).toContain("intent://share/");
    expect(android).toContain("package=com.facebook.orca");
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
    expect(buildMetaEventPreviewUrl(fallback)).toBe(fallback.url);
  });

  it("builds a dynamic Beauty preview for WhatsApp without changing Telegram sharing", () => {
    const beauty = {
      title: "Test Studio",
      date: "03 авг · 09:00",
      address: "Центр, Оломоуц",
      url: "https://go-irl-1-0.vercel.app/beauty/beauty-test-studio",
    };
    const preview = new URL(buildMetaEventPreviewUrl(beauty));
    expect(preview.pathname).toBe("/api/meta/event-preview");
    expect(preview.searchParams.get("slug")).toBe("beauty-test-studio");
    expect(preview.searchParams.get("date")).toBe(beauty.date);

    const whatsapp = new URL(buildCardShareTarget("whatsapp", beauty));
    expect(buildCardShareLandingUrl(beauty)).toBe(
      "https://go-irl-1-0.vercel.app/s/beauty-test-studio?date=03+%D0%B0%D0%B2%D0%B3+%C2%B7+09%3A00",
    );
    expect(whatsapp.searchParams.get("text")).toContain("https://go-irl-1-0.vercel.app/s/beauty-test-studio");
    expect(decodeURIComponent(buildCardShareTarget("telegram", beauty))).toContain(beauty.url);
  });
});
