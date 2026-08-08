import { describe, expect, it } from "vitest";
import { resolveGoIrlClient } from "./clientSurface";

describe("resolveGoIrlClient", () => {
  it("uses the web shell without Telegram launch data", () => {
    expect(resolveGoIrlClient(undefined)).toBe("web");
    expect(resolveGoIrlClient({ WebApp: {} })).toBe("web");
  });

  it("preserves the Telegram shell when initData exists", () => {
    expect(resolveGoIrlClient({ WebApp: { initData: "signed-init-data" } })).toBe("telegram");
  });

  it("preserves the Telegram shell when a Telegram user exists", () => {
    expect(resolveGoIrlClient({ WebApp: { initDataUnsafe: { user: { id: 1 } } } })).toBe("telegram");
  });
});
