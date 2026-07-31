import { describe, expect, it } from "vitest";
import type { BeautyPublicProfile } from "../beauty/beautySetupModel";
import {
  mergeProfessionalDirectory,
  professionalCountLabel,
  professionalsForCity,
  sharedMockProfessionals,
} from "./servicesProfessionalDirectory";

describe("services professional directory", () => {
  it("exposes Studio Vita to every Olomouc client", () => {
    expect(professionalsForCity("olomouc")).toEqual(sharedMockProfessionals);
    expect(professionalsForCity("praha")).toEqual([]);
  });

  it("uses a master label instead of an event label", () => {
    expect(professionalCountLabel("ru", 1)).toBe("мастер");
    expect(professionalCountLabel("ru", 5)).toBe("мастеров");
  });

  it("replaces the shared mock with a same-device published profile without duplication", () => {
    const local: BeautyPublicProfile = { ...sharedMockProfessionals[0]!, priceCzk: 950 };
    expect(mergeProfessionalDirectory(sharedMockProfessionals, local)).toEqual([local]);
  });
});
