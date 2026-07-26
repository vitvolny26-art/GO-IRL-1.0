import { requireEnv } from "./env.js";

export type AdminAuthorizationLogger = (event: "admin_login_allowed" | "admin_login_denied", details: {
  reason: string;
}) => void;

type AdminJwtClaims = {
  aud?: string;
  exp?: number;
  role?: string;
  sub?: string;
  go_irl_role?: string;
  go_irl_user_key?: string;
};

type AdminAuthorizationDependencies = {
  allowedUserKey: string;
  jwtSecret: string;
  loadRole: (userKey: string, accessToken: string) => Promise<string | null>;
  logger?: AdminAuthorizationLogger;
  nowSeconds?: number;
};

export type AdminAuthorizationResult =
  | { ok: true; userKey: string; subject: string }
  | { ok: false; status: 401 | 403; error: "access_denied" };

const deny = (status: 401 | 403, reason: string, logger?: AdminAuthorizationLogger): AdminAuthorizationResult => {
  logger?.("admin_login_denied", { reason });
  return { ok: false, status, error: "access_denied" };
};

const base64UrlToBytes = (value: string) => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
};

const decodeJson = <T>(value: string): T => {
  const bytes = base64UrlToBytes(value);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
};

async function verifyAdminJwt(token: string, secret: string): Promise<AdminJwtClaims | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = decodeJson<{ alg?: string; typ?: string }>(parts[0]);
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;
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
      base64UrlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    return valid ? decodeJson<AdminJwtClaims>(parts[1]) : null;
  } catch {
    return null;
  }
}

export async function authorizeAdminRequest(
  request: Request,
  dependencies: AdminAuthorizationDependencies,
): Promise<AdminAuthorizationResult> {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return deny(401, "missing_bearer", dependencies.logger);

  const claims = await verifyAdminJwt(token, dependencies.jwtSecret);
  if (!claims) return deny(401, "invalid_session", dependencies.logger);

  const now = dependencies.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (!claims.exp || claims.exp <= now) return deny(401, "expired_session", dependencies.logger);
  if (claims.aud !== "authenticated" || claims.role !== "authenticated" || !claims.sub) {
    return deny(403, "invalid_claims", dependencies.logger);
  }
  if (claims.go_irl_user_key !== dependencies.allowedUserKey || claims.go_irl_role !== "admin") {
    return deny(403, "identity_not_allowed", dependencies.logger);
  }

  const currentRole = await dependencies.loadRole(claims.go_irl_user_key, token);
  if (currentRole !== "admin") return deny(403, "role_not_allowed", dependencies.logger);

  dependencies.logger?.("admin_login_allowed", { reason: "authorized" });
  return { ok: true, userKey: claims.go_irl_user_key, subject: claims.sub };
}

const productionRoleLoader = async (userKey: string, accessToken: string) => {
  const response = await fetch(
    `${requireEnv("SUPABASE_URL")}/rest/v1/user_roles?select=role&user_key=eq.${encodeURIComponent(userKey)}&limit=1`,
    {
      headers: {
        apikey: requireEnv("SUPABASE_PUBLISHABLE_KEY"),
        authorization: `Bearer ${accessToken}`,
        accept: "application/json",
      },
    },
  );
  if (!response.ok) throw new Error("admin_role_lookup_failed");
  const rows = await response.json() as Array<{ role?: string }>;
  return rows[0]?.role || null;
};

export const productionAdminAuthorizationDependencies = (): AdminAuthorizationDependencies => ({
  allowedUserKey: requireEnv("GO_IRL_ADMIN_USER_KEY"),
  jwtSecret: requireEnv("GO_IRL_JWT_SECRET"),
  loadRole: productionRoleLoader,
  logger: (event, details) => console.warn(event, details),
});
