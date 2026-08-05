import { describe, expect, it } from "vitest";
import { canShowBeautyWorkspaceEntry, servicesBottomNavigationCount } from "./servicesRoleNavigation";

describe("servicesRoleNavigation", () => {
  it.each(["user", "organizer", "moderator"] as const)("keeps the professional workspace hidden for %s", (role) => {
    expect(canShowBeautyWorkspaceEntry(role)).toBe(false);
    expect(servicesBottomNavigationCount(role)).toBe(5);
  });

  it.each(["professional", "admin"] as const)("shows the professional workspace for %s", (role) => {
    expect(canShowBeautyWorkspaceEntry(role)).toBe(true);
    expect(servicesBottomNavigationCount(role)).toBe(6);
  });
});
