import { describe, expect, it } from "vitest";
import {
  buildOpenStreetMapLocationUrl,
  mapPointToWorld,
  parseMapPointFromUrl,
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

  it("builds and parses an OpenStreetMap marker URL", () => {
    const point = { latitude: 50.0755, longitude: 14.4378 };
    const url = buildOpenStreetMapLocationUrl(point, 17);
    const restored = parseMapPointFromUrl(url);
    expect(url).toContain("openstreetmap.org");
    expect(restored).not.toBeNull();
    expect(restored?.latitude).toBeCloseTo(point.latitude, 6);
    expect(restored?.longitude).toBeCloseTo(point.longitude, 6);
  });

  it("rejects unrelated invalid URLs", () => {
    expect(parseMapPointFromUrl("not-a-url")).toBeNull();
    expect(parseMapPointFromUrl("https://example.com/map")).toBeNull();
  });
});
