import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initData = "query_id=test&auth_date=1785157078&hash=test";

describe("trusted auth initialization", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "publishable-test-key");
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.doUnmock("./telegram");
  });

  it("shares one in-flight verification request across concurrent callers", async () => {
    vi.doMock("./telegram", () => ({
      getTelegramInitData: () => initData,
      getTelegramWebApp: () => null,
    }));

    let resolveRequest: ((response: Response) => void) | undefined;
    const fetcher = vi.fn(() => new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    }));
    vi.stubGlobal("fetch", fetcher);

    const { initializeTrustedAuth } = await import("./authSession");
    const first = initializeTrustedAuth();
    const second = initializeTrustedAuth();
    const third = initializeTrustedAuth();

    expect(fetcher).toHaveBeenCalledTimes(1);

    resolveRequest?.(Response.json({
      session: {
        access_token: "trusted-access-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      },
      user: {
        id: "00000000-0000-4000-8000-000000000001",
        userKey: "telegram:123456",
        telegramId: 123456,
        firstName: "Test",
        lastName: null,
        username: "test_user",
        role: "user",
      },
      startParam: "activity-1",
    }));

    const results = await Promise.all([first, second, third]);

    expect(results).toHaveLength(3);
    expect(results.every((result) => result?.source === "trusted-telegram")).toBe(true);
    expect(results.every((result) => result && "accessToken" in result && result.accessToken === "trusted-access-token")).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("reuses the stored valid session after initialization", async () => {
    vi.doMock("./telegram", () => ({
      getTelegramInitData: () => initData,
      getTelegramWebApp: () => null,
    }));

    const fetcher = vi.fn(async () => Response.json({
      session: {
        access_token: "trusted-access-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      },
      user: {
        id: "00000000-0000-4000-8000-000000000001",
        userKey: "telegram:123456",
        telegramId: 123456,
        firstName: "Test",
        lastName: null,
        username: "test_user",
        role: "user",
      },
    }));
    vi.stubGlobal("fetch", fetcher);

    const { initializeTrustedAuth } = await import("./authSession");
    const first = await initializeTrustedAuth();
    const second = await initializeTrustedAuth();

    expect(first).toEqual(second);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
