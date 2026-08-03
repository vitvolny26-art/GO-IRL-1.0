import { describe, expect, it } from "vitest";
import { isAcceptedProfessionalInvitation, normalizeRoleInvitationResult } from "./roleInvitationResult";

describe("role invitation result", () => {
  it("normalizes the snake_case response returned by the Edge Function", () => {
    const result = normalizeRoleInvitationResult({ status: "accepted", target_role: "professional" });
    expect(result).toEqual({ status: "accepted", targetRole: "professional" });
    expect(isAcceptedProfessionalInvitation(result)).toBe(true);
  });

  it("keeps compatibility with camelCase responses", () => {
    expect(normalizeRoleInvitationResult({ status: "accepted", targetRole: "organizer" }))
      .toEqual({ status: "accepted", targetRole: "organizer" });
  });

  it("rejects malformed invitation results", () => {
    expect(normalizeRoleInvitationResult({ status: "unknown", target_role: "professional" })).toBeNull();
    expect(normalizeRoleInvitationResult(null)).toBeNull();
  });
});
