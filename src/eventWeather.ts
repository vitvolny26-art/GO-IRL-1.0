import type { Activity } from "./types";

const normalizedActivityText = (activity: Activity) =>
  [
    activity.categoryId,
    activity.type,
    activity.activity.ru,
    activity.activity.uk,
    activity.activity.cs,
    activity.activity.en,
    activity.title.ru,
    activity.title.uk,
    activity.title.cs,
    activity.title.en,
  ].join(" ").toLocaleLowerCase();

export const isOutdoorGenericActivity = (activity: Activity) => {
  if (activity.type === "sport" || activity.categoryId === "sport") return false;
  if (activity.categoryId === "nature") return true;

  const text = normalizedActivityText(activity);
  return ["прогул", "proch", "walk", "walking", "похід", "поход", "hike", "park"]
    .some((term) => text.includes(term));
};
