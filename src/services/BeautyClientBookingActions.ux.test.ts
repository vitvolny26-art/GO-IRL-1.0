import { describe, expect, it } from "vitest";
import cardSource from "./ServiceActivityCard.tsx?raw";
import bookingsSource from "./ServicesBookingsView.tsx?raw";
import clientRepositorySource from "./servicesBookingClientRepository.ts?raw";
import cancellationMigrationSource from "../../supabase/migrations/20260807142500_beauty_client_cancel_24h_policy.sql?raw";

describe("Beauty client booking actions", () => {
  it("lets the client choose a service inside the booking sheet", () => {
    expect(cardSource).toContain("service-booking-service-select");
    expect(cardSource).toContain("setServicesOpen(true)");
    expect(cardSource).toContain("professional.serviceName");
  });

  it("wires client cancellation to the trusted Beauty RPC", () => {
    expect(bookingsSource).toContain("cancelClientServiceBooking");
    expect(bookingsSource).toContain("cancellationLeadMs = 24 * 60 * 60 * 1000");
    expect(clientRepositorySource).toContain('rpc("go_irl_cancel_my_beauty_booking"');
  });

  it("keeps the 24-hour cutoff enforced server-side", () => {
    expect(cancellationMigrationSource).toContain("status not in ('pending', 'confirmed')");
    expect(cancellationMigrationSource).toContain("interval '24 hours'");
  });
});
