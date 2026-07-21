import type { Activity, Language } from "./types";

export type ParticipantJoinNotification = {
  id: string;
  activityId: string;
  memberKey: string;
  memberName: string;
  activityTitle: Record<Language, string>;
  kind: "joined" | "request";
  createdAt: number;
  read: boolean;
};

const notificationId = (activityId: string, memberKey: string, kind: ParticipantJoinNotification["kind"]) =>
  `participant-${kind}:${activityId}:${memberKey}`;

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
      if (member.userKey === currentUserKey || (member.status !== "joined" && member.status !== "pending")) return [];
      const kind = member.status === "pending" ? "request" as const : "joined" as const;
      const id = notificationId(activity.id, member.userKey, kind);
      if (existingIds.has(id)) return [];

      return [{
        id,
        activityId: activity.id,
        memberKey: member.userKey,
        memberName: member.name.trim() || "GO IRL User",
        activityTitle: activity.title,
        kind,
        createdAt,
        read: false,
      }];
    });
  });
};
