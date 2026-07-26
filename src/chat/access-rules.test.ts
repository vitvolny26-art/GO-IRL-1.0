import { describe, expect, it } from "vitest";

import { authorizeActivityChatAction } from "./access-rules.js";

const base = {
  launchState: "open" as const,
  actorUserKey: "user-1",
  actorRole: "participant" as const,
  actorMembershipStatus: "active" as const,
  actorActivityId: "activity-1",
  chatActivityId: "activity-1",
};

describe("authorizeActivityChatAction", () => {
  it("allows active participants to read and send in an open chat", () => {
    expect(authorizeActivityChatAction({ ...base, action: "read" })).toEqual({ allowed: true, mode: "read" });
    expect(authorizeActivityChatAction({ ...base, action: "send" })).toEqual({ allowed: true, mode: "write" });
  });

  it("denies non-members and cross-activity access", () => {
    expect(authorizeActivityChatAction({ ...base, action: "read", actorRole: null })).toEqual({ allowed: false, reason: "not_member" });
    expect(authorizeActivityChatAction({ ...base, action: "read", actorActivityId: "activity-2" })).toEqual({ allowed: false, reason: "cross_activity" });
  });

  it("denies left and removed members", () => {
    expect(authorizeActivityChatAction({ ...base, action: "read", actorMembershipStatus: "left" })).toEqual({ allowed: false, reason: "left" });
    expect(authorizeActivityChatAction({ ...base, action: "read", actorMembershipStatus: "removed" })).toEqual({ allowed: false, reason: "removed" });
  });

  it("allows muted members to read but not send", () => {
    expect(authorizeActivityChatAction({ ...base, action: "read", actorMembershipStatus: "muted" })).toEqual({ allowed: true, mode: "read" });
    expect(authorizeActivityChatAction({ ...base, action: "send", actorMembershipStatus: "muted" })).toEqual({ allowed: false, reason: "muted" });
  });

  it("makes expired chats read-only and closed chats unavailable", () => {
    expect(authorizeActivityChatAction({ ...base, action: "read", launchState: "read_only" })).toEqual({ allowed: true, mode: "read" });
    expect(authorizeActivityChatAction({ ...base, action: "send", launchState: "read_only" })).toEqual({ allowed: false, reason: "chat_read_only" });
    expect(authorizeActivityChatAction({ ...base, action: "read", launchState: "closed" })).toEqual({ allowed: false, reason: "chat_closed" });
  });

  it("allows authors to update or delete their visible message", () => {
    const message = { ...base, messageAuthorUserKey: "user-1", messageStatus: "visible" as const };
    expect(authorizeActivityChatAction({ ...message, action: "update" })).toEqual({ allowed: true, mode: "write" });
    expect(authorizeActivityChatAction({ ...message, action: "delete" })).toEqual({ allowed: true, mode: "write" });
  });

  it("denies mutation by non-authors or against unavailable messages", () => {
    expect(authorizeActivityChatAction({ ...base, action: "update", messageAuthorUserKey: "user-2", messageStatus: "visible" })).toEqual({ allowed: false, reason: "not_author" });
    expect(authorizeActivityChatAction({ ...base, action: "delete", messageAuthorUserKey: "user-1", messageStatus: "deleted" })).toEqual({ allowed: false, reason: "message_unavailable" });
  });

  it("restricts moderation to organizer, co-organizer, and moderator roles", () => {
    expect(authorizeActivityChatAction({ ...base, action: "moderate" })).toEqual({ allowed: false, reason: "insufficient_role" });
    for (const actorRole of ["organizer", "co_organizer", "moderator"] as const) {
      expect(authorizeActivityChatAction({ ...base, action: "moderate", actorRole })).toEqual({ allowed: true, mode: "moderate" });
    }
  });
});
