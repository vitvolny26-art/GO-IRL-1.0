export const activityChatToggleGateVersion = 1 as const;

export type ActivityChatToggleDecisionStatus =
  | "not_requested"
  | "under_review"
  | "approved"
  | "rejected"
  | "revoked";

export type ActivityChatToggleSurface =
  | "activity_settings"
  | "activity_create"
  | "activity_edit";

export type ActivityChatToggleReleaseDecision = {
  version: typeof activityChatToggleGateVersion;
  status: ActivityChatToggleDecisionStatus;
  decisionId?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  expiresAt?: string | null;
  evidenceUrl?: string | null;
};

export type ActivityChatToggleExposureDecision = {
  visible: boolean;
  interactive: boolean;
  reason:
    | "release_not_approved"
    | "approval_incomplete"
    | "approval_expired"
    | "approved";
};

const hasApprovalEvidence = (
  decision: ActivityChatToggleReleaseDecision,
): boolean => Boolean(
  decision.decisionId?.trim()
  && decision.approvedBy?.trim()
  && decision.approvedAt?.trim()
  && decision.evidenceUrl?.trim(),
);

export const decideActivityChatToggleExposure = (
  decision: ActivityChatToggleReleaseDecision,
  now = new Date(),
): ActivityChatToggleExposureDecision => {
  if (decision.status !== "approved") {
    return {
      visible: false,
      interactive: false,
      reason: "release_not_approved",
    };
  }

  if (!hasApprovalEvidence(decision)) {
    return {
      visible: false,
      interactive: false,
      reason: "approval_incomplete",
    };
  }

  if (
    decision.expiresAt
    && new Date(decision.expiresAt).getTime() <= now.getTime()
  ) {
    return {
      visible: false,
      interactive: false,
      reason: "approval_expired",
    };
  }

  return {
    visible: true,
    interactive: true,
    reason: "approved",
  };
};

export const architectureOnlyActivityChatToggleDecision = {
  version: activityChatToggleGateVersion,
  status: "not_requested",
  decisionId: null,
  approvedBy: null,
  approvedAt: null,
  expiresAt: null,
  evidenceUrl: null,
} satisfies ActivityChatToggleReleaseDecision;

export const isActivityChatToggleRuntimeExposed = (
  decision: ActivityChatToggleReleaseDecision = architectureOnlyActivityChatToggleDecision,
  now = new Date(),
): boolean => decideActivityChatToggleExposure(decision, now).visible;
