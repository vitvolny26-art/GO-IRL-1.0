import { categories } from "./data";
import type { Language } from "./types";

const beautyName: Record<Language, string> = {
  ru: "Красота",
  uk: "Краса",
  cs: "Krása",
  en: "Beauty",
};

export const homeCategoriesForPath = (pathname: string, language: Language) => {
  if (pathname.replace(/\/+$/, "") !== "/services") return categories;

  return categories
    .filter((category) => category.id === "creativity")
    .map((category) => ({
      ...category,
      name: {
        ...category.name,
        [language]: beautyName[language],
      },
    }));
};

