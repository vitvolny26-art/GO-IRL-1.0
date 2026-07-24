import { describe, expect, it } from "vitest";
import { normalizeMapyUrl } from "./mapyRuntimeLinks";

describe("Mapy.com runtime links", () => {
  it("converts an OpenStreetMap marker to an exact Mapy.com point", () => {
    expect(normalizeMapyUrl("https://www.openstreetmap.org/?mlat=49.593800&mlon=17.250900#map=16/49.593800/17.250900"))
      .toBe("https://mapy.com/fnc/v1/showmap?mapset=basic&center=17.250900,49.593800&zoom=16&marker=true");
  });

  it("converts legacy Google Maps searches to Mapy.com searches", () => {
    expect(normalizeMapyUrl("https://www.google.com/maps/search/?api=1&query=Lanov%C3%A1%2C%20Olomouc"))
      .toBe("https://mapy.com/zakladni?q=Lanov%C3%A1%2C%20Olomouc");
  });

  it("preserves an explicit provider choice and removes the internal marker", () => {
    expect(normalizeMapyUrl("https://www.google.com/maps/search/?api=1&query=49.5%2C17.2&go_irl_provider=google"))
      .toBe("https://www.google.com/maps/search/?api=1&query=49.5%2C17.2");
    expect(normalizeMapyUrl("https://maps.apple.com/?q=Olomouc&go_irl_provider=apple"))
      .toBe("https://maps.apple.com/?q=Olomouc");
  });

  it("migrates mapy.cz links and leaves unrelated links unchanged", () => {
    expect(normalizeMapyUrl("https://mapy.cz/zakladni?q=Olomouc")).toContain("mapy.com/zakladni?q=Olomouc");
    expect(normalizeMapyUrl("https://example.com/path")).toBe("https://example.com/path");
  });
});
