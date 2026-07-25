import { describe, expect, it } from "vitest";
import { detectEventLocationProvider, resolveEventLocationProviderUrl } from "./eventLocationProvider";

const pointUrl = "https://mapy.com/fnc/v1/showmap?mapset=basic&center=17.250900,49.593800&zoom=17&marker=true";

describe("event location provider routing", () => {
  it("routes a selected point to Google Maps", () => {
    const url = new URL(resolveEventLocationProviderUrl(pointUrl, "google"));
    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("query")).toBe("49.5938,17.2509");
    expect(url.searchParams.get("go_irl_provider")).toBe("google");
  });

  it("routes a selected point to Apple Maps", () => {
    const url = new URL(resolveEventLocationProviderUrl(pointUrl, "apple"));
    expect(url.hostname).toBe("maps.apple.com");
    expect(url.searchParams.get("ll")).toBe("49.5938,17.2509");
    expect(url.searchParams.get("go_irl_provider")).toBe("apple");
  });

  it("keeps Mapy coordinates and marks the provider", () => {
    const url = new URL(resolveEventLocationProviderUrl(pointUrl, "mapy"));
    expect(url.hostname).toBe("mapy.com");
    expect(url.searchParams.get("center")).toBe("17.250900,49.593800");
    expect(url.searchParams.get("go_irl_provider")).toBe("mapy");
  });

  it("detects supported providers", () => {
    expect(detectEventLocationProvider("https://maps.apple.com/?q=test")).toBe("apple");
    expect(detectEventLocationProvider("https://www.google.com/maps/search/?api=1&query=test")).toBe("google");
    expect(detectEventLocationProvider(pointUrl)).toBe("mapy");
  });
});
