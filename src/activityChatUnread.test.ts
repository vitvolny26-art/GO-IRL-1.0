import { describe, expect, it } from "vitest";
import {
  countUnreadActivityChatMessages,
  latestVisibleActivityChatMessageAt,
  loadActivityChatReadAt,
  markActivityChatRead,
} from "./activityChatUnread";
import type { ActivityChatMessage } from "./types";

const message = (
  id: string,
  senderUserKey: string,
  createdAt: string,
  status: ActivityChatMessage["status"] = "visible",
): ActivityChatMessage => ({
  id,
  chatId: "chat-1",
  activityId: "event-1",
  senderUserKey,
  senderDisplayName: senderUserKey,
  body: id,
  status,
  createdAt,
  editedAt: null,
  deletedAt: null,
});

describe("activity chat unread state", () => {
  it("counts only visible messages from other users after the read marker", () => {
    const messages = [
      message("old", "user:2", "2026-07-24T10:00:00.000Z"),
      message("own", "user:1", "2026-07-24T12:00:00.000Z"),
      message("new", "user:2", "2026-07-24T13:00:00.000Z"),
      message("hidden", "user:2", "2026-07-24T14:00:00.000Z", "deleted"),
    ];

    expect(countUnreadActivityChatMessages(messages, "user:1", "2026-07-24T11:00:00.000Z")).toBe(1);
    expect(countUnreadActivityChatMessages(messages, null, null)).toBe(0);
  });

  it("stores the read marker independently for each user and event", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) || null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    };

    markActivityChatRead("event-1", "user:1", "2026-07-24T15:00:00.000Z", storage);

    expect(loadActivityChatReadAt("event-1", "user:1", storage)).toBe("2026-07-24T15:00:00.000Z");
    expect(loadActivityChatReadAt("event-1", "user:2", storage)).toBeNull();
    expect(loadActivityChatReadAt("event-2", "user:1", storage)).toBeNull();
  });

  it("uses the latest visible server message as the read marker", () => {
    const messages = [
      message("first", "user:2", "2026-07-24T10:00:00.000Z"),
      message("deleted", "user:2", "2026-07-24T14:00:00.000Z", "deleted"),
      message("last", "user:1", "2026-07-24T13:00:00.000Z"),
    ];

    expect(latestVisibleActivityChatMessageAt(messages)).toBe("2026-07-24T13:00:00.000Z");
  });
});
