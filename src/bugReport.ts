import { getTelegramWebApp } from "./telegram";

const telegramBotUsername = String(import.meta.env.VITE_GO_IRL_BOT_USERNAME || "GOirl_bot").replace(/^@/, "");
const bugReportUrl = `https://t.me/${telegramBotUsername}?start=bug_report`;

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
