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

const htmlEscape = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const firstQueryValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).end("method_not_allowed");
  }

  const eventId = firstQueryValue(request.query?.event);
  const languageValue = firstQueryValue(request.query?.language) || "ru";
  if (!isShareEventId(eventId) || !isShareLanguage(languageValue)) {
    return response.status(404).end("not_found");
  }

  try {
    const card = await loadTrustedTelegramEventCard(eventId, languageValue);
    if (!card) return response.status(404).end("not_found");

    const secret = readEnv("META_APP_SECRET") || readEnv("INSTAGRAM_APP_SECRET");
    const origin = publicOrigin();
    const imageUrl = secret
      ? `${origin}/api/meta/event-invitation-card?token=${encodeURIComponent(createMetaInvitationCardToken(card, secret))}&v=4`
      : `${origin}/brand/logo-wide.png`;
    const title = card.title || card.activity || "GO IRL";
    const description = [[card.date, card.time].filter(Boolean).join(" · "), card.address].filter(Boolean).join(" · ");
    const inviteUrl = card.inviteUrl;
    const canonicalUrl = `${origin}/api/meta/event-preview?event=${encodeURIComponent(card.eventId)}&language=${encodeURIComponent(card.language)}`;

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    return response.status(200).end(`<!doctype html>
<html lang="${htmlEscape(card.language)}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${htmlEscape(title)}</title>
<meta name="description" content="${htmlEscape(description)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="GO IRL" />
<meta property="og:title" content="${htmlEscape(title)}" />
<meta property="og:description" content="${htmlEscape(description)}" />
<meta property="og:image" content="${htmlEscape(imageUrl)}" />
<meta property="og:image:width" content="1080" />
<meta property="og:image:height" content="900" />
<meta property="og:url" content="${htmlEscape(canonicalUrl)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${htmlEscape(title)}" />
<meta name="twitter:description" content="${htmlEscape(description)}" />
<meta name="twitter:image" content="${htmlEscape(imageUrl)}" />
</head>
<body>
<p><a href="${htmlEscape(inviteUrl)}">Open GO IRL event</a></p>
<script>window.location.replace(${JSON.stringify(inviteUrl)});</script>
</body>
</html>`);
  } catch {
    return response.status(503).end("preview_unavailable");
  }
}
