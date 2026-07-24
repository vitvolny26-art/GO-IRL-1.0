import { describe, expect, it } from "vitest";
import { localDateKey, reconcileVisualDemoSnapshot } from "./visualDemoState";

type Demo = { id: string; date: string; joined?: boolean };

describe("visual demo state", () => {
  it("uses the browser-local calendar date", () => {
    expect(localDateKey(new Date(2026, 6, 24, 0, 15))).toBe("2026-07-24");
  });

  it("refreshes seed dates once the stored day changes", () => {
    const raw = JSON.stringify({
      seededOn: "2026-07-23",
      activities: [{ id: "demo-volleyball", date: "2026-07-24", joined: true }],
    });
    const seeded: Demo[] = [{ id: "demo-volleyball", date: "2026-07-25" }];

    expect(reconcileVisualDemoSnapshot(raw, seeded, new Date(2026, 6, 24), () => true))
      .toEqual({ seededOn: "2026-07-24", activities: seeded });
  });

  it("preserves visible custom events and removes expired ones", () => {
    const raw = JSON.stringify({
      seededOn: "2026-07-23",
      activities: [
        { id: "demo-volleyball", date: "2026-07-24" },
        { id: "custom-future", date: "2026-07-26" },
        { id: "custom-expired", date: "2026-07-20" },
      ],
    });
    const seeded: Demo[] = [{ id: "demo-volleyball", date: "2026-07-25" }];

    expect(reconcileVisualDemoSnapshot(
      raw,
      seeded,
      new Date(2026, 6, 24),
      (activity) => activity.date >= "2026-07-24",
    ).activities).toEqual([
      { id: "demo-volleyball", date: "2026-07-25" },
      { id: "custom-future", date: "2026-07-26" },
    ]);
  });
});

