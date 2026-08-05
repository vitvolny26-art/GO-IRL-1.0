import { describe, expect, it } from "vitest";
import { createBeautyService, createDefaultBeautyWorkspace, withBeautyServices } from "./beautySetupModel";
import { buildBeautyShareCardPreviewInput, buildBeautyShareCardPreviewSvg } from "./beautyShareCardPreview";

describe("Beauty workspace share-card preview", () => {
  it("uses the current premium-v3 Telegram template and selected workspace services", () => {
    let workspace = createDefaultBeautyWorkspace("ru");
    const second = createBeautyService("ru", 1, "service-2");
    second.name = "Укрепление ногтей";
    second.nameByLanguage.ru = second.name;
    second.priceCzk = 1090;
    workspace = withBeautyServices(workspace, [workspace.service, second]);
    workspace.profile.displayName = "Studio Vita";
    workspace.profile.specializationByLanguage.ru = "Маникюр и укрепление натуральных ногтей";
    workspace.shareCard.serviceIds = [second.id, workspace.service.id];

    const input = buildBeautyShareCardPreviewInput(workspace, "ru");
    const svg = buildBeautyShareCardPreviewSvg(workspace, "ru");

    expect(input.activity).toBe("Studio Vita");
    expect(input.beautyServices?.map((service) => service.name))
      .toEqual(["Укрепление ногтей", workspace.service.name]);
    expect(svg).toContain('width="1080" height="900"');
    expect(svg).toContain('data-beauty-template="premium-v3"');
    expect(svg).toContain('data-beauty-premium-title="true"');
    expect(svg).toContain('data-beauty-double-frame="true"');
    expect(svg).not.toContain('data-beauty-default-cta="true"');
    expect(svg).not.toContain('id="leftShade"');
    expect(svg).not.toContain('transform="translate(620 807) scale(1.15)"');
    expect(svg).not.toContain("Услуги и запись");
  });
});
