import { afterEach, describe, expect, it, vi } from "vitest";
import { sendProviderInvitation } from "./provider-messages.js";

const httpsRequestMock = vi.hoisted(() => vi.fn());

vi.mock("node:https", () => ({
  request: httpsRequestMock,
}));

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
    delete runtimeEnv.VERCEL_URL;
    delete runtimeEnv.VERCEL_ENV;
    httpsRequestMock.mockReset();
    vi.unstubAllGlobals();
  });

  const mockHttpsResponse = (statusCode: number, body = "{}") => {
    httpsRequestMock.mockImplementation((
      _url: string,
      _options: unknown,
      onResponse: (response: {
        statusCode: number;
        setEncoding: (encoding: string) => void;
        on: (event: string, callback: (chunk?: string) => void) => void;
      }) => void,
    ) => {
      const responseListeners = new Map<string, (chunk?: string) => void>();
      const response = {
        statusCode,
        setEncoding: vi.fn(),
        on: vi.fn((event: string, callback: (chunk?: string) => void) => {
          responseListeners.set(event, callback);
        }),
      };
      const requestListeners = new Map<string, (error: Error) => void>();
      return {
        on: vi.fn((event: string, callback: (error: Error) => void) => {
          requestListeners.set(event, callback);
        }),
        end: vi.fn(() => {
          onResponse(response);
          responseListeners.get("data")?.(body);
          responseListeners.get("end")?.();
        }),
      };
    });
  };

  it("keeps preview invitation actions on the current preview deployment", async () => {
    runtimeEnv.INSTAGRAM_API_MODE = "instagram_login";
    runtimeEnv.INSTAGRAM_ACCESS_TOKEN = "secret-token";
    runtimeEnv.META_APP_SECRET = "meta-app-secret";
    runtimeEnv.META_GRAPH_VERSION = "v23.0";
    runtimeEnv.VERCEL_ENV = "preview";
    runtimeEnv.VERCEL_URL = "go-irl-preview.vercel.app";
    runtimeEnv.VERCEL_PROJECT_PRODUCTION_URL = "go-irl-1-0.vercel.app";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendProviderInvitation("instagram", "1234567890123456", event);

    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      message?: { attachment?: { payload?: { elements?: Array<{ default_action?: { url?: string } }> } } };
    };
    expect(request.message?.attachment?.payload?.elements?.[0]?.default_action?.url)
      .toContain("https://go-irl-preview.vercel.app/api/meta/event-preview");
  });

  it("attaches public event and portable calendar actions to the signed GO IRL card", async () => {
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
        buttons?: Array<{ type?: string; title?: string; url?: string; payload?: string }>;
      }> } } };
    };
    const element = request.message?.attachment?.payload?.elements?.[0];
    expect(element?.image_url)
      .toMatch(/^https:\/\/go-irl-1-0\.vercel\.app\/api\/meta\/event-invitation-card\?token=/);
    expect(element?.image_url).toContain("&v=6");
    const previewUrl = `https://go-irl-1-0.vercel.app/api/meta/event-preview?event=${event.eventId}&language=ru`;
    const calendarUrl = `https://go-irl-1-0.vercel.app/api/meta/event-preview?event=${event.eventId}&language=ru&format=ics`;
    expect(element?.default_action?.url).toBe(previewUrl);
    expect(element?.buttons?.[0]).toEqual({
      type: "postback",
      title: "Присоединиться",
      payload: `join:${event.eventId}`,
    });
    expect(element?.buttons?.[1]).toEqual({
      type: "web_url",
      title: "Открыть событие",
      url: previewUrl,
    });
    expect(element?.buttons?.[2]).toEqual({
      type: "web_url",
      title: "В календарь",
      url: calendarUrl,
    });
  });

  it("uses the current Instagram Login Send API endpoint", async () => {
    runtimeEnv.INSTAGRAM_API_MODE = "instagram_login";
    runtimeEnv.INSTAGRAM_ACCESS_TOKEN = " \r\nsecret-\n to\u2060ken\u200B \n ";
    runtimeEnv.META_GRAPH_VERSION = "v23.0";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendProviderInvitation("instagram", "1234567890123456", event);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://graph.instagram.com/v23.0/me/messages");
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      authorization: "Bearer secret-token",
    });
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

  it("retries a failed fetch through the native HTTPS transport", async () => {
    runtimeEnv.INSTAGRAM_API_MODE = "instagram_login";
    runtimeEnv.INSTAGRAM_ACCESS_TOKEN = "secret-token";
    runtimeEnv.META_GRAPH_VERSION = "v23.0";
    const fetchMock = vi.fn().mockRejectedValue(Object.assign(new TypeError("fetch failed"), {
      cause: { errors: [{ code: "ENETUNREACH", address: "sensitive-address" }] },
    }));
    vi.stubGlobal("fetch", fetchMock);
    mockHttpsResponse(200);

    await expect(sendProviderInvitation(
      "instagram",
      "sensitive-recipient-id",
      event,
    )).resolves.toBeUndefined();
    expect(httpsRequestMock).toHaveBeenCalledOnce();
    expect(httpsRequestMock.mock.calls[0]?.[0]).toBe("https://graph.instagram.com/v23.0/me/messages");
    expect(httpsRequestMock.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      headers: {
        authorization: "Bearer secret-token",
        "content-type": "application/json",
      },
    });
  });

  it("wraps native HTTPS failures with only a safe transport code", async () => {
    runtimeEnv.INSTAGRAM_API_MODE = "instagram_login";
    runtimeEnv.INSTAGRAM_ACCESS_TOKEN = "secret-token";
    runtimeEnv.META_GRAPH_VERSION = "v23.0";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    httpsRequestMock.mockImplementation(() => ({
      on: vi.fn((event: string, callback: (error: Error) => void) => {
        if (event === "error") {
          callback(Object.assign(new Error("connect failed"), {
            code: "ECONNRESET",
            address: "sensitive-address",
          }));
        }
      }),
      end: vi.fn(),
    }));

    await expect(sendProviderInvitation(
      "instagram",
      "sensitive-recipient-id",
      event,
    )).rejects.toThrow("meta_transport_failed:ECONNRESET");
  });
});

