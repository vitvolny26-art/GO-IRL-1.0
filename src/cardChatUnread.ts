import { activityIdFromJoinPath, parseInvitationStartParam } from "./invitationLink";

const demoEventIdPattern = /^demo-[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export const activityIdFromInviteUrl = (value: string) => {
  try {
    const url = new URL(value, "https://go-irl.local");
    const startParam = url.searchParams.get("startapp");
    const parsedStartParam = parseInvitationStartParam(startParam);

    if (parsedStartParam.valid) return parsedStartParam.eventId;

    const joinPathId = activityIdFromJoinPath(url.pathname);
    if (joinPathId) return joinPathId;

    const rawEvent = url.searchParams.get("event")?.trim() || "";
    return demoEventIdPattern.test(rawEvent) ? rawEvent : "";
  } catch {
    return "";
  }
};

export const canShowEventCardUnread = (
  activityId: string,
  joinedIds: readonly string[],
  unreadCount: number,
) => Boolean(activityId && joinedIds.includes(activityId) && unreadCount > 0);
