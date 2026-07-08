import type { Language } from "../types";

export type City = {
  id: string;
  countryCode: string;
  name: Record<Language, string>;
  coordinates: { latitude: number; longitude: number };
  timezone: string;
};

// Add a city here to expose it across web, Telegram and future native clients.
export const cities: City[] = [
  {
    id: "olomouc",
    countryCode: "CZ",
    name: { ru: "Оломоуц", uk: "Оломоуц", cs: "Olomouc", en: "Olomouc" },
    coordinates: { latitude: 49.5938, longitude: 17.2509 },
    timezone: "Europe/Prague",
  },
  {
    id: "praha",
    countryCode: "CZ",
    name: { ru: "Прага", uk: "Прага", cs: "Praha", en: "Prague" },
    coordinates: { latitude: 50.0755, longitude: 14.4378 },
    timezone: "Europe/Prague",
  },
];

export const defaultCityId = "olomouc";

export function getCity(cityId: string) {
  return cities.find((city) => city.id === cityId) ?? cities[0];
}
