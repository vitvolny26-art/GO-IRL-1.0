import type { JoinResult } from "../../src/join/types.js";
import {
  buildInstagramInvitationPayload,
  buildMessengerInvitationPayload,
  buildMetaJoinResultPayload,
} from "../../src/meta-messaging/payload-builders.js";
import type { MetaEventSummary, MetaMessagingProvider } from "../../src/meta-messaging/types.js";
import {
  buildWhatsAppInvitationPayload,
  buildWhatsAppJoinResultPayload,
} from "../../src/whatsapp/payload-builders.js";
import { readEnv, requireEnv } from "./env.js";

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

export async function sendProviderInvitation(
  provider: MessagingProvider,
  recipientId: string,
  event: MetaEventSummary,
) {
  if (provider === "whatsapp") {
    return sendGraphPayload(
      graphUrl(`${requireEnv("WHATSAPP_PHONE_NUMBER_ID")}/messages`),
      requireEnv("WHATSAPP_ACCESS_TOKEN"),
      buildWhatsAppInvitationPayload(recipientId, event),
    );
  }
  if (provider === "instagram") {
    return sendGraphPayload(
      instagramMessagesUrl(),
      requireEnv("INSTAGRAM_ACCESS_TOKEN"),
      buildInstagramInvitationPayload(recipientId, event),
    );
  }
  return sendGraphPayload(
    graphUrl(`${requireEnv("MESSENGER_PAGE_ID")}/messages`),
    requireEnv("MESSENGER_PAGE_ACCESS_TOKEN"),
    buildMessengerInvitationPayload(recipientId, event),
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
