import { describe, expect, it } from "vitest";

import {
  activityChatLifecycleTransitions,
  activityChatRetentionPolicy,
  activityChatTableContracts,
  canTransitionActivityChat,
} from "./table-lifecycle-contracts.js";

describe("activity chat table lifecycle contracts", () => {
  it("defines one chat per activity", () => {
    const chat = activityChatTableContracts.find((table) => table.name === "activity_chats");
    expect(chat?.uniqueKeys).toContainEqual(["activity_id"]);
  });

  it("defines durable membership and read-state composite keys", () => {
    expect(activityChatTableContracts.find((table) => table.name === "activity_chat_memberships")?.primaryKey)
      .toEqual(["chat_id", "user_key"]);
    expect(activityChatTableContracts.find((table) => table.name === "activity_chat_read_states")?.primaryKey)
      .toEqual(["chat_id", "user_key"]);
  });

  it("requires message idempotency and deterministic pagination indexes", () => {
    const messages = activityChatTableContracts.find((table) => table.name === "activity_chat_messages");
    expect(messages?.uniqueKeys).toContainEqual(["chat_id", "sender_user_key", "client_message_id"]);
    expect(messages?.indexes).toContainEqual(["chat_id", "created_at", "id"]);
  });

  it("allows only forward lifecycle transitions or moderation deletion", () => {
    expect(canTransitionActivityChat("active", "expired")).toBe(true);
    expect(canTransitionActivityChat("expired", "archived")).toBe(true);
    expect(canTransitionActivityChat("archived", "active")).toBe(false);
    expect(canTransitionActivityChat("deleted", "active")).toBe(false);
    expect(activityChatLifecycleTransitions).toHaveLength(5);
  });

  it("keeps expired chats read-only and preserves moderation evidence", () => {
    expect(activityChatRetentionPolicy.expiredMode).toBe("read_only");
    expect(activityChatRetentionPolicy.preserveModerationEvidence).toBe(true);
  });
});
