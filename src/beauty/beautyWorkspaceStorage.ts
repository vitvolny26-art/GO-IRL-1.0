import {
  loadBeautyWorkspace as loadBeautyWorkspaceBase,
  resetBeautyWorkspace as resetBeautyWorkspaceBase,
  saveBeautyWorkspace as saveBeautyWorkspaceBase,
  updateBeautyPublicSlug,
} from "./beautyWorkspaceRepository";
import {
  loadRemoteBeautyShareCard,
  resetRemoteBeautyShareCardState,
  saveRemoteBeautyShareCard,
} from "./beautyShareCardRepository";
import { createBeautyWorkspaceSaveQueue } from "./beautyWorkspaceSaveQueue";
import type { Language } from "../types";
import type { BeautyWorkspace } from "./beautySetupModel";

export const loadBeautyWorkspace = async (language: Language = "en") => {
  const workspace = await loadBeautyWorkspaceBase(language);
  const withShareCard = await loadRemoteBeautyShareCard(workspace);
  return withShareCard;
};

const saveBeautyWorkspaceNow = async (workspace: BeautyWorkspace) => {
  await saveBeautyWorkspaceBase(workspace);
  await saveRemoteBeautyShareCard(workspace);
};

const enqueueBeautyWorkspaceSave = createBeautyWorkspaceSaveQueue(saveBeautyWorkspaceNow);

export const saveBeautyWorkspace = (workspace: BeautyWorkspace) =>
  enqueueBeautyWorkspaceSave(workspace);

export const resetBeautyWorkspace = async () => {
  resetRemoteBeautyShareCardState();
  await resetBeautyWorkspaceBase();
};

export { updateBeautyPublicSlug };
export { beautyStorageMetadata } from "./beautyWorkspaceLocalStorage";
