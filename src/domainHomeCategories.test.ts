import { describe, expect, it } from "vitest";
import { categories } from "./data";
import { homeCategoriesForPath } from "./domainHomeCategories";

describe("homeCategoriesForPath", () => {
  it("keeps the activities category grid unchanged", () => {
    expect(homeCategoriesForPath("/activities", "ru")).toBe(categories);
  });

  it("shows only localized Beauty on the services route", () => {
    const serviceCategories = homeCategoriesForPath("/services", "ru");

    expect(serviceCategories).toHaveLength(1);
    expect(serviceCategories[0]?.id).toBe("creativity");
    expect(serviceCategories[0]?.name.ru).toBe("Красота");
  });
});

