export const weatherAlertContractVersion = 1 as const;

export type WeatherHazardKind =
  | "rain"
  | "thunderstorm"
  | "strong_wind"
  | "heat"
  | "frost"
  | "snow"
  | "ice"
  | "poor_air_quality"
  | "other";

export type WeatherAlertSeverity = "info" | "watch" | "warning" | "critical";
export type WeatherAlertStatus = "active" | "superseded" | "expired" | "cancelled";
export type WeatherConfidence = "low" | "medium" | "high";
export type WeatherRecipientRole = "organizer" | "participant" | "waitlisted" | "moderator";
export type WeatherDeliveryIntent = "in_app" | "transactional" | "service_critical";

export type WeatherLocationRef = {
  cityId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone: string;
};

export type WeatherObservation = {
  provider: string;
  observedAt: string;
  validFrom: string;
  validUntil: string;
  confidence: WeatherConfidence;
  temperatureCelsius?: number | null;
  precipitationProbability?: number | null;
  windSpeedKph?: number | null;
  windGustKph?: number | null;
  metadata?: Record<string, string | number | boolean | null>;
};

export type WeatherAlertContract = {
  version: typeof weatherAlertContractVersion;
  id: string;
  activityId: string;
  location: WeatherLocationRef;
  hazard: WeatherHazardKind;
  severity: WeatherAlertSeverity;
  status: WeatherAlertStatus;
  observation: WeatherObservation;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
  supersedesAlertId?: string | null;
};

export type WeatherAlertRecipient = {
  alertId: string;
  activityId: string;
  userKey: string;
  role: WeatherRecipientRole;
  deliveryIntent: WeatherDeliveryIntent;
  eligible: boolean;
  reason?: "activity_member" | "organizer" | "waitlisted" | "moderator" | "opted_out" | "not_relevant";
};

export type WeatherAlertPolicy = {
  eventScopedOnly: true;
  automaticCancellationAllowed: false;
  automaticReschedulingAllowed: false;
  serviceCriticalThreshold: WeatherAlertSeverity;
  defaultRetentionDays: number;
};

export const weatherAlertPolicy: WeatherAlertPolicy = {
  eventScopedOnly: true,
  automaticCancellationAllowed: false,
  automaticReschedulingAllowed: false,
  serviceCriticalThreshold: "warning",
  defaultRetentionDays: 14,
};

export const weatherNotificationKindByHazard: Readonly<Record<WeatherHazardKind, string>> = {
  rain: "weather.rain",
  thunderstorm: "weather.thunderstorm",
  strong_wind: "weather.strong_wind",
  heat: "weather.heat",
  frost: "weather.frost",
  snow: "weather.other",
  ice: "weather.other",
  poor_air_quality: "weather.other",
  other: "weather.other",
};

export const buildWeatherAlertDeduplicationKey = (
  activityId: string,
  hazard: WeatherHazardKind,
  startsAt: string,
  provider: string,
) => [activityId, hazard, startsAt, provider].map(encodeURIComponent).join(":");

export const buildWeatherAlertOccurrenceKey = (alertId: string, userKey: string) =>
  [alertId, userKey].map(encodeURIComponent).join(":");

export const isServiceCriticalWeatherAlert = (
  severity: WeatherAlertSeverity,
  policy: WeatherAlertPolicy = weatherAlertPolicy,
) => {
  const rank: Record<WeatherAlertSeverity, number> = { info: 0, watch: 1, warning: 2, critical: 3 };
  return rank[severity] >= rank[policy.serviceCriticalThreshold];
};