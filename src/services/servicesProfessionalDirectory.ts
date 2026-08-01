import type { SupabaseClient } from "@supabase/supabase-js";
import { isBrowserMockMode } from "../authSession";
import { supabase } from "../supabase";
import type { Language } from "../types";

export type ServicesProfessional = {
  profileId: string;
  slug: string;
  displayName: string;
  cityId: string;
  publicLocation: string;
  serviceName: string;
  durationMinutes: number;
  priceCzk: number;
  currency: "CZK";
  publicLink: string;
  updatedAt: string;
};

type ServicesProfessionalRow = {
  profile_id: string;
  slug: string;
  display_name: string;
  city_id: string;
  public_location: string;
  service_name: string;
  duration_minutes: number;
  price_czk: number;
  currency: "CZK";
  public_link: string;
  updated_at: string;
};

export const sharedMockProfessionals: ServicesProfessional[] = [
  {
    profileId: "browser-demo-studio-vita",
    slug: "studio-vita",
    displayName: "Studio Vita",
    cityId: "olomouc",
    publicLocation: "City centre, Olomouc",
    serviceName: "Gel manicure",
    durationMinutes: 75,
    priceCzk: 890,
    currency: "CZK",
    publicLink: "/beauty/studio-vita",
    updatedAt: "1970-01-01T00:00:00.000Z",
  },
];

const directoryCache = new Map<string, ServicesProfessional[]>();

const mapProfessional = (row: ServicesProfessionalRow): ServicesProfessional => ({
  profileId: row.profile_id,
  slug: row.slug,
  displayName: row.display_name,
  cityId: row.city_id,
  publicLocation: row.public_location,
  serviceName: row.service_name,
  durationMinutes: row.duration_minutes,
  priceCzk: row.price_czk,
  currency: row.currency,
  publicLink: row.public_link,
  updatedAt: row.updated_at,
});

export const professionalsForCity = (
  cityId: string,
  professionals?: readonly ServicesProfessional[],
) => {
  const source = professionals
    ?? (isBrowserMockMode() ? sharedMockProfessionals : directoryCache.get(cityId) || []);
  return source.filter((professional) => professional.cityId === cityId);
};

export const loadProfessionalDirectory = async (
  cityId: string,
  dependencies: {
    client?: SupabaseClient;
    browserMock?: boolean;
  } = {},
): Promise<ServicesProfessional[]> => {
  const browserMock = dependencies.browserMock ?? isBrowserMockMode();
  if (browserMock) return professionalsForCity(cityId, sharedMockProfessionals);

  const client = dependencies.client || supabase;
  const result = await client.rpc("go_irl_list_public_beauty_professionals", {
    p_requested_city_id: cityId,
  });
  if (result.error) throw result.error;

  const professionals = ((result.data || []) as ServicesProfessionalRow[]).map(mapProfessional);
  directoryCache.set(cityId, professionals);
  return professionals;
};

export const clearProfessionalDirectoryCache = () => directoryCache.clear();

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
