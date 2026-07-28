import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token",
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

const base64UrlDecode = (value: string) => {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
};

const base64UrlEncode = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const hex = (bytes: Uint8Array) => [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");

const sha256 = async (value: string) => hex(new Uint8Array(
  await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
));

type SessionClaims = {
  aud?: string;
  role?: string;
  exp?: number;
  iss?: string;
  go_irl_user_key?: string;
  go_irl_telegram_id?: number;
};

const verifySession = async (authorization: string | null, secret: string): Promise<SessionClaims | null> => {
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const [headerPart, payloadPart, signaturePart] = parts;
    const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerPart))) as { alg?: string };
    if (header.alg !== "HS256") return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signaturePart),
      new TextEncoder().encode(`${headerPart}.${payloadPart}`),
    );
    if (!valid) return null;

    const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadPart))) as SessionClaims;
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp === undefined || claims.exp <= now) return null;
    if (claims.iss !== "go-irl-supabase-edge" || claims.aud !== "authenticated" || claims.role !== "authenticated") return null;
    if (!claims.go_irl_user_key || !claims.go_irl_telegram_id) return null;
    return claims;
  } catch {
    return null;
  }
};

const telegramApi = async <T>(token: string, method: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as { ok: boolean; result?: T; description?: string };
  if (!response.ok || !payload.ok || payload.result === undefined) {
    throw new Error(`telegram_${method}_failed:${payload.description || response.status}`);
  }
  return payload.result;
};

const parseBindingToken = (text: string | undefined, botUsername: string) => {
  if (!text) return null;
  const escaped = botUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.trim().match(new RegExp(`^/start(?:@${escaped})?\\s+([A-Za-z0-9_-]{20,64})$`, "i"));
  return match?.[1] || null;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const jwtSecret = requiredEnv("GO_IRL_JWT_SECRET");
    const botToken = requiredEnv("TELEGRAM_BOT_TOKEN");
    const webhookSecret = requiredEnv("TELEGRAM_WEBHOOK_SECRET");
    const botUsername = (Deno.env.get("TELEGRAM_BOT_USERNAME") || "GOirl_bot").replace(/^@/, "");
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const suppliedWebhookSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (suppliedWebhookSecret === webhookSecret) {
      const update = await request.json() as {
        message?: {
          text?: string;
          chat?: { id?: number; type?: string; title?: string };
          from?: { id?: number };
        };
      };
      const message = update.message;
      const token = parseBindingToken(message?.text, botUsername);
      const chatId = message?.chat?.id;
      const chatType = message?.chat?.type;
      const senderTelegramId = message?.from?.id;
      if (!token || !chatId || !senderTelegramId || !["group", "supergroup"].includes(chatType || "")) {
        return json({ ok: true, ignored: true });
      }

      const tokenHash = await sha256(token);
      const bindingResult = await supabase
        .from("activity_telegram_chat_bindings")
        .select("activity_id,requested_by_user_key,expires_at,consumed_at")
        .eq("token_hash", tokenHash)
        .maybeSingle();
      const binding = bindingResult.data as {
        activity_id: string;
        requested_by_user_key: string;
        expires_at: string;
        consumed_at: string | null;
      } | null;
      if (bindingResult.error || !binding || binding.consumed_at || new Date(binding.expires_at).getTime() <= Date.now()) {
        await telegramApi(botToken, "sendMessage", { chat_id: chatId, text: "Ссылка GO IRL недействительна или истекла." });
        return json({ ok: true, rejected: "binding_invalid" });
      }

      const userResult = await supabase
        .from("app_users")
        .select("telegram_id")
        .eq("user_key", binding.requested_by_user_key)
        .maybeSingle();
      if (Number(userResult.data?.telegram_id) !== senderTelegramId) {
        await telegramApi(botToken, "sendMessage", { chat_id: chatId, text: "Привязать чат может только организатор события." });
        return json({ ok: true, rejected: "organizer_mismatch" });
      }

      const senderMember = await telegramApi<{ status: string }>(botToken, "getChatMember", {
        chat_id: chatId,
        user_id: senderTelegramId,
      });
      if (!["creator", "administrator"].includes(senderMember.status)) {
        await telegramApi(botToken, "sendMessage", { chat_id: chatId, text: "Организатор должен быть администратором группы." });
        return json({ ok: true, rejected: "organizer_not_admin" });
      }

      const invite = await telegramApi<{ invite_link: string }>(botToken, "createChatInviteLink", {
        chat_id: chatId,
        name: "GO IRL event",
      });

      const saveResult = await supabase
        .from("activity_external_telegram_chats")
        .upsert({
          activity_id: binding.activity_id,
          url: invite.invite_link,
          attached_by_user_key: binding.requested_by_user_key,
          telegram_chat_id: chatId,
          telegram_chat_type: chatType,
          telegram_chat_title: message?.chat?.title || null,
          bound_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "activity_id" });
      if (saveResult.error) throw saveResult.error;

      const consumeResult = await supabase
        .from("activity_telegram_chat_bindings")
        .update({ consumed_at: new Date().toISOString() })
        .eq("token_hash", tokenHash)
        .is("consumed_at", null);
      if (consumeResult.error) throw consumeResult.error;

      await telegramApi(botToken, "sendMessage", {
        chat_id: chatId,
        text: "Группа привязана к событию GO IRL. Ссылка появится у подтверждённых участников.",
      });
      return json({ ok: true, bound: true });
    }

    const claims = await verifySession(request.headers.get("authorization"), jwtSecret);
    if (!claims) return json({ error: "access_denied" }, 401);

    const body = await request.json() as { action?: string; activityId?: string };
    if (body.action !== "create_binding" || !body.activityId) return json({ error: "invalid_request" }, 400);

    const activityResult = await supabase
      .from("activities")
      .select("id,organizer_key")
      .eq("id", body.activityId)
      .maybeSingle();
    if (activityResult.error) throw activityResult.error;
    if (!activityResult.data || activityResult.data.organizer_key !== claims.go_irl_user_key) {
      return json({ error: "organizer_required" }, 403);
    }

    const random = crypto.getRandomValues(new Uint8Array(24));
    const bindingToken = base64UrlEncode(random);
    const tokenHash = await sha256(bindingToken);
    const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();

    await supabase
      .from("activity_telegram_chat_bindings")
      .delete()
      .eq("activity_id", body.activityId)
      .is("consumed_at", null);

    const insertResult = await supabase.from("activity_telegram_chat_bindings").insert({
      token_hash: tokenHash,
      activity_id: body.activityId,
      requested_by_user_key: claims.go_irl_user_key,
      expires_at: expiresAt,
    });
    if (insertResult.error) throw insertResult.error;

    return json({
      startGroupUrl: `https://t.me/${botUsername}?startgroup=${bindingToken}`,
      expiresAt,
    });
  } catch (error) {
    console.error(error);
    return json({ error: "supergroup_handshake_failed" }, 500);
  }
});
