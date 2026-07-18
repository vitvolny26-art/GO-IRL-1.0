import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import type { TelegramEventCardInput } from "./telegram-event-card.js";
import { resolveEventShareBackgroundUrl } from "./event-share-backgrounds.js";
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

export const hasEventShareBackground = (input: TelegramEventCardInput) => {
  const backgroundUrl = resolveEventShareBackgroundUrl(input);
  return Boolean(backgroundUrl && existsSync(backgroundUrl));
};

const renderShareCardJpeg = async (svg: string, input: TelegramEventCardInput) => {
  const sharp = await loadSharp();
  const backgroundUrl = resolveEventShareBackgroundUrl(input);

  if (backgroundUrl && existsSync(backgroundUrl)) {
    return sharp(readFileSync(backgroundUrl))
      .resize(1080, 900, { fit: "cover", position: "attention" })
      .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
      .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
      .toBuffer();
  }

  return sharp(Buffer.from(svg))
    .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
    .toBuffer();
};

export const renderTelegramShareCardJpeg = (input: TelegramEventCardInput) =>
  renderShareCardJpeg(buildTelegramShareCardSvg(input), input);

export const renderMetaInvitationCardJpeg = (input: TelegramEventCardInput) =>
  renderShareCardJpeg(buildMetaInvitationCardSvg(input), input);
