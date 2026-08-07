import { readEnv, requireEnv } from "../../_shared/env.js";
import { createVercelHandler } from "../../_shared/vercel-handler.js";
import { isReminderWorkerAuthorized } from "../../_shared/worker-authorization.js";
import { BeautyBookingNotificationRepository } from "../../../src/beauty/beautyBookingNotificationRepository.js";
import {
  BeautyBookingTelegramDispatcher,
  runBeautyBookingNotificationWorker,
} from "../../../src/beauty/beautyBookingNotifications.js";

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

export async function handleBeautyBookingNotificationsRun(request: Request) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }
  if (!isReminderWorkerAuthorized(request)) return json(401, { error: "unauthorized" });
  if (readEnv("REMINDER_WORKER_ENABLED") !== "true") {
    return json(503, { error: "reminder_worker_disabled" });
  }

  try {
    const summary = await runBeautyBookingNotificationWorker(
      new BeautyBookingNotificationRepository({
        supabaseUrl: requireEnv("SUPABASE_URL"),
        serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
        origin: publicOrigin(),
      }),
      new BeautyBookingTelegramDispatcher({
        botToken: requireEnv("TELEGRAM_BOT_TOKEN"),
      }),
      25,
    );
    console.warn("beauty_booking_notification_worker_completed", summary);
    return json(200, { notifications: summary });
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 100) : "unknown";
    console.error("beauty_booking_notification_worker_failed", { code });
    return json(503, { error: "beauty_booking_notification_worker_failed" });
  }
}

export default createVercelHandler(handleBeautyBookingNotificationsRun);
