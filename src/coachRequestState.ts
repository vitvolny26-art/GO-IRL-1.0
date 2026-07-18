import type { Activity, CoachRequest, CoachRequestType, UserRole } from "./types";

export type CoachRequestDetails = Pick<CoachRequest, "goal" | "level">;

const activeCoachRequestStatuses = new Set<CoachRequest["status"]>([
  "pending",
  "matched",
  "confirmed",
]);

export const isActiveCoachRequest = (request?: Pick<CoachRequest, "status">) =>
  Boolean(request && activeCoachRequestStatuses.has