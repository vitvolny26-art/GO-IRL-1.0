import { runAuthorizedAdminAction, productionAdminAuthorizationDependencies, type AdminAuthorizationDependencies } from "../_shared/admin-authorization.js";
import { requireEnv } from "../_shared/env.js";
import { createVercelHandler } from "../_shared/vercel-handler.js";

export type AdminOverview = {
  users: number;
  organizers: number;
  events: number;
  activeParticipants: number;
  auditEntries: number;
  generatedAt: string;
};

type OverviewDependencies = {
  authorization: AdminAuthorizationDependencies;
  loadOverview: () => Promise<AdminOverview>;
};

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
});

const parseExactCount = (header: string | null) => {
  const total = header?.split("/").at(-1);
  if (!total || total === "*") throw new Error("admin_overview_count_unavailable");
  const value = Number(total);
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("admin_overview_count_invalid");
  return value;
};

const countRows = async (table: string, query = "", fetcher: typeof fetch = fetch) => {
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetcher(
    `${requireEnv("SUPABASE_URL")}/rest/v1/${table}?select=*${query}`,
    {
      method: "HEAD",
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        prefer: "count=exact",
      },
    },
  );
  if (!response.ok) throw new Error(`admin_overview_${table}_failed`);
  return parseExactCount(response.headers.get("content-range"));
};

export const loadProductionAdminOverview = async (): Promise<AdminOverview> => {
  const [users, organizers, events, activeParticipants, auditEntries] = await Promise.all([
    countRows("user_roles"),
    countRows("user_roles", "&role=eq.organizer"),
    countRows("activities"),
    countRows("activity_members", "&status=in.(joined,waiting)"),
    countRows("audit_log"),
  ]);

  return {
    users,
    organizers,
    events,
    activeParticipants,
    auditEntries,
    generatedAt: new Date().toISOString(),
  };
};

export async function handleAdminOverview(
  request: Request,
  dependencies: OverviewDependencies = {
    authorization: productionAdminAuthorizationDependencies(),
    loadOverview: loadProductionAdminOverview,
  },
) {
  if (request.method !== "GET") {
    return new Response(null, { status: 405, headers: { Allow: "GET" } });
  }

  try {
    const result = await runAuthorizedAdminAction(
      request,
      dependencies.authorization,
      dependencies.loadOverview,
    );
    if ("status" in result) return json(result.status, { error: result.error });
    return json(200, result.value);
  } catch (error) {
    console.error("admin_overview_failed", {
      reason: error instanceof Error ? error.message.slice(0, 80) : "unknown",
    });
    return json(503, { error: "overview_unavailable" });
  }
}

export default createVercelHandler(handleAdminOverview);
