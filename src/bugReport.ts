import { getTelegramWebApp } from "./telegram";

const bugReportUrl = "https://t.me/GOirl_bot";

export const openBugReport = () => {
  const webApp = getTelegramWebApp();

  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(bugReportUrl);
    return;
  }

  if (webApp?.openLink) {
    webApp.openLink(bugReportUrl, { try_instant_view: false });
    return;
  }

  window.open(bugReportUrl, "_blank", "noopener,noreferrer");
};
