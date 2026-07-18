import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import type { TelegramEventCardInput } from "./telegram-event-card.js";
import { resolveEventArtworkCode } from "./event-artwork.js";
import { resolveEventShareBackgroundUrl } from "./event-share-backgrounds.js";
import { betaEventIllustrationSpriteBase64, betaEventIllustrationTiles } from "./event-illustration-sprite.js";
import { buildMetaInvitationCardSvg, buildTelegramShareCardSvg } from "./telegram-share-card-svg.js";

const require = createRequire(import.meta.url);
let sharpPromise: Promise<typeof import("sharp").default> | null = null;

const xml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

export function configureTelegramShareCardFonts() {
  const regularFont = require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans.ttf");
  const boldFont = require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf");
  const configDirectory = join(tmpdir(), "go-irl-fontconfig");
  const cacheDirectory = join(configDirectory, "cache");
  const configFile = join(configDirectory, "fonts.conf");

  mkdirSync(cacheDirectory, { recursive: true });
  writeFileSync(configFile, `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>${xml(dirname(regularFont))}</dir>
  <cachedir>${xml(cacheDirectory)}</cachedir>
  <alias><family>sans-serif</family><prefer><family>DejaVu Sans</family></prefer></alias>
  <alias><family>Arial</family><prefer><family>DejaVu Sans</family></prefer></alias>
  <alias><family>Segoe UI Emoji</family><prefer><family>DejaVu Sans</family></prefer></alias>
</fontconfig>`, "utf8");

  process.env.FONTCONFIG_PATH = configDirectory;
  process.env.FONTCONFIG_FILE = configFile;
  return { regularFont, boldFont, configFile };
}

const loadSharp = () => {
  configureTelegramShareCardFonts();
  sharpPromise ||= import("sharp").then((module) => module.default);
  return sharpPromise;
};

const spriteBuffer = Buffer.from(betaEventIllustrationSpriteBase64, "base64");
const illustrationMask = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="230" height="230"><rect width="230" height="230" rx="58" fill="white"/></svg>',
);

export const hasBetaEventIllustration = (input: TelegramEventCardInput) => {
  const code = resolveEventArtworkCode(input);
  return code in betaEventIllustrationTiles;
};

export const hasEventShareBackground = (input: TelegramEventCardInput) => {
  const backgroundUrl = resolveEventShareBackgroundUrl(input);
  return Boolean(backgroundUrl && existsSync(backgroundUrl));
};

const renderArtworkTile = async (sharp: typeof import("sharp").default, input: TelegramEventCardInput) => {
  const backgroundUrl = resolveEventShareBackgroundUrl(input);
  if (backgroundUrl && existsSync(backgroundUrl)) {
    return sharp(readFileSync(backgroundUrl))
      .resize(230, 230, { fit: "cover" })
      .composite([{ input: illustrationMask, blend: "dest-in" }])
      .png()
      .toBuffer();
  }

  const code = resolveEventArtworkCode(input) as keyof typeof betaEventIllustrationTiles;
  const tile = betaEventIllustrationTiles[code];
  if (!tile) return null;

  return sharp(spriteBuffer)
    .extract({ left: tile.left, top: tile.top, width: 96, height: 96 })
    .resize(230, 230, { fit: "cover" })
    .composite([{ input: illustrationMask, blend: "dest-in" }])
    .png()
    .toBuffer();
};

const renderShareCardJpeg = async (svg: string, input: TelegramEventCardInput) => {
  const sharp = await loadSharp();
  const image = sharp(Buffer.from(svg));
  const artworkTile = await renderArtworkTile(sharp, input);

  if (artworkTile) {
    image.composite([{ input: artworkTile, left: 76, top: 76 }]);
  }

  return image
    .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
    .toBuffer();
};

export const renderTelegramShareCardJpeg = (input: TelegramEventCardInput) =>
  renderShareCardJpeg(buildTelegramShareCardSvg(input), input);

export const renderMetaInvitationCardJpeg = (input: TelegramEventCardInput) =>
  renderShareCardJpeg(buildMetaInvitationCardSvg(input), input);
