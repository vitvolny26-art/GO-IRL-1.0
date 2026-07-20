import type { EventArtworkInput } from "./event-artwork.js";
import { resolveEventArtworkCode } from "./event-artwork.js";

export const eventShareBackgroundUrls = {
  VB: new URL("../../assets/share-backgrounds/webp/01-volleyball.webp", import.meta.url),
  FB: new URL("../../assets/share-backgrounds/webp/02-football.webp", import.meta.url),
  BB: new URL("../../assets/event-backgrounds/share-6x5/03-basketball.webp", import.meta.url),
  TN: new URL("../../assets/event-backgrounds/share-6x5/04-tennis.webp", import.meta.url),
  GY: new URL("../../assets/share-backgrounds/webp/05-gym.webp", import.meta.url),
  RN: new URL("../../assets/share-backgrounds/webp/06-running.webp", import.meta.url),
  CY: new URL("../../assets/share-backgrounds/webp/07-cycling.webp", import.meta.url),
  BD: new URL("../../assets/event-backgrounds/share-6x5/08-badminton.webp", import.meta.url),
  TT: new URL("../../assets/share-backgrounds/webp/09-table-tennis.webp", import.meta.url),
  YG: new URL("../../assets/share-backgrounds/webp/10-yoga.webp", import.meta.url),
  CF: new URL("../../assets/share-backgrounds/webp/11-coffee.webp", import.meta.url),
  MV: new URL("../../assets/share-backgrounds/webp/12-cinema.webp", import.meta.url),
  BW: new URL("../../assets/share-backgrounds/webp/13-bowling.webp", import.meta.url),
  BG: new URL("../../assets/share-backgrounds/webp/14-board-games.webp", import.meta.url),
  CH: new URL("../../assets/share-backgrounds/webp/15-chess.webp", import.meta.url),
  KR: new URL("../../assets/share-backgrounds/webp/16-karaoke.webp", import.meta.url),
  SK: new URL("../../assets/share-backgrounds/webp/17-roller-skating.webp", import.meta.url),
  BR: new URL("../../assets/share-backgrounds/webp/18-beer.webp", import.meta.url),
  QZ: new URL("../../assets/share-backgrounds/webp/19-pub-quiz.webp", import.meta.url),
  WN: new URL("../../assets/share-backgrounds/webp/20-wine-evening.webp", import.meta.url),
  CN: new URL("../../assets/share-backgrounds/webp/21-concert.webp", import.meta.url),
  FS: new URL("../../assets/share-backgrounds/webp/22-festival.webp", import.meta.url),
  DN: new URL("../../assets/share-backgrounds/webp/23-dancing.webp", import.meta.url),
  HK: new URL("../../assets/event-backgrounds/share-6x5/24-hiking.webp", import.meta.url),
  WK: new URL("../../assets/event-backgrounds/share-6x5/25-park-walk.webp", import.meta.url),
  SW: new URL("../../assets/event-backgrounds/share-6x5/26-swimming.webp", import.meta.url),
  PC: new URL("../../assets/event-backgrounds/share-6x5/27-picnic.webp", import.meta.url),
  CP: new URL("../../assets/event-backgrounds/share-6x5/28-camping.webp", import.meta.url),
  FI: new URL("../../assets/event-backgrounds/share-6x5/29-fishing.webp", import.meta.url),
  KY: new URL("../../assets/event-backgrounds/share-6x5/30-kayaking.webp", import.meta.url),
  CT: new URL("../../assets/event-backgrounds/share-6x5/31-city-walk.webp", import.meta.url),
  DR: new URL("../../assets/event-backgrounds/share-6x5/32-dinner.webp", import.meta.url),
  LX: new URL("../../assets/share-backgrounds/webp/33-language-exchange.webp", import.meta.url),
  CW: new URL("../../assets/event-backgrounds/share-6x5/34-coworking.webp", import.meta.url),
  MT: new URL("../../assets/event-backgrounds/share-6x5/35-new-connections.webp", import.meta.url),
  AR: new URL("../../assets/share-backgrounds/webp/36-drawing.webp", import.meta.url),
  PH: new URL("../../assets/share-backgrounds/webp/37-photo-walk.webp", import.meta.url),
  CR: new URL("../../assets/share-backgrounds/webp/38-ceramics.webp", import.meta.url),
  JM: new URL("../../assets/event-backgrounds/share-6x5/39-music-jam.webp", import.meta.url),
  WS: new URL("../../assets/event-backgrounds/share-6x5/40-workshop.webp", import.meta.url),
} as const;

export type EventShareBackgroundCode = keyof typeof eventShareBackgroundUrls;

export const resolveEventShareBackgroundUrl = (input: EventArtworkInput) => {
  const code = resolveEventArtworkCode(input);
  return (eventShareBackgroundUrls as Partial<Record<string, URL>>)[code] || null;
};
