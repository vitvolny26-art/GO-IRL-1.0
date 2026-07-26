import { describe, expect, it, vi } from "vitest";
import {
  authorizeAdminRequest,
  runAuthorizedAdminAction,
  type AdminAuthorizationDependencies,
} from "./admin-authorization.js";

const secret = "road105-test-secret-with-sufficient-length";
const allowedUserKey = "telegram:test-admin";
const issuer = "go-irl-supabase-edge";
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
    iss: issuer,
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

const requestWith = (token?: string, body?: string) => new Request("https://goirl.invalid/api/admin/session", {
  method: "POST",
  headers: token ? { authorization: `Bearer ${token}` } : {},
  body,
});

const dependencies = (
  overrides: Partial<AdminAuthorizationDependencies> = {},
): AdminAuthorizationDependencies => ({
  allowedUserKey,
  issuer,
  jwtSecret: secret,
  loadRole: async () => "admin",
  nowSeconds,
  ...overrides,
});

describe("authorizeAdminRequest", () => {
  it("allows the dedicated Telegram identity only when the current server role is admin", async () => {
    const loadRole = vi.fn(async () => "admin");
    const logger = vi.fn();
    const result = await authorizeAdminRequest(
      requestWith(await signToken()),
      dependencies({ loadRole, logger }),
    );

    expect(result).toMatchObject({ ok: true, userKey: allowedUserKey });
    expect(loadRole).toHaveBeenCalledWith(allowedUserKey, expect.any(String));
    expect(logger).toHaveBeenCalledWith("admin_login_allowed", { reason: "authorized" });
  });

  it("denies another admin identity on the dedicated login path", async () => {
    const result = await authorizeAdminRequest(
      requestWith(await signToken({ go_irl_user_key: "telegram:other-admin" })),
      dependencies(),
    );

    expect(result).toEqual({ ok: false, status: 403, error: "access_denied" });
    expect(JSON.stringify(result)).not.toContain(allowedUserKey);
  });

  it("denies the allowed identity when the current server role is no longer admin", async () => {
    const result = await authorizeAdminRequest(
      requestWith(await signToken()),
      dependencies({ loadRole: async () => "user" }),
    );

    expect(result).toEqual({ ok: false, status: 403, error: "access_denied" });
  });

  it("denies a stale JWT whose embedded role is user", async () => {
    const loadRole = vi.fn(async () => "admin");
    const result = await authorizeAdminRequest(
      requestWith(await signToken({ go_irl_role: "user" })),
      dependencies({ loadRole }),
    );

    expect(result).toEqual({ ok: false, status: 403, error: "access_denied" });
    expect(loadRole).not.toHaveBeenCalled();
  });

  it("denies missing, expired, malformed, or foreign-issued sessions before role lookup", async () => {
    const loadRole = vi.fn(async () => "admin");
    const deps = dependencies({ loadRole });
    const missing = await authorizeAdminRequest(requestWith(), deps);
    const expired = await authorizeAdminRequest(requestWith(await signToken({ exp: nowSeconds - 1 })), deps);
    const malformed = await authorizeAdminRequest(requestWith(`${await signToken()}broken`), deps);
    const foreignIssuer = await authorizeAdminRequest(requestWith(await signToken({ iss: "foreign" })), deps);

    expect(missing).toEqual({ ok: false, status: 401, error: "access_denied" });
    expect(expired).toEqual({ ok: false, status: 401, error: "access_denied" });
    expect(malformed).toEqual({ ok: false, status: 401, error: "access_denied" });
    expect(foreignIssuer).toEqual({ ok: false, status: 403, error: "access_denied" });
    expect(loadRole).not.toHaveBeenCalled();
  });

  it("records denial categories without logging raw Telegram initData", async () => {
    const logger = vi.fn();
    const rawInitData = "query_id=secret&user=%7B%22id%22%3A1%7D&hash=secret";
    const result = await authorizeAdminRequest(
      requestWith(undefined, rawInitData),
      dependencies({ logger }),
    );

    expect(result).toEqual({ ok: false, status: 401, error: "access_denied" });
    expect(logger).toHaveBeenCalledWith("admin_login_denied", { reason: "missing_bearer" });
    expect(JSON.stringify(logger.mock.calls)).not.toContain(rawInitData);
  });

  it("does not execute a direct admin action without the allowed identity", async () => {
    const action = vi.fn(async () => "changed");
    const denied = await runAuthorizedAdminAction(
      requestWith(await signToken({ go_irl_user_key: "telegram:other-user" })),
      dependencies(),
      action,
    );

    expect(denied).toEqual({ ok: false, status: 403, error: "access_denied" });
    expect(action).not.toHaveBeenCalled();
  });

  it("executes an admin action only after server authorization succeeds", async () => {
    const action = vi.fn(async (authorization) => authorization.userKey);
    const result = await runAuthorizedAdminAction(
      requestWith(await signToken()),
      dependencies(),
      action,
    );

    expect(result).toMatchObject({ ok: true, value: allowedUserKey });
    expect(action).toHaveBeenCalledTimes(1);
  });
});
