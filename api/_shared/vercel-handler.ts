import type { MessagingProvider } from "./provider-messages.js";
import { handleProviderWebhook } from "./provider-webhook.js";

type VercelRequest = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  [Symbol.asyncIterator](): AsyncIterator<Uint8Array | string>;
};

type VercelResponse = {
  end(body?: string): void;
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
};

async function toWebRequest(request: VercelRequest) {
  const method = request.method ?? "GET";
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) headers.set(name, value.join(", "));
    else if (value !== undefined) headers.set(name, value);
  }

  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const decoder = new TextDecoder();
    body = "";
    for await (const chunk of request) {
      body += typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
    }
    body += decoder.decode();
  }

  return new Request(new URL(request.url ?? "/", "https://goirl.invalid"), {
    method,
    headers,
    body,
  });
}

export function createVercelWebhookHandler(provider: MessagingProvider) {
  return createVercelHandler((request) => handleProviderWebhook(provider, request));
}

export function createVercelHandler(handler: (request: Request) => Promise<Response>) {
  return async (request: VercelRequest, response: VercelResponse) => {
    const result = await handler(await toWebRequest(request));
    response.status(result.status);
    result.headers.forEach((value, name) => response.setHeader(name, value));
    response.end(await result.text());
  };
}
