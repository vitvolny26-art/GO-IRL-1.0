import { describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import type { TelegramEventCardInput } from "../../../api/_shared/telegram-event-card.js";
import { loadTrustedTelegramBeautyCard } from "../../../api/_shared/telegram-share-beauty.js";
import handler from "../../../api/meta/beauty-invitation-card.js";

vi.mock("../../../api/_shared/telegram-share-beauty.js", () => ({
  isBeautyShareSlug: (value: unknown) => value === "beauty-test",
  isShareLanguage: (value: unknown) => ["ru", "uk", "cs", "en"].includes(String(value)),
  loadTrustedTelegramBeautyCard: vi.fn(),
}));

const card: TelegramEventCardInput = {
  eventId: "3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  title: "Маникюр с гель-лаком",
  activity: "Test Studio",
  date: "04 авг · 09:00",
  eventDate: "",
  time: "",
  address: "Центр, Оломоуц",
  participants: 0,
  capacity: 0,
  icon: "✨",
  inviteUrl: "https://t.me/GOirl_bot?startapp=beauty-test",
  city: "Olomouc",
  organizer: "Test Studio",
  durationMinutes: 90,
  price: 900,
  level: "Бьюти-услуга",
  format: "90 min",
  environment: "Центр, Оломоуц",
  isSport: false,
  language: "ru",
};

describe("Meta Beauty invitation card endpoint", () => {
  it("returns a public 1200×630 Beauty JPEG", async () => {
    vi.mocked(loadTrustedTelegramBeautyCard).mockResolvedValue(card);
    const headers = new Map<string, string>();
    let status = 0;
    let body: string | Uint8Array | undefined;
    const response = {
      setHeader: (name: string, value: string) => { headers.set(name, value); },
      status: (value: number) => { status = value; return response; },
      end: (value?: string | Uint8Array) => { body = value; },
    };

    await handler({
      method: "GET",
      query: { slug: "beauty-test", language: "ru", date: "04 авг · 09:00" },
    }, response);

    expect(status).toBe(200);
    expect(headers.get("Content-Type")).toBe("image/jpeg");
    expect(headers.get("Cache-Control")).toContain("max-age=300");
    const metadata = await sharp(body as Uint8Array).metadata();
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
  });
});
