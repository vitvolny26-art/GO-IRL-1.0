import { describe, expect, it } from "vitest";
import { buildEventLocationUrl, parseSavedEventLocations } from "./eventLocations";

describe("event locations", () => {
  it("builds a Mapy.cz suggestion from address and city", () => {
    expect(buildEventLocationUrl("Smetanovy sady", "Olomouc"))
      .toBe("https://mapy.cz/zakladni?q=Smetanovy%20sady%2C%20Olomouc");
    expect(buildEventLocationUrl("Olomouc", "Olomouc"))
      .toBe("https://mapy.cz/zakladni?q=Olomouc");
  });

  it("keeps the most useful valid saved locations first", () => {
    const parsed = parseSavedEventLocations(JSON.stringify([
      { address: "A", locationUrl: "https://example.test/a", uses: 1, lastUsedAt: "2026-07-01" },
      { address: "B", locationUrl: "https://example.test/b", uses: 3, lastUsedAt: "2026-07-02" },
      { address: "", uses: 9 },
    ]));
    expect(parsed.map((item) => item.address)).toEqual(["B", "A"]);
  });
});
