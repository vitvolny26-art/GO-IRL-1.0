import { describe, expect, it } from "vitest";
import { beautyBookingNotificationRepositoryInternals } from "./beautyBookingNotificationRepository";

const booking = {
  id: "booking-1",
  profile_id: "profile-1",
  client_user_key: "telegram:client",
  starts_at: "2026-08-08T08:30:00.000Z",
  client_name_snapshot: "Anna",
  service_name_snapshot: { en: "Gel manicure" },
  public_location_snapshot: "Olomouc centre",
};
const profile = {
  owner_user_key: "telegram:professional",
  display_name: "Studio Vita",
};
const event = (overrides: Record<string, unknown> = {}) => ({
  id: "event-1",
  booking_id: "booking-1",
  event_type: "booking_created",
  actor_user_key: "telegram:client",
  from_status: null,
  to_status: "pending",
  payload: {},
  created_at: "2026-08-07T05:00:00.000Z",
  ...overrides,
});

describe("Beauty booking notification journal", () => {
  it("routes booking creation to the professional", () => {
    expect(beautyBookingNotificationRepositoryInternals.notificationPlan(
      event() as never,
      booking as never,
      profile as never,
    )).toEqual({
      kind: "booking_requested",
      recipientUserKey: "telegram:professional",
    });
  });

  it("routes professional confirmation to the client", () => {
    expect(beautyBookingNotificationRepositoryInternals.notificationPlan(
      event({ event_type: "status_changed", actor_user_key: "telegram:professional", from_status: "pending", to_status: "confirmed" }) as never,
      booking as never,
      profile as never,
    )).toEqual({
      kind: "booking_confirmed",
      recipientUserKey: "telegram:client",
    });
  });

  it("routes client cancellation to the professional", () => {
    expect(beautyBookingNotificationRepositoryInternals.notificationPlan(
      event({ event_type: "booking_cancelled", from_status: "pending", to_status: "cancelled" }) as never,
      booking as never,
      profile as never,
    )).toEqual({
      kind: "booking_cancelled_by_client",
      recipientUserKey: "telegram:professional",
    });
  });

  it("does not invent completed or no-show notifications while product policy is unresolved", () => {
    expect(beautyBookingNotificationRepositoryInternals.notificationPlan(
      event({ event_type: "status_changed", from_status: "confirmed", to_status: "completed" }) as never,
      booking as never,
      profile as never,
    )).toBeNull();
  });

  it("claims a new source event once and waits for a future retry time", () => {
    const now = new Date("2026-08-07T05:10:00.000Z");
    expect(beautyBookingNotificationRepositoryInternals.nextAttempt([], "event-1", now)).toBe(1);
    expect(beautyBookingNotificationRepositoryInternals.nextAttempt([{
      created_at: "2026-08-07T05:09:00.000Z",
      payload: {
        sourceEventId: "event-1",
        state: "retry",
        attempt: 1,
        retryAt: "2026-08-07T05:11:00.000Z",
      },
    }] as never, "event-1", now)).toBeNull();
  });

  it("reclaims an expired lease but never retries a recorded sent delivery", () => {
    const now = new Date("2026-08-07T05:10:00.000Z");
    expect(beautyBookingNotificationRepositoryInternals.nextAttempt([{
      created_at: "2026-08-07T05:00:00.000Z",
      payload: {
        sourceEventId: "event-1",
        state: "sending",
        attempt: 1,
        claimedAt: "2026-08-07T05:00:00.000Z",
      },
    }] as never, "event-1", now)).toBe(2);
    expect(beautyBookingNotificationRepositoryInternals.nextAttempt([{
      created_at: "2026-08-07T05:00:00.000Z",
      payload: {
        sourceEventId: "event-1",
        state: "sent",
        attempt: 1,
      },
    }] as never, "event-1", now)).toBeNull();
  });
});
