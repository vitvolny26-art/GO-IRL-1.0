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
  eventDate: "2026-07-14",
  date: "14 июл.",
  time: "18:00",
  durationMinutes: 90,
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
      message?: { attachment?: { payload?: { elements?: Array<{
        image_url?: string;
        default_action?: { url?: string };
        buttons?: Array<{ title?: string; url?: string }>;
      }> } } };
    };
    const element = request.message?.attachment?.payload?.elements?.[0];
    expect(element?.image_url)
      .toMatch(/^https:\/\/go-irl-1-0\.vercel\.app\/api\/meta\/event-invitation-card\?token=/);
    expect(element?.image_url).toContain("&v=4");
    expect(element?.default_action?.url)
      .toBe(`https://go-irl-1-0.vercel.app/join/${event.eventId}`);
    expect(element?.buttons?.[0]).toEqual({
      type: "web_url",
      title: "Открыть событие",
      url: `https://go-irl-1-0.vercel.app/join/${event.eventId}`,
    });
    expect(element?.buttons?.[1]?.title).toBe("В календарь");
    const calendar = new URL(element?.buttons?.[1]?.url || "https://invalid.example");
    expect(calendar.searchParams.get("text")).toBe(event.title);
    expect(calendar.searchParams.get("dates")).toBe("20260714T180000/20260714T193000");
    expect(calendar.searchParams.get("location")).toContain(event.location);
    expect(calendar.searchParams.get("details"))
      .toContain(`https://go-irl-1-0.vercel.app/join/${event.eventId}`);
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
