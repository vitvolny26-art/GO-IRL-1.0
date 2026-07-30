export const BEAUTY_SCHEMA_VERSION = 1 as const;

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

export const beautyWeekdayLabels: Record<BeautyWeekday, string> = {
  mon: "Po",
  tue: "Út",
  wed: "St",
  thu: "Čt",
  fri: "Pá",
  sat: "So",
  sun: "Ne",
};

export const createDefaultBeautyWorkspace = (): BeautyWorkspace => ({
  schemaVersion: BEAUTY_SCHEMA_VERSION,
  currentStep: "pro_setup_profile",
  published: false,
  updatedAt: new Date().toISOString(),
  publicLink: "https://goirl.local/beauty/studio-anna",
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

export const validateBeautyStep = (workspace: BeautyWorkspace, step: BeautySetupStep): string[] => {
  if (step === "pro_setup_profile") {
    const errors: string[] = [];
    if (isBlank(workspace.profile.displayName)) errors.push("Vyplňte veřejné jméno.");
    if (isBlank(workspace.profile.city)) errors.push("Vyplňte město.");
    if (isBlank(workspace.profile.publicLocation)) errors.push("Vyplňte veřejnou oblast.");
    if (isBlank(workspace.profile.contact)) errors.push("Vyplňte kontaktní údaj.");
    if (isBlank(workspace.profile.exactAddress)) errors.push("Vyplňte přesnou adresu pro potvrzené rezervace.");
    return errors;
  }

  if (step === "pro_setup_service") {
    const errors: string[] = [];
    if (isBlank(workspace.service.name)) errors.push("Vyplňte název služby.");
    if (workspace.service.durationMinutes <= 0) errors.push("Délka služby musí být větší než nula.");
    if (workspace.service.priceCzk < 0) errors.push("Cena nemůže být záporná.");
    if (workspace.service.bufferMinutes < 0) errors.push("Buffer nemůže být záporný.");
    return errors;
  }

  if (step === "pro_setup_availability") {
    const errors: string[] = [];
    if (!workspace.availability.weekdays.length) errors.push("Vyberte alespoň jeden pracovní den.");
    if (!workspace.availability.startTime || !workspace.availability.endTime) errors.push("Vyplňte začátek a konec dostupnosti.");
    if (workspace.availability.startTime >= workspace.availability.endTime) errors.push("Konec dostupnosti musí být později než začátek.");
    if (workspace.availability.breakEnabled) {
      if (!workspace.availability.breakStart || !workspace.availability.breakEnd) errors.push("Vyplňte začátek a konec pauzy.");
      if (workspace.availability.breakStart >= workspace.availability.breakEnd) errors.push("Konec pauzy musí být později než začátek.");
    }
    return errors;
  }

  return [];
};
