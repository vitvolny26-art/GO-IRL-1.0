export type CardShareChannel = "telegram" | "whatsapp" | "messenger" | "instagram";

export type CardShareContent = {
  title: string;
  date: string;
  address: string;
  url: string;
};

const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fallbackOrigin = "https://go-irl-1-0.vercel.app";

export const buildCardShareText = ({ title, date, address, url }: CardShareContent) =>
  [url, [`GO IRL: ${title}`, date, address].filter(Boolean).join("\n")].filter(Boolean).join("\n\n");

const buildMessengerPreviewUrl = (content: CardShareContent) => {
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

export const buildCardShareTarget = (channel: Exclude<CardShareChannel, "instagram">, content: CardShareContent) => {
  const message = buildCardShareText(content);
  const encodedUrl = encodeURIComponent(channel === "messenger" ? buildMessengerPreviewUrl(content) : content.url);
  if (channel === "telegram") {
    const textWithoutUrl = buildCardShareText({ ...content, url: "" });
    return `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(textWithoutUrl)}`;
  }
  if (channel === "whatsapp") return `https://wa.me/?text=${encodeURIComponent(message)}`;
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
};
