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
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[’']/g, "")
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .trim();

export const eventArtworkRegistry: readonly EventArtworkEntry[] = [
  { code: "VB", emoji: "🏐", aliases: ["volleyball", "волейбол", "volejbal"] },
  { code: "FB", emoji