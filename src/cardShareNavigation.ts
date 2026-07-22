import { getTelegramWebApp } from "./telegram";
import {
  buildMessengerAndroidIntentTarget,
  buildMessengerAppTarget,
  buildMessengerSendTarget,
  type CardShareContent,
} from "./cardShare";

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

const navigateToMessengerApp = (target: string) => {
  window.location.href = target;
};

export const openMessengerShareTarget = (content: CardShareContent, userAgent = navigator.userAgent) => {
  if (/android/i.test(userAgent)) {
    navigateToMessengerApp(buildMessengerAndroidIntentTarget(content));
    return;
  }
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    navigateToMessengerApp(buildMessengerAppTarget(content));
    return;
  }
  openExternalShareTarget(buildMessengerSendTarget(content));
};
