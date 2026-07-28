import { describe, expect, it } from "vitest";
import {
  defaultProfilePanelSection,
  profilePanelSections,
  resolveProfilePanelBack,
  resolveProfilePanelSection,
  transitionProfilePanel,
  visibleProfilePanelSections,
} from "./profilePanelNavigation";

describe("profile panel navigation", () => {
  it("keeps one ordered canonical section registry", () => {
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

  it("exposes only the closed-beta owner sections", () => {
    expect(visibleProfilePanelSections(true).map((section) => section.id)).toEqual([
      "profile",
      "activities",
      "preferences",
      "diagnostics",
    ]);
  });

  it("shows only the public-safe profile section without owner context", () => {
    expect(visibleProfilePanelSections(false).map((section) => section.id)).toEqual([
      "profile",
    ]);
  });

  it("falls back deterministically for invalid, hidden or unavailable sections", () => {
    expect(resolveProfilePanelSection("unknown", true)).toBe(defaultProfilePanelSection);
    expect(resolveProfilePanelSection("notifications", true)).toBe(defaultProfilePanelSection);
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

  it("consumes Telegram or browser back by returning to profile", () => {
    expect(resolveProfilePanelBack({
      activeSection: "activities",
      editing: false,
    })).toEqual({ activeSection: "profile", editing: false });
  });

  it("delegates back to the parent app from the profile root", () => {
    expect(resolveProfilePanelBack({
      activeSection: "profile",
      editing: false,
    })).toBeNull();
  });

  it("does not leave an active edit session on back", () => {
    const state = { activeSection: "profile" as const, editing: true };
    expect(resolveProfilePanelBack(state)).toEqual(state);
  });
});
