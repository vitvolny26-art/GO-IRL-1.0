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
    backgroundImage: `url("${image}")`,
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };
};
