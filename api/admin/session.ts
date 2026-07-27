import { authorizeAdminRequest, productionAdminAuthorizationDependencies } from "../_shared/admin-authorization.js";
import { createVercelHandler } from "../_shared/vercel-handler.js";

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
});

export async function handleAdminSession(request: Request) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  try {
    const result = await authorizeAdminRequest(request, productionAdminAuthorizationDependencies());
    if (!result.ok) return json(result.status, { error: result.error });
    return json(200, { authorized: true });
  } catch (error) {
    console.error("admin_login_failed", {
      reason: error instanceof Error ? error.message.slice(0, 80) : "unknown",
    });
    return json(503, { error: "access_denied" });
  }
}

export default createVercelHandler(handleAdminSession);
