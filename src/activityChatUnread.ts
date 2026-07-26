import type { ActivityChatMessage } from "./types";

export const activityChatUnreadChangedEvent = "go-irl-activity-chat-unread-changed";

const readStorageKey = (activityId: string, userKey: string) =>
  `go-irl-chat-read:${encodeURIComponent(userKey)}:${activityId}`;

const timestamp = (value: string | null | undefined) => {
  const parsed = value ? new Date(value).getTime() : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

export const countUnreadActivityChatMessages = (
  messages: ActivityChatMessage[],
  currentUserKey: string | null | undefined,
  lastReadAt: string | null,
) => {
  if (!currentUserKey) return 0;
  const readTime = timestamp(lastReadAt);

  return messages.filter((message) => (
    message.status === "visible"
    && message.senderUserKey !== currentUserKey
    && timestamp(message.createdAt) > readTime
  )).length;
};

export const latestVisibleActivityChatMessageAt = (messages: ActivityChatMessage[]) => {
  const latest = messages
    .filter((message) => message.status === "visible")
    .reduce((current, message) => Math.max(current, timestamp(message.createdAt)), 0);

  return latest ? new Date(latest).toISOString() : null;
};

export const loadActivityChatReadAt = (
  activityId: string,
  userKey: string | null | undefined,
  storage: Pick<Storage, "getItem"> | null = typeof window === "undefined" ? null : window.localStorage,
) => {
  if (!userKey || !storage) return null;
  try {
    return storage.getItem(readStorageKey(activityId, userKey));
  } catch {
    return null;
  }
};

export const markActivityChatRead = (
  activityId: string,
  userKey: string | null | undefined,
  readAt: string,
  storage: Pick<Storage, "setItem"> | null = typeof window === "undefined" ? null : window.localStorage,
) => {
  if (!userKey || !storage) return null;
  try {
    storage.setItem(readStorageKey(activityId, userKey), readAt);
    return readAt;
  } catch {
    return null;
  }
};
