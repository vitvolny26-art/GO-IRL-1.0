import { beautySlugFromPublicLink } from "./beauty/beautyPublicSlug";
import type { Language } from "./types";

export type CardShareChannel = "telegram" | "whatsapp" | "messenger" | "facebook" | "instagram";

export type CardShareContent = {
  title: string;
  date: string;
  address: string;
  url: string;
  language?: Language;
};

const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fallbackOrigin = "https://go-irl-1-0.vercel.app";
const shareTextMarker = "GO IRL:";
const beautyPreviewVersion = "1";
export const metaAppId = "1348703396728256";

export const normalizeCardShareUrl = (value: string) => {
  const trimmed = value.trim();
  const markerIndex = trimmed.indexOf(shareTextMarker);
  const candidate = (markerIndex > 0 ? trimmed.slice(0, markerIndex) : trimmed).trim();

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : candidate;
  } catch {
    return candidate;
  }
};

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

export const buildMetaBeautyPreviewUrl = (content: CardShareContent) => {
  const slug = beautySlugFromPublicLink(content.url);
  if (!slug) return content.url;

  const previewUrl = new URL("/api/meta/beauty-preview", fallbackOrigin);
  previewUrl.searchParams.set("slug", slug);
  previewUrl.searchParams.set("language", content.language || "ru");
  if (content.date.trim()) previewUrl.searchParams.set("date", content.date.trim().slice(0, 64));
  previewUrl.searchParams.set("v", beautyPreviewVersion);
  return previewUrl.toString();
};

export const buildMetaCardPreviewUrl = (content: CardShareContent) =>
  beautySlugFromPublicLink(content.url) ? buildMetaBeautyPreviewUrl(content) : buildMetaEventPreviewUrl(content);

export const buildMessengerPreviewUrl = buildMetaCardPreviewUrl;

export const buildOrganicCardShareContent = (content: CardShareContent) => ({
  title: `GO IRL: ${content.title}`,
  text: [content.date, content.address].filter(Boolean).join("\n"),
  url: buildMetaCardPreviewUrl(content),
});

export const buildFacebookShareTarget = (content: CardShareContent) => {
  const target = new URL("https://www.facebook.com/sharer/sharer.php");
  target.searchParams.set("u", buildMetaCardPreviewUrl(content));
  target.searchParams.set("quote", buildCardShareText(content));
  return target.toString();
};

export const buildMessengerSendTarget = (content: CardShareContent) => {
  const dialogUrl = new URL("https://www.facebook.com/dialog/send");
  dialogUrl.searchParams.set("app_id", metaAppId);
  dialogUrl.searchParams.set("link", buildMetaCardPreviewUrl(content));
  dialogUrl.searchParams.set("redirect_uri", fallbackOrigin);
  return dialogUrl.toString();
};

export const buildMessengerAppTarget = (content: CardShareContent) => {
  const link = encodeURIComponent(buildMetaCardPreviewUrl(content));
  return `fb-messenger://share/?link=${link}&app_id=${encodeURIComponent(metaAppId)}`;
};

export const buildMessengerAndroidIntentTarget = (content: CardShareContent) => {
  const link = encodeURIComponent(buildMetaCardPreviewUrl(content));
  return `intent://share/?link=${link}&app_id=${encodeURIComponent(metaAppId)}#Intent;scheme=fb-messenger;package=com.facebook.orca;end`;
};

export const buildMessengerShareBridgeTarget = (content: CardShareContent, origin = fallbackOrigin) => {
  const target = new URL("/messenger-share.html", origin);
  target.searchParams.set("title", content.title);
  target.searchParams.set("date", content.date);
  target.searchParams.set("address", content.address);
  target.searchParams.set("url", buildMetaCardPreviewUrl(content));
  return target.toString();
};

export const buildCardShareTarget = (channel: Exclude<CardShareChannel, "instagram">, content: CardShareContent) => {
  const normalizedContent = { ...content, url: normalizeCardShareUrl(content.url) };
  const beautySlug = beautySlugFromPublicLink(normalizedContent.url);
  const organicContent = buildOrganicCardShareContent(normalizedContent);
  const message = buildCardShareText({ ...normalizedContent, url: organicContent.url });
  if (channel === "telegram") {
    const target = new URL("https://t.me/share/url");
    target.searchParams.set("url", normalizedContent.url);
    target.searchParams.set("text", buildCardShareText({ ...normalizedContent, url: "" }));
    return target.toString();
  }
  if (channel === "whatsapp") {
    const whatsappText = beautySlug ? organicContent.url : message;
    return `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
  }
  if (channel === "facebook") return buildFacebookShareTarget(normalizedContent);
  return buildMessengerSendTarget(normalizedContent);
};
