import { describe, expect, it } from "vitest";
import { resolveDeviceMapProvider } from "./mapProviderPicker";

describe("device map provider", () => {
  it("uses Apple Maps on Apple devices", () => {
    expect(resolveDeviceMapProvider("Mozilla/5.0 (iPhone)", "iPhone")).toBe("apple");
    expect(resolveDeviceMapProvider("Mozilla/5.0 (Macintosh)", "MacIntel")).toBe("apple");
  });

  it("uses Google Maps on other devices", () => {
    expect(resolveDeviceMapProvider("Mozilla/5.0 (Linux; Android 15)", "Linux armv8l")).toBe("google");
    expect(resolveDeviceMapProvider("Mozilla/5.0 (Windows NT 10.0)", "Win32")).toBe("google");
  });
});
