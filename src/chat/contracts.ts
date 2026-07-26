export const chatContractVersion = 1 as const;

export type ChatScope = "activity";
export type ChatStatus = "active" | "expired" | "archived" | "deleted";
export type ChatMembershipRole = "organizer" | "co_organizer" | "participant" | "moderator";
export type ChatMembershipStatus = "active" | "muted" | "left" | "removed";
export type ChatMessageKind = "message" | "announcement" | "system";
export type ChatMessageStatus = "visible" | "deleted" | "hidden_by_moderator" | "held_for_review";
export type ChatAttachmentKind = "image" | "file" | "voice";
export type ChatReportReason = "spam" | "harassment" | "unsafe" | "illegal" | "privacy" | "other";
export type ChatReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export type ActivityChatContract = {
  version: typeof chatContractVersion;
  id: string;
  scope: "activity";
  activityId: string;
  createdByUserKey: string;
  status: ChatStatus;
  expiresAt: string;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatMembershipContract = {
  chatId: string;
  activityId: string;
  userKey: string;
  role: ChatMembershipRole;
  status: ChatMembershipStatus;
  joinedAt: string;
  mutedUntil?: string | null;
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
};

export type ChatAuthorSnapshot = {
  userKey: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  role?: ChatMembershipRole | null;
};

export type ChatMessageReference = {
  messageId: string;
  authorUserKey?: string | null;
  excerpt?: string | null;
};

export type ChatMention = {
  userKey: string;
  offset: number;
  length: number;
};

export type ChatAttachment = {
  id: string;
  kind: ChatAttachmentKind;
  storageKey: string;
  mimeType: string;
  byteSize: number;
  fileName?: string | null;
  durationSeconds?: number | null;
};

export type ActivityChatMessageContract = {
  version: typeof chatContractVersion;
  id: string;
  chatId: string;
  activityId: string;
  kind: ChatMessageKind;
  author: ChatAuthorSnapshot;
  body: string;
  status: ChatMessageStatus;
  replyTo?: ChatMessageReference | null;
  quote?: ChatMessageReference | null;
  mentions: readonly ChatMention[];
  attachments: readonly ChatAttachment[];
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
};

export type ChatReadState = {
  chatId: string;
  userKey: string;
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
  unreadCount: number;
  mentionCount: number;
};

export type ChatReport = {
  id: string;
  chatId: string;
  activityId: string;
  messageId: string;
  reporterUserKey: string;
  reason: ChatReportReason;
  note?: string | null;
  status: ChatReportStatus;
  createdAt: string;
  resolvedAt?: string | null;
};

export type ChatLifecyclePolicy = {
  writeAccess: "active_members_only";
  readAccess: "active_members_and_moderators";
  archiveMode: "time_based";
  messageRetention: "delete_after_archive" | "retain_for_moderation_window";
  directMessagesAllowed: false;
};

export const activityChatLifecyclePolicy: ChatLifecyclePolicy = {
  writeAccess: "active_members_only",
  readAccess: "active_members_and_moderators",
  archiveMode: "time_based",
  messageRetention: "retain_for_moderation_window",
  directMessagesAllowed: false,
};

export const buildChatMembershipKey = (chatId: string, userKey: string) =>
  [chatId, userKey].map(encodeURIComponent).join(":");

export const buildChatNotificationOccurrenceKey = (chatId: string, messageId: string, kind: "message" | "reply" | "mention" | "announcement") =>
  [chatId, messageId, kind].map(encodeURIComponent).join(":");

export const canWriteToChat = (chat: Pick<ActivityChatContract, "status" | "expiresAt">, membership: Pick<ChatMembershipContract, "status">, now = new Date()) =>
  chat.status === "active" && new Date(chat.expiresAt).getTime() > now.getTime() && membership.status === "active";
