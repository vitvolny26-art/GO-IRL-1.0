import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const bridgeHtml = readFileSync(
  new URL("../../public/beauty-share-bridge.html", import.meta.url),
  "utf8",
);

describe("external Beauty JPEG share page", () => {
  it("loads the JPEG and calls navigator.share with a File after a user click", () => {
    expect(bridgeHtml).toContain('document.querySelector("#share").addEventListener("click"');
    expect(bridgeHtml).toContain("const file = new File([blob]");
    expect(bridgeHtml).toContain("navigator.canShare(data)");
    expect(bridgeHtml).toContain("await navigator.share(data)");
    expect(bridgeHtml).toContain('candidate.searchParams.get("format") === "image"');
  });
});
