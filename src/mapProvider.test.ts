import { describe, expect, it } from "vitest";
import {
  buildMapProviderUrl,
  isMapUrl,
  isResolvedMapProviderUrl,
} from "./mapProvider";

const sourceUrl = "https://www.google.com/maps/search/?api=1&query=Prague%20Castle";

describe("buildMapProviderUrl", () => {
  it("builds a Mapy.com URL and marks it as resolved", () => {
    const result = buildMapProviderUrl(sourceUrl, "mapy");
    const url = new URL(result);

    expect(url.hostname).toBe("mapy.com");
    expect(url.searchParams.get("q")).toBe("Prague Castle");
    expect(url.searchParams.get("go_irl_provider")).toBe("mapy");
  });

  it("builds a Google Maps URL and marks it as resolved", () => {
    const result = buildMapProviderUrl(sourceUrl, "google");
    const url = new URL(result);

    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("query")).toBe("Prague Castle");
    expect(url.searchParams.get("go_irl_provider")).toBe("google");
  });

  it("builds an Apple Maps URL and marks it as resolved", () => {
    const result = buildMapProviderUrl(sourceUrl, "apple");
    const url = new URL(result);

    expect(url.hostname).toBe("maps.apple.com");
    expect(url.searchParams.get("q")).toBe("Prague Castle");
    expect(url.searchParams.get("go_irl_provider")).toBe("apple");
  });
});

describe("map URL detection", () => {
  it("recognizes supported map hosts", () => {
    expect(isMapUrl("https://mapy.com/zakladni?q=Prague")).toBe(true);
    expect(isMapUrl("https://maps.apple.com/?q=Prague")).toBe(true);
    expect(isMapUrl("https://example.com/maps?q=Prague")).toBe(false);
  });

  it("distinguishes unresolved and resolved provider URLs", () => {
    expect(isResolvedMapProviderUrl(sourceUrl)).toBe(false);
    expect(isResolvedMapProviderUrl(buildMapProviderUrl(sourceUrl, "mapy"))).toBe(true);
  });
});
