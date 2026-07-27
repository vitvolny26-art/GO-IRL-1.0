import { getCurrentAuthSession, initializeTrustedAuth } from "../authSession";

export type AdminRoute = "login" | "panel" | "denied" | null;
type FetchLike = typeof fetch;

export const resolveAdminRoute = (pathname: string): AdminRoute => {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/admin/login") return "login";
  if (normalized === "/admin/access-denied") return "denied";
  if (normalized === "/admin" || normalized.startsWith("/admin/")) return "panel";
  return null;
};

export const adminRedirectForAuthorization = (authorized: boolean) =>
  authorized ? "/admin" : "/admin/access-denied";

export const requestAdminSession = async (accessToken: string, fetcher: FetchLike = fetch) => {
  if (!accessToken.trim()) return false;
  try {
    const response = await fetcher("/api/admin/session", {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const verifyCurrentAdminSession = async (fetcher: FetchLike = fetch) => {
  const identity = await initializeTrustedAuth();
  const session = identity && "source" in identity && identity.source === "trusted-telegram"
    ? identity
    : getCurrentAuthSession();
  return session?.accessToken ? requestAdminSession(session.accessToken, fetcher) : false;
};
