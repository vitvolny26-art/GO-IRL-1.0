import { describe, expect, it } from "vitest";
import { resolveDemoIdentity } from "./securityIdentity";

function memoryStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial) data.set("go-irl-guest-id", initial);
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe("demo identity resolution", () => {
  it("marks Telegram initDataUnsafe identity as unsafe demo-only", () => {
    expect(
      resolveDemoIdentity({
        telegramId: 123,
        storage: memoryStorage(),
        randomUUID: () => "unused",
      }),
    ).toEqual({
      userKey: "telegram:123",
      source: "telegram-init-data-unsafe",
      security: "unsafe-demo-only",
    });
  });

  it("marks local guest identity as unsafe demo-only", () => {
    expect(
      resolveDemoIdentity({
        storage: memoryStorage("guest:existing"),
        randomUUID: () => "unused",
      }),
    ).toEqual({
      userKey: "guest:existing",
      source: "guest-local-storage",
      security: "unsafe-demo-only",
    });
  });
});
