import { describe, expect, it } from "vitest";
import {
  isProfilePath,
  profilePathForSection,
  resolveProfileSectionFromPath,
} from "./profileRoute";

describe("profile route contract", () => {
  it("maps owned profile sections to stable paths", () => {
    expect(profilePathForSection("identity")).toBe("/profile");
    expect(profilePathForSection("preferences")).toBe("/profile/preferences");
    expect(profilePathForSection("my-go-irl")).toBe("/profile/activities");
    expect(profilePathForSection("privacy")).toBe("/profile/privacy");
    expect(profilePathForSection("diagnostics")).toBe("/profile/diagnostics");
  });

  it("resolves routes deterministically", () => {
    expect(resolveProfileSectionFromPath("/profile/preferences")).toBe("preferences");
    expect(resolveProfileSectionFromPath("/profile/activities/")).toBe("my-go-irl");
    expect(resolveProfileSectionFromPath("/profile/privacy")).toBe("privacy");
    expect(resolveProfileSectionFromPath("/profile/unknown")).toBe("identity");
  });

  it("recognizes only profile-owned paths", () => {
    expect(isProfilePath("/profile")).toBe(true);
    expect(isProfilePath("/profile/privacy")).toBe(true);
    expect(isProfilePath("/admin/profile")).toBe(false);
  });
});
