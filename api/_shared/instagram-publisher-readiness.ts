import { requireEnv } from "./env.js";

export type InstagramPublisherReadiness = {
  accountId: string;
  accountVerified: true;
  permissionStatus: "not_probed";
  requiredPermission: "instagram_business_content_publish";
  username: string;
};

type InstagramAccountResponse = {
  id?: unknown;
  username?: unknown;
};

type InstagramProviderError = {
  error?: {
    code?: unknown;
  };
};

const safeTransportCode = (error: unknown) => {
  const seen = new Set<unknown>();
  const queue: unknown[] = [error];
  while (queue.length) {
    const candidate = queue.shift();
    if (!candidate || typeof candidate !== "object" || seen.has(candidate)) continue;
    seen.add(candidate);
    const record = candidate as { cause?: unknown; code?: unknown; errors?: unknown };
    if (typeof record.code === "string") {
      const code = record.code.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 60);
      if (code) return code;
    }
    if (record.cause) queue.push(record.cause);
    if (Array.isArray(record.errors)) queue.push(...record.errors.slice(0, 5));
  }
  return "unknown";
};

const safeProviderCode = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") return "unknown";
  const code = String(value).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
  return code || "unknown";
};

const requireAccessToken = () => {
  const token = requireEnv("INSTAGRAM_PUBLISH_ACCESS_TOKEN")
    .replace(/[^\x21-\x7E]/g, "");
  if (!token) throw new Error("instagram_readiness_access_token_invalid");
  return token;
};

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const readProviderCode = async (response: Response) => {
  const payload = await readJson(response) as InstagramProviderError | null;
  return safeProviderCode(payload?.error?.code);
};

export async function checkInstagramPublisherReadiness(
  fetcher: typeof fetch = fetch,
): Promise<InstagramPublisherReadiness> {
  const version = requireEnv("META_GRAPH_VERSION");
  const configuredAccountId = requireEnv("INSTAGRAM_PUBLISH_ACCOUNT_ID");
  const accessToken = requireAccessToken();
  const url = `https://graph.instagram.com/${encodeURIComponent(version)}/me?fields=id%2Cusername`;

  let response: Response;
  try {
    response = await fetcher(url, {
      method: "GET",
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: "application/json",
      },
    });
  } catch (error) {
    const failure = new Error(
      `instagram_readiness_transport_failed:${safeTransportCode(error)}`,
    ) as Error & { cause?: unknown };
    failure.cause = error;
    throw failure;
  }

  if (!response.ok) {
    const providerCode = await readProviderCode(response);
    throw new Error(`instagram_readiness_provider_failed:${response.status}:${providerCode}`);
  }

  const payload = await readJson(response) as InstagramAccountResponse | null;
  const providerAccountId = typeof payload?.id === "string" || typeof payload?.id === "number"
    ? String(payload.id).trim()
    : "";
  const username = typeof payload?.username === "string" ? payload.username.trim() : "";

  if (!providerAccountId || !username) throw new Error("instagram_readiness_response_invalid");
  if (providerAccountId !== configuredAccountId) throw new Error("instagram_readiness_account_mismatch");

  return {
    accountId: providerAccountId,
    accountVerified: true,
    permissionStatus: "not_probed",
    requiredPermission: "instagram_business_content_publish",
    username,
  };
}
