export const eventMainBlockOrder = [
  "details",
  "participants",
  "chat",
] as const;

export type EventMainBlockSection = typeof eventMainBlockOrder[number];

export const isChatFinalEventMainBlockSection = (
  order: readonly EventMainBlockSection[] = eventMainBlockOrder,
): boolean => order.at(-1) === "chat";

export const hasRequiredEventMainBlockSections = (
  order: readonly EventMainBlockSection[] = eventMainBlockOrder,
): boolean => eventMainBlockOrder.every((section) => order.includes(section));
