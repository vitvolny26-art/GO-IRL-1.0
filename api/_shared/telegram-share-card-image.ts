import sharp from "sharp";
import type { TelegramEventCardInput } from "./telegram-event-card.js";
import { buildTelegramShareCardSvg } from "./telegram-share-card-svg.js";

export const renderTelegramShareCardJpeg = (input: TelegramEventCardInput) =>
  sharp(Buffer.from(buildTelegramShareCardSvg(input)))
    .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
    .toBuffer();
