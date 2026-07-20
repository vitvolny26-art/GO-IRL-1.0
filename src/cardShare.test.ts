import { describe, expect, it } from "vitest";
import { buildCardShareTarget, buildCardShareText } from "./cardShare";

const eventId = "3b172dd9-d5e2-4328-86a4-d4107a6359fc";
const content = {
  title: "Ролики в парке",
  date: "16 июл. · 18:00",
  address: "Smetanovy sady, Olomouc",
  url: `https://t.me/GOirl_bot?startapp=${eventId}`,
};

describe("card share", () => {
  it("keeps the exact event deep link in the share text", () => {
    expect(buildCardShareText(content)).toBe(`${content.url}\n\nGO IRL: Ролики в парке\n16 июл. · 18:00\nSmetanovy sady, Olomouc`);
  });

  it("builds direct Telegram and WhatsApp targets", () => {
    expect(decodeURIComponent(buildCardShareTarget("telegram", content))).toContain(content.url);
    expect(decodeURIComponent(buildCardShareTarget("whatsapp", content))).toContain(content.url);
  });

  it("routes Messenger through the GO IRL event preview", () => {
    const target = decodeURIComponent(buildCardShareTarget("messenger", content));
    expect(target).toContain("https://go-irl-1-0.vercel.app/api/meta/event-preview");
    expect(target).toContain(`event=${eventId}`);
    expect(target).not.toContain("u=https://t.me/");
  });
});
