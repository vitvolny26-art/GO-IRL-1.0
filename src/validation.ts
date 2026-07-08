import type { Translation } from "./i18n";

export const MAX_EVENT_PRICE = 100_000;
export const MAX_EVENT_TITLE_LENGTH = 80;
export const MAX_EVENT_DESCRIPTION_LENGTH = 500;
export const MAX_EVENT_ADDRESS_LENGTH = 140;
export const MAX_EVENT_NOTE_LENGTH = 240;
export const MIN_EVENT_CAPACITY = 2;
export const MAX_EVENT_CAPACITY = 100;

export const validateEventPrice = (price: number, t: Translation) => {
  if (!Number.isFinite(price)) return t.priceInvalid;
  if (price < 0) return t.priceNegative;
  if (price > MAX_EVENT_PRICE) return t.priceTooHigh;
  return "";
};

export const validateRequiredText = (value: string, t: Translation) => {
  if (!value.trim()) return t.requiredField;
  return "";
};

export const validateMaxLength = (value: string, maxLength: number, message: string) => {
  if (value.trim().length > maxLength) return message;
  return "";
};

export const validateEventCapacity = (capacity: number, t: Translation) => {
  if (!Number.isInteger(capacity)) return t.capacityInvalid;
  if (capacity < MIN_EVENT_CAPACITY || capacity > MAX_EVENT_CAPACITY) return t.capacityInvalid;
  return "";
};

export const validateEventDate = (date: string, t: Translation) => {
  const today = new Date().toISOString().slice(0, 10);
  if (!date || date < today) return t.dateInPast;
  return "";
};

export const validateOptionalUrl = (url: string, t: Translation) => {
  const value = url.trim();
  if (!value) return "";
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? "" : t.urlInvalid;
  } catch {
    return t.urlInvalid;
  }
};
