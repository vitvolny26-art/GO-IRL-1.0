import { timingSafeEqual } from "node:crypto";
import { readEnv, requireEnv } from "../_shared/env.js";
import { createVercelHandler } from "../_shared/vercel-handler.js";
import { SupabaseReminderRepository } from "../../src/reminders/supabase-repository.js";
import { TelegramReminderDispatcher } from "../../src/reminders/telegram-dispatcher.js";
import { runReminderWorker } from "../../src/reminders/worker.js";

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
});

const authorized = (request: Request) => {
  const expected = readEnv("REMINDER_WORKER_SECRET");
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expectedBytes = new TextEncoder().encode(expected);
  const suppliedBytes = new TextEncoder().encode(supplied);
  return expected.length >= 32
    && expectedBytes.length === suppliedBytes.length
    && timingSafeEqual(expectedBytes, suppliedBytes);
};

const publicOrigin = () => {
  const host = readEnv("VERCEL_PROJECT_PRODUCTION_URL") || readEnv("VERCEL_URL");
  return host ? `https://${host.replace(/^https?:\/\//, "")}` : "https://go-irl-1-0.vercel.app";
};

export async function handleReminderRun(request: Request) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }
  if (!authorized(request)) return json(401, { error: "unauthorized" });
  if (readEnv("REMINDER_WORKER_ENABLED") !== "true") {
    return json(503, { error: "reminder_worker_disabled" });
  }

  try {
    const repository = new SupabaseReminderRepository({
      supabaseUrl: requireEnv("SUPABASE_URL"),
      serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      publicOrigin: publicOrigin(),
      providers: ["telegram"],
    });
    const dispatcher = new TelegramReminderDispatcher({
      botToken: requireEnv("TELEGRAM_BOT_TOKEN"),
    });
    const summary = await runReminderWorker(repository, dispatcher, { limit: 50, maxAttempts: 5 });
    console.warn("reminder_worker_completed", {
      claimed: summary.claimed,
      sent: summary.sent,
      retried: summary.retried,
      failed: summary.failed,
      cancelled: summary.cancelled,
      events: summary.events,
    });
    return json(200, summary);
  } catch (error) {
    console.error("reminder_worker_failed", {
      code: error instanceof Error ? error.message.slice(0, 100) : "unknown",
    });
    return json(503, { error: "reminder_worker_failed" });
  }
}

export default createVercelHandler(handleReminderRun);
