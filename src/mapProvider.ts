import { buildMapyLocationUrl, parseMapPointFromUrl } from "./eventLocationMap";
import type { MapProvider } from "./userPreferences";

const readQuery = (sourceUrl: string) => {
  try {
    const url = new URL(sourceUrl, "https://go-irl.invalid");
    return url.searchParams.get("query")
      || url.searchParams.get("q")
      || url.searchParams.get("query_place_id")
      || "";
  } catch {
    return "";
  }
};

const markResolvedProvider = (value: string, provider: MapProvider) => {
  const url = new URL(value);
  url.searchParams.set("go_irl_provider", provider);
  return url.toString();
};

export const buildMapProviderUrl = (sourceUrl: string, provider: MapProvider) => {
  const source = sourceUrl.trim();
  const point = parseMapPointFromUrl(source);
  const query = readQuery(source) || source;

  if (provider === "mapy") {
    const target = point
      ? buildMapyLocationUrl(point, 17)
      : `https://mapy.com/zakladni?q=${encodeURIComponent(query)}`;
    return markResolvedProvider(target, provider);
  }

  if (provider === "google") {
    const target = point ? `${point.latitude},${point.longitude}` : query;
    const url = new URL("https://www.google.com/maps/search/");
    url.searchParams.set("api", "1");
    url.searchParams.set("query", target);
    url.searchParams.set("go_irl_provider", "google");
    return url.toString();
  }

  const url = new URL("https://maps.apple.com/");
  url.searchParams.set("q", query || "GO IRL event");
  if (point) url.searchParams.set("ll", `${point.latitude},${point.longitude}`);
  url.searchParams.set("go_irl_provider", "apple");
  return url.toString();
};

export const isMapUrl = (value: string) => {
  try {
    const hostname = new URL(value, "https://go-irl.invalid").hostname.toLowerCase();
    return hostname === "openstreetmap.org"
      || hostname === "www.openstreetmap.org"
      || hostname === "google.com"
      || hostname === "www.google.com"
      || hostname === "maps.google.com"
      || hostname === "mapy.cz"
      || hostname === "www.mapy.cz"
      || hostname === "mapy.com"
      || hostname === "www.mapy.com"
      || hostname === "maps.apple.com";
  } catch {
    return false;
  }
};

export const isResolvedMapProviderUrl = (value: string) => {
  try {
    return Boolean(new URL(value, "https://go-irl.invalid").searchParams.get("go_irl_provider"));
  } catch {
    return false;
  }
};
