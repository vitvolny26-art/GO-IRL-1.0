import { afterEach, describe, expect, it } from "vitest";
import {
  activityOptions,
  categories,
  closedBetaActivityOptions,
  closedBetaCategories,
} from "./data";
import { enableFullCreateTaxonomy } from "./fullCreateTaxonomy";

const initialCategories = [...closedBetaCategories];
const initialOptions = { ...closedBetaActivityOptions } as Record<string, (typeof activityOptions)[string]>;

const restoreTaxonomy = () => {
  closedBetaCategories.splice(0, closedBetaCategories.length, ...initialCategories);
  const createOptions = closedBetaActivityOptions as Record<string, (typeof activityOptions)[string]>;
  for (const key of Object.keys(createOptions)) delete createOptions[key];
  Object.assign(createOptions, initialOptions);
};

afterEach(restoreTaxonomy);

describe("enableFullCreateTaxonomy", () => {
  it("exposes every category and all of its activity options", () => {
    enableFullCreateTaxonomy();

    expect(closedBetaCategories.map((category) => category.id)).toEqual(
      categories.map((category) => category.id),
    );

    const createOptions = closedBetaActivityOptions as Record<string, (typeof activityOptions)[string]>;
    for (const category of categories) {
      expect(createOptions[category.id]).toEqual(activityOptions[category.id]);
    }
  });
});
