import { describe, expect, it } from "vitest";
import {
  activityChatLifecyclePolicy,
  buildChatMembershipKey,
  buildChatNotificationOccurrenceKey,
  canWriteToChat,
  chatContractVersion,
  type ActivityChatContract,
  type ChatMembershipContract,
} from "./contracts";

const chat: ActivityChatContract = {
  version: chatContractVersion,
  id: "chat-1",
  scope: "activity",
  activityId: "activity-1",
  createdByUserKey: "organizer-1",
  status: "active",
  expiresAt: "2026-07-27T12:00:00.000Z",
  createdAt: "2026-07-26T12:00:00.000Z",
  updatedAt: "2026-07-26T12:00:00.000Z",
};

const membership: ChatMembershipContract = {
  chatId: chat.id,
  activityId: chat.activityId,
  userKey: "participant-1",
  role: "participant",
  status: "active",
  joinedAt: "2026-07-26T12:00:00.000Z",
};

describe("activity chat contracts", () => {
  it("keeps chat activity-scoped and direct messages disabled", () => {
    expect(chat.scope).toBe("activity");
    expect(activityChatLifecyclePolicy.directMessagesAllowed).toBe(false);
  });

  it("allows writing only to a live active chat by an active member", () => {
    expect(canWriteToChat(chat, membership, new Date("2026-07-26T13:00:00.000Z"))).toBe(true);
    expect(canWriteToChat({ ...chat, status: "archived" }, membership, new Date("2026-07-26T13:00:00.000Z"))).toBe(false);
    expect(canWriteToChat(chat, { ...membership, status: "removed" }, new Date("2026-07-26T13:00:00.000Z"))).toBe(false);
    expect(canWriteToChat(chat, membership, new Date("2026-07-27T12:00:00.000Z"))).toBe(false);
  });

  it("builds stable encoded identity and notification keys", () => {
    expect(buildChatMembershipKey("chat:1", "user/1")).toBe("chat%3A1:user%2F1");
    expect(buildChatNotificationOccurrenceKey("chat:1", "message/1", "mention")).toBe("chat%3A1:message%2F1:mention");
  });
});
