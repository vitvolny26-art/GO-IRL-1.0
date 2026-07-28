import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const panelSource = readFileSync(
  fileURLToPath(new URL("./ExternalTelegramChatPanel.tsx", import.meta.url)),
  "utf8",
);

describe("external Telegram chat UX", () => {
  it("describes the supported existing-group binding flow", () => {
    expect(panelSource).toContain("Привязать существующую группу");
    expect(panelSource).toContain("Новую группу нужно сначала создать вручную");
    expect(panelSource).toContain("Проверить привязку");
  });

  it("keeps retry available and removes clipboard automation", () => {
    expect(panelSource).toContain('awaitingBinding ? "Выбрать другую группу"');
    expect(panelSource).not.toContain("disabled={saving || awaitingBinding}");
    expect(panelSource).not.toContain("navigator.clipboard");
    expect(panelSource).not.toContain("ClipboardPaste");
  });
});
