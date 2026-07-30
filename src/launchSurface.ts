export type LaunchSurface = "launch" | "activities" | "services";

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
  if (pathname.replace(/\/+$/, "") !== "") return "activities";
  if (telegramStartParam || new URLSearchParams(search).has("startapp")) return "activities";
  if (hash === "#activities") return "activities";
  if (hash === "#services") return "services";
  return "launch";
};

