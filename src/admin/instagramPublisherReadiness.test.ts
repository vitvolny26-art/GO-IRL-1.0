import { describe, expect, it, vi } from "vitest";
import { requestInstagramPublisherReadiness } from "./instagramPublisherReadiness";

const successPayload = {
  accountId: "17841480191590968",
  accountVerified: true,
  permissionStatus: "not_probed",
  requiredPermission: "instagram_business_content_publish",
  username: "go_irl_olomouc",
} as const;

describe("requestInstagramPublisherReadiness", () => {
  it("uses the trusted bearer only in the authorization header", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe("/api/admin/instagram-publisher-readiness");
      expect(String(input)).not.toContain("secret-token");
      expect(init?.method).toBe("GET");
      expect(new Headers(init?.headers).get("authorization")).toBe("Bearer secret-token");
      return new Response(JSON.stringify(successPayload), { status: 200 });
    });

    const result = await requestInstagramPublisherReadiness({
      fetcher: fetcher as typeof fetch,
      getAccessToken: async () => "secret-token",
    });

    expect(result).toEqual({ ok: true, status: 200, ...successPayload });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("fails closed without a trusted session", async () => {
    const fetcher = vi.fn();
    await expect(requestInstagramPublisherReadiness({
      fetcher: fetcher as typeof fetch,
      getAccessToken: async () => null,
    })).resolves.toEqual({ ok: false, status: 401, error: "trusted_session_required" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("maps authorization and provider readiness failures without returning provider bodies", async () => {
    for (const [status, error] of [[403, "access_denied"], [503, "publisher_unavailable"]] as const) {
      const result = await requestInstagramPublisherReadiness({
        fetcher: (async () => new Response(JSON.stringify({ error: "sensitive-provider-message" }), { status })) as typeof fetch,
        getAccessToken: async () => "secret-token",
      });
      expect(result).toEqual({ ok: false, status, error });
      expect(JSON.stringify(result)).not.toContain("sensitive-provider-message");
    }
  });

  it("rejects malformed success payloads", async () => {
    const result = await requestInstagramPublisherReadiness({
      fetcher: (async () => new Response(JSON.stringify({ accountVerified: true }), { status: 200 })) as typeof fetch,
      getAccessToken: async () => "secret-token",
    });
    expect(result).toEqual({ ok: false, status: 502, error: "invalid_readiness_response" });
  });
});
