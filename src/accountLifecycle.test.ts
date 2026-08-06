import { afterEach, describe, expect, it, vi } from "vitest";

import {
  __resetAccountLifecycleForTests,
  clearAccountScopedState,
  createSupportCorrelationId,
  registerAccountScopedInvalidator,
} from "./accountLifecycle";

afterEach(() => {
  __resetAccountLifecycleForTests();
});

describe("account lifecycle", () => {
  it("clears every registered account-scoped cache", async () => {
    const clearProfile = vi.fn();
    const clearProviders = vi.fn(async () => undefined);

    registerAccountScopedInvalidator({ id: "profile", clear: clearProfile });
    registerAccountScopedInvalidator({ id: "providers", clear: clearProviders });

    const result = await clearAccountScopedState("logout", "corr-1");

    expect(clearProfile).toHaveBeenCalledOnce();
    expect(clearProviders).toHaveBeenCalledOnce();
    expect(result).toEqual({
      status: "completed",
      correlationId: "corr-1",
      reason: "logout",
      cleared: ["profile", "providers"],
      failed: [],
    });
  });

  it("reports failed invalidators without claiming success", async () => {
    registerAccountScopedInvalidator({
      id: "profile",
      clear: () => {
        throw new Error("storage unavailable");
      },
    });

    const result = await clearAccountScopedState("account_switch", "corr-2");

    expect(result.status).toBe("failed");
    expect(result.cleared).toEqual([]);
    expect(result.failed).toEqual(["profile"]);
  });

  it("unregisters only the matching invalidator", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const unregisterFirst = registerAccountScopedInvalidator({ id: "profile", clear: first });

    registerAccountScopedInvalidator({ id: "profile", clear: second });
    unregisterFirst();

    await clearAccountScopedState("session_expired", "corr-3");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it("creates a non-empty support correlation id", () => {
    expect(createSupportCorrelationId()).toBeTruthy();
  });
});
