import { createClient } from "@supabase/supabase-js";
import { readEnv, requireEnv } from "../_shared/env.js";
import { createVercelHandler } from "../_shared/vercel-handler.js";
import { isReminderWorkerAuthorized } from "../_shared/worker-authorization.js";

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
});

const statuses = ["scheduled", "sending", "sent", "failed", "cancelled"] as const;

export async function handleReminderHealth(request: Request) {
  if (request.method !== "GET") {
    return new Response(null, { status: 405, headers: { Allow: "GET" } });
  }
  if (!isReminderWorkerAuthorized(request)) return json(401, { error: "unauthorized" });

  try {
    const client = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const counts = await Promise.all(statuses.map(async (status) => {
      const { count, error } = await client
        .from("event_reminders")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      if (error) throw new Error(`reminder_health_count_failed:${error.code || status}`);
      return [status, count || 0] as const;
    }));
    const now = new Date();
    const { data: overdue, error: overdueError } = await client
      .from("event_reminders")
      .select("scheduled_for,next_attempt_at")
      .in("status", ["scheduled", "failed"])
      .lte("scheduled_for", now.toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (overdueError) throw new Error(`reminder_health_overdue_failed:${overdueError.code || "unknown"}`);
    const oldestDueAt = overdue
      ? String(overdue.next_attempt_at || overdue.scheduled_for)
      : null;
    const oldestDueAgeSeconds = oldestDueAt
      ? Math.max(0, Math.floor((now.getTime() - new Date(oldestDueAt).getTime()) / 1000))
      : 0;
    return json(200, {
      ok: oldestDueAgeSeconds < 300,
      workerEnabled: readEnv("REMINDER_WORKER_ENABLED") === "true",
      providers: (readEnv("REMINDER_ENABLED_PROVIDERS") || "telegram")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      counts: Object.fromEntries(counts),
      oldestDueAgeSeconds,
      checkedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("reminder_health_failed", {
      code: error instanceof Error ? error.message.slice(0, 100) : "unknown",
    });
    return json(503, { error: "reminder_health_failed" });
  }
}

export default createVercelHandler(handleReminderHealth);
