import { buildMapyLocationUrl, parseMapPointFromUrl } from "./eventLocationMap";

const googleMapsHosts = new Set(["google.com", "www.google.com", "maps.google.com"]);

const mapySearchUrl = (query: string) =>
  query.trim() ? `https://mapy.com/zakladni?q=${encodeURIComponent(query.trim())}` : "https://mapy.com/zakladni";

export const normalizeMapUrl = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return raw;

  const point = parseMapPointFromUrl(raw);
  if (point) return buildMapyLocationUrl(point, 17);

  try {
    const url = new URL(raw, window.location.origin);
    const host = url.hostname.toLowerCase();

    if (host === "mapy.cz" || host === "www.mapy.cz") {
      url.hostname = "mapy.com";
      return url.toString();
    }

    if (googleMapsHosts.has(host) && url.pathname.includes("/maps")) {
      const query = url.searchParams.get("query") || url.searchParams.get("q") || "";
      return mapySearchUrl(query);
    }
  } catch {
    return raw;
  }

  return raw;
};

const updateMapAnchor = (anchor: HTMLAnchorElement) => {
  const original = anchor.getAttribute("href") || "";
  const normalized = normalizeMapUrl(original);
  if (normalized && normalized !== original) anchor.href = normalized;

  if (/google maps/i.test(anchor.textContent || "")) {
    anchor.textContent = (anchor.textContent || "").replace(/google maps/gi, "Mapy.com");
  }
};

export const enableMapyRuntimeActions = () => {
  const nativeOpen = window.open.bind(window);
  window.open = ((url?: string | URL, target?: string, features?: string) => {
    const normalized = typeof url === "string" || url instanceof URL
      ? normalizeMapUrl(String(url))
      : url;
    return nativeOpen(normalized, target, features);
  }) as typeof window.open;

  const refresh = () => {
    document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(updateMapAnchor);
  };

  refresh();
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });

  document.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (anchor) updateMapAnchor(anchor);
  }, true);
};
