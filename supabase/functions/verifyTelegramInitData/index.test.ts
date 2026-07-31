import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const edgeSource = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
const migrationSource = readFileSync(
  new URL("../../migrations/20260731135251_admin005_role_invitations.sql", import.meta.url),
  "utf8",
);

describe("Admin005 role invitation boundary", () => {
  it("allows creation only after current database admin verification", () => {
    const action = edgeSource.indexOf('action === "create_role_invitation"');
    const adminCheck = edgeSource.indexOf('roleBeforeAction.data?.role !== "admin"', action);
    const tokenCreation = edgeSource.indexOf("createRoleInvitationToken()", adminCheck);

    expect(action).toBeGreaterThan(-1);
    expect(adminCheck).toBeGreaterThan(action);
    expect(tokenCreation).toBeGreaterThan(adminCheck);
    expect(edgeSource).toContain('return json({ error: "access_denied" }, 403)');
  });

  it("stores only a SHA-256 hash and keeps table access behind service-only RPCs", () => {
    expect(edgeSource).toContain("hashRoleInvitationToken(token)");
    expect(edgeSource).toContain("p_token_hash: tokenHash");
    expect(migrationSource).toContain("token_hash text not null unique");
    expect(migrationSource).not.toMatch(/\n\s*token\s+text/i);
    expect(migrationSource).toContain(
      "revoke all on table public.role_invitations from public, anon, authenticated, service_role",
    );
    expect(migrationSource).toContain("grant execute on function public.go_irl_create_role_invitation");
    expect(migrationSource).toContain("grant execute on function public.go_irl_redeem_role_invitation");
  });

  it("limits roles, lifetime and redemption to one user-role promotion", () => {
    expect(migrationSource).toContain("target_role in ('organizer', 'professional')");
    expect(migrationSource).toContain("expires_at <= created_at + interval '24 hours'");
    expect(migrationSource).toContain("for update");
    expect(migrationSource).toContain("v_invitation.consumed_at is not null");
    expect(migrationSource).toContain("where public.user_roles.role = 'user'");
    expect(migrationSource).toContain("'role_conflict'::text");
  });

  it("keeps role start parameters out of activity invite claims and records safe audit metadata", () => {
    expect(edgeSource).toContain("go_irl_start_param: roleInvitationToken ? null");
    expect(edgeSource).toContain("startParam: roleInvitationToken ? undefined : verified.startParam");
    expect(migrationSource).toContain("'role_invitation.created'");
    expect(migrationSource).toContain("'role_invitation.redeemed'");
    expect(migrationSource).not.toContain("jsonb_build_object('token'");
  });
});
