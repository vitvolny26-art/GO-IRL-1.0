import type { Language, SportFormat, SportLevel } from "./types";
import { sportFormatLabel, sportLevelLabel } from "./verticals/sport";

export const sportLevelFormatLabel = (level: SportLevel | undefined, format: SportFormat | undefined, language: Language) => {
  const levelLabel = sportLevelLabel(level, language);
  const formatLabel = sportFormatLabel(format, language);
  const sameCasualMeaning = (level || "intermediate") === "intermediate" && (format || "casual") === "casual";
  return sameCasualMeaning || levelLabel === formatLabel ? levelLabel : `${levelLabel} · ${formatLabel}`;
};

export const eventDurationLabel = (durationMinutes: number | undefined, minutesShort: string) =>
  typeof durationMinutes === "number" && durationMinutes > 0 ? `${durationMinutes} ${minutesShort}` : null;
