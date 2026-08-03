import { describe, expect, it } from "vitest";
import {
  beautySlugFromPublicLink,
  buildBeautyPublicLink,
  buildTelegramBeautyInviteUrl,
  isValidBeautyPublicSlug,
  normalizeBeautyPublicSlug,
  parseBeautyStartParam,
} from "./beautyPublicSlug";

describe("Beauty public slug", () => {
  it("normalizes an English public name into a URL slug", () => {
    expect(normalizeBeautyPublicSlug("  Test Studio  ")).toBe("test-studio");
    expect(isValidBeautyPublicSlug("test-studio")).toBe(true);
    expect(buildBeautyPublicLink("test-studio")).toBe("/beauty/test-studio");
  });

  it("rejects Cyrillic and malformed values", () => {
    expect(isValidBeautyPublicSlug("тест-студия")).toBe(false);
    expect(parseBeautyStartParam("ab")).toBe("");
    expect(parseBeautyStartParam("test--studio")).toBe("test-studio");
  });

  it("extracts existing legacy and custom slugs", () => {
    expect(beautySlugFromPublicLink("/beauty/beauty-06b9689e8b1ee69a")).toBe("beauty-06b9689e8b1ee69a");
    expect(beautySlugFromPublicLink("https://goirl.example/beauty/test-studio")).toBe("test-studio");
  });

  it("builds the same Telegram Mini App shape as Sport", () => {
    expect(buildTelegramBeautyInviteUrl("test-studio", "@GOirl_bot"))
      .toBe("https://t.me/GOirl_bot?startapp=test-studio");
  });
});
