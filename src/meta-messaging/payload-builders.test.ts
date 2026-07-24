import { describe, expect, it } from "vitest";
import {
  buildInstagramInvitationPayload,
  buildMessengerInvitationPayload,
  buildMessengerWelcomePayload,
  buildMetaJoinResultPayload,
} from "./payload-builders";
import type { MetaEventSummary } from "./types";

const event: MetaEventSummary = {
  eventId: "event-meta-1",
  title: "Board games in Olomouc",
  dateTime: "2026-07-16 19:00",
  location: "Dobrá čajovna",
  availableSpots: 4,
};

describe("Meta messaging payload builders", () => {
  it("builds a Russian Instagram invitation with join and details quick replies", () => {
    const payload = buildInstagramInvitationPayload("ig-user-1", event);

    expect(payload.recipient.id).toBe("ig-user-1");
    expect(payload.message.text).toContain("Осталось мест: 4");
    expect(payload.message.quick_replies?.[0]).toEqual({
      content_type: "text",
      title: "Присоединиться",
      payload: "join:event-meta-1",
    });
  });

  it("builds a Russian Messenger invitation using the same event facts", () => {
    const payload = buildMessengerInvitationPayload("psid-1", event);

    expect(payload.messaging_type).toBe("RESPONSE");
    expect(payload.recipient.id).toBe("psid-1");
    expect(payload.message.text).toContain("Board games in Olomouc");
    expect(payload.message.text).toContain("Осталось мест: 4");
    expect(payload.message.quick_replies).toEqual([
      { content_type: "text", title: "Присоединиться", payload: "join:event-meta-1" },
      { content_type: "text", title: "Подробнее", payload: "details:event-meta-1" },
    ]);
  });

  it("builds the real Messenger Business API rich card for a known PSID", () => {
    const payload = buildMessengerInvitationPayload("psid-rich-card", {
      ...event,
      language: "ru",
      imageUrl: "https://goirl.example/api/meta/event-invitation-card?token=signed",
      openUrl: "https://goirl.example/join/event-meta-1",
      calendarUrl: "https://calendar.google.com/calendar/render?event=event-meta-1",
    });

    expect(payload.messaging_type).toBe("RESPONSE");
    expect(payload.recipient).toEqual({ id: "psid-rich-card" });
    const template = payload.message.attachment?.payload;
    expect(template?.template_type).toBe("generic");
    if (!template || template.template_type !== "generic") throw new Error("expected_generic_template");
    const element = template.elements[0];
    expect(element?.image_url).toContain("event-invitation-card");
    expect(element?.default_action?.url).toBe("https://goirl.example/join/event-meta-1");
    expect(element?.buttons).toHaveLength(3);
    expect(element?.buttons).toEqual([
      { type: "postback", title: "Присоединиться", payload: "join:event-meta-1" },
      { type: "web_url", title: "Открыть событие", url: "https://goirl.example/join/event-meta-1" },
      { type: "web_url", title: "В календарь", url: "https://calendar.google.com/calendar/render?event=event-meta-1" },
    ]);
  });

  it("builds a Messenger welcome screen with a GO IRL web action", () => {
    const payload = buildMessengerWelcomePayload("psid-1", "https://go-irl.example");

    expect(payload).toEqual({
      messaging_type: "RESPONSE",
      recipient: { id: "psid-1" },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: expect.stringContaining("GO IRL"),
            buttons: [{ type: "web_url", title: "Открыть GO IRL", url: "https://go-irl.example" }],
          },
        },
      },
    });
  });

  it("builds a branded generic card whose actions point to the same web event", () => {
    const payload = buildInstagramInvitationPayload("ig-user-1", {
      ...event,
      imageUrl: "https://goirl.example/api/meta/event-invitation-card?token=signed",
      openUrl: "https://goirl.example/join/event-meta-1",
      calendarUrl: "https://calendar.google.com/calendar/render?event=event-meta-1",
    });
    const template = payload.message.attachment?.payload;
    expect(template?.template_type).toBe("generic");
    if (!template || template.template_type !== "generic") throw new Error("expected_generic_template");
    const element = template.elements[0];
    expect(element?.image_url).toContain("event-invitation-card");
    expect(element?.default_action?.url).toBe("https://goirl.example/join/event-meta-1");
    expect(element?.buttons).toEqual([
      { type: "postback", title: "Присоединиться", payload: "join:event-meta-1" },
      { type: "web_url", title: "Открыть событие", url: "https://goirl.example/join/event-meta-1" },
      { type: "web_url", title: "В календарь", url: "https://calendar.google.com/calendar/render?event=event-meta-1" },
    ]);
  });

  it("builds an Instagram confirmation with calendar and map actions", () => {
    const payload = buildMetaJoinResultPayload("instagram", "ig-user-1", {
      status: "joined",
      eventId: event.eventId,
      actions: [
        { kind: "calendar", label: "Add to calendar", url: "https://calendar.example/meta-1" },
        { kind: "map", label: "Open map", url: "https://maps.example/meta-1" },
      ],
    });

    expect(payload.message.text).toContain("Добавить в календарь: https://calendar.example/meta-1");
    expect(payload.message.text).toContain("Открыть карту: https://maps.example/meta-1");
  });

  it("builds a clear Messenger waitlist result for a full event", () => {
    const payload = buildMetaJoinResultPayload("messenger", "psid-1", {
      status: "waitlisted",
      eventId: event.eventId,
      reason: "event_full",
      actions: [],
    });

    expect(payload.join_status).toBe("waitlisted");
    expect(payload.message.text).toBe("Свободных мест нет. Вы добавлены в лист ожидания.");
  });

  it("builds a Russian duplicate-join response with localized actions", () => {
    const payload = buildMetaJoinResultPayload("messenger", "psid-1", {
      status: "already_joined",
      eventId: event.eventId,
      actions: [
        { kind: "calendar", label: "Add to calendar", url: "https://calendar.example/meta-1" },
        { kind: "map", label: "Open map", url: "https://maps.example/meta-1" },
      ],
    });

    expect(payload.message.text).toBe([
      "Вы уже участвуете в этом событии.",
      "Добавить в календарь: https://calendar.example/meta-1",
      "Открыть карту: https://maps.example/meta-1",
    ].join("\n"));
  });
});

