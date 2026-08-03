import { describe, expect, it } from "vitest";
import { isTabSwipeBlockedTarget, resolveAdjacentTab, resolveSwipeDirection } from "./bottom-nav-swipe";

describe("bottom tab swipe navigation", () => {
  it("disables horizontal swipe navigation", () => {
    expect(resolveSwipeDirection(-120, 8)).toBeNull();
    expect(resolveSwipeDirection(120, -8)).toBeNull();
    expect(resolveSwipeDirection(40, 2)).toBeNull();
  });

  it("blocks all touch targets from tab swipe handling", () => {
    expect(isTabSwipeBlockedTarget(null)).toBe(true);
  });

  it("keeps direct neighboring-tab resolution available for button navigation helpers", () => {
    expect(resolveAdjacentTab("home", "next")).toBe("discover");
    expect(resolveAdjacentTab("explore", "next")).toBe("create");
    expect(resolveAdjacentTab("profile", "next")).toBe("profile");
    expect(resolveAdjacentTab("home", "prev")).toBe("home");
  });
});
