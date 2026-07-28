import { openTelegramExternal } from "./openExternal";

const telegramBotUsername = String(import.meta.env.VITE_GO_IRL_BOT_USERNAME || "GOirl_bot").replace(/^@/, "");
const bugReportUrl = `https://t.me/${telegramBotUsername}?start=bug_report`;

export const openBugReport = (...context: unknown[]) => {
  void context;
  openTelegramExternal(bugReportUrl, {
    fallbackToOpenLink: true,
    openLinkOptions: { try_instant_view: false },
  });
};
