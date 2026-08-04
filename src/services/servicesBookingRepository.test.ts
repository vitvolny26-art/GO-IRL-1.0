import { beforeEach, describe, expect, it, vi } from "vitest";

const values = new Map<string, string>();
const storage = {
  clear: () => values.clear(),
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
};

Object.defineProperty(globalThis, "localStorage", { value: storage });
Object.defineProperty(globalThis, "window", {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    setTimeout: vi.fn(),
  },
});

vi.mock("../authSession", () => ({
  getCurrentDisplayName: () => "Test User",
  getCurrentUserKey: () => "test-user",
}));

vi.mock("../store", () => ({
  useAppStore: {
    getState: vi.fn(() => ({ activities: [], pendingIds: [], joinedIds: [] })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe("service booking contact preference", () => {
  beforeEach(() => localStorage.clear());

  it("preserves an explicit request to contact the client before confirmation", async () => {
    const { listServiceBookings, serviceBookingStorage } = await import("./servicesBookingRepository");
    localStorage.setItem(serviceBookingStorage.bookingsKey, JSON.stringify([{
      id: "booking-1",
      profileId: "profile-1",
      date: "2026-08-05",
      time: "10:30",
      contactBeforeConfirmation: true,
    }]));

    expect(listServiceBookings()[0]?.contactBeforeConfirmation).toBe(true);
  });

  it("defaults older stored bookings to no pre-confirmation contact request", async () => {
    const { listServiceBookings, serviceBookingStorage } = await import("./servicesBookingRepository");
    localStorage.setItem(serviceBookingStorage.bookingsKey, JSON.stringify([{
      id: "booking-legacy",
      profileId: "profile-1",
      date: "2026-08-05",
      time: "12:00",
    }]));

    expect(listServiceBookings()[0]?.contactBeforeConfirmation).toBe(false);
  });
});
