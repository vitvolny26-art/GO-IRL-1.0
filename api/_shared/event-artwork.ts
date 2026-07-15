export type EventArtworkInput = {
  icon?: string;
  activity?: string;
  title?: string;
};

type EventArtworkEntry = {
  code: string;
  emoji: string;
  aliases: readonly string[];
};

const normalize = (value: string) => value
  .toLocaleLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[’']/g, "")
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .trim();

const xml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

export const eventArtworkRegistry: readonly EventArtworkEntry[] = [
  { code: "VB", emoji: "🏐", aliases: ["volleyball", "волейбол", "volejbal"] },
  { code: "FB", emoji: "⚽", aliases: ["football", "футбол", "fotbal"] },
  { code: "BB", emoji: "🏀", aliases: ["basketball", "баскетбол", "basketbal"] },
  { code: "TN", emoji: "🎾", aliases: ["tennis", "теннис", "tenis"] },
  { code: "GY", emoji: "🏋️", aliases: ["gym", "тренажерный зал", "posilovna"] },
  { code: "RN", emoji: "🏃", aliases: ["running", "бег", "beh"] },
  { code: "CY", emoji: "🚴", aliases: ["cycling", "велосипед", "kolo"] },
  { code: "BD", emoji: "🏸", aliases: ["badminton", "бадминтон"] },
  { code: "TT", emoji: "🏓", aliases: ["table tennis", "настольный теннис", "stolni tenis"] },
  { code: "YG", emoji: "🧘", aliases: ["yoga", "йога", "joga"] },
  { code: "CF", emoji: "☕", aliases: ["coffee", "кофе", "kava"] },
  { code: "MV", emoji: "🎬", aliases: ["cinema", "кино", "kino"] },
  { code: "BW", emoji: "🎳", aliases: ["bowling", "боулинг"] },
  { code: "BG", emoji: "🎲", aliases: ["board games", "настольные игры", "deskove hry"] },
  { code: "CH", emoji: "♟️", aliases: ["chess", "шахматы", "sachy"] },
  { code: "KR", emoji: "🎤", aliases: ["karaoke", "караоке"] },
  { code: "SK", emoji: "🛼", aliases: ["inline skating", "ролики", "inline brusleni"] },
  { code: "BR", emoji: "🍺", aliases: ["lets get a beer", "идем на пиво", "jdeme na pivo"] },
  { code: "QZ", emoji: "🧠", aliases: ["pub quiz", "паб квиз", "pub kviz"] },
  { code: "WN", emoji: "🍷", aliases: ["wine evening", "винный вечер", "vecer s vinem"] },
  { code: "CN", emoji: "🎵", aliases: ["concert", "концерт", "koncert"] },
  { code: "FS", emoji: "🎪", aliases: ["festival", "фестиваль"] },
  { code: "DN", emoji: "💃", aliases: ["dancing", "танцы", "tanec"] },
  { code: "HK", emoji: "🥾", aliases: ["hike", "поход", "vylet"] },
  { code: "WK", emoji: "🚶", aliases: ["park walk", "walk", "прогулка в парке", "прогулка", "prochazka v parku", "prochazka"] },
  { code: "SW", emoji: "🏊", aliases: ["swimming", "плавание", "plavani"] },
  { code: "PC", emoji: "🧺", aliases: ["picnic", "пикник", "piknik"] },
  { code: "CP", emoji: "⛺", aliases: ["camping", "кемпинг", "kempovani"] },
  { code: "FI", emoji: "🎣", aliases: ["fishing", "рыбалка", "rybareni"] },
  { code: "KY", emoji: "🛶", aliases: ["kayaking", "каяки", "kajaky"] },
  { code: "DR", emoji: "🍽️", aliases: ["dinner", "ужин", "vecere"] },
  { code: "LX", emoji: "🗣️", aliases: ["language exchange", "языковой обмен", "jazykova vymena"] },
  { code: "CW", emoji: "💻", aliases: ["coworking", "коворкинг"] },
  { code: "MT", emoji: "🤝", aliases: ["meet new people", "новые знакомства", "nova seznameni"] },
  { code: "AR", emoji: "🎨", aliases: ["drawing", "рисование", "malovani"] },
  { code: "PH", emoji: "📸", aliases: ["photo walk", "фотопрогулка", "fotoprochazka"] },
  { code: "CR", emoji: "🏺", aliases: ["ceramics", "керамика", "keramika"] },
  { code: "JM", emoji: "🎸", aliases: ["music jam", "музыкальный джем", "hudebni jam"] },
  { code: "WS", emoji: "🧶", aliases: ["workshop", "мастерская", "dilna"] },
] as const;

const aliasIndex = eventArtworkRegistry
  .flatMap((entry) => entry.aliases.map((value) => ({ code: entry.code, value: normalize(value) })))
  .sort((left, right) => right.value.length - left.value.length);

export const resolveEventArtworkCode = ({ icon = "", activity = "", title = "" }: EventArtworkInput) => {
  const exact = eventArtworkRegistry.find((entry) => icon.includes(entry.emoji));
  if (exact) return exact.code;

  const haystack = ` ${normalize(`${activity} ${title}`)} `;
  const alias = aliasIndex.find(({ value }) => haystack.includes(` ${value} `));
  return alias?.code || "EV";
};

export const resolveEventArtworkEmoji = (input: EventArtworkInput) => {
  const code = resolveEventArtworkCode(input);
  return eventArtworkRegistry.find((entry) => entry.code === code)?.emoji || "✨";
};

export const buildEventArtworkSvg = (input: EventArtworkInput) => {
  const code = resolveEventArtworkCode(input);
  const emoji = resolveEventArtworkEmoji(input);
  return `<g data-event-artwork="${code}">
    <text x="191" y="224" text-anchor="middle" font-size="128" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${xml(emoji)}</text>
  </g>`;
};
