import type { MapProvider } from "./userPreferences";

export const mapProviderPickerEvent = "go-irl-map-provider-picker";

export type MapProviderPickerRequest = {
  sourceUrl: string;
};

export const requestMapProvider = (sourceUrl: string) => {
  const normalized = sourceUrl.trim();
  if (!normalized) return;
  window.dispatchEvent(new CustomEvent<MapProviderPickerRequest>(mapProviderPickerEvent, {
    detail: { sourceUrl: normalized },
  }));
};

export const resolveDeviceMapProvider = (
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
  platform = typeof navigator === "undefined" ? "" : navigator.platform,
): MapProvider => /iPhone|iPad|iPod|Macintosh|MacIntel/i.test(`${userAgent} ${platform}`) ? "apple" : "google";

export const mapProviderOptions: Array<{ id: MapProvider; label: string }> = [
  { id: "mapy", label: "Mapy.com" },
  { id: "google", label: "Google Maps" },
  { id: "apple", label: "Apple Maps" },
];
