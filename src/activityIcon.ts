import { stripLeadingEmoji } from "./cardText";
import { activityOptions } from "./data";
import type { Activity, Language } from "./types";

export const activityIconFromText = (value: string, fallback = "✨") => {
  const text = value.toLocaleLowerCase();
  if (/inline|ролик|brusl/.test(text)) return "🛼";
  if (/volley|волей|volej/.test(text)) return "🏐";
  if (/football|футбол|fotbal/.test(text)) return "⚽";
  if (/basket|баскет/.test(text)) return "🏀";
  if (/table tennis|настольн.*теннис|stolní tenis/.test(text)) return "🏓";
  if (/tennis|теннис|tenis/.test(text)) return "🎾";
  if (/running|run|бег|běh/.test(text)) return "🏃";
  if (/bike|cycle|cycling|velo|велосипед|kolo/.test(text)) return "🚴";
  if (/swim|плав|plav/.test(text)) return "🏊";
  if (/badminton|бадминтон/.test(text)) return "🏸";
  if (/gym|fitness|зал|фитнес|posil/.test(text)) return "🏋️";
  if (/yoga|йога|jóga/.test(text)) return "🧘";
  if (/walk|walking|прогул|ходь|proch/.test(text)) return "🚶";
  if (/board|game|игр|hra/.test(text)) return "🎲";
  if (/coffee|кафе|кофе|káva/.test(text)) return "☕";
  if (/language|язык|jazyk/.test(text)) return "💬";
  if (/party|вечерин|párty/.test(text)) return "🎉";
  return fallback;
};

export const activityIconFor = (activity: Activity, language: Language, fallback: string) => {
  const exactActivity = stripLeadingEmoji(activity.activity[language]).toLocaleLowerCase();
  const matchingOption = Object.values(activityOptions).flat().find((option) =>
    Object.values(option.name).some((name) => name.toLocaleLowerCase() === exactActivity),
  );
  return matchingOption?.icon
    || activityIconFromText(`${activity.activity[language]} ${activity.title[language]}`, fallback);
};
