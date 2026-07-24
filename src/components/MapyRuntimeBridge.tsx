import { useEffect } from "react";
import { normalizeMapUrlForMapy } from "../eventLocationMap";
import { getTelegramWebApp } from "../telegram";

const mapHostPattern = /(openstreetmap\.org|google\.[^/]+\/maps|mapy\.(cz|com))/i;

const normalizeMapAnchors = () => {
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    if (!mapHostPattern.test(anchor.href)) return;
    const normalized = normalizeMapUrlForMapy(anchor.href);
    if (normalized) anchor.href = normalized;
    if (/google maps/i.test(anchor.textContent || "")) {
      anchor.textContent = (anchor.textContent || "").replace(/google maps/gi, "Mapy.com");
    }
  });
};

export function MapyRuntimeBridge() {
  useEffect(() => {
    normalizeMapAnchors();
    const observer = new MutationObserver(normalizeMapAnchors);
    observer.observe(document.body, { childList: true, subtree: true });

    const originalOpen = window.open.bind(window);
    window.open = ((url?: string | URL, target?: string, features?: string) => {
      const value = typeof url === "string" ? url : url?.toString() || "";
      const normalized = mapHostPattern.test(value) ? normalizeMapUrlForMapy(value) : value;
      const webApp = getTelegramWebApp();
      if (normalized && normalized.includes("mapy.com") && webApp?.openLink) {
        webApp.openLink(normalized, { try_instant_view: false });
        return null;
      }
      return originalOpen(normalized || url, target, features);
    }) as typeof window.open;

    return () => {
      observer.disconnect();
      window.open = originalOpen;
    };
  }, []);

  return null;
}
