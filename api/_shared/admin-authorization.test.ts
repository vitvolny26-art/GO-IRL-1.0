import { afterEach, describe, expect, it, vi } from "vitest";
import { authorizeAdminRequest, productionRoleLoader, runAuthorizedAdminAction, type AdminAuthorizationDependencies } from "./admin-authorization.js";

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
  const payload = base64Url(JSON.stringify({ aud: "authenticated", role: "authenticated", sub: "00000000-0000-4000-8000-000000000001", exp: nowSeconds + 3600, iss: issuer, go_irl_user_key: allowedUserKey, go_irl_role: "admin", ...overrides }));
  const unsigned = `${header}.${payload}`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(unsigned)));
  return `${unsigned}.${base64Url(signature)}`;
}

const requestWith = (token?: string) => new Request("https://goirl.invalid/api/admin/session", { method: "POST", headers: token ? { authorization: `Bearer ${token}` } : {} });
const dependencies = (overrides: Partial<AdminAuthorizationDependencies> = {}): AdminAuthorizationDependencies => ({ allowedUserKey, issuer, jwtSecret: secret, loadRole: async () => "admin", nowSeconds, ...overrides });

describe("dedicated admin authorization", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows only the approved identity with current admin role", async () => {
    const loadRole = vi.fn(async () => "admin");
    await expect(authorizeAdminRequest(requestWith(await signToken()), dependencies({ loadRole }))).resolves.toMatchObject({ ok: true, userKey: allowedUserKey });
    expect(loadRole).toHaveBeenCalledOnce();
  });

  it("denies another admin, downgraded role, stale role and invalid sessions", async () => {
    await expect(authorizeAdminRequest(requestWith(await signToken({ go_irl_user_key: "telegram:other-admin" })), dependencies())).resolves.toEqual({ ok: false, status: 403, error: "access_denied" });
    await expect(authorizeAdminRequest(requestWith(await signToken()), dependencies({ loadRole: async () => "user" }))).resolves.toEqual({ ok: false, status: 403, error: "access_denied" });
    await expect(authorizeAdminRequest(requestWith(await signToken({ go_irl_role: "user" })), dependencies())).resolves.toEqual({ ok: false, status: 403, error: "access_denied" });
    await expect(authorizeAdminRequest(requestWith(), dependencies())).resolves.toEqual({ ok: false, status: 401, error: "access_denied" });
    await expect(authorizeAdminRequest(requestWith(await signToken({ exp: nowSeconds - 1 })), dependencies())).resolves.toEqual({ ok: false, status: 401, error: "access_denied" });
    await expect(authorizeAdminRequest(requestWith(await signToken({ iss: "foreign" })), dependencies())).resolves.toEqual({ ok: false, status: 403, error: "access_denied" });
  });

  it("does not execute an admin action before authorization", async () => {
    const action = vi.fn(async () => "changed");
    await expect(runAuthorizedAdminAction(requestWith(await signToken({ go_irl_user_key: "telegram:other-user" })), dependencies(), action)).resolves.toEqual({ ok: false, status: 403, error: "access_denied" });
    expect(action).not.toHaveBeenCalled();
  });

  it("denies generically when the current-role lookup is unavailable", async () => {
    const logger = vi.fn();
    await expect(authorizeAdminRequest(
      requestWith(await signToken()),
      dependencies({ loadRole: async () => { throw new Error("unavailable"); }, logger }),
    )).resolves.toEqual({ ok: false, status: 403, error: "access_denied" });
    expect(logger).toHaveBeenCalledWith("admin_login_denied", { reason: "role_lookup_failed" });
  });

  it("loads the current role with the server-only service role", async () => {
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "server-only-service-role");
    const fetcher = vi.fn(async () => Response.json([{ role: "admin" }]));

    await expect(productionRoleLoader("telegram:123 456", "custom-user-jwt", fetcher)).resolves.toBe("admin");
    expect(fetcher).toHaveBeenCalledWith(
      "https://project.supabase.co/rest/v1/user_roles?select=role&user_key=eq.telegram%3A123%20456&limit=1",
      {
        headers: {
          apikey: "server-only-service-role",
          authorization: "Bearer server-only-service-role",
          accept: "application/json",
        },
      },
    );
  });
});
