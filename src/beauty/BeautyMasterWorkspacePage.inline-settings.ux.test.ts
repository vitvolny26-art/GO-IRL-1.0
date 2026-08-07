import { describe, expect, it } from "vitest";
import pageSource from "./BeautyMasterWorkspacePage.tsx?raw";
import dialogSource from "./BeautyWorkspaceSettingsDialog.tsx?raw";

describe("Beauty master inline settings", () => {
  it("does not navigate the master workspace to the legacy Beauty setup route", () => {
    expect(pageSource).toContain("setSettingsOpen(true)");
    expect(pageSource).toContain("BeautyWorkspaceSettingsDialog");
    expect(pageSource).not.toContain('window.location.assign("/beauty")');
  });

  it("keeps profile, service and recurring availability controls in the workspace dialog", () => {
    expect(dialogSource).toContain("Профиль, услуга и расписание меняются здесь");
    expect(dialogSource).toContain("beauty-weekdays");
    expect(dialogSource).toContain("breakEnabled");
    expect(dialogSource).toContain("saveBeautyWorkspace(workspace)");
  });
});
