import { describe, expect, it } from "vitest";
import { mapExternalTelegramChatRow } from "./externalTelegramChatRepository";

describe("shared external Telegram chat repository", () => {
  it("maps a validated database row to the event chat contract", () => {
    expect(mapExternalTelegramChatRow({
      activity_id: "11111111-1111-1111-1111-111111111111",
      url: "https://telegram.me/example_group/",
      attached_by_user_key: "telegram:42",
      keep_archive: true,
      created_at: "2026-07-27T10:00:00.000Z",
      updated_at: "2026-07-27T10:00:00.000Z",
    })).toEqual({
      kind: "event",
      url: "https://t.me/example_group",
      attachedByUserKey: "telegram:42",
      attachedAt: "2026-07-27T10:00:00.000Z",
      keepArchive: true,
    });
  });

  it("rejects malformed or incomplete database rows", () => {
    expect(mapExternalTelegramChatRow(null)).toBeNull();
    expect(mapExternalTelegramChatRow({
      activity_id: "11111111-1111-1111-1111-111111111111",
      url: "https://evil.example/group",
      attached_by_user_key: "telegram:42",
      keep_archive: false,
      created_at: "2026-07-27T10:00:00.000Z",
      updated_at: "2026-07-27T10:00:00.000Z",
    })).toBeNull();
  });
});
