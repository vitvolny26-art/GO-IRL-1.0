import { afterEach, describe, expect, it, vi } from "vitest";
import { sendProviderInvitation } from "./provider-messages.js";

const runtimeEnv = (globalThis as typeof globalThis & {
  process: { env: Record<string, string | undefined> };
}).process.env;

const event = {
  eventId: "123e4567-e89b-42d3-a456-426614174000",
  title: "Прогулка",
  dateTime: "2026-07-14 18:00",
  location: "Оломоуц",
  availableSpots: 4,
};

describe("provider message endpoints", () => {
  afterEach(() => {
    delete runtimeEnv.INSTAGRAM_API_MODE;
    delete runtimeEnv.INSTAGRAM_ACCOUNT_ID;
    delete runtimeEnv.INSTAGRAM_ACCESS_TOKEN;
    delete runtimeEnv.META_GRAPH_VERSION;
    delete runtimeEnv.META_APP_SECRET;
    delete runtimeEnv.VERCEL_PROJECT_PRODUCTION_URL;
    vi.unstubAllGlobals();
  });

  it("attaches a signed public GO IRL card when the deployment origin is available", async () => {
    runtimeEnv.INSTAGRAM_API_MODE = "instagram_login";
    runtimeEnv.INSTAGRAM_ACCESS_TOKEN = "secret-token";
    runtimeEnv.META_APP_SECRET = "meta-app-secret";
    runtimeEnv.META_GRAPH_VERSION = "v23.0";
    runtimeEnv.VERCEL_PROJECT_PRODUCTION_URL = "go-irl-1-0.vercel.app";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendProviderInvitation("instagram", "1234567890123456", {
      ...event,
      inviteUrl: `https://t.me/GOirl_bot?startapp=${event.eventId}`,
    });

    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      message?: { attachment?: { payload?: { elements?: Array<{ image_url?: string }> } } };
    };
    expect(request.message?.attachment?.payload?.elements?.[0]?.image_url)
      .toMatch(/^https:\/\/go-irl-1-0\.vercel\.app\/api\/meta\/event-invitation-card\?token=/);
    expect(request.message?.attachment?.payload?.elements?.[0]?.image_url).toContain("&v=2");
  });

  it("uses the current Instagram Login Send API endpoint", async () => {
    runtimeEnv.INSTAGRAM_API_MODE = "instagram_login";
    runtimeEnv.INSTAGRAM_ACCESS_TOKEN = "secret-token";
    runtimeEnv.META_GRAPH_VERSION = "v23.0";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendProviderInvitation("instagram", "1234567890123456", event);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://graph.instagram.com/v23.0/me/messages");
  });

  it("keeps the page-linked Instagram endpoint available for legacy apps", async () => {
    runtimeEnv.INSTAGRAM_ACCOUNT_ID = "987654321";
    runtimeEnv.INSTAGRAM_ACCESS_TOKEN = "secret-token";
    runtimeEnv.META_GRAPH_VERSION = "v23.0";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendProviderInvitation("instagram", "1234567890123456", event);

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://graph.facebook.com/v23.0/987654321/messages");
  });
});
