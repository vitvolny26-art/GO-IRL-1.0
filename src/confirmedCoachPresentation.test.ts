import { describe, expect, it } from "vitest";

import { resolveConfirmedCoachPresentation } from "./confirmedCoachPresentation.js";
import type { CoachRequest } from "./types";

const request = (overrides: Partial<CoachRequest> = {}): CoachRequest => ({
  id: "coach-request-1",
  activityId: "activity-1",
  requesterUserKey: "organizer-1",
  coachProfileId: "coach-profile-1",
  requestType: "organizer_request",
  sportType: "running",
  paymentMode: "split",
  status: "confirmed",
  createdAt: "2026-07-26T10:00:00.000Z",
  updatedAt: "2026-07-26T11:00:00.000Z",
  ...overrides,
});

describe("confirmed coach presentation", () => {
  it("returns beginner-support copy for a confirmed organizer coach", () => {
    expect(resolveConfirmedCoachPresentation([request()])).toEqual({
      requestId: "coach-request-1",
      coachProfileId: "coach-profile-1",
      title: "Тренер подтверждён",
      supportCopy: "Поможет с разминкой, правилами и поддержит новичков перед началом активности.",
    });
  });

  it.each(["pending", "matched", "completed", "rejected", "cancelled"] as const)(
    "does not expose a %s coach request",
    (status) => {
      expect(resolveConfirmedCoachPresentation([request({ status })])).toBeNull();
    },
  );

  it("ignores participant interest even when marked confirmed", () => {
    expect(resolveConfirmedCoachPresentation([
      request({ requestType: "participant_interest" }),
    ])).toBeNull();
  });
});
