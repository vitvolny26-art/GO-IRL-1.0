import type { BeautyWorkspace } from "./beautySetupModel";
import { saveBeautyWorkspace as saveBeautyWorkspaceNow } from "./beautyWorkspaceRepository";

type WorkspaceSaver = (workspace: BeautyWorkspace) => Promise<void>;

export function createBeautyWorkspaceSaveQueue(save: WorkspaceSaver) {
  let tail: Promise<void> = Promise.resolve();

  return (workspace: BeautyWorkspace) => {
    const task = tail
      .catch(() => undefined)
      .then(() => save(workspace));

    tail = task.then(() => undefined, () => undefined);
    return task;
  };
}

export const saveBeautyWorkspace = createBeautyWorkspaceSaveQueue(saveBeautyWorkspaceNow);
