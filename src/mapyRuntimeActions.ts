import { buildMapyLocationUrl, parseMapPointFromUrl } from "./eventLocationMap";
import { getTelegramWebApp } from "./telegram";

const mapyLabelPattern = /Открыть в Google Maps|Open in Google Maps|Відкрити в Google Maps|Otevřít v Google Maps/gi;

const mapSearchUrl = (query: string) =>
  query.trim() ? `https://mapy.com/zakladni?q=${encodeURIComponent(query.trim())}` : "";

export const isMapLocationUrl = (value: string) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "mapy.com"
      || host.endsWith(".mapy.com")
      || host === "mapy.cz"
      || host.endsWith(".mapy.cz")
      || host === "www.openstreetmap.org"
      || host === "openstreetmap.org"
      || host === "www.google.com"
      || host === "google.com"
      || host === "maps.google.com";
  } catch {
    return false;
  }
};

export const resolveMapyRuntimeUrl = (value: string) => {
  const raw = value.trim();
  if (!raw) return raw;

  const point = parseMapPointFromUrl(raw);
  if (point) return buildMapyLocationUrl(point, 17);

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();

    if (host === "mapy.com" || host.endsWith(".mapy.com")) return raw;

    if (host === "mapy.cz" || host.endsWith(".mapy.cz")) {
      url.protocol = "https:";
      url.hostname = "mapy.com";
      return url.toString();
    }

    if (host === "google.com" || host === "www.google.com" || host === "maps.google.com") {
      const query = url.searchParams.get("query") || url.searchParams.get("q") || "";
      return mapSearchUrl(query) || raw;
    }
  } catch {
    return raw;
  }

  return raw;
};

const normalizeMapAnchor = (anchor: HTMLAnchorElement) => {
  const href = anchor.href;
  if (isMapLocationUrl(href)) anchor.href = resolveMapyRuntimeUrl(href);
  if (anchor.textContent && mapyLabelPattern.test(anchor.textContent)) {
    anchor.textContent = anchor.textContent.replace(mapyLabelPattern, "Открыть в Mapy.com");
  }
  mapyLabelPattern.lastIndex = 0;
};

export const enableMapyRuntimeActions = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const runtimeWindow = window as typeof window & { __goIrlMapyRuntimeEnabled?: boolean };
  if (runtimeWindow.__goIrlMapyRuntimeEnabled) return;
  runtimeWindow.__goIrlMapyRuntimeEnabled = true;

  const originalOpen = window.open.bind(window);
  window.open = ((url?: string | URL, target?: string, features?: string) => {
    const raw = typeof url === "string" ? url : url?.toString() || "";
    const next = isMapLocationUrl(raw) ? resolveMapyRuntimeUrl(raw) : raw;
    if (isMapLocationUrl(next)) {
      const webApp = getTelegramWebApp();
      if (webApp?.openLink) {
        webApp.openLink(next, { try_instant_view: false });
        return null;
      }
    }
    return originalOpen(next, target, features);
  }) as typeof window.open;

  const normalizeAnchors = (root: ParentNode) => {
    root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(normalizeMapAnchor);
  };

  normalizeAnchors(document);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node instanceof HTMLAnchorElement) normalizeMapAnchor(node);
        normalizeAnchors(node);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!anchor || !isMapLocationUrl(anchor.href)) return;
    const next = resolveMapyRuntimeUrl(anchor.href);
    anchor.href = next;
    const webApp = getTelegramWebApp();
    if (!webApp?.openLink) return;
    event.preventDefault();
    webApp.openLink(next, { try_instant_view: false });
  }, true);
};
