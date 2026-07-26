import type { Language } from "./types";

export type MapProvider = "google" | "apple" | "mapy";
export type CalendarProvider = "google" | "apple" | "outlook";
export type ShareProvider = "telegram" | "messenger" | "whatsapp" | "instagram";
export type ReminderProvider = ShareProvider;

export type UserPreferences = {
  language?: Language;
  cityId?: string;
  mapProvider?: MapProvider | null;
  calendarProvider?: CalendarProvider | null;
  shareProvider?: ShareProvider | null;
  reminderProvider?: ReminderProvider | null;
};

export const userPreferencesStorageKey = "go-irl-user-preferences";
export const legacyLanguageStorageKey = "go-irl-language";
export const userPreferencesChangedEvent = "go-irl-user-preferences-changed";

const mapProviders = new Set<MapProvider>(["google", "apple", "mapy"]);
const calendarProviders = new Set<CalendarProvider>(["google", "apple", "outlook"]);
const shareProviders = new Set<ShareProvider>(["telegram", "messenger", "whatsapp", "instagram"]);
const reminderProviders = new Set<ReminderProvider>(shareProviders);
const languages = new Set<Language>(["ru", "uk", "cs", "en"]);

const nullableProvider = <T extends string>(value: unknown, allowed: ReadonlySet<T>): T | null | undefined => {
  if (value === null) return null;
  return typeof value === "string" && allowed.has(value as T) ? value as T : undefined;
};

export const normalizeUserPreferences = (value: unknown): UserPreferences => {
  if (!value || typeof value !== "object") return {};
  const parsed = value as Partial<UserPreferences>;

  return {
    language: parsed.language && languages.has(parsed.language) ? parsed.language : undefined,
    cityId: typeof parsed.cityId === "string" && parsed.cityId.trim() ? parsed.cityId : undefined,
    mapProvider: nullableProvider(parsed.mapProvider, mapProviders),
    calendarProvider: nullableProvider(parsed.calendarProvider, calendarProviders),
    shareProvider: nullableProvider(parsed.shareProvider, shareProviders),
    reminderProvider: nullableProvider(parsed.reminderProvider, reminderProviders),
  };
};

export const readUserPreferences = (): UserPreferences => {
  try {
    return normalizeUserPreferences(JSON.parse(localStorage.getItem(userPreferencesStorageKey) || "null"));
  } catch {
    return {};
  }
};

export const updateUserPreferences = (patch: Partial<UserPreferences>): UserPreferences => {
  const next = normalizeUserPreferences({ ...readUserPreferences(), ...patch });
  localStorage.setItem(userPreferencesStorageKey, JSON.stringify(next));

  if (next.language) localStorage.setItem(legacyLanguageStorageKey, next.language);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(userPreferencesChangedEvent));
  return next;
};

export const clearMapProviderPreference = (): UserPreferences => updateUserPreferences({ mapProvider: null });
export const clearCalendarProviderPreference = (): UserPreferences => updateUserPreferences({ calendarProvider: null });
export const clearShareProviderPreference = (): UserPreferences => updateUserPreferences({ shareProvider: null });
export const clearReminderProviderPreference = (): UserPreferences => updateUserPreferences({ reminderProvider: null });
