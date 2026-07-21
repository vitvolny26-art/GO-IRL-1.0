import { getTelegramWebApp } from "./telegram";
import { buildMessengerSendTarget, type CardShareContent } from "./cardShare";

export const openTelegramShareTarget = (url: string) => {
  const webApp = getTelegramWebApp();
  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
};

export const openExternalShareTarget = (url: string) => {
  const webApp = getTelegramWebApp();
  if (webApp?.openLink) {
    webApp.openLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
};

export const openMessengerShareTarget = (content: CardShareContent) => {
  openExternalShareTarget(buildMessengerSendTarget(content));
};
