import { describe, expect, it, vi } from "vitest";
import { eventPrimaryActionTarget, isActivityFinished, resolveEventInteractionState, runEventPrimaryAction, shouldJoinFromPrimaryAction } from "./eventInteractionState";

const base = {
  isOrganizer: false,
  isJoined: false,
  isWaiting: false,
  isPending: false,
  isFull: false,
  visibility: "public" as const,
};

describe("resolveEventInteractionState", () => {
  it.each([
    [{ ...base, isOrganizer: true }, "manage", "organizer", false],
    [{ ...base, isJoined: true }, "open-chat", "joined", false],
    [{ ...base, isWaiting: true }, "leave", "waiting", false],
    [{ ...base, isPending: true, visibility: "invite" as const }, "cancel-request", "pending", false],
    [base, "join", "public", false],
    [{ ...base, visibility: "invite" as const }, "request-join", "public", false],
    [{ ...base, isFull: true }, "full", "full", true],
    [{ ...base, isFull: true, hasWaitingList: true }, "join-waitlist", "full", false],
    [{ ...base, visibility: "private" as const }, "private", "private", true],
    [{ ...base, isFinished: true }, "finished", "finished", true],
  ])("resolves %#", (input, action, status, disabled) => {
    expect(resolveEventInteractionState(input)).toMatchObject({ primaryAction: action, status, disabled });
  });

  it("shows helper actions only to active organizers and joined participants", () => {
    expect(resolveEventInteractionState({ ...base, isOrganizer: true }).showHelperAction).toBe(true);
    expect(resolveEventInteractionState({ ...base, isJoined: true }).showHelperAction).toBe(true);
    expect(resolveEventInteractionState(base).showHelperAction).toBe(false);
    expect(resolveEventInteractionState({ ...base, isOrganizer: true, isFinished: true }).showHelperAction).toBe(false);
  });

  it("classifies actions that mutate membership", () => {
    expect(shouldJoinFromPrimaryAction("join")).toBe(true);
    expect(shouldJoinFromPrimaryAction("cancel-request")).toBe(true);
    expect(shouldJoinFromPrimaryAction("open-chat")).toBe(false);
    expect(eventPrimaryActionTarget("manage")).toBe("open");
    expect(eventPrimaryActionTarget("open-chat")).toBe("chat");
    expect(eventPrimaryActionTarget("join")).toBe("join");
    expect(eventPrimaryActionTarget("full")).toBe("none");
  });
});

describe("runEventPrimaryAction", () => {
  it.each([
    ["manage", "open"],
    ["open-chat", "openChat"],
    ["join", "join"],
    ["request-join", "join"],
    ["cancel-request", "join"],
  ] as const)("routes %s to %s", (action, expected) => {
    const handlers = { open: vi.fn(), openChat: vi.fn(), join: vi.fn() };
    runEventPrimaryAction(action, handlers);
    expect(handlers[expected]).toHaveBeenCalledOnce();
    expect(Object.values(handlers).reduce((calls, handler) => calls + handler.mock.calls.length, 0)).toBe(1);
  });

  it("does nothing for a disabled full-event action", () => {
    const handlers = { open: vi.fn(), openChat: vi.fn(), join: vi.fn() };
    expect(runEventPrimaryAction("full", handlers)).toBe("none");
    expect(Object.values(handlers).every((handler) => handler.mock.calls.length === 0)).toBe(true);
  });
});

describe("isActivityFinished", () => {
  it("compares the event date and time with an injected clock", () => {
    const now = new Date("2026-07-15T12:00:00");
    expect(isActivityFinished({ date: "2026-07-15", time: "09:59" }, now)).toBe(true);
    expect(isActivityFinished({ date: "2026-07-15", time: "11:00" }, now)).toBe(false);
  });
});
