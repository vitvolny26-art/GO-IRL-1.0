import { readEnv } from "../_shared/env.js";
import { buildTelegramEventCard } from "../_shared/telegram-event-card.js";
import { normalizeTelegramEventCardInput } from "../_shared/telegram-event-card-input.js";
import { createTelegramShareCardToken } from "../_shared/telegram-share-card-token.js";
import { TelegramInitDataValidationError, validateTelegramInitData } from "../../supabase/functions/_shared/telegramInitData.js";

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

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { error: "method_not_allowed" });
  }

  const botToken = readEnv("TELEGRAM_BOT_TOKEN");
  if (!botToken) return json(response, 503, { error: "telegram_share_unavailable" });

  let body: { initData?: unknown; card?: unknown } | null;
  try {
    body = await readBody(request) as typeof body;
  } catch {
    console.warn("telegram_share_invalid_json");
    return json(response, 400, { error: "invalid_share_request" });
  }

  const card = normalizeTelegramEventCardInput(body?.card);
  if (!body || typeof body.initData !== "string" || !card) {
    console.warn("telegram_share_invalid_request", { hasInitData: typeof body?.initData === "string", hasCard: Boolean(card) });
    return json(response, 400, { error: "invalid_share_request" });
  }

  let verified;
  try {
    verified = await validateTelegramInitData({ initData: body.initData, botToken });
  } catch (error) {
    const reason = error instanceof TelegramInitDataValidationError ? error.code : "unknown";
    console.warn("telegram_share_invalid_session", { reason });
    return json(response, 400, { error: "invalid_telegram_session" });
  }

  try {
    const imageToken = createTelegramShareCardToken(card, botToken);
    const imageUrl = `${publicOrigin()}/api/telegram/event-share-card?token=${encodeURIComponent(imageToken)}`;
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/savePreparedInlineMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: verified.user.id,
        result: buildTelegramEventCard(card, imageUrl),
        allow_user_chats: true,
        allow_bot_chats: false,
        allow_group_chats: true,
        allow_channel_chats: true,
      }),
    });
    const payload = await telegramResponse.json() as {
      ok?: boolean;
      result?: { id?: string; expiration_date?: number };
      description?: string;
    };
    if (!telegramResponse.ok || !payload.ok || !payload.result?.id) {
      console.warn("telegram_prepare_failed", { status: telegramResponse.status, description: payload.description || "unknown" });
      return json(response, 502, { error: "telegram_prepare_failed" });
    }
    return json(response, 200, {
      preparedMessageId: payload.result.id,
      expiresAt: payload.result.expiration_date,
    });
  } catch {
    console.error("telegram_prepare_exception");
    return json(response, 502, { error: "telegram_prepare_failed" });
  }
}
