import { describe, expect, it } from "vitest";
import source from "./BeautyShareCardEditor.tsx?raw";
import styles from "./beauty-share-card-editor.css?raw";

describe("Beauty share card editor layout", () => {
  it("uses the same horizontal dimensions as Telegram and removes extra card labels", () => {
    expect(source).toContain("canvas.width = 1080");
    expect(source).toContain("canvas.height = 1020");
    expect(styles).toContain("aspect-ratio: 18 / 17");
    expect(source).not.toContain('fillText("GO IRL BEAUTY"');
    expect(source).not.toContain("LESS SCROLLING. MORE LIFE.");
    expect(source).not.toContain("formatBeautyShareCardPublicLink");
  });

  it("shows an image placeholder and limits the description to two lines", () => {
    expect(source).toContain("drawPhotoPlaceholder(context)");
    expect(source).toContain("wrapText(context, description, 770, 2)");
    expect(source).toContain("context.fillText(name, 232, 124)");
  });
});