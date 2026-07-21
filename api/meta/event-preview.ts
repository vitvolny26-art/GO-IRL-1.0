import { readEnv } from "../_shared/env.js";
import { loadTrustedTelegramEventCard, isShareEventId, isShareLanguage } from "../_shared/telegram-share-event.js";
import { createMetaInvitationCardToken } from "../_shared/telegram-share-card-token.js";

type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  end(body?: string): void;
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
};

const publicOrigin = () => {
  const host = readEnv("VERCEL_PROJECT_PRODUCTION_URL") || readEnv("VERCEL_URL");
  return host ? `https://${host.replace(/^https?:\/\//, "")}` : "https://go-irl-1-0.vercel.app";
};

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).end("method_not_allowed");
  }

  const eventId = first(request.query?.event);
  const language = first(request.query?.language) || "ru";
  if (!isShareEventId(eventId) || !isShareLanguage(language)) return response.status(404).end("not_found");

  try {
    const card = await loadTrustedTelegramEventCard(eventId, language);
    if (!card) return response.status(404).end("not_found");

    const origin = publicOrigin();
    const eventQuery = `event=${encodeURIComponent(card.eventId)}&language=${encodeURIComponent(card.language)}`;
    const canonicalUrl = `${origin}/api/meta/event-preview?${eventQuery}`;
    const addToCalendarUrl = `${origin}/api/meta/event-calendar?${eventQuery}`;
    const telegramUrl = card.inviteUrl;
    const secret = readEnv("META_APP_SECRET") || readEnv("INSTAGRAM_APP_SECRET");
    const imageUrl = secret
      ? `${origin}/api/meta/event-invitation-card?token=${encodeURIComponent(createMetaInvitationCardToken(card, secret))}&v=6`
      : `${origin}/brand/logo-wide.png`;
    const title = card.title || card.activity || "GO IRL";
    const description = [[card.date, card.time].filter(Boolean).join(" · "), card.address].filter(Boolean).join(" · ");

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    return response.status(200).end(`<!doctype html>
<html lang="${escapeHtml(card.language)}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="GO IRL" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(imageUrl)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
<style>
:root{color-scheme:dark;font-family:Inter,system-ui,sans-serif;background:#080b0d;color:#f7f8f9}*{box-sizing:border-box}body{margin:0;padding:24px;background:linear-gradient(180deg,#11171b,#080b0d);min-height:100vh}.wrap{max-width:680px;margin:0 auto}.card{background:#12181c;border:1px solid #2d383e;border-radius:24px;overflow:hidden;box-shadow:0 20px 70px #0008}.hero{width:100%;display:block;aspect-ratio:1200/630;object-fit:contain;background:#0a0e10}.content{padding:22px}h1{margin:0 0 10px;font-size:30px;line-height:1.15}.meta{color:#c8d0d5;font-size:17px;line-height:1.5;margin-bottom:20px}.actions{display:grid;gap:12px}.btn{display:block;text-align:center;text-decoration:none;border-radius:14px;padding:15px 18px;font-weight:800;font-size:17px}.primary{background:#c9ff3d;color:#101410}.secondary{background:#263038;color:#fff}
</style>
</head>
<body><main class="wrap"><article class="card">
<img class="hero" src="${escapeHtml(imageUrl)}" alt="" />
<div class="content"><h1>${escapeHtml(title)}</h1><div class="meta">${escapeHtml(description)}</div>
<div class="actions">
<a class="btn secondary" href="${escapeHtml(addToCalendarUrl)}">Добавить в календарь</a>
<a class="btn primary" href="${escapeHtml(telegramUrl)}">Присоединиться в Telegram</a>
</div></div></article></main></body></html>`);
  } catch {
    return response.status(503).end("preview_unavailable");
  }
}
