import { getTelegramInitData } from "../telegram";
import type { UserRole } from "../types";

export type RoleInvitationTargetRole = Extract<UserRole, "organizer" | "professional">;

export type CreatedRoleInvitation = {
  id: string;
  startParam: string;
  targetRole: RoleInvitationTargetRole;
  expiresAt: string;
};

export type ProfessionalRoleRemovalStatus = "updated" | "not_found" | "role_conflict";

export type ProfessionalRoleRemovalResult = {
  status: ProfessionalRoleRemovalStatus;
  targetUserKey: string;
  previousRole: string | null;
  currentRole: string | null;
};

type RoleInvitationResponse = {
  error?: string;
  invitation?: CreatedRoleInvitation;
  roleRemoval?: ProfessionalRoleRemovalResult;
};

const roleInvitationPattern = /^ri_[A-Za-z0-9_-]{43}$/;
const telegramIdPattern = /^[0-9]{5,20}$/;

export const isRoleInvitationStartParam = (value: unknown) =>
  typeof value === "string" && roleInvitationPattern.test(value.trim());

export const normalizeTelegramId = (value: unknown) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return telegramIdPattern.test(normalized) ? normalized : null;
};

export const buildRoleInvitationUrl = (
  startParam: string,
  botUsername: string,
  appName = "",
) => {
  if (!isRoleInvitationStartParam(startParam)) return null;
  const bot = botUsername.trim().replace(/^@/, "");
  if (!bot) return null;
  const appPath = appName.trim().replace(/^\/+|\/+$/g, "");
  const path = appPath ? `/${appPath}` : "";
  return `https://t.me/${bot}${path}?startapp=${encodeURIComponent(startParam.trim())}`;
};

const trustedAdminRequest = async (
  body: Record<string, unknown>,
  dependencies: {
    fetcher?: typeof fetch;
    initData?: string;
    publishableKey?: string;
    supabaseUrl?: string;
  } = {},
) => {
  const fetcher = dependencies.fetcher || fetch;
  const initData = dependencies.initData ?? getTelegramInitData();
  const supabaseUrl = dependencies.supabaseUrl ?? import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = dependencies.publishableKey ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!initData) throw new Error("telegram_init_data_required");
  if (!supabaseUrl || !publishableKey) throw new Error("trusted_auth_env_missing");

  const response = await fetcher(`${supabaseUrl}/functions/v1/verifyTelegramInitData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: publishableKey,
    },
    body: JSON.stringify({ ...body, initData }),
  });
  const payload = await response.json() as RoleInvitationResponse;

  if (!response.ok) throw new Error(payload.error || "admin_action_failed");
  return payload;
};

export const requestRoleInvitation = async (
  targetRole: RoleInvitationTargetRole,
  dependencies: Parameters<typeof trustedAdminRequest>[1] = {},
) => {
  const payload = await trustedAdminRequest({
    action: "create_role_invitation",
    targetRole,
  }, dependencies);

  if (!payload.invitation || !isRoleInvitationStartParam(payload.invitation.startParam)) {
    throw new Error(payload.error || "role_invitation_creation_failed");
  }

  return payload.invitation;
};

export const requestProfessionalRoleRemoval = async (
  telegramId: string,
  dependencies: Parameters<typeof trustedAdminRequest>[1] = {},
) => {
  const normalizedTelegramId = normalizeTelegramId(telegramId);
  if (!normalizedTelegramId) throw new Error("invalid_telegram_id");

  const payload = await trustedAdminRequest({
    action: "remove_professional_role",
    targetTelegramId: normalizedTelegramId,
  }, dependencies);

  if (!payload.roleRemoval) throw new Error(payload.error || "professional_role_removal_failed");
  return payload.roleRemoval;
};
