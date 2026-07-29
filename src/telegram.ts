declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close?: () => void;
        initData?: string;
        initDataUnsafe?: {
          start_param?: string;
          user?: { id?: number; first_name?: string; last_name?: string; username?: string };
        };
        BackButton?: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        MainButton?: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        HapticFeedback?: { impactOccurred: (style: string) => void; notificationOccurred: (type: string) => void };
        openTelegramLink?: (url: string) => void;
        openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
        shareMessage?: (preparedMessageId: string, callback?: (success: boolean) => void) => void;
      };
    };
  }
}

export const getTelegramWebApp = () =>
  typeof window === "undefined" ? undefined : window.Telegram?.WebApp;

export const isTelegramWebApp = () => Boolean(getTelegramWebApp()?.initDataUnsafe);

export const getTelegramInitData = () => getTelegramWebApp()?.initData || "";

export const readyMiniApp = () => getTelegramWebApp()?.ready();

export const expandMiniApp = () => getTelegramWebApp()?.expand();

export const closeMiniApp = () => {
  const webApp = getTelegramWebApp();
  if (!webApp?.close) return false;
  webApp.close();
  return true;
};

type BackButtonHandler = () => void;

const backButtonHandlers: BackButtonHandler[] = [];
let backButtonDispatcherAttached = false;

const dispatchBackButton = () => {
  backButtonHandlers.at(-1)?.();
};

const syncBackButton = () => {
  const backButton = getTelegramWebApp()?.BackButton;
  if (!backButton) return;

  if (backButtonHandlers.length === 0) {
    if (backButtonDispatcherAttached) {
      backButton.offClick(dispatchBackButton);
      backButtonDispatcherAttached = false;
    }
    backButton.hide();
    return;
  }

  if (!backButtonDispatcherAttached) {
    backButton.onClick(dispatchBackButton);
    backButtonDispatcherAttached = true;
  }
  backButton.show();
};

export const showBackButton = (onClick: () => void) => {
  backButtonHandlers.push(onClick);
  syncBackButton();

  return () => {
    const index = backButtonHandlers.lastIndexOf(onClick);
    if (index >= 0) backButtonHandlers.splice(index, 1);
    syncBackButton();
  };
};

export const hideBackButton = () => getTelegramWebApp()?.BackButton?.hide();

export const notifyTelegram = (type: "success" | "warning" | "error") =>
  getTelegramWebApp()?.HapticFeedback?.notificationOccurred(type);

export const impactTelegram = (style: string) =>
  getTelegramWebApp()?.HapticFeedback?.impactOccurred(style);
