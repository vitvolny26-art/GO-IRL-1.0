import { buildMapyLocationUrl, buildMapySearchUrl, parseMapPointFromUrl } from "./eventLocationMap";
import { getTelegramWebApp } from "./telegram";

const googleMapsHosts = new Set(["google.com", "www.google.com", "maps.google.com"]);

export const normalizeMapUrl = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return raw;

  const point = parseMapPointFromUrl(raw);
  if (point) return buildMapyLocationUrl(point, 17);

  try {
    const origin = typeof window === "undefined" ? "https://go-irl.app" : window.location.origin;
    const url = new URL(raw, origin);
    const host = url.hostname.toLowerCase();

    if (host === "mapy.cz" || host === "www.mapy.cz") {
      url.hostname = "mapy.com";
      return url.toString();
    }

    if (googleMapsHosts.has(host) && url.pathname.includes("/maps")) {
      const query = url.searchParams.get("query") || url.searchParams.get("q") || "";
      return buildMapySearchUrl(query) || "https://mapy.com/zakladni";
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

    if (typeof normalized === "string" && normalized.includes("mapy.com")) {
      const webApp = getTelegramWebApp();
      if (webApp?.openLink) {
        webApp.openLink(normalized, { try_instant_view: false });
        return null;
      }
    }

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
    if (!anchor) return;
    updateMapAnchor(anchor);
    if (!anchor.href.includes("mapy.com")) return;

    const webApp = getTelegramWebApp();
    if (!webApp?.openLink) return;
    event.preventDefault();
    event.stopPropagation();
    webApp.openLink(anchor.href, { try_instant_view: false });
  }, true);
};
