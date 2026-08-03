import { describe, expect, it } from "vitest";
import type { ServicesProfessional } from "../services/servicesProfessionalDirectory";
import { buildBeautyProfessionalProfileSummary } from "./beautyProfessionalProfileModel";

const service = (overrides: Partial<ServicesProfessional> = {}): ServicesProfessional => ({
  profileId: "profile-1",
  slug: "beauty-studio-vita",
  displayName: "Studio Vita",
  cityId: "olomouc",
  publicLocation: "Centrum, Olomouc",
  serviceName: "Gel manicure",
  durationMinutes: 75,
  priceCzk: 890,
  currency: "CZK",
  publicLink: "/beauty/beauty-studio-vita",
  updatedAt: "2026-08-03T00:00:00.000Z",
  ...overrides,
});

describe("Beauty professional profile summary", () => {
  it("groups, deduplicates, and sorts services for one professional", () => {
    const summary = buildBeautyProfessionalProfileSummary([
      service(),
      service({ serviceName: "Nail repair", durationMinutes: 30, priceCzk: 290 }),
      service(),
      service({ profileId: "profile-2", slug: "beauty-other", priceCzk: 100 }),
    ], "beauty-studio-vita");

    expect(summary?.services.map((item) => item.serviceName)).toEqual(["Nail repair", "Gel manicure"]);
    expect(summary?.priceFrom).toBe(290);
    expect(summary?.durationFrom).toBe(30);
    expect(summary?.durationTo).toBe(75);
  });

  it("returns null for an unknown invitation slug", () => {
    expect(buildBeautyProfessionalProfileSummary([service()], "beauty-missing")).toBeNull();
  });
});
