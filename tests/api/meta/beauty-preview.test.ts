import { afterEach, describe, expect, it } from "vitest";
import type { TelegramEventCardInput } from "../../../api/_shared/telegram-event-card.js";
import {
  beautyPreviewCopy,
  buildBeautyPreviewMetadata,
  resolveBeautyPreviewOrigin,
} from "../../../api/meta/beauty-preview.js";

const runtimeEnv = (globalThis as typeof globalThis & {
  process: { env: Record<string, string | undefined> };
}).process.env;

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

describe("Meta Beauty preview", () => {
  afterEach(() => {
    delete runtimeEnv.VERCEL_URL;
    delete runtimeEnv.VERCEL_PROJECT_PRODUCTION_URL;
  });

  it("has localized profile fallback actions", () => {
    expect(beautyPreviewCopy.ru.open).toBe("Открыть профиль");
    expect(beautyPreviewCopy.uk.open).toBe("Відкрити профіль");
    expect(beautyPreviewCopy.cs.open).toBe("Otevřít profil");
    expect(beautyPreviewCopy.en.open).toBe("Open profile");
  });

  it("builds Beauty-specific metadata with a large JPEG and public profile target", () => {
    const metadata = buildBeautyPreviewMetadata(card, "beauty-test", "https://go-irl-1-0.vercel.app");
    expect(metadata.title).toBe("Test Studio");
    expect(metadata.description).toContain("Маникюр с гель-лаком");
    expect(metadata.description).toContain("900 Kč");
    expect(metadata.imageUrl).toContain("/api/meta/beauty-invitation-card");
    expect(metadata.imageUrl).toContain("slug=beauty-test");
    expect(metadata.canonicalUrl).toContain("/api/meta/beauty-preview");
    expect(metadata.targetUrl).toBe("https://go-irl-1-0.vercel.app/beauty/beauty-test");
  });

  it("accepts only a Vercel request host and rejects arbitrary forwarded hosts", () => {
    expect(resolveBeautyPreviewOrigin({ headers: { "x-forwarded-host": "go-irl-1-0.vercel.app" } }))
      .toBe("https://go-irl-1-0.vercel.app");

    runtimeEnv.VERCEL_PROJECT_PRODUCTION_URL = "goirl.realitka.pp.ua";
    expect(resolveBeautyPreviewOrigin({ headers: { "x-forwarded-host": "attacker.example" } }))
      .toBe("https://go-irl-1-0.vercel.app");
  });
});
