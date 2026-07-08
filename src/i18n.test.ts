import { describe, expect, it } from "vitest";
import { getTranslation, languageOptions, localeByLanguage } from "./i18n";

describe("i18n", () => {
  it("defines Russian, Ukrainian, Czech and English language options", () => {
    expect(languageOptions.map((option) => option.id)).toEqual(["ru", "uk", "cs", "en"]);
  });

  it("returns localized copy for every supported language", () => {
    for (const option of languageOptions) {
      const translation = getTranslation(option.id);
      expect(translation.create).toBeTruthy();
      expect(translation.join).toBeTruthy();
      expect(localeByLanguage[option.id]).toBeTruthy();
    }
  });

  it("keeps header labels localized", () => {
    expect(getTranslation("ru").selectCity).toContain("город");
    expect(getTranslation("uk").selectLanguage).toContain("мову");
    expect(getTranslation("cs").selectLanguage).toContain("jazyk");
    expect(getTranslation("en").selectCity).toContain("city");
  });

  it("localizes destructive event actions", () => {
    expect(getTranslation("ru").deleteEventTitle).toBe("Удалить событие?");
    expect(getTranslation("uk").deleteEventWarning).toBe("Цю дію не можна скасувати");
    expect(getTranslation("cs").eventDeleted).toBe("Událost byla smazána");
    expect(getTranslation("en").delete).toBe("Delete");
  });
});
