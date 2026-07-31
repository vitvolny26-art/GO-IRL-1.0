import { isRoleInvitationStartParam } from "./roleInvitations";

const sha256Hex = async (value: string) => {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const fingerprintRoleInvitationStartParam = async (value: unknown) => {
  const token = typeof value === "string" ? value.trim() : "";
  return isRoleInvitationStartParam(token) ? sha256Hex(token) : null;
};

export const shouldProcessRoleInvitation = (
  liveFingerprint: string | null,
  processedFingerprint?: string | null,
) => Boolean(liveFingerprint && liveFingerprint !== processedFingerprint);
