import { describe, expect, it } from "vitest";
import { profileHubSections, shouldShowAdminEntry } from "./ProfileHubPortal";

describe("profile hub navigation", () => {
  it("keeps the closed-beta shell compact and hides future modules", () => {
    expect(profileHubSections).toEqual([
      "identity",
      "preferences",
      "my-go-irl",
      "diagnostics",
    ]);
  });

  it("shows the admin entry only for the admin role", () => {
    expect(shouldShowAdminEntry("admin")).toBe(true);
    expect(shouldShowAdminEntry("user")).toBe(false);
    expect(shouldShowAdminEntry("organizer")).toBe(false);
    expect(shouldShowAdminEntry("moderator")).toBe(false);
  });
});
