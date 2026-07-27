import { describe, expect, it, vi } from "vitest";
import { createSingleFlight } from "./singleFlight";

describe("createSingleFlight", () => {
  it("shares one in-flight operation across concurrent callers", async () => {
    let resolveOperation!: (value: string) => void;
    const operation = vi.fn(() => new Promise<string>((resolve) => {
      resolveOperation = resolve;
    }));
    const run = createSingleFlight(operation);

    const first = run();
    const second = run();

    expect(operation).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);

    resolveOperation("session");
    await expect(first).resolves.toBe("session");
  });

  it("allows a new operation after the previous one settles", async () => {
    const operation = vi.fn(async () => "session");
    const run = createSingleFlight(operation);

    await run();
    await run();

    expect(operation).toHaveBeenCalledTimes(2);
  });
});
