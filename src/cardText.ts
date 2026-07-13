const leadingEmojiPattern = /^(?:(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\u200D|\p{Emoji_Modifier})*\s*)+/u;

export const stripLeadingEmoji = (value: string) => {
  const trimmed = value.trimStart();
  const cleaned = trimmed.replace(leadingEmojiPattern, "").trimStart();
  return cleaned || trimmed;
};

const cardTextSelector = ".sport-card-main h3, .sport-card-main p";

const cleanElement = (element: Element) => {
  const current = element.textContent || "";
  const cleaned = stripLeadingEmoji(current);
  if (cleaned !== current) element.textContent = cleaned;
};

const cleanCardText = (root: ParentNode) => {
  if (root instanceof Element && root.matches(cardTextSelector)) cleanElement(root);
  root.querySelectorAll(cardTextSelector).forEach(cleanElement);
};

export const enableCardTextCleanup = () => {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return () => undefined;

  const cleanNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parent = node.parentElement;
      if (parent?.matches(cardTextSelector)) cleanElement(parent);
      return;
    }
    if (node instanceof Element || node instanceof Document) cleanCardText(node);
  };

  cleanCardText(document);
  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      cleanNode(record.target);
      record.addedNodes.forEach(cleanNode);
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return () => observer.disconnect();
};
