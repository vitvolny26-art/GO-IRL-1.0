import { describe, expect, it } from "vitest";
import type { ServiceBooking, ServiceBookingStatus } from "../services/servicesBookingRepository";
import { countBeautyWorkspaceAttention } from "./beautyWorkspaceAttention";

const booking = (status: ServiceBookingStatus): ServiceBooking => ({
  id: `booking-${status}`,
  profileId: "profile-1",
  professionalName: "Studio Vita",
  serviceName: "Маникюр",
  clientUserKey: "client-1",
  clientName: "Client",
  clientContact: "@client",
  contactBeforeConfirmation: false,
  date: "2026-08-05",
  time: "10:30",
  durationMinutes: 75,
  priceCzk: 890,
  currency: "CZK",
  publicLocation: "Olomouc",
  status,
  createdAt: "2026-08-04T20:00:00.000Z",
});

describe("beauty workspace attention count", () => {
  it("counts only pending client requests", () => {
    expect(countBeautyWorkspaceAttention([
      booking("pending"),
      booking("confirmed"),
      booking("completed"),
      booking("pending"),
    ])).toBe(2);
  });

  it("returns zero when the master has nothing to review", () => {
    expect(countBeautyWorkspaceAttention([booking("confirmed"), booking("cancelled")])).toBe(0);
  });
});
