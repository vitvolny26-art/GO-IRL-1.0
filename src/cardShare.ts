export type CardShareChannel = "telegram" | "whatsapp" | "messenger" | "facebook" | "instagram";

export type CardShareContent = {
  title: string;
  date: string;
  address: string;
  url: string;
  language?: "ru" | "uk" | "cs" | "en";
};

const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const beautySlugPattern = /^beauty-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fallbackOrigin = "https://go-irl-1-0.vercel.app";
const shareTextMarker = "GO IRL:";
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
    const beautyMatch = inviteUrl.pathname.match(/^\/beauty\/([^/]+)\/?$/i);
    const beautySlug = beautyMatch?.[1] ? decodeURIComponent(beautyMatch[1]).trim().toLowerCase() : "";
    if (beautySlugPattern.test(beautySlug)) {
      const previewUrl = new URL("/api/meta/event-preview", fallbackOrigin);
      previewUrl.searchParams.set("slug", beautySlug);
      previewUrl.searchParams.set("language", content.language || "ru");
      if (content.date.trim()) previewUrl.searchParams.set("date", content.date.trim());
      return previewUrl.toString();
    }

    const eventId = inviteUrl.searchParams.get("startapp")?.trim() || "";
    if (!eventIdPattern.test(eventId)) return content.url;

    const previewUrl = new URL("/api/meta/event-preview", fallbackOrigin);
    previewUrl.searchParams.set("event", eventId);
    previewUrl.searchParams.set("language", content.language || "ru");
    return previewUrl.toString();
  } catch {
    return content.url;
  }
};

export const buildCardShareLandingUrl = (content: CardShareContent) => {
  try {
    const previewUrl = new URL(buildMetaEventPreviewUrl(content));
    const language = content.language || "ru";
    const eventId = previewUrl.searchParams.get("event") || "";
    if (eventIdPattern.test(eventId)) {
      const landingUrl = new URL(`/e/${encodeURIComponent(eventId)}`, fallbackOrigin);
      if (language !== "ru") landingUrl.searchParams.set("language", language);
      return landingUrl.toString();
    }

    const beautySlug = previewUrl.searchParams.get("slug") || "";
    if (beautySlugPattern.test(beautySlug)) {
      const landingUrl = new URL(`/s/${encodeURIComponent(beautySlug)}`, fallbackOrigin);
      if (language !== "ru") landingUrl.searchParams.set("language", language);
      const date = previewUrl.searchParams.get("date") || "";
      if (date) landingUrl.searchParams.set("date", date);
      return landingUrl.toString();
    }
  } catch {
    // Fall through to the original public URL.
  }
  return normalizeCardShareUrl(content.url);
};

export const buildMessengerPreviewUrl = buildMetaEventPreviewUrl;

export const buildCardShareImageUrl = (content: CardShareContent) => {
  const url = new URL(buildMetaEventPreviewUrl(content));
  if (url.pathname !== "/api/meta/event-preview") return "";
  url.searchParams.set("format", "image");
  return url.toString();
};

export const buildCardShareDownloadUrl = (content: CardShareContent) => {
  const imageUrl = buildCardShareImageUrl(content);
  if (!imageUrl) return "";
  const origin = typeof window === "undefined" ? fallbackOrigin : window.location.origin;
  const downloadUrl = new URL(imageUrl, origin);
  downloadUrl.searchParams.set("format", "download");
  return downloadUrl.toString();
};

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
  const normalizedContent = { ...content, url: normalizeCardShareUrl(content.url) };
  if (channel === "telegram") {
    const target = new URL("https://t.me/share/url");
    target.searchParams.set("url", normalizedContent.url);
    target.searchParams.set("text", buildCardShareText({ ...normalizedContent, url: "" }));
    return target.toString();
  }
  if (channel === "whatsapp") {
    const landingUrl = buildCardShareLandingUrl(normalizedContent);
    const message = buildCardShareText({ ...normalizedContent, url: landingUrl });
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  if (channel === "facebook") return buildFacebookShareTarget(normalizedContent);
  return buildMessengerSendTarget(normalizedContent);
};
