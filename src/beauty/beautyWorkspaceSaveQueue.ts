import type { BeautyWorkspace } from "./beautySetupModel";
import { saveBeautyWorkspace as saveBeautyWorkspaceNow } from "./beautyWorkspaceRepository";

type WorkspaceSaver = (workspace: BeautyWorkspace) => Promise<void>;
type SaveStatus = "idle" | "saving" | "saved" | "error";

const saveCopy = {
  ru: { action: "Сохранить изменения", saving: "Сохраняется…", saved: "Изменения сохранены", error: "Не удалось сохранить. Нажмите, чтобы повторить." },
  uk: { action: "Зберегти зміни", saving: "Зберігається…", saved: "Зміни збережено", error: "Не вдалося зберегти. Натисніть, щоб повторити." },
  cs: { action: "Uložit změny", saving: "Ukládání…", saved: "Změny byly uloženy", error: "Uložení se nezdařilo. Klepněte pro opakování." },
  en: { action: "Save changes", saving: "Saving…", saved: "Changes saved", error: "Could not save. Tap to retry." },
} as const;

let latestWorkspace: BeautyWorkspace | null = null;
let saveStatus: SaveStatus = "idle";
let latestRequest = 0;
let dockObserver: MutationObserver | null = null;

const currentLanguage = () => {
  if (typeof document === "undefined") return "en" as const;
  const language = document.documentElement.lang.slice(0, 2);
  return language === "ru" || language === "uk" || language === "cs" ? language : "en";
};

const ensureDockStyles = () => {
  if (document.querySelector("style[data-beauty-save-dock-style]")) return;
  const style = document.createElement("style");
  style.dataset.beautySaveDockStyle = "true";
  style.textContent = `
    .beauty-workspace-save-dock {
      position: fixed;
      z-index: 1005;
      left: 12px;
      right: 12px;
      bottom: calc(84px + env(safe-area-inset-bottom, 0px));
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      max-width: 720px;
      margin: 0 auto;
      padding: 10px;
      border: 1px solid rgba(224, 188, 101, .68);
      border-radius: 16px;
      background: rgba(17, 8, 22, .96);
      box-shadow: 0 14px 38px rgba(0, 0, 0, .52);
      backdrop-filter: blur(14px);
    }
    .beauty-workspace-save-dock span {
      min-width: 0;
      color: #d8cbdc;
      font-size: 12px;
      line-height: 1.3;
    }
    .beauty-workspace-save-dock.is-error span { color: #ff9aad; }
    .beauty-workspace-save-dock button {
      min-height: 44px;
      padding: 0 16px;
      border: 1px solid #e0bc65;
      border-radius: 12px;
      background: rgba(224, 188, 101, .14);
      color: #f4d77e;
      font: inherit;
      font-weight: 850;
      white-space: nowrap;
    }
    .beauty-workspace-save-dock button:disabled { opacity: .62; }
    @media (max-width: 390px) {
      .beauty-workspace-save-dock { grid-template-columns: 1fr; gap: 7px; }
      .beauty-workspace-save-dock button { width: 100%; }
    }
  `;
  document.head.append(style);
};

const renderDock = () => {
  if (typeof document === "undefined") return;
  const workspaceRoute = window.location.pathname.replace(/\/+$/, "") === "/beauty/workspace";
  const pageEditor = document.querySelector(".beauty-workspace-page-editor");
  const nav = document.querySelector(".beauty-pilot-nav");
  const existing = document.querySelector<HTMLElement>(".beauty-workspace-save-dock");

  if (!workspaceRoute || !pageEditor || !nav) {
    existing?.remove();
    return;
  }

  ensureDockStyles();
  const dock = existing || document.createElement("div");
  dock.className = `beauty-workspace-save-dock${saveStatus === "error" ? " is-error" : ""}`;
  dock.setAttribute("role", "status");

  let message = saveCopy[currentLanguage()].saved;
  if (saveStatus === "idle") message = saveCopy[currentLanguage()].action;
  if (saveStatus === "saving") message = saveCopy[currentLanguage()].saving;
  if (saveStatus === "error") message = saveCopy[currentLanguage()].error;

  dock.replaceChildren();
  const status = document.createElement("span");
  status.textContent = message;
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = saveStatus === "saving" ? saveCopy[currentLanguage()].saving : saveCopy[currentLanguage()].action;
  button.disabled = saveStatus === "saving" || !latestWorkspace;
  button.addEventListener("click", () => { void saveLatestBeautyWorkspace(); });
  dock.append(status, button);

  if (!existing) nav.parentElement?.insertBefore(dock, nav);
};

const ensureDockObserver = () => {
  if (typeof document === "undefined" || dockObserver) return;
  const start = () => {
    renderDock();
    dockObserver = new MutationObserver(renderDock);
    dockObserver.observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
};

const setSaveStatus = (status: SaveStatus) => {
  saveStatus = status;
  ensureDockObserver();
  renderDock();
};

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

const enqueueBeautyWorkspaceSave = createBeautyWorkspaceSaveQueue(saveBeautyWorkspaceNow);

export const saveBeautyWorkspace = (workspace: BeautyWorkspace) => {
  latestWorkspace = workspace;
  const request = ++latestRequest;
  setSaveStatus("saving");
  const task = enqueueBeautyWorkspaceSave(workspace);
  void task.then(
    () => { if (request === latestRequest) setSaveStatus("saved"); },
    () => { if (request === latestRequest) setSaveStatus("error"); },
  );
  return task;
};

export const saveLatestBeautyWorkspace = () => latestWorkspace
  ? saveBeautyWorkspace(latestWorkspace)
  : Promise.resolve();
