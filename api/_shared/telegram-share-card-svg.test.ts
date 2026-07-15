import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { buildMetaInvitationCardSvg, buildTelegramShareCardSvg } from "./telegram-share-card-svg";
import { configureTelegramShareCardFonts, hasBetaEventIllustration, renderMetaInvitationCardJpeg, renderTelegramShareCardJpeg } from "./telegram-share-card-image";
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

  it("keeps the SVG renderer self-contained and overlays beta illustrations only in JPEG rendering", () => {
    const svg = buildTelegramShareCardSvg(card);
    expect(svg).toContain('data-event-artwork="VB"');
    expect(svg).not.toContain("<image");
    expect(svg).not.toContain("data:image/png;base64,");
    expect(hasBetaEventIllustration(card)).toBe(true);
    expect(hasBetaEventIllustration({ ...card, icon: "🛼", activity: "Ролики", title: "Ролики" })).toBe(false);
  });

  it("bundles regular and bold Cyrillic fonts for serverless rendering", () => {
    const fonts = configureTelegramShareCardFonts();
    expect(fonts.regularFont).toMatch(/DejaVuSans\.ttf$/);
    expect(fonts.boldFont).toMatch(/DejaVuSans-Bold\.ttf$/);
    expect(existsSync(fonts.regularFont)).toBe(true);
    expect(existsSync(fonts.boldFont)).toBe(true);
    expect(existsSync(fonts.configFile)).toBe(true);
  });

  it("produces a Telegram-compatible JPEG with the illustration composite", async () => {
    const jpeg = await renderTelegramShareCardJpeg(card);
    const metadata = await sharp(jpeg).metadata();
    const tileStats = await sharp(jpeg).extract({ left: 76, top: 76, width: 230, height: 230 }).stats();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(900);
    expect(jpeg.length).toBeLessThan(5 * 1024 * 1024);
    expect(tileStats.isOpaque).toBe(true);
    expect(tileStats.channels.some((channel) => channel.stdev > 25)).toBe(true);
  });

  it.each([
    ["🏐", "Волейбол", "VB"],
    ["🛼", "Ролики", "SK"],
    ["♟️", "Шахматы", "CH"],
    ["", "Пользовательское событие", "EV"],
  ])("uses artwork code %s/%s -> %s", (icon, activity, code) => {
    const svg = buildTelegramShareCardSvg({ ...card, icon, activity, title: activity });
    expect(svg).toContain(`data-event-artwork="${code}"`);
  });

  it("uses leading emoji for artwork detection but removes it from visible text", () => {
    const languageCard = {
      ...card,
      icon: "",
      activity: "🗣️ Языковой обмен",
      title: "🗣️ Английский",
    };
    const telegramSvg = buildTelegramShareCardSvg(languageCard);
    const metaSvg = buildMetaInvitationCardSvg(languageCard);

    expect(telegramSvg).toContain('data-event-artwork="LX"');
    expect(telegramSvg).toContain("Языковой обмен");
    expect(telegramSvg).toContain("Английский");
    expect(telegramSvg).not.toContain("🗣️");
    expect(metaSvg).toBe(telegramSvg);
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
    expect(svg).toContain('data-event-artwork="VB"');
    expect(svg).toBe(buildTelegramShareCardSvg(metaCard));

    const jpeg = await renderMetaInvitationCardJpeg(metaCard);
    const metadata = await sharp(jpeg).metadata();
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(900);
    expect(jpeg.length).toBeLessThan(5 * 1024 * 1024);
  });
});
