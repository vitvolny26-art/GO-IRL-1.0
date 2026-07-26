export const activityChatStorageContractVersion = 1 as const;

export type ActivityChatTableName =
  | "activity_chats"
  | "activity_chat_memberships"
  | "activity_chat_messages"
  | "activity_chat_read_states";

export type ActivityChatLifecycleState = "active" | "expired" | "archived" | "deleted";

export type ActivityChatTableContract = {
  name: ActivityChatTableName;
  primaryKey: readonly string[];
  requiredColumns: readonly string[];
  uniqueKeys: readonly (readonly string[])[];
  indexes: readonly (readonly string[])[];
};

export const activityChatTableContracts: readonly ActivityChatTableContract[] = [
  {
    name: "activity_chats",
    primaryKey: ["id"],
    requiredColumns: ["id", "activity_id", "created_by_user_key", "status", "expires_at", "created_at", "updated_at"],
    uniqueKeys: [["activity_id"]],
    indexes: [["status", "expires_at"]],
  },
  {
    name: "activity_chat_memberships",
    primaryKey: ["chat_id", "user_key"],
    requiredColumns: ["chat_id", "activity_id", "user_key", "role", "status", "joined_at"],
    uniqueKeys: [],
    indexes: [["activity_id", "status"], ["user_key", "status"]],
  },
  {
    name: "activity_chat_messages",
    primaryKey: ["id"],
    requiredColumns: ["id", "chat_id", "activity_id", "sender_user_key", "body", "status", "created_at"],
    uniqueKeys: [["chat_id", "sender_user_key", "client_message_id"]],
    indexes: [["chat_id", "created_at", "id"], ["activity_id", "created_at"]],
  },
  {
    name: "activity_chat_read_states",
    primaryKey: ["chat_id", "user_key"],
    requiredColumns: ["chat_id", "user_key", "last_read_message_id", "last_read_at", "updated_at"],
    uniqueKeys: [],
    indexes: [["user_key", "updated_at"]],
  },
] as const;

export type ActivityChatLifecycleTransition = {
  from: ActivityChatLifecycleState;
  to: ActivityChatLifecycleState;
  reason: "expiry_reached" | "retention_elapsed" | "moderation_delete";
};

export const activityChatLifecycleTransitions: readonly ActivityChatLifecycleTransition[] = [
  { from: "active", to: "expired", reason: "expiry_reached" },
  { from: "expired", to: "archived", reason: "retention_elapsed" },
  { from: "active", to: "deleted", reason: "moderation_delete" },
  { from: "expired", to: "deleted", reason: "moderation_delete" },
  { from: "archived", to: "deleted", reason: "moderation_delete" },
] as const;

export const activityChatRetentionPolicy = {
  expiredMode: "read_only",
  archiveAfterDays: 30,
  purgeAfterArchiveDays: 90,
  preserveModerationEvidence: true,
} as const;

export const canTransitionActivityChat = (
  from: ActivityChatLifecycleState,
  to: ActivityChatLifecycleState,
) => activityChatLifecycleTransitions.some((transition) => transition.from === from && transition.to === to);
