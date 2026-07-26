import type {
  ChatMembershipRole,
  ChatMembershipStatus,
  ChatMessageStatus,
} from "./contracts.js";
import type { ActivityChatLaunchState } from "./minimal-release-contracts.js";

export type ActivityChatAction = "read" | "send" | "update" | "delete" | "moderate";

export type ActivityChatAccessContext = {
  action: ActivityChatAction;
  launchState: ActivityChatLaunchState;
  actorUserKey: string;
  actorRole?: ChatMembershipRole | null;
  actorMembershipStatus?: ChatMembershipStatus | null;
  actorActivityId: string;
  chatActivityId: string;
  messageAuthorUserKey?: string | null;
  messageStatus?: ChatMessageStatus | null;
};

export type ActivityChatAuthorizationDecision =
  | { allowed: true; mode: "read" | "write" | "moderate" }
  | {
      allowed: false;
      reason:
        | "cross_activity"
        | "not_member"
        | "left"
        | "removed"
        | "chat_closed"
        | "chat_read_only"
        | "muted"
        | "not_author"
        | "message_unavailable"
        | "insufficient_role";
    };

const moderatorRoles = new Set<ChatMembershipRole>(["organizer", "co_organizer", "moderator"]);

export const authorizeActivityChatAction = (
  context: ActivityChatAccessContext,
): ActivityChatAuthorizationDecision => {
  if (context.actorActivityId !== context.chatActivityId) {
    return { allowed: false, reason: "cross_activity" };
  }

  if (!context.actorRole || !context.actorMembershipStatus) {
    return { allowed: false, reason: "not_member" };
  }

  if (context.actorMembershipStatus === "removed") {
    return { allowed: false, reason: "removed" };
  }

  if (context.actorMembershipStatus === "left") {
    return { allowed: false, reason: "left" };
  }

  if (context.launchState === "closed") {
    return { allowed: false, reason: "chat_closed" };
  }

  if (context.action === "read") {
    return { allowed: true, mode: "read" };
  }

  if (context.launchState !== "open") {
    return { allowed: false, reason: "chat_read_only" };
  }

  if (context.actorMembershipStatus === "muted") {
    return { allowed: false, reason: "muted" };
  }

  if (context.action === "send") {
    return { allowed: true, mode: "write" };
  }

  if (context.action === "moderate") {
    return moderatorRoles.has(context.actorRole)
      ? { allowed: true, mode: "moderate" }
      : { allowed: false, reason: "insufficient_role" };
  }

  if (context.messageStatus && context.messageStatus !== "visible") {
    return { allowed: false, reason: "message_unavailable" };
  }

  if (context.messageAuthorUserKey !== context.actorUserKey) {
    return { allowed: false, reason: "not_author" };
  }

  return { allowed: true, mode: "write" };
};
