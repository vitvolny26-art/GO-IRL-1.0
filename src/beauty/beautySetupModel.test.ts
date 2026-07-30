import { describe, expect, it } from "vitest";
import {
  buildBeautyPublicProfile,
  createDefaultBeautyWorkspace,
  getBeautyStepProgress,
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
    const publicProfile = buildBeautyPublicProfile(workspace);

    expect(publicProfile.displayName).toBe(workspace.profile.displayName);
    expect(publicProfile).not.toHaveProperty("contact");
    expect(publicProfile).not.toHaveProperty("exactAddress");
  });

  it("creates defaults in the selected app language", () => {
    expect(createDefaultBeautyWorkspace("ru").service.name).toBe("Маникюр с гель-лаком");
    expect(createDefaultBeautyWorkspace("en").service.name).toBe("Gel manicure");
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
});
