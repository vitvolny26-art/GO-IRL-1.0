import { afterEach, describe, expect, it } from "vitest";
import { isReminderWorkerAuthorized } from "./worker-authorization.js";

const runtimeEnv = (globalThis as typeof globalThis & {
  process: { env: Record<string, string | undefined> };
}).process.env;

describe("reminder worker authorization", () => {
  afterEach(() => {
    delete runtimeEnv.REMINDER_WORKER_SECRET;
  });

  it("requires a sufficiently long exact bearer secret", () => {
    runtimeEnv.REMINDER_WORKER_SECRET = "a".repeat(32);
    expect(isReminderWorkerAuthorized(new Request("https://example.test"))).toBe(false);
    expect(isReminderWorkerAuthorized(new Request("https://example.test", {
      headers: { authorization: `Bearer ${"a".repeat(31)}` },
    }))).toBe(false);
    expect(isReminderWorkerAuthorized(new Request("https://example.test", {
      headers: { authorization: `Bearer ${"a".repeat(32)}` },
    }))).toBe(true);
  });
});
