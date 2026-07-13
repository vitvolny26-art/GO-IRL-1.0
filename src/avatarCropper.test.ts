import { describe, expect, it } from "vitest";
import { calculateAvatarCrop } from "./avatarCropper";

describe("calculateAvatarCrop", () => {
  it("centers a landscape image in a square crop", () => {
    expect(calculateAvatarCrop(1000, 500, 500, { zoom: 1, x: 0.5, y: 0.5 })).toEqual({
      drawWidth: 1000,
      drawHeight: 500,
      offsetX: -250,
      offsetY: -0,
    });
  });

  it("moves a portrait image vertically to select a face", () => {
    expect(calculateAvatarCrop(500, 1000, 500, { zoom: 1, x: 0.5, y: 0.25 })).toEqual({
      drawWidth: 500,
      drawHeight: 1000,
      offsetX: -0,
      offsetY: -125,
    });
  });

  it("supports zoom and focal positioning", () => {
    expect(calculateAvatarCrop(500, 500, 500, { zoom: 2, x: 1, y: 0 })).toEqual({
      drawWidth: 1000,
      drawHeight: 1000,
      offsetX: -500,
      offsetY: -0,
    });
  });
});
