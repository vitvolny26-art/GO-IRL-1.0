import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const edgeSource = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
const migrationSource = readFileSync(
  new URL("../../migrations/20260801001500_admin006_remove_professional_role.sql", import.meta.url),
  "utf8",
);

describe("ADMIN006 professional role removal boundary", () => {
  it("requires a current database admin before mutation", () => {
    const action = edgeSource.indexOf('action === "remove_professional_role"');
    const adminCheck = edgeSource.indexOf('roleBeforeAction.data?.role !== "admin"', action);
    const rpcCall = edgeSource.indexOf('rpc("go_irl_remove_professional_role"', adminCheck);

    expect(action).toBeGreaterThan(-1);
    expect(adminCheck).toBeGreaterThan(action);
    expect(rpcCall).toBeGreaterThan(adminCheck);
  });

  it("allows only professional to user and writes safe audit metadata", () => {
    expect(migrationSource).toContain("if v_previous_role <> 'professional'");
    expect(migrationSource).toContain("set role = 'user'");
    expect(migrationSource).toContain("'user_role.professional_removed'");
    expect(migrationSource).toContain("'previous_role', 'professional'");
    expect(migrationSource).toContain("'current_role', 'user'");
  });

  it("keeps execution service-role only", () => {
    expect(migrationSource).toContain("revoke execute on function public.go_irl_remove_professional_role");
    expect(migrationSource).toContain("from public, anon, authenticated");
    expect(migrationSource).toContain("to service_role");
  });
});
