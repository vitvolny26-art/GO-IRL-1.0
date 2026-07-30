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
  if (normalizedPath !== "") return "app";
  if (telegramStartParam || new URLSearchParams(search).has("startapp")) return "app";
  if (hash === "#activities" || hash === "#services") return "app";
  return "launch";
};

