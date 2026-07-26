import { describe, expect, it } from "vitest";
import {
  activityChatReleasePolicy,
  buildActivityChatClientMessageKey,
  canPublishAnnouncement,
  decideActivityChatAccess,
  resolveActivityChatLaunchState,
} from "./minimal-release-contracts.js";

describe("activity chat minimal release contracts", () => {
  it("opens an active chat after activity start", () => {
    expect(resolveActivityChatLaunchState(
      { status: "active", expiresAt: "2026-07-27T12:00:00Z" },
      "2026-07-26T10:00:00Z",
      new Date("2026-07-26T11:00:00Z"),
    )).toBe("open");
  });

  it("keeps expired chat read only", () => {
    expect(resolveActivityChatLaunchState(
      { status: "expired", expiresAt: "2026-07-26T10:00:00Z" },
      "2026-07-26T08:00:00Z",
      new Date("2026-07-26T11:00:00Z"),
    )).toBe("read_only");
  });

  it("grants active members read-write access only while open", () => {
    expect(decideActivityChatAccess("open", { role: "participant", status: "active" })).toEqual({
      allowed: true,
      role: "participant",
      mode: "read_write",
    });
    expect(decideActivityChatAccess("read_only", { role: "participant", status: "active" })).toEqual({
      allowed: true,
      role: "participant",
      mode: "read_only",
    });
  });

  it("restricts announcements to elevated roles", () => {
    expect(canPublishAnnouncement("organizer")).toBe(true);
    expect(canPublishAnnouncement("participant")).toBe(false);
  });

  it("defines a minimal text-only release", () => {
    expect(activityChatReleasePolicy.attachmentsEnabled).toBe(false);
    expect(activityChatReleasePolicy.mentionsEnabled).toBe(false);
    expect(activityChatReleasePolicy.textMessagesOnly).toBe(true);
  });

  it("builds stable client idempotency keys", () => {
    expect(buildActivityChatClientMessageKey("chat 1", "user/1", "client:1"))
      .toBe("chat%201:user%2F1:client%3A1");
  });
});
