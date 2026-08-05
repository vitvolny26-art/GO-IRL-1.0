import { describe, expect, it, vi } from "vitest";
import { createDefaultBeautyWorkspace } from "./beautySetupModel";
import { createBeautyWorkspaceSaveQueue } from "./beautyWorkspaceSaveQueue";

describe("Beauty workspace save queue", () => {
  it("runs overlapping save requests sequentially", async () => {
    const order: string[] = [];
    let releaseFirst: (() => void) | undefined;
    const firstGate = new Promise<void>((resolve) => { releaseFirst = resolve; });
    const save = vi.fn(async (workspace) => {
      order.push(`start:${workspace.profile.displayName}`);
      if (workspace.profile.displayName === "First") await firstGate;
      order.push(`end:${workspace.profile.displayName}`);
    });
    const enqueue = createBeautyWorkspaceSaveQueue(save);
    const base = createDefaultBeautyWorkspace("en");

    const first = enqueue({ ...base, profile: { ...base.profile, displayName: "First" } });
    const second = enqueue({ ...base, profile: { ...base.profile, displayName: "Second" } });

    await vi.waitFor(() => expect(order).toEqual(["start:First"]));
    releaseFirst?.();
    await Promise.all([first, second]);

    expect(order).toEqual(["start:First", "end:First", "start:Second", "end:Second"]);
  });

  it("continues with the next queued save after a failure", async () => {
    const order: string[] = [];
    const save = vi.fn(async (workspace) => {
      order.push(workspace.profile.displayName);
      if (workspace.profile.displayName === "First") throw new Error("conflict");
    });
    const enqueue = createBeautyWorkspaceSaveQueue(save);
    const base = createDefaultBeautyWorkspace("en");

    const first = enqueue({ ...base, profile: { ...base.profile, displayName: "First" } });
    const second = enqueue({ ...base, profile: { ...base.profile, displayName: "Second" } });

    await expect(first).rejects.toThrow("conflict");
    await expect(second).resolves.toBeUndefined();
    expect(order).toEqual(["First", "Second"]);
  });
});
