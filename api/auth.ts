import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { readEnv, requireEnv } from "./_shared/env.js";
import { createVercelHandler } from "./_shared/vercel-handler.js";

type AuthProvider = "facebook" | "instagram" | "whatsapp";
type ProviderProfile = { provider: AuthProvider; id: string; displayName: string };
type OAuthState = { provider: AuthProvider; returnTo: string; exp: number; linkUserKey?: string };

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
});

const base64url = (value: string | Buffer) => Buffer.from(value).toString("base64url");
const publicOrigin = () => {
  const configured = readEnv("GO_IRL_PUBLIC_ORIGIN");
  if (configured) return configured.replace(/\/$/, "");
  const host = readEnv("VERCEL_PROJECT_PRODUCTION_URL") || readEnv("VERCEL_URL");
  return host ? `https://${host.replace(/^https?:\/\//, "")}` : "https://go-irl-1-0.vercel.app";
};
const graphVersion = () => requireEnv("META_GRAPH_VERSION").replace(/^\//, "");
const appSecret = () => readEnv("GO_IRL_OAUTH_STATE_SECRET") || requireEnv("GO_IRL_JWT_SECRET");

const safeReturnTo = (value: string | null) => {
  if (!value) return "/";
  try {
    const parsed = new URL(value, publicOrigin());
    if (parsed.origin !== publicOrigin()) return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
};

const signState = (provider: AuthProvider, returnTo: string, linkUserKey?: string | null) => {
  const payload = base64url(JSON.stringify({
    provider,
    returnTo,
    exp: Date.now() + 10 * 60_000,
    ...(linkUserKey ? { linkUserKey } : {}),
  } satisfies OAuthState));
  const signature = createHmac("sha256", appSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const verifyState = (state: string, expectedProvider: AuthProvider): OAuthState => {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) throw new Error("invalid_state");
  const expected = createHmac("sha256", appSecret()).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("invalid_state");
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<OAuthState>;
  if (parsed.provider !== expectedProvider || !parsed.exp || parsed.exp < Date.now()) throw new Error("expired_state");
  return {
    provider: expectedProvider,
    returnTo: safeReturnTo(parsed.returnTo || "/"),
    exp: parsed.exp,
    ...(parsed.linkUserKey ? { linkUserKey: parsed.linkUserKey } : {}),
  };
};

const signJwt = (payload: Record<string, unknown>) => {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", requireEnv("GO_IRL_JWT_SECRET"))
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
};

const readLinkUserKey = (request: Request) => {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  const expected = createHmac("sha256", requireEnv("GO_IRL_JWT_SECRET")).update(`${header}.${payload}`).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number; go_irl_user_key?: string };
    if (!claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims.go_irl_user_key || null;
  } catch {
    return null;
  }
};

const admin = () => createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function resolveIdentity(profile: ProviderProfile, linkUserKey?: string | null) {
  const client = admin();
  const existingIdentity = await client.from("user_provider_identities")
    .select("user_key")
    .eq("provider", profile.provider)
    .eq("provider_user_id", profile.id)
    .maybeSingle();
  if (existingIdentity.error) throw existingIdentity.error;
  if (linkUserKey && existingIdentity.data?.user_key && existingIdentity.data.user_key !== linkUserKey) {
    throw new Error("identity_already_linked");
  }

  let userKey = linkUserKey || existingIdentity.data?.user_key || null;
  if (!userKey) {
    const existingAppUser = await client.from("app_users")
      .select("user_key,status")
      .eq("auth_provider", profile.provider)
      .eq("provider_user_id", profile.id)
      .maybeSingle();
    if (existingAppUser.error) throw existingAppUser.error;
    if (existingAppUser.data?.status === "blocked" || existingAppUser.data?.status === "deleted") throw new Error("user_blocked");
    userKey = existingAppUser.data?.user_key || `user:${crypto.randomUUID()}`;
    if (!existingAppUser.data) {
      const inserted = await client.from("app_users").insert({
        auth_provider: profile.provider,
        provider_user_id: profile.id,
        user_key: userKey,
        first_name: profile.displayName.slice(0, 120) || "GO IRL User",
        last_login_at: new Date().toISOString(),
      });
      if (inserted.error) throw inserted.error;
    }
  }

  const appUser = await client.from("app_users").select("id,status,first_name,last_name,username")
    .eq("user_key", userKey).single();
  if (appUser.error) throw appUser.error;
  if (appUser.data.status === "blocked" || appUser.data.status === "deleted") throw new Error("user_blocked");

  const nowIso = new Date().toISOString();
  const identity = await client.from("user_provider_identities").upsert({
    user_key: userKey,
    provider: profile.provider,
    provider_user_id: profile.id,
    auth_enabled: true,
    auth_verified_at: nowIso,
    updated_at: nowIso,
    ...(existingIdentity.data ? {} : { status: "revoked" }),
  }, { onConflict: "provider,provider_user_id" });
  if (identity.error) throw identity.error;

  await client.from("app_users").update({ last_login_at: nowIso }).eq("user_key", userKey);
  const role = await client.from("user_roles").select("role").eq("user_key", userKey).maybeSingle<{ role: string }>();
  const now = Math.floor(Date.now() / 1000);
  const ttl = Number(readEnv("GO_IRL_SESSION_TTL_SECONDS") || 3600);
  const expiresAt = now + ttl;
  const accessToken = signJwt({
    aud: "authenticated", role: "authenticated", sub: appUser.data.id, iat: now, exp: expiresAt,
    iss: "go-irl-provider-auth", go_irl_user_key: userKey, go_irl_role: role.data?.role || "user",
    go_irl_auth_provider: profile.provider,
  });
  return {
    accessToken, expiresAt,
    user: {
      id: appUser.data.id, userKey, telegramId: null,
      firstName: appUser.data.first_name || profile.displayName || null,
      lastName: appUser.data.last_name, username: appUser.data.username,
      role: role.data?.role || "user", provider: profile.provider,
    },
  };
}

async function verifyFacebook(accessToken: string): Promise<ProviderProfile> {
  const appId = requireEnv("FACEBOOK_APP_ID");
  const appAccess = `${appId}|${requireEnv("FACEBOOK_APP_SECRET")}`;
  const debugUrl = new URL(`https://graph.facebook.com/${graphVersion()}/debug_token`);
  debugUrl.searchParams.set("input_token", accessToken);
  debugUrl.searchParams.set("access_token", appAccess);
  const debugResponse = await fetch(debugUrl);
  const debug = await debugResponse.json() as { data?: { is_valid?: boolean; app_id?: string; user_id?: string } };
  if (!debugResponse.ok || !debug.data?.is_valid || debug.data.app_id !== appId || !debug.data.user_id) throw new Error("facebook_token_invalid");
  const meUrl = new URL(`https://graph.facebook.com/${graphVersion()}/me`);
  meUrl.searchParams.set("fields", "id,name");
  meUrl.searchParams.set("access_token", accessToken);
  const response = await fetch(meUrl);
  const me = await response.json() as { id?: string; name?: string };
  if (!response.ok || !me.id || me.id !== debug.data.user_id) throw new Error("facebook_profile_invalid");
  return { provider: "facebook", id: me.id, displayName: me.name || "GO IRL User" };
}

async function verifyInstagram(accessToken: string): Promise<ProviderProfile> {
  const url = new URL(`https://graph.instagram.com/${graphVersion()}/me`);
  url.searchParams.set("fields", "id,username");
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url);
  const me = await response.json() as { id?: string; user_id?: string; username?: string };
  const id = me.id || me.user_id;
  if (!response.ok || !id) throw new Error("instagram_token_invalid");
  return { provider: "instagram", id, displayName: me.username ? `@${me.username}` : "Instagram user" };
}

const normalizePhone = (value: string) => {
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length < 8 || digits.length > 15) throw new Error("invalid_phone");
  return digits;
};
const codeHash = (phone: string, code: string) => createHash("sha256")
  .update(`${phone}:${code}:${requireEnv("GO_IRL_AUTH_CODE_PEPPER")}`).digest("hex");
const maxOtpAttempts = 5;

async function startWhatsApp(phoneInput: string) {
  const phone = normalizePhone(phoneInput);
  const client = admin();
  const existing = await client.from("provider_auth_challenges")
    .select("created_at").eq("provider", "whatsapp").eq("provider_user_id", phone).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data && Date.now() - new Date(existing.data.created_at).getTime() < 60_000) throw new Error("auth_code_rate_limited");
  const code = String(randomInt(100000, 1000000));
  const now = new Date();
  const saved = await client.from("provider_auth_challenges").upsert({
    provider: "whatsapp", provider_user_id: phone, code_hash: codeHash(phone, code),
    expires_at: new Date(now.getTime() + 10 * 60_000).toISOString(), consumed_at: null,
    attempt_count: 0, created_at: now.toISOString(), updated_at: now.toISOString(),
  }, { onConflict: "provider,provider_user_id" });
  if (saved.error) throw saved.error;

  const response = await fetch(`https://graph.facebook.com/${graphVersion()}/${requireEnv("WHATSAPP_PHONE_NUMBER_ID")}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${requireEnv("WHATSAPP_ACCESS_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", recipient_type: "individual", to: phone, type: "template",
      template: {
        name: requireEnv("WHATSAPP_AUTH_TEMPLATE_NAME"),
        language: { code: readEnv("WHATSAPP_AUTH_TEMPLATE_LANGUAGE") || "en_US" },
        components: [
          { type: "body", parameters: [{ type: "text", text: code }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
        ],
      },
    }),
  });
  if (!response.ok) {
    await client.from("provider_auth_challenges").delete().eq("provider", "whatsapp").eq("provider_user_id", phone);
    throw new Error("whatsapp_auth_send_failed");
  }
  return { ok: true };
}

async function verifyWhatsApp(phoneInput: string, code: string, linkUserKey?: string | null) {
  const phone = normalizePhone(phoneInput);
  if (!/^\d{6}$/.test(code)) throw new Error("invalid_code");
  const client = admin();
  const challenge = await client.from("provider_auth_challenges").select("code_hash,expires_at,consumed_at,attempt_count")
    .eq("provider", "whatsapp").eq("provider_user_id", phone).maybeSingle();
  if (challenge.error) throw challenge.error;
  if (!challenge.data || challenge.data.consumed_at || new Date(challenge.data.expires_at).getTime() < Date.now()) throw new Error("auth_code_expired");
  if (challenge.data.attempt_count >= maxOtpAttempts) throw new Error("auth_code_attempts_exceeded");
  const expected = Buffer.from(challenge.data.code_hash, "hex");
  const actual = Buffer.from(codeHash(phone, code), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    const nextAttemptCount = challenge.data.attempt_count + 1;
    await client.from("provider_auth_challenges").update({
      attempt_count: nextAttemptCount,
      ...(nextAttemptCount >= maxOtpAttempts ? { consumed_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    }).eq("provider", "whatsapp").eq("provider_user_id", phone);
    throw new Error(nextAttemptCount >= maxOtpAttempts ? "auth_code_attempts_exceeded" : "auth_code_invalid");
  }
  await client.from("provider_auth_challenges").update({ consumed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("provider", "whatsapp").eq("provider_user_id", phone);
  return resolveIdentity({ provider: "whatsapp", id: phone, displayName: `+${phone}` }, linkUserKey);
}

async function exchangeMetaCode(provider: "facebook" | "instagram", code: string, redirectUri: string) {
  if (provider === "facebook") {
    const url = new URL(`https://graph.facebook.com/${graphVersion()}/oauth/access_token`);
    url.searchParams.set("client_id", requireEnv("FACEBOOK_APP_ID"));
    url.searchParams.set("client_secret", requireEnv("FACEBOOK_APP_SECRET"));
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("code", code);
    const response = await fetch(url);
    const payload = await response.json() as { access_token?: string };
    if (!response.ok || !payload.access_token) throw new Error("facebook_code_exchange_failed");
    return verifyFacebook(payload.access_token);
  }
  const form = new URLSearchParams({
    client_id: requireEnv("INSTAGRAM_APP_ID"), client_secret: requireEnv("INSTAGRAM_APP_SECRET"),
    grant_type: "authorization_code", redirect_uri: redirectUri, code,
  });
  const response = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", body: form });
  const payload = await response.json() as { access_token?: string };
  if (!response.ok || !payload.access_token) throw new Error("instagram_code_exchange_failed");
  return verifyInstagram(payload.access_token);
}

const buildOAuthAuthorizeUrl = (provider: "facebook" | "instagram", returnTo: string, linkUserKey?: string | null) => {
  const redirectUri = `${publicOrigin()}/api/auth?action=callback&provider=${provider}`;
  const state = signState(provider, returnTo, linkUserKey);
  const authorize = provider === "facebook"
    ? new URL(`https://www.facebook.com/${graphVersion()}/dialog/oauth`)
    : new URL("https://www.instagram.com/oauth/authorize");
  authorize.searchParams.set("client_id", provider === "facebook" ? requireEnv("FACEBOOK_APP_ID") : requireEnv("INSTAGRAM_APP_ID"));
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("scope", provider === "facebook" ? "public_profile,email" : "instagram_business_basic");
  return authorize.toString();
};

const callbackHtml = (session: Awaited<ReturnType<typeof resolveIdentity>>, returnTo: string) => {
  const stored = JSON.stringify({
    accessToken: session.accessToken, expiresAt: session.expiresAt, user: session.user,
    source: "trusted-provider",
  }).replace(/</g, "\\u003c");
  return new Response(`<!doctype html><meta charset="utf-8"><title>GO IRL</title><script>sessionStorage.setItem("go-irl-trusted-session-v2",${JSON.stringify(stored)});location.replace(${JSON.stringify(returnTo)});</script>`, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
};

export async function handleAuth(request: Request) {
  try {
    const url = new URL(request.url);
    if (request.method === "GET" && url.searchParams.get("action") === "start") {
      const provider = url.searchParams.get("provider") as AuthProvider;
      if (provider !== "facebook" && provider !== "instagram") return json(400, { error: "provider_not_supported" });
      return Response.redirect(buildOAuthAuthorizeUrl(provider, safeReturnTo(url.searchParams.get("returnTo"))), 302);
    }
    if (request.method === "GET" && url.searchParams.get("action") === "callback") {
      const provider = url.searchParams.get("provider") as AuthProvider;
      if (provider !== "facebook" && provider !== "instagram") return json(400, { error: "provider_not_supported" });
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (!code || !state) return json(400, { error: "oauth_callback_invalid" });
      const verifiedState = verifyState(state, provider);
      const redirectUri = `${publicOrigin()}/api/auth?action=callback&provider=${provider}`;
      const profile = await exchangeMetaCode(provider, code, redirectUri);
      return callbackHtml(await resolveIdentity(profile, verifiedState.linkUserKey), verifiedState.returnTo);
    }
    if (request.method === "POST") {
      const body = await request.json() as { action?: string; phone?: string; code?: string; accessToken?: string; provider?: AuthProvider; returnTo?: string };
      const linkUserKey = readLinkUserKey(request);
      if (body.action === "oauth-start" && (body.provider === "facebook" || body.provider === "instagram")) {
        if (!linkUserKey) return json(401, { error: "trusted_auth_required" });
        return json(200, { authorizeUrl: buildOAuthAuthorizeUrl(body.provider, safeReturnTo(body.returnTo || null), linkUserKey) });
      }
      if (body.action === "whatsapp-start" && body.phone) return json(200, await startWhatsApp(body.phone));
      if (body.action === "whatsapp-verify" && body.phone && body.code) return json(200, await verifyWhatsApp(body.phone, body.code, linkUserKey));
      if (body.action === "token-exchange" && body.accessToken && (body.provider === "facebook" || body.provider === "instagram")) {
        const profile = body.provider === "facebook" ? await verifyFacebook(body.accessToken) : await verifyInstagram(body.accessToken);
        return json(200, await resolveIdentity(profile, linkUserKey));
      }
      return json(400, { error: "invalid_request" });
    }
    return new Response(null, { status: 405, headers: { Allow: "GET, POST" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "provider_auth_failed";
    const status = code === "identity_already_linked" ? 409
      : code.includes("rate_limited") || code.includes("attempts_exceeded") ? 429
      : code.includes("invalid") || code.includes("expired") || code === "trusted_auth_required" ? 401
      : 500;
    console.error("provider_auth_failed", { code: code.slice(0, 100) });
    return json(status, { error: code });
  }
}

export default createVercelHandler(handleAuth);
