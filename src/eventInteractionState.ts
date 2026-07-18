import type { Activity } from "./types";

export type EventPrimaryAction =
  | "manage"
  | "open-chat"
  | "join"
  | "request-join"
  | "join-waitlist"
  | "cancel-request"
  | "leave"
  | "full"
  | "private"
  | "finished";

export type EventInteractionStatus =
  | "organizer"
  | "joined"
  | "waiting"
  | "pending"
  | "full"
  | "private"
  | "public"
  | "finished";

export type EventInteractionInput = {
  isOrganizer: boolean;
  isJoined: boolean;
  isWaiting: boolean;
  isPending: boolean;
  isFull: boolean;
  visibility: Activity["visibility"];
  isFinished?: boolean;
  hasWaitingList?: boolean;
};

export type EventInteractionState = {
  primaryAction: EventPrimaryAction;
  disabled: boolean;
  canOpenChat: boolean;
  canJoin: boolean;
  showHelperAction: boolean;
  status: EventInteractionStatus;
};

export const resolveEventInteractionState = (input: EventInteractionInput): EventInteractionState => {
  const canOpenChat = input.isOrganizer || input.isJoined;
  const showHelperAction = !input.isFinished && (input.isOrganizer || input.isJoined);

  if (input.isFinished) {
    return { primaryAction: "finished", disabled: true, canOpenChat: false, canJoin: false, showHelperAction: false, status: "finished" };
  }
  if (input.isOrganizer) {
    return { primaryAction: "manage", disabled: false, canOpenChat, canJoin: false, showHelperAction, status: "organizer" };
  }
  if (input.isJoined) {
    return { primaryAction: "open-chat", disabled: false, canOpenChat, canJoin: false, showHelperAction, status: "joined" };
  }
  if (input.isWaiting) {
    return { primaryAction: "leave", disabled: false, canOpenChat: false, canJoin: false, showHelperAction: false, status: "waiting" };
  }
  if (input.isPending) {
    return { primaryAction: "cancel-request", disabled: false, canOpenChat: false, canJoin: false, showHelperAction: false, status: "pending" };
  }
  if (input.visibility === "private") {
    return { primaryAction: "private", disabled: true, canOpenChat: false, canJoin: false, showHelperAction: false, status: "private" };
  }
  if (input.isFull) {
    if (input.hasWaitingList) {
      return { primaryAction: "join-waitlist", disabled: false, canOpenChat: false, canJoin: true, showHelperAction: false, status: "full" };
    }
    return { primaryAction: "full", disabled: true, canOpenChat: false, canJoin: false, showHelperAction: false, status: "full" };
  }
  if (input.visibility === "invite") {
    return { primaryAction: "request-join", disabled: false, canOpenChat: false, canJoin: true, showHelperAction: false, status: "public" };
  }
  return { primaryAction: "join", disabled: false, canOpenChat: false, canJoin: true, showHelperAction: false, status: "public" };
};

export const isActivityFinished = (activity: Pick<Activity, "date" | "time" | "metadata">, now = new Date()) => {
  const start = new Date(`${activity.date}T${activity.time || "23:59"}:00`);
  const durationMinutes = Math.max(15, activity.metadata?.sport?.durationMinutes || 120);
  const endTime = start.getTime() + durationMinutes * 60_000;
  return !Number.isNaN(start.getTime()) && endTime < now.getTime();
};

export const shouldJoinFromPrimaryAction = (action: EventPrimaryAction) =>
  ["join", "request-join", "join-waitlist", "cancel-request", "leave"].includes(action);

export const eventPrimaryActionTarget = (action: EventPrimaryAction): "open" | "chat" | "join" | "none" => {
  if (action === "manage") return "open";
  if (action === "open-chat") return "chat";
  if (shouldJoinFromPrimaryAction(action)) return "join";
  return "none";
};

export const runEventPrimaryAction = (
  action: EventPrimaryAction,
  handlers: { open(): void; openChat(): void; join(): void },
) => {
  const target = eventPrimaryActionTarget(action);
  if (target === "open") handlers.open();
  if (target === "chat") handlers.openChat();
  if (target === "join") handlers.join();
  return target;
};

export type EventActionSurface = "card" | "sheet";

export const eventActionTranslationKey = (action: EventPrimaryAction, surface: EventActionSurface) => {
  switch (action) {
    case "manage": return "edit";
    case "open-chat": return "cardOpenChat";
    case "join": return surface === "card" ? "cardJoin" : "join";
    case "request-join": return surface === "card" ? "cardJoinRequest" : "request";
    case "join-waitlist": return "cardWaitlist";
    case "cancel-request": return surface === "card" ? "cardRequestSent" : "cancelRequest";
    case "leave": return "leave";
    case "full": return surface === "card" ? "cardNoSpots" : "eventFull";
    case "private": return surface === "card" ? "cardInviteOnly" : "privateAccess";
    case "finished": return "cardFinished";
  }
};

export const eventStatusTranslationKey = (state: EventInteractionState) => {
  switch (state.status) {
    case "organizer": return "organizerStatus";
    case "joined": return "joined";
    case "waiting": return "waiting";
    case "pending": return "requested";
    case "full": return "eventFull";
    case "private": return "privateAccess";
    case "finished": return "cardFinished";
    case "public": return state.primaryAction === "request-join" ? "inviteStatus" : "publicStatus";
  }
};