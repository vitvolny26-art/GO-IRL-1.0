import { describe, expect, it } from "vitest";
import { isTemplateCarouselDrag } from "./templateCarousel";

describe("isTemplateCarouselDrag", () => {
  it("recognizes an intentional horizontal drag", () => {
    expect(isTemplateCarouselDrag({ x: 100, y: 40 }, { x: 70, y: 44 })).toBe(true);
  });

  it("keeps taps, small movement, and vertical scrolling selectable", () => {
    expect(isTemplateCarouselDrag({ x: 100, y: 40 }, { x: 96, y: 43 })).toBe(false);
    expect(isTemplateCarouselDrag({ x: 100, y: 40 }, { x: 94, y: 70 })).toBe(false);
  });
});
