import type { MetaMessagingProvider } from "./types.js";

export type MetaMockWebhookRequest = {
  method: string;
  url: string;
  body?: unknown;
};

export type ParsedMetaMessage = {
  provider: MetaMessagingProvider;
  id: string;
  senderId: string;
  text?: string;
  actionPayload?: string;
};

export type MetaMockWebhookResponse = {
  status: number;
  body: string | { error: string } | { received: number; messages: ParsedMetaMessage[] };
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
  typeof value === "object" && value !== null ? value as UnknownRecord : null;

const asRecords = (value: unknown) => Array.isArray(value) ? value.map(asRecord).filter(Boolean) as UnknownRecord[] : [];

export function parseMetaMessagingTestPayload(
  provider: MetaMessagingProvider,
  payload: unknown,
): ParsedMetaMessage[] {
  const root = asRecord(payload);
  return asRecords(root?.entry).flatMap((entry) =>
    asRecords(entry.messaging).flatMap((event) => {
      const sender = asRecord(event.sender);
      const message = asRecord(event.message);
      const quickReply = asRecord(message?.quick_reply);
      const postback = asRecord(event.postback);
      const senderId = typeof sender?.id === "string" ? sender.id : "";
      const id = typeof message?.mid === "string"
        ? message.mid
        : typeof event.timestamp === "number"
          ? `${provider}:${senderId}:${event.timestamp}`
          : "";
      if (!senderId || !id || message?.is_echo === true) return [];
      return [{
        provider,
        id,
        senderId,
        ...(typeof message?.text === "string" ? { text: message.text } : {}),
        ...(typeof quickReply?.payload === "string"
          ? { actionPayload: quickReply.payload }
          : typeof postback?.payload === "string"
            ? { actionPayload: postback.payload }
            : {}),
      }];
    }),
  );
}

export function handleMetaMockWebhook(
  provider: MetaMessagingProvider,
  request: MetaMockWebhookRequest,
  options: { enabled?: boolean; verifyToken?: string } = {},
): MetaMockWebhookResponse {
  if (!options.enabled) return { status: 503, body: { error: `${provider}_webhook_disabled` } };

  if (request.method === "GET") {
    const query = new URL(request.url).searchParams;
    const valid = query.get("hub.mode") === "subscribe"
      && query.get("hub.verify_token") === options.verifyToken
      && Boolean(query.get("hub.challenge"));
    return valid
      ? { status: 200, body: query.get("hub.challenge") as string }
      : { status: 403, body: { error: "verification_failed" } };
  }

  if (request.method === "POST") {
    const messages = parseMetaMessagingTestPayload(provider, request.body);
    return { status: 200, body: { received: messages.length, messages } };
  }

  return { status: 405, body: { error: "method_not_allowed" } };
}

