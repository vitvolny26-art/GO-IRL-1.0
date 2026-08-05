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
import type { Language } from "../types";
import type { BeautyWorkspace } from "./beautySetupModel";

export const loadBeautyWorkspace = async (language: Language = "en") => {
  const workspace = await loadBeautyWorkspaceBase(language);
  const withShareCard = await loadRemoteBeautyShareCard(workspace);
  return withShareCard;
};

export const saveBeautyWorkspace = async (workspace: BeautyWorkspace) => {
  await saveBeautyWorkspaceBase(workspace);
  await saveRemoteBeautyShareCard(workspace);
};

export const resetBeautyWorkspace = async () => {
  resetRemoteBeautyShareCardState();
  await resetBeautyWorkspaceBase();
};

export { updateBeautyPublicSlug };
export { beautyStorageMetadata } from "./beautyWorkspaceLocalStorage";
