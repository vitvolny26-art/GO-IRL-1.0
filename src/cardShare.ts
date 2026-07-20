export type CardShareChannel = "telegram" | "whatsapp" | "messenger" | "instagram";

export type CardShareContent = {
  title: string;
  date: string;
  address: string;
  url: string;
};

const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const mobileUserAgentPattern = /Android|iPhone|iPad|iPod/i;
const fallbackOrigin = "https://go-irl-1-0.vercel.app";
const metaAppId = "2315026155981238";

export const buildCardShareText = ({ title, date, address, url }: CardShareContent)