import { getTelegramWebApp } from "./telegram";

type TelegramOpenLinkOptions = {
  try_instant_view?: boolean;
};

type OpenTelegramExternalOptions = {
  fallbackToOpenLink?: boolean;
  openLinkOptions?: TelegramOpenLinkOptions;
};

const openBrowserWindow = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export const openExternal = (url: string, openLinkOptions?: TelegramOpenLinkOptions) => {
  const webApp = getTelegramWebApp();

  if (webApp?.openLink) {
    if (openLinkOptions) {
      webApp.openLink(url, openLinkOptions);
    } else {
      webApp.openLink(url);
    }
    return;
  }

  openBrowserWindow(url);
};

export const openTelegramExternal = (url: string, options: OpenTelegramExternalOptions = {}) => {
  const webApp = getTelegramWebApp();

  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
    return;
  }

  if (options.fallbackToOpenLink && webApp?.openLink) {
    if (options.openLinkOptions) {
      webApp.openLink(url, options.openLinkOptions);
    } else {
      webApp.openLink(url);
    }
    return;
  }

  openBrowserWindow(url);
};
