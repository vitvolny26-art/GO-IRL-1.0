import { describe, expect, it } from "vitest";
import { normalizeMapUrl } from "./mapyRuntimeActions";

describe("Mapy.com runtime actions", () => {
  it("converts a legacy OpenStreetMap marker into an exact Mapy.com point", () => {
    expect(normalizeMapUrl("https://www.openstreetmap.org/?mlat=49.593800&mlon=17.250900#map=17/49.593800/17.250900"))
      .toBe("https://mapy.com/fnc/v1/showmap?mapset=basic&center=17.250900,49.593800&zoom=17&marker=true");
  });

  it("converts Google Maps searches into Mapy.com searches", () => {
    expect(normalizeMapUrl("https://www.google.com/maps/search/?api=1&query=Smetanovy%20sady%2C%20Olomouc"))
      .toBe("https://mapy.com/zakladni?q=Smetanovy%20sady%2C%20Olomouc");
  });

  it("upgrades legacy mapy.cz links to mapy.com", () => {
    expect(normalizeMapUrl("https://mapy.cz/zakladni?q=Olomouc"))
      .toBe("https://mapy.com/zakladni?q=Olomouc");
  });
});
