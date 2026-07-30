import { categories } from "./data";
import type { Language } from "./types";

const beautyName: Record<Language, string> = {
  ru: "Красота и здоровье",
  uk: "Краса та здоров’я",
  cs: "Krása a zdraví",
  en: "Beauty & health",
};

export const clientNavigationLabels: Record<Language, [string, string, string, string, string]> = {
  ru: ["Главная", "Для вас", "Каталог", "Мои записи", "Профиль"],
  uk: ["Головна", "Для вас", "Каталог", "Мої записи", "Профіль"],
  cs: ["Domů", "Pro vás", "Katalog", "Moje rezervace", "Profil"],
  en: ["Home", "For you", "Catalog", "My bookings", "Profile"],
};

const cabinetLabels: Record<Language, { organizer: string; professional: string }> = {
  ru: { organizer: "Кабинет организатора", professional: "Кабинет мастера" },
  uk: { organizer: "Кабінет організатора", professional: "Кабінет майстра" },
  cs: { organizer: "Kabinet organizátora", professional: "Kabinet profesionála" },
  en: { organizer: "Organizer workspace", professional: "Professional workspace" },
};

export const domainCabinetForPath = (pathname: string, role: import("./types").UserRole, language: Language = "ru") => {
  const domain = pathname.replace(/\/+$/, "");
  if (domain === "/activities" && role === "organizer") {
    return { label: cabinetLabels[language].organizer, kind: "organizer" as const };
  }
  if (domain === "/services" && role === "professional") {
    return { label: cabinetLabels[language].professional, kind: "professional" as const };
  }
  return null;
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
