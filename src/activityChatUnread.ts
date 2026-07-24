import type { ActivityChatMessage } from "./types";

const readStorageKey = (activityId: string) => `go-irl-chat-read:${activityId}`;

export const countUnreadActivityChatMessages = (
  messages: ActivityChatMessage[],
  currentUserKey: string | null | undefined,
  lastReadAt: string | null,
) => {
  const readTime = lastReadAt ? new Date(lastReadAt).getTime() : 0;
  return messages.filter((message) => (
    message.status === "visible"
    && message.senderUserKey !== currentUserKey
    && new Date(message.createdAt).getTime() > readTime
  )).length;
};

export const loadActivityChatReadAt = (
  activityId: string,
  storage: Pick<Storage, "getItem"> | null = typeof window === "undefined" ? null : window.localStorage,
) => storage?.getItem(readStorageKey(activityId)) || null;

export const markActivityChatRead = (
  activityId: string,
  readAt = new Date().toISOString(),
  storage: Pick<Storage, "setItem"> | null = typeof window === "undefined" ? null : window.localStorage,
) => {
  storage?.setItem(readStorageKey(activityId), readAt);
  return readAt;
};
