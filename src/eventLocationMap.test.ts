import { describe, expect, it } from "vitest";
import {
  buildMapyLocationUrl,
  buildOpenStreetMapLocationUrl,
  mapPointToWorld,
  parseMapPointFromUrl,
  resolvePinchZoom,
  worldToMapPoint,
} from "./eventLocationMap";

describe("event location map", () => {
  it("round-trips coordinates through Web Mercator", () => {
    const point = { latitude: 49.5938, longitude: 17.2509 };
    const world = mapPointToWorld(point, 16);
    const restored = worldToMapPoint(world.x, world.y, 16);
    expect(restored.latitude).toBeCloseTo(point.latitude, 5);
    expect(restored.longitude).toBeCloseTo(point.longitude, 5);
  });

  it("builds and parses a Mapy.com marker URL", () => {
    const point = { latitude: 50.0755, longitude: 14.4378 };
    const url = buildMapyLocationUrl(point, 17);
    const restored = parseMapPointFromUrl(url);
    expect(url).toBe("https://mapy.com/fnc/v1/showmap?mapset=basic&center=14.437800,50.075500&zoom=17&marker=true");
    expect(buildOpenStreetMapLocationUrl(point, 17)).toBe(url);
    expect(restored).not.toBeNull();
    expect(restored?.latitude).toBeCloseTo(point.latitude, 6);
    expect(restored?.longitude).toBeCloseTo(point.longitude, 6);
  });

  it("keeps old OpenStreetMap coordinate links editable", () => {
    const restored = parseMapPointFromUrl(
      "https://www.openstreetmap.org/?mlat=49.593800&mlon=17.250900#map=17/49.593800/17.250900",
    );
    expect(restored?.latitude).toBeCloseTo(49.5938, 6);
    expect(restored?.longitude).toBeCloseTo(17.2509, 6);
  });

  it("resolves pinch zoom and clamps it to supported bounds", () => {
    expect(resolvePinchZoom(15, 100, 200, 12, 19)).toBe(16);
    expect(resolvePinchZoom(15, 100, 50, 12, 19)).toBe(14);
    expect(resolvePinchZoom(19, 100, 400, 12, 19)).toBe(19);
    expect(resolvePinchZoom(12, 100, 10, 12, 19)).toBe(12);
  });

  it("rejects unrelated invalid URLs", () => {
    expect(parseMapPointFromUrl("not-a-url")).toBeNull();
    expect(parseMapPointFromUrl("https://example.com/map")).toBeNull();
  });
});
