import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { buildBeautyShareCardSvg } from "./beauty-share-card-svg";
import { renderBeautyShareCardJpeg } from "./telegram-share-card-image";
import type { TelegramEventCardInput } from "./telegram-event-card";

const card: TelegramEventCardInput = {
  eventId: "profile-1",
  title: "Маникюр с гель-лаком",
  activity: "Studio Vita",
  date: "",
  eventDate: "",
  time: "",
  address: "Центр, Оломоуц",
  participants: 0,
  capacity: 0,
  icon: "✨",
  inviteUrl: "https://t.me/GOirl_bot?startapp=beauty-test",
  publicProfileUrl: "https://go-irl-1-0.vercel.app/beauty/beauty-test",
  city: "Olomouc",
  price: 890,
  level: "Бьюти-услуга",
  format: "60 min",
  environment: "Центр, Оломоуц",
  language: "ru",
  beautyServices: [
    { name: "Маникюр с гель-лаком", priceCzk: 890 },
    { name: "Педикюр и долговременное покрытие", priceCzk: 990 },
    { name: "Nail art", priceCzk: 250 },
  ],
};

describe("Beauty share card SVG", () => {
  it("renders the canonical 1080x1350 business card with three services", () => {
    const svg = buildBeautyShareCardSvg(card);
    expect(svg).toContain('width="1080" height="1350"');
    expect(svg.match(/data-beauty-service-row=/g)).toHaveLength(3);
    expect(svg).toContain("GO IRL BEAUTY");
    expect(svg).toContain("Услуги и запись");
    expect(svg).toContain("LESS SCROLLING. MORE LIFE.");
    expect(svg).toContain("go-irl-1-0.vercel.app/beauty/beauty-test");
  });

  it("produces an opaque server JPEG with the canonical dimensions", async () => {
    const jpeg = await renderBeautyShareCardJpeg(card);
    const metadata = await sharp(jpeg).metadata();
    const stats = await sharp(jpeg).stats();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(1350);
    expect(jpeg.length).toBeLessThan(5 * 1024 * 1024);
    expect(stats.isOpaque).toBe(true);
  });
});
