export type EventArtworkInput = {
  icon?: string;
  activity?: string;
  title?: string;
};

const normalize = (value: string) => value
  .toLocaleLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "");

const entries = [
  ["🏐", "VB"], ["⚽", "FB"], ["🏀", "BB"], ["🎾", "TN"], ["🏋️", "GY"],
  ["🏃", "RN"], ["🚴", "CY"], ["🏸", "BD"], ["🏓", "TT"], ["🧘", "YG"],
  ["☕", "CF"], ["🎬", "MV"], ["🎳", "BW"], ["🎲", "BG"], ["♟️", "CH"],
  ["🎤", "KR"], ["🛼", "SK"], ["🍺", "BR"], ["🧠", "QZ"], ["🍷", "WN"],
  ["🎵", "CN"], ["🎪", "FS"], ["💃", "DN"], ["🥾", "HK"], ["🚶", "WK"],
  ["🏊", "SW"], ["🧺", "PC"], ["⛺", "CP"], ["🎣", "FI"], ["🛶", "KY"],
  ["🍽️", "DR"], ["🗣️", "LX"], ["💻", "CW"], ["🤝", "MT"], ["🎨", "AR"],
  ["📸", "PH"], ["🏺", "CR"], ["🎸", "JM"], ["🧶", "WS"],
] as const;

const aliases = [
  ["volleyball волейбол volejbal", "VB"], ["football футбол fotbal", "FB"], ["basketball баскетбол basketbal", "BB"],
  ["tennis теннис tenis", "TN"], ["gym тренажерный зал posilovna", "GY"], ["running бег beh", "RN"],
  ["cycling велосипед kolo", "CY"], ["badminton бадминтон", "BD"], ["table tennis настольный теннис stolni tenis", "TT"],
  ["yoga йога joga", "YG"], ["coffee кофе kava", "CF"], ["cinema кино kino", "MV"], ["bowling боулинг", "BW"],
  ["board games настольные игры deskove hry", "BG"], ["chess шахматы шахи sachy", "CH"], ["karaoke караоке", "KR"],
  ["inline skating ролики inline brusleni", "SK"], ["beer пиво jdeme na pivo", "BR"], ["pub quiz паб-квиз pub kviz", "QZ"],
  ["wine винный вечер vecer s vinem", "WN"], ["concert концерт koncert", "CN"], ["festival фестиваль", "FS"],
  ["dance танцы танец tanec", "DN"], ["hike поход vylet", "HK"], ["walk прогулка prochazka park walk", "WK"],
  ["swimming плавание plavani", "SW"], ["picnic пикник piknik", "PC"], ["camping кемпинг kempovani", "CP"],
  ["fishing рыбалка rybareni", "FI"], ["kayak каяки kajaky", "KY"], ["dinner ужин vecere", "DR"],
  ["language exchange языковой обмен jazykova vymena", "LX"], ["coworking коворкинг", "CW"],
  ["meet new people новые знакомства nova seznameni", "MT"], ["drawing рисование malovani", "AR"],
  ["photo walk фотопрогулка fotoprochazka", "PH"], ["ceramics керамика keramika", "CR"],
  ["music jam музыкальный джем hudebni jam", "JM"], ["workshop мастерская dilna", "WS"],
] as const;

export const resolveEventArtworkCode = ({ icon = "", activity = "", title = "" }: EventArtworkInput) => {
  const exact = entries.find(([emoji]) => icon.includes(emoji));
  if (exact) return exact[1];

  const haystack = normalize(`${activity} ${title}`);
  const alias = aliases.find(([keywords]) => keywords.split(" ").some((keyword) => haystack.includes(normalize(keyword))));
  return alias?.[1] || "EV";
};

export const buildEventArtworkSvg = (input: EventArtworkInput) => {
  const code = resolveEventArtworkCode(input);

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
