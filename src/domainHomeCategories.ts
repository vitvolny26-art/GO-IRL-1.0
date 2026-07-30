import { categories } from "./data";
import type { Language } from "./types";

const beautyName: Record<Language, string> = {
  ru: "Красота и здоровье",
  uk: "Краса та здоров’я",
  cs: "Krása a zdraví",
  en: "Beauty & health",
};

export const serviceNavigationLabels: Record<Language, [string, string, string, string, string]> = {
  ru: ["Главная", "Для вас", "Каталог", "Записаться", "Профиль"],
  uk: ["Головна", "Для вас", "Каталог", "Записатися", "Профіль"],
  cs: ["Domů", "Pro vás", "Katalog", "Objednat se", "Profil"],
  en: ["Home", "For you", "Catalog", "Book", "Profile"],
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
