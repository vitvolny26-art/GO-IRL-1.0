import { describe, expect, it, vi } from "vitest";
import { adminRedirectForAuthorization, requestAdminSession, resolveAdminRoute } from "./adminSession";

describe("admin session routing", () => {
  it("routes and redirects through protected admin surfaces", () => {
    expect(adminRedirectForAuthorization(true)).toBe("/admin");
    expect(adminRedirectForAuthorization(false)).toBe("/admin/access-denied");
    expect(resolveAdminRoute("/admin/login")).toBe("login");
    expect(resolveAdminRoute("/admin")).toBe("panel");
    expect(resolveAdminRoute("/admin/users")).toBe("panel");
    expect(resolveAdminRoute("/admin/access-denied")).toBe("denied");
    expect(resolveAdminRoute("/join/activity-id")).toBeNull();
  });

  it("sends only the bearer token and fails closed", async () => {
    const allowed = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init).toEqual({ method: "POST", headers: { authorization: "Bearer signed-session" } });
      return new Response(null, { status: 200 });
    });
    await expect(requestAdminSession("signed-session", allowed as typeof fetch)).resolves.toBe(true);
    await expect(requestAdminSession("", allowed as typeof fetch)).resolves.toBe(false);
    await expect(requestAdminSession("signed-session", vi.fn(async () => new Response(null, { status: 403 })) as typeof fetch)).resolves.toBe(false);
  });
});
