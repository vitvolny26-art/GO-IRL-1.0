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

export const beautyShareCardPersistenceEvent = "go-irl-beauty-share-card-persistence";

export type BeautyShareCardPersistenceDetail = {
  sourceFingerprint: string;
  status: "ready" | "error";
  errorMessage: string;
};

const dispatchBeautyShareCardPersistence = (detail: BeautyShareCardPersistenceDetail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<BeautyShareCardPersistenceDetail>(beautyShareCardPersistenceEvent, { detail }));
};

export const prepareBeautyWorkspaceForPersistence = (workspace: BeautyWorkspace) => {
  const card = workspace.shareCard;
  if (
    !card.enabled
    || card.status !== "updating"
    || !card.generatedImageDataUrl
    || !card.sourceFingerprint
  ) return workspace;

  return {
    ...workspace,
    shareCard: {
      ...card,
      status: "ready" as const,
      errorMessage: "",
    },
  };
};

export const loadBeautyWorkspace = async (language: Language = "en") => {
  const workspace = await loadBeautyWorkspaceBase(language);
  const withShareCard = await loadRemoteBeautyShareCard(workspace);
  return withShareCard;
};

const saveBeautyWorkspaceNow = async (workspace: BeautyWorkspace) => {
  const persistedWorkspace = prepareBeautyWorkspaceForPersistence(workspace);
  const confirmsGeneratedCard = persistedWorkspace !== workspace;
  const sourceFingerprint = workspace.shareCard.sourceFingerprint;

  try {
    await saveBeautyWorkspaceBase(workspace);
    await saveRemoteBeautyShareCard(persistedWorkspace);
    if (confirmsGeneratedCard) {
      await saveBeautyWorkspaceBase(persistedWorkspace);
      dispatchBeautyShareCardPersistence({ sourceFingerprint, status: "ready", errorMessage: "" });
    }
  } catch (error) {
    if (confirmsGeneratedCard) {
      const errorMessage = error instanceof Error ? error.message : "beauty_share_card_save_failed";
      const failedWorkspace: BeautyWorkspace = {
        ...workspace,
        shareCard: { ...workspace.shareCard, status: "error", errorMessage },
      };
      await saveBeautyWorkspaceBase(failedWorkspace).catch(() => undefined);
      dispatchBeautyShareCardPersistence({ sourceFingerprint, status: "error", errorMessage });
    }
    throw error;
  }
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
