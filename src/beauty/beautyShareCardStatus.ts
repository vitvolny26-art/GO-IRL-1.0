import { getCurrentUserRole, isBrowserMockMode } from "../authSession";
import { supabase } from "../supabase";
import type { UserRole } from "../types";

export type BeautyShareCardLifecycleStatus = "ready" | "updating" | "error" | "deleted";

export type BeautyShareCardStatus = {
  profileId: string;
  status: BeautyShareCardLifecycleStatus;
  templateVersion: number;
  hasGeneratedImage: boolean;
  generatedAt: string | null;
  updatedAt: string;
};

type BeautyShareCardStatusRow = {
  profile_id: string;
  card_status: string;
  template_version: number;
  has_generated_image: boolean;
  generated_at: string | null;
  updated_at: string;
};

type RpcError = { code?: string; message?: string } | null;
type BeautyShareCardStatusClient = {
  rpc: (
    functionName: string,
    parameters: { p_profile_id: string },
  ) => Promise<{ data: unknown; error: RpcError }>;
};

type BeautyShareCardStatusDependencies = {
  client?: BeautyShareCardStatusClient;
  role?: UserRole;
  browserMock?: boolean;
};

const lifecycleStatuses = new Set<BeautyShareCardLifecycleStatus>([
  "ready",
  "updating",
  "error",
  "deleted",
]);

const isMissingRpc = (error: RpcError) => error?.code === "PGRST202"
  || Boolean(error?.message?.includes("Could not find the function"));

export const canReadBeautyShareCardStatus = (role: UserRole) => role === "organizer" || role === "admin";

export const loadBeautyShareCardStatus = async (
  profileId: string,
  dependencies: BeautyShareCardStatusDependencies = {},
): Promise<BeautyShareCardStatus | null> => {
  const role = dependencies.role ?? getCurrentUserRole();
  const browserMock = dependencies.browserMock ?? isBrowserMockMode();
  if (!profileId || browserMock || !canReadBeautyShareCardStatus(role)) return null;

  const client = dependencies.client || (supabase as unknown as BeautyShareCardStatusClient);
  const result = await client.rpc("go_irl_get_beauty_share_card_status", {
    p_profile_id: profileId,
  });

  if (result.error) {
    if (isMissingRpc(result.error)) return null;
    throw result.error;
  }

  const row = (Array.isArray(result.data) ? result.data[0] : result.data) as BeautyShareCardStatusRow | undefined;
  if (!row) return null;
  if (!lifecycleStatuses.has(row.card_status as BeautyShareCardLifecycleStatus)) {
    throw new Error("beauty_share_card_status_invalid");
  }

  return {
    profileId: row.profile_id,
    status: row.card_status as BeautyShareCardLifecycleStatus,
    templateVersion: row.template_version,
    hasGeneratedImage: row.has_generated_image,
    generatedAt: row.generated_at,
    updatedAt: row.updated_at,
  };
};
