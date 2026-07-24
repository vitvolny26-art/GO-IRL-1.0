import { buildMapyLocationUrl, parseMapPointFromUrl } from "./eventLocationMap";
import { normalizeMapyUrl } from "./mapyRuntimeLinks";
import type { Activity } from "./types";

export type EventMapProvider = "mapy" | "google" | "apple";

const preferredProviderStorageKey = "go-irl-event-map-provider-v1";
const providers: EventMapProvider[] = ["mapy", "google", "apple"];

const eventQuery = (activity: Activity, cityName: string) =>
  [activity.address.trim(), cityName.trim()].filter(Boolean).join(", ");

export const buildEventMapProviderUrl = (
  activity: Activity,
  cityName: string,
  provider: EventMapProvider,
) => {
  const sourceUrl = activity.locationUrl?.trim() || "";
  const point = sourceUrl ? parseMapPointFromUrl(sourceUrl) : null;
  const query = eventQuery(activity, cityName);

  if (provider === "mapy") {
    if (point) return buildMapyLocationUrl(point, 17);
    if (sourceUrl) {
      const normalized = normalizeMapyUrl(sourceUrl);
      if (normalized !== sourceUrl || /mapy\.(?:com|cz)/i.test(normalized)) return normalized;
    }
    return `https://mapy.com/zakladni?q=${encodeURIComponent(query)}`;
  }

  if (provider === "google") {
    const target = point ? `${point.lat},${point.lng}` : query;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`;
  }

  const apple = new URL("https://maps.apple.com/");
  apple.searchParams.set("q", query || "GO IRL event");
  if (point) apple.searchParams.set("ll", `${point.lat},${point.lng}`);
  return apple.toString();
};

export const buildEventMapEmbedUrl = (activity: Activity) => {
  const point = activity.locationUrl ? parseMapPointFromUrl(activity.locationUrl) : null;
  if (!point) return null;
  const latitudeDelta = 0.0045;
  const longitudeDelta = 0.0075;
  const bbox = [
    point.lng - longitudeDelta,
    point.lat - latitudeDelta,
    point.lng + longitudeDelta,
    point.lat + latitudeDelta,
  ].join(",");
  const url = new URL("https://www.openstreetmap.org/export/embed.html");
  url.searchParams.set("bbox", bbox);
  url.searchParams.set("layer", "mapnik");
  url.searchParams.set("marker", `${point.lat},${point.lng}`);
  return url.toString();
};

export const loadPreferredEventMapProvider = (
  storage: Pick<Storage, "getItem"> | null = typeof window === "undefined" ? null : window.localStorage,
): EventMapProvider => {
  const value = storage?.getItem(preferredProviderStorageKey) as EventMapProvider | null;
  return value && providers.includes(value) ? value : "mapy";
};

export const savePreferredEventMapProvider = (
  provider: EventMapProvider,
  storage: Pick<Storage, "setItem"> | null = typeof window === "undefined" ? null : window.localStorage,
) => {
  storage?.setItem(preferredProviderStorageKey, provider);
};
