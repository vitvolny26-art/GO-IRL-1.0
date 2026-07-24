import { buildMapyLocationUrl, parseMapPointFromUrl } from "./eventLocationMap";
import { getTelegramWebApp } from "./telegram";

const mapTextPattern = /Открыть в Google Maps|Open in Google Maps|Otevřít v Google Maps|Відкрити в Google Maps/g;

const mapZoomFromUrl = (value: string) => {
  try {
    const base = typeof window === "undefined" ? "https://go-irl.app" : window.location.origin;
    const url = new URL(value, base);
    const directZoom = Number(url.searchParams.get("zoom"));
    if (Number.isFinite(directZoom) && directZoom > 0) return directZoom;
    const hashZoom = Number(url.hash.match(/#map=(\d+)/)?.[1]);
    return Number.isFinite(hashZoom) && hashZoom > 0 ? hashZoom : 17;
  } catch {
    return 17;
  }
};

export const normalizeMapyUrl = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return raw;

  const point = parseMapPointFromUrl(raw);
  if (point) return buildMapyLocationUrl(point, mapZoomFromUrl(raw));

  try {
    const url = new URL(raw, typeof window === "undefined" ? "https://go-irl.app" : window.location.origin);
    const hostname = url.hostname.toLowerCase();

    if (hostname === "mapy.cz" || hostname.endsWith(".mapy.cz")) {
      url.hostname = hostname.replace(/mapy\.cz$/, "mapy.com");
      return url.toString();
    }

    if (hostname === "google.com" || hostname.endsWith(".google.com")) {
      if (url.pathname.includes("/maps")) {
        const query = url.searchParams.get("query") || url.searchParams.get("q");
        return query ? `https://mapy.com/zakladni?q=${encodeURIComponent(query)}` : raw;
      }
    }
  } catch {
    return raw;
  }

  return raw;
};

const updateLegacyMapAnchors = (root: ParentNode = document) => {
  root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    const normalized = normalizeMapyUrl(anchor.href);
    if (normalized && normalized !== anchor.href) anchor.href = normalized;
    const nextText = anchor.textContent?.replace(mapTextPattern, "Открыть в Mapy.com");
    if (nextText && nextText !== anchor.textContent) anchor.textContent = nextText;
  });
};

export const enableMapyRuntimeActions = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return () => undefined;

  const nativeOpen = window.open.bind(window);
  window.open = ((url?: string | URL, target?: string, features?: string) => {
    const normalized = normalizeMapyUrl(String(url || ""));
    const webApp = getTelegramWebApp();
    if (normalized.includes("mapy.com") && webApp?.openLink) {
      webApp.openLink(normalized, { try_instant_view: false });
      return null;
    }
    return nativeOpen(normalized || url, target, features);
  }) as typeof window.open;

  const handleClick = (event: MouseEvent) => {
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!anchor) return;
    const normalized = normalizeMapyUrl(anchor.href);
    if (!normalized.includes("mapy.com")) return;
    anchor.href = normalized;
    const webApp = getTelegramWebApp();
    if (!webApp?.openLink) return;
    event.preventDefault();
    webApp.openLink(normalized, { try_instant_view: false });
  };

  updateLegacyMapAnchors();
  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) updateLegacyMapAnchors(node);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("click", handleClick, true);

  return () => {
    observer.disconnect();
    document.removeEventListener("click", handleClick, true);
    window.open = nativeOpen;
  };
};
