import { createClient } from "@supabase/supabase-js";
import {
  getCurrentAuthIdentity,
  getCurrentUserKey,
  getCurrentStartParam,
  getTrustedAccessToken,
  isLegacyDemoAuthEnabled,
} from "./authSession";
import type { DemoIdentityResolution, DemoIdentitySource } from "./securityIdentity";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if ((!url || !publishableKey) && !isLegacyDemoAuthEnabled()) { throw new Error("Supabase environment variables are missing"); } const resolvedSupabaseUrl = url || "http://127.0.0.1:54321"; const resolvedPublishableKey = publishableKey || "demo-browser-mock-key";

export type UserKeyResolutionSource = DemoIdentitySource;

export type UserKeyResolution = DemoIdentityResolution;

export function resolveUserIdentity(): UserKeyResolution {
  const identity = getCurrentAuthIdentity();
  if (identity && "security" in identity) return identity;
  return {
    userKey: getCurrentUserKey(),
    source: "guest-local-storage",
    security: "unsafe-demo-only",
  };
}

const legacyHeaders = () => {
  if (!isLegacyDemoAuthEnabled()) return {};
  const identity = resolveUserIdentity();
  const invitedActivityId = getCurrentStartParam();
  return {
    "x-go-irl-user-key": identity.userKey,
    ...(invitedActivityId ? { "x-go-irl-invite-activity": invitedActivityId } : {}),
  };
};

export const supabase = createClient(resolvedSupabaseUrl, resolvedPublishableKey, {
  auth: { persistSession: false },
  accessToken: getTrustedAccessToken,
  global: {
    headers: legacyHeaders(),
  },
});

export function getUserKey() {
  return getCurrentUserKey();
}

export function getUserKeyResolution() {
  return getCurrentAuthIdentity();
}

