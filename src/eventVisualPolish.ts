import { activityOptions } from "./data";
import { stripLeadingEmoji } from "./cardText";

const emojiSequence = String.raw`(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\u200D|\p{Emoji_Modifier})*`;
const emojiAfterSeparatorPattern = new RegExp(`([·:|/]\\s*)${emojiSequence}\\s*`, "gu");

const normalizedOptions = Object.values(activityOptions)
  .flatMap((options) => options.flatMap((option) =>
    Object.values(option.name).map((name) => ({
      icon: option.icon,
      name: name.trim().toLocaleLowerCase(),
    })),
  ))
  .sort((left, right) => right.name.length - left.name.length);
