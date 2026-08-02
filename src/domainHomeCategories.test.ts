import { describe, expect, it } from "vitest";
import { categories } from "./data";
import { clientNavigationLabels, domainActionLabels, homeCategoriesForPath } from "./domainHomeCategories";

describe("homeCategoriesForPath", () => {
  it("keeps the activities category grid unchanged", () => {
    expect(homeCategoriesForPath("/activities", "ru")).toBe(categories);
  });

  it("shows only localized Beauty on the services route", () => {
    const serviceCategories = homeCategoriesForPath("/services", "ru");

    expect(serviceCategories).toHaveLength(1);
    expect(serviceCategories[0]?.id).toBe("creativity");
    expect(serviceCategories[0]?.name.ru).toBe("Красота и здоровье");
  });

  it("defines the service-specific Russian navigation", () => {
    expect(clientNavigationLabels.ru).toEqual(["Главная", "Для вас", "Каталог", "Мои записи", "Профиль"]);
  });

  it("defines domain actions independently from elevated roles", () => {
    expect(domainActionLabels.ru).toEqual({ create: "Создать", professional: "Кабинет мастера" });
  });
});
