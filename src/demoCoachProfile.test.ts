import { describe, expect, it } from "vitest";
import { attachDemoCoachProfile, demoCoachProfile } from "./demoCoachProfile";
import type { CoachRequest } from "./types";

const request = (overrides: Partial<CoachRequest>): CoachRequest => ({
  id: "request-1",
  activityId: "activity-1",
  requesterUserKey: "organizer-1",
  requestType: "organizer_request",
  paymentMode: "split",
  status: "confirmed",
  createdAt: "2026-07-18T00:00:00.000Z",
  updatedAt: "2026-07-18T00:00:00.000Z",
  ...overrides,
});

describe("attachDemoCoachProfile", () => {
  it("attaches Alex to legacy confirmed organizer requests", () => {
    expect(attachDemoCoachProfile(request({ coachProfileId: undefined })).coachProfileId)
      .toBe(demoCoachProfile.id);
  });

  it("does not attach Alex to participant interest", () => {
    expect(attachDemoCoachProfile(request({ requestType: "participant_interest" })).coachProfileId)
      .toBeUndefined();
  });

  it("preserves an existing coach profile", () => {
    expect(attachDemoCoachProfile(request({ coachProfileId: "existing-coach" })).coachProfileId)
      .toBe("existing-coach");
  });
});