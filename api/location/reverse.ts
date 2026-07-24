import { createVercelHandler } from "../_shared/vercel-handler.js";

const allowedLanguages = new Set(["ru", "uk", "cs", "en"]);
const cache = new Map<string, { expiresAt: number; address: string }>();
const cacheTtlMs = 24 * 60 * 60_000;

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": status === 200 ? "public, max-age=3600, s-maxage=86400" : "no-store",
  },
});

const validCoordinate = (value: string | null, min: number, max: number) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
};

const compactAddress = (payload: {
  display_name?: string;
  name?: string;
  address?: Record<string, string | undefined>;
}) => {
  const address = payload.address || {};
  const place = payload.name
    || address.amenity
    || address.building
    || address.leisure
    || address.shop
    || address.road
    || address.pedestrian
    || address.footway;
  const house = address.house_number;
  const city = address.city || address.town || address.village || address.municipality;
  const parts = [place && house ? `${place} ${house}` : place || house, city]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  return parts.length ? [...new Set(parts)].join(", ") : String(payload.display_name || "").trim();
};

export async function handleLocationReverse(request: Request) {
  if (request.method !== "GET") {
    return new Response(null, { status: 405, headers: { Allow: "GET" } });
  }

  const url = new URL(request.url);
  const latitude = validCoordinate(url.searchParams.get("lat"), -90, 90);
  const longitude = validCoordinate(url.searchParams.get("lon"), -180, 180);
  const languageInput = String(url.searchParams.get("language") || "en").toLowerCase();
  const language = allowedLanguages.has(languageInput) ? languageInput : "en";
  if (latitude === null || longitude === null) {
    return json(400, { error: "invalid_coordinates" });
  }

  const key = `${latitude.toFixed(5)}|${longitude.toFixed(5)}|${language}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return json(200, { address: cached.address });

  const endpoint = new URL("https://nominatim.openstreetmap.org/reverse");
  endpoint.searchParams.set("format", "jsonv2");
  endpoint.searchParams.set("lat", String(latitude));
  endpoint.searchParams.set("lon", String(longitude));
  endpoint.searchParams.set("zoom", "18");
  endpoint.searchParams.set("addressdetails", "1");
  endpoint.searchParams.set("accept-language", language);

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "Accept-Language": language,
        "User-Agent": "GO-IRL/1.0 location-picker (https://go-irl-1-0.vercel.app)",
      },
    });
    if (!response.ok) return json(502, { error: `reverse_geocode_${response.status}` });
    const payload = await response.json() as {
      display_name?: string;
      name?: string;
      address?: Record<string, string | undefined>;
    };
    const address = compactAddress(payload);
    if (!address) return json(404, { error: "address_not_found" });
    cache.set(key, { address, expiresAt: Date.now() + cacheTtlMs });
    return json(200, { address });
  } catch {
    return json(502, { error: "reverse_geocode_failed" });
  }
}

export default createVercelHandler(handleLocationReverse);
