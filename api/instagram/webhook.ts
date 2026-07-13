import { handleMetaMockWebhook } from "../../src/meta-messaging/mock-webhook";

export default async function webhook(request: Request) {
  let body: unknown;
  if (request.method === "POST") body = await request.json().catch(() => undefined);
  const result = handleMetaMockWebhook("instagram", { method: request.method, url: request.url, body });
  return new Response(typeof result.body === "string" ? result.body : JSON.stringify(result.body), {
    status: result.status,
    headers: { "content-type": typeof result.body === "string" ? "text/plain" : "application/json" },
  });
}
