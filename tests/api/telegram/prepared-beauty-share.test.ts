import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../../../api/telegram/prepared-beauty-share.ts", import.meta.url),
  "utf8",
);

describe("prepared Beauty share route", () => {
  it("uses the saved card artwork version and public app profile URL", () => {
    expect(source).toContain("loadTrustedBeautyShareArtwork");
    expect(source).toContain("const artwork = await loadTrustedBeautyShareArtwork(card.eventId)");
    expect(source).toContain('image.searchParams.set("format", "image")');
    expect(source).not.toContain('image.searchParams.set("format", "download")');
    expect(source).toContain('image.searchParams.set("v", artwork?.version || "12")');
    expect(source).toContain("publicAppOrigin()");
    expect(source).toContain("https://go-irl.fun");
    expect(source).toContain("https://go-irl-1-1.vercel.app");
  });
});
