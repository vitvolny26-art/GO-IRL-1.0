const eventUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidInvitationEventId = (value: string) => eventUuidPattern.test(value.trim());

export const parseInvitationStartParam = (value: string | null | undefined) => {
  const eventId = String(value || "").trim();
  return isValidInvitationEventId(eventId)
    ? { valid: true as const, eventId }
    : { valid: false as const, eventId: "" };
};

export const buildTelegramActivityInviteUrl = (
  eventId: string,
  botUsername: string,
  appName = "",
) => {
  const parsed = parseInvitationStartParam(eventId);
  if (!parsed.valid) return null;
  const bot = botUsername.trim().replace(/^@/, "");
  if (!bot) return null;
  const appPath = appName.trim().replace(/^\/+|\/+$/g, "");
  const path = appPath ? `/${appPath}` : "";
  return `https://t.me/${bot}${path}?startapp=${parsed.eventId}`;
};

export const buildBrowserActivityInviteUrl = (eventId: string, origin: string) =>
  new URL(`/join/${encodeURIComponent(eventId.trim())}`, origin).toString();

export const buildSeparatedInvitationText = (url: string, text: string) =>
  [url.trim(), text.trim()].filter(Boolean).join("\n\n");

export const buildTelegramShareUrl = (url: string, text: string) =>
  `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text.trim())}`;
