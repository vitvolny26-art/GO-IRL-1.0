import { getTelegramWebApp } from "./telegram";
import { buildMessengerReferralTarget, type CardShareContent } from "./cardShare";

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

export const buildMessengerEventShareTarget = (content: CardShareContent) => {
  const origin = typeof window === "undefined" ? undefined : window.location.origin;
  return buildMessengerReferralTarget(content, origin);
};

export const openMessengerShareTarget = (content: CardShareContent) => {
  openExternalShareTarget(buildMessengerEventShareTarget(content));
};
