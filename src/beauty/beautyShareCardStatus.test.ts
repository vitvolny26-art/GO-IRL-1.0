import { describe, expect, it, vi } from "vitest";
import {
  canReadBeautyShareCardStatus,
  loadBeautyShareCardStatus,
} from "./beautyShareCardStatus";

describe("Beauty share-card staff status", () => {
  it("allows only organizer and admin staff roles", () => {
    expect(canReadBeautyShareCardStatus("organizer")).toBe(true);
    expect(canReadBeautyShareCardStatus("admin")).toBe(true);
    expect(canReadBeautyShareCardStatus("professional")).toBe(false);
    expect(canReadBeautyShareCardStatus("moderator")).toBe(false);
    expect(canReadBeautyShareCardStatus("user")).toBe(false);
  });

  it("does not call the private status RPC for unauthorized or browser-mock users", async () => {
    const rpc = vi.fn();
    await expect(loadBeautyShareCardStatus("profile-1", {
      client: { rpc },
      role: "user",
      browserMock: false,
    })).resolves.toBeNull();
    await expect(loadBeautyShareCardStatus("profile-1", {
      client: { rpc },
      role: "admin",
      browserMock: true,
    })).resolves.toBeNull();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("maps the released status RPC projection", async () => {
    const rpc = vi.fn(async () => ({
      data: [{
        profile_id: "profile-1",
        card_status: "ready",
        template_version: 1,
        has_generated_image: true,
        generated_at: "2026-08-05T18:14:00.000Z",
        updated_at: "2026-08-05T18:15:00.000Z",
      }],
      error: null,
    }));

    await expect(loadBeautyShareCardStatus("profile-1", {
      client: { rpc },
      role: "organizer",
      browserMock: false,
    })).resolves.toEqual({
      profileId: "profile-1",
      status: "ready",
      templateVersion: 1,
      hasGeneratedImage: true,
      generatedAt: "2026-08-05T18:14:00.000Z",
      updatedAt: "2026-08-05T18:15:00.000Z",
    });
    expect(rpc).toHaveBeenCalledWith("go_irl_get_beauty_share_card_status", {
      p_profile_id: "profile-1",
    });
  });

  it("treats a missing RPC as unavailable without exposing fixtures", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { code: "PGRST202", message: "Could not find the function" },
    }));
    await expect(loadBeautyShareCardStatus("profile-1", {
      client: { rpc },
      role: "admin",
      browserMock: false,
    })).resolves.toBeNull();
  });

  it("rejects unknown lifecycle values", async () => {
    const rpc = vi.fn(async () => ({
      data: [{
        profile_id: "profile-1",
        card_status: "unknown",
        template_version: 1,
        has_generated_image: false,
        generated_at: null,
        updated_at: "2026-08-05T18:15:00.000Z",
      }],
      error: null,
    }));
    await expect(loadBeautyShareCardStatus("profile-1", {
      client: { rpc },
      role: "admin",
      browserMock: false,
    })).rejects.toThrow("beauty_share_card_status_invalid");
  });
});
