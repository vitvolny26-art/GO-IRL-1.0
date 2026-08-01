import type { Language } from "../types";
import { BEAUTY_SCHEMA_VERSION, createDefaultBeautyWorkspace, type BeautyWorkspace } from "./beautySetupModel";

const databaseName = "go-irl-beauty";
const storeName = "workspace";
const workspaceKey = "primary";
const recoveryStorageKey = "go-irl-beauty-workspace-v2";
let saveQueue: Promise<unknown> = Promise.resolve();

const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(databaseName, BEAUTY_SCHEMA_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(storeName)) database.createObjectStore(storeName);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error("Beauty IndexedDB is unavailable."));
});

const runTransaction = async <T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>) => {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(storeName, mode);
      const request = operation(transaction.objectStore(storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Beauty workspace operation failed."));
      transaction.onabort = () => reject(transaction.error || new Error("Beauty workspace transaction was aborted."));
    });
  } finally {
    database.close();
  }
};

const isBeautyWorkspace = (value: unknown): value is BeautyWorkspace => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BeautyWorkspace>;
  return candidate.schemaVersion === BEAUTY_SCHEMA_VERSION
    && typeof candidate.currentStep === "string"
    && typeof candidate.published === "boolean"
    && Boolean(candidate.profile)
    && Boolean(candidate.service)
    && Boolean(candidate.availability);
};

const readRecoverySnapshot = (): BeautyWorkspace | undefined => {
  try {
    const parsed = JSON.parse(localStorage.getItem(recoveryStorageKey) || "null") as unknown;
    return isBeautyWorkspace(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const newestWorkspace = (first?: BeautyWorkspace, second?: BeautyWorkspace) => {
  if (!first) return second;
  if (!second) return first;
  return first.updatedAt >= second.updatedAt ? first : second;
};

export const loadLocalBeautyWorkspace = async (language: Language = "en"): Promise<BeautyWorkspace> => {
  const recovery = readRecoverySnapshot();
  if (typeof indexedDB === "undefined") return recovery || createDefaultBeautyWorkspace(language);
  const stored = await runTransaction<BeautyWorkspace | undefined>("readonly", (store) => store.get(workspaceKey));
  return newestWorkspace(stored, recovery) || createDefaultBeautyWorkspace(language);
};

export const saveLocalBeautyWorkspace = async (workspace: BeautyWorkspace) => {
  const snapshot = { ...workspace, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(recoveryStorageKey, JSON.stringify(snapshot));
  } catch {
    // IndexedDB remains the primary store when synchronous recovery is unavailable.
  }
  if (typeof indexedDB === "undefined") return;
  saveQueue = saveQueue
    .catch(() => undefined)
    .then(() => runTransaction<IDBValidKey>("readwrite", (store) => store.put(snapshot, workspaceKey)));
  await saveQueue;
};

export const resetLocalBeautyWorkspace = async () => {
  try {
    localStorage.removeItem(recoveryStorageKey);
  } catch {
    // Continue with IndexedDB reset when localStorage is unavailable.
  }
  if (typeof indexedDB === "undefined") return;
  await saveQueue;
  await runTransaction<undefined>("readwrite", (store) => store.delete(workspaceKey));
};

export const beautyStorageMetadata = {
  databaseName,
  storeName,
  workspaceKey,
  recoveryStorageKey,
  schemaVersion: BEAUTY_SCHEMA_VERSION,
} as const;
