export const reviewContractVersion = 1 as const;

export type ReviewSubjectType = "activity" | "organizer" | "coach";
export type ReviewStatus = "draft" | "published" | "hidden_by_moderator" | "removed";
export type ReviewModerationStatus = "not_required" | "pending" | "approved" | "rejected";
export type ReviewEligibilitySource = "verified_attendance" | "organizer_participation" | "coach_participation";
export type ReviewReportReason = "spam" | "harassment" | "false_information" | "privacy" | "unsafe" | "other";
export type ReviewReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export type ReviewSubject = {
  type: ReviewSubjectType;
  id: string;
  activityId: string;
  organizerUserKey?: string | null;
};

export type ReviewEligibility = {
  reviewerUserKey: string;
  activityId: string;
  source: ReviewEligibilitySource;
  verifiedAt: string;
  expiresAt?: string | null;
};

export type ReviewRatings = {
  overall: number;
  communication?: number | null;
  punctuality?: number | null;
  organization?: number | null;
  safety?: number | null;
  experience?: number | null;
};

export type ReviewRecord = {
  version: typeof reviewContractVersion;
  id: string;
  subject: ReviewSubject;
  reviewerUserKey: string;
  ratings: ReviewRatings;
  tags: readonly string[];
  comment?: string | null;
  status: ReviewStatus;
  moderationStatus: ReviewModerationStatus;
  isVerifiedAttendance: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  hiddenAt?: string | null;
};

export type ReviewAggregate = {
  subjectType: ReviewSubjectType;
  subjectId: string;
  ratingAverage: number;
  ratingCount: number;
  ratingWeighted: number;
  verifiedRatingCount: number;
  updatedAt: string;
};

export type ReviewReport = {
  id: string;
  reviewId: string;
  reporterUserKey: string;
  reason: ReviewReportReason;
  note?: string | null;
  status: ReviewReportStatus;
  createdAt: string;
  resolvedAt?: string | null;
};

export type ReviewPolicy = {
  publicPublishingEnabled: false;
  verifiedAttendanceRequired: true;
  oneReviewPerReviewerAndSubject: true;
  moderationGateRequired: true;
  directOrganizerReplyEnabled: false;
};

export const reviewPolicy: ReviewPolicy = {
  publicPublishingEnabled: false,
  verifiedAttendanceRequired: true,
  oneReviewPerReviewerAndSubject: true,
  moderationGateRequired: true,
  directOrganizerReplyEnabled: false,
};

export const buildReviewUniquenessKey = (reviewerUserKey: string, subject: ReviewSubject) =>
  [reviewerUserKey, subject.type, subject.id].map(encodeURIComponent).join(":");

export const buildReviewNotificationOccurrenceKey = (reviewId: string, kind: "rating_received" | "review_received") =>
  [reviewId, kind].map(encodeURIComponent).join(":");

export const isValidRating = (value: number) => Number.isInteger(value) && value >= 1 && value <= 5;

export const canPublishReview = (
  review: Pick<ReviewRecord, "isVerifiedAttendance" | "moderationStatus">,
  policy: ReviewPolicy = reviewPolicy,
) =>
  policy.publicPublishingEnabled &&
  (!policy.verifiedAttendanceRequired || review.isVerifiedAttendance) &&
  (!policy.moderationGateRequired || review.moderationStatus === "approved");
