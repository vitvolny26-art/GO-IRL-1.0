import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const edgeSource = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
const migrationSource = readFileSync(
  new URL("../../migrations/20260801001500_admin006_remove_professional_role.sql", import.meta.url),
  "utf8",
);

describe("ADMIN006 role management boundary", () => {
  it("requires a current database admin before list and mutation", () => {
    for (const actionName of ["list_role_assignments", "demote_role"]) {
      const action = edgeSource.indexOf(`action === "${actionName}"`);
      const adminCheck = edgeSource.indexOf('roleBeforeAction.data?.role !== "admin"', action);
      expect(action).toBeGreaterThan(-1);
      expect(adminCheck).toBeGreaterThan(action);
    }
  });

  it("lists only elevated roles and caps the result", () => {
    expect(migrationSource).toContain("roles.role in ('organizer', 'professional', 'moderator', 'admin')");
    expect(migrationSource).toContain("limit 200");
    expect(migrationSource).toContain("go_irl_list_elevated_roles");
  });

  it("demotes only non-admin elevated roles to user and audits the transition", () => {
    expect(migrationSource).toContain("v_previous_role not in ('organizer', 'professional', 'moderator')");
    expect(migrationSource).toContain("set role = 'user'");
    expect(migrationSource).toContain("'user_role.demoted'");
    expect(migrationSource).toContain("'previous_role', v_previous_role");
  });

  it("keeps both RPCs service-role only", () => {
    expect(migrationSource).toContain("revoke execute on function public.go_irl_list_elevated_roles()");
    expect(migrationSource).toContain("grant execute on function public.go_irl_list_elevated_roles()");
    expect(migrationSource).toContain("revoke execute on function public.go_irl_demote_role(text, text)");
    expect(migrationSource).toContain("grant execute on function public.go_irl_demote_role(text, text)");
  });
});
