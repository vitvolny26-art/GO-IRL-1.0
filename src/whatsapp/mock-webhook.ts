export type MockWebhookRequest = {
  method: string;
  url: string;
  body?: unknown;
};

export type MockWebhookResponse = {
  status: number;
  body: string | { error: string } | { received: number; messages: ParsedWhatsAppMessage[] };
};

export type ParsedWhatsAppMessage = {
  id: string;
  from: string;
  type: string;
  text?: string;
  replyId?: string;
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
  typeof value === "object" && value !== null ? value as UnknownRecord : null;

const asRecords = (value: unknown) => Array.isArray(value) ? value.map(asRecord).filter(Boolean) as UnknownRecord[] : [];

export function parseWhatsAppTestPayload(payload: unknown): ParsedWhatsAppMessage[] {
  const root = asRecord(payload);
  return asRecords(root?.entry).flatMap((entry) =>
    asRecords(entry.changes).flatMap((change) => {
      const value = asRecord(change.value);
      return asRecords(value?.messages).flatMap((message) => {
        const id = typeof message.id === "string" ? message.id : "";
        const from = typeof message.from === "string" ? message.from : "";
        const type = typeof message.type === "string" ? message.type : "unknown";
        if (!id || !from) return [];
        const text = asRecord(message.text);
        const interactive = asRecord(message.interactive);
        const buttonReply = asRecord(interactive?.button_reply);
        return [{
          id,
          from,
          type,
          ...(typeof text?.body === "string" ? { text: text.body } : {}),
          ...(typeof buttonReply?.id === "string" ? { replyId: buttonReply.id } : {}),
        }];
      });
    }),
  );
}

export function handleMockWhatsAppWebhook(
  request: MockWebhookRequest,
  options: { enabled?: boolean; verifyToken?: string } = {},
): MockWebhookResponse {
  if (!options.enabled) return { status: 503, body: { error: "whatsapp_webhook_disabled" } };

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
    const messages = parseWhatsAppTestPayload(request.body);
    return { status: 200, body: { received: messages.length, messages } };
  }

  return { status: 405, body: { error: "method_not_allowed" } };
}
