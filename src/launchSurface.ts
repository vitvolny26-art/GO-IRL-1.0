import { parseBeautyStartParam } from "./beauty/beautyPublicSlug";
import { consumeLaunchSurfaceRequest } from "./launchNavigation";

export type LaunchSurface = "launch" | "app";

type LaunchLocation = {
  pathname: string;
  hash: string;
  search: string;
  telegramStartParam?: string;
};

export const resolveLaunchSurface = ({
  pathname,
  hash,
  search,
  telegramStartParam,
}: LaunchLocation): LaunchSurface => {
  const normalizedPath = pathname.replace(/\/+$/, "");
  const startParam = telegramStartParam || new URLSearchParams(search).get("startapp") || "";
  const beautySlug = parseBeautyStartParam(startParam);
  if (beautySlug) {
    if (typeof window !== "undefined" && normalizedPath !== "/services") {
      const target = new URL("/services", window.location.origin);
      target.searchParams.set("beauty", beautySlug);
      window.history.replaceState(null, "", `${target.pathname}${target.search}`);
    }
    return "app";
  }
  if (normalizedPath !== "") return "app";
  if (consumeLaunchSurfaceRequest()) return "launch";
  if (startParam) return "app";
  if (hash === "#activities" || hash === "#services") return "app";
  return "launch";
};
