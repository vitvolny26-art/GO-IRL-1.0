export type TelegramEventCardInput = {
  eventId: string;
  title: string;
  activity: string;
  date: string;
  time: string;
  address: string;
  participants: number;
  capacity: number;
  icon: string;
  inviteUrl: string;
  mapUrl?: string;
  city: string;
  durationMinutes?: number;
  price: number;
  level: string;
  format: string;
  environment: string;
  weather?: {
    icon: string;
    temperature: number;
    rain: number;
    wind: number;
  };
  language: "ru" | "uk" | "cs" | "en";
};

const copy = {
  ru: { date: "Дата", place: "Место", people: "Участники", open: "Открыть событие", map: "Карта" },
  uk: { date: "Дата", place: "Місце", people: "Учасники", open: "Відкрити подію", map: "Мапа" },
  cs: { date: "Datum", place: "Místo", people: "Účastníci", open: "Otevřít událost", map: "Mapa" },
  en: { date: "Date", place: "Place", people: "Participants", open: "Open event", map: "Map" },
} as const;

const escapeHtml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const clean = (value: string, maxLength: number) => value.trim().slice(0, maxLength);

export function buildTelegramEventCard(input: TelegramEventCardInput, imageUrl: string) {
  const labels = copy[input.language] || copy.en;
  const activity = clean(input.activity, 120);
  const title = clean(input.title, 120) || activity || "GO IRL";
  const subtitle = activity && activity.toLocaleLowerCase() !== title.toLocaleLowerCase() ? `\n${escapeHtml(title)}` : "";
  const dateTime = [clean(input.date, 40), clean(input.time, 12)].filter(Boolean).join(" · ");
  const address = clean(input.address, 180);
  const icon = clean(input.icon, 12);
  const participants = Math.max(0, Math.trunc(input.participants));
  const capacity = Math.max(participants, Math.trunc(input.capacity));

  const lines = [
    `<b>${escapeHtml([icon, activity || title].filter(Boolean).join(" "))}</b>${subtitle}`,
    dateTime ? `📅 <b>${labels.date}:</b> ${escapeHtml(dateTime)}` : "",
    address ? `📍 <b>${labels.place}:</b> ${escapeHtml(address)}` : "",
    capacity ? `👥 <b>${labels.people}:</b> ${participants} / ${capacity}` : "",
  ].filter(Boolean);

  const buttons = [{ text: labels.open, url: input.inviteUrl }];
  if (input.mapUrl) buttons.push({ text: labels.map, url: input.mapUrl });

  return {
    type: "photo" as const,
    id: input.eventId,
    photo_url: imageUrl,
    thumbnail_url: imageUrl,
    photo_width: 1080,
    photo_height: 900,
    title: [icon, activity || title].filter(Boolean).join(" ").slice(0, 256),
    description: [dateTime, address].filter(Boolean).join(" · ").slice(0, 512),
    caption: lines.join("\n\n"),
    parse_mode: "HTML" as const,
    reply_markup: {
      inline_keyboard: [buttons],
    },
  };
}
