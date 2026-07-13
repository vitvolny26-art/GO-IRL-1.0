import type { JoinResult } from "../join/types";
import type {
  InstagramMessagePayload,
  MessengerMessagePayload,
  MetaEventSummary,
  MetaJoinResultPayload,
  MetaMessagingProvider,
  MetaQuickReply,
} from "./types";

const eventSummaryText = (event: MetaEventSummary) => [
  event.title,
  event.dateTime,
  event.location,
  event.availableSpots > 0 ? `Available spots: ${event.availableSpots}` : "Event is full",
].join("\n");

const eventQuickReplies = (eventId: string): MetaQuickReply[] => [
  { content_type: "text", title: "Join", payload: `join:${eventId}` },
  { content_type: "text", title: "Details", payload: `details:${eventId}` },
];

export function buildInstagramInvitationPayload(
  recipientId: string,
  event: MetaEventSummary,
): InstagramMessagePayload {
  return {
    recipient: { id: recipientId },
    message: {
      text: eventSummaryText(event),
      quick_replies: eventQuickReplies(event.eventId),
    },
  };
}

export function buildMessengerInvitationPayload(
  recipientId: string,
  event: MetaEventSummary,
): MessengerMessagePayload {
  return {
    messaging_type: "RESPONSE",
    ...buildInstagramInvitationPayload(recipientId, event),
  };
}

const resultHeading = (result: JoinResult) => {
  if (result.status === "joined") return "You joined the event.";
  if (result.status === "already_joined") return "You are already joining this event.";
  if (result.status === "pending") return "Your join request was sent to the organizer.";
  if (result.status === "waitlisted") return "The event is full. You are on the waitlist.";
  if (result.reason === "event_full") return "The event is full.";
  if (result.reason === "event_closed") return "Joining is closed.";
  if (result.reason === "event_not_found") return "The event was not found.";
  return "You cannot join this event.";
};

export function buildMetaJoinResultPayload(
  provider: MetaMessagingProvider,
  recipientId: string,
  result: JoinResult,
): MetaJoinResultPayload {
  const actionLines = result.actions.map((action) => `${action.label}: ${action.url}`);
  return {
    provider,
    recipient: { id: recipientId },
    message: { text: [resultHeading(result), ...actionLines].join("\n") },
    join_status: result.status,
  };
}
