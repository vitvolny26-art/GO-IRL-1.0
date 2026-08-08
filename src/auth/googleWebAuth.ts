import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "../types";
import { createWebProviderTrustedSession, type ProviderTrustedSession } from "./providerTrustedSession";
import {
  consumeWebAuthResumeIntent,
  createGoogleWebAuthStartRequest,
  parseWebAuthCallback,
  storeWebAuthResumeIntent,
  webAuthCallbackPath,
} from "./webAuthFlow";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let webAuthClient: SupabaseClient | null = null;

const requireBrowserConfig = () => {
  if (typeof window === "undefined") throw new Error("web_auth_browser_required");
  if (!supabaseUrl || !publishableKey) throw new Error("web_auth_env_missing");
  return { supabaseUrl, publishableKey };
};

const getWebAuthClient = () => {
  if (webAuthClient) return webAuthClient;
  const config = requireBrowserConfig();
  webAuthClient = createClient(config.supabaseUrl, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "pkce",
      persistSession: false,
      storage: window.sessionStorage,
    },
  });
  return webAuthClient;
};

type GoogleBootstrapPayload = {
  error?: string;
  session?: {
    access_token?: string;
    expires_at?: number;
  };
  user?: {
    id?: string;
    userKey?: string;
    provider?: "google";
    providerUserId?: string;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    role?: UserRole;
  };
};

export type GoogleWebAuthCallbackResult =
  | { status: "not_callback" }
  | { status: "success"; session: ProviderTrustedSession<UserRole>; returnTo: string }
  | { status: "error"; error: string };

export async function beginGoogleWebAuth(currentUrl = window.location.href) {
  const config = requireBrowserConfig();
  const request = createGoogleWebAuthStartRequest(currentUrl, window.location.origin);
  storeWebAuthResumeIntent(window.sessionStorage, request);
  const { data, error } = await getWebAuthClient().auth.signInWithOAuth({
    provider: request.provider,
    options: {
      redirectTo: request.redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) {
    window.sessionStorage.removeItem("go-irl-web-auth-resume-v1");
    throw new Error("google_oauth_start_failed");
  }
  window.location.assign(data.url);
  return config.supabaseUrl;
}

export async function completeGoogleWebAuthCallback(): Promise<GoogleWebAuthCallbackResult> {
  if (typeof window === "undefined" || window.location.pathname !== webAuthCallbackPath) {
    return { status: "not_callback" };
  }

  const parsed = parseWebAuthCallback(window.location.href, window.location.origin);
  const resume = consumeWebAuthResumeIntent(window.sessionStorage, window.location.origin);
  if (parsed.status === "provider_error") return { status: "error", error: parsed.error };
  if (parsed.status !== "code") return { status: "error", error: "invalid_oauth_callback" };
  if (!resume) return { status: "error", error: "oauth_resume_missing_or_stale" };

  const config = requireBrowserConfig();
  const { data, error } = await getWebAuthClient().auth.exchangeCodeForSession(parsed.code);
  const providerAccessToken = data.session?.access_token;
  if (error || !providerAccessToken) return { status: "error", error: "oauth_code_exchange_failed" };

  try {
    const response = await fetch(`${config.supabaseUrl}/functions/v1/verifyGoogleSession`, {
      method: "POST",
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${providerAccessToken}`,
        "Content-Type": "application/json",
      },
    });
    const payload = await response.json() as GoogleBootstrapPayload;
    if (
      !response.ok
      || !payload.session?.access_token
      || !payload.session.expires_at
      || !payload.user?.id
      || !payload.user.userKey
      || payload.user.provider !== "google"
      || !payload.user.providerUserId
      || !payload.user.role
    ) {
      return { status: "error", error: payload.error || "google_session_verification_failed" };
    }

    const session = createWebProviderTrustedSession<UserRole>({
      accessToken: payload.session.access_token,
      expiresAt: payload.session.expires_at,
      user: {
        id: payload.user.id,
        userKey: payload.user.userKey,
        provider: "google",
        providerUserId: payload.user.providerUserId,
        firstName: payload.user.firstName ?? null,
        lastName: payload.user.lastName ?? null,
        username: payload.user.username ?? null,
        role: payload.user.role,
      },
    });

    return { status: "success", session, returnTo: resume.returnTo };
  } catch {
    return { status: "error", error: "google_session_verification_unavailable" };
  }
}
