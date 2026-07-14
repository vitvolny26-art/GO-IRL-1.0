import { describe, expect, it } from "vitest";
import { handleMetaMockWebhook, parseMetaMessagingTestPayload } from "./mock-webhook";

describe("disabled Meta messaging mock webhooks", () => {
  it("keeps Instagram and Messenger disabled by default", () => {
    expect(handleMetaMockWebhook("instagram", { method: "GET", url: "https://example.test" }).status).toBe(503);
    expect(handleMetaMockWebhook("messenger", { method: "GET", url: "https://example.test" }).status).toBe(503);
  });

  it("supports GET verification only in an explicitly enabled test", () => {
    const response = handleMetaMockWebhook("messenger", {
      method: "GET",
      url: "https://example.test?hub.mode=subscribe&hub.verify_token=test-only&hub.challenge=abc",
    }, { enabled: true, verifyToken: "test-only" });

    expect(response).toEqual({ status: 200, body: "abc" });
  });

  it("parses Instagram quick reply actions", () => {
    const messages = parseMetaMessagingTestPayload("instagram", {
      object: "instagram",
      entry: [{ messaging: [{
        sender: { id: "ig-user-1" },
        message: { mid: "ig-mid-1", text: "Join", quick_reply: { payload: "join:event-meta-1" } },
      }] }],
    });

    expect(messages).toEqual([{
      provider: "instagram",
      id: "ig-mid-1",
      senderId: "ig-user-1",
      text: "Join",
      actionPayload: "join:event-meta-1",
    }]);
  });

  it("parses Messenger postback actions without persistence", () => {
    const payload = {
      object: "page",
      entry: [{ messaging: [{
        sender: { id: "psid-1" },
        timestamp: 1780000000000,
        postback: { payload: "join:event-meta-1" },
      }] }],
    };
    const response = handleMetaMockWebhook(
      "messenger",
      { method: "POST", url: "https://example.test", body: payload },
      { enabled: true },
    );

    expect(response).toEqual({
      status: 200,
      body: {
        received: 1,
        messages: [{
          provider: "messenger",
          id: "messenger:psid-1:1780000000000",
          senderId: "psid-1",
          actionPayload: "join:event-meta-1",
        }],
      },
    });
  });
});
