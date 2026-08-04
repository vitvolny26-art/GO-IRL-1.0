import { readEnv } from "../_shared/env.js";
import { renderMetaInvitationCardJpeg } from "../_shared/telegram-share-card-image.js";
import { readMetaInvitationCardToken } from "../_shared/telegram-share-card-token.js";
import { isShareEventId, isShareLanguage, loadTrustedTelegramEventCard } from "../_shared/telegram-share-event.js";

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

  const eventId = first(request.query?.event);
  const language = first(request.query?.language) || "ru";
  const rawToken = first(request.query?.token);

  try {
    let card = null;

    if (isShareEventId(eventId) && isShareLanguage(language)) {
      card = await loadTrustedTelegramEventCard(eventId, language);
    } else if (rawToken && rawToken.length <= 8_000) {
      const secrets = [readEnv("META_APP_SECRET"), readEnv("INSTAGRAM_APP_SECRET")].filter(Boolean);
      card = secrets.reduce<ReturnType<typeof readMetaInvitationCardToken>>(
        (result, secret) => result || readMetaInvitationCardToken(rawToken, secret),
        null,
      );
    }

    if (!card) return response.status(404).end("not_found");

    const jpeg = await renderMetaInvitationCardJpeg(card);
    response.setHeader("Content-Type", "image/jpeg");
    response.setHeader("Content-Length", String(jpeg.length));
    response.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    return response.status(200).end(jpeg);
  } catch {
    return response.status(500).end("render_failed");
  }
}
