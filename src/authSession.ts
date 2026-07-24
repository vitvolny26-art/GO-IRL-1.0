import { resolveDemoIdentity, type DemoIdentityResolution } from "./securityIdentity";
import { getTelegramInitData, getTelegramWebApp } from "./telegram";
import type { UserRole } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const configuredDemoAuthEnabled = import.meta.env.DEV || import.meta.env.VITE_GO_IRL_LEGACY_DEMO_AUTH === "true";
export const browserMockTelegramId = 999999;
export const browserMockUserKey = `telegram:${browserMockTelegramId}`;
export const browserMockDisplayName = "Vit_Test";
const isBrowserMockAuthEnabled = () => typeof window !== "undefined" && !getTelegramInitData();
const isDemoAuthEnabled = () => configuredDemoAuthEnabled || isBrowserMockAuthEnabled();
const sessionStorageKey = "go-irl-trusted-session-v2";

export type TrustedAuthProvider = "telegram" | "facebook" | "instagram" | "whatsapp";

export type TrustedAuthUser = {
  id: string;
  userKey: string;
  telegramId: number | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  role: UserRole;
  provider?: TrustedAuthProvider;
};

export type TrustedAuthSession = {
  accessToken: string;
  expiresAt: number;
  user: TrustedAuthUser;
  startParam?: string;
  source: "trusted-telegram" | "trusted-provider";
};

export type AppAuthIdentity =
  | TrustedAuthSession
  | (DemoIdentityResolution & { source: DemoIdentityResolution["source"]; legacy: true });

type AuthIdentityLike = {
  user?: {
    userKey?: string | null;
    firstName?: string | null;
    username?: string | null;
  };
  userKey?: string | null;
  firstName?: string | null;
  username?: string | null;
};

export const readAuthUserKey = (identity: unknown) => {
  const auth = identity as AuthIdentityLike | null;
  return auth?.user?.userKey || auth?.userKey || null;
};

export const readAuthDisplayName = (identity: unknown) => {
  const auth = identity as AuthIdentityLike | null;
  return auth?.user?.firstName || auth?.user?.username || auth?.firstName || auth?.username || "GO IRL User";
};

let trustedSession: TrustedAuthSession | null = readTrustedSession();
let legacyIdentity: DemoIdentityResolution | null = null;
let authError: string | null = null;

function readTrustedSession() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(sessionStorageKey) || "null") as TrustedAuthSession | null;
    if (!parsed?.accessToken || !parsed.expiresAt || !parsed.user?.userKey) return null;
    if (parsed.expiresAt <= Math.floor(Date.now() / 1000) + 60) return null;
    if (parsed.source !== "trusted-telegram" && parsed.source !== "trusted-provider") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeTrustedSession(session: TrustedAuthSession) {
  trustedSession = session;
  sessionStorage.setItem(sessionStorageKey, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("go-irl-auth-changed", { detail: { provider: session.user.provider || "telegram" } }));
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
    const providerSession = readTrustedSession();
    if (providerSession) {
      trustedSession = providerSession;
      return providerSession;
    }
    const legacy = resolveLegacyDemoIdentity();
    if (legacy) return { ...legacy, legacy: true } as const;
    authError = "trusted_identity_missing";
    return null;
  }

  if (!supabaseUrl || !publishableKey) {
    authError = "trusted_auth_env_missing";
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
      user: { ...payload.user, provider: "telegram" },
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

export function startMetaProviderAuth(provider: "facebook" | "instagram", returnTo = window.location.href) {
  const url = new URL("/api/auth", window.location.origin);
  url.searchParams.set("action", "start");
  url.searchParams.set("provider", provider);
  url.searchParams.set("returnTo", returnTo);
  window.location.assign(url.toString());
}

export async function startWhatsAppAuth(phone: string) {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "whatsapp-start", phone }),
  });
  const payload = await response.json() as { error?: string };
  if (!response.ok) throw new Error(payload.error || "whatsapp_auth_start_failed");
}

export async function verifyWhatsAppAuth(phone: string, code: string) {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(trustedSession?.accessToken ? { Authorization: `Bearer ${trustedSession.accessToken}` } : {}),
    },
    body: JSON.stringify({ action: "whatsapp-verify", phone, code }),
  });
  const payload = await response.json() as {
    error?: string;
    accessToken?: string;
    expiresAt?: number;
    user?: TrustedAuthUser;
  };
  if (!response.ok || !payload.accessToken || !payload.expiresAt || !payload.user) {
    throw new Error(payload.error || "whatsapp_auth_verify_failed");
  }
  const session: TrustedAuthSession = {
    accessToken: payload.accessToken,
    expiresAt: payload.expiresAt,
    user: { ...payload.user, provider: "whatsapp" },
    source: "trusted-provider",
  };
  writeTrustedSession(session);
  authError = null;
  return session;
}

export function clearTrustedAuthSession() {
  trustedSession = null;
  sessionStorage.removeItem(sessionStorageKey);
  window.dispatchEvent(new CustomEvent("go-irl-auth-changed", { detail: { provider: null } }));
}

export const getTrustedAccessToken = async () => {
  if (trustedSession && trustedSession.expiresAt > Math.floor(Date.now() / 1000) + 60) {
    return trustedSession.accessToken;
  }

  const session = await initializeTrustedAuth();
  if (session && "source" in session && (session.source === "trusted-telegram" || session.source === "trusted-provider")) {
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
    return [trustedUser.firstName, trustedUser.lastName].filter(Boolean).join(" ") || trustedUser.username || fallback;
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
