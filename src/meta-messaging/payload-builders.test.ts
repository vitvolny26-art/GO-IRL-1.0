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
  location: "DobrГЎ ДЌajovna",
  availableSpots: 4,
};

describe("Meta messaging payload builders", () => {
  it("builds a Russian Instagram invitation with join and details quick replies", () => {
    const payload = buildInstagramInvitationPayload("ig-user-1", event);

    expect(payload.recipient.id).toBe("ig-user-1");
    expect(payload.message.text).toContain("РћСЃС‚Р°Р»РѕСЃСЊ РјРµСЃС‚: 4");
    expect(payload.message.quick_replies?.[0]).toEqual({
      content_type: "text",
      title: "РџСЂРёСЃРѕРµРґРёРЅРёС‚СЊСЃСЏ",
      payload: "join:event-meta-1",
    });
  });

  it("builds a Russian Messenger invitation using the same event facts", () => {
    const payload = buildMessengerInvitationPayload("psid-1", event);

    expect(payload.messaging_type).toBe("RESPONSE");
    expect(payload.recipient.id).toBe("psid-1");
    expect(payload.message.text).toContain("Board games in Olomouc");
    expect(payload.message.text).toContain("РћСЃС‚Р°Р»РѕСЃСЊ РјРµСЃС‚: 4");
    expect(payload.message.quick_replies).toEqual([
      { content_type: "text", title: "РџСЂРёСЃРѕРµРґРёРЅРёС‚СЊСЃСЏ", payload: "join:event-meta-1" },
      { content_type: "text", title: "РџРѕРґСЂРѕР±РЅРµРµ", payload: "details:event-meta-1" },
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
            buttons: [{ type: "web_url", title: "РћС‚РєСЂС‹С‚СЊ GO IRL", url: "https://go-irl.example" }],
          },
        },
      },
    });
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
      { type: "postback", title: "РџСЂРёСЃРѕРµРґРёРЅРёС‚СЊСЃСЏ", payload: "join:event-meta-1" },
      { type: "web_url", title: "РћС‚РєСЂС‹С‚СЊ", url: "https://t.me/GOirl_bot?startapp=event-meta-1" },
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

    expect(payload.message.text).toContain("Р”РѕР±Р°РІРёС‚СЊ РІ РєР°Р»РµРЅРґР°СЂСЊ: https://calendar.example/meta-1");
    expect(payload.message.text).toContain("РћС‚РєСЂС‹С‚СЊ РєР°СЂС‚Сѓ: https://maps.example/meta-1");
  });

  it("builds a clear Messenger waitlist result for a full event", () => {
    const payload = buildMetaJoinResultPayload("messenger", "psid-1", {
      status: "waitlisted",
      eventId: event.eventId,
      reason: "event_full",
      actions: [],
    });

    expect(payload.join_status).toBe("waitlisted");
    expect(payload.message.text).toBe("РЎРІРѕР±РѕРґРЅС‹С… РјРµСЃС‚ РЅРµС‚. Р’С‹ РґРѕР±Р°РІР»РµРЅС‹ РІ Р»РёСЃС‚ РѕР¶РёРґР°РЅРёСЏ.");
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
      "Р’С‹ СѓР¶Рµ СѓС‡Р°СЃС‚РІСѓРµС‚Рµ РІ СЌС‚РѕРј СЃРѕР±С‹С‚РёРё.",
      "Р”РѕР±Р°РІРёС‚СЊ РІ РєР°Р»РµРЅРґР°СЂСЊ: https://calendar.example/meta-1",
      "РћС‚РєСЂС‹С‚СЊ РєР°СЂС‚Сѓ: https://maps.example/meta-1",
    ].join("\n"));
  });
});

