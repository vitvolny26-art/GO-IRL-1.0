import type { Activity, CoachRequest, CoachRequestType, UserRole } from "./types";

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