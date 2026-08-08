import { requireEnv } from "./env.js";

export type InstagramFeedImageInput = {
  imageUrl: string;
  caption?: string;
};

export type InstagramFeedImageResult = {
  containerId: string;
  mediaId: string;
};

type PublishStage = "create" | "publish";

type InstagramProviderError = {
  error?: {
    code?: unknown;
  };
};

type InstagramIdResponse = {
  id?: unknown;
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

const requireHttpsImageUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error("invalid_protocol");
    return url.toString();
  } catch {
    throw new Error("instagram_publish_image_url_invalid");
  }
};

const requireAccessToken = () => {
  const token = requireEnv("INSTAGRAM_PUBLISH_ACCESS_TOKEN")
    .replace(/[^\x21-\x7E]/g, "");
  if (!token) throw new Error("instagram_publish_access_token_invalid");
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

const readObjectId = async (response: Response, stage: PublishStage) => {
  const payload = await readJson(response) as InstagramIdResponse | null;
  const id = typeof payload?.id === "string" || typeof payload?.id === "number"
    ? String(payload.id).trim()
    : "";
  if (!id) throw new Error(`instagram_publish_response_invalid:${stage}`);
  return id;
};

const postForm = async (
  url: string,
  token: string,
  params: Record<string, string>,
  stage: PublishStage,
) => {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params).toString(),
    });
  } catch (error) {
    throw new Error(
      `instagram_publish_transport_failed:${stage}:${safeTransportCode(error)}`,
      { cause: error },
    );
  }

  if (!response.ok) {
    const providerCode = await readProviderCode(response);
    throw new Error(`instagram_publish_provider_failed:${stage}:${response.status}:${providerCode}`);
  }

  return readObjectId(response, stage);
};

export async function publishInstagramFeedImage({
  imageUrl,
  caption,
}: InstagramFeedImageInput): Promise<InstagramFeedImageResult> {
  const publicImageUrl = requireHttpsImageUrl(imageUrl);
  const version = requireEnv("META_GRAPH_VERSION");
  const accountId = requireEnv("INSTAGRAM_PUBLISH_ACCOUNT_ID");
  const accessToken = requireAccessToken();
  const baseUrl = `https://graph.instagram.com/${encodeURIComponent(version)}/${encodeURIComponent(accountId)}`;

  const createPayload: Record<string, string> = { image_url: publicImageUrl };
  if (caption !== undefined) createPayload.caption = caption;

  const containerId = await postForm(
    `${baseUrl}/media`,
    accessToken,
    createPayload,
    "create",
  );

  const mediaId = await postForm(
    `${baseUrl}/media_publish`,
    accessToken,
    { creation_id: containerId },
    "publish",
  );

  return { containerId, mediaId };
}
