import { getTelegramWebApp } from "./telegram";
import { buildMessengerAndroidIntentTarget, buildMessengerAppTarget, buildMessengerSendTarget, type CardShareContent } from "./cardShare";

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

export const openMessengerShareTarget = (content: CardShareContent, userAgent = navigator.userAgent) => {
  if (/android/i.test(userAgent)) {
    window.location.assign(buildMessengerAndroidIntentTarget(content));
    return;
  }
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    window.location.assign(buildMessengerAppTarget(content));
    return;
  }
  openExternalShareTarget(buildMessengerSendTarget(content));
};
