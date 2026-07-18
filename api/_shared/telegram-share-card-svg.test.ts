import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { buildMetaInvitationCardSvg, buildTelegramShareCardSvg } from "./telegram-share-card-svg";
import { configureTelegramShareCardFonts, hasEventShareBackground, renderMetaInvitationCardJpeg, renderTelegramShareCardJpeg } from "./telegram-share-card-image";
import type { TelegramEventCardInput } from "./telegram-event-card";

const card: TelegramEventCardInput = {
  eventId: "3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  title: "Волейбол на ZŠ Demlova <вечером>",
  activity: "Волейбол",
  date: "19 июл",
  eventDate: "2026-07-19",
  time: "16:30",
  address: "ZŠ Demlova & park",
  participants: 2,
  capacity: 12,
  icon: "🏐",
  inviteUrl: "https://t.me/GOirl_bot?startapp=3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  city: "Оломоуц",
  organizer: "Vitalii Pashyn",
  durationMinutes: 90,
  price: 0,
  level: "Любитель",
  format: "Любительский",
  environment: "На улице",
  isSport: true,
  language: "ru",
};

describe("Telegram event share-card image", () => {
  it("renders the transparent original-card composition without visual action buttons", () => {
    const svg = buildTelegramShareCardSvg(card);
    expect(svg).toContain('width="1080" height="900"');
    expect(svg).toContain("Волейбол на ZŠ");
    expect(svg).toContain("&lt;вечером&gt;");
    expect(svg).toContain("ZŠ Demlova");
    expect(svg).toContain("&amp;");
    expect(svg).toContain("park");
    expect(svg).toContain("Vitalii Pashyn");
    expect(svg).toContain(">VP<");
    expect(svg).toContain('data-card-frame="expanded"');
    expect(svg).toContain('data-share-participants="two-row"');
    expect(svg).toContain('data-share-footer="two-row"');
    expect(svg).not.toContain("90 мин");
    expect(svg).not.toContain("Нужен тренер");
    expect(svg).not.toContain("Подробнее");
    expect(svg).not.toContain(">Открыть<");
    expect(svg).not.toContain('width="440" height="116"');
    expect(svg).not.toContain('width="230" height="230"');
    expect(svg).not.toContain("data-event-artwork");
    expect(svg).toContain("DejaVu Sans");
    expect(svg).not.toContain("Arial");
  });

  it("shows weather only when weather data is present", () => {
    const withoutWeather = buildTelegramShareCardSvg(card);
    expect(withoutWeather).not.toContain("19°C");
    expect(withoutWeather).not.toContain("60%");
    expect(withoutWeather).not.toContain("6 km/h");

    const withWeather = buildTelegramShareCardSvg({
      ...card,
      weather: { icon: "🌧️", temperature: 19, rain: 60, wind: 6 },
    });
    expect(withWeather).toContain("19°C");
    expect(withWeather).toContain("60%");
    expect(withWeather).toContain("6 km/h");
  });

  it("resolves approved category artwork as the full-card JPEG background", () => {
    expect(hasEventShareBackground(card)).toBe(true);
    expect(hasEventShareBackground({ ...card, activity: "Ролики", title: "Ролики" })).toBe(true);
    expect(hasEventShareBackground({ ...card, icon: "", activity: "Пользовательское событие", title: "Пользовательское событие" })).toBe(false);
  });

  it("bundles regular and bold Cyrillic fonts for serverless rendering", () => {
    const fonts = configureTelegramShareCardFonts();
    expect(fonts.regularFont).toMatch(/DejaVuSans\.ttf$/);
    expect(fonts.boldFont).toMatch(/DejaVuSans-Bold\.ttf$/);
    expect(existsSync(fonts.regularFont)).toBe(true);
    expect(existsSync(fonts.boldFont)).toBe(true);
    expect(existsSync(fonts.configFile)).toBe(true);
  });

  it("produces a Telegram-compatible JPEG with category image variation across the canvas", async () => {
    const jpeg = await renderTelegramShareCardJpeg(card);
    const metadata = await sharp(jpeg).metadata();
    const topLeftStats = await sharp(jpeg).extract({ left: 40, top: 40, width: 300, height: 260 }).stats();
    const bottomRightStats = await sharp(jpeg).extract({ left: 740, top: 560, width: 300, height: 260 }).stats();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(900);
    expect(jpeg.length).toBeLessThan(5 * 1024 * 1024);
    expect(topLeftStats.isOpaque).toBe(true);
    expect(bottomRightStats.isOpaque).toBe(true);
    expect(topLeftStats.channels.some((channel) => channel.stdev > 15)).toBe(true);
    expect(bottomRightStats.channels.some((channel) => channel.stdev > 15)).toBe(true);
  });

  it("uses leading emoji for background detection but removes it from visible text", () => {
    const languageCard = {
      ...card,
      icon: "",
      activity: "🗣️ Языковой обмен",
      title: "🗣️ Английский",
    };
    const telegramSvg = buildTelegramShareCardSvg(languageCard);
    const metaSvg = buildMetaInvitationCardSvg(languageCard);

    expect(hasEventShareBackground(languageCard)).toBe(true);
    expect(telegramSvg).toContain("Языковой обмен");
    expect(telegramSvg).toContain("Английский");
    expect(telegramSvg).not.toContain("🗣️");
    expect(metaSvg).toBe(telegramSvg);
  });

  it("renders the same transparent composition for Meta", async () => {
    const metaCard = {
      ...card,
      weather: { icon: "🌤️", temperature: 23, rain: 12, wind: 19 },
    };
    const svg = buildMetaInvitationCardSvg(metaCard);
    expect(svg).toContain("23°C");
    expect(svg).toContain("12%");
    expect(svg).toContain("19 km/h");
    expect(svg).not.toContain("data-event-artwork");
    expect(svg).toBe(buildTelegramShareCardSvg(metaCard));

    const jpeg = await renderMetaInvitationCardJpeg(metaCard);
    const metadata = await sharp(jpeg).metadata();
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(900);
    expect(jpeg.length).toBeLessThan(5 * 1024 * 1024);
  });
});
