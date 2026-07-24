import { describe, expect, it } from "vitest";
import { normalizeMapyUrl } from "./mapyRuntime";

describe("Mapy.com runtime actions", () => {
  it("converts a legacy OpenStreetMap marker URL to Mapy.com", () => {
    expect(normalizeMapyUrl("https://www.openstreetmap.org/?mlat=49.593800&mlon=17.250900#map=16/49.593800/17.250900"))
      .toBe("https://mapy.com/fnc/v1/showmap?mapset=basic&center=17.250900,49.593800&zoom=16&marker=true");
  });

  it("converts a Google Maps search URL to Mapy.com search", () => {
    expect(normalizeMapyUrl("https://www.google.com/maps/search/?api=1&query=Lanove%20centrum%2C%20Olomouc"))
      .toBe("https://mapy.com/zakladni?q=Lanove%20centrum%2C%20Olomouc");
  });

  it("moves legacy mapy.cz links to mapy.com", () => {
    expect(normalizeMapyUrl("https://mapy.cz/zakladni?q=Olomouc"))
      .toBe("https://mapy.com/zakladni?q=Olomouc");
  });

  it("leaves unrelated URLs unchanged", () => {
    expect(normalizeMapyUrl("https://example.com/event/1")).toBe("https://example.com/event/1");
  });
});
