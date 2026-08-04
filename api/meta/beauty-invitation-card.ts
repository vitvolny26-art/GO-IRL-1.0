import { renderMetaInvitationCardJpeg } from "../_shared/telegram-share-card-image.js";
import { isBeautyShareSlug, isShareLanguage, loadTrustedTelegramBeautyCard } from "../_shared/telegram-share-beauty.js";

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

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).end("method_not_allowed");
  }

  const slug = String(first(request.query?.slug) || "").trim().toLowerCase();
  const language = String(first(request.query?.language) || "ru").trim().toLowerCase();
  const date = String(first(request.query?.date) || "").trim().slice(0, 64);
  if (!isBeautyShareSlug(slug) || !isShareLanguage(language)) return response.status(404).end("not_found");

  try {
    const card = await loadTrustedTelegramBeautyCard(slug, language, date, "", "");
    if (!card) return response.status(404).end("not_found");

    const jpeg = await renderMetaInvitationCardJpeg(card);
    response.setHeader("Content-Type", "image/jpeg");
    response.setHeader("Content-Length", String(jpeg.length));
    response.setHeader("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=60");
    response.setHeader("X-Content-Type-Options", "nosniff");
    return response.status(200).end(jpeg);
  } catch {
    return response.status(503).end("render_unavailable");
  }
}
