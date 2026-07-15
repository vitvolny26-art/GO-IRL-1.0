import { afterEach, describe, expect, it } from "vitest";
import sharp from "sharp";
import handler from "./event-invitation-card.js";
import type { TelegramEventCardInput } from "../_shared/telegram-event-card.js";
import { createMetaInvitationCardToken } from "../_shared/telegram-share-card-token.js";

const runtimeEnv = (globalThis as typeof globalThis & {
  process: { env: Record<string, string | undefined> };
}).process.env;

const card: TelegramEventCardInput = {
  eventId: "3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  title: "Волейбол на ZŠ Demlova",
  activity: "Волейбол",
  date: "19 июл",
  eventDate: "2026-07-19",
  time: "16:30",
  address: "ZŠ Demlova",
  participants: 2,
  capacity: 12,
  icon: "🏐",
  inviteUrl: "https://t.me/GOirl_bot?startapp=3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  city: "Оломоуц",
  durationMinutes: 90,
  price: 0,
  level: "Любитель",
  format: "Любительский",
  environment: "На улице",
  isSport: true,
  weather: { icon: "🌤️", temperature: 23, rain: 12, wind: 19 },
  language: "ru",
};

describe("Meta invitation card endpoint", () => {
  afterEach(() => {
    delete runtimeEnv.META_APP_SECRET;
  });

  it("returns only a valid signed JPEG card", async () => {
    runtimeEnv.META_APP_SECRET = "meta-secret";
    const token = createMetaInvitationCardToken(card, "meta-secret");
    const headers = new Map<string, string>();
    let status = 0;
    let body: string | Uint8Array | undefined;
    const response = {
      setHeader: (name: string, value: string) => { headers.set(name, value); },
      status: (value: number) => { status = value; return response; },
      end: (value?: string | Uint8Array) => { body = value; },
    };

    await handler({ method: "GET", query: { token } }, response);

    expect(status).toBe(200);
    expect(headers.get("Content-Type")).toBe("image/jpeg");
    const metadata = await sharp(body as Uint8Array).metadata();
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(900);
  });
});
