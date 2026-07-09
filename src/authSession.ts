import { resolveDemoIdentity, type DemoIdentityResolution } from "./securityIdentity";
import { getTelegramInitData, getTelegramWebApp } from "./telegram";
import type { UserRole } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const configuredDemoAuthEnabled = import.meta.env.DEV || import.meta.env.VITE_GO_IRL_LEGACY_DEMO_AUTH === "true";
const browserMockTelegramId = 999999;
const browserMockDisplayName = "Vit_Test";
const isBrowserMockAuthEnabled = () => typeof window !== "undefined" && !getTelegramInitData();
const isDemoAuthEnabled = () => configuredDemoAuthEnabled || isBrowserMockAuthEnabled();
const sessionStorageKey = "go-irl-trusted-session-v2";

export type TrustedAuthUser = {
  id: string;
  userKey: string;
  telegramId: number;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  role: UserRole;
};

export type TrustedAuthSession = {
  accessToken: string;
  expiresAt: number;
  user: TrustedAuthUser;
  startParam?: string;
  source: "trusted-telegram";
};

export type AppAuthIdentity =
  | TrustedAuthSession
  | (DemoIdentityResolution & { source: DemoIdentityResolution["source"]; legacy: true });

let trustedSession: TrustedAuthSession | null = readTrustedSession();
let legacyIdentity: DemoIdentityResolution | null = null;
let authError: string | null = null;

function readTrustedSession() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(sessionStorageKey) || "null") as TrustedAuthSession | null;
    if (!parsed?.accessToken || !parsed.expiresAt) return null;
    if (parsed.expiresAt <= Math.floor(Date.now() / 1000) + 60) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeTrustedSession(session: TrustedAuthSession) {
  trustedSession = session;
  sessionStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

function resolveLegacyDemoIdentity() {
  if (!isDemoAuthEnabled()) return null;
  if (!legacyIdentity) {
    legacyIdentity = resolveDemoIdentity({
      telegramId: getTelegramWebApp()?.initDataUnsafe?.user?.id || (isBrowserMockAuthEnabled() ? browserMockTelegramId : undefined),
      storage: localStorage,
      randomUUID: () => crypto.randomUUID(),
    });
  }
  return legacyIdentity;
}

export async function initializeTrustedAuth() {
  if (trustedSession && trustedSession.expiresAt > Math.floor(Date.now() / 1000) + 60) {
    return trustedSession;
  }

  const initData = getTelegramInitData();
  if (!initData) {
    const legacy = resolveLegacyDemoIdentity();
    if (legacy) return { ...legacy, legacy: true } as const;
    authError = "telegram_init_data_missing";
    return null;
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/verifyTelegramInitData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: publishableKey,
      },
      body: JSON.stringify({ initData }),
    });

    const payload = await response.json() as {
      error?: string;
      session?: { access_token: string; expires_at: number };
      user?: TrustedAuthUser;
      startParam?: string;
    };

    if (!response.ok || !payload.session?.access_token || !payload.user) {
      authError = payload.error || "trusted_auth_failed";
      return null;
    }

    const session: TrustedAuthSession = {
      accessToken: payload.session.access_token,
      expiresAt: payload.session.expires_at,
      user: payload.user,
      startParam: payload.startParam,
      source: "trusted-telegram",
    };
    writeTrustedSession(session);
    authError = null;
    return session;
  } catch {
    authError = "trusted_auth_unavailable";
    return null;
  }
}

export const getTrustedAccessToken = async () => {
  if (trustedSession && trustedSession.expiresAt > Math.floor(Date.now() / 1000) + 60) {
    return trustedSession.accessToken;
  }

  const session = await initializeTrustedAuth();

  if (session && "source" in session && session.source === "trusted-telegram") {
    return session.accessToken;
  }

  return null;
};

export function isTrustedAuthReady() {
  return Boolean(trustedSession && trustedSession.expiresAt > Math.floor(Date.now() / 1000) + 60);
}

export function getCurrentAuthSession() {
  return trustedSession;
}

export function getCurrentAuthIdentity(): AppAuthIdentity | null {
  if (trustedSession) return trustedSession;
  const legacy = resolveLegacyDemoIdentity();
  return legacy ? { ...legacy, legacy: true } : null;
}

export function getCurrentUserKey() {
  return trustedSession?.user.userKey || resolveLegacyDemoIdentity()?.userKey || "unauthenticated";
}

export function getCurrentUserRole() {
  return trustedSession?.user.role || "user";
}

export function getCurrentStartParam() {
  return trustedSession?.startParam || getTelegramWebApp()?.initDataUnsafe?.start_param;
}

export function getCurrentDisplayName(fallback: string) {
  const trustedUser = trustedSession?.user;
  if (trustedUser) {
    return [trustedUser.firstName, trustedUser.lastName].filter(Boolean).join(" ") || fallback;
  }

  if (isBrowserMockAuthEnabled()) return browserMockDisplayName;

  const telegramUser = isDemoAuthEnabled() ? getTelegramWebApp()?.initDataUnsafe?.user : null;
  return [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(" ") || fallback;
}

export function getAuthError() {
  return authError;
}

export function isLegacyDemoAuthEnabled() {
  return isDemoAuthEnabled();
}

export function isBrowserMockMode() {
  return isBrowserMockAuthEnabled() && !isTrustedAuthReady();
}
