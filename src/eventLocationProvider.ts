import { buildMapProviderUrl } from "./mapProvider";
import type { MapProvider } from "./userPreferences";

export const detectEventLocationProvider = (value: string): MapProvider | null => {
  try {
    const url = new URL(value);
    const marked = url.searchParams.get("go_irl_provider");
    if (marked === "google" || marked === "apple" || marked === "mapy") return marked;
    const hostname = url.hostname.toLowerCase();
    if (hostname === "maps.apple.com") return "apple";
    if (hostname.includes("google.")) return "google";
    if (hostname === "mapy.com" || hostname.endsWith(".mapy.com") || hostname === "mapy.cz" || hostname.endsWith(".mapy.cz")) return "mapy";
    return null;
  } catch {
    return null;
  }
};

export const resolveEventLocationProviderUrl = (sourceUrl: string, provider: MapProvider) =>
  buildMapProviderUrl(sourceUrl, provider);
