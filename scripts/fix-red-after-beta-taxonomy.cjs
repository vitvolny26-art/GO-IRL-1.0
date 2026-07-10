const fs = require("fs");

fs.writeFileSync("src/data.test.ts", `import { describe, expect, it } from "vitest";
import { activityOptions, categories, closedBetaActivityOptions, closedBetaCategories } from "./data";
import { languageOptions } from "./i18n";

describe("activity taxonomy", () => {
  it("has unique category ids", () => {
    const ids = categories.map((category) => category.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has localized labels and activity options for every category", () => {
    for (const category of categories) {
      expect(category.icon).toBeTruthy();
      for (const language of languageOptions) expect(category.name[language.id]).toBeTruthy();
      expect(activityOptions[category.id]?.length).toBeGreaterThan(0);
      for (const option of activityOptions[category.id]) {
        for (const language of languageOptions) expect(option.name[language.id]).toBeTruthy();
      }
    }
  });

  it("keeps inline skating inside the Activities category", () => {
    expect(categories.some((category) => category.id === "inline-skating")).toBe(false);
    expect(activityOptions.activities).toEqual(expect.arrayContaining([
      expect.objectContaining({ icon: "🛼" }),
    ]));
  });

  it("limits closed beta create taxonomy to canonical beta options", () => {
    expect(closedBetaCategories.map((category) => category.id)).toEqual(["sport", "activities", "social"]);
    expect(closedBetaActivityOptions.sport.map((option) => option.name.en)).toEqual(["Volleyball", "Running"]);
    expect(closedBetaActivityOptions.activities.map((option) => option.name.en)).toEqual(["Coffee", "Board games"]);
    expect(closedBetaActivityOptions.social.map((option) => option.name.en)).toEqual(["Walk", "Language exchange"]);
  });
});
`);

for (const file of ["src/card-actions-enhancer.ts", "src/verticals/SportVertical.tsx"]) {
  let s = fs.readFileSync(file, "utf8");
  s = s.replace(/^const isEmojiLike.*\n/m, "");
  s = s.replace(/,\s*Dumbbell/g, "");
  s = s.replace(/Dumbbell,\s*/g, "");
  fs.writeFileSync(file, s);
}

let weather = fs.readFileSync("src/services/weather.ts", "utf8");
weather = weather.replace(/:\s*any\b/g, ": unknown");
fs.writeFileSync("src/services/weather.ts", weather);
