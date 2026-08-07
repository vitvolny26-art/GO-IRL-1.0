import { describe, expect, it } from "vitest";
import endpointSource from "../../api/beauty/booking-notifications/run.ts?raw";

describe("Beauty booking notification endpoint", () => {
  it("reuses the governed worker authorization and existing production secrets", () => {
    expect(endpointSource).toContain("isReminderWorkerAuthorized(request)");
    expect(endpointSource).toContain('requireEnv("SUPABASE_SERVICE_ROLE_KEY")');
    expect(endpointSource).toContain('requireEnv("TELEGRAM_BOT_TOKEN")');
    expect(endpointSource).not.toContain("BOT_TOKEN=");
  });

  it("runs only the bounded Beauty Telegram worker", () => {
    expect(endpointSource).toContain("runBeautyBookingNotificationWorker(");
    expect(endpointSource).toContain("new BeautyBookingNotificationRepository({");
    expect(endpointSource).toContain("new BeautyBookingTelegramDispatcher({");
    expect(endpointSource).toContain("25,");
  });

  it("does not introduce a new deployment or worker enablement flag", () => {
    expect(endpointSource).toContain('readEnv("REMINDER_WORKER_ENABLED")');
    expect(endpointSource).not.toContain("BEAUTY_NOTIFICATION_WORKER_ENABLED");
  });
});
