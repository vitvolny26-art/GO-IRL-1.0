export type CardShareChannel = "telegram" | "whatsapp" | "messenger" | "instagram";

export type CardShareContent = {
  title: string;
  date: string;
  address: string;
  url: string;
};

const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fallbackOrigin = "https://go-irl-1-0.vercel.app";
export const metaAppId = "1332867179009910";

export const buildCardShareText = ({ title, date, address, url }: CardShareContent) =>
  [[`GO IRL: ${title}`, date, address].filter(Boolean).join("\n"), url].filter(Boolean).join("\n\n");

export const buildMessengerPreviewUrl = (content: CardShareContent) => {
  try {
    const inviteUrl = new URL(content.url);
    const eventId = inviteUrl.searchParams.get("startapp")?.trim() || "";
    if (!eventIdPattern.test(eventId)) return content.url;

    const previewUrl = new URL("/api/meta/event-preview", fallbackOrigin);
    previewUrl.searchParams.set("event", eventId);
    previewUrl.searchParams.set("language", "ru");
    return previewUrl.toString();
  } catch {
    return content.url;
  }
};

export const buildMessengerSendTarget = (content: CardShareContent) => {
  const dialogUrl = new URL("https://www.facebook.com/dialog/send");
  dialogUrl.searchParams.set("app_id", metaAppId);
  dialogUrl.searchParams.set("link", buildMessengerPreviewUrl(content));
  dialogUrl.searchParams.set("redirect_uri", fallbackOrigin);
  return dialogUrl.toString();
};

export const buildMessengerAppTarget = (content: CardShareContent) => {
  const link = encodeURIComponent(buildMessengerPreviewUrl(content));
  return `fb-messenger://share/?link=${link}&app_id=${encodeURIComponent(metaAppId)}`;
};

export const buildMessengerAndroidIntentTarget = (content: CardShareContent) => {
  const link = encodeURIComponent(buildMessengerPreviewUrl(content));
  return `intent://share/?link=${link}&app_id=${encodeURIComponent(metaAppId)}#Intent;scheme=fb-messenger;package=com.facebook.orca;end`;
};

export const buildMessengerShareBridgeTarget = (content: CardShareContent, origin = fallbackOrigin) => {
  const target = new URL("/messenger-share.html", origin);
  target.searchParams.set("title", content.title);
  target.searchParams.set("date", content.date);
  target.searchParams.set("address", content.address);
  target.searchParams.set("url", buildMessengerPreviewUrl(content));
  return target.toString();
};

export const buildCardShareTarget = (channel: Exclude<CardShareChannel, "instagram">, content: CardShareContent) => {
  const message = buildCardShareText(content);
  const encodedUrl = encodeURIComponent(content.url);
  if (channel === "telegram") {
    const textWithoutUrl = buildCardShareText({ ...content, url: "" });
    return `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(textWithoutUrl)}`;
  }
  if (channel === "whatsapp") return `https://wa.me/?text=${encodeURIComponent(message)}`;
  return buildMessengerSendTarget(content);
};
