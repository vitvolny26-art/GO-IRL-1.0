import { describe, expect, it } from "vitest";
import { isMapLocationUrl, resolveMapyRuntimeUrl } from "./mapyRuntimeActions";

describe("Mapy.com runtime actions", () => {
  it("converts legacy OpenStreetMap marker URLs to exact Mapy.com points", () => {
    expect(resolveMapyRuntimeUrl("https://www.openstreetmap.org/?mlat=49.593800&mlon=17.250900#map=17/49.593800/17.250900"))
      .toBe("https://mapy.com/fnc/v1/showmap?mapset=basic&center=17.250900,49.593800&zoom=17&marker=true");
  });

  it("converts Google Maps searches to Mapy.com searches", () => {
    expect(resolveMapyRuntimeUrl("https://www.google.com/maps/search/?api=1&query=Smetanovy%20sady%2C%20Olomouc"))
      .toBe("https://mapy.com/zakladni?q=Smetanovy%20sady%2C%20Olomouc");
  });

  it("migrates mapy.cz links and preserves Mapy.com links", () => {
    expect(resolveMapyRuntimeUrl("https://mapy.cz/zakladni?q=Olomouc"))
      .toBe("https://mapy.com/zakladni?q=Olomouc");
    expect(resolveMapyRuntimeUrl("https://mapy.com/zakladni?q=Olomouc"))
      .toBe("https://mapy.com/zakladni?q=Olomouc");
  });

  it("does not rewrite unrelated links", () => {
    expect(isMapLocationUrl("https://example.com/place")).toBe(false);
    expect(resolveMapyRuntimeUrl("https://example.com/place")).toBe("https://example.com/place");
  });
});
