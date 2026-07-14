import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { buildMetaInvitationCardSvg, buildTelegramShareCardSvg } from "./telegram-share-card-svg";
import { configureTelegramShareCardFonts, renderMetaInvitationCardJpeg, renderTelegramShareCardJpeg } from "./telegram-share-card-image";
import type { TelegramEventCardInput } from "./telegram-event-card";

const card: TelegramEventCardInput = {
  eventId: "3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  title: "Волейбол на ZŠ Demlova <вечером>",
  activity: "Волейбол",
  date: "19 июл",
  time: "16:30",
  address: "ZŠ Demlova & park",
  participants: 2,
  capacity: 12,
  icon: "🏐",
  inviteUrl: "https://t.me/GOirl_bot?startapp=3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  city: "Оломоуц",
  durationMinutes: 90,
  price: 0,
  level: "Любитель",
  format: "Любительский",
  environment: "На улице",
  isSport: true,
  language: "ru",
};

describe("Telegram event share-card image", () => {
  it("renders escaped event data into the GO IRL layout", () => {
    const svg = buildTelegramShareCardSvg(card);
    expect(svg).toContain('width="1080" height="900"');
    expect(svg).toContain("Волейбол на ZŠ");
    expect(svg).toContain("&lt;вечером&gt;");
    expect(svg).toContain("ZŠ Demlova &amp; park");
    expect(svg).toContain("Нужен тренер");
    expect(svg).toContain("Открыть");
    expect(svg).not.toContain("23°C");
    expect(svg).not.toContain("Прогноз");
    expect(svg).toContain("DejaVu Sans");
    expect(svg).not.toContain("Arial");
  });

  it("bundles regular and bold Cyrillic fonts for serverless rendering", () => {
    const fonts = configureTelegramShareCardFonts();
    expect(fonts.regularFont).toMatch(/DejaVuSans\.ttf$/);
    expect(fonts.boldFont).toMatch(/DejaVuSans-Bold\.ttf$/);
    expect(existsSync(fonts.regularFont)).toBe(true);
    expect(existsSync(fonts.boldFont)).toBe(true);
    expect(existsSync(fonts.configFile)).toBe(true);
  });

  it("produces a Telegram-compatible JPEG", async () => {
    const jpeg = await renderTelegramShareCardJpeg(card);
    const metadata = await sharp(jpeg).metadata();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(900);
    expect(jpeg.length).toBeLessThan(5 * 1024 * 1024);
  });

  it("uses bundled color artwork for inline skating", () => {
    const svg = buildTelegramShareCardSvg({ ...card, icon: "🛼", activity: "Ролики" });
    expect(svg).toContain('fill="#bce9ff"');
    expect(svg).toContain('stroke="#ff7cab"');
  });

  it("renders the compact Meta invitation without weather", async () => {
    const metaCard = {
      ...card,
      weather: { icon: "🌤️", temperature: 23, rain: 12, wind: 19 },
    };
    const svg = buildMetaInvitationCardSvg(metaCard);
    expect(svg).toContain('width="1080" height="900"');
    expect(svg).not.toContain("23°C");
    expect(svg).not.toContain("12%");
    expect(svg).not.toContain("19 km/h");
    expect(svg).toContain('transform="translate(118 118) scale(4.0555556)"');
    expect(svg).toContain('fill="#E6E7E8"');
    expect(svg).toContain('fill="#99AAB5"');

    const jpeg = await renderMetaInvitationCardJpeg(metaCard);
    const metadata = await sharp(jpeg).metadata();
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(900);
    expect(jpeg.length).toBeLessThan(5 * 1024 * 1024);
  });
});
