import { getUserKey } from "./supabase";
import { useAppStore } from "./store";
import type { Activity, Language } from "./types";

export type ParticipantJoinNotification = {
  id: string;
  activityId: string;
  memberKey: string;
  memberName: string;
  activityTitle: Record<Language, string>;
  createdAt: number;
  read: boolean;
};

const storageKey = "go-irl-participant-notifications-v1";
export const participantNotificationsChangedEvent = "go-irl-participant-notifications-changed";
const maxNotifications = 40;

const notificationId = (activityId: string, memberKey: string) =>
  `participant-joined:${activityId}:${memberKey}`;

export const deriveParticipantJoinNotifications = (
  activities: Activity[],
  currentUserKey: string,
  existingIds: ReadonlySet<string>,
  createdAt = Date.now(),
): ParticipantJoinNotification[] => {
  if (!currentUserKey) return [];

  return activities.flatMap((activity) => {
    if (activity.organizerKey !== currentUserKey) return [];

    return activity.members.flatMap((member) => {
      if (member.userKey === currentUserKey || member.status !== "joined") return [];
      const id = notificationId(activity.id, member.userKey);
      if (existingIds.has(id)) return [];

      return [{
        id,
        activityId: activity.id,
        memberKey: member.userKey,
        memberName: member.name.trim() || "GO IRL User",
        activityTitle: activity.title,
        createdAt,
        read: false,
      }];
    });
  });
};

export const getParticipantJoinNotifications = (): ParticipantJoinNotification[] => {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]") as ParticipantJoinNotification[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.id === "string" && typeof item.createdAt === "number")
      .sort((left, right) => right.createdAt - left.createdAt)
      .slice(0, maxNotifications);
  } catch {
    return [];
  }
};

const publishNotifications = (notifications: ParticipantJoinNotification[]) => {
  localStorage.setItem(storageKey, JSON.stringify(notifications.slice(0, maxNotifications)));
  window.dispatchEvent(new Event(participantNotificationsChangedEvent));
};

export const markParticipantJoinNotificationsRead = () => {
  const notifications = getParticipantJoinNotifications();
  if (!notifications.some((item) => !item.read)) return notifications;

  const next = notifications.map((item) => ({ ...item, read: true }));
  publishNotifications(next);
  return next;
};

const syncParticipantJoinNotifications = (activities: Activity[]) => {
  const currentUserKey = getUserKey();
  if (!currentUserKey) return;

  const current = getParticipantJoinNotifications();
  const additions = deriveParticipantJoinNotifications(
    activities,
    currentUserKey,
    new Set(current.map((item) => item.id)),
  );

  if (!additions.length) return;
  publishNotifications([...additions, ...current]);
};

export const enableParticipantJoinNotifications = () => {
  if (typeof window === "undefined") return () => undefined;

  const sync = (state: ReturnType<typeof useAppStore.getState>) => {
    if (state.loading) return;
    syncParticipantJoinNotifications(state.activities);
  };

  const unsubscribe = useAppStore.subscribe(sync);
  sync(useAppStore.getState());
  return unsubscribe;
};
