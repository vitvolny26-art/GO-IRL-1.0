export type AccountLifecycleReason = "logout" | "account_switch" | "session_expired";

export type AccountScopedInvalidator = {
  id: string;
  clear: () => void | Promise<void>;
};

export type AccountLifecycleResult = {
  status: "completed" | "failed";
  correlationId: string;
  reason: AccountLifecycleReason;
  cleared: string[];
  failed: string[];
};

const invalidators = new Map<string, AccountScopedInvalidator>();

const createCorrelationId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `go-irl-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const registerAccountScopedInvalidator = (invalidator: AccountScopedInvalidator) => {
  invalidators.set(invalidator.id, invalidator);

  return () => {
    if (invalidators.get(invalidator.id) === invalidator) {
      invalidators.delete(invalidator.id);
    }
  };
};

export const clearAccountScopedState = async (
  reason: AccountLifecycleReason,
  correlationId = createCorrelationId(),
): Promise<AccountLifecycleResult> => {
  const cleared: string[] = [];
  const failed: string[] = [];

  for (const invalidator of invalidators.values()) {
    try {
      await invalidator.clear();
      cleared.push(invalidator.id);
    } catch {
      failed.push(invalidator.id);
    }
  }

  return {
    status: failed.length === 0 ? "completed" : "failed",
    correlationId,
    reason,
    cleared,
    failed,
  };
};

export const createSupportCorrelationId = createCorrelationId;

export const __resetAccountLifecycleForTests = () => {
  invalidators.clear();
};
