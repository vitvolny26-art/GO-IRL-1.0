import { afterEach, describe, expect, it, vi } from "vitest";
import { consumeLaunchSurfaceRequest, requestLaunchSurface } from "./launchNavigation";

const values = new Map<string, string>();

const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
  removeItem: (key: string) => values.delete(key),
  clear: () => values.clear(),
  key: (index: number) => [...values.keys()][index] ?? null,
  get length() { return values.size; },
};

afterEach(() => {
  values.clear();
  vi.unstubAllGlobals();
});

describe("launch navigation", () => {
  it("stores and consumes a one-shot launch-page request", () => {
    vi.stubGlobal("sessionStorage", storage);
    requestLaunchSurface();
    expect(consumeLaunchSurfaceRequest()).toBe(true);
    expect(consumeLaunchSurfaceRequest()).toBe(false);
  });
});
