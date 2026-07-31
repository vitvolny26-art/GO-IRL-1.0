import { describe, expect, it } from "vitest";
import {
  fingerprintRoleInvitationStartParam,
  shouldProcessRoleInvitation,
} from "./roleInvitationSession";

const startParam = `ri_${"a".repeat(43)}`;

describe("role invitation session processing", () => {
  it("stores only a deterministic SHA-256 fingerprint", async () => {
    const fingerprint = await fingerprintRoleInvitationStartParam(startParam);

    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/);
    expect(fingerprint).not.toContain(startParam);
  });

  it("processes a new invitation once and skips the same invitation afterwards", async () => {
    const fingerprint = await fingerprintRoleInvitationStartParam(startParam);

    expect(shouldProcessRoleInvitation(fingerprint)).toBe(true);
    expect(shouldProcessRoleInvitation(fingerprint, fingerprint)).toBe(false);
  });

  it("does not create processing state for malformed start parameters", async () => {
    expect(await fingerprintRoleInvitationStartParam("ri_short")).toBeNull();
    expect(shouldProcessRoleInvitation(null)).toBe(false);
  });
});
