export type CardShareChannel = "telegram" | "whatsapp" | "messenger" | "instagram";

export type CardShareContent = {
  title: string;
  date: string;
  address: string;
  url: string;
};

export const buildCardShareText = ({ title, date, address, url }: CardShareContent) =>
  [url, [`GO IRL: ${title}`, date, address].filter(Boolean).join("\n")].filter(Boolean).join("\n\n");

export const buildCardShareTarget = (channel: Exclude<CardShareChannel, "instagram">, content: CardShareContent) => {
  const message = buildCardShareText(content);
  const encodedUrl = encodeURIComponent(content.url);
  if (channel === "telegram") {
    const textWithoutUrl = buildCardShareText({ ...content, url: "" });
    return `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(textWithoutUrl)}`;
  }
  if (channel === "whatsapp") return `https://wa.me/?text=${encodeURIComponent(message)}`;
  const textWithoutUrl = buildCardShareText({ ...content, url: "" });
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(textWithoutUrl)}`;
};
