import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { LocalProfileRepository } from "./localProfileRepository";
import { SupabaseProfileRepository } from "./supabaseProfileRepository";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

type BatchFixture = {
  profileQueries: string[][];
  interestQueries: string[][];
  client: SupabaseClient;
};

const createBatchClient = (): BatchFixture => {
  const profileQueries: string[][] = [];
  const interestQueries: string[][] = [];
  const profiles = [
    {
      user_key: "telegram:1",
      display_name: "Public One",
      bio: "Coffee",
      city_id: "olomouc",
      avatar_path: null,
      avatar_code: "P1",
      is_public: true,
      show_favorites: true,
      created_at: "2026-07-19T06:00:00.000Z",
      updated_at: "2026-07-19T06:30:00.000Z",
    },
    {
      user_key: "telegram:2",
      display_name: "Private Two",
      bio: "Hidden",
      city_id: "olomouc",
      avatar_path: null,
      avatar_code: "P2",
      is_public: false,
      show_favorites: true,
      created_at: "2026-07-19T06:00:00.000Z",
      updated_at: "2026-07-19T06:30:00.000Z",
    },
    {
      user_key: "telegram:3",
      display_name: "Public Three",
      bio: "Running",
      city_id: "olomouc",
      avatar_path: null,
      avatar_code: "P3",
      is_public: true,
      show_favorites: false,
      created_at: "2026-07-19T06:00:00.000Z",
      updated_at: "2026-07-19T06:30:00.000Z",
    },
  ];

  const profileQuery = {
    select: () => profileQuery,
    in: async (_column: string, keys: string[]) => {
      profileQueries.push(keys);
      return { data: profiles.filter((profile) => keys.includes(profile.user_key)), error: null };
    },
  };
  const interestQuery = {
    select: () => interestQuery,
    in: (_column: string, keys: string[]) => {
      interestQueries.push(keys);
      return interestQuery;
    },
    order: async () => ({
      data: [{ user_key: "telegram:1", interest_slug: "coffee" }],
      error: null,
    }),
  };

  return {
    profileQueries,
    interestQueries,
    client: {
      from: (table: string) => table === "user_profiles" ? profileQuery : interestQuery,
    } as unknown as SupabaseClient,
  };
};

describe("batch public profiles", () => {
  it("deduplicates keys and resolves public, private, missing and hidden favorites in two queries", async () => {
    const fixture = createBatchClient();
    const repository = new SupabaseProfileRepository(fixture.client, "telegram:1", () => 1_000);

    const result = await repository.loadPublicProfiles([
      "telegram:1",
      "telegram:2",
      "telegram:1",
      "telegram:3",
      "telegram:missing",
    ]);

    expect(fixture.profileQueries).toEqual([["telegram:1", "telegram:2", "telegram:3", "telegram:missing"]]);
    expect(fixture.interestQueries).toEqual([["telegram:1"]]);
    expect(result.get("telegram:1")?.favoriteActivityIds).toEqual(["coffee"]);
    expect(result.get("telegram:2")).toBeNull();
    expect(result.get("telegram:3")?.favoriteActivityIds).toEqual([]);
    expect(result.get("telegram:missing")).toBeNull();
  });

  it("reuses cached public and null results until the short TTL expires", async () => {
    const fixture = createBatchClient();
    let now = 1_000;
    const repository = new SupabaseProfileRepository(fixture.client, "telegram:1", () => now);

    await repository.loadPublicProfiles(["telegram:1", "telegram:missing"]);
    await repository.loadPublicProfiles(["telegram:missing", "telegram:1"]);
    expect(fixture.profileQueries).toHaveLength(1);

    now = 31_001;
    await repository.loadPublicProfiles(["telegram:1"]);
    expect(fixture.profileQueries).toHaveLength(2);
  });

  it("keeps demo batch reads local and returns only the current demo identity", async () => {
    const storage = new MemoryStorage();
    const repository = new LocalProfileRepository({
      storage,
      userKey: "guest:test",
      fallbackDisplayName: "Demo User",
      fallbackCityId: "olomouc",
      now: () => new Date("2026-07-19T07:00:00.000Z"),
    });

    const result = await repository.loadPublicProfiles(["guest:test", "other", "guest:test"]);

    expect(result.size).toBe(2);
    expect(result.get("guest:test")?.displayName).toBe("Demo User");
    expect(result.get("other")).toBeNull();
  });
});
