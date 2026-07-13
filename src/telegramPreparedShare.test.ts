import { afterEach, describe, expect, it, vi } from "vitest";
import type { Activity } from "./types";
import { sharePreparedTelegramEvent } from "./telegramPreparedShare";

const activity: Activity = {
  id: "3b172dd9-d5e2-4328-86a4-d4107a6359fc",
  type: "sport",
  categoryId: "sport",
  activity: { ru: "🏐 Волейбол", uk: "Волейбол", cs: "Volejbal", en: "Volleyball" },
  title: { ru: "🏐 Игра вечером", uk: "Гра ввечері", cs: "Večerní hra", en: "Evening game" },
  description: { ru: "", uk: "", cs: "", en: "" },
  date: "2026-07-19",
  time: "16:30",
  cityId: "olomouc",
  address: "ZŠ Demlova",
  price: 0,
  capacity: 8,
  participants: 3,
  members: [],
  organizer: "Vit",
  organizerKey: "telegram:1",
  visibility: "public",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sharePreparedTelegramEvent", () => {
  it("skips the API outside a supported Telegram Mini App", async () => {
    vi.stubGlobal("window", { setTimeout, clearTimeout });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(sharePreparedTelegramEvent(activity, "ru", "https://t.me/GOirl_bot?startapp=3b172dd9-d5e2-4328-86a4-d4107a6359fc")).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requests and shares a prepared message", async () => {
    const shareMessage = vi.fn((_id: string, callback?: (success: boolean) => void) => callback?.(true));
    vi.stubGlobal("window", {
      setTimeout,
      clearTimeout,
      Telegram: { WebApp: { ready: vi.fn(), expand: vi.fn(), initData: "signed-init-data", shareMessage } },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ preparedMessageId: "prepared-123" }),
    }));

    await expect(sharePreparedTelegramEvent(activity, "ru", "https://t.me/GOirl_bot?startapp=3b172dd9-d5e2-4328-86a4-d4107a6359fc")).resolves.toBe(true);
    expect(shareMessage).toHaveBeenCalledWith("prepared-123", expect.any(Function));
  });
});
