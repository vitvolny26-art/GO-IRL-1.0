import { describe, expect, it, vi } from "vitest";
import {
  buildMetaReminderPayload,
  MetaReminderDispatcher,
} from "./meta-dispatcher.js";
import { buildReminderMessage } from "./message-builder.js";
import type { ReminderDelivery } from "./types.js";

const now = new Date("2026-07-23T10:00:00Z");

const delivery = (provider: ReminderDelivery["provider"]): ReminderDelivery => ({
  reminderId: "reminder-1",
  deliveryKey: "delivery-1",
  provider,
  recipientId: "recipient-1",
  recipientLastInboundAt: "2026-07-23T09:00:00Z",
  leadMinutes: 60,
  language: "ru",
  attemptCount: 1,
  event: {
    eventId: "event-1",
    title: "Волейбол",
    dateTime: "30 июл. 2026 г. · 18:00",
    location: "ZŠ Demlova",
    openUrl: "https://go-irl.example/event",
    calendarUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Olomouc",
  },
});

const response = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const options = (fetchImpl: typeof fetch) => ({
  graphVersion: "v23.0",
  whatsapp: {
    phoneNumberId: "phone-1",
    accessToken: "wa-token",
    templateName: "go_irl_event_reminder",
  },
  instagram: {
    accountId: "ig-1",
    accessToken: "ig-token",
    apiMode: "facebook_login" as const,
  },
  messenger: {
    pageId: "page-1",
    accessToken: "page-token",
  },
  fetchImpl,
  now: () => now,
});

describe("MetaReminderDispatcher", () => {
  it("builds a WhatsApp utility-template contract with event-specific values", () => {
    const item = delivery("whatsapp");
    const payload = buildMetaReminderPayload(
      item,
      buildReminderMessage(item),
      "go_irl_event_reminder",
    );
    expect(payload).toMatchObject({
      messaging_product: "whatsapp",
      to: "recipient-1",
      type: "template",
      template: {
        name: "go_irl_event_reminder",
        language: { code: "ru" },
      },
    });
    expect(JSON.stringify(payload)).toContain("Волейбол");
    expect(JSON.stringify(payload)).toContain("calendar.google.com");
  });

  it.each(["instagram", "messenger"] as const)(
    "does not send %s outside the standard 24-hour messaging window",
    async (provider) => {
      const fetchImpl = vi.fn<typeof fetch>();
      const dispatcher = new MetaReminderDispatcher(options(fetchImpl));
      await expect(dispatcher.send({
        ...delivery(provider),
        recipientLastInboundAt: "2026-07-21T09:00:00Z",
      })).resolves.toEqual({
        status: "cancelled",
        reason: "meta_messaging_window_closed",
      });
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );

  it("sends an in-window Messenger reminder with event, calendar, and map links", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => response(200, {
      recipient_id: "recipient-1",
      message_id: "mid.1",
    }));
    const dispatcher = new MetaReminderDispatcher(options(fetchImpl));
    await expect(dispatcher.send(delivery("messenger"))).resolves.toEqual({
      status: "sent",
      providerMessageId: "mid.1",
    });
    const [, init] = fetchImpl.mock.calls[0];
    const payload = JSON.parse(String(init?.body));
    expect(payload.messaging_type).toBe("RESPONSE");
    expect(payload.message.text).toContain("calendar.google.com");
    expect(payload.message.text).toContain("google.com/maps");
  });

  it("retries transient Graph failures and cancels policy rejections", async () => {
    const transient = new MetaReminderDispatcher(options(
      vi.fn<typeof fetch>(async () => response(500, {
        error: { code: 2, is_transient: true },
      })),
    ));
    await expect(transient.send(delivery("instagram"))).rejects.toThrow("instagram_2");

    const policy = new MetaReminderDispatcher(options(
      vi.fn<typeof fetch>(async () => response(400, {
        error: { code: 10, message: "Outside messaging window" },
      })),
    ));
    await expect(policy.send(delivery("messenger"))).resolves.toEqual({
      status: "cancelled",
      reason: "messenger_10",
    });
  });

  it("keeps WhatsApp disabled until the approved template name is configured", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const dispatcher = new MetaReminderDispatcher({
      ...options(fetchImpl),
      whatsapp: {
        phoneNumberId: "phone-1",
        accessToken: "wa-token",
        templateName: "",
      },
    });
    await expect(dispatcher.send(delivery("whatsapp"))).resolves.toEqual({
      status: "cancelled",
      reason: "whatsapp_template_unavailable",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
