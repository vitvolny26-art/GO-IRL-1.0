import { describe, expect, it } from "vitest";
import {
  defaultProfilePanelSection,
  profilePanelSections,
  resolveProfilePanelSection,
  transitionProfilePanel,
  visibleProfilePanelSections,
} from "./profilePanelNavigation";

describe("profile panel navigation", () => {
  it("keeps one ordered closed-beta section registry", () => {
    expect(profilePanelSections.map((section) => section.id)).toEqual([
      "profile",
      "activities",
      "preferences",
      "notifications",
      "privacy",
      "support",
      "diagnostics",
    ]);
  });

  it("hides owner-only sections without owner context", () => {
    expect(visibleProfilePanelSections(false).map((section) => section.id)).toEqual([
      "profile",
      "support",
    ]);
  });

  it("falls back deterministically for invalid or unavailable sections", () => {
    expect(resolveProfilePanelSection("unknown", true)).toBe(defaultProfilePanelSection);
    expect(resolveProfilePanelSection("preferences", false)).toBe(defaultProfilePanelSection);
  });

  it("preserves the current section while profile editing is active", () => {
    const state = { activeSection: "profile" as const, editing: true };
    expect(transitionProfilePanel(state, "activities", true)).toEqual(state);
  });

  it("allows navigation after editing ends", () => {
    expect(transitionProfilePanel(
      { activeSection: "profile", editing: false },
      "activities",
      true,
    )).toEqual({ activeSection: "activities", editing: false });
  });
});
