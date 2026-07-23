import { describe, expect, it } from "vitest";
import { digestProviderInboundEvent } from "./provider-inbound-service.js";

describe("provider inbound event privacy boundary", () => {
  it("creates a stable provider-scoped SHA-256 key without retaining the raw event ID", async () => {
    const messenger = await digestProviderInboundEvent("messenger", "mid-sensitive-1");
    const same = await digestProviderInboundEvent("messenger", "mid-sensitive-1");
    const instagram = await digestProviderInboundEvent("instagram", "mid-sensitive-1");

    expect(messenger).toMatch(/^[0-9a-f]{64}$/);
    expect(messenger).toBe(same);
    expect(messenger).not.toBe(instagram);
    expect(messenger).not.toContain("mid-sensitive-1");
  });
});
