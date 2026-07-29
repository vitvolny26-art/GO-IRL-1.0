import { describe, expect, it } from "vitest";
import { assertProfileSaveResponseOwner, verifySavedProfile } from "./profileSaveVerification";
import type { UserProfile, UserProfileDraft } from "./profileTypes";

const draft: UserProfileDraft = {
  displayName: " Vit ",
  bio: "Coffee and volleyball",
  cityId: "olomouc",
  avatarPath: null,
  avatarCode: "GI",
  isPublic: true,
  showFavorites: true,
  favoriteActivityIds: ["coffee", "volleyball"],
};

const profile: UserProfile = {
  userKey: "telegram:1",
  displayName: "Vit",
  bio: "Coffee and volleyball",
  cityId: "olomouc",
  avatarPath: null,
  avatarCode: "GI",
  isPublic: true,
  showFavorites: true,
  favoriteActivityIds: ["volleyball", "coffee"],
  createdAt: "2026-07-29T06:00:00.000Z",
  updatedAt: "2026-07-29T07:00:00.000Z",
};

describe("profile save verification", () => {
  it("accepts a server-refetched profile that matches the normalized draft", () => {
    expect(verifySavedProfile(draft, profile, "telegram:1")).toBe(profile);
  });

  it("rejects stale server state after save", () => {
    expect(() => verifySavedProfile(draft, { ...profile, cityId: "prague" }, "telegram:1"))
      .toThrow("profile_save_verification_failed:cityId");
  });

  it("rejects a save response for another account", () => {
    expect(() => assertProfileSaveResponseOwner("telegram:1", "telegram:2"))
      .toThrow("profile_save_identity_changed");
  });
});
