import type { RoleInvitationTargetRole } from "./roleInvitations";

export type RoleInvitationStatus = "accepted" | "invalid" | "role_conflict";

export type RoleInvitationResult = {
  status: RoleInvitationStatus;
  targetRole: RoleInvitationTargetRole | null;
};

type RawRoleInvitationResult = {
  status?: unknown;
  targetRole?: unknown;
  target_role?: unknown;
};

const invitationStatuses = new Set<RoleInvitationStatus>(["accepted", "invalid", "role_conflict"]);
const invitationRoles = new Set<RoleInvitationTargetRole>(["organizer", "professional"]);

export const normalizeRoleInvitationResult = (value: unknown): RoleInvitationResult | null => {
  if (!value || typeof value !== "object") return null;

  const raw = value as RawRoleInvitationResult;
  if (!invitationStatuses.has(raw.status as RoleInvitationStatus)) return null;

  const rawTargetRole = raw.targetRole ?? raw.target_role;
  const targetRole = invitationRoles.has(rawTargetRole as RoleInvitationTargetRole)
    ? rawTargetRole as RoleInvitationTargetRole
    : null;

  return {
    status: raw.status as RoleInvitationStatus,
    targetRole,
  };
};

export const isAcceptedProfessionalInvitation = (value: RoleInvitationResult | null | undefined) =>
  value?.status === "accepted" && value.targetRole === "professional";
