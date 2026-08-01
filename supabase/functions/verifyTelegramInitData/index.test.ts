import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const edgeSource = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
const migrationSource = readFileSync(
  new URL("../../migrations/20260731135251_admin005_role_invitations.sql", import.meta.url),
  "utf8",
);
const removalMigrationSource = readFileSync(
  new URL("../../migrations/20260801001500_admin006_remove_professional_role.sql", import.meta.url),
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

describe("Admin006 professional role removal boundary", () => {
  it("revalidates the current admin role before removal", () => {
    const action = edgeSource.indexOf('action === "remove_professional_role"');
    const adminCheck = edgeSource.indexOf('roleBeforeAction.data?.role !== "admin"', action);
    const rpcCall = edgeSource.indexOf('rpc("go_irl_remove_professional_role"', adminCheck);

    expect(action).toBeGreaterThan(-1);
    expect(adminCheck).toBeGreaterThan(action);
    expect(rpcCall).toBeGreaterThan(adminCheck);
  });

  it("accepts only numeric Telegram ids and does not expose direct table mutation", () => {
    expect(edgeSource).toContain("invalid_target_telegram_id");
    expect(edgeSource).toContain("p_target_user_key: `telegram:${normalizedTelegramId}`");
    expect(edgeSource).not.toContain('.from("user_roles").update');
  });

  it("limits the database transition to professional-to-user and audits it", () => {
    expect(removalMigrationSource).toContain("if v_previous_role <> 'professional'");
    expect(removalMigrationSource).toContain("set role = 'user'");
    expect(removalMigrationSource).toContain("and role = 'professional'");
    expect(removalMigrationSource).toContain("'user_role.professional_removed'");
    expect(removalMigrationSource).toContain(
      "revoke execute on function public.go_irl_remove_professional_role(text, text)",
    );
    expect(removalMigrationSource).toContain(
      "grant execute on function public.go_irl_remove_professional_role(text, text)\nto service_role",
    );
  });
});
