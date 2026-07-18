import type { Activity, CoachRequest, CoachRequestType, UserRole } from "./types";

export type CoachRequestDetails = Pick<CoachRequest, "goal" | "level">;

const activeCoachRequestStatuses = new Set<CoachRequest["status"]>([
  "pending",
  "matched",
  "confirmed",
]);

export const isActiveCoachRequest = (request?: Pick<CoachRequest, "status">) =>
  Boolean(request && activeCoachRequestStatuses.has(request.status));

export const resolveCoachRequestType = (
  activity: Pick<Activity, "organizerKey" | "members">,
  currentUserKey: string | null,
  userRole: UserRole,
): CoachRequestType | null => {
  if (!currentUserKey) return null;

  if (
    activity.organizerKey === currentUserKey ||
    userRole === "admin" ||
    userRole === "moderator"
  ) {
    return "organizer_request";
  }

  const isJoinedParticipant = activity.members.some(
    (member) => member.userKey === currentUserKey && member.status === "joined",
  );

  return isJoinedParticipant ? "participant_interest" : null;
};

export const normalizeCoachRequestDetails = (
  details?: CoachRequestDetails,
): CoachRequestDetails => ({
  goal: details?.goal?.trim() || undefined,
  level: details?.level?.trim() || undefined,
});
