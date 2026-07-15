import { materialEventArtworkPaths } from "./material-event-artwork";

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

const eventArtworkPaths: Readonly<Record<string, string>> = {
  VB: `<circle cx="60" cy="60" r="48"/><path d="M25 28c25 7 46 27 55 57M79 13c-8 24-5 49 13 74M13 67c24-8 50-5 72 12M28 96c17-18 39-29 67-28"/>`,
  FB: `<circle cx="60" cy="60" r="48"/><path d="M60 36l18 13-7 21H49l-7-21zM60 36V13M78 49l24-8M71 70l15 24M49 70L34 94M42 49l-24-8"/>`,
  BB: `<circle cx="60" cy="60" r="48"/><path d="M12 60h96M60 12c20 16 28 32 28 48s-8 32-28 48M60 12C40 28 32 44 32 60s8 32 28 48"/>`,
  TN: `<ellipse cx="47" cy="43" rx="28" ry="38" transform="rotate(38 47 43)"/><path d="M65 68l34 36M76 79l-12 12M28 28l38 38M20 44l34 34"/><circle cx="94" cy="26" r="9"/>`,
  GY: `<path d="M17 50v20M31 39v42M89 39v42M103 50v20M31 60h58"/>`,
  RN: `<circle cx="59" cy="18" r="10"/><path d="M58 30L43 57l20 17 18 30M46 54L23 72M59 40l24 16M63 74l-18 31"/>`,
  CY: `<circle cx="29" cy="84" r="22"/><circle cx="91" cy="84" r="22"/><path d="M29 84l22-42 19 42H29l15-28h29l18 28M49 33h17M76 35l15 49"/>`,
  BD: `<path d="M25 21l48 49M34 14l48 49M18 32l48 49M76 67l18 18M91 82l12 22-22-12z"/><circle cx="22" cy="18" r="8"/>`,
  TT: `<circle cx="34" cy="43" r="27"/><path d="M52 63l31 35M72 87l12-12"/><circle cx="94" cy="28" r="8"/>`,
  YG: `<circle cx="60" cy="23" r="10"/><path d="M60 35v28M29 50l31 13 31-13M60 63L39 88M60 63l21 25M22 91c20 12 56 12 76 0"/>`,
  CF: `<path d="M24 43h66v35c0 18-14 30-33 30S24 96 24 78zM90 51h10c16 0 16 28 0 28H90M36 27c-7-10 7-15 0-24M58 27c-7-10 7-15 0-24"/>`,
  MV: `<rect x="18" y="34" width="84" height="65" rx="8"/><path d="M18 53h84M24 18h82l-10 16H14zM34 18l10 16M61 18l10 16M88 18l10 16"/>`,
  BW: `<circle cx="83" cy="84" r="23"/><circle cx="75" cy="77" r="3" fill="#c9ff3d"/><circle cx="87" cy="73" r="3" fill="#c9ff3d"/><path d="M26 15h16l-4 26 10 48c2 11-5 19-14 19s-16-8-14-19l10-48zM25 48h18"/>`,
  BG: `<rect x="18" y="18" width="84" height="84" rx="18"/><circle cx="40" cy="40" r="5" fill="#c9ff3d"/><circle cx="80" cy="40" r="5" fill="#c9ff3d"/><circle cx="60" cy="60" r="5" fill="#c9ff3d"/><circle cx="40" cy="80" r="5" fill="#c9ff3d"/><circle cx="80" cy="80" r="5" fill="#c9ff3d"/>`,
  CH: `<path d="M38 19h44L69 45l18 25-15 29H48L33 70l18-25zM38 99h44M31 108h58"/><circle cx="60" cy="34" r="4" fill="#c9ff3d"/>`,
  KR: `<rect x="42" y="13" width="36" height="61" rx="18"/><path d="M29 57c0 22 13 34 31 34s31-12 31-34M60 91v17M43 108h34"/>`,
  SK: `<path d="M18 25h45v27c0 12 9 22 21 24l19 4v13H18zM18 25V10h39l6 15M18 78h85"/><circle cx="35" cy="103" r="8"/><circle cx="62" cy="103" r="8"/><circle cx="89" cy="103" r="8"/>`,
  BR: `<path d="M22 25h61v68c0 10-8 17-17 17H39c-9 0-17-7-17-17zM83 42h10c19 0 19 39 0 39H83M22 45h61M37 45v48M56 45v48"/>`,
  QZ: `<path d="M60 16c-22 0-38 15-38 35 0 14 7 24 18 31v16h40V82c11-7 18-17 18-31 0-20-16-35-38-35zM42 110h36M45 98h30M49 52c2-10 19-13 24-4 7 13-13 15-13 27M60 85h.1"/>`,
  WN: `<path d="M31 12h58l-8 42c-3 17-12 26-21 26s-18-9-21-26zM60 80v28M39 108h42M38 42h44"/>`,
  CN: `<path d="M52 20v62M52 30l45-10v54M52 43l45-10"/><ellipse cx="37" cy="88" rx="17" ry="12"/><ellipse cx="82" cy="80" rx="17" ry="12"/>`,
  FS: `<path d="M17 104L49 37l23 67M38 104L69 24l34 80M28 81h61M69 24V9M69 9l25 8-25 8"/>`,
  DN: `<circle cx="59" cy="17" r="9"/><path d="M58 29l-13 29 21 19 22 29M47 55L21 45M58 40l29 4M66 77l-24 29"/>`,
  HK: `<path d="M20 93l24-39 15 18 17-30 27 51zM38 93l21-21M76 42l8 14"/><path d="M19 108h86"/>`,
  WK: `<circle cx="60" cy="18" r="10"/><path d="M60 30v37M60 43L37 61M60 44l24 18M60 67l-18 40M60 67l24 40"/>`,
  SW: `<circle cx="42" cy="31" r="9"/><path d="M25 58l24-17 27 13 19-3M12 78c12-9 24 9 36 0s24 9 36 0 24 9 30 3M12 99c12-9 24 9 36 0s24 9 36 0 24 9 30 3"/>`,
  PC: `<path d="M20 52h80l-10 55H30zM35 52c0-23 11-39 25-39s25 16 25 39M46 52v55M74 52v55M24 73h72"/>`,
  CP: `<path d="M11 103L60 20l49 83zM60 20v83M37 103l23-42 23 42"/>`,
  FI: `<path d="M17 61c18-24 43-24 65 0-22 24-47 24-65 0zM82 61l25-20v40zM48 61h.1M41 30c14-20 39-18 53 1M94 31v26"/>`,
  KY: `<path d="M12 76c25 17 71 17 96 0l-13 23H25zM27 61l66-31M21 51l18 20M81 20l18 20"/>`,
  DR: `<circle cx="60" cy="61" r="31"/><circle cx="60" cy="61" r="19"/><path d="M17 14v37M9 14v21c0 12 16 12 16 0V14M17 51v55M103 14c-15 12-15 31 0 39v53"/>`,
  LX: `<path d="M13 18h65v48H42L23 82V66H13zM49 52h58v42H87l-16 14V94H49zM28 37h35M28 49h23M64 70h28M64 82h19"/>`,
  CW: `<rect x="20" y="19" width="80" height="57" rx="6"/><path d="M8 91h104l-10 15H18zM48 91h24"/>`,
  MT: `<circle cx="36" cy="34" r="14"/><circle cx="84" cy="34" r="14"/><path d="M12 95c2-25 12-38 24-38s22 13 24 38M60 95c2-25 12-38 24-38s22 13 24 38M47 71h26"/>`,
  AR: `<path d="M60 12c-27 0-49 18-49 43 0 28 24 52 53 52 9 0 14-6 10-14-4-9 4-16 14-16h8c15 0 18-13 11-27-9-23-25-38-47-38z"/><circle cx="35" cy="44" r="5" fill="#c9ff3d"/><circle cx="55" cy="31" r="5" fill="#c9ff3d"/><circle cx="76" cy="37" r="5" fill="#c9ff3d"/><circle cx="90" cy="53" r="5" fill="#c9ff3d"/>`,
  PH: `<rect x="13" y="30" width="94" height="69" rx="13"/><circle cx="60" cy="65" r="23"/><path d="M35 30l9-16h32l9 16M91 45h.1"/>`,
  CR: `<path d="M39 12h42M44 12c0 19 7 24 0 37-9 17-13 34-5 54h42c8-20 4-37-5-54-7-13 0-18 0-37M36 61h48M40 92h40"/>`,
  JM: `<path d="M35 104c-15-7-20-21-13-34 6-12 18-15 29-10l27-44 20 12-28 44c8 9 8 21 2 31-7 13-22 16-37 1zM52 62l18 11M75 20l20 12M42 84h.1"/>`,
  WS: `<path d="M22 20l76 76M31 11l12 12-18 18-12-12zM79 87l12 12M91 17c-15 2-23 15-18 28L42 76c-13-5-26 3-28 18l17-9 11 11-9 17c15-2 23-15 18-28l31-31c13 5 26-3 28-18l-17 9-11-11z"/>`,
};

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

  const materialPath = materialEventArtworkPaths[code];
  if (materialPath) {
    return `<g data-event-artwork="${code}" transform="translate(143 143) scale(4)" fill="#c9ff3d">
      <path d="${materialPath}"/>
    </g>`;
  }

  return `<g data-event-artwork="${code}" transform="translate(131 131)" fill="none" stroke="#c9ff3d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    ${eventArtworkPaths[code]}
  </g>`;
};
