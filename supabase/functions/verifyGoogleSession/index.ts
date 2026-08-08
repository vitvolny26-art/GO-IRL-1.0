import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

type AppUserRow = {
  id: string;
  user_key: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
};

type ProviderIdentityRow = {
  user_key: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const requiredEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const readBearerToken = (request: Request) => {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim() || "";
  return token || null;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const readString = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null;

export function readGoogleProviderId(identities: unknown) {
  if (!Array.isArray(identities)) return null;
  for (const identity of identities) {
    const record = asRecord(identity);
    if (!record || record.provider !== "google") continue;
    const providerId = readString(record.provider_id);
    if (providerId) return providerId;
    const identityData = asRecord(record.identity_data);
    const subject = readString(identityData?.sub);
    if (subject) return subject;
  }
  return null;
}

export function readGoogleProfile(userMetadata: unknown) {
  const metadata = asRecord(userMetadata) || {};
  const givenName = readString(metadata.given_name);
  const familyName = readString(metadata.family_name);
  const fullName = readString(metadata.full_name) || readString(metadata.name);
  const fallbackParts = fullName?.split(/\s+/).filter(Boolean) || [];
  return {
    firstName: givenName || fallbackParts[0] || null,
    lastName: familyName || (fallbackParts.length > 1 ? fallbackParts.slice(1).join(" ") : null),
  };
}

const base64Url = (input: Uint8Array | string) => {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

async function signJwt(payload: Record<string, unknown>, secret: string) {
  const encodedHeader = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data)));
  return `${data}.${base64Url(signature)}`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const accessToken = readBearerToken(request);
    if (!accessToken) return json({ error: "access_denied" }, 401);

    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const jwtSecret = requiredEnv("GO_IRL_JWT_SECRET");
    const sessionTtlSeconds = Number(Deno.env.get("GO_IRL_SESSION_TTL_SECONDS") || 3600);
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const authResult = await supabase.auth.getUser(accessToken);
    if (authResult.error || !authResult.data.user) return json({ error: "access_denied" }, 401);

    const authUser = authResult.data.user;
    const providerUserId = readGoogleProviderId(authUser.identities);
    if (!providerUserId) return json({ error: "google_identity_required" }, 403);

    const identityResult = await supabase
      .from("user_provider_identities")
      .select("user_key")
      .eq("provider", "google")
      .eq("provider_user_id", providerUserId)
      .maybeSingle();
    if (identityResult.error) throw identityResult.error;
    const linkedIdentity = identityResult.data as ProviderIdentityRow | null;

    const nowIso = new Date().toISOString();
    const profile = readGoogleProfile(authUser.user_metadata);
    let appUser: AppUserRow;

    if (linkedIdentity?.user_key) {
      const appUserResult = await supabase
        .from("app_users")
        .update({ last_login_at: nowIso })
        .eq("user_key", linkedIdentity.user_key)
        .select("id,user_key,first_name,last_name,username")
        .single();
      if (appUserResult.error || !appUserResult.data) {
        throw appUserResult.error || new Error("Provider identity points to a missing app user");
      }
      appUser = appUserResult.data as AppUserRow;
    } else {
      const userKey = `google:${providerUserId}`;
      const appUserResult = await supabase.from("app_users").upsert({
        auth_provider: "google",
        provider_user_id: providerUserId,
        user_key: userKey,
        telegram_id: null,
        first_name: profile.firstName,
        last_name: profile.lastName,
        username: null,
        language_code: null,
        last_login_at: nowIso,
      }, { onConflict: "auth_provider,provider_user_id" })
        .select("id,user_key,first_name,last_name,username")
        .single();
      if (appUserResult.error || !appUserResult.data) {
        throw appUserResult.error || new Error("Google app user bootstrap failed");
      }
      appUser = appUserResult.data as AppUserRow;

      const identityInsert = await supabase.from("user_provider_identities").insert({
        user_key: appUser.user_key,
        provider: "google",
        provider_user_id: providerUserId,
        status: "active",
        last_inbound_at: nowIso,
        updated_at: nowIso,
      });
      if (identityInsert.error && identityInsert.error.code !== "23505") throw identityInsert.error;
    }

    const roleResult = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_key", appUser.user_key)
      .maybeSingle();
    if (roleResult.error) throw roleResult.error;

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + sessionTtlSeconds;
    const role = (roleResult.data as { role?: string } | null)?.role || "user";
    const token = await signJwt({
      aud: "authenticated",
      role: "authenticated",
      sub: appUser.id,
      iat: now,
      exp: expiresAt,
      iss: "go-irl-supabase-edge",
      go_irl_user_key: appUser.user_key,
      go_irl_auth_provider: "google",
      go_irl_provider_user_id: providerUserId,
      go_irl_role: role,
    }, jwtSecret);

    return json({
      session: {
        access_token: token,
        token_type: "bearer",
        expires_in: sessionTtlSeconds,
        expires_at: expiresAt,
      },
      user: {
        id: appUser.id,
        userKey: appUser.user_key,
        provider: "google",
        providerUserId,
        firstName: appUser.first_name,
        lastName: appUser.last_name,
        username: appUser.username,
        role,
      },
    });
  } catch (error) {
    console.error("verify_google_session_failed", error instanceof Error ? error.name : "unknown_error");
    return json({ error: "verification_failed" }, 500);
  }
});
