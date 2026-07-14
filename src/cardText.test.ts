import { describe, expect, it } from "vitest";
import { stripLeadingEmoji } from "./cardText";

describe("stripLeadingEmoji", () => {
  it("removes duplicated event emoji from card text", () => {
    expect(stripLeadingEmoji("☕ Кофе")).toBe("Кофе");
    expect(stripLeadingEmoji("🏐 Волейбол")).toBe("Волейбол");
    expect(stripLeadingEmoji("🗣️ Языковой обмен")).toBe("Языковой обмен");
  });

  it("keeps normal text unchanged", () => {
    expect(stripLeadingEmoji("На палочку чая")).toBe("На палочку чая");
    expect(stripLeadingEmoji("")).toBe("");
  });
});
