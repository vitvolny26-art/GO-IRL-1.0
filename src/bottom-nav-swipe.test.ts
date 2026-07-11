import { describe, expect, it } from "vitest";
import { resolveSwipeDirection } from "./bottom-nav-swipe";

describe("resolveSwipeDirection", () => {
  it("maps horizontal swipes to neighboring tabs", () => {
    expect(resolveSwipeDirection(-90, 12)).toBe("next");
    expect(resolveSwipeDirection(90, -12)).toBe("prev");
  });

  it("ignores short or mostly vertical gestures", () => {
    expect(resolveSwipeDirection(40, 2)).toBeNull();
    expect(resolveSwipeDirection(90, 95)).toBeNull();
    expect(resolveSwipeDirection(75, 75)).toBeNull();
  });
});
