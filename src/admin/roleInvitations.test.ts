import { describe, expect, it, vi } from "vitest";
import { buildRoleInvitationUrl, isRoleInvitationStartParam, requestRoleInvitation } from "./roleInvitations";

const startParam = `ri_${"a".repeat(43)}`;

describe("admin role invitations", () => {
  it("builds a Telegram Mini App link without adding identity data", () => {
    expect(buildRoleInvitationUrl(startParam, "@GOirl_bot"))
      .toBe(`https://t.me/GOirl_bot?startapp=${startParam}`);
    expect(buildRoleInvitationUrl(startParam, "GOirl_bot", "goirl"))
      .toBe(`https://t.me/GOirl_bot/goirl?startapp=${startParam}`);
    expect(buildRoleInvitationUrl("bad-token", "GOirl_bot")).toBeNull();
  });

  it("accepts only the exact role-invitation token format", () => {
    expect(isRoleInvitationStartParam(startParam)).toBe(true);
    expect(isRoleInvitationStartParam(`ri_${"a".repeat(42)}`)).toBe(false);
    expect(isRoleInvitationStartParam("telegram:8585124925")).toBe(false);
  });

  it("creates an invitation through the trusted Telegram verifier", async () => {
    const fetcher = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toEqual({
        action: "create_role_invitation",
        initData: "signed-init-data",
        targetRole: "organizer",
      });
      return new Response(JSON.stringify({
        invitation: {
          id: "11f4dc06-3f32-4b63-93f9-7e4e4d1f7f85",
          startParam,
          targetRole: "organizer",
          expiresAt: "2026-08-01T12:00:00.000Z",
        },
      }), { status: 201, headers: { "Content-Type": "application/json" } });
    });

    await expect(requestRoleInvitation("organizer", {
      fetcher: fetcher as typeof fetch,
      initData: "signed-init-data",
      publishableKey: "publishable-key",
      supabaseUrl: "https://project.supabase.co",
    })).resolves.toMatchObject({ targetRole: "organizer", startParam });
  });

  it("fails closed on a generic server denial", async () => {
    await expect(requestRoleInvitation("professional", {
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
