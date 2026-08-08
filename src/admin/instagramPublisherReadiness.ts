import { getTrustedAccessToken } from "../authSession";

export type InstagramPublisherReadinessSuccess = {
  ok: true;
  status: 200;
  accountId: string;
  accountVerified: true;
  permissionStatus: "not_probed";
  requiredPermission: "instagram_business_content_publish";
  username: string;
};

export type InstagramPublisherReadinessFailure = {
  ok: false;
  status: number;
  error:
    | "trusted_session_required"
    | "access_denied"
    | "publisher_unavailable"
    | "invalid_readiness_response"
    | "network_unavailable"
    | "unexpected_status";
};

export type InstagramPublisherReadinessResult =
  | InstagramPublisherReadinessSuccess
  | InstagramPublisherReadinessFailure;

type Dependencies = {
  fetcher?: typeof fetch;
  getAccessToken?: () => Promise<string | null>;
};

const readinessPath = "/api/admin/instagram-publisher-readiness";

const isReadinessPayload = (value: unknown): value is Omit<InstagramPublisherReadinessSuccess, "ok" | "status"> => {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return typeof payload.accountId === "string"
    && payload.accountId.trim().length > 0
    && typeof payload.username === "string"
    && payload.username.trim().length > 0
    && payload.accountVerified === true
    && payload.permissionStatus === "not_probed"
    && payload.requiredPermission === "instagram_business_content_publish";
};

export async function requestInstagramPublisherReadiness(
  dependencies: Dependencies = {},
): Promise<InstagramPublisherReadinessResult> {
  const getAccessToken = dependencies.getAccessToken || getTrustedAccessToken;
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, status: 401, error: "trusted_session_required" };

  let response: Response;
  try {
    response = await (dependencies.fetcher || fetch)(readinessPath, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    return { ok: false, status: 0, error: "network_unavailable" };
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      return { ok: false, status: response.status, error: "access_denied" };
    }
    if (response.status === 503) {
      return { ok: false, status: 503, error: "publisher_unavailable" };
    }
    return { ok: false, status: response.status, error: "unexpected_status" };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, status: 502, error: "invalid_readiness_response" };
  }
  if (!isReadinessPayload(payload)) {
    return { ok: false, status: 502, error: "invalid_readiness_response" };
  }

  return {
    ok: true,
    status: 200,
    accountId: payload.accountId.trim(),
    username: payload.username.trim(),
    accountVerified: true,
    permissionStatus: "not_probed",
    requiredPermission: "instagram_business_content_publish",
  };
}
