import { requireEnv } from "../_shared/env.js";
import { createVercelHandler } from "../_shared/vercel-handler.js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default createVercelHandler(async (request) => {
  if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
  const eventId = new URL(request.url).searchParams.get("event") || "";
  if (!uuidPattern.test(eventId)) return new Response("Invalid event", { status: 400 });
  const pageId = requireEnv("MESSENGER_PAGE_ID");
  const target = `https://m.me/${encodeURIComponent(pageId)}?ref=${encodeURIComponent(`event:${eventId}`)}`;
  return Response.redirect(target, 302);
});
