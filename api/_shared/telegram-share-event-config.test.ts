import { describe, expect, it } from "vitest";
import { resolveShareEventDatabaseConfig } from "./telegram-share-event";

describe("share event database configuration", () => {
  it("prefers server-only production credentials", () => {
    const values: Record<string, string> = {
      SUPABASE_URL: "https://server.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
      VITE_SUPABASE_URL: "https://public.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "publishable",
    };

    expect(resolveShareEventDatabaseConfig((name) => values[name] || "")).toEqual({
      url: "https://server.supabase.co",
      key: "service-role",
    });
  });

  it("uses publishable credentials for read-only previews", () => {
    const values: Record<string, string> = {
      VITE_SUPABASE_URL: "https://public.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "publishable",
    };

    expect(resolveShareEventDatabaseConfig((name) => values[name] || "")).toEqual({
      url: "https://public.supabase.co",
      key: "publishable",
    });
  });
});
