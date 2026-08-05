import { readEnv } from "../_shared/env.js";
import { isBeautyShareSlug, isShareLanguage, loadTrustedTelegramBeautyCard } from "../_shared/telegram-share-beauty.js";
import { renderTelegramBeautyShareCardJpeg } from "../_shared/telegram-share-card-image.js";

type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  end(body?: string | Uint8Array): void;
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
};

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const publicOrigin = () => {
  const host = readEnv("VERCEL_ENV") === "preview"
    ? readEnv("VERCEL_URL") || readEnv("VERCEL_PROJECT_PRODUCTION_URL")
    : readEnv("VERCEL_PROJECT_PRODUCTION_URL") || readEnv("VERCEL_URL");
  return host ? `https://${host.replace(/^https?:\/\//, "")}` : "https://go-irl-1-0.vercel.app";
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).end("method_not_allowed");
  }

  const slug = first(request.query?.slug);
  const language = first(request.query?.language) || "ru";
  const date = first(request.query?.date) || "";
  if (!isBeautyShareSlug(slug) || !isShareLanguage(language) || date.length > 80) {
    return response.status(404).end("not_found");
  }

  try {
    const card = await loadTrustedTelegramBeautyCard(slug, language, date, "", publicOrigin());
    if (!card) return response.status(404).end("not_found");
    const jpeg = await renderTelegramBeautyShareCardJpeg(card);
    response.setHeader("Content-Type", "image/jpeg");
    response.setHeader("Content-Length", String(jpeg.length));
    response.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    response.setHeader("Access-Control-Allow-Origin", "*");
    return response.status(200).end(jpeg);
  } catch {
    return response.status(503).end("preview_unavailable");
  }
}
