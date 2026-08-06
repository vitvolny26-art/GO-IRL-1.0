import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildBeautyFileShareBridgeTarget,
} from "./telegramBeautyFileShareBridge";

const bridgeHtml = readFileSync(new URL("../public/beauty-share-bridge.html", import.meta.url), "utf8");

describe("Telegram Beauty file share bridge", () => {
  it("builds a cache-busted image bridge for a Beauty landing URL", () => {
    const target = new URL(buildBeautyFileShareBridgeTarget(
      "GO IRL: Studio Vita\n\nhttps://goirl.realitka.pp.ua/s/beauty-test?language=cs&date=2026-08-07",
      "Studio Vita",
      "fixed",
    ));
    const image = new URL(target.searchParams.get("image") || "");

    expect(target.origin).toBe("https://goirl.realitka.pp.ua");
    expect(target.pathname).toBe("/beauty-share-bridge.html");
    expect(target.searchParams.get("language")).toBe("cs");
    expect(image.origin).toBe("https://go-irl-1-1.vercel.app");
    expect(image.searchParams.get("slug")).toBe("beauty-test");
    expect(image.searchParams.get("format")).toBe("image");
    expect(image.searchParams.get("share")).toBe("fixed");
  });

  it("rejects non-Beauty share text", () => {
    expect(buildBeautyFileShareBridgeTarget("GO IRL: Running", "Running", "fixed")).toBe("");
  });

  it("loads the JPEG and calls navigator.share with a File after a user click", () => {
    expect(bridgeHtml).toContain('document.querySelector("#share").addEventListener("click"');
    expect(bridgeHtml).toContain("const file = new File([blob]");
    expect(bridgeHtml).toContain("navigator.canShare(data)");
    expect(bridgeHtml).toContain("await navigator.share(data)");
    expect(bridgeHtml).toContain('candidate.searchParams.get("format") === "image"');
  });
});
