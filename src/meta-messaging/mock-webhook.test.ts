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

  it("maps an m.me event referral to the existing rich-card details action for the sender PSID", () => {
    const eventId = "39e31319-a4fc-4d41-bf1e-d713178290d1";
    const messages = parseMetaMessagingTestPayload("messenger", {
      object: "page",
      entry: [{ messaging: [{
        sender: { id: "psid-referral-1" },
        timestamp: 1780000001000,
        referral: { ref: `event:${eventId}`, source: "SHORTLINK", type: "OPEN_THREAD" },
      }] }],
    });

    expect(messages).toEqual([{
      provider: "messenger",
      id: "messenger:psid-referral-1:1780000001000",
      senderId: "psid-referral-1",
      actionPayload: `details:${eventId}`,
    }]);
  });

  it("maps a Messenger postback referral to the same rich-card details action", () => {
    const eventId = "39e31319-a4fc-4d41-bf1e-d713178290d1";
    const messages = parseMetaMessagingTestPayload("messenger", {
      object: "page",
      entry: [{ messaging: [{
        sender: { id: "psid-postback-referral" },
        timestamp: 1780000002000,
        postback: { referral: { ref: `event:${eventId}` } },
      }] }],
    });

    expect(messages[0]?.actionPayload).toBe(`details:${eventId}`);
    expect(messages[0]?.senderId).toBe("psid-postback-referral");
  });

  it("ignores Messenger echo messages to prevent reply loops", () => {
    const messages = parseMetaMessagingTestPayload("messenger", {
      object: "page",
      entry: [{ messaging: [{
        sender: { id: "page-id" },
        message: { mid: "echo-mid", text: "Bot reply", is_echo: true },
      }] }],
    });

    expect(messages).toEqual([]);
  });
});
