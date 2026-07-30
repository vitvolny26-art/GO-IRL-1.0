import { describe, expect, it } from "vitest";
import { categories } from "./data";
import { clientNavigationLabels, domainCabinetForPath, homeCategoriesForPath } from "./domainHomeCategories";

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

  it("keeps role cabinets inside their respective root domains", () => {
    expect(domainCabinetForPath("/activities", "organizer")?.kind).toBe("organizer");
    expect(domainCabinetForPath("/services", "professional")?.kind).toBe("professional");
    expect(domainCabinetForPath("/activities", "admin")?.kind).toBe("organizer");
    expect(domainCabinetForPath("/services", "admin")?.kind).toBe("professional");
    expect(domainCabinetForPath("/services", "organizer")).toBeNull();
    expect(domainCabinetForPath("/activities", "professional")).toBeNull();
    expect(domainCabinetForPath("/activities", "user")).toBeNull();
    expect(domainCabinetForPath("/services", "user")).toBeNull();
  });
});
