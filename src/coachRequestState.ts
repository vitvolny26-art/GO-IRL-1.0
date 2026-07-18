import type { CoachRequest } from "./types";

const activeCoachRequestStatuses = new Set<CoachRequest["status"]>([
  "pending",
  "matched",
  "confirmed",
]);

export const isActiveCoachRequest = (request?: Pick<CoachRequest, "status">) =>
  Boolean(request && activeCoachRequestStatuses.has(request.status));
