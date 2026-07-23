import { buildReminderMessage, validateReminderMessage } from "./message-builder.js";
import type { ReminderDispatcher } from "./worker.js";
import type {
  ReminderDelivery,
  ReminderDeliveryOutcome,
} from "./types.js";

type TelegramApiResponse = {
  ok?: boolean;
  result?: { message_id?: number };
  description?: string;
};

export type TelegramReminderDispatcherOptions = {
  botToken: string;
  fetchImpl?: typeof fetch;
};

const safeCode = (value: string) =>
  value.toLocaleLowerCase().replace(/[^a-z0-9_]+/g, "_").slice(0, 60) || "unknown";

export class TelegramReminderDispatcher implements ReminderDispatcher {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: TelegramReminderDispatcherOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async send(delivery: ReminderDelivery): Promise<ReminderDeliveryOutcome> {
    if (delivery.provider !== "telegram") {
      return { status: "cancelled", reason: "provider_not_enabled" };
    }
    if (delivery.cancelReason) {
      return { status: "cancelled", reason: delivery.cancelReason };
    }

    const message = buildReminderMessage(delivery);
    if (!validateReminderMessage(message)) {
      return { status: "failed", errorCode: "invalid_reminder_message" };
    }

    const response = await this.fetchImpl(
      `https://api.telegram.org/bot${this.options.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: delivery.recipientId,
          text: `${message.heading}\n\n${message.body}`,
          disable_web_page_preview: false,
          reply_markup: {
            inline_keyboard: message.actions.map((action) => [{
              text: action.label,
              url: action.url,
            }]),
          },
        }),
      },
    );
    const payload = await response.json() as TelegramApiResponse;
    if (response.ok && payload.ok && payload.result?.message_id) {
      return {
        status: "sent",
        providerMessageId: String(payload.result.message_id),
      };
    }

    const description = safeCode(payload.description || `http_${response.status}`);
    if (response.status === 403 || (response.status === 400 && description.includes("chat_not_found"))) {
      return { status: "cancelled", reason: `telegram_${description}` };
    }
    if (response.status === 429 || response.status >= 500) {
      throw new Error(`telegram_${response.status}`);
    }
    return { status: "failed", errorCode: `telegram_${description}` };
  }
}
