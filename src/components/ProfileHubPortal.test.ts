import { describe, expect, it } from "vitest";
import { profileHubSections } from "./ProfileHubPortal";

describe("profile hub navigation", () => {
  it("keeps the closed-beta shell compact and hides future modules", () => {
    expect(profileHubSections).toEqual([
      "identity",
      "preferences",
      "my-go-irl",
      "diagnostics",
    ]);
  });
});
