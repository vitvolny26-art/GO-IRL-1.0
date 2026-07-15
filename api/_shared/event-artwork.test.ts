import { describe, expect, it } from "vitest";
import { activityOptions } from "../../src/data";
import { buildEventArtworkSvg, resolveEventArtworkCode } from "./event-artwork";
import { materialEventArtworkPaths } from "./material-event-artwork";

const knownOptions = Object.values(activityOptions).flat();

describe("event artwork registry", () => {
  it("covers all 40 known options by emoji and ru/cs/en names", () => {
    expect(knownOptions).toHaveLength(40);
    expect(Object.keys(materialEventArtworkPaths)).toHaveLength(39);

    for (const option of knownOptions) {
      const expectedCode = resolveEventArtworkCode({ icon: option.icon });
      expect(expectedCode, option.name.en).not.toBe("EV");
      for (const language of ["ru", "cs", "en"] as const) {
        expect(resolveEventArtworkCode({ activity: option.name[language] }), `${language}: ${option.name[language]}`)
          .toBe(expectedCode);
      }

      const svg = buildEventArtworkSvg({ icon: option.icon, activity: option.name.en });
      expect(svg).toContain(`data-event-artwork="${expectedCode}"`);
      expect(svg).toContain(materialEventArtworkPaths[expectedCode]);
      expect(svg).toContain('transform="translate(143 143) scale(4)"');
      expect(svg).not.toContain("<text");
      expect(svg).not.toContain("undefined");
      expect(svg).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  it("uses only the neutral calendar fallback for an unknown custom event", () => {
    expect(resolveEventArtworkCode({ activity: "Мой уникальный вечер" })).toBe("EV");
    const svg = buildEventArtworkSvg({ activity: "My unique custom event" });
    expect(svg).toContain('data-event-artwork="EV"');
    expect(svg).toContain('stroke="#aeb3bd"');
    expect(svg).not.toContain("M191 151v80M151 191h80");
    expect(svg).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
