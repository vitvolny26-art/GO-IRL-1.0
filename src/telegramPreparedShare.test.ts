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
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ preparedMessageId: "prepared-123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(sharePreparedTelegramEvent(activity, "ru", "https://t.me/GOirl_bot?startapp=3b172dd9-d5e2-4328-86a4-d4107a6359fc")).resolves.toBe(true);
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(request.body));
    expect(body.card).toMatchObject({
      activity: "Волейбол",
      title: "Игра вечером",
      date: "19 июл",
      time: "16:30",
      city: "Оломоуц",
      mapUrl: "https://mapy.cz/zakladni?q=Z%C5%A0%20Demlova%2C%20%D0%9E%D0%BB%D0%BE%D0%BC%D0%BE%D1%83%D1%86",
      price: 0,
    });
    expect(shareMessage).toHaveBeenCalledWith("prepared-123", expect.any(Function));
  });
});
