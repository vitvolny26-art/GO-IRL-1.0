import { afterEach, describe, expect, it, vi } from "vitest";
import { checkInstagramPublisherReadiness } from "./instagram-publisher-readiness.js";

const runtimeEnv = (globalThis as typeof globalThis & {
  process: { env: Record<string, string | undefined> };
}).process.env;

const configureReadiness = () => {
  runtimeEnv.META_GRAPH_VERSION = "v23.0";
  runtimeEnv.INSTAGRAM_PUBLISH_ACCOUNT_ID = "17841480191590968";
  runtimeEnv.INSTAGRAM_PUBLISH_ACCESS_TOKEN = "publish-secret-token";
};

const jsonResponse = (payload: unknown, status = 200) => new Response(
  JSON.stringify(payload),
  {
    status,
    headers: { "content-type": "application/json" },
  },
);

describe("Instagram publisher readiness", () => {
  afterEach(() => {
    delete runtimeEnv.META_GRAPH_VERSION;
    delete runtimeEnv.INSTAGRAM_PUBLISH_ACCOUNT_ID;
    delete runtimeEnv.INSTAGRAM_PUBLISH_ACCESS_TOKEN;
    vi.unstubAllGlobals();
  });

  it("verifies the token-account binding without publishing", async () => {
    configureReadiness();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      id: "17841480191590968",
      username: "go_irl_olomouc",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(checkInstagramPublisherReadiness()).resolves.toEqual({
      accountId: "17841480191590968",
      accountVerified: true,
      permissionStatus: "not_probed",
      requiredPermission: "instagram_business_content_publish",
      username: "go_irl_olomouc",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://graph.instagram.com/v23.0/me?fields=id%2Cusername",
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({
      authorization: "Bearer publish-secret-token",
      accept: "application/json",
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("publish-secret-token");
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("/media");
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("/media_publish");
  });

  it.each([
    "META_GRAPH_VERSION",
    "INSTAGRAM_PUBLISH_ACCOUNT_ID",
    "INSTAGRAM_PUBLISH_ACCESS_TOKEN",
  ])("fails closed when %s is missing", async (missingName: string) => {
    configureReadiness();
    delete runtimeEnv[missingName];
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(checkInstagramPublisherReadiness()).rejects.toThrow(`missing_environment:${missingName}`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a token bound to a different Instagram account", async () => {
    configureReadiness();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      id: "different-account",
      username: "other_account",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(checkInstagramPublisherReadiness()).rejects.toThrow(
      "instagram_readiness_account_mismatch",
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("sanitizes provider failures without retrying", async () => {
    configureReadiness();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      error: {
        message: "raw provider detail must stay private",
        code: 190,
      },
    }, 401));
    vi.stubGlobal("fetch", fetchMock);

    await expect(checkInstagramPublisherReadiness()).rejects.toThrow(
      "instagram_readiness_provider_failed:401:190",
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("preserves transport cause without retrying", async () => {
    configureReadiness();
    const source = Object.assign(new TypeError("sensitive transport detail"), {
      cause: { code: "ECONNRESET", address: "sensitive-address" },
    });
    const fetchMock = vi.fn().mockRejectedValue(source);
    vi.stubGlobal("fetch", fetchMock);

    let thrown: unknown;
    try {
      await checkInstagramPublisherReadiness();
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe("instagram_readiness_transport_failed:ECONNRESET");
    expect((thrown as Error).cause).toBe(source);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
