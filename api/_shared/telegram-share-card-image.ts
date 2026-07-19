import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import type { TelegramEventCardInput } from "./telegram-event-card.js";
import { resolveEventShareBackgroundUrl } from "./event-share-backgrounds.js";
import { buildMetaInvitationCardSvg, buildTelegramShareCardSvg } from "./telegram-share-card-svg.js";
import { readEnv } from "./env.js";

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

const trustedTelegramAvatarHosts = ["t.me", "telegram.org", "telegram-cdn.org"];

export const isTrustedOrganizerAvatarUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (trustedTelegramAvatarHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return true;
    const supabaseUrl = readEnv("SUPABASE_URL");
    return Boolean(supabaseUrl && url.hostname === new URL(supabaseUrl).hostname);
  } catch {
    return false;
  }
};

const loadOrganizerAvatar = async (value?: string) => {
  if (!value || !isTrustedOrganizerAvatarUrl(value)) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);
  try {
    const response = await fetch(value, { signal: controller.signal, redirect: "follow" });
    if (!response.ok) return null;
    const length = Number(response.headers.get("content-length") || 0);
    if (length > 2_000_000) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 2_000_000) return null;
    const sharp = await loadSharp();
    const mask = Buffer.from('<svg width="128" height="128"><rect width="128" height="128" rx="26" fill="white"/></svg>');
    return sharp(bytes)
      .resize(128, 128, { fit: "cover", position: "attention" })
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const renderShareCardJpeg = async (svg: string, input: TelegramEventCardInput) => {
  const sharp = await loadSharp();
  const backgroundUrl = resolveEventShareBackgroundUrl(input);
  const organizerAvatar = await loadOrganizerAvatar(input.organizerAvatarUrl);
  const overlays = [{ input: Buffer.from(svg), left: 0, top: 0 }, ...(organizerAvatar ? [{ input: organizerAvatar, left: 78, top: 716 }] : [])];

  if (backgroundUrl && existsSync(backgroundUrl)) {
    return sharp(readFileSync(backgroundUrl))
      .resize(1080, 900, { fit: "cover", position: "attention" })
      .composite(overlays)
      .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
      .toBuffer();
  }

  return sharp(Buffer.from(svg))
    .composite(organizerAvatar ? [{ input: organizerAvatar, left: 78, top: 716 }] : [])
    .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
    .toBuffer();
};

export const renderTelegramShareCardJpeg = (input: TelegramEventCardInput) =>
  renderShareCardJpeg(buildTelegramShareCardSvg(input), input);

export const renderMetaInvitationCardJpeg = (input: TelegramEventCardInput) =>
  renderShareCardJpeg(buildMetaInvitationCardSvg(input), input);
