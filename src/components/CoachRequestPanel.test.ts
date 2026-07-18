import { describe, expect, it } from "vitest";
import type { CoachRequest } from "../types";
import { isActiveCoachRequest } from "../coachRequestState";

const requestWithStatus = (status: CoachRequest["status"]) => ({ status }) as CoachRequest;

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
