import type { MetaEventSummary } from "../../src/meta-messaging/types.js";
import { readEnv } from "./env.js";

type Dependencies = {
  getEventSummary(eventId: string): Promise<MetaEventSummary | null>;
  sendInvitation(recipientId: string, event: MetaEventSummary): Promise<unknown>;
};

type TriggerOptions = {
  tokenEnv: string;
  dependencies: Dependencies;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const recipientPattern = /^[1-9][0-9]{4,31}$/;

const corsHeaders = {
  "access-control-allow-origin": "https://hoppscotch.io",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

const jsonResponse = (body: unknown, status: number, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders, ...extraHeaders },
  });

const asRecord = (value: unknown) =>
  typeof value === "object" && value !== null ? value as Record<string, unknown> : null;

async function secureEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

export const createProviderTestInvitationHandler = ({ tokenEnv, dependencies }: TriggerOptions) =>
  async (request: Request, overrides: Dependencies = dependencies) => {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return jsonResponse({ error: "method_not_allowed" }, 405, { allow: "POST, OPTIONS" });
    }

    const configuredToken = readEnv(tokenEnv);
    if (!configuredToken) return jsonResponse({ error: "test_trigger_disabled" }, 503);

    const authorization = request.headers.get("authorization") || "";
    const suppliedToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!suppliedToken || !await secureEqual(suppliedToken, configuredToken)) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    let body: Record<string, unknown> | null;
    try {
      body = asRecord(await request.json());
    } catch {
      return jsonResponse({ error: "invalid_json" }, 400);
    }

    const recipientId = typeof body?.recipientId === "string" ? body.recipientId.trim() : "";
    const eventId = typeof body?.eventId === "string" ? body.eventId.trim() : "";
    if (!recipientPattern.test(recipientId) || !uuidPattern.test(eventId)) {
      return jsonResponse({ error: "invalid_request" }, 400);
    }

    let event: MetaEventSummary | null;
    try {
      event = await overrides.getEventSummary(eventId);
    } catch {
      return jsonResponse({ error: "event_lookup_failed" }, 502);
    }
    if (!event) return jsonResponse({ error: "event_not_found" }, 404);

    try {
      await overrides.sendInvitation(recipientId, event);
    } catch (error) {
      console.error(
        "provider_test_invitation_send_failed",
        error instanceof Error ? error.message : "unknown_provider_error",
      );
      return jsonResponse({ error: "invitation_send_failed" }, 502);
    }
    return jsonResponse({ accepted: true }, 202);
  };
