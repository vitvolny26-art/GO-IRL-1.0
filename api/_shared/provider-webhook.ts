import { parseMetaMessagingTestPayload } from "../../src/meta-messaging/mock-webhook.js";
import type { MetaMessagingProvider } from "../../src/meta-messaging/types.js";
import { parseWhatsAppTestPayload } from "../../src/whatsapp/mock-webhook.js";
import { readEnv, requireEnv } from "./env.js";
import { verifyMetaSignature } from "./meta-signature.js";
import {
  getProviderEventSummary,
  joinProviderEvent,
  setProviderNotificationConsent,
} from "./provider-join-service.js";
import {
  sendMessengerWelcome,
  sendProviderInvitation,
  sendProviderJoinResult,
  sendProviderText,
  type MessagingProvider,
} from "./provider-messages.js";

type UnknownRecord = Record<string, unknown>;

type InboundAction = {
  id: string;
  providerUserId: string;
  displayName: string;
  text?: string;
  actionPayload?: string;
};

const asRecord = (value: unknown): UnknownRecord | null =>
  typeof value === "object" && value !== null ? value as UnknownRecord : null;

const asRecords = (value: unknown) => Array.isArray(value) ? value.map(asRecord).filter(Boolean) as UnknownRecord[] : [];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const stopCommands = new Set(["stop", "стоп", "отписаться", "отписка", "unsubscribe"]);
const startCommands = new Set(["start", "старт", "подписаться", "подписка", "subscribe"]);

export function classifyProviderConsentCommand(text?: string) {
  const normalized = text?.trim().toLocaleLowerCase("ru-RU") || "";
  if (stopCommands.has(normalized)) return "revoke" as const;
  if (startCommands.has(normalized)) return "consent" as const;
  return null;
}

function parseWhatsAppActions(payload: unknown): InboundAction[] {
  const root = asRecord(payload);
  const names = new Map<string, string>();
  for (const entry of asRecords(root?.entry)) {
    for (const change of asRecords(entry.changes)) {
      const value = asRecord(change.value);
      for (const contact of asRecords(value?.contacts)) {
        const profile = asRecord(contact.profile);
        if (typeof contact.wa_id === "string" && typeof profile?.name === "string") names.set(contact.wa_id, profile.name);
      }
    }
  }
  return parseWhatsAppTestPayload(payload).map((message) => ({
    id: message.id,
    providerUserId: message.from,
    displayName: names.get(message.from) || "WhatsApp User",
    text: message.text,
    actionPayload: message.replyId,
  }));
}

function parseMetaActions(provider: MetaMessagingProvider, payload: unknown): InboundAction[] {
  return parseMetaMessagingTestPayload(provider, payload).map((message) => ({
    id: message.id,
    providerUserId: message.senderId,
    displayName: provider === "instagram" ? "Instagram User" : "Messenger User",
    text: message.text,
    actionPayload: message.actionPayload,
  }));
}

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});

const providerSecret = (
  provider: MessagingProvider,
  instagramName: string,
  sharedName: string,
) => provider === "instagram"
  ? readEnv(instagramName) || requireEnv(sharedName)
  : requireEnv(sharedName);

async function processAction(provider: MessagingProvider, action: InboundAction) {
  const consentCommand = classifyProviderConsentCommand(action.text);
  if (consentCommand) {
    const consented = consentCommand === "consent";
    await setProviderNotificationConsent({
      provider,
      providerUserId: action.providerUserId,
      displayName: action.displayName,
      consented,
    });
    await sendProviderText(
      provider,
      action.providerUserId,
      consented
        ? "Уведомления GO IRL включены. Чтобы отключить их, отправьте СТОП."
        : "Уведомления GO IRL отключены. Чтобы включить их снова, отправьте СТАРТ.",
    );
    return;
  }
  if (!action.actionPayload) {
    if (provider === "messenger" && action.text?.trim()) {
      await sendMessengerWelcome(action.providerUserId);
    }
    return;
  }
  const separator = action.actionPayload.indexOf(":");
  if (separator < 1) return;
  const command = action.actionPayload.slice(0, separator);
  const eventId = action.actionPayload.slice(separator + 1);
  if (!uuidPattern.test(eventId)) return;

  if (command === "details") {
    const event = await getProviderEventSummary(eventId);
    if (event) await sendProviderInvitation(provider, action.providerUserId, event);
    return;
  }
  if (command !== "join") return;
  const result = await joinProviderEvent({
    provider,
    providerUserId: action.providerUserId,
    displayName: action.displayName,
    eventId,
  });
  await sendProviderJoinResult(provider, action.providerUserId, result);
}

export async function handleProviderWebhook(provider: MessagingProvider, request: Request) {
  if (request.method === "GET") {
    const query = new URL(request.url, "https://goirl.invalid").searchParams;
    const valid = query.get("hub.mode") === "subscribe"
      && query.get("hub.verify_token") === providerSecret(
        provider,
        "INSTAGRAM_VERIFY_TOKEN",
        "META_VERIFY_TOKEN",
      )
      && Boolean(query.get("hub.challenge"));
    return valid
      ? new Response(query.get("hub.challenge"), { status: 200 })
      : jsonResponse({ error: "verification_failed" }, 403);
  }

  if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256") || "";
  if (!await verifyMetaSignature(rawBody, signature, providerSecret(
    provider,
    "INSTAGRAM_APP_SECRET",
    "META_APP_SECRET",
  ))) {
    return jsonResponse({ error: "invalid_signature" }, 401);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }
  const actions = provider === "whatsapp"
    ? parseWhatsAppActions(payload)
    : parseMetaActions(provider, payload);
  const results = await Promise.allSettled(actions.map((action) => processAction(provider, action)));
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length) return jsonResponse({ error: "processing_failed", failed: failures.length }, 500);
  return jsonResponse({ received: actions.length });
}
