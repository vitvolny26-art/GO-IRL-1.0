import type {
  ActivityChatContract,
  ActivityChatMessageContract,
  ChatMembershipContract,
  ChatMembershipRole,
  ChatMessageStatus,
} from "./contracts.js";

export const activityChatMinimalReleaseVersion = 1 as const;

export type ActivityChatLaunchState = "not_started" | "open" | "read_only" | "closed";
export type ActivityChatAccessDecision =
  | { allowed: true; role: ChatMembershipRole; mode: "read_write" | "read_only" }
  | { allowed: false; reason: "not_member" | "removed" | "chat_unavailable" | "activity_not_eligible" };

export type ActivityChatSendTextCommand = {
  version: typeof activityChatMinimalReleaseVersion;
  chatId: string;
  activityId: string;
  authorUserKey: string;
  clientMessageId: string;
  body: string;
  replyToMessageId?: string | null;
  createdAt: string;
};

export type ActivityChatEditTextCommand = {
  chatId: string;
  messageId: string;
  editorUserKey: string;
  body: string;
  editedAt: string;
};

export type ActivityChatDeleteMessageCommand = {
  chatId: string;
  messageId: string;
  actorUserKey: string;
  deletedAt: string;
  reason: "author_request" | "moderation";
};

export type ActivityChatMarkReadCommand = {
  chatId: string;
  userKey: string;
  messageId: string;
  readAt: string;
};

export type ActivityChatMessagePage = {
  items: readonly ActivityChatMessageContract[];
  nextCursor?: string | null;
  hasMore: boolean;
};

export type ActivityChatReleasePolicy = {
  textMessagesOnly: true;
  attachmentsEnabled: false;
  mentionsEnabled: false;
  announcementsOrganizerOnly: true;
  editWindowMinutes: 15;
  deleteWindowMinutes: 60;
  pageSize: 50;
  moderationRequired: true;
};

export const activityChatReleasePolicy: ActivityChatReleasePolicy = {
  textMessagesOnly: true,
  attachmentsEnabled: false,
  mentionsEnabled: false,
  announcementsOrganizerOnly: true,
  editWindowMinutes: 15,
  deleteWindowMinutes: 60,
  pageSize: 50,
  moderationRequired: true,
};

export const resolveActivityChatLaunchState = (
  chat: Pick<ActivityChatContract, "status" | "expiresAt">,
  activityStartsAt: string,
  now = new Date(),
): ActivityChatLaunchState => {
  if (chat.status === "deleted" || chat.status === "archived") return "closed";
  if (chat.status === "expired" || new Date(chat.expiresAt).getTime() <= now.getTime()) return "read_only";
  if (new Date(activityStartsAt).getTime() > now.getTime()) return "not_started";
  return "open";
};

export const decideActivityChatAccess = (
  launchState: ActivityChatLaunchState,
  membership?: Pick<ChatMembershipContract, "role" | "status"> | null,
): ActivityChatAccessDecision => {
  if (!membership) return { allowed: false, reason: "not_member" };
  if (membership.status === "removed") return { allowed: false, reason: "removed" };
  if (launchState === "closed") return { allowed: false, reason: "chat_unavailable" };
  if (membership.status !== "active" && membership.status !== "muted") return { allowed: false, reason: "not_member" };
  return { allowed: true, role: membership.role, mode: launchState === "open" && membership.status === "active" ? "read_write" : "read_only" };
};

export const canPublishAnnouncement = (role: ChatMembershipRole) =>
  role === "organizer" || role === "co_organizer" || role === "moderator";

export const canEditMessage = (
  message: Pick<ActivityChatMessageContract, "author" | "createdAt" | "status">,
  actorUserKey: string,
  now = new Date(),
) => message.author.userKey === actorUserKey
  && message.status === ("visible" satisfies ChatMessageStatus)
  && now.getTime() - new Date(message.createdAt).getTime() <= activityChatReleasePolicy.editWindowMinutes * 60_000;

export const buildActivityChatPageCursor = (createdAt: string, messageId: string) =>
  [createdAt, messageId].map(encodeURIComponent).join(":");

export const buildActivityChatClientMessageKey = (chatId: string, authorUserKey: string, clientMessageId: string) =>
  [chatId, authorUserKey, clientMessageId].map(encodeURIComponent).join(":");
