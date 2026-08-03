import { describe, expect, it } from "vitest";
import {
  BEAUTY_SCHEMA_VERSION,
  buildBeautyPublicProfile,
  createDefaultBeautyWorkspace,
  getBeautyStepProgress,
  resolveBeautyLocalizedText,
  upgradeBeautyWorkspace,
  validateBeautyStep,
} from "./beautySetupModel";

describe("Beauty setup model", () => {
  it("tracks the four setup steps", () => {
    expect(getBeautyStepProgress("pro_setup_profile")).toEqual({ current: 1, total: 4 });
    expect(getBeautyStepProgress("pro_setup_review")).toEqual({ current: 4, total: 4 });
    expect(getBeautyStepProgress("pro_setup_published")).toBeNull();
  });

  it("keeps private fields out of the public profile", () => {
    const workspace = createDefaultBeautyWorkspace("ru");
    const publicProfile = buildBeautyPublicProfile(workspace, "ru");

    expect(publicProfile.displayName).toBe(workspace.profile.displayName);
    expect(publicProfile.description).toBe(workspace.profile.descriptionByLanguage.ru);
    expect(publicProfile).not.toHaveProperty("contact");
    expect(publicProfile).not.toHaveProperty("exactAddress");
  });

  it("creates all supported translations and resolves the client language", () => {
    const workspace = createDefaultBeautyWorkspace("ru");
    expect(workspace.service.nameByLanguage.ru).toBe("Маникюр с гель-лаком");
    expect(workspace.service.nameByLanguage.en).toBe("Gel manicure");
    expect(buildBeautyPublicProfile(workspace, "cs").serviceName).toBe("Manikúra s gel lakem");
  });

  it("uses a deterministic fallback when the requested translation is empty", () => {
    expect(resolveBeautyLocalizedText({ ru: "", uk: "", cs: "", en: "English" }, "ru", "Legacy"))
      .toBe("English");
    expect(resolveBeautyLocalizedText({ ru: "", uk: "", cs: "", en: "" }, "ru", "Legacy"))
      .toBe("Legacy");
  });

  it("upgrades a version 2 workspace without losing the existing service name", () => {
    const legacy = createDefaultBeautyWorkspace("ru") as unknown as Record<string, unknown>;
    legacy.schemaVersion = 2;
    const service = { ...(legacy.service as Record<string, unknown>) };
    delete service.nameByLanguage;
    service.name = "Старое название";
    legacy.service = service;
    const profile = { ...(legacy.profile as Record<string, unknown>) };
    delete profile.description;
    delete profile.descriptionByLanguage;
    legacy.profile = profile;

    const upgraded = upgradeBeautyWorkspace(legacy, "ru");
    expect(upgraded?.schemaVersion).toBe(BEAUTY_SCHEMA_VERSION);
    expect(upgraded?.service.nameByLanguage.ru).toBe("Старое название");
  });

  it("returns language-neutral validation codes", () => {
    const workspace = createDefaultBeautyWorkspace();
    workspace.profile.displayName = "";
    workspace.service.durationMinutes = 0;
    workspace.availability.weekdays = [];

    expect(validateBeautyStep(workspace, "pro_setup_profile")).toContain("profile_display_name_required");
    expect(validateBeautyStep(workspace, "pro_setup_service")).toContain("service_duration_invalid");
    expect(validateBeautyStep(workspace, "pro_setup_availability")).toContain("availability_weekday_required");
  });

  it("requires a recurring break to stay inside working hours", () => {
    const workspace = createDefaultBeautyWorkspace();
    workspace.availability.breakStart = "08:30";

    expect(validateBeautyStep(workspace, "pro_setup_availability"))
      .toContain("availability_break_outside_working_hours");
  });
});