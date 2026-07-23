import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  classifyProviderConsentCommand,
  handleProviderWebhook,
} from "./provider-webhook.js";

const runtimeEnv = (globalThis as typeof globalThis & {
  process: { env: Record<string, string | undefined> };
}).process.env;

describe("production provider webhook boundary", () => {
  it.each([
    ["STOP", "revoke"],
    [" стоп ", "revoke"],
    ["Отписаться", "revoke"],
    ["START", "consent"],
    ["старт", "consent"],
    ["Подписаться", "consent"],
    ["Привет", null],
  ])("classifies explicit notification command %s", (text, expected) => {
    expect(classifyProviderConsentCommand(text)).toBe(expected);
  });

  beforeEach(() => {
    runtimeEnv.META_VERIFY_TOKEN = "test-verify-token";
    runtimeEnv.META_APP_SECRET = "test-app-secret";
  });

  afterEach(() => {
    delete runtimeEnv.META_VERIFY_TOKEN;
    delete runtimeEnv.META_APP_SECRET;
    delete runtimeEnv.INSTAGRAM_VERIFY_TOKEN;
    delete runtimeEnv.INSTAGRAM_APP_SECRET;
    delete runtimeEnv.MESSENGER_PAGE_ACCESS_TOKEN;
    delete runtimeEnv.MESSENGER_PAGE_ID;
    delete runtimeEnv.META_GRAPH_VERSION;
    delete runtimeEnv.VERCEL_PROJECT_PRODUCTION_URL;
    vi.unstubAllGlobals();
  });

  it("completes Meta GET verification with the configured token", async () => {
    const response = await handleProviderWebhook("whatsapp", new Request(
      "https://example.test/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=12345",
    ));

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("12345");
  });

  it("rejects a wrong verification token", async () => {
    const response = await handleProviderWebhook("instagram", new Request(
      "https://example.test/api/instagram/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345",
    ));

    expect(response.status).toBe(403);
  });

  it("uses an Instagram-specific verification token when configured", async () => {
    runtimeEnv.INSTAGRAM_VERIFY_TOKEN = "instagram-verify-token";

    const response = await handleProviderWebhook("instagram", new Request(
      "https://example.test/api/instagram/webhook?hub.mode=subscribe&hub.verify_token=instagram-verify-token&hub.challenge=instagram-ready",
    ));

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("instagram-ready");
  });

  it("uses the Instagram app secret for Instagram webhook signatures", async () => {
    runtimeEnv.META_APP_SECRET = "wrong-shared-secret";
    runtimeEnv.INSTAGRAM_APP_SECRET = "test-secret";

    const response = await handleProviderWebhook("instagram", new Request(
      "https://example.test/api/instagram/webhook",
      {
        method: "POST",
        body: '{"object":"page"}',
        headers: {
          "x-hub-signature-256": "sha256=703eda4acf6d31d5b4fdd07887302c53639dcde8453f05f71727ea203f0166c1",
        },
      },
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: 0 });
  });

  it("rejects unsigned POST payloads before parsing or persistence", async () => {
    const response = await handleProviderWebhook("messenger", new Request(
      "https://example.test/api/messenger/webhook",
      { method: "POST", body: '{"object":"page"}' },
    ));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "invalid_signature" });
  });
  it("answers a signed Messenger text with the GO IRL welcome screen", async () => {
    runtimeEnv.MESSENGER_PAGE_ACCESS_TOKEN = "page-token";
    runtimeEnv.MESSENGER_PAGE_ID = "page-id";
    runtimeEnv.META_GRAPH_VERSION = "v23.0";
    runtimeEnv.VERCEL_PROJECT_PRODUCTION_URL = "go-irl-1-0.vercel.app";
    const rawBody = JSON.stringify({
      object: "page",
      entry: [{ messaging: [{
        sender: { id: "psid-1" },
        message: { mid: "mid-1", text: "Привет" },
      }] }],
    });
    const signature = `sha256=${createHmac("sha256", "test-app-secret").update(rawBody).digest("hex")}`;
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleProviderWebhook("messenger", new Request(
      "https://example.test/api/messenger/webhook",
      { method: "POST", body: rawBody, headers: { "x-hub-signature-256": signature } },
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: 1 });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://graph.facebook.com/v23.0/page-id/messages");
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      messaging_type: "RESPONSE",
      recipient: { id: "psid-1" },
      message: {
        attachment: {
          payload: {
            template_type: "button",
            buttons: [{ type: "web_url", url: "https://go-irl-1-0.vercel.app" }],
          },
        },
      },
    });
  });
});
