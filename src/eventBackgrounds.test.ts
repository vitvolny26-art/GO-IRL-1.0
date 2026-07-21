import { describe, expect, it } from "vitest";
import { getEventBackground } from "./eventBackgrounds";

describe("event backgrounds", () => {
  it("loads the dedicated dinner photo for card 32", () => {
    expect(getEventBackground("DR")).toMatch(/32-dinner.*\.webp/);
  });
});
