import { describe, expect, it } from "vitest";
import {
  adminModules,
  adminPathForSection,
  adminRoleMatrix,
  adminSectionForPath,
} from "./AdminLoginPage";

describe("admin operations shell", () => {
  it("maps protected admin deep links to the matching section", () => {
    expect(adminSectionForPath("/admin")).toBe("overview");
    expect(adminSectionForPath("/admin/users")).toBe("users");
    expect(adminSectionForPath("/admin/roles/")).toBe("roles");
    expect(adminSectionForPath("/admin/events")).toBe("events");
    expect(adminSectionForPath("/admin/reports")).toBe("reports");
    expect(adminSectionForPath("/admin/health")).toBe("health");
    expect(adminSectionForPath("/admin/flags")).toBe("flags");
    expect(adminSectionForPath("/admin/unknown")).toBe("overview");
  });

  it("builds stable routes for every Admin104-110 module", () => {
    expect(adminModules.map((module) => module.task)).toEqual([
      "Admin104",
      "Admin105",
      "Admin106",
      "Admin107",
      "Admin108",
      "Admin109",
      "Admin110",
    ]);
    expect(adminModules.map((module) => adminPathForSection(module.id))).toEqual([
      "/admin",
      "/admin/users",
      "/admin/roles",
      "/admin/events",
      "/admin/reports",
      "/admin/health",
      "/admin/flags",
    ]);
  });

  it("uses the repository role vocabulary without inventing elevated roles", () => {
    expect(adminRoleMatrix.map((entry) => entry.role)).toEqual([
      "admin",
      "moderator",
      "organizer",
      "user",
    ]);
  });
});
