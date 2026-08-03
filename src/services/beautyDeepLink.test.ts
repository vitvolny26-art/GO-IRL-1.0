import { describe, expect, it } from "vitest";
import { beautyDeepLinkSelector, beautyDeepLinkSlug, clearBeautyDeepLink } from "./beautyDeepLink";

describe("Beauty service deep links", () => {
  it("resolves a valid Beauty slug only on the Services route", () => {
    expect(beautyDeepLinkSlug("/services", "?beauty=beauty-test")).toBe("beauty-test");
    expect(beautyDeepLinkSlug("/services/", "?beauty=beauty-test")).toBe("beauty-test");
    expect(beautyDeepLinkSlug("/", "?beauty=beauty-test")).toBe("");
    expect(beautyDeepLinkSlug("/services", "?beauty=test")).toBe("");
  });

  it("targets the professional card opener by exact slug", () => {
    expect(beautyDeepLinkSelector("beauty-test")).toBe(
      '[data-beauty-slug="beauty-test"] .services-professional-main',
    );
  });

  it("removes only the consumed Beauty parameter", () => {
    expect(clearBeautyDeepLink("/services", "?beauty=beauty-test&source=telegram", "#details"))
      .toBe("/services?source=telegram#details");
  });
});
