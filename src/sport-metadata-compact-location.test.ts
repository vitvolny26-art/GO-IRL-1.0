import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./sport-metadata-compact-location.css", import.meta.url), "utf8");

describe("Sport metadata compact location presentation", () => {
  it("removes duplicated eyebrow, environment chips, and format row", () => {
    expect(css).toContain(".sport-sheet .sport-eyebrow");
    expect(css).toContain("display: none");
    expect(css).toContain(".sport-sheet .sport-sheet-chips > span:nth-child(2)");
    expect(css).toContain(".sport-sheet .sport-detail-list > div:first-child");
  });

  it("keeps the location action visually compact and discoverable", () => {
    expect(css).toContain("grid-template-areas");
    expect(css).toContain("\"icon city\"");
    expect(css).toContain("\"icon address\"");
    expect(css).toContain("color: #dcff78");
    expect(css).toContain("text-decoration: underline");
  });
});
