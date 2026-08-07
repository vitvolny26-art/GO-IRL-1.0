import { getActivityIconAsset, getCategoryIconAsset } from "./activityIconAssets";

const emojiPattern = /^(?:\s|\u200d|\ufe0f|\p{Extended_Pictographic})+/u;

const categoryEmojiIds: Readonly<Record<string, string>> = {
  "🏆": "sport",
  "🎉": "activities",
  "🍻": "party",
  "🌿": "nature",
  "❤️": "social",
  "❤": "social",
  "🎨": "creativity",
};

const replaceLeadingEmoji = (element: HTMLElement) => {
  if (element.dataset.activity3dIconProcessed === "true") return;
  const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
  const text = textNode?.textContent || "";
  const match = text.match(emojiPattern)?.[0]?.trim();
  if (!match) return;

  const categoryId = element.classList.contains("filter") ? categoryEmojiIds[match] : undefined;
  const src = categoryId ? getCategoryIconAsset(categoryId) : getActivityIconAsset(match);
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

const optionIconSource = (select: HTMLSelectElement, option: HTMLOptionElement) => {
  if (select.name === "categoryId") return getCategoryIconAsset(option.value);
  const text = option.textContent || "";
  const emoji = text.match(emojiPattern)?.[0]?.trim();
  const label = text.replace(emojiPattern, "").trimStart();
  return emoji ? getActivityIconAsset(emoji, label) : null;
};

const updateSelectIcon = (select: HTMLSelectElement) => {
  const option = select.selectedOptions[0];
  const src = option?.dataset.activityIconSrc || (select.name === "categoryId" ? getCategoryIconAsset(select.value) : null);
  if (!src) {
    select.classList.remove("activity-3d-select");
    select.style.removeProperty("--activity-select-icon");
    return;
  }
  select.classList.add("activity-3d-select");
  select.style.setProperty("--activity-select-icon", `url("${src}")`);
};

const cleanSelectOptions = (select: HTMLSelectElement) => {
  if (select.dataset.activity3dIconProcessed !== "true") {
    Array.from(select.options).forEach((option) => {
      const src = optionIconSource(select, option);
      if (src) option.dataset.activityIconSrc = src;
      option.textContent = (option.textContent || "").replace(emojiPattern, "").trimStart();
    });
    select.dataset.activity3dIconProcessed = "true";
  }

  if (select.dataset.activity3dSelectDecorated !== "true") {
    select.addEventListener("change", () => updateSelectIcon(select));
    select.dataset.activity3dSelectDecorated = "true";
  }
  updateSelectIcon(select);
};

const processRoot = (root: ParentNode) => {
  root.querySelectorAll<HTMLElement>("button, .filter, .quick-template").forEach(replaceLeadingEmoji);
  root.querySelectorAll<HTMLSelectElement>('select[name="categoryId"], select[name="activityText"]').forEach(cleanSelectOptions);
};

export const enableActivity3dIcons = () => {
  processRoot(document);
  const observer = new MutationObserver(() => processRoot(document));
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
};