import { describe, expect, it } from "vitest";
import { getTranslation } from "./i18n";
import {
  MAX_EVENT_ADDRESS_LENGTH,
  MAX_EVENT_CAPACITY,
  MAX_EVENT_DESCRIPTION_LENGTH,
  MAX_EVENT_NOTE_LENGTH,
  MAX_EVENT_PRICE,
  MAX_EVENT_TITLE_LENGTH,
  MIN_EVENT_CAPACITY,
  validateEventCapacity,
  validateEventDate,
  validateEventPrice,
  validateMaxLength,
  validateOptionalUrl,
  validateRequiredText,
} from "./validation";

describe("event price validation", () => {
  const t = getTranslation("ru");

  it("rejects prices above the supported limit", () => {
    expect(validateEventPrice(MAX_EVENT_PRICE + 1, t)).toBe(t.priceTooHigh);
  });

  it("rejects negative prices", () => {
    expect(validateEventPrice(-1, t)).toBe(t.priceNegative);
  });

  it("allows free and maximum supported prices", () => {
    expect(validateEventPrice(0, t)).toBe("");
    expect(validateEventPrice(MAX_EVENT_PRICE, t)).toBe("");
  });

  it("rejects empty required text", () => {
    expect(validateRequiredText("   ", t)).toBe(t.requiredField);
  });

  it("rejects overlong event text fields", () => {
    expect(validateMaxLength("x".repeat(MAX_EVENT_TITLE_LENGTH + 1), MAX_EVENT_TITLE_LENGTH, t.titleTooLong)).toBe(t.titleTooLong);
    expect(validateMaxLength("x".repeat(MAX_EVENT_DESCRIPTION_LENGTH + 1), MAX_EVENT_DESCRIPTION_LENGTH, t.descriptionTooLong)).toBe(t.descriptionTooLong);
    expect(validateMaxLength("x".repeat(MAX_EVENT_ADDRESS_LENGTH + 1), MAX_EVENT_ADDRESS_LENGTH, t.addressTooLong)).toBe(t.addressTooLong);
    expect(validateMaxLength("x".repeat(MAX_EVENT_NOTE_LENGTH + 1), MAX_EVENT_NOTE_LENGTH, t.noteTooLong)).toBe(t.noteTooLong);
  });

  it("validates participant capacity range", () => {
    expect(validateEventCapacity(MIN_EVENT_CAPACITY, t)).toBe("");
    expect(validateEventCapacity(MAX_EVENT_CAPACITY, t)).toBe("");
    expect(validateEventCapacity(MIN_EVENT_CAPACITY - 1, t)).toBe(t.capacityInvalid);
    expect(validateEventCapacity(MAX_EVENT_CAPACITY + 1, t)).toBe(t.capacityInvalid);
  });

  it("rejects past dates", () => {
    expect(validateEventDate("2000-01-01", t)).toBe(t.dateInPast);
  });

  it("accepts http urls and rejects invalid place links", () => {
    expect(validateOptionalUrl("", t)).toBe("");
    expect(validateOptionalUrl("https://maps.google.com/example", t)).toBe("");
    expect(validateOptionalUrl("not a url", t)).toBe(t.urlInvalid);
    expect(validateOptionalUrl("ftp://example.com", t)).toBe(t.urlInvalid);
  });
});
