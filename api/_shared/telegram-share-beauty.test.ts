import { describe, expect, it } from "vitest";
import { isBeautyShareSlug, localizeBeautyServiceName } from "./telegram-share-beauty";

describe("Beauty Telegram share", () => {
  it("accepts legacy and editable namespaced English slugs", () => {
    expect(isBeautyShareSlug("beauty-06b9689e8b1ee69a")).toBe(true);
    expect(isBeautyShareSlug("beauty-test-studio")).toBe(true);
    expect(isBeautyShareSlug("test-studio")).toBe(false);
    expect(isBeautyShareSlug("Beauty Test Studio")).toBe(false);
  });

  it("localizes the manicure service in all system languages", () => {
    expect(localizeBeautyServiceName("Маникюр с гель-лаком", "ru")).toBe("Маникюр с гель-лаком");
    expect(localizeBeautyServiceName("Маникюр с гель-лаком", "uk")).toBe("Манікюр з гель-лаком");
    expect(localizeBeautyServiceName("Маникюр с гель-лаком", "cs")).toBe("Manikúra s gel lakem");
    expect(localizeBeautyServiceName("Маникюр с гель-лаком", "en")).toBe("Gel manicure");
  });
});
