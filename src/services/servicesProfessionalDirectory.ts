import { getCity } from "../config/cities";
import type { Language } from "../types";
import type { BeautyPublicProfile } from "../beauty/beautySetupModel";

export const sharedMockProfessionals: BeautyPublicProfile[] = [
  {
    displayName: "Studio Vita",
    city: "Olomouc",
    publicLocation: "City centre, Olomouc",
    serviceName: "Gel manicure",
    durationMinutes: 75,
    priceCzk: 890,
    weekdays: ["mon", "tue", "wed", "thu", "fri"],
    startTime: "09:00",
    endTime: "17:00",
    publicLink: "/beauty/studio-vita",
  },
];

const normalize = (value: string) => value.trim().toLocaleLowerCase();
const identity = (professional: BeautyPublicProfile) => normalize(professional.displayName);

export const professionalsForCity = (
  cityId: string,
  professionals: BeautyPublicProfile[] = sharedMockProfessionals,
) => {
  const cityNames = new Set(Object.values(getCity(cityId).name).map(normalize));
  return professionals.filter((professional) => cityNames.has(normalize(professional.city)));
};

export const mergeProfessionalDirectory = (
  shared: BeautyPublicProfile[],
  local?: BeautyPublicProfile,
) => {
  if (!local) return shared;
  const localIdentity = identity(local);
  const hasMatch = shared.some((professional) => identity(professional) === localIdentity);
  return hasMatch
    ? shared.map((professional) => identity(professional) === localIdentity ? local : professional)
    : [...shared, local];
};

export const professionalCountLabel = (language: Language, count: number) => {
  if (language === "ru") {
    const mod100 = count % 100;
    const mod10 = count % 10;
    if (mod100 >= 11 && mod100 <= 14) return "мастеров";
    if (mod10 === 1) return "мастер";
    if (mod10 >= 2 && mod10 <= 4) return "мастера";
    return "мастеров";
  }
  if (language === "uk") {
    const mod100 = count % 100;
    const mod10 = count % 10;
    if (mod100 >= 11 && mod100 <= 14) return "майстрів";
    if (mod10 === 1) return "майстер";
    if (mod10 >= 2 && mod10 <= 4) return "майстри";
    return "майстрів";
  }
  if (language === "cs") return count === 1 ? "profesionál" : "profesionálů";
  return count === 1 ? "professional" : "professionals";
};
