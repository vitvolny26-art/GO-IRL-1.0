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
  language: "ru" | "uk" | "cs" | "en";
};

const copy = {
  ru: { date: "Дата", place: "Место", people: "Участники", open: "Открыть событие" },
  uk: { date: "Дата", place: "Місце", people: "Учасники", open: "Відкрити подію" },
  cs: { date: "Datum", place: "Místo", people: "Účastníci", open: "Otevřít událost" },
  en: { date: "Date", place: "Place", people: "Participants", open: "Open event" },
} as const;

const escapeHtml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const clean = (value: string, maxLength: number) => value.trim().slice(0, maxLength);

export function buildTelegramEventCard(input: TelegramEventCardInput) {
  const labels = copy[input.language] || copy.en;
  const title = clean(input.title, 120) || clean(input.activity, 120) || "GO IRL";
  const activity = clean(input.activity, 120);
  const subtitle = activity && activity.toLocaleLowerCase() !== title.toLocaleLowerCase() ? `\n${escapeHtml(activity)}` : "";
  const dateTime = [clean(input.date, 40), clean(input.time, 12)].filter(Boolean).join(" · ");
  const address = clean(input.address, 180);
  const icon = clean(input.icon, 12);
  const participants = Math.max(0, Math.trunc(input.participants));
  const capacity = Math.max(participants, Math.trunc(input.capacity));

  const lines = [
    `<b>${escapeHtml([icon, title].filter(Boolean).join(" "))}</b>${subtitle}`,
    dateTime ? `📅 <b>${labels.date}:</b> ${escapeHtml(dateTime)}` : "",
    address ? `📍 <b>${labels.place}:</b> ${escapeHtml(address)}` : "",
    capacity ? `👥 <b>${labels.people}:</b> ${participants} / ${capacity}` : "",
  ].filter(Boolean);

  return {
    type: "article" as const,
    id: input.eventId,
    title: [icon, title].filter(Boolean).join(" ").slice(0, 256),
    description: [dateTime, address].filter(Boolean).join(" · ").slice(0, 512),
    input_message_content: {
      message_text: lines.join("\n\n"),
      parse_mode: "HTML" as const,
      link_preview_options: { is_disabled: true },
    },
    reply_markup: {
      inline_keyboard: [[{ text: labels.open, url: input.inviteUrl }]],
    },
  };
}
