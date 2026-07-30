import { BEAUTY_SCHEMA_VERSION, createDefaultBeautyWorkspace, type BeautyWorkspace } from "./beautySetupModel";

const databaseName = "go-irl-beauty";
const storeName = "workspace";
const workspaceKey = "primary";

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

export const loadBeautyWorkspace = async (): Promise<BeautyWorkspace> => {
  if (typeof indexedDB === "undefined") return createDefaultBeautyWorkspace();
  const stored = await runTransaction<BeautyWorkspace | undefined>("readonly", (store) => store.get(workspaceKey));
  return isBeautyWorkspace(stored) ? stored : createDefaultBeautyWorkspace();
};

export const saveBeautyWorkspace = async (workspace: BeautyWorkspace) => {
  if (typeof indexedDB === "undefined") return;
  await runTransaction<IDBValidKey>("readwrite", (store) => store.put(workspace, workspaceKey));
};

export const resetBeautyWorkspace = async () => {
  if (typeof indexedDB === "undefined") return;
  await runTransaction<undefined>("readwrite", (store) => store.delete(workspaceKey));
};

export const beautyStorageMetadata = {
  databaseName,
  storeName,
  workspaceKey,
  schemaVersion: BEAUTY_SCHEMA_VERSION,
} as const;
