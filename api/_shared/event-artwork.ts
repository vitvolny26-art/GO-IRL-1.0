import { appEventArtworkSvg } from "./app-event-emoji-sprite.js";
import { materialEventArtworkPaths } from "./material-event-artwork.js";

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
  .