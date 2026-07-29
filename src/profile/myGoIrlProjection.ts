import { isActivityFinished } from "../eventInteractionState";
import type { Activity } from "../types";

export type MyGoIrlProjection = {
  upcomingCreated: Activity[];
  upcomingJoined: Activity[];
  pendingRequests: Activity[];
  past: Activity[];
};

export function buildMyGoIrlProjection(
  activities: readonly Activity[],
  userKey: string,
  joinedIds: readonly string[],
  pendingIds: readonly string[],
  now = new Date(),
): MyGoIrlProjection {
  const joined = new Set(joinedIds);
  const pending = new Set(pendingIds);
  const relevant = activities.filter((activity) => (
    activity.organizerKey === userKey || joined.has(activity.id) || pending.has(activity.id)
  ));
  const upcoming = relevant.filter((activity) => !isActivityFinished(activity, now));

  return {
    upcomingCreated: upcoming.filter((activity) => activity.organizerKey === userKey),
    upcomingJoined: upcoming.filter((activity) => joined.has(activity.id) && activity.organizerKey !== userKey),
    pendingRequests: upcoming.filter((activity) => pending.has(activity.id)),
    past: relevant.filter((activity) => isActivityFinished(activity, now)),
  };
}
