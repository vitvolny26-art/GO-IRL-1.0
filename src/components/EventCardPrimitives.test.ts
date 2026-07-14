import { describe, expect, it } from "vitest";
import { eventStatusTone } from "./EventCardPrimitives";
import { resolveEventInteractionState } from "../eventInteractionState";

const base = {
  isOrganizer: false,
  isJoined: false,
  isWaiting: false,
  isPending: false,
  isFull: false,
  visibility: "public" as const,
};

describe("eventStatusTone", () => {
  it("uses warning rather than error styling for full events", () => {
    expect(eventStatusTone(resolveEventInteractionState({ ...base, isFull: true }))).toBe("warning");
  });

  it("keeps finished and private states neutral", () => {
    expect(eventStatusTone(resolveEventInteractionState({ ...base, isFinished: true }))).toBe("neutral");
    expect(eventStatusTone(resolveEventInteractionState({ ...base, visibility: "private" }))).toBe("neutral");
  });
});
