import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { AppAuthIdentity } from "../authSession";
import { LocalProfileRepository } from "./localProfileRepository";
import { mapUserProfileDraftToRpc, mapUserProfileRow } from "./profileMappers";
import { createProfileRepository, selectProfileRepositoryKind } from "./profileRepository";
import { SupabaseProfileRepository } from "./supabaseProfileRepository";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const client = {} as SupabaseClient;
const trustedIdentity = {
  accessToken: "token",
  expiresAt: 9999999999,
  source: "trusted-telegram",
  user: {
    id: "user-id",
    userKey: "telegram:1",
    telegramId: 1,
    role: "user",
  },
} as AppAuthIdentity;
const localIdentity = {
  source: "guest-local-storage",
  security: "unsafe-demo-only",
  userKey: "guest:test",
  legacy: true,
} as AppAuthIdentity;

const createOptions = (identity: AppAuthIdentity | null, storage = new MemoryStorage()) => ({
  identity,
  supabaseClient: client,
  storage,
  fallbackDisplayName: "GO IRL User",
  fallbackCityId: "olomouc",
  now: () => new Date("2026-07-19T07:00:00.000Z"),
});

describe("profile repository selection", () => {
  it("selects Supabase only for a trusted Telegram session", () => {
    expect(selectProfileRepositoryKind(trustedIdentity)).toBe("supabase");
    expect(createProfileRepository(createOptions(trustedIdentity))).toBeInstanceOf(SupabaseProfileRepository);
  });

  it("keeps legacy and missing identities local", () => {
    expect(selectProfileRepositoryKind(localIdentity)).toBe("local");
    expect(selectProfileRepositoryKind(null)).toBe("local");
    expect(createProfileRepository(createOptions(localIdentity))).toBeInstanceOf(LocalProfileRepository);
  });
});

describe("profile mappers", () => {
  it("maps database rows and interests into the shared contract", () => {
    expect(mapUserProfileRow({
      user_key: "telegram:1",
      display_name: "Vit",
      bio: "Coffee and volleyball",
      city_id: "olomouc",
      avatar_path: null,
      avatar_code: "GI",
      is_public: true,
      show_favorites: true,
      created_at: "2026-07-19T06:00:00.000Z",
      updated_at: "2026-07-19T06:30:00.000Z",
    }, [{ interest_slug: "coffee" }, { interest_slug: "volleyball" }])).toEqual({
      userKey: "telegram:1",
      displayName: "Vit",
      bio: "Coffee and volleyball",
      cityId: "olomouc",
      avatarPath: null,
      avatarCode: "GI",
      isPublic: true,
      showFavorites: true,
      favoriteActivityIds: ["coffee", "volleyball"],
      createdAt: "2026-07-19T06:00:00.000Z",
      updatedAt: "2026-07-19T06:30:00.000Z",
    });
  });

  it("maps editable fields to the atomic save RPC", () => {
    expect(mapUserProfileDraftToRpc({
      displayName: " Vit ",
      bio: "Bio",
      cityId: "olomouc",
      avatarPath: null,
      avatarCode: "GI",
      isPublic: true,
      showFavorites: false,
      favoriteActivityIds: ["coffee"],
    })).toEqual({
      p_display_name: "Vit",
      p_bio: "Bio",
      p_city_id: "olomouc",
      p_avatar_path: null,
      p_avatar_code: "GI",
      p_is_public: true,
      p_show_favorites: false,
      p_interest_slugs: ["coffee"],
    });
  });
});

describe("LocalProfileRepository", () => {
  it("loads the existing go-irl-profile payload without production writes", async () => {
    const storage = new MemoryStorage();
    storage.setItem("go-irl-registered-at", "2026-07-01T00:00:00.000Z");
    storage.setItem("go-irl-profile", JSON.stringify({
      name: "Local user",
      bio: "Demo profile",
      cityId: "olomouc",
      avatar: "data:image/png;base64,abc",
      registeredAt: "2026-07-01T00:00:00.000Z",
      favoriteActivities: ["coffee"],
    }));

    const repository = createProfileRepository(createOptions(localIdentity, storage));
    const profile = await repository.loadOwnProfile();

    expect(profile?.userKey).toBe("guest:test");
    expect(profile?.avatarPath).toBe("data:image/png;base64,abc");
    expect(profile?.avatarCode).toBeNull();
    expect(profile?.favoriteActivityIds).toEqual(["coffee"]);
  });
});
