import type {
  ReminderDelivery,
  ReminderDeliveryOutcome,
} from "./types.js";

export type ReminderWorkerRepository = {
  claim(limit: number): Promise<ReminderDelivery[]>;
  finish(reminderId: string, outcome: ReminderDeliveryOutcome): Promise<void>;
};

export type ReminderDispatcher = {
  send(delivery: ReminderDelivery): Promise<ReminderDeliveryOutcome>;
};

export type ReminderWorkerEvent = {
  reminderId: string;
  provider: ReminderDelivery["provider"];
  attemptCount: number;
  outcome: ReminderDeliveryOutcome["status"];
  errorCode?: string;
};

export type ReminderWorkerSummary = {
  claimed: number;
  sent: number;
  retried: number;
  failed: number;
  cancelled: number;
  events: ReminderWorkerEvent[];
};

export type ReminderWorkerOptions = {
  limit?: number;
  maxAttempts?: number;
  now?: () => Date;
};

const retryDelayMinutes = (attemptCount: number) =>
  Math.min(2 ** Math.max(attemptCount - 1, 0), 30);

const retryAt = (now: Date, attemptCount: number) =>
  new Date(now.getTime() + retryDelayMinutes(attemptCount) * 60_000).toISOString();

const normalizeFailure = (
  delivery: ReminderDelivery,
  error: unknown,
  maxAttempts: number,
  now: Date,
): ReminderDeliveryOutcome => {
  const errorCode = error instanceof Error && error.message
    ? error.message.slice(0, 80)
    : "delivery_exception";
  return delivery.attemptCount >= maxAttempts
    ? { status: "failed", errorCode }
    : {
        status: "retry",
        errorCode,
        retryAt: retryAt(now, delivery.attemptCount),
      };
};

const toEvent = (
  delivery: ReminderDelivery,
  outcome: ReminderDeliveryOutcome,
): ReminderWorkerEvent => ({
  reminderId: delivery.reminderId,
  provider: delivery.provider,
  attemptCount: delivery.attemptCount,
  outcome: outcome.status,
  ...("errorCode" in outcome ? { errorCode: outcome.errorCode } : {}),
});

export async function runReminderWorker(
  repository: ReminderWorkerRepository,
  dispatcher: ReminderDispatcher,
  options: ReminderWorkerOptions = {},
): Promise<ReminderWorkerSummary> {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const maxAttempts = Math.min(Math.max(options.maxAttempts ?? 5, 1), 20);
  const now = options.now ?? (() => new Date());
  const deliveries = await repository.claim(limit);
  const summary: ReminderWorkerSummary = {
    claimed: deliveries.length,
    sent: 0,
    retried: 0,
    failed: 0,
    cancelled: 0,
    events: [],
  };

  for (const delivery of deliveries) {
    let outcome: ReminderDeliveryOutcome;
    try {
      outcome = await dispatcher.send(delivery);
    } catch (error) {
      outcome = normalizeFailure(delivery, error, maxAttempts, now());
    }
    await repository.finish(delivery.reminderId, outcome);
    summary.events.push(toEvent(delivery, outcome));
    if (outcome.status === "sent") summary.sent += 1;
    else if (outcome.status === "retry") summary.retried += 1;
    else if (outcome.status === "failed") summary.failed += 1;
    else summary.cancelled += 1;
  }

  return summary;
}
