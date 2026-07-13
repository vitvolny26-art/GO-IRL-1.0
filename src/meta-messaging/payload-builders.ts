import type { JoinResult } from "../join/types.js";
import type {
  InstagramMessagePayload,
  MessengerMessagePayload,
  MetaEventSummary,
  MetaJoinResultPayload,
  MetaMessagingProvider,
  MetaQuickReply,
} from "./types.js";

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

const messengerEventSummaryText = (event: MetaEventSummary) => [
  event.title,
  event.dateTime,
  event.location,
  event.availableSpots > 0 ? `Осталось мест: ${event.availableSpots}` : "Свободных мест нет",
].join("\n");

const messengerEventQuickReplies = (eventId: string): MetaQuickReply[] => [
  { content_type: "text", title: "Присоединиться", payload: `join:${eventId}` },
  { content_type: "text", title: "Подробнее", payload: `details:${eventId}` },
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
    recipient: { id: recipientId },
    message: {
      text: messengerEventSummaryText(event),
      quick_replies: messengerEventQuickReplies(event.eventId),
    },
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

const messengerResultHeading = (result: JoinResult) => {
  if (result.status === "joined") return "Вы присоединились к событию.";
  if (result.status === "already_joined") return "Вы уже участвуете в этом событии.";
  if (result.status === "pending") return "Заявка отправлена организатору.";
  if (result.status === "waitlisted") return "Свободных мест нет. Вы добавлены в лист ожидания.";
  if (result.reason === "event_full") return "Свободных мест нет.";
  if (result.reason === "event_closed") return "Присоединение к событию закрыто.";
  if (result.reason === "event_not_found") return "Событие не найдено.";
  return "Не удалось присоединиться к событию.";
};

const actionLine = (provider: MetaMessagingProvider, action: JoinResult["actions"][number]) => {
  if (provider !== "messenger") return `${action.label}: ${action.url}`;
  const label = action.kind === "calendar" ? "Добавить в календарь" : "Открыть карту";
  return `${label}: ${action.url}`;
};

export function buildMetaJoinResultPayload(
  provider: MetaMessagingProvider,
  recipientId: string,
  result: JoinResult,
): MetaJoinResultPayload {
  const actionLines = result.actions.map((action) => actionLine(provider, action));
  return {
    provider,
    recipient: { id: recipientId },
    message: {
      text: [provider === "messenger" ? messengerResultHeading(result) : resultHeading(result), ...actionLines].join("\n"),
    },
    join_status: result.status,
  };
}
