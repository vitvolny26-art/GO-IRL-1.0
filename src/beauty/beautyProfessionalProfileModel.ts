import type { ServicesProfessional } from "../services/servicesProfessionalDirectory";

export type BeautyProfessionalProfileSummary = {
  professional: ServicesProfessional;
  services: ServicesProfessional[];
  priceFrom: number;
  durationFrom: number;
  durationTo: number;
};

export const buildBeautyProfessionalProfileSummary = (
  professionals: readonly ServicesProfessional[],
  slug: string,
): BeautyProfessionalProfileSummary | null => {
  const professional = professionals.find((item) => item.slug === slug);
  if (!professional) return null;

  const services = Array.from(new Map(
    professionals
      .filter((item) => item.profileId === professional.profileId)
      .map((item) => [item.serviceId, item]),
  ).values()).sort((left, right) => left.priceCzk - right.priceCzk || left.durationMinutes - right.durationMinutes);

  const prices = services.map((item) => item.priceCzk);
  const durations = services.map((item) => item.durationMinutes);

  return {
    professional,
    services,
    priceFrom: Math.min(...prices),
    durationFrom: Math.min(...durations),
    durationTo: Math.max(...durations),
  };
};
