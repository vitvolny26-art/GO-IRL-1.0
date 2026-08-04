import { readEnv } from "../_shared/env.js";
import type { TelegramEventCardInput } from "../_shared/telegram-event-card.js";
import { isBeautyShareSlug, isShareLanguage, loadTrustedTelegramBeautyCard } from "../_shared/telegram-share-beauty.js";

type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  end(body?: string): void;
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
};

const fallbackOrigin = "https://go-irl-1-0.vercel.app";
const previewVersion = "1";
const trustedVercelHost = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i;

export const beautyPreviewCopy = {
  ru: { open: "Открыть профиль" },
  uk: { open: "Відкрити профіль" },
  cs: { open: "Otevřít profil" },
  en: { open: "Open profile" },
} as const;

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const normalizedHost = (value: string | string[] | undefined) => {
  const raw = first(value)?.split(",")[0]?.trim().toLowerCase() || "";
  return raw.replace(/^https?:\/\//, "").split("/")[0] || "";
};

export const resolveBeautyPreviewOrigin = (request: VercelRequest) => {
  const requestHost = normalizedHost(request.headers?.["x-forwarded-host"] || request.headers?.host);
  if (trustedVercelHost.test(requestHost)) return `https://${requestHost}`;

  const envHost = [readEnv("VERCEL_URL"), readEnv("VERCEL_PROJECT_PRODUCTION_URL")]
    .map((value) => normalizedHost(value))
    .find((value) => trustedVercelHost.test(value));
  return envHost ? `https://${envHost}` : fallbackOrigin;
};

const beautyQuery = (path: string, origin: string, slug: string, language: TelegramEventCardInput["language"], date: string) => {
  const url = new URL(path, origin);
  url.searchParams.set("slug", slug);
  url.searchParams.set("language", language);
  if (date) url.searchParams.set("date", date);
  url.searchParams.set("v", previewVersion);
  return url.toString();
};

export const buildBeautyPreviewMetadata = (
  card: TelegramEventCardInput,
  slug: string,
  origin: string,
) => {
  const title = card.activity || card.organizer || card.title || "GO IRL Beauty";
  const price = card.price > 0 ? `${Math.round(card.price)} Kč` : "";
  const description = [card.title, card.date, card.address, price].filter(Boolean).join(" · ");
  const canonicalUrl = beautyQuery("/api/meta/beauty-preview", origin, slug, card.language, card.date);
  const imageUrl = beautyQuery("/api/meta/beauty-invitation-card", origin, slug, card.language, card.date);
  const targetUrl = new URL(`/beauty/${encodeURIComponent(slug)}`, origin).toString();
  return {
    title,
    description,
    canonicalUrl,
    imageUrl,
    targetUrl,
    imageAlt: [title, card.title].filter(Boolean).join(" — "),
  };
};

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
    const origin = resolveBeautyPreviewOrigin(request);
    const card = await loadTrustedTelegramBeautyCard(slug, language, date, "", origin);
    if (!card) return response.status(404).end("not_found");

    const metadata = buildBeautyPreviewMetadata(card, slug, origin);
    const labels = beautyPreviewCopy[card.language];
    const redirectScript = JSON.stringify(metadata.targetUrl).replaceAll("<", "\\u003c");

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=60");
    response.setHeader("X-Content-Type-Options", "nosniff");
    return response.status(200).end(`<!doctype html>
<html lang="${escapeHtml(card.language)}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,follow" />
<title>${escapeHtml(metadata.title)}</title>
<meta name="description" content="${escapeHtml(metadata.description)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="GO IRL" />
<meta property="og:title" content="${escapeHtml(metadata.title)}" />
<meta property="og:description" content="${escapeHtml(metadata.description)}" />
<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}" />
<meta property="og:image:secure_url" content="${escapeHtml(metadata.imageUrl)}" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escapeHtml(metadata.imageAlt)}" />
<meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
<meta name="twitter:image" content="${escapeHtml(metadata.imageUrl)}" />
<style>:root{color-scheme:dark;font-family:Inter,system-ui,sans-serif;background:#080b0d;color:#f7f8f9}body{margin:0;display:grid;min-height:100vh;place-items:center;background:#080b0d}.card{width:min(680px,calc(100% - 32px));text-align:center}.card img{display:block;width:100%;border-radius:22px}.card a{display:inline-block;margin-top:18px;color:#c9ff3d;font-weight:800}</style>
</head>
<body><main class="card"><img src="${escapeHtml(metadata.imageUrl)}" alt="${escapeHtml(metadata.imageAlt)}" /><a href="${escapeHtml(metadata.targetUrl)}">${escapeHtml(labels.open)}</a></main><script>window.location.replace(${redirectScript});</script></body>
</html>`);
  } catch {
    return response.status(503).end("preview_unavailable");
  }
}
