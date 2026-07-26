import { describe, expect, it } from "vitest";

import {
  architectureOnlyActivityChatToggleDecision,
  decideActivityChatToggleExposure,
  isActivityChatToggleRuntimeExposed,
  type ActivityChatToggleReleaseDecision,
} from "./toggle-release-gate.js";

const approvedDecision = (
  overrides: Partial<ActivityChatToggleReleaseDecision> = {},
): ActivityChatToggleReleaseDecision => ({
  version: 1,
  status: "approved",
  decisionId: "decision-1010",
  approvedBy: "product-owner",
  approvedAt: "2026-07-26T18:00:00.000Z",
  expiresAt: null,
  evidenceUrl: "https://github.com/vitvolny26-art/GO-IRL-1.0/issues/1010",
  ...overrides,
});

describe("activity chat toggle release gate", () => {
  it("keeps the architecture-only default hidden and non-interactive", () => {
    expect(decideActivityChatToggleExposure(
      architectureOnlyActivityChatToggleDecision,
    )).toEqual({
      visible: false,
      interactive: false,
      reason: "release_not_approved",
    });
    expect(isActivityChatToggleRuntimeExposed()).toBe(false);
  });

  it.each(["not_requested", "under_review", "rejected", "revoked"] as const)(
    "denies runtime exposure for %s decisions",
    (status) => {
      expect(decideActivityChatToggleExposure({
        ...approvedDecision(),
        status,
      })).toMatchObject({
        visible: false,
        interactive: false,
        reason: "release_not_approved",
      });
    },
  );

  it("denies an approved decision without complete evidence", () => {
    expect(decideActivityChatToggleExposure(approvedDecision({
      evidenceUrl: null,
    }))).toMatchObject({
      visible: false,
      interactive: false,
      reason: "approval_incomplete",
    });
  });

  it("denies an expired approval", () => {
    expect(decideActivityChatToggleExposure(
      approvedDecision({ expiresAt: "2026-07-27T00:00:00.000Z" }),
      new Date("2026-07-27T00:00:00.000Z"),
    )).toMatchObject({
      visible: false,
      interactive: false,
      reason: "approval_expired",
    });
  });

  it("allows runtime exposure only with a complete active approval", () => {
    expect(decideActivityChatToggleExposure(
      approvedDecision({ expiresAt: "2026-08-01T00:00:00.000Z" }),
      new Date("2026-07-27T00:00:00.000Z"),
    )).toEqual({
      visible: true,
      interactive: true,
      reason: "approved",
    });
  });
});
