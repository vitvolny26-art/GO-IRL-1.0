import { describe, expect, it, vi } from "vitest";
import {
  buildRoleInvitationUrl,
  isRoleInvitationStartParam,
  requestRoleAssignments,
  requestRoleDemotion,
  requestRoleInvitation,
} from "./roleInvitations";

const startParam = `ri_${"a".repeat(43)}`;
const dependencies = {
  initData: "signed-init-data",
  publishableKey: "publishable-key",
  supabaseUrl: "https://project.supabase.co",
};

describe("admin role invitations", () => {
  it("builds a Telegram Mini App link without identity data", () => {
    expect(buildRoleInvitationUrl(startParam, "@GOirl_bot")).toBe(`https://t.me/GOirl_bot?startapp=${startParam}`);
    expect(isRoleInvitationStartParam(startParam)).toBe(true);
    expect(buildRoleInvitationUrl("bad-token", "GOirl_bot")).toBeNull();
  });

  it("creates an invitation through the trusted verifier", async () => {
    const fetcher = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toEqual({
        action: "create_role_invitation",
        targetRole: "organizer",
        initData: "signed-init-data",
      });
      return new Response(JSON.stringify({ invitation: {
        id: "11f4dc06-3f32-4b63-93f9-7e4e4d1f7f85",
        startParam,
        targetRole: "organizer",
        expiresAt: "2026-08-01T12:00:00.000Z",
      } }), { status: 201, headers: { "Content-Type": "application/json" } });
    });
    await expect(requestRoleInvitation("organizer", { ...dependencies, fetcher: fetcher as typeof fetch }))
      .resolves.toMatchObject({ targetRole: "organizer", startParam });
  });
});

describe("admin role management", () => {
  it("loads elevated role assignments", async () => {
    const fetcher = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toEqual({ action: "list_role_assignments", initData: "signed-init-data" });
      return new Response(JSON.stringify({ roleAssignments: [{
        user_key: "telegram:8585124925",
        telegram_id: 8585124925,
        first_name: "Test",
        last_name: "Master",
        username: "testmaster",
        role: "professional",
        updated_at: "2026-08-01T00:00:00.000Z",
      }] }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    await expect(requestRoleAssignments({ ...dependencies, fetcher: fetcher as typeof fetch }))
      .resolves.toEqual([expect.objectContaining({ userKey: "telegram:8585124925", role: "professional" })]);
  });

  it("demotes a selected elevated role", async () => {
    const fetcher = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toEqual({
        action: "demote_role",
        targetUserKey: "telegram:8585124925",
        initData: "signed-init-data",
      });
      return new Response(JSON.stringify({ roleDemotion: {
        status: "updated",
        previousRole: "professional",
        currentRole: "user",
      } }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    await expect(requestRoleDemotion("telegram:8585124925", { ...dependencies, fetcher: fetcher as typeof fetch }))
      .resolves.toMatchObject({ status: "updated", currentRole: "user" });
  });

  it("rejects malformed user keys before network access", async () => {
    const fetcher = vi.fn();
    await expect(requestRoleDemotion("8585124925", { ...dependencies, fetcher: fetcher as typeof fetch }))
      .rejects.toThrow("invalid_target_user_key");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
