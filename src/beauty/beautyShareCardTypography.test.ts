import { describe, expect, it } from "vitest";
import {
  beautyShareCardTitleFontOptions,
  defaultBeautyShareCardTitleFont,
  normalizeBeautyShareCardTitleFont,
  resolveBeautyShareCardTitleCssFontFamily,
  resolveBeautyShareCardTitleSvgFontFamily,
} from "./beautyShareCardTypography";

describe("Beauty share-card title typography", () => {
  it("keeps a small curated font set with unique identifiers", () => {
    const ids = beautyShareCardTitleFontOptions.map((option) => option.id);

    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("normalizes missing and legacy values to the deterministic default", () => {
    expect(normalizeBeautyShareCardTitleFont(undefined)).toBe(defaultBeautyShareCardTitleFont);
    expect(normalizeBeautyShareCardTitleFont("unsupported-font")).toBe(defaultBeautyShareCardTitleFont);
    expect(normalizeBeautyShareCardTitleFont("modern-sans")).toBe("modern-sans");
  });

  it("provides browser and SVG renderer stacks for every supported option", () => {
    for (const option of beautyShareCardTitleFontOptions) {
      expect(resolveBeautyShareCardTitleCssFontFamily(option.id)).toBe(option.cssFontFamily);
      expect(resolveBeautyShareCardTitleSvgFontFamily(option.id)).toBe(option.svgFontFamily);
      expect(option.cssFontFamily.length).toBeGreaterThan(0);
      expect(option.svgFontFamily.length).toBeGreaterThan(0);
    }
  });
});
