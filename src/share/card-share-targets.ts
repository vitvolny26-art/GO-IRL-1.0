export type CardShareChannel = "telegram" | "whatsapp" | "messenger" | "viber";

export type CardSharePayload = {
  title: string;
  date: string;
  address: string;
  url: string;
};

export const buildCardShareMessage = ({ title, date, address }: CardSharePayload) =>
  [`GO IRL: ${title}`, date, address].filter(Boolean).join("\n");

export const buildCardShareTarget = (channel: CardShareChannel, payload: CardSharePayload) => {
  const message = buildCardShareMessage(payload);
  const messageWithUrl = `${message}\n${payload.url}`;
  const encodedUrl = encodeURIComponent(payload.url);
  const encodedMessage = encodeURIComponent(message);
  const encodedWithUrl = encodeURIComponent(messageWithUrl);

  if (channel === "telegram") return `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`;
  if (channel === "whatsapp") return `https://wa.me/?text=${encodedWithUrl}`;
  if (channel === "messenger") return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  return `viber://forward?text=${encodedWithUrl}`;
};
