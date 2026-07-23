import { createClient } from "@supabase/supabase-js";
import { readEnv, requireEnv } from "../_shared/env.js";
import { createVercelHandler } from "../_shared/vercel-handler.js";
import { isReminderWorkerAuthorized } from "../_shared/worker-authorization.js";
import { SupabaseReminderRepository } from "../../src/reminders/supabase-repository.js";
import {
  MetaReminderDispatcher,
  RoutedReminderDispatcher,
} from "../../src/reminders/meta-dispatcher.js";
import { TelegramReminderDispatcher } from "../../src/reminders/telegram-dispatcher.js";
import { runReminderWorker } from "../../src/reminders/worker.js";
import type { ReminderChannel } from "../../src/reminderPreferences.js";
import { EventNotificationDispatcher } from "../../src/notifications/dispatcher.js";
import { EventNotificationRepository } from "../../src/notifications/repository.js";
import { runEventNotificationWorker } from "../../src/notifications/worker.js";

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
});

const publicOrigin = () => {
  const host = readEnv("VERCEL_PROJECT_PRODUCTION_URL") || readEnv("VERCEL_URL");
  return host ? `https://${host.replace(/^https?:\/\//, "")}` : "https://go-irl-1-0.vercel.app";
};

const supportedProviders: ReminderChannel[] = ["telegram", "whatsapp", "instagram", "messenger"];
const reminderStatuses = ["scheduled", "sending", "sent", "failed", "cancelled"] as const;
const enabledProviders = (): ReminderChannel[] => {
  const configured = readEnv("REMINDER_ENABLED_PROVIDERS") || "telegram";
  const selected = configured
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is ReminderChannel =>
      supportedProviders.includes(value as ReminderChannel));
  return [...new Set<ReminderChannel>(selected.length ? selected : ["telegram"])];
};

async function reminderHealth() {
  const client = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const counts = await Promise.all(reminderStatuses.map(async (status) => {
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
  if (overdueError) {
    throw new Error(`reminder_health_overdue_failed:${overdueError.code || "unknown"}`);
  }
  const oldestDueAt = overdue ? String(overdue.next_attempt_at || overdue.scheduled_for) : null;
  const oldestDueAgeSeconds = oldestDueAt
    ? Math.max(0, Math.floor((now.getTime() - new Date(oldestDueAt).getTime()) / 1000))
    : 0;
  return {
    ok: oldestDueAgeSeconds < 300,
    workerEnabled: readEnv("REMINDER_WORKER_ENABLED") === "true",
    providers: enabledProviders(),
    counts: Object.fromEntries(counts),
    oldestDueAgeSeconds,
    checkedAt: now.toISOString(),
  };
}

export async function handleReminderRun(request: Request) {
  if (request.method !== "POST" && request.method !== "GET") {
    return new Response(null, { status: 405, headers: { Allow: "GET, POST" } });
  }
  if (!isReminderWorkerAuthorized(request)) return json(401, { error: "unauthorized" });
  if (request.method === "GET") {
    try {
      return json(200, await reminderHealth());
    } catch (error) {
      console.error("reminder_health_failed", {
        code: error instanceof Error ? error.message.slice(0, 100) : "unknown",
      });
      return json(503, { error: "reminder_health_failed" });
    }
  }
  if (readEnv("REMINDER_WORKER_ENABLED") !== "true") {
    return json(503, { error: "reminder_worker_disabled" });
  }

  try {
    const providers = enabledProviders();
    const repository = new SupabaseReminderRepository({
      supabaseUrl: requireEnv("SUPABASE_URL"),
      serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      publicOrigin: publicOrigin(),
      providers,
    });
    const telegram = new TelegramReminderDispatcher({
      botToken: requireEnv("TELEGRAM_BOT_TOKEN"),
    });
    const meta = new MetaReminderDispatcher({
      graphVersion: readEnv("META_GRAPH_VERSION") || "v23.0",
      ...(providers.includes("whatsapp") ? {
        whatsapp: {
          phoneNumberId: requireEnv("WHATSAPP_PHONE_NUMBER_ID"),
          accessToken: requireEnv("WHATSAPP_ACCESS_TOKEN"),
          templateName: readEnv("WHATSAPP_REMINDER_TEMPLATE_NAME"),
        },
      } : {}),
      ...(providers.includes("instagram") ? {
        instagram: {
          accountId: requireEnv("INSTAGRAM_ACCOUNT_ID"),
          accessToken: requireEnv("INSTAGRAM_ACCESS_TOKEN"),
          apiMode: readEnv("INSTAGRAM_API_MODE") === "instagram_login"
            ? "instagram_login" as const
            : "facebook_login" as const,
        },
      } : {}),
      ...(providers.includes("messenger") ? {
        messenger: {
          pageId: requireEnv("MESSENGER_PAGE_ID"),
          accessToken: requireEnv("MESSENGER_PAGE_ACCESS_TOKEN"),
        },
      } : {}),
    });
    const dispatcher = new RoutedReminderDispatcher(telegram, meta);
    const summary = await runReminderWorker(repository, dispatcher, { limit: 50, maxAttempts: 5 });
    const notifications = await runEventNotificationWorker(
      new EventNotificationRepository(
        requireEnv("SUPABASE_URL"),
        requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
        publicOrigin(),
        providers,
      ),
      new EventNotificationDispatcher({
        telegramBotToken: requireEnv("TELEGRAM_BOT_TOKEN"),
        graphVersion: readEnv("META_GRAPH_VERSION") || "v23.0",
        ...(providers.includes("whatsapp") ? {
          whatsapp: {
            phoneNumberId: requireEnv("WHATSAPP_PHONE_NUMBER_ID"),
            accessToken: requireEnv("WHATSAPP_ACCESS_TOKEN"),
            templateName: readEnv("WHATSAPP_LIFECYCLE_TEMPLATE_NAME"),
          },
        } : {}),
        ...(providers.includes("instagram") ? {
          instagram: {
            accountId: requireEnv("INSTAGRAM_ACCOUNT_ID"),
            accessToken: requireEnv("INSTAGRAM_ACCESS_TOKEN"),
            apiMode: readEnv("INSTAGRAM_API_MODE") === "instagram_login"
              ? "instagram_login" as const
              : "facebook_login" as const,
          },
        } : {}),
        ...(providers.includes("messenger") ? {
          messenger: {
            pageId: requireEnv("MESSENGER_PAGE_ID"),
            accessToken: requireEnv("MESSENGER_PAGE_ACCESS_TOKEN"),
          },
        } : {}),
      }),
      50,
    );
    console.warn("reminder_worker_completed", {
      claimed: summary.claimed,
      sent: summary.sent,
      retried: summary.retried,
      failed: summary.failed,
      cancelled: summary.cancelled,
      events: summary.events,
      notifications,
    });
    return json(200, { reminders: summary, notifications });
  } catch (error) {
    console.error("reminder_worker_failed", {
      code: error instanceof Error ? error.message.slice(0, 100) : "unknown",
    });
    return json(503, { error: "reminder_worker_failed" });
  }
}

export default createVercelHandler(handleReminderRun);
