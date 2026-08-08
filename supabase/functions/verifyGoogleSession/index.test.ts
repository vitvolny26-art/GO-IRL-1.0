import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const edgeSource = readFileSync(new URL("./index.ts", import.meta.url), "utf8");

describe("AUTH200 Google bootstrap boundary", () => {
  it("validates the Supabase bearer before reading Google identity or writing GO IRL identity state", () => {
    const getUser = edgeSource.indexOf("supabase.auth.getUser(accessToken)");
    const googleIdentity = edgeSource.indexOf("readGoogleProviderId(authUser.identities)", getUser);
    const appUserWrite = edgeSource.indexOf('.from("app_users").upsert', googleIdentity);
    expect(getUser).toBeGreaterThan(-1);
    expect(googleIdentity).toBeGreaterThan(getUser);
    expect(appUserWrite).toBeGreaterThan(googleIdentity);
  });

  it("uses immutable Google provider identity and never links by email", () => {
    expect(edgeSource).toContain('record.provider !== "google"');
    expect(edgeSource).toContain("record.provider_id");
    expect(edgeSource).toContain("identityData?.sub");
    expect(edgeSource).not.toMatch(/\.eq\(\s*["']email["']/);
    expect(edgeSource).not.toContain("authUser.email");
  });

  it("respects an explicitly pre-existing provider link instead of silently replacing it", () => {
    const identityLookup = edgeSource.indexOf('.from("user_provider_identities")');
    const linkedPath = edgeSource.indexOf("linkedIdentity?.user_key", identityLookup);
    const newUserKey = edgeSource.indexOf("`google:${providerUserId}`", linkedPath);
    expect(identityLookup).toBeGreaterThan(-1);
    expect(linkedPath).toBeGreaterThan(identityLookup);
    expect(newUserKey).toBeGreaterThan(linkedPath);
  });

  it("mints the existing GO IRL RLS claims without requiring a Telegram identity", () => {
    expect(edgeSource).toContain('go_irl_user_key: appUser.user_key');
    expect(edgeSource).toContain('go_irl_auth_provider: "google"');
    expect(edgeSource).toContain("go_irl_provider_user_id: providerUserId");
    expect(edgeSource).toContain("go_irl_role: role");
    expect(edgeSource).not.toContain("go_irl_telegram_id");
  });

  it("keeps provider failures sanitized", () => {
    expect(edgeSource).toContain('return json({ error: "access_denied" }, 401)');
    expect(edgeSource).toContain('return json({ error: "google_identity_required" }, 403)');
    expect(edgeSource).toContain('return json({ error: "verification_failed" }, 500)');
    expect(edgeSource).not.toContain("error.message");
  });
});
