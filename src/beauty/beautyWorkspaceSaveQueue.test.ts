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

    await Promise.resolve();
    expect(order).toEqual(["start:First"]);

    releaseFirst?.();
    await Promise.all([first, second]);

    expect(order).toEqual(["start:First", "end:First", "start:Second", "end:Second"]);
  });

  it("continues after a failed save", async () => {
    const base = createDefaultBeautyWorkspace("en");
    const save = vi.fn()
      .mockRejectedValueOnce(new Error("conflict"))
      .mockResolvedValueOnce(undefined);
    const enqueue = createBeautyWorkspaceSaveQueue(save);

    await expect(enqueue(base)).rejects.toThrow("conflict");
    await expect(enqueue(base)).resolves.toBeUndefined();
    expect(save).toHaveBeenCalledTimes(2);
  });
});
