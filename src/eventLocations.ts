export type SavedEventLocation = {
  address: string;
  locationUrl: string;
  uses: number;
  lastUsedAt: string;
};

const storageKey = "go-irl-event-locations";

export const buildEventLocationUrl = (address: string, city: string) => {
  const cleanAddress = address.trim();
  const cleanCity = city.trim();
  const addressIncludesCity = cleanCity && cleanAddress.toLocaleLowerCase().includes(cleanCity.toLocaleLowerCase());
  const query = [cleanAddress, addressIncludesCity ? "" : cleanCity].filter(Boolean).join(", ");
  return query ? `https://mapy.cz/zakladni?q=${encodeURIComponent(query)}` : "";
};

export const parseSavedEventLocations = (raw: string | null): SavedEventLocation[] => {
  if (!raw) return [];
  try {
    const values = JSON.parse(raw) as Partial<SavedEventLocation>[];
    if (!Array.isArray(values)) return [];
    return values
      .filter((value) => typeof value.address === "string" && Boolean(value.address.trim()))
      .map((value) => ({
        address: String(value.address).trim(),
        locationUrl: typeof value.locationUrl === "string" ? value.locationUrl : "",
        uses: Math.max(1, Number(value.uses) || 1),
        lastUsedAt: typeof value.lastUsedAt === "string" ? value.lastUsedAt : "",
      }))
      .sort((a, b) => b.uses - a.uses || b.lastUsedAt.localeCompare(a.lastUsedAt))
      .slice(0, 8);
  } catch {
    return [];
  }
};

export const loadSavedEventLocations = () =>
  typeof localStorage === "undefined" ? [] : parseSavedEventLocations(localStorage.getItem(storageKey));

export const rememberEventLocation = (address: string, locationUrl: string, now = new Date().toISOString()) => {
  if (typeof localStorage === "undefined" || !address.trim()) return [];
  const normalized = address.trim();
  const existing = loadSavedEventLocations();
  const previous = existing.find((item) => item.address.toLocaleLowerCase() === normalized.toLocaleLowerCase());
  const next = [
    {
      address: normalized,
      locationUrl: locationUrl.trim(),
      uses: (previous?.uses || 0) + 1,
      lastUsedAt: now,
    },
    ...existing.filter((item) => item !== previous),
  ].sort((a, b) => b.uses - a.uses || b.lastUsedAt.localeCompare(a.lastUsedAt)).slice(0, 8);
  localStorage.setItem(storageKey, JSON.stringify(next));
  return next;
};
