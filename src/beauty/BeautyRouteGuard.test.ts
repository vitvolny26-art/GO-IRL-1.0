import { describe, expect, it } from "vitest";
import { beautyRouteAccess } from "./beautyRouteAccess";

describe("Beauty route access", () => {
  it.each([
    ["professional", "allowed"],
    ["admin", "allowed"],
    ["user", "blocked"],
    ["organizer", "blocked"],
    ["moderator", "blocked"],
  ] as const)("resolves %s as %s", (role, expected) => {
    expect(beautyRouteAccess(role)).toBe(expected);
  });
});
