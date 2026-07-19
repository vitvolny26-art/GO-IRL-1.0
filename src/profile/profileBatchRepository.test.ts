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

const profileRows = [
  {
    user_key: "telegram:1",
    display_name: "One",
    bio: "Public",
    city_id: "olomouc",
    avatar_path: null,
    avatar_code: "O",
    is_public: true,
    show_favorites: true,
    created_at: "2026-07-19T06:00:00.000Z",
    updated_at: "2026-07-19T06:30:00.000Z",
  },
  {
    user_key: "telegram:2",
    display_name: "Two",
    bio: "Hidden favorites",
    city_id: "olomouc",
    avatar_path: null,
    avatar_code: "T",
    is_public: true,
    show_favorites: false,
    created_at: "2026-07-19T06:00:00.000Z",
    updated_at: "2026-07-19T06:30:00.000Z",
  },
];

const createBatchClient = () => {
  const calls: Array<{ table: string; keys: string[] }> = [];

  const client = {
    from(table: string) {
      const query = {
        select() { return query; },
        in(_column: string, keys: string[]) {
          calls.push({ table, keys });
          if (table === "user_profiles") {
            return Promise.resolve({
              data: profileRows.filter((row) => keys.includes(row.user_key)),
              error: null,
            });
          }
          return {
            order: async () => ({
              data: keys.includes("telegram:1")
                ? [{ user_key: "telegram:1", interest_slug: "coffee" }]
                : [],
              error: null,
            }),
          };
        },
      };
      return query;
    },
  } as unknown as SupabaseClient;

  return { client, calls };
};

describe("public profile batch resolver", () => {
  it("deduplicates local keys and returns explicit nulls without production reads", async () => {
    const repository = new LocalProfileRepository({
      storage: new MemoryStorage(),
      userKey: "guest:test",
      fallbackDisplayName: "Guest",
      fallbackCityId: "olomouc",
      now: () => new Date("2026-07-19T07:00:00.000Z"),
    });

    const result = await repository.loadPublicProfiles([
      "guest:test",
      "other",
      "guest:test",
    ]);

    expect([...result.keys()]).toEqual(["guest:test", "other"]);
    expect(result.get("guest:test")?.displayName).toBe("Guest");
    expect(result.get("other")).toBeNull();
  });

  it("uses one profile query, one interests query, caches hits and caches misses", async () => {
    const { client, calls } = createBatchClient();
    let now = 1_000;
    const repository = new SupabaseProfileRepository(client, "telegram:owner", () => now);

    const first = await repository.loadPublicProfiles([
      "telegram:1",
      "telegram:2",
      "telegram:missing",
      "telegram:1",
    ]);

    expect(calls).toEqual([
      {
        table: "user_profiles",
        keys: ["telegram:1", "telegram:2", "telegram:missing"],
      },
      { table: "user_profile_interests", keys: ["telegram:1"] },
    ]);
    expect(first.get("telegram:1")?.favoriteActivityIds).toEqual(["coffee"]);
    expect(first.get("telegram:2")?.favoriteActivityIds).toEqual([]);
    expect(first.get("telegram:missing")).toBeNull();

    await repository.loadPublicProfiles(["telegram:1", "telegram:missing"]);
    expect(calls).toHaveLength(2);

    now += 30_001;
    await repository.loadPublicProfiles(["telegram:1"]);
    expect(calls).toHaveLength(4);
  });
});
