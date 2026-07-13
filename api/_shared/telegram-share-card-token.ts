import { createHmac, timingSafeEqual } from "node:crypto";
import type { TelegramEventCardInput } from "./telegram-event-card.js";

type ShareCardTokenPayload = {
  card: TelegramEventCardInput;
  expiresAt: number;
};

const signatureFor = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export function createTelegramShareCardToken(
  card: TelegramEventCardInput,
  secret: string,
  now = Date.now(),
) {
  const payload = Buffer.from(JSON.stringify({ card, expiresAt: now + 60 * 60 * 1000 } satisfies ShareCardTokenPayload))
    .toString("base64url");
  return `${payload}.${signatureFor(payload, secret)}`;
}

export function readTelegramShareCardToken(token: string, secret: string, now = Date.now()) {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expected = signatureFor(payload, secret);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ShareCardTokenPayload;
    if (!parsed.card || !Number.isFinite(parsed.expiresAt) || parsed.expiresAt < now) return null;
    return parsed.card;
  } catch {
    return null;
  }
}
