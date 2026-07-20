import type { JoinResult } from "../../src/join/types.js";
import {
  buildInstagramInvitationPayload,
  buildMessengerInvitationPayload,
  buildMessengerWelcomePayload,
  buildMetaJoinResultPayload,
} from "../../src/meta-messaging/payload-builders.js";
import type { MetaEventSummary, MetaMessagingProvider } from "../../src/meta-messaging/types.js";
import {
  buildWhatsAppInvitationPayload,
  buildWhatsAppJoinResultPayload,
} from "../../src/whatsapp/payload-builders.js";
import { readEnv, requireEnv } from "./env.js";
import type { TelegramEventCardInput } from "./telegram-event-card.js";
import { createMetaInvitationCardToken } from "./telegram-share-card-token.js";

export type MessagingProvider = "whatsapp" | MetaMessagingProvider;

const graphUrl = (path: string) =>
  `https://graph.facebook.com/${requireEnv("META_GRAPH_VERSION")}/${path}`;

const instagramMessagesUrl = () => readEnv("INSTAGRAM_API_MODE") === "instagram_login"
  ? `https://graph.instagram.com/${requireEnv("META_GRAPH_VERSION")}/me/messages`
  : graphUrl(`${requireEnv("INSTAGRAM_ACCOUNT_ID")}/messages`);

async function sendGraphPayload(url: string, token: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`meta_send_failed:${response.status}:${errorText.slice(0, 300)}`);
  }
}

const publicOrigin = () => {
  const host = readEnv("VERCEL_PROJECT_PRODUCTION_URL") || readEnv("VERCEL_URL");
  if (!host) return "";
  try {
    const url = new URL(host.startsWith("http") ? host : `https://${host}`);
    return url.protocol === "https:" ? url.origin : "";
  } catch {
    return "";
  }
};

const invitationCardInput = (event: MetaEventSummary): TelegramEventCardInput => ({
  eventId: event.eventId,
  title: event.title,
  activity: event.activity || event.title,
  date: event.date || event.dateTime,
  time: event.time || "",
  address: event.location,
  participants: event.participants ?? Math.max((event.capacity || 0) - event.availableSpots, 0),
  capacity: event.capacity ?? event.availableSpots,
  icon: event.icon || "вњЁ",
  inviteUrl: event.inviteUrl || "",
  mapUrl: event.mapUrl,
  city: event.city || event.location,
  durationMinutes: event.durationMinutes,
  price: event.price || 0,
  level: event.level || "Р”Р»СЏ РІСЃРµС…",
  format: event.format || "РћС‚РєСЂС‹С‚Рѕ",
  environment: event.environment || "Р’ РіРѕСЂРѕРґРµ",
  isSport: event.isSport,
  weather: event.weather,
  language: event.language || "ru",
});

const withInvitationImage = (provider: MessagingProvider, event: MetaEventSummary): MetaEventSummary => {
  if (event.imageUrl) return event;
  const origin = publicOrigin();
  const secret = provider === "instagram"
    ? readEnv("INSTAGRAM_APP_SECRET") || readEnv("META_APP_SECRET")
    : readEnv("META_APP_SECRET");
  if (!origin || !secret) return event;
  const token = createMetaInvitationCardToken(invitationCardInput(event), secret);
  return { ...event, imageUrl: `${origin}/api/meta/event-invitation-card?token=${encodeURIComponent(token)}` };
};

export async function sendProviderInvitation(
  provider: MessagingProvider,
  recipientId: string,
  event: MetaEventSummary,
) {
  const invitation = withInvitationImage(provider, event);
  if (provider === "whatsapp") {
    return sendGraphPayload(
      graphUrl(`${requireEnv("WHATSAPP_PHONE_NUMBER_ID")}/messages`),
      requireEnv("WHATSAPP_ACCESS_TOKEN"),
      buildWhatsAppInvitationPayload(recipientId, invitation),
    );
  }
  if (provider === "instagram") {
    return sendGraphPayload(
      instagramMessagesUrl(),
      requireEnv("INSTAGRAM_ACCESS_TOKEN"),
      buildInstagramInvitationPayload(recipientId, invitation),
    );
  }
  return sendGraphPayload(
    graphUrl(`${requireEnv("MESSENGER_PAGE_ID")}/messages`),
    requireEnv("MESSENGER_PAGE_ACCESS_TOKEN"),
    buildMessengerInvitationPayload(recipientId, invitation),
  );
}

export async function sendProviderJoinResult(
  provider: MessagingProvider,
  recipientId: string,
  result: JoinResult,
) {
  if (provider === "whatsapp") {
    const built = buildWhatsAppJoinResultPayload(recipientId, result);
    const { join_status: _joinStatus, ...payload } = built;
    void _joinStatus;
    return sendGraphPayload(
      graphUrl(`${requireEnv("WHATSAPP_PHONE_NUMBER_ID")}/messages`),
      requireEnv("WHATSAPP_ACCESS_TOKEN"),
      payload,
    );
  }

  const built = buildMetaJoinResultPayload(provider, recipientId, result);
  const payload = provider === "messenger"
    ? { messaging_type: "RESPONSE", recipient: built.recipient, message: built.message }
    : { recipient: built.recipient, message: built.message };
  return sendGraphPayload(
    provider === "instagram" ? instagramMessagesUrl() : graphUrl(`${requireEnv("MESSENGER_PAGE_ID")}/messages`),
    provider === "instagram" ? requireEnv("INSTAGRAM_ACCESS_TOKEN") : requireEnv("MESSENGER_PAGE_ACCESS_TOKEN"),
    payload,
  );
}

export async function sendMessengerWelcome(recipientId: string) {
  const origin = publicOrigin();
  if (!origin) throw new Error("messenger_public_origin_missing");
  return sendGraphPayload(
    graphUrl(`${requireEnv("MESSENGER_PAGE_ID")}/messages`),
    requireEnv("MESSENGER_PAGE_ACCESS_TOKEN"),
    buildMessengerWelcomePayload(recipientId, origin),
  );
}

