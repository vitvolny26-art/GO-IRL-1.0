import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loadProfessionalDirectory,
  professionalCountLabel,
  professionalsForCity,
  sharedMockProfessionals,
} from "./servicesProfessionalDirectory";

describe("services professional directory", () => {
  it("keeps Studio Vita inside explicit browser demo mode", async () => {
    await expect(loadProfessionalDirectory("olomouc", { browserMock: true })).resolves.toEqual(sharedMockProfessionals);
    expect(professionalsForCity("praha", sharedMockProfessionals)).toEqual([]);
  });

  it("maps the protected public projection without private fields", async () => {
    const rpc = vi.fn(async () => ({
      data: [{
        profile_id: "00000000-0000-4000-8000-000000000001",
        slug: "beauty-0123456789abcdef",
        display_name: "Studio Server",
        city_id: "olomouc",
        public_location: "Centrum, Olomouc",
        service_name: "Manikúra",
        duration_minutes: 60,
        price_czk: 800,
        currency: "CZK",
        public_link: "/beauty/beauty-0123456789abcdef",
        updated_at: "2026-08-01T09:00:00.000Z",
      }],
      error: null,
    }));
    const client = { rpc } as unknown as SupabaseClient;

    const result = await loadProfessionalDirectory("olomouc", { client, browserMock: false });

    expect(rpc).toHaveBeenCalledWith("go_irl_list_public_beauty_professionals", {
      p_requested_city_id: "olomouc",
    });
    expect(result).toEqual([expect.objectContaining({
      displayName: "Studio Server",
      priceCzk: 800,
      currency: "CZK",
    })]);
    expect(result[0]).not.toHaveProperty("contact");
    expect(result[0]).not.toHaveProperty("exactAddress");
  });

  it("does not silently replace a server error with fixtures", async () => {
    const client = {
      rpc: vi.fn(async () => ({ data: null, error: new Error("unavailable") })),
    } as unknown as SupabaseClient;

    await expect(loadProfessionalDirectory("olomouc", { client, browserMock: false }))
      .rejects.toThrow("unavailable");
  });

  it("uses a master label instead of an event label", () => {
    expect(professionalCountLabel("ru", 1)).toBe("мастер");
    expect(professionalCountLabel("ru", 5)).toBe("мастеров");
  });
});
