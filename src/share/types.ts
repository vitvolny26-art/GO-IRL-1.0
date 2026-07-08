import type { Language } from "../types";

export type ActivityShareKind =
  | "volleyball"
  | "inline-skating"
  | "coffee"
  | "hiking"
  | "cycling"
  | "board-games"
  | "tennis"
  | "running"
  | "generic";

export type ShareModel = {
  kind: ActivityShareKind;
  activity: string;
  weekday: string;
  location: string;
  timeRange: string;
  priceLine: string;
  lowSpotsLine: string;
  joinText: string;
  url?: string;
  includeUrl?: boolean;
};

export type ShareBuildOptions = {
  templateIndex?: number;
  url?: string;
  includePlainTextUrl?: boolean;
};

export type ShareLanguageMap<T> = Record<Language, T>;

