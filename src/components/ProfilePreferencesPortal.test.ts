import { describe, expect, it } from "vitest";
import { visiblePreferenceOptions } from "../profilePreferenceOptions";

describe("profile preference options", () => {
  it("hides providers that are not supported", () => {
    expect(visiblePreferenceOptions([
      { value: "telegram", label: "Telegram" },
      { value: "instagram", label: "Instagram", disabled: true },
    ])).toEqual([{ value: "telegram", label: "Telegram" }]);
  });
});
