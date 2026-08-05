import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { buildBeautyShareCardSvg, buildTelegramBeautyShareCardSvg } from "./beauty-share-card-svg";
import { renderBeautyShareCardJpeg, renderTelegramBeautyShareCardJpeg } from "./telegram-share-card-image";
import type { TelegramEventCardInput } from "./telegram-event-card";

const card: TelegramEventCardInput = {
  eventId: "profile-1",
  title: "Маникюр с гель-лаком",
  activity: "Studio Vita",
  description: "Комбинированный маникюр, выравнивание и укрепление натуральных ногтей",
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
  it("renders the clean horizontal 1080x1020 card with two-line description support", () => {
    const svg = buildBeautyShareCardSvg(card);
    expect(svg).toContain('width="1080" height="1020"');
    expect(svg.match(/data-beauty-service-row=/g)).toHaveLength(3);
    expect(svg).toContain('data-beauty-photo-placeholder="true"');
    expect(svg).toContain("Studio Vita");
    expect(svg).toContain("Комбинированный маникюр");
    expect(svg).toContain("Услуги и запись");
    expect(svg).not.toContain("GO IRL BEAUTY");
    expect(svg).not.toContain("LESS SCROLLING. MORE LIFE.");
    expect(svg).not.toContain("go-irl-1-0.vercel.app/beauty/beauty-test");
    expect(svg).not.toContain('data-beauty-telegram-frame="true"');
    expect(svg).not.toContain('data-beauty-telegram-wordmark="true"');
  });

  it("renders a reference-inspired Telegram-only frame, wordmark, and divider", () => {
    const svg = buildTelegramBeautyShareCardSvg({
      ...card,
      description: "Комбинированный маникюр, выравнивание и укрепление натуральных ногтей, однотонные покрытия и минималистичный дизайн",
    });
    expect(svg).toContain('width="1080" height="900"');
    expect(svg.match(/data-beauty-description-line=/g)).toHaveLength(3);
    expect(svg.match(/data-beauty-service-row=/g)).toHaveLength(3);
    expect(svg).toContain("Центр, Оломоуц");
    expect(svg).toContain('data-beauty-telegram-frame="true"');
    expect(svg).toContain('data-beauty-telegram-frame-line="true"');
    expect(svg).toContain('data-beauty-telegram-frame-corner="true"');
    expect(svg).not.toContain('data-beauty-telegram-frame-inner="true"');
    expect(svg).toContain('data-beauty-telegram-wordmark="true"');
    expect(svg).toContain('data-beauty-telegram-title="true"');
    expect(svg).toContain('font-family="DejaVu Serif, Georgia, serif"');
    expect(svg).toContain('font-weight="400"');
    expect(svg).toContain('filter="url(#beautyGoldGlow)"');
    expect(svg).toContain('data-beauty-title-flourish="true"');
    expect(svg).toContain('data-beauty-title-ornament="true"');
    expect(svg).toContain('M428 178h54M598 178h54');
    expect(svg).toContain('fill="url(#beautyGold)"');
    expect(svg).not.toContain("Услуги и запись");
  });

  it("produces opaque server JPEGs with channel-specific dimensions", async () => {
    const jpeg = await renderBeautyShareCardJpeg(card);
    const telegramJpeg = await renderTelegramBeautyShareCardJpeg(card);
    const metadata = await sharp(jpeg).metadata();
    const telegramMetadata = await sharp(telegramJpeg).metadata();
    const stats = await sharp(jpeg).stats();
    const telegramStats = await sharp(telegramJpeg).stats();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(1020);
    expect(telegramMetadata.format).toBe("jpeg");
    expect(telegramMetadata.width).toBe(1080);
    expect(telegramMetadata.height).toBe(900);
    expect(jpeg.length).toBeLessThan(5 * 1024 * 1024);
    expect(telegramJpeg.length).toBeLessThan(5 * 1024 * 1024);
    expect(stats.isOpaque).toBe(true);
    expect(telegramStats.isOpaque).toBe(true);
  });
});
