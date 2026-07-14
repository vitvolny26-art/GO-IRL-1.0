import { describe, expect, it } from "vitest";
import {
  buildWhatsAppInvitationPayload,
  buildWhatsAppJoinFlowPayload,
  buildWhatsAppJoinResultPayload,
} from "./payload-builders";
import type { WhatsAppEventSummary } from "./types";

const event: WhatsAppEventSummary = {
  eventId: "event-75",
  title: "Volleyball in Olomouc",
  dateTime: "2026-07-15 18:30",
  location: "Sportcentrum Olomouc",
  availableSpots: 3,
};

describe("WhatsApp payload builders", () => {
  it("builds an invitation summary with a stable Join action", () => {
    const payload = buildWhatsAppInvitationPayload("420700000000", event);

    expect(payload.interactive.body.text).toContain("Volleyball in Olomouc");
    expect(payload.interactive.body.text).toContain("Available spots: 3");
    expect(payload.interactive.action.buttons[0].reply).toEqual({ id: "join:event-75", title: "Join" });
  });

  it("adds the branded card as an image header without replacing native actions", () => {
    const payload = buildWhatsAppInvitationPayload("420700000000", {
      ...event,
      language: "ru",
      imageUrl: "https://goirl.example/api/meta/event-invitation-card?token=signed",
    });
    expect(payload.interactive.header).toEqual({
      type: "image",
      image: { link: "https://goirl.example/api/meta/event-invitation-card?token=signed" },
    });
    expect(payload.interactive.action.buttons.map((button) => button.reply.title)).toEqual([
      "Присоединиться",
      "Подробнее",
    ]);
  });

  it("builds a Flow navigation payload without embedded credentials", () => {
    const payload = buildWhatsAppJoinFlowPayload("420700000000", event, {
      id: "caller-supplied-flow-id",
      token: "caller-supplied-flow-token",
    });

    expect(payload.interactive.action.parameters.flow_action_payload).toEqual({
      screen: "JOIN_EVENT",
      data: event,
    });
  });

  it("adds calendar and map actions to a successful join confirmation", () => {
    const payload = buildWhatsAppJoinResultPayload("420700000000", {
      status: "joined",
      eventId: event.eventId,
      actions: [
        { kind: "calendar", label: "Add to calendar", url: "https://calendar.example/event-75" },
        { kind: "map", label: "Open map", url: "https://maps.example/event-75" },
      ],
    });

    expect(payload.text.body).toContain("You joined the event.");
    expect(payload.text.body).toContain("Add to calendar: https://calendar.example/event-75");
    expect(payload.text.body).toContain("Open map: https://maps.example/event-75");
  });

  it("returns a clear full-event result", () => {
    const payload = buildWhatsAppJoinResultPayload("420700000000", {
      status: "rejected",
      eventId: event.eventId,
      reason: "event_full",
      actions: [],
    });

    expect(payload.join_status).toBe("rejected");
    expect(payload.text.body).toBe("The event is full.");
  });
});
