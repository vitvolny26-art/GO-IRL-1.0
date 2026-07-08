import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";
import {
  createTelegramReplayKey,
  TelegramInitDataValidationError,
  validateTelegramInitData,
} from "../_shared/telegramInitData.ts";

type AppUserRow = {
  id: string;
  user_key: string;
  telegram_id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const requiredEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const base64Url = (input: Uint8Array | string) => {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

async function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64Url(JSON.stringify(header));
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
    const {
      initData,
    } = await request.json() as { initData?: string };

    if (!initData) return json({ error: "init_data_required" }, 400);

    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const telegramBotToken = requiredEnv("TELEGRAM_BOT_TOKEN");
    const jwtSecret = requiredEnv("GO_IRL_JWT_SECRET");
    const authMaxAgeSeconds = Number(Deno.env.get("GO_IRL_AUTH_MAX_AGE_SECONDS") || 86400);
    const sessionTtlSeconds = Number(Deno.env.get("GO_IRL_SESSION_TTL_SECONDS") || 3600);

    const verified = await validateTelegramInitData({
      initData,
      botToken: telegramBotToken,
      maxAgeSeconds: authMaxAgeSeconds,
    });

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const replayHash = await createTelegramReplayKey(verified.hash);
    const replayResult = await supabase
      .from("telegram_auth_replay")
      .insert({
        init_data_hash: replayHash,
        telegram_id: verified.user.id,
        auth_date: new Date(verified.authDate * 1000).toISOString(),
        expires_at: new Date((verified.authDate + authMaxAgeSeconds) * 1000).toISOString(),
      });

    if (replayResult.error) {
      if (replayResult.error.code === "23505") return json({ error: "replay_detected" }, 409);
      throw replayResult.error;
    }

    const userKey = `telegram:${verified.user.id}`;
    const upsertResult = await supabase
      .from("app_users")
      .upsert({
        auth_provider: "telegram",
        provider_user_id: String(verified.user.id),
        user_key: userKey,
        telegram_id: verified.user.id,
        first_name: verified.user.first_name || null,
        last_name: verified.user.last_name || null,
        username: verified.user.username?.toLowerCase() || null,
        language_code: verified.user.language_code || null,
        last_login_at: new Date().toISOString(),
      }, { onConflict: "auth_provider,provider_user_id" })
      .select("id,user_key,telegram_id,first_name,last_name,username")
      .single<AppUserRow>();

    if (upsertResult.error || !upsertResult.data) throw upsertResult.error || new Error("User upsert failed");

    const roleResult = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_key", userKey)
      .maybeSingle<{ role: string }>();

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + sessionTtlSeconds;
    const token = await signJwt({
      aud: "authenticated",
      role: "authenticated",
      sub: upsertResult.data.id,
      iat: now,
      exp: expiresAt,
      iss: "go-irl-supabase-edge",
      go_irl_user_key: userKey,
      go_irl_telegram_id: verified.user.id,
      go_irl_start_param: verified.startParam || null,
      go_irl_role: roleResult.data?.role || "user",
    }, jwtSecret);

    return json({
      session: {
        access_token: token,
        token_type: "bearer",
        expires_in: sessionTtlSeconds,
        expires_at: expiresAt,
      },
      user: {
        id: upsertResult.data.id,
        userKey,
        telegramId: upsertResult.data.telegram_id,
        firstName: upsertResult.data.first_name,
        lastName: upsertResult.data.last_name,
        username: upsertResult.data.username,
        role: roleResult.data?.role || "user",
      },
      startParam: verified.startParam,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof TelegramInitDataValidationError) {
      return json({ error: error.code }, 401);
    }
    return json({ error: "verification_failed" }, 500);
  }
});
