import { describe, expect, it } from "vitest";
import { mapExternalTelegramChatRow } from "./externalTelegramChatRepository";

const baseRow = {
  activity_id: "11111111-1111-4111-8111-111111111111",
  url: "https://telegram.me/example_group/",
  attached_by_user_key: "telegram:42",
  keep_archive: true,
  created_at: "2026-07-27T10:00:00.000Z",
  updated_at: "2026-07-27T10:00:00.000Z",
  telegram_chat_id: null,
  telegram_chat_type: null,
  telegram_chat_title: null,
  bound_at: null,
};

describe("shared external Telegram chat repository", () => {
  it("maps a manual database row without claiming server verification", () => {
    expect(mapExternalTelegramChatRow(baseRow)).toEqual({
      kind: "event",
      url: "https://t.me/example_group",
      attachedByUserKey: "telegram:42",
      attachedAt: "2026-07-27T10:00:00.000Z",
      keepArchive: true,
      verificationState: "manual",
      boundAt: undefined,
      telegramChatTitle: undefined,
    });
  });

  it("marks a chat verified only when all server binding fields are present", () => {
    expect(mapExternalTelegramChatRow({
      ...baseRow,
      telegram_chat_id: -1001234567890,
      telegram_chat_type: "supergroup",
      telegram_chat_title: "GO IRL Volleyball",
      bound_at: "2026-07-29T13:40:00.000Z",
    })).toMatchObject({
      verificationState: "verified",
      boundAt: "2026-07-29T13:40:00.000Z",
      telegramChatTitle: "GO IRL Volleyball",
    });
  });

  it("does not accept partial server metadata as verified", () => {
    expect(mapExternalTelegramChatRow({
      ...baseRow,
      telegram_chat_id: -1001234567890,
      telegram_chat_type: "supergroup",
      bound_at: null,
    })?.verificationState).toBe("manual");
  });

  it("rejects malformed or incomplete database rows", () => {
    expect(mapExternalTelegramChatRow(null)).toBeNull();
    expect(mapExternalTelegramChatRow({
      ...baseRow,
      url: "https://evil.example/group",
    })).toBeNull();
  });
});