import type { BeautyWorkspace } from "./beautySetupModel";

type BeautyWorkspaceSaver = (workspace: BeautyWorkspace) => Promise<void>;

export function createBeautyWorkspaceSaveQueue(save: BeautyWorkspaceSaver) {
  let tail: Promise<void> = Promise.resolve();

  return (workspace: BeautyWorkspace) => {
    const task = tail
      .catch(() => undefined)
      .then(() => save(workspace));

    tail = task.then(() => undefined, () => undefined);
    return task;
  };
}
