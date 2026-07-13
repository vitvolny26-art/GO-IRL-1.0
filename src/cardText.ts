const leadingEmojiPattern = /^(?:(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\u200D|\p{Emoji_Modifier})*\s*)+/u;

export const stripLeadingEmoji = (value: string) => {
  const trimmed = value.trimStart();
  const cleaned = trimmed.replace(leadingEmojiPattern, "").trimStart();
  return cleaned || trimmed;
};
