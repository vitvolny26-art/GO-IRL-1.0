import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./env.js";
import type { MessagingProvider } from "./provider-messages.js";

const getAdminClient = () => createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export async function digestProviderInboundEvent(provider: MessagingProvider, eventId: string) {
  const bytes = new TextEncoder().encode(`${provider}:${eventId}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function claimProviderInboundEvent(provider: MessagingProvider, eventId: string) {
  const client = getAdminClient();
  const eventKey = await digestProviderInboundEvent(provider, eventId);
  const { data, error } = await client.rpc("go_irl_claim_provider_inbound_event", {
    p_provider: provider,
    p_event_key: eventKey,
  });
  if (error) throw error;
  return { claimed: data === true, eventKey };
}

export async function completeProviderInboundEvent(input: {
  provider: MessagingProvider;
  eventKey: string;
  success: boolean;
  errorCode?: string;
}) {
  const client = getAdminClient();
  const { error } = await client.rpc("go_irl_complete_provider_inbound_event", {
    p_provider: input.provider,
    p_event_key: input.eventKey,
    p_success: input.success,
    p_error_code: input.errorCode || null,
  });
  if (error) throw error;
}
