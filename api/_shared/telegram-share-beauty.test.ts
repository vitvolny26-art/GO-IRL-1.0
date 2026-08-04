import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { vi } from "vitest";
import { isBeautyShareSlug, loadPublicBeautyRows, localizeBeautyServiceName } from "./telegram-share-beauty";

describe("Beauty Telegram share", () => {
  it("accepts legacy and editable namespaced English slugs", () => {
    expect(isBeautyShareSlug("beauty-06b9689e8b1ee69a")).toBe(true);
    expect(isBeautyShareSlug("beauty-test-studio")).toBe(true);
    expect(isBeautyShareSlug("test-studio")).toBe(false);
    expect(isBeautyShareSlug("Beauty Test Studio")).toBe(false);
  });

  it("localizes the manicure service in all system languages", () => {
    expect(localizeBeautyServiceName("Маникюр с гель-лаком", "ru")).toBe("Маникюр с гель-лаком");
    expect(localizeBeautyServiceName("Маникюр с гель-лаком", "uk")).toBe("Манікюр з гель-лаком");
    expect(localizeBeautyServiceName("Маникюр с гель-лаком", "cs")).toBe("Manikúra s gel lakem");
    expect(localizeBeautyServiceName("Маникюр с гель-лаком", "en")).toBe("Gel manicure");
  });

  it("uses the same current public Beauty projection as the Services directory", async () => {
    const row = { slug: "beauty-test-studio" };
    const rpc = vi.fn(async () => ({ data: [row], error: null }));

    await expect(loadPublicBeautyRows({ rpc } as unknown as SupabaseClient, "ru")).resolves.toEqual([row]);
    expect(rpc).toHaveBeenCalledWith("go_irl_list_public_beauty_professionals_v3", {
      p_requested_city_id: "olomouc",
      p_language: "ru",
    });
  });

  it("keeps the legacy Beauty projection as a compatibility fallback", async () => {
    const missing = { code: "PGRST202", message: "Could not find the function" };
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: null, error: missing })
      .mockResolvedValueOnce({ data: null, error: missing })
      .mockResolvedValueOnce({ data: [{ slug: "beauty-legacy" }], error: null });

    await expect(loadPublicBeautyRows({ rpc } as unknown as SupabaseClient, "en"))
      .resolves.toEqual([{ slug: "beauty-legacy" }]);
    expect(rpc).toHaveBeenNthCalledWith(3, "go_irl_list_public_beauty_professionals", {
      p_requested_city_id: "olomouc",
    });
  });
});
