import { buildMessengerSendTarget, buildMessengerShareBridgeTarget, type CardShareContent } from "./cardShare";
import { openExternal, openTelegramExternal } from "./openExternal";
import { installTelegramBeautyFileShareBridge } from "./telegramBeautyFileShareBridge";

installTelegramBeautyFileShareBridge();

export const openTelegramShareTarget = (url: string) => {
  openTelegramExternal(url);
};

export const openExternalShareTarget = (url: string) => {
  openExternal(url);
};

export const openMessengerShareTarget = (content: CardShareContent, userAgent = navigator.userAgent) => {
  if (/android|iphone|ipad|ipod/i.test(userAgent)) {
    openExternalShareTarget(buildMessengerShareBridgeTarget(content));
    return;
  }
  openExternalShareTarget(buildMessengerSendTarget(content));
};
