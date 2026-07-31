import { getTelegramInitData } from "../telegram";
import type { UserRole } from "../types";

export type RoleInvitationTargetRole = Extract<UserRole, "organizer" | "professional">;

export type CreatedRoleInvitation = {
  id: string;
  startParam: string;
  targetRole: RoleInvitationTargetRole;
  expiresAt: string;
};

type RoleInvitationResponse = {
  error?: string;
  invitation?: CreatedRoleInvitation;
};

const roleInvitationPattern = /^ri_[A-Za-z0-9_-]{43}$/;

export const isRoleInvitationStartParam = (value: unknown) =>
  typeof value === "string" && roleInvitationPattern.test(value.trim());

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

export const requestRoleInvitation = async (
  targetRole: RoleInvitationTargetRole,
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
    body: JSON.stringify({
      action: "create_role_invitation",
      initData,
      targetRole,
    }),
  });
  const payload = await response.json() as RoleInvitationResponse;

  if (!response.ok || !payload.invitation || !isRoleInvitationStartParam(payload.invitation.startParam)) {
    throw new Error(payload.error || "role_invitation_creation_failed");
  }

  return payload.invitation;
};
