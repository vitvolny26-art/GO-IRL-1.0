import { describe, expect, it } from "vitest";
import type { Activity, CoachRequest } from "../types";
import {
  buildCoachRequestRetryPatch,
  isActiveCoachRequest,
  normalizeCoachRequestDetails,
  resolveCoachRequestType,
} from "../coachRequestState";

const requestWithStatus = (status: CoachRequest["status"]) => ({ status }) as CoachRequest;

const activity = {
  organizerKey: "organizer-1",
  members: [
    { userKey: "joined-1", name: "Joined", status: "joined" },
    { userKey: "waiting-1", name: "Waiting", status: "waiting" },
  ],
} as Pick<Activity, "organizerKey" | "members">;

describe("isActiveCoachRequest", () => {
  it.each(["pending", "matched", "confirmed"] as const)("treats %s as active", (status) => {
    expect(isActiveCoachRequest(requestWithStatus(status))).toBe(true);
  });

  it.each(["cancelled", "completed", "rejected"] as const)("treats %s as terminal", (status) => {
    expect(isActiveCoachRequest(requestWithStatus(status))).toBe(false);
  });

  it("treats a missing request as inactive", () => {
    expect(isActiveCoachRequest()).toBe(false);
  });
});

describe("resolveCoachRequestType", () => {
  it("waits until the current user is resolved", () => {
    expect(resolveCoachRequestType(activity, null, "user")).toBeNull();
  });

  it("uses organizer_request for the event organizer", () => {
    expect(resolveCoachRequestType(activity, "organizer-1", "user")).toBe("organizer_request");
  });

  it.each(["admin", "moderator"] as const)("uses organizer_request for %s", (role) => {
    expect(resolveCoachRequestType(activity, "staff-1", role)).toBe("organizer_request");
  });

  it("uses participant_interest for a joined participant", () => {
    expect(resolveCoachRequestType(activity, "joined-1", "user")).toBe("participant_interest");
  });

  it.each(["waiting-1", "outsider-1"])("blocks %s from creating Coach interest", (userKey) => {
    expect(resolveCoachRequestType(activity, userKey, "user")).toBeNull();
  });
});

describe("normalizeCoachRequestDetails", () => {
  it("trims organizer details", () => {
    expect(normalizeCoachRequestDetails({ goal: "  Help beginners  ", level: " beginner " })).toEqual({
      goal: "Help beginners",
      level: "beginner",
    });
  });

  it("drops empty values", () => {
    expect(normalizeCoachRequestDetails({ goal: "  ", level: "" })).toEqual({
      goal: undefined,
      level: undefined,
    });
  });
});

describe("buildCoachRequestRetryPatch", () => {
  it("clears stale assignment fields and restarts the request as pending", () => {
    expect(buildCoachRequestRetryPatch("2026-07-19T20:00:00.000Z")).toEqual({
      coach_profile_id: null,
      admin_note: null,
      status: "pending",
      updated_at: "2026-07-19T20:00:00.000Z",
    });
  });
});
