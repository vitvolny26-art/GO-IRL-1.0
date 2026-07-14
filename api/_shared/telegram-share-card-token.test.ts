import { describe, expect, it } from "vitest";
import {
  createMetaInvitationCardToken,
  createTelegramShareCardToken,
  readMetaInvitationCardToken,
  readTelegramShareCardToken,
} from "./telegram-share-card-token";
import type { TelegramEventCardInput } from "./telegram-event-card";

const card: TelegramEventCardInput = {
  eventId: "3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  title: "Игра вечером",
  activity: "Волейбол",
  date: "19 июл",
  time: "16:30",
  address: "ZŠ Demlova",
  participants: 3,
  capacity: 8,
  icon: "🏐",
  inviteUrl: "https://t.me/GOirl_bot?startapp=3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  city: "Оломоуц",
  durationMinutes: 90,
  price: 0,
  level: "Любитель",
  format: "Любительский",
  environment: "На улице",
  language: "ru",
};

describe("Telegram share-card token", () => {
  it("round-trips a signed card", () => {
    const token = createTelegramShareCardToken(card, "secret", 1_000);
    expect(readTelegramShareCardToken(token, "secret", 2_000)).toEqual(card);
  });

  it("rejects tampering, wrong secrets and expired cards", () => {
    const token = createTelegramShareCardToken(card, "secret", 1_000);
    expect(readTelegramShareCardToken(`${token}x`, "secret", 2_000)).toBeNull();
    expect(readTelegramShareCardToken(token, "wrong", 2_000)).toBeNull();
    expect(readTelegramShareCardToken(token, "secret", 3_602_000)).toBeNull();
  });

  it("keeps Meta media URLs valid for one day", () => {
    const token = createMetaInvitationCardToken(card, "meta-secret", 1_000);
    expect(readMetaInvitationCardToken(token, "meta-secret", 23 * 60 * 60 * 1000)).toEqual(card);
    expect(readMetaInvitationCardToken(token, "meta-secret", 25 * 60 * 60 * 1000)).toBeNull();
  });
});
