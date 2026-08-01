import { describe, expect, it, vi } from "vitest";
import { normalizeTelegramId, requestProfessionalRoleRemoval } from "./roleInvitations";

describe("admin professional role removal", () => {
  it("accepts only numeric Telegram IDs", () => {
    expect(normalizeTelegramId("8585124925")).toBe("8585124925");
    expect(normalizeTelegramId(" telegram:8585124925 ")).toBeNull();
    expect(normalizeTelegramId("abc")).toBeNull();
  });

  it("sends the guarded admin action through Telegram verification", async () => {
    const fetcher = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toEqual({
        action: "remove_professional_role",
        targetTelegramId: "8585124925",
        initData: "signed-init-data",
      });
      return new Response(JSON.stringify({
        roleRemoval: {
          status: "updated",
          targetUserKey: "telegram:8585124925",
          previousRole: "professional",
          currentRole: "user",
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });

    await expect(requestProfessionalRoleRemoval("8585124925", {
      fetcher: fetcher as typeof fetch,
      initData: "signed-init-data",
      publishableKey: "publishable-key",
      supabaseUrl: "https://project.supabase.co",
    })).resolves.toMatchObject({ status: "updated" });
  });

  it("fails closed on a denied request", async () => {
    await expect(requestProfessionalRoleRemoval("8585124925", {
      fetcher: vi.fn(async () => new Response(JSON.stringify({ error: "access_denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch,
      initData: "signed-init-data",
      publishableKey: "publishable-key",
      supabaseUrl: "https://project.supabase.co",
    })).rejects.toThrow("access_denied");
  });
});
