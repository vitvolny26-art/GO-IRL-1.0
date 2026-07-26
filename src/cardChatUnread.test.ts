import { describe, expect, it } from "vitest";

import { activityIdFromInviteUrl, canShowEventCardUnread } from "./cardChatUnread.js";

const eventId = "11111111-1111-4111-8111-111111111111";

describe("event-card chat unread resolver", () => {
  it("reads Telegram and browser invitation event ids", () => {
    expect(activityIdFromInviteUrl(`https://t.me/GOirl_bot/app?startapp=${eventId}`)).toBe(eventId);
    expect(activityIdFromInviteUrl(`https://go-irl.example/join/${eventId}`)).toBe(eventId);
    expect(activityIdFromInviteUrl("https://go-irl.example/join/demo-sport-run")).toBe("demo-sport-run");
  });

  it("fails closed for unrelated or invalid links", () => {
    expect(activityIdFromInviteUrl("https://go-irl.example/events")).toBe("");
    expect(activityIdFromInviteUrl("not a valid invite")).toBe("");
  });

  it("shows unread only to joined participants with unread messages", () => {
    expect(canShowEventCardUnread(eventId, [eventId], 2)).toBe(true);
    expect(canShowEventCardUnread(eventId, [], 2)).toBe(false);
    expect(canShowEventCardUnread(eventId, [eventId], 0)).toBe(false);
  });
});
