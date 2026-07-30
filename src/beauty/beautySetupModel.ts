import type { Language } from "../types";

export const BEAUTY_SCHEMA_VERSION = 2 as const;

export const beautySetupSteps = [
  "pro_setup_profile",
  "pro_setup_service",
  "pro_setup_availability",
  "pro_setup_review",
] as const;

export type BeautySetupStep =
  | (typeof beautySetupSteps)[number]
  | "pro_setup_published"
  | "pro_public_preview";

export type BeautyWeekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type BeautyValidationCode =
  | "profile_display_name_required"
  | "profile_city_required"
  | "profile_public_location_required"
  | "profile_contact_required"
  | "profile_exact_address_required"
  | "service_name_required"
  | "service_duration_invalid"
  | "service_price_invalid"
  | "service_buffer_invalid"
  | "availability_weekday_required"
  | "availability_time_required"
  | "availability_time_order_invalid"
  | "availability_break_required"
  | "availability_break_order_invalid";

export type BeautyWorkspace = {
  schemaVersion: typeof BEAUTY_SCHEMA_VERSION;
  currentStep: BeautySetupStep;
  published: boolean;
  updatedAt: string;
  publicLink: string;
  profile: {
    displayName: string;
    city: string;
    publicLocation: string;
    contact: string;
    exactAddress: string;
  };
  service: {
    name: string;
    durationMinutes: number;
    priceCzk: number;
    bufferMinutes: number;
  };
  availability: {
    weekdays: BeautyWeekday[];
    startTime: string;
    endTime: string;
    breakEnabled: boolean;
    breakStart: string;
    breakEnd: string;
  };
};

export type BeautyPublicProfile = {
  displayName: string;
  city: string;
  publicLocation: string;
  serviceName: string;
  durationMinutes: number;
  priceCzk: number;
  weekdays: BeautyWeekday[];
  startTime: string;
  endTime: string;
  publicLink: string;
};

const localizedDefaults: Record<Language, Pick<BeautyWorkspace, "profile" | "service">> = {
  ru: {
    profile: {
      displayName: "Студия Анна",
      city: "Оломоуц",
      publicLocation: "Центр, Оломоуц",
      contact: "+420 777 000 111",
      exactAddress: "Horní náměstí 1, Olomouc",
    },
    service: {
      name: "Маникюр с гель-лаком",
      durationMinutes: 75,
      priceCzk: 890,
      bufferMinutes: 15,
    },
  },
  uk: {
    profile: {
      displayName: "Студія Анна",
      city: "Оломоуц",
      publicLocation: "Центр, Оломоуц",
      contact: "+420 777 000 111",
      exactAddress: "Horní náměstí 1, Olomouc",
    },
    service: {
      name: "Манікюр з гель-лаком",
      durationMinutes: 75,
      priceCzk: 890,
      bufferMinutes: 15,
    },
  },
  cs: {
    profile: {
      displayName: "Studio Anna",
      city: "Olomouc",
      publicLocation: "Centrum, Olomouc",
      contact: "+420 777 000 111",
      exactAddress: "Horní náměstí 1, Olomouc",
    },
    service: {
      name: "Manikúra s gel lakem",
      durationMinutes: 75,
      priceCzk: 890,
      bufferMinutes: 15,
    },
  },
  en: {
    profile: {
      displayName: "Anna Studio",
      city: "Olomouc",
      publicLocation: "City centre, Olomouc",
      contact: "+420 777 000 111",
      exactAddress: "Horní náměstí 1, Olomouc",
    },
    service: {
      name: "Gel manicure",
      durationMinutes: 75,
      priceCzk: 890,
      bufferMinutes: 15,
    },
  },
};

export const createDefaultBeautyWorkspace = (language: Language = "en"): BeautyWorkspace => ({
  schemaVersion: BEAUTY_SCHEMA_VERSION,
  currentStep: "pro_setup_profile",
  published: false,
  updatedAt: new Date().toISOString(),
  publicLink: "https://goirl.local/beauty/anna",
  profile: { ...localizedDefaults[language].profile },
  service: { ...localizedDefaults[language].service },
  availability: {
    weekdays: ["mon", "tue", "wed", "thu", "fri"],
    startTime: "09:00",
    endTime: "17:00",
    breakEnabled: true,
    breakStart: "12:00",
    breakEnd: "12:30",
  },
});

export const getBeautyStepProgress = (step: BeautySetupStep) => {
  const index = beautySetupSteps.indexOf(step as (typeof beautySetupSteps)[number]);
  return index >= 0 ? { current: index + 1, total: beautySetupSteps.length } : null;
};

export const buildBeautyPublicProfile = (workspace: BeautyWorkspace): BeautyPublicProfile => ({
  displayName: workspace.profile.displayName,
  city: workspace.profile.city,
  publicLocation: workspace.profile.publicLocation,
  serviceName: workspace.service.name,
  durationMinutes: workspace.service.durationMinutes,
  priceCzk: workspace.service.priceCzk,
  weekdays: [...workspace.availability.weekdays],
  startTime: workspace.availability.startTime,
  endTime: workspace.availability.endTime,
  publicLink: workspace.publicLink,
});

const isBlank = (value: string) => value.trim().length === 0;

export const validateBeautyStep = (workspace: BeautyWorkspace, step: BeautySetupStep): BeautyValidationCode[] => {
  if (step === "pro_setup_profile") {
    const errors: BeautyValidationCode[] = [];
    if (isBlank(workspace.profile.displayName)) errors.push("profile_display_name_required");
    if (isBlank(workspace.profile.city)) errors.push("profile_city_required");
    if (isBlank(workspace.profile.publicLocation)) errors.push("profile_public_location_required");
    if (isBlank(workspace.profile.contact)) errors.push("profile_contact_required");
    if (isBlank(workspace.profile.exactAddress)) errors.push("profile_exact_address_required");
    return errors;
  }

  if (step === "pro_setup_service") {
    const errors: BeautyValidationCode[] = [];
    if (isBlank(workspace.service.name)) errors.push("service_name_required");
    if (workspace.service.durationMinutes <= 0) errors.push("service_duration_invalid");
    if (workspace.service.priceCzk < 0) errors.push("service_price_invalid");
    if (workspace.service.bufferMinutes < 0) errors.push("service_buffer_invalid");
    return errors;
  }

  if (step === "pro_setup_availability") {
    const errors: BeautyValidationCode[] = [];
    if (!workspace.availability.weekdays.length) errors.push("availability_weekday_required");
    if (!workspace.availability.startTime || !workspace.availability.endTime) errors.push("availability_time_required");
    if (workspace.availability.startTime >= workspace.availability.endTime) errors.push("availability_time_order_invalid");
    if (workspace.availability.breakEnabled) {
      if (!workspace.availability.breakStart || !workspace.availability.breakEnd) errors.push("availability_break_required");
      if (workspace.availability.breakStart >= workspace.availability.breakEnd) errors.push("availability_break_order_invalid");
    }
    return errors;
  }

  return [];
};
