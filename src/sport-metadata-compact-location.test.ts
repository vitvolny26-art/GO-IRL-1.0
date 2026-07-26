import { describe, expect, it } from "vitest";

import {
  hasSingleCompactSportLevel,
  sportLocationPresentation,
  sportSheetHiddenDuplicates,
  sportSheetVisibleMetadata,
} from "./sportMetadataCompactPresentation.js";

describe("Sport metadata compact location presentation", () => {
  it("keeps one compact level and removes duplicate metadata", () => {
    expect(hasSingleCompactSportLevel()).toBe(true);
    expect(sportSheetVisibleMetadata).toEqual(["level", "location", "date", "price"]);
    expect(sportSheetHiddenDuplicates).toEqual(["eyebrow", "environment-chip", "format-row"]);
  });

  it("keeps the existing location action compact and discoverable", () => {
    expect(sportLocationPresentation).toEqual({
      visibleLabels: false,
      compact: true,
      underlinedAction: true,
      preservesProviderFlow: true,
    });
  });
});
