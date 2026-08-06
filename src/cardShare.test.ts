import { describe, expect, it } from "vitest";
import {
  buildCardShareTarget,
  buildCardShareDownloadUrl,
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
  isBeautyCardShareContent,
} from "./cardShare";

const eventId = "3b172dd9-d5e2-4328-86a4-d4107a6359fc";
const content = {
  title: "Ролики в парке",
  date: "16 июл. · 18:00",
  address: "Smetanovy sady, Olomouc",
  url: `https://t.me/GOirl_bot?startapp=${eventId}`,
};

const previewUrl = `https://go-irl-1-1.vercel.app/api/meta/event-preview?event=${eventId}&language=ru`;

describe("card share", () => {
  it("keeps the exact event deep link in the share text", () => {
    expect(buildCardShareText(content)).toBe(`GO IRL: Ролики в парке\n16 июл. · 18:00\nSmetanovy sady, Olomouc\n\n${content.url}`);
  });

  it("keeps Telegram on the exact event link and gives WhatsApp the public app landing", () => {
    expect(decodeURIComponent(buildCardShareTarget("telegram", content))).toContain(content.url);
    const whatsappTarget = new URL(buildCardShareTarget("whatsapp", content));
    expect(whatsappTarget.origin).toBe("https://wa.me");
    expect(whatsappTarget.searchParams.get("text")).toContain(`https://go-irl-1-1.vercel.app/e/${eventId}`);
  });

  it("separates the public landing domain from the Vercel image API", () => {
    expect(buildCardShareLandingUrl(content)).toBe(`https://go-irl-1-1.vercel.app/e/${eventId}`);
    expect(buildCardShareImageUrl(content)).toContain("https://go-irl-1-1.vercel.app/api/meta/event-preview?");
  });

  it("builds one shared Meta preview URL for the same event", () => {
    expect(buildMetaEventPreviewUrl(content)).toBe(previewUrl);
    expect(buildMessengerPreviewUrl(content)).toBe(previewUrl);
    expect(buildOrganicCardShareContent(content)).toEqual({
      title: "GO IRL: Ролики в парке",
      text: "16 июл. · 18:00\nSmetanovy sady, Olomouc",
      url: buildCardShareLandingUrl(content),
    });
  });

  it("builds separate JPEG preview and attachment URLs", () => {
    const image = new URL(buildCardShareImageUrl(content));
    const download = new URL(buildCardShareDownloadUrl(content));
    expect(image.pathname).toBe("/api/meta/event-preview");
    expect(image.searchParams.get("event")).toBe(eventId);
    expect(image.searchParams.get("format")).toBe("image");
    expect(download.pathname).toBe(image.pathname);
    expect(download.searchParams.get("event")).toBe(eventId);
    expect(download.searchParams.get("format")).toBe("download");
  });

  it("keeps Facebook separate from Messenger and never puts preview URL in user text", () => {
    const target = new URL(buildFacebookShareTarget(content));
    expect(target.origin + target.pathname).toBe("https://www.facebook.com/sharer/sharer.php");
    expect(target.searchParams.get("u")).toBe(buildCardShareLandingUrl(content));
    expect(target.searchParams.get("quote")).toContain(content.url);
    expect(target.searchParams.get("quote")).not.toContain("/api/meta/event-preview");
    expect(buildCardShareTarget("facebook", content)).toBe(target.toString());
  });

  it("uses the dynamic event preview in the Messenger Send Dialog", () => {
    const target = new URL(buildCardShareTarget("messenger", content));
    expect(target.origin + target.pathname).toBe("https://www.facebook.com/dialog/send");
    expect(target.searchParams.get("app_id")).toBe("1348703396728256");
    expect(target.searchParams.get("link")).toBe(buildCardShareLandingUrl(content));
    expect(target.searchParams.get("redirect_uri")).toBe("https://goirl.realitka.pp.ua");
  });

  it("builds native Messenger targets for mobile devices", () => {
    expect(buildMessengerAppTarget(content)).toContain("fb-messenger://share/");
    const android = buildMessengerAndroidIntentTarget(content);
    expect(android).toContain("intent://share/");
    expect(android).toContain("package=com.facebook.orca");
  });

  it("uses the public HTTPS share bridge with the dynamic preview", () => {
    const target = new URL(buildMessengerShareBridgeTarget(content));
    expect(target.origin).toBe("https://goirl.realitka.pp.ua");
    expect(target.pathname).toBe("/messenger-share.html");
    expect(target.searchParams.get("title")).toBe(content.title);
    expect(target.searchParams.get("date")).toBe(content.date);
    expect(target.searchParams.get("address")).toBe(content.address);
    expect(target.searchParams.get("url")).toBe(buildCardShareLandingUrl(content));
  });

  it("falls back to the original URL when no valid event id is present", () => {
    const fallback = { ...content, url: "https://example.com/event" };
    expect(buildMetaEventPreviewUrl(fallback)).toBe(fallback.url);
    expect(buildCardShareDownloadUrl(fallback)).toBe("");
  });

  it("uses the current Vercel API for Beauty preview and the public app for the landing", () => {
    const beauty = {
      title: "Test Studio",
      date: "03 авг · 09:00",
      address: "Центр, Оломоуц",
      url: "https://goirl.realitka.pp.ua/beauty/beauty-test-studio",
    };
    const preview = new URL(buildMetaEventPreviewUrl(beauty));
    expect(preview.origin).toBe("https://go-irl-1-1.vercel.app");
    expect(preview.pathname).toBe("/api/meta/event-preview");
    expect(preview.searchParams.get("slug")).toBe("beauty-test-studio");
    expect(preview.searchParams.get("date")).toBe(beauty.date);
    expect(preview.searchParams.get("v")).toBe("12");
    expect(buildCardShareLandingUrl(beauty)).toContain("https://go-irl-1-1.vercel.app/s/beauty-test-studio");
    expect(isBeautyCardShareContent(beauty)).toBe(true);

    const whatsapp = new URL(buildCardShareTarget("whatsapp", beauty));
    expect(whatsapp.searchParams.get("text")).toBe(buildCardShareLandingUrl(beauty));
    expect(decodeURIComponent(buildCardShareTarget("telegram", beauty))).toContain(beauty.url);
  });
});
