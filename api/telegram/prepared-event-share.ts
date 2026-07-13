import { readEnv } from "../_shared/env.js";
import { buildTelegramEventCard, type TelegramEventCardInput } from "../_shared/telegram-event-card.js";
import { createTelegramShareCardToken } from "../_shared/telegram-share-card-token.js";
import { validateTelegramInitData } from "../../supabase/functions/_shared/telegramInitData.js";

type VercelRequest = {
  method?: string;
  body?: unknown;
  [Symbol.asyncIterator]?(): AsyncIterator<Uint8Array | string>;
};

type VercelResponse = {
  end(body?: string): void;
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isSafeInviteUrl = (value: unknown, eventId: string) => {
  if (typeof value !== "string" || value.length > 500) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && url.hostname === "t.me"
      && url.searchParams.get("startapp") === eventId;
  } catch {
    return false;
  }
};

const isSafeMapUrl = (value: unknown) => {
  if (value === undefined || value === "") return true;
  if (typeof value !== "string" || value.length > 500) return false;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLocaleLowerCase();
    return url.protocol === "https:" && (
      hostname === "mapy.cz"
      || hostname.endsWith(".mapy.cz")
      || hostname === "maps.app.goo.gl"
      || hostname === "google.com"
      || hostname.endsWith(".google.com")
    );
  } catch {
    return false;
  }
};

const publicOrigin = () => {
  const host = readEnv("VERCEL_URL") || readEnv("VERCEL_PROJECT_PRODUCTION_URL");
  return host ? `https://${host.replace(/^https?:\/\//, "")}` : "https://go-irl-1-0.vercel.app";
};

const json = (response: VercelResponse, status: number, payload: unknown) => {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.status(status).end(JSON.stringify(payload));
};

async function readBody(request: VercelRequest) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body) as unknown;
  if (!request[Symbol.asyncIterator]) return null;
  const decoder = new TextDecoder();
  let raw = "";
  for await (const chunk of request as Required<Pick<VercelRequest, typeof Symbol.asyncIterator>>) {
    raw += typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
  }
  raw += decoder.decode();
  return raw ? JSON.parse(raw) as unknown : null;
}

const isSafeCard = (value: unknown): value is TelegramEventCardInput => {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<TelegramEventCardInput>;
  return Boolean(
    typeof card.eventId === "string" && uuidPattern.test(card.eventId)
    && typeof card.title === "string" && card.title.length <= 240
    && typeof card.activity === "string" && card.activity.length <= 240
    && typeof card.date === "string" && card.date.length <= 40
    && typeof card.time === "string" && card.time.length <= 20
    && typeof card.address === "string" && card.address.length <= 300
    && typeof card.icon === "string" && card.icon.length <= 24
    && isSafeInviteUrl(card.inviteUrl, card.eventId)
    && isSafeMapUrl(card.mapUrl)
    && typeof card.city === "string" && card.city.length <= 100
    && (card.durationMinutes === undefined || (Number.isFinite(card.durationMinutes) && card.durationMinutes >= 15 && card.durationMinutes <= 480))
    && Number.isFinite(card.price) && card.price >= 0 && card.price <= 100_000
    && typeof card.level === "string" && card.level.length <= 80
    && typeof card.format === "string" && card.format.length <= 80
    && typeof card.environment === "string" && card.environment.length <= 80
    && (card.weather === undefined || (
      typeof card.weather === "object"
      && typeof card.weather.icon === "string" && card.weather.icon.length <= 12
      && Number.isFinite(card.weather.temperature) && card.weather.temperature >= -80 && card.weather.temperature <= 80
      && Number.isFinite(card.weather.rain) && card.weather.rain >= 0 && card.weather.rain <= 100
      && Number.isFinite(card.weather.wind) && card.weather.wind >= 0 && card.weather.wind <= 300
    ))
    && Number.isFinite(card.participants)
    && Number.isFinite(card.capacity)
    && ["ru", "uk", "cs", "en"].includes(String(card.language)),
  );
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { error: "method_not_allowed" });
  }

  const botToken = readEnv("TELEGRAM_BOT_TOKEN");
  if (!botToken) return json(response, 503, { error: "telegram_share_unavailable" });

  try {
    const body = await readBody(request) as { initData?: unknown; card?: unknown } | null;
    if (!body || typeof body.initData !== "string" || !isSafeCard(body.card)) {
      return json(response, 400, { error: "invalid_share_request" });
    }

    const verified = await validateTelegramInitData({ initData: body.initData, botToken });
    const imageToken = createTelegramShareCardToken(body.card, botToken);
    const imageUrl = `${publicOrigin()}/api/telegram/event-share-card?token=${encodeURIComponent(imageToken)}`;
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/savePreparedInlineMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: verified.user.id,
        result: buildTelegramEventCard(body.card, imageUrl),
        allow_user_chats: true,
        allow_bot_chats: false,
        allow_group_chats: true,
        allow_channel_chats: true,
      }),
    });
    const payload = await telegramResponse.json() as {
      ok?: boolean;
      result?: { id?: string; expiration_date?: number };
    };
    if (!telegramResponse.ok || !payload.ok || !payload.result?.id) {
      return json(response, 502, { error: "telegram_prepare_failed" });
    }
    return json(response, 200, {
      preparedMessageId: payload.result.id,
      expiresAt: payload.result.expiration_date,
    });
  } catch {
    return json(response, 400, { error: "invalid_telegram_session" });
  }
}
