import { describe, expect, it } from "vitest";
import {
  buildInstagramInvitationPayload,
  buildMessengerInvitationPayload,
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

  it("builds a branded generic card with native Join and Open actions", () => {
    const payload = buildInstagramInvitationPayload("ig-user-1", {
      ...event,
      imageUrl: "https://goirl.example/api/meta/event-invitation-card?token=signed",
      inviteUrl: "https://t.me/GOirl_bot?startapp=event-meta-1",
    });
    const element = payload.message.attachment?.payload.elements[0];
    expect(element?.image_url).toContain("event-invitation-card");
    expect(element?.default_action?.url).toContain("t.me/GOirl_bot");
    expect(element?.buttons).toEqual([
      { type: "postback", title: "Присоединиться", payload: "join:event-meta-1" },
      { type: "web_url", title: "Открыть", url: "https://t.me/GOirl_bot?startapp=event-meta-1" },
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
