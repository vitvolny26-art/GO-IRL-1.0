export type MessagingHealthSnapshot = {
  ok: boolean;
  workerEnabled: boolean;
  providers: string[];
  reminders: Record<string, number>;
  notifications: Record<string, number>;
  oldestDueAgeSeconds: number;
  checkedAt: string;
};

type AlertClaim = (alertKey: string, cooldownSeconds: number) => Promise<boolean>;

type OperatorAlertOptions = {
  botToken: string;
  chatId: string;
  claim: AlertClaim;
  fetchImpl?: typeof fetch;
  cooldownSeconds?: number;
};

const compactErrorCode = (value: string) =>
  value.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 72) || "unknown";

export const buildMessagingHealthAlert = (health: MessagingHealthSnapshot) => {
  if (health.ok) return null;
  const reasons = [
    !health.workerEnabled ? "worker выключен" : null,
    health.oldestDueAgeSeconds >= 300
      ? `очередь просрочена на ${health.oldestDueAgeSeconds} сек.`
      : null,
  ].filter(Boolean);
  return [
    "🚨 GO IRL: проблема доставки сообщений",
    `Причина: ${reasons.join("; ") || "health check failed"}`,
    `Каналы: ${health.providers.join(", ") || "нет"}`,
    `Напоминания failed: ${health.reminders.failed || 0}`,
    `События failed: ${health.notifications.failed || 0}`,
    `Проверено: ${health.checkedAt}`,
  ].join("\n");
};

export const sendClaimedTelegramAlert = async (
  alertKey: string,
  message: string,
  options: OperatorAlertOptions,
) => {
  const cooldownSeconds = Math.max(60, options.cooldownSeconds ?? 1_800);
  if (!await options.claim(compactErrorCode(alertKey), cooldownSeconds)) {
    return { sent: false, reason: "cooldown" as const };
  }
  const response = await (options.fetchImpl || fetch)(
    `https://api.telegram.org/bot${options.botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: options.chatId,
        text: message.slice(0, 4_000),
        disable_web_page_preview: true,
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`operator_alert_telegram_${response.status}`);
  }
  return { sent: true, reason: "sent" as const };
};

