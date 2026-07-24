import { buildMapyLocationUrl, parseMapPointFromUrl } from "./eventLocationMap";

const mapHosts = new Set([
  "www.openstreetmap.org",
  "openstreetmap.org",
  "www.google.com",
  "google.com",
  "maps.google.com",
  "mapy.cz",
  "www.mapy.cz",
  "mapy.com",
  "www.mapy.com",
]);

const readZoom = (url: URL) => {
  const queryZoomValue = url.searchParams.get("zoom");
  if (queryZoomValue !== null) {
    const queryZoom = Number(queryZoomValue);
    if (Number.isFinite(queryZoom)) return queryZoom;
  }
  const hashZoomValue = url.hash.match(/#map=(\d+)/)?.[1];
  if (hashZoomValue !== undefined) {
    const hashZoom = Number(hashZoomValue);
    if (Number.isFinite(hashZoom)) return hashZoom;
  }
  return 17;
};

export const normalizeMapyUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  try {
    const url = new URL(trimmed, "https://go-irl.invalid");
    const explicitProvider = url.searchParams.get("go_irl_provider");
    if (explicitProvider === "google" || explicitProvider === "apple") {
      url.searchParams.delete("go_irl_provider");
      return url.toString();
    }
    if (!mapHosts.has(url.hostname.toLowerCase())) return trimmed;

    const point = parseMapPointFromUrl(url.toString());
    if (point) return buildMapyLocationUrl(point, readZoom(url));

    const query = url.searchParams.get("query")
      || url.searchParams.get("q")
      || url.searchParams.get("query_place_id")
      || "";
    if (query.trim()) {
      return `https://mapy.com/zakladni?q=${encodeURIComponent(query.trim())}`;
    }

    if (url.hostname.toLowerCase().endsWith("mapy.cz")) {
      url.hostname = url.hostname.toLowerCase().startsWith("www.") ? "www.mapy.com" : "mapy.com";
      return url.toString();
    }

    return trimmed;
  } catch {
    return trimmed;
  }
};

const replaceVisibleMapLabels = (root: ParentNode = document) => {
  root.querySelectorAll<HTMLElement>("a, button").forEach((element) => {
    if (element.closest("[data-map-provider-choice]")) return;
    if (/google maps/i.test(element.textContent || "")) {
      element.textContent = (element.textContent || "").replace(/google maps/gi, "Mapy.com");
    }
  });
};

export const enableMapyRuntimeLinks = () => {
  const nativeOpen = window.open.bind(window);
  window.open = ((url?: string | URL, target?: string, features?: string) => {
    const nextUrl = typeof url === "string" ? normalizeMapyUrl(url) : url;
    return nativeOpen(nextUrl, target, features);
  }) as typeof window.open;

  const handleClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(target instanceof HTMLAnchorElement)) return;
    const normalized = normalizeMapyUrl(target.href);
    if (normalized !== target.href) target.href = normalized;
  };

  replaceVisibleMapLabels();
  document.addEventListener("click", handleClick, true);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          replaceVisibleMapLabels(node);
          if (
            !node.closest("[data-map-provider-choice]")
            && node.matches("a, button")
            && /google maps/i.test(node.textContent || "")
          ) {
            node.textContent = (node.textContent || "").replace(/google maps/gi, "Mapy.com");
          }
        }
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    window.open = nativeOpen;
    document.removeEventListener("click", handleClick, true);
    observer.disconnect();
  };
};
