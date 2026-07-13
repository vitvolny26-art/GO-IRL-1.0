import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import type { TelegramEventCardInput } from "./telegram-event-card.js";
import { buildTelegramShareCardSvg } from "./telegram-share-card-svg.js";

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

export const renderTelegramShareCardJpeg = async (input: TelegramEventCardInput) => {
  const sharp = await loadSharp();
  return sharp(Buffer.from(buildTelegramShareCardSvg(input)))
    .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
    .toBuffer();
};
