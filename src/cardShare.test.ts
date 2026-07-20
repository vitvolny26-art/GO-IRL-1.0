import { describe, expect, it } from "vitest";
import { buildCardShareTarget, buildCardShareText } from "./cardShare";

const content = {
  title: "Ролики в парке",
  date: "16 июл. · 18:00",
  address: "Smetanovy sady, Olomouc",
  url: "https://t.me/GOirl_bot?startapp=event-inline",
};

describe("card share", () => {
  it("keeps the exact event deep link in the share text", () => {
    expect(buildCardShareText(content)).toBe(`${content.url}\n\nGO IRL: Ролики в парке\n16 июл. · 18:00\nSmetanovy sady, Olomouc`);
  });

  it("builds direct Telegram, WhatsApp, and Facebook targets", () => {
    expect(decodeURIComponent(buildCardShareTarget("telegram", content))).toContain(content.url);
    expect(decodeURIComponent(buildCardShareTarget("whatsapp", content))).toContain(content.url);
    const facebookTarget = decodeURIComponent(buildCardShareTarget("messenger", content));
    expect(facebookTarget).toContain(`u=${content.url}`);
    expect(facebookTarget).toContain("quote=GO IRL: Ролики в парке");
  });
});
