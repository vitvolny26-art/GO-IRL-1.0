import { describe, expect, it } from "vitest";
import pageSource from "./BeautySetupPage.tsx?raw";
import editorSource from "./BeautyShareCardEditor.tsx?raw";

describe("Beauty sharing business-card workspace UX", () => {
  it("places the editor inside the professional workspace", () => {
    expect(pageSource).toContain("<BeautyShareCardEditor");
    expect(pageSource.indexOf("<BeautyShareCardEditor")).toBeGreaterThan(pageSource.indexOf("<BeautyWorkspaceContentEditor"));
  });

  it("keeps preview and all four persistent generation states", () => {
    expect(editorSource).toContain("generatedImageDataUrl");
    expect(editorSource).toContain("● Визитка готова");
    expect(editorSource).toContain("◌ Визитка обновляется…");
    expect(editorSource).toContain("⚠ Не удалось обновить");
    expect(editorSource).toContain("— Визитка удалена");
  });

  it("does not present the Beauty card as an appointment card", () => {
    expect(editorSource).toContain("Услуги и запись");
    expect(editorSource).not.toContain("В календарь");
    expect(editorSource).not.toContain("Билет");
  });
});
