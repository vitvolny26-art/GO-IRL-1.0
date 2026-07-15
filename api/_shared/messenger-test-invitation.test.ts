import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MetaEventSummary } from "../../src/meta-messaging/types.js";
import { handleMessengerTestInvitation } from "./messenger-test-invitation.js";

const runtimeEnv = (globalThis as typeof globalThis & {
  process: { env: Record<string, string | undefined> };
}).process.env;

const event: MetaEventSummary = {
  eventId: "123e4567-e89b-42d3-a456-426614174000",
  title: "Board games in Olomouc",
  dateTime: "2026-07-14 18:00",
  location: "Olomouc",
  availableSpots: 4,
};

const request = (body: unknown, token = "test-trigger-token") => new Request(
  "https://example.test/api/messenger/test-invitation",
  {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  },
);

describe("Messenger test invitation trigger", () => {
  beforeEach(() => {
    runtimeEnv.MESSENGER_TEST_TRIGGER_TOKEN = "test-trigger-token";
  });

  afterEach(() => {
    delete runtimeEnv.MESSENGER_TEST_TRIGGER_TOKEN;
    vi.restoreAllMocks();
  });

  it("stays disabled until its dedicated token is configured", async () => {
    delete runtimeEnv.MESSENGER_TEST_TRIGGER_TOKEN;
    const response = await handleMessengerTestInvitation(request({}));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "test_trigger_disabled" });
  });

  it("rejects requests without the configured bearer token before dependencies run", async () => {
    const getEventSummary = vi.fn();
    const response = await handleMessengerTestInvitation(request({}, "wrong-token"), {
      getEventSummary,
      sendInvitation: vi.fn(),
    });

    expect(response.status).toBe(401);
    expect(getEventSummary).not.toHaveBeenCalled();
  });

  it("validates recipient and event identifiers", async () => {
    const response = await handleMessengerTestInvitation(request({
      recipientId: "not-a-psid",
      eventId: "not-an-event-id",
    }), {
      getEventSummary: vi.fn(),
      sendInvitation: vi.fn(),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_request" });
  });

  it("returns not found without sending when the event does not exist", async () => {
    const sendInvitation = vi.fn();
    const response = await handleMessengerTestInvitation(request({
      recipientId: "1234567890123456",
      eventId: event.eventId,
    }), {
      getEventSummary: vi.fn().mockResolvedValue(null),
      sendInvitation,
    });

    expect(response.status).toBe(404);
    expect(sendInvitation).not.toHaveBeenCalled();
  });

  it("sends one invitation for a valid authenticated request", async () => {
    const sendInvitation = vi.fn().mockResolvedValue(undefined);
    const response = await handleMessengerTestInvitation(request({
      recipientId: "1234567890123456",
      eventId: event.eventId,
    }), {
      getEventSummary: vi.fn().mockResolvedValue(event),
      sendInvitation,
    });

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(sendInvitation).toHaveBeenCalledOnce();
    expect(sendInvitation).toHaveBeenCalledWith("1234567890123456", event);
  });

  it("does not expose provider failures", async () => {
    const response = await handleMessengerTestInvitation(request({
      recipientId: "1234567890123456",
      eventId: event.eventId,
    }), {
      getEventSummary: vi.fn().mockResolvedValue(event),
      sendInvitation: vi.fn().mockRejectedValue(new Error("provider secret detail")),
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "invitation_send_failed" });
  });
});
