import type { CSSProperties } from "react";
import { resolveEventArtworkCode } from "../api/_shared/event-artwork.js";
import { getEventBackground } from "./eventBackgrounds";

type EventSheetBackgroundInput = {
  icon?: string;
  activity?: string;
  title?: string;
};

export const getEventSheetBackgroundStyle = ({
  icon = "",
  activity = "",
  title = "",
}: EventSheetBackgroundInput): CSSProperties | undefined => {
  const code = resolveEventArtworkCode({ icon, activity, title });
  const image = getEventBackground(code);

  if (!image) return undefined;

  return {
    backgroundColor: "#111319",
    backgroundImage:
      `linear-gradient(180deg, rgba(10, 12, 15, 0.58) 0%, rgba(10, 12, 15, 0.9) 46%, rgba(10, 12, 15, 0.98) 100%), url("${image}")`,
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };
};
