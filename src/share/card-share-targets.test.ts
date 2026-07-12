import { describe, expect, it } from "vitest";
import { buildCardShareMessage, buildCardShareTarget, type CardShareChannel } from "./card-share-targets";

const payload = {
  title: "Volleyball",
  date: "Сегодня · 18:30",
  address: "ZS Demlova, Olomouc",
  url: "https://t.me/GOirl_bot?startapp=event-123",
};

describe("card share targets", () => {
  it("builds clean event context without duplicating the deep link", () => {
    expect(buildCardShareMessage(payload)).toBe("GO IRL: Volleyball\nСегодня · 18:30\nZS Demlova, Olomouc");
    expect(buildCardShareMessage(payload)).not.toContain(payload.url);
  });

  it.each<CardShareChannel>(["telegram", "whatsapp", "messenger", "viber"])(
    "builds a target for %s containing the event URL exactly once",
    (channel) => {
      const decoded = decodeURIComponent(buildCardShareTarget(channel, payload));
      expect(decoded.split(payload.url)).toHaveLength(2);
    },
  );

  it("keeps Telegram event context separate from its URL parameter", () => {
    const target = new URL(buildCardShareTarget("telegram", payload));
    expect(target.searchParams.get("url")).toBe(payload.url);
    expect(target.searchParams.get("text")).toBe(buildCardShareMessage(payload));
  });
});
