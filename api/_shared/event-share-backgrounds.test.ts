import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { eventShareBackgroundUrls, resolveEventShareBackgroundUrl } from "./event-share-backgrounds";

describe("event share backgrounds", () => {
  it("maps all 40 category artwork codes to repository WebP assets", () => {
    const entries = Object.entries(eventShareBackgroundUrls);
    expect(entries).toHaveLength(40);

    for (const [code, url] of entries) {
      expect(code).toMatch(/^[A-Z]{2}$/);
      expect(url.pathname).toMatch(/\/assets\/share-backgrounds\/webp\/\d{2}-[a-z0-9-]+\.webp$/);
      expect(existsSync(url), url.pathname).toBe(true);
    }
  });

  it("resolves localized activities and keeps unknown custom events on fallback", () => {
    expect(resolveEventShareBackgroundUrl({ activity: "Волейбол" })?.pathname).toContain("01-volleyball.webp");
    expect(resolveEventShareBackgroundUrl({ activity: "Městská procházka" })?.pathname).toContain("31-city-walk.webp");
    expect(resolveEventShareBackgroundUrl({ activity: "Мой уникальный вечер" })).toBeNull();
  });
});
