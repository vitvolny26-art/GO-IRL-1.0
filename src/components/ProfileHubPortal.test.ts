import { describe, expect, it } from "vitest";
import { profileHubSections } from "./ProfileHubPortal";

describe("profile hub navigation", () => {
  it("keeps the closed-beta shell compact and excludes the admin entry", () => {
    expect(profileHubSections).toEqual([
      "identity",
      "preferences",
      "my-go-irl",
      "diagnostics",
    ]);
    expect(profileHubSections).not.toContain("admin");
  });
});
