import { beforeEach, describe, expect, it } from "vitest";
import { readEventReminder, removeEventReminder, saveEventReminder } from "./reminderPreferences";

const values = new Map<string, string>();
const storage = {
  clear: () => values.clear(),
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
};

Object.defineProperty(globalThis, "localStorage", { value: storage });
Object.defineProperty(globalThis, "window", { value: { dispatchEvent: () => true } });

describe("event reminder preferences", () => {
  beforeEach(() => localStorage.clear());

  it("saves one preference per event and replaces an earlier choice", () => {
    saveEventReminder({ activityId: "a1", channel: "telegram", leadMinutes: 60, eventStartsAt: "2026-07-22T18:00:00", updatedAt: "now" });
    saveEventReminder({ activityId: "a1", channel: "whatsapp", leadMinutes: 180, eventStartsAt: "2026-07-22T18:00:00", updatedAt: "later" });
    expect(readEventReminder("a1")).toMatchObject({ channel: "whatsapp", leadMinutes: 180 });
  });

  it("removes a preference without affecting another event", () => {
    saveEventReminder({ activityId: "a1", channel: "telegram", leadMinutes: 60, eventStartsAt: "2026-07-22T18:00:00", updatedAt: "now" });
    saveEventReminder({ activityId: "a2", channel: "messenger", leadMinutes: 15, eventStartsAt: "2026-07-22T19:00:00", updatedAt: "now" });
    removeEventReminder("a1");
    expect(readEventReminder("a1")).toBeNull();
    expect(readEventReminder("a2")?.channel).toBe("messenger");
  });
});
