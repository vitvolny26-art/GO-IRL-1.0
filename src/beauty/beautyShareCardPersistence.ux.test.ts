import { describe, expect, it } from "vitest";
import editorSource from "./BeautyShareCardEditor.tsx?raw";
import repositorySource from "./beautyShareCardRepository.ts?raw";
import storageSource from "./beautyWorkspaceStorage.ts?raw";

describe("Beauty share card persistence contract", () => {
  it("waits for trusted Telegram auth instead of silently skipping remote persistence", () => {
    expect(repositorySource).toContain("initializeTrustedAuth");
    expect(repositorySource).toContain("await initializeTrustedAuth()");
    expect(repositorySource).toContain("beauty_share_trusted_auth_required");
    expect(repositorySource).toContain("if (!(await ensureTrustedBeautyStorage(true))) return");
    expect(repositorySource).toContain("beauty_share_card_rpc_missing");
  });

  it("publishes ready only after Storage and RPC persistence succeed", () => {
    const saveFlow = storageSource.slice(
      storageSource.indexOf("const saveBeautyWorkspaceNow = async"),
      storageSource.indexOf("const enqueueBeautyWorkspaceSave"),
    );
    expect(storageSource).toContain("prepareBeautyWorkspaceForPersistence");
    expect(saveFlow.indexOf("await saveRemoteBeautyShareCard(persistedWorkspace)")).toBeLessThan(
      saveFlow.indexOf('status: "ready"'),
    );
    expect(storageSource).toContain("beautyShareCardPersistenceEvent");
    expect(saveFlow).toContain('dispatchBeautyShareCardPersistence({ sourceFingerprint, status: "ready"');
    expect(saveFlow).toContain('dispatchBeautyShareCardPersistence({ sourceFingerprint, status: "error"');
  });

  it("keeps the editor updating until the persistence event confirms the fingerprint", () => {
    expect(editorSource).toContain("beautyShareCardPersistenceEvent");
    expect(editorSource).toContain("current.shareCard.sourceFingerprint !== detail.sourceFingerprint");
    const renderedCard = editorSource.slice(
      editorSource.indexOf("void renderBeautyShareCard"),
      editorSource.indexOf(".catch((error: unknown)"),
    );
    expect(renderedCard).toContain('status: "updating"');
    expect(renderedCard).not.toContain('status: "ready"');
  });
});
