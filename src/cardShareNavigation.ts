import { getTelegramWebApp } from "./telegram";
import { buildMessengerShareBridgeTarget, type CardShareContent } from "./cardShare";

const eventIdPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

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
  const eventId = content.url.match(eventIdPattern)?.[0];
  if (!eventId) return buildMessengerShareBridgeTarget(content);
  const target = new URL("/api/messenger/share", window.location.origin);
  target.searchParams.set("event", eventId);
  return target.toString();
};

export const openMessengerShareTarget = (content: CardShareContent) => {
  openExternalShareTarget(buildMessengerEventShareTarget(content));
};
