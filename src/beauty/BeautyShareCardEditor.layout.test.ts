import { describe, expect, it } from "vitest";
import source from "./BeautyShareCardEditor.tsx?raw";

describe("Beauty share card editor layout", () => {
  it("uses the same horizontal dimensions and renderer as Telegram", () => {
    expect(source).toContain("canvas.width = 1080");
    expect(source).toContain("canvas.height = 900");
    expect(source).toContain("buildBeautyShareCardPreviewSvg");
    expect(source).toContain("context.drawImage(overlay, 0, 0, canvas.width, canvas.height)");
    expect(source).not.toContain('fillText("GO IRL BEAUTY"');
    expect(source).not.toContain("LESS SCROLLING. MORE LIFE.");
    expect(source).not.toContain("formatBeautyShareCardPublicLink");
  });

  it("delegates card text and placeholder layout to the canonical SVG", () => {
    expect(source).not.toContain("drawPhotoPlaceholder(context)");
    expect(source).not.toContain("wrapText(context, description");
    expect(source).not.toContain("context.fillText(name");
    expect(source).toContain("roundedRect(context, 841, 71, 158, 158, 12)");
  });
});
