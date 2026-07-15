import { describe, expect, it } from "vitest";
import { handleMockWhatsAppWebhook, parseWhatsAppTestPayload } from "./mock-webhook";

describe("disabled WhatsApp mock webhook", () => {
  it("is disabled by default", () => {
    expect(handleMockWhatsAppWebhook({ method: "GET", url: "https://example.test/webhook" })).toEqual({
      status: 503,
      body: { error: "whatsapp_webhook_disabled" },
    });
  });

  it("supports GET verification only when explicitly enabled for a test", () => {
    const response = handleMockWhatsAppWebhook({
      method: "GET",
      url: "https://example.test/webhook?hub.mode=subscribe&hub.verify_token=test-only&hub.challenge=12345",
    }, { enabled: true, verifyToken: "test-only" });

    expect(response).toEqual({ status: 200, body: "12345" });
  });

  it("rejects an invalid test verification token", () => {
    const response = handleMockWhatsAppWebhook({
      method: "GET",
      url: "https://example.test/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345",
    }, { enabled: true, verifyToken: "test-only" });

    expect(response.status).toBe(403);
  });

  it("parses text and Join button replies without persistence", () => {
    const payload = {
      entry: [{ changes: [{ value: { messages: [
        { id: "wamid-1", from: "420700000000", type: "text", text: { body: "Hi" } },
        { id: "wamid-2", from: "420700000000", type: "interactive", interactive: { button_reply: { id: "join:event-75" } } },
      ] } }] }],
    };

    expect(parseWhatsAppTestPayload(payload)).toEqual([
      { id: "wamid-1", from: "420700000000", type: "text", text: "Hi" },
      { id: "wamid-2", from: "420700000000", type: "interactive", replyId: "join:event-75" },
    ]);
    expect(handleMockWhatsAppWebhook(
      { method: "POST", url: "https://example.test/webhook", body: payload },
      { enabled: true },
    ).status).toBe(200);
  });
});
