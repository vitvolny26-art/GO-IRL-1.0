import type { Language } from "../types.js";

export type BeautyBookingNotificationKind =
  | "booking_requested"
  | "booking_confirmed"
  | "booking_declined"
  | "booking_cancelled_by_client"
  | "booking_cancelled_by_professional";

export type BeautyBookingNotificationDelivery = {
  sourceEventId: string;
  bookingId: string;
  recipientUserKey: string;
  recipientTelegramId: string;
  kind: BeautyBookingNotificationKind;
  attemptCount: number;
  language: Language;
  startsAt: string;
  professionalName: string;
  clientName: string;
  serviceName: Partial<Record<Language, string>>;
  publicLocation: string;
  openUrl: string;
};

export type BeautyBookingNotificationOutcome =
  | { status: "sent"; providerMessageId?: string }
  | { status: "retry"; errorCode: string; retryAt: string }
  | { status: "failed"; errorCode: string }
  | { status: "cancelled"; reason: string };

export type BeautyBookingNotificationRepositoryContract = {
  claim: (limit?: number) => Promise<BeautyBookingNotificationDelivery[]>;
  finish: (
    delivery: BeautyBookingNotificationDelivery,
    outcome: BeautyBookingNotificationOutcome,
  ) => Promise<void>;
};

export type BeautyBookingNotificationDispatcherContract = {
  send: (delivery: BeautyBookingNotificationDelivery) => Promise<BeautyBookingNotificationOutcome>;
};

const languageLocales: Record<Language, string> = {
  ru: "ru-CZ",
  uk: "uk-CZ",
  cs: "cs-CZ",
  en: "en-CZ",
};

const copy: Record<Language, Record<BeautyBookingNotificationKind, string>> = {
  ru: {
    booking_requested: "🆕 Новый запрос на запись",
    booking_confirmed: "✅ Запись подтверждена",
    booking_declined: "❌ Запись отклонена",
    booking_cancelled_by_client: "↩️ Клиент отменил запись",
    booking_cancelled_by_professional: "❌ Мастер отменил запись",
  },
  uk: {
    booking_requested: "🆕 Новий запит на запис",
    booking_confirmed: "✅ Запис підтверджено",
    booking_declined: "❌ Запис відхилено",
    booking_cancelled_by_client: "↩️ Клієнт скасував запис",
    booking_cancelled_by_professional: "❌ Майстер скасував запис",
  },
  cs: {
    booking_requested: "🆕 Nová žádost o rezervaci",
    booking_confirmed: "✅ Rezervace potvrzena",
    booking_declined: "❌ Rezervace odmítnuta",
    booking_cancelled_by_client: "↩️ Klient rezervaci zrušil",
    booking_cancelled_by_professional: "❌ Profesionál rezervaci zrušil",
  },
  en: {
    booking_requested: "🆕 New booking request",
    booking_confirmed: "✅ Booking confirmed",
    booking_declined: "❌ Booking declined",
    booking_cancelled_by_client: "↩️ Client cancelled the booking",
    booking_cancelled_by_professional: "❌ Professional cancelled the booking",
  },
};

const serviceLabel = (
  value: BeautyBookingNotificationDelivery["serviceName"],
  language: Language,
) => value[language] || value.en || value.cs || value.ru || value.uk || "Beauty service";

const pragueWhen = (startsAt: string, language: Language) => {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return startsAt;
  return new Intl.DateTimeFormat(languageLocales[language], {
    timeZone: "Europe/Prague",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const buildBeautyBookingNotificationText = (
  delivery: BeautyBookingNotificationDelivery,
) => {
  const heading = copy[delivery.language][delivery.kind];
  const counterpart = delivery.kind === "booking_requested"
    || delivery.kind === "booking_cancelled_by_client"
    ? delivery.clientName
    : delivery.professionalName;
  return [
    heading,
    "",
    serviceLabel(delivery.serviceName, delivery.language),
    pragueWhen(delivery.startsAt, delivery.language),
    delivery.publicLocation,
    counterpart,
  ].filter(Boolean).join("\n");
};

export type BeautyBookingTelegramDispatcherOptions = {
  botToken: string;
  fetchImpl?: typeof fetch;
};

type TelegramResponse = {
  ok?: boolean;
  result?: { message_id?: number };
  error_code?: number;
};

export class BeautyBookingTelegramDispatcher implements BeautyBookingNotificationDispatcherContract {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: BeautyBookingTelegramDispatcherOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async send(delivery: BeautyBookingNotificationDelivery): Promise<BeautyBookingNotificationOutcome> {
    const response = await this.fetchImpl(
      `https://api.telegram.org/bot${this.options.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: delivery.recipientTelegramId,
          text: buildBeautyBookingNotificationText(delivery),
          reply_markup: {
            inline_keyboard: [[{
              text: "GO IRL",
              url: delivery.openUrl,
            }]],
          },
        }),
      },
    );
    const payload = await response.json() as TelegramResponse;
    if (response.ok && payload.ok) {
      return {
        status: "sent",
        ...(payload.result?.message_id
          ? { providerMessageId: String(payload.result.message_id) }
          : {}),
      };
    }
    const code = `telegram_${payload.error_code || response.status}`;
    if (response.status === 429 || response.status >= 500) throw new Error(code);
    if (response.status === 403) return { status: "cancelled", reason: code };
    return { status: "failed", errorCode: code };
  }
}

const retryDelayMs = (attempt: number) =>
  Math.min(60 * 60_000, 30_000 * 2 ** Math.max(0, attempt - 1));

export const runBeautyBookingNotificationWorker = async (
  repository: BeautyBookingNotificationRepositoryContract,
  dispatcher: BeautyBookingNotificationDispatcherContract,
  limit = 25,
) => {
  const deliveries = await repository.claim(limit);
  const summary = { claimed: deliveries.length, sent: 0, retried: 0, failed: 0, cancelled: 0 };
  for (const delivery of deliveries) {
    try {
      const outcome = await dispatcher.send(delivery);
      await repository.finish(delivery, outcome);
      summary[outcome.status === "retry" ? "retried" : outcome.status] += 1;
    } catch (error) {
      const errorCode = error instanceof Error ? error.message.slice(0, 80) : "unknown";
      if (delivery.attemptCount >= 5) {
        await repository.finish(delivery, { status: "failed", errorCode });
        summary.failed += 1;
      } else {
        await repository.finish(delivery, {
          status: "retry",
          errorCode,
          retryAt: new Date(Date.now() + retryDelayMs(delivery.attemptCount)).toISOString(),
        });
        summary.retried += 1;
      }
    }
  }
  return summary;
};
