import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { activityOptions } from "../../src/data";
import { buildEventArtworkSvg, resolveEventArtworkCode } from "./event-artwork";
import { materialEventArtworkPaths } from "./material-event-artwork";

const knownOptions = Object.values(activityOptions).flat();
const brandedCodes = new Set(["VB", "RN", "WK", "CF", "BG", "LX", "BR"]);

describe("event artwork registry", () => {
  it("uses a Node ESM-compatible serverless import", () => {
    const source = readFileSync(new URL("./event-artwork.ts", import.meta.url), "utf8");
    expect(source).toContain('from "./material-event-artwork.js"');
    expect(source).not.toContain("app-event-emoji-sprite");
  });

  it("covers all 40 known options by emoji and ru/cs/en names", () => {
    expect(knownOptions).toHaveLength(40);
    expect(Object.keys(materialEventArtworkPaths)).toHaveLength(40);

    for (const option of knownOptions) {
      const expectedCode = resolveEventArtworkCode({ activity: option.name.en });
      expect(expectedCode, option.name.en).not.toBe("EV");
      for (const language of ["ru", "cs", "en"] as const) {
        expect(resolveEventArtworkCode({ activity: option.name[language] }), `${language}: ${option.name[language]}`)
          .toBe(expectedCode);
      }

      const svg = buildEventArtworkSvg({ icon: option.icon, activity: option.name.en });
      expect(svg).toContain(`data-event-artwork="${expectedCode}"`);
      if (brandedCodes.has(expectedCode)) {
        expect(svg).toContain('data-branded-artwork="true"');
        expect(svg).not.toContain('transform="translate(143 143) scale(4)"');
      } else {
        expect(svg).toContain(materialEventArtworkPaths[expectedCode]);
        expect(svg).toContain('transform="translate(143 143) scale(4)"');
      }
      expect(svg).not.toContain("<image");
      expect(svg).not.toContain("undefined");
      expect(svg).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  it("uses only the neutral calendar fallback for an unknown custom event", () => {
    expect(resolveEventArtworkCode({ activity: "Мой уникальный вечер" })).toBe("EV");
    const svg = buildEventArtworkSvg({ activity: "My unique custom event" });
    expect(svg).toContain('data-event-artwork="EV"');
    expect(svg).toContain('stroke="#aeb3bd"');
    expect(svg).not.toContain("<image");
    expect(svg).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
