import { describe, expect, it } from "vitest";
import type { NotificationRecord } from "./contracts.js";
import {
  buildNotificationCenterCursor,
  buildNotificationCenterGroupKey,
  compareNotificationCenterItems,
  getNotificationCenterItemState,
  resolveNotificationCenterDeepLink,
  shouldShowNotificationCenterItem,
  toNotificationCenterItem,
} from "./center-contracts.js";

const record: NotificationRecord = {
  id: "notification-1",
  recipientUserKey: "user-1",
  kind: "participation.request_approved",
  category: "participation",
  subject: { type: "activity", id: "activity-1" },
  payload: { version: 1, activityId: "activity-1" },
  deepLink: { view: "activity", entityId: "activity-1" },
  deduplicationKey: "dedupe",
  serviceCritical: true,
  createdAt: "2026-07-26T10:00:00.000Z",
};

describe("notification center contracts", () => {
  it("derives unread, read and opened state", () => {
    expect(getNotificationCenterItemState(record)).toBe("unread");
    expect(getNotificationCenterItemState({ readAt: "2026-07-26T10:01:00.000Z" })).toBe("read");
    expect(getNotificationCenterItemState({ readAt: null, openedAt: "2026-07-26T10:02:00.000Z" })).toBe("opened");
  });

  it("projects canonical records without changing identity", () => {
    const item = toNotificationCenterItem(record);
    expect(item.id).toBe(record.id);
    expect(item.state).toBe("unread");
    expect(buildNotificationCenterCursor(item)).toEqual({
      createdAt: record.createdAt,
      notificationId: record.id,
    });
  });

  it("orders newest first with deterministic id tie break", () => {
    const older = { createdAt: "2026-07-25T10:00:00.000Z", id: "a" };
    const newer = { createdAt: "2026-07-26T10:00:00.000Z", id: "b" };
    expect(compareNotificationCenterItems(older, newer)).toBeGreaterThan(0);
    expect(compareNotificationCenterItems({ ...newer, id: "a" }, newer)).toBeGreaterThan(0);
  });

  it("builds stable daily subject groups", () => {
    expect(buildNotificationCenterGroupKey(toNotificationCenterItem(record))).toEqual({
      category: "participation",
      subjectType: "activity",
      subjectId: "activity-1",
      localDate: "2026-07-26",
    });
  });

  it("keeps service-critical history visible after expiry", () => {
    expect(shouldShowNotificationCenterItem({ expiresAt: "2026-07-25T00:00:00.000Z", serviceCritical: true }, "2026-07-26T00:00:00.000Z")).toBe(true);
    expect(shouldShowNotificationCenterItem({ expiresAt: "2026-07-25T00:00:00.000Z", serviceCritical: false }, "2026-07-26T00:00:00.000Z")).toBe(false);
  });

  it("falls back safely for missing, expired or unavailable targets", () => {
    expect(resolveNotificationCenterDeepLink({ deepLink: null }, "2026-07-26T00:00:00.000Z").status).toBe("fallback");
    expect(resolveNotificationCenterDeepLink({ deepLink: record.deepLink, expiresAt: "2026-07-25T00:00:00.000Z" }, "2026-07-26T00:00:00.000Z")).toMatchObject({ reason: "expired" });
    expect(resolveNotificationCenterDeepLink({ deepLink: record.deepLink }, "2026-07-26T00:00:00.000Z", false)).toMatchObject({ reason: "target_unavailable" });
    expect(resolveNotificationCenterDeepLink({ deepLink: record.deepLink }, "2026-07-26T00:00:00.000Z").status).toBe("resolved");
  });
});
