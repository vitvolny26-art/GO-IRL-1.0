import { describe, expect, it } from "vitest";
import {
  buildReviewNotificationOccurrenceKey,
  buildReviewUniquenessKey,
  canPublishReview,
  isValidRating,
  reviewPolicy,
  type ReviewSubject,
} from "./contracts";

const subject: ReviewSubject = {
  type: "activity",
  id: "activity-1",
  activityId: "activity-1",
};

describe("review contracts", () => {
  it("builds stable uniqueness keys", () => {
    expect(buildReviewUniquenessKey("user one", subject)).toBe("user%20one:activity:activity-1");
  });

  it("builds stable notification occurrence keys", () => {
    expect(buildReviewNotificationOccurrenceKey("review-1", "review_received")).toBe("review-1:review_received");
  });

  it("accepts only integer ratings from one to five", () => {
    expect(isValidRating(1)).toBe(true);
    expect(isValidRating(5)).toBe(true);
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(4.5)).toBe(false);
    expect(isValidRating(6)).toBe(false);
  });

  it("keeps public publishing disabled before the product gate", () => {
    expect(
      canPublishReview({
        isVerifiedAttendance: true,
        moderationStatus: "approved",
      }),
    ).toBe(false);
    expect(reviewPolicy.publicPublishingEnabled).toBe(false);
  });

  it("requires verified attendance and moderation when publishing is enabled", () => {
    const enabledPolicy = { ...reviewPolicy, publicPublishingEnabled: true as const };

    expect(canPublishReview({ isVerifiedAttendance: false, moderationStatus: "approved" }, enabledPolicy)).toBe(false);
    expect(canPublishReview({ isVerifiedAttendance: true, moderationStatus: "pending" }, enabledPolicy)).toBe(false);
    expect(canPublishReview({ isVerifiedAttendance: true, moderationStatus: "approved" }, enabledPolicy)).toBe(true);
  });
});
