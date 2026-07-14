import { getTelegramWebApp } from "./telegram";

export const openTelegramShareTarget = (url: string) => {
  const webApp = getTelegramWebApp();
  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
};
