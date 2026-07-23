import type { EventNotificationDispatcher } from "./dispatcher.js";
import type { EventNotificationRepository } from "./repository.js";

const retryDelayMs = (attempt: number) =>
  Math.min(60 * 60_000, 30_000 * 2 ** Math.max(0, attempt - 1));

export async function runEventNotificationWorker(
  repository: EventNotificationRepository,
  dispatcher: EventNotificationDispatcher,
  limit = 50,
) {
  const deliveries = await repository.claim(limit);
  const summary = { claimed: deliveries.length, sent: 0, retried: 0, failed: 0, cancelled: 0 };
  for (const delivery of deliveries) {
    try {
      const outcome = await dispatcher.send(delivery);
      await repository.finish(delivery.id, outcome);
      summary[outcome.status === "retry" ? "retried" : outcome.status] += 1;
    } catch (error) {
      const code = error instanceof Error ? error.message.slice(0, 80) : "unknown";
      if (delivery.attemptCount >= 5) {
        await repository.finish(delivery.id, { status: "failed", errorCode: code });
        summary.failed += 1;
      } else {
        await repository.finish(delivery.id, {
          status: "retry",
          errorCode: code,
          retryAt: new Date(Date.now() + retryDelayMs(delivery.attemptCount)).toISOString(),
        });
        summary.retried += 1;
      }
    }
  }
  return summary;
}

