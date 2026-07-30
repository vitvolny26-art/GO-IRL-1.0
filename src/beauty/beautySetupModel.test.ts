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
    const workspace = createDefaultBeautyWorkspace();
    const publicProfile = buildBeautyPublicProfile(workspace);

    expect(publicProfile.displayName).toBe(workspace.profile.displayName);
    expect(publicProfile).not.toHaveProperty("contact");
    expect(publicProfile).not.toHaveProperty("exactAddress");
  });

  it("validates each editable stage independently", () => {
    const workspace = createDefaultBeautyWorkspace();
    workspace.profile.displayName = "";
    workspace.service.durationMinutes = 0;
    workspace.availability.weekdays = [];

    expect(validateBeautyStep(workspace, "pro_setup_profile")).toContain("Vyplňte veřejné jméno.");
    expect(validateBeautyStep(workspace, "pro_setup_service")).toContain("Délka služby musí být větší než nula.");
    expect(validateBeautyStep(workspace, "pro_setup_availability")).toContain("Vyberte alespoň jeden pracovní den.");
  });
});
