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

export const cleanEventDetailText = (value: string) =>
  stripLeadingEmoji(value)
    .replace(emojiAfterSeparatorPattern, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

export const activityIconFromText = (value: string) => {
  const normalized = cleanEventDetailText(value).toLocaleLowerCase();
  return normalizedOptions.find((option) => normalized.includes(option.name))?.icon || null;
};

const polishCard = (cardMain: Element) => {
  const glyph = cardMain.querySelector<HTMLElement>(".sport-avatar-glyph");
  if (!glyph) return;

  const title = cardMain.querySelector("h3")?.textContent || "";
  const subtitle = cardMain.querySelector("p")?.textContent || "";
  const icon = activityIconFromText(`${title} ${subtitle}`);
  if (icon && glyph.textContent !== icon) glyph.textContent = icon;
};

const polishDetailText = (element: Element) => {
  const current = element.textContent || "";
  const cleaned = cleanEventDetailText(current);
  if (cleaned !== current) element.textContent = cleaned;
};

const polishSheet = (sheet: Element) => {
  const label = sheet.querySelector(".sheet-label")?.textContent || "";
  const title = sheet.querySelector("h2")?.textContent || "";
  const icon = activityIconFromText(`${label} ${title}`);
  const symbol = sheet.querySelector<HTMLElement>(".sheet-symbol");
  if (icon && symbol && symbol.textContent !== icon) symbol.textContent = icon;

  sheet.querySelectorAll(".sheet-label, h2").forEach(polishDetailText);
};

const polishRoot = (root: ParentNode) => {
  if (root instanceof Element) {
    if (root.matches(".unified-event-card .sport-card-main")) polishCard(root);
    if (root.matches(".activity-sheet")) polishSheet(root);
    if (root.matches(".activity-sheet .sheet-label, .activity-sheet h2")) polishDetailText(root);
  }

  root.querySelectorAll(".unified-event-card .sport-card-main").forEach(polishCard);
  root.querySelectorAll(".activity-sheet").forEach(polishSheet);
};

export const enableEventVisualPolish = () => {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return () => undefined;

  polishRoot(document);
  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.target instanceof Element) polishRoot(record.target);
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) polishRoot(node);
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return () => observer.disconnect();
};