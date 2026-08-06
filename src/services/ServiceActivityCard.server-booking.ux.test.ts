import { describe, expect, it } from "vitest";
import cardSource from "./ServiceActivityCard.tsx?raw";

describe("Beauty service card server booking wiring", () => {
  it("loads public server availability for the selected profile, service and month", () => {
    expect(cardSource).toContain("loadServiceAvailability(");
    expect(cardSource).toContain("professional.profileId, professional.serviceId, fromDate, toDate");
    expect(cardSource).toContain('availability?.source === "server"');
    expect(cardSource).toContain("setAvailabilityRevision((value) => value + 1)");
  });

  it("submits the selected slot through the transactional booking RPC repository", () => {
    expect(cardSource).toContain("submitServiceBooking({");
    expect(cardSource).toContain("serviceId: professional.serviceId");
    expect(cardSource).toContain("idempotencyKey");
    expect(cardSource).toContain('["created", "existing", "local_created"]');
  });

  it("keeps atomic conflict outcomes visible and does not silently claim success", () => {
    expect(cardSource).toContain('result === "slot_taken"');
    expect(cardSource).toContain('result === "slot_blocked"');
    expect(cardSource).toContain('result === "slot_unavailable"');
    expect(cardSource).toContain('result === "service_unavailable"');
    expect(cardSource).toContain("localMode");
  });
});
