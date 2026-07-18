import { beforeAll, describe, expect, it, vi } from "vitest";
import type { CoachRequest } from "../types";

let isActiveCoachRequest: typeof import("./CoachRequestPanel")["isActiveCoachRequest"];

beforeAll(async () => {
  vi.stubEnv("VITE_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
  ({ isActiveCoachRequest } = await import