import { useMemo } from "react";
import { resolveEventArtworkCode } from "../../api/_shared/event-artwork.js";
import { betaEventIllustrationSpriteBase64, betaEventIllustrationTiles } from "../../api/_shared/event-illustration-sprite.js";

type EventCardArtworkProps = {
  icon: string;
  activity: string;
  title: string;
};

type IllustrationCode = keyof typeof betaEventIllustrationTiles;

const spriteWidth = 384;
const spriteHeight = 192;
const tileSize = 96;

const artworkDataUrl = (code: IllustrationCode) => {
  const tile = betaEventIllustrationTiles[code];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${tile.left} ${tile.top} ${tileSize} ${tileSize}" preserveAspectRatio="xMidYMid slice"><image href="data:image/webp;base64,${betaEventIllustrationSpriteBase64}" width="${spriteWidth}" height="${spriteHeight}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export function EventCardArtwork({ icon, activity, title }: EventCardArtworkProps) {
  const code = resolveEventArtworkCode({ icon, activity, title });
  const tileCode = code in betaEventIllustrationTiles ? code as IllustrationCode : null;
  const src = useMemo(() => tileCode ? artworkDataUrl(tileCode) : null, [tileCode]);

  return (
    <div className="glass-event-card-artwork" aria-hidden="true">
      {src
        ? <img className="glass-event-card-artwork-image" src={src} alt="" decoding="async" />
        : <span className="glass-event-card-artwork-fallback">{icon || "✨"}</span>}
    </div>
  );
}
