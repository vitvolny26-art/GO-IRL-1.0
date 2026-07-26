import { describe, expect, it, vi } from "vitest";
import {
  adminRedirectForAuthorization,
  requestAdminSession,
  resolveAdminRoute,
} from "./adminSession";

describe("admin session routing", () => {
  it("redirects successful and denied login checks to separate routes", () => {
    expect(adminRedirectForAuthorization(true)).toBe("/admin");
    expect(adminRedirectForAuthorization(false)).toBe("/admin/access-denied");
  });

  it("routes every admin URL through an explicit admin surface", () => {
    expect(resolveAdminRoute("/admin/login")).toBe("login");
    expect(resolveAdminRoute("/admin")).toBe("panel");
    expect(resolveAdminRoute("/admin/users")).toBe("panel");
    expect(resolveAdminRoute("/admin/access-denied")).toBe("denied");
    expect(resolveAdminRoute("/join/activity-id")).toBeNull();
  });

  it("sends only the bearer token to the server-side session guard", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      expect(init?.headers).toEqual({ authorization: "Bearer signed-session" });
      expect(init?.body).toBeUndefined();
      return new Response(null, { status: 200 });
    });

    await expect(requestAdminSession("signed-session", fetcher as typeof fetch)).resolves.toBe(true);
    expect(fetcher).toHaveBeenCalledWith("/api/admin/session", expect.any(Object));
  });

  it("fails closed when the session endpoint denies or is unavailable", async () => {
    const denied = vi.fn(async () => new Response(null, { status: 403 }));
    const unavailable = vi.fn(async () => {
      throw new Error("offline");
    });

    await expect(requestAdminSession("signed-session", denied as typeof fetch)).resolves.toBe(false);
    await expect(requestAdminSession("signed-session", unavailable as typeof fetch)).resolves.toBe(false);
    await expect(requestAdminSession("", denied as typeof fetch)).resolves.toBe(false);
  });
});
