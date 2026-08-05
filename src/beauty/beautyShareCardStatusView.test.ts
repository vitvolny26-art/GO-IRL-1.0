import { describe, expect, it } from "vitest";
import {
  beautyShareCardStaffStatusCopy,
  formatBeautyShareCardStaffStatus,
} from "./beautyShareCardStatusView";

const status = {
  profileId: "profile-1",
  status: "ready" as const,
  templateVersion: 1,
  hasGeneratedImage: true,
  generatedAt: "2026-08-05T18:14:00.000Z",
  updatedAt: "2026-08-05T18:15:00.000Z",
};

describe("Beauty share-card staff status copy", () => {
  it("shows a localized ready timestamp", () => {
    expect(formatBeautyShareCardStaffStatus(status, "en")).toMatch(/^● Business card ready · \d{2}:\d{2}$/);
    expect(formatBeautyShareCardStaffStatus(status, "ru")).toMatch(/^● Визитка готова · \d{2}:\d{2}$/);
  });

  it("keeps staff failure state read-only", () => {
    expect(beautyShareCardStaffStatusCopy("ru", "error")).toBe("⚠ Не удалось обновить");
    expect(beautyShareCardStaffStatusCopy("ru", "error")).not.toContain("Повторить");
  });

  it("renders explicit updating and deleted states", () => {
    expect(beautyShareCardStaffStatusCopy("uk", "updating")).toBe("◌ Візитка оновлюється…");
    expect(beautyShareCardStaffStatusCopy("cs", "deleted")).toBe("— Vizitka byla odstraněna");
  });
});
