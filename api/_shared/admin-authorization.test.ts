import { describe, expect, it, vi } from "vitest";
import { authorizeAdminRequest } from "./admin-authorization.js";

const secret = "road105-test-secret-with-sufficient-length";
const allowedUserKey = "telegram:test-admin";
const nowSeconds = 1_800_000_000;

const base64Url = (input: Uint8Array | string) => {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

async function signToken(overrides: Record<string, unknown> = {}) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    aud: "authenticated",
    role: "authenticated",
    sub: "00000000-0000-4000-8000-000000000001",
    exp: nowSeconds + 3600,
    go_irl_user_key: allowedUserKey,
    go_irl_role: "admin",
    ...overrides,
  }));
  const unsigned = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(unsigned)));
  return `${unsigned}.${base64Url(signature)}`;
}

const requestWith = (token?: string) => new Request("https://goirl.invalid/api/admin/session", {
  method: "POST",
  headers: token ? { authorization: `Bearer ${token}` } : {},
});

describe("authorizeAdminRequest", () => {
  it("allows the dedicated Telegram identity only when the current server role is admin", async () => {
    const loadRole = vi.fn(async () => "admin");
    const result = await authorizeAdminRequest(requestWith(await signToken()), {
      allowedUserKey,
      jwtSecret: secret,
      loadRole,
      nowSeconds,
    });

    expect(result).toMatchObject({ ok: true, userKey: allowedUserKey });
    expect(loadRole).toHaveBeenCalledWith(allowedUserKey, expect.any(String));
  });

  it("denies another Telegram identity with a generic response", async () => {
    const result = await authorizeAdminRequest(requestWith(await signToken({
      go_irl_user_key: "telegram:another-account",
    })), {
      allowedUserKey,
      jwtSecret: secret,
      loadRole: async () => "admin",
      nowSeconds,
    });

    expect(result).toEqual({ ok: false, status: 403, error: "access_denied" });
    expect(JSON.stringify(result)).not.toContain(allowedUserKey);
  });

  it("denies a stale or downgraded production role", async () => {
    const result = await authorizeAdminRequest(requestWith(await signToken()), {
      allowedUserKey,
      jwtSecret: secret,
      loadRole: async () => "user",
      nowSeconds,
    });

    expect(result).toEqual({ ok: false, status: 403, error: "access_denied" });
  });

  it("denies missing, expired, or invalid sessions before role lookup", async () => {
    const loadRole = vi.fn(async () => "admin");
    const missing = await authorizeAdminRequest(requestWith(), {
      allowedUserKey,
      jwtSecret: secret,
      loadRole,
      nowSeconds,
    });
    const expired = await authorizeAdminRequest(requestWith(await signToken({ exp: nowSeconds - 1 })), {
      allowedUserKey,
      jwtSecret: secret,
      loadRole,
      nowSeconds,
    });
    const invalid = await authorizeAdminRequest(requestWith(`${await signToken()}broken`), {
      allowedUserKey,
      jwtSecret: secret,
      loadRole,
      nowSeconds,
    });

    expect(missing).toEqual({ ok: false, status: 401, error: "access_denied" });
    expect(expired).toEqual({ ok: false, status: 401, error: "access_denied" });
    expect(invalid).toEqual({ ok: false, status: 401, error: "access_denied" });
    expect(loadRole).not.toHaveBeenCalled();
  });
});
