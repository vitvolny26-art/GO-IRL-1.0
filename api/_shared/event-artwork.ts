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

export const buildEventArtworkSvg = (input: EventArtworkInput) => {
  const code = resolveEventArtworkCode(input);

  if (code === "EV") {
    return `<g data-event-artwork="EV" fill="none" stroke="#aeb3bd" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
      <rect x="137" y="132" width="108" height="112" rx="22"/>
      <path d="M137 166h108M164 119v27M218 119v27M162 191h12M185 191h12M208 191h12M162 216h12M185 216h12"/>
    </g>`;
  }

  if (code === "CH") {
    return `<g data-event-artwork="CH" fill="none" stroke="#c9ff3d" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <path d="M164 130h54l-18 32 22 30-20 46h-54l18-46-20-30z"/>
      <path d="M152 238h64M145 258h78"/>
      <circle cx="188" cy="151" r="5" fill="#c9ff3d" stroke="none"/>
    </g>`;
  }

  if (code === "CF") {
    return `<g data-event-artwork="CF" fill="none" stroke="#c9ff3d" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <path d="M143 159h82v48c0 25-18 43-41 43s-41-18-41-43z"/>
      <path d="M225 170h15c18 0 18 34 0 34h-15M158 137c-8-12 8-18 0-30M186 137c-8-12 8-18 0-30"/>
    </g>`;
  }

  if (code === "WK" || code === "RN") {
    return `<g data-event-artwork="${code}" fill="none" stroke="#c9ff3d" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="188" cy="132" r="16"/>
      <path d="M188 150l-18 36 28 22 24 38M174 182l-30 28M188 164l30 24M198 208l-16 42"/>
    </g>`;
  }

  return `<g data-event-artwork="${code}">
    <circle cx="191" cy="191" r="68" fill="#172111" stroke="#c9ff3d" stroke-width="8"/>
    <text x="191" y="211" text-anchor="middle" fill="#c9ff3d" font-size="54" font-weight="900" font-family="DejaVu Sans, sans-serif">${code}</text>
  </g>`;
};
