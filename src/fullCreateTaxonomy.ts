import {
  activityOptions,
  categories,
  closedBetaActivityOptions,
  closedBetaCategories,
} from "./data";

type ActivityOption = (typeof activityOptions)[string][number];

export const enableFullCreateTaxonomy = () => {
  closedBetaCategories.splice(0, closedBetaCategories.length, ...categories);

  const createOptions = closedBetaActivityOptions as Record<string, ActivityOption[]>;
  for (const [categoryId, options] of Object.entries(activityOptions)) {
    createOptions[categoryId] = options;
  }
};
