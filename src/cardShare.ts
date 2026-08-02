export type CardShareChannel = "telegram" | "whatsapp" | "messenger" | "facebook" | "instagram";

export type CardShareContent = {
  title: string;
  date: string;
  address: string;
  url: string;
};

const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fallbackOrigin = "https://go-irl-1-0.vercel.app";
export const metaAppId = "1348703396728256";

export const buildCardShareText = ({ title, date, address, url }: CardShareContent) =>
  [[`GO IRL: ${title}`, date, address].filter(Boolean).join("\n"), url].filter(Boolean).join("\n\n");

export const buildMetaEventPreviewUrl = (content: CardShareContent) => {
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

export const buildMessengerPreviewUrl = buildMetaEventPreviewUrl;

export const buildOrganicCardShareContent = (content: CardShareContent) => ({
  title: `GO IRL: ${content.title}`,
  text: [content.date, content.address].filter(Boolean).join("\n"),
  url: buildMetaEventPreviewUrl(content),
});

export const buildFacebookShareTarget = (content: CardShareContent) => {
  const target = new URL("https://www.facebook.com/sharer/sharer.php");
  target.searchParams.set("u", buildMetaEventPreviewUrl(content));
  target.searchParams.set("quote", buildCardShareText(content));
  return target.toString();
};

export const buildMessengerSendTarget = (content: CardShareContent) => {
  const dialogUrl = new URL("https://www.facebook.com/dialog/send");
  dialogUrl.searchParams.set("app_id", metaAppId);
  dialogUrl.searchParams.set("link", buildMetaEventPreviewUrl(content));
  dialogUrl.searchParams.set("redirect_uri", fallbackOrigin);
  return dialogUrl.toString();
};

export const buildMessengerAppTarget = (content: CardShareContent) => {
  const link = encodeURIComponent(buildMetaEventPreviewUrl(content));
  return `fb-messenger://share/?link=${link}&app_id=${encodeURIComponent(metaAppId)}`;
};

export const buildMessengerAndroidIntentTarget = (content: CardShareContent) => {
  const link = encodeURIComponent(buildMetaEventPreviewUrl(content));
  return `intent://share/?link=${link}&app_id=${encodeURIComponent(metaAppId)}#Intent;scheme=fb-messenger;package=com.facebook.orca;end`;
};

export const buildMessengerShareBridgeTarget = (content: CardShareContent, origin = fallbackOrigin) => {
  const target = new URL("/messenger-share.html", origin);
  target.searchParams.set("title", content.title);
  target.searchParams.set("date", content.date);
  target.searchParams.set("address", content.address);
  target.searchParams.set("url", buildMetaEventPreviewUrl(content));
  return target.toString();
};

export const buildCardShareTarget = (channel: Exclude<CardShareChannel, "instagram">, content: CardShareContent) => {
  const organicContent = buildOrganicCardShareContent(content);
  const message = buildCardShareText({ ...content, url: organicContent.url });
  const encodedUrl = encodeURIComponent(content.url);
  if (channel === "telegram") {
    const textWithoutUrl = buildCardShareText({ ...content, url: "" });
    return `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(textWithoutUrl)}`;
  }
  if (channel === "whatsapp") return `https://wa.me/?text=${encodeURIComponent(message)}`;
  if (channel === "facebook") return buildFacebookShareTarget(content);
  return buildMessengerSendTarget(content);
};
