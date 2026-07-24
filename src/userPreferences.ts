import type { Language } from "./types";

export type MapProvider = "google" | "apple" | "mapy";

export type UserPreferences = {
  language?: Language;
  cityId?: string;
  mapProvider?: MapProvider;
};

export const userPreferencesStorageKey = "go-irl-user-preferences";
export const legacyLanguageStorageKey = "go-irl-language";

const mapProviders = new Set<MapProvider>(["google", "apple", "mapy"]);
const languages = new Set<Language>(["ru", "uk", "cs", "en"]);

export const readUserPreferences = (): UserPreferences => {
  try {
    const parsed = JSON.parse(localStorage.getItem(userPreferencesStorageKey) || "null") as UserPreferences | null;
    if (!parsed || typeof parsed !== "object") return {};

    return {
      language: parsed.language && languages.has(parsed.language) ? parsed.language : undefined,
      cityId: typeof parsed.cityId === "string" && parsed.cityId.trim() ? parsed.cityId : undefined,
      mapProvider: parsed.mapProvider && mapProviders.has(parsed.mapProvider) ? parsed.mapProvider : undefined,
    };
  } catch {
    return {};
  }
};

export const updateUserPreferences = (patch: Partial<UserPreferences>): UserPreferences => {
  const next = { ...readUserPreferences(), ...patch };
  localStorage.setItem(userPreferencesStorageKey, JSON.stringify(next));

  if (next.language) localStorage.setItem(legacyLanguageStorageKey, next.language);
  return next;
};

export const clearMapProviderPreference = (): UserPreferences => {
  const next = readUserPreferences();
  delete next.mapProvider;
  localStorage.setItem(userPreferencesStorageKey, JSON.stringify(next));
  return next;
};
