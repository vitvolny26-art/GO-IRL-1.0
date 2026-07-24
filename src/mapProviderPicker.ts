import type { MapProvider } from "./userPreferences";

export const mapProviderPickerEvent = "go-irl-map-provider-picker";

export type MapProviderPickerRequest = {
  sourceUrl: string;
};

export const requestMapProvider = (sourceUrl: string) => {
  window.dispatchEvent(new CustomEvent<MapProviderPickerRequest>(mapProviderPickerEvent, {
    detail: { sourceUrl },
  }));
};

export const mapProviderOptions: Array<{ id: MapProvider; label: string }> = [
  { id: "mapy", label: "Mapy.com" },
  { id: "google", label: "Google Maps" },
  { id: "apple", label: "Apple Maps" },
];
