import { authorizeAdminRequest, productionAdminAuthorizationDependencies } from "../_shared/admin-authorization.js";
import { checkInstagramPublisherReadiness } from "../_shared/instagram-publisher-readiness.js";
import { createVercelHandler } from "../_shared/vercel-handler.js";

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
});

export async function handleInstagramPublisherReadiness(request: Request) {
  if (request.method !== "GET") {
    return new Response(null, { status: 405, headers: { Allow: "GET" } });
  }

  try {
    const authorization = await authorizeAdminRequest(
      request,
      productionAdminAuthorizationDependencies(),
    );
    if ("status" in authorization) return json(authorization.status, { error: authorization.error });

    return json(200, await checkInstagramPublisherReadiness());
  } catch (error) {
    console.error("instagram_publisher_readiness_failed", {
      reason: error instanceof Error ? error.message.slice(0, 80) : "unknown",
    });
    return json(503, { error: "instagram_publisher_readiness_failed" });
  }
}

export default createVercelHandler(handleInstagramPublisherReadiness);
