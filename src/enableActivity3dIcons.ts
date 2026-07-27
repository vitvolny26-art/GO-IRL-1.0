import { getActivityIconAsset, getCategoryIconAsset } from "./activityIconAssets";

const emojiPattern = /^(?:\s|\u200d|\ufe0f|\p{Extended_Pictographic})+/u;

const replaceLeadingEmoji = (element: HTMLElement) => {
  if (element.dataset.activity3dIconProcessed === "true") return;
  const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
  const text = textNode?.textContent || "";
  const match = text.match(emojiPattern)?.[0]?.trim();
  if (!match) return;
  const src = getActivityIconAsset(match);
  if (!src) return;

  const image = document.createElement("img");
  image.className = "activity-3d-icon activity-3d-icon-inline";
  image.src = src;
  image.alt = "";
  image.decoding = "async";
  image.loading = "lazy";
  textNode!.textContent = text.replace(emojiPattern, "").trimStart();
  element.insertBefore(image, element.firstChild);
  element.dataset.activity3dIconProcessed = "true";
};

const replaceCategoryIcon = (button: HTMLButtonElement) => {
  if (button.dataset.category3dIconProcessed === "true") return;
  const categoryId = button.dataset.categoryId;
  const fallbackSpan = button.querySelector(":scope > span");
  const fallbackEmoji = fallbackSpan?.textContent?.trim() || "";
  const categoryOrder = Array.from(button.parentElement?.children || []).indexOf(button);
  const inferredId = ["sport", "activities", "party", "nature", "social", "creativity"][categoryOrder];
  const src = getCategoryIconAsset(categoryId || inferredId || "") || getActivityIconAsset(fallbackEmoji);
  if (!src) return;

  const image = document.createElement("img");
  image.className = "activity-3d-icon";
  image.src = src;
  image.alt = "";
  image.decoding = "async";
  image.loading = "lazy";
  fallbackSpan?.replaceWith(image);
  button.dataset.category3dIconProcessed = "true";
};

const cleanSelectOptions = (select: HTMLSelectElement) => {
  if (select.dataset.activity3dIconProcessed === "true") return;
  Array.from(select.options).forEach((option) => {
    option.textContent = (option.textContent || "").replace(emojiPattern, "").trimStart();
  });
  select.dataset.activity3dIconProcessed = "true";
};

const processRoot = (root: ParentNode) => {
  root.querySelectorAll<HTMLButtonElement>(".category-grid.module-grid .category-button").forEach(replaceCategoryIcon);
  root.querySelectorAll<HTMLElement>("button, .filter, .quick-template").forEach(replaceLeadingEmoji);
  root.querySelectorAll<HTMLSelectElement>('select[name="categoryId"], select[name="activityText"]').forEach(cleanSelectOptions);
};

export const enableActivity3dIcons = () => {
  processRoot(document);
  const observer = new MutationObserver(() => processRoot(document));
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
};
