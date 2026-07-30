import { BEAUTY_SCHEMA_VERSION, createDefaultBeautyWorkspace, type BeautyWorkspace } from "./beautySetupModel";

const DATABASE_NAME = "go-irl-beauty";
const STORE_NAME = "workspace";
const WORKSPACE_KEY = "primary";

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, BEAUTY_SCHEMA_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error("Beauty IndexedDB is unavailable"));
});

const runTransaction = async <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) => {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Beauty IndexedDB request failed"));
      transaction.onerror = () => reject(transaction.error ?? new Error("Beauty IndexedDB transaction failed"));
    });
  } finally {
    database.close();
  }
};

const isBeautyWorkspace = (value: unknown): value is BeautyWorkspace => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BeautyWorkspace>;
  return candidate.schemaVersion === BEAUTY_SCHEMA_VERSION
    && Boolean(candidate.profile)
    && Boolean(candidate.service)
    && Boolean(candidate.availability);
};

export const loadBeautyWorkspace = async (): Promise<BeautyWorkspace> => {
  const stored = await runTransaction<BeautyWorkspace | undefined>("readonly", (store) => store.get(WORKSPACE_KEY));
  return isBeautyWorkspace(stored) ? stored : createDefaultBeautyWorkspace();
};

export const saveBeautyWorkspace = async (workspace: BeautyWorkspace) => {
  const next = { ...workspace, updatedAt: new Date().toISOString() };
  await runTransaction<IDBValidKey>("readwrite", (store) => store.put(next, WORKSPACE_KEY));
  return next;
};

export const resetBeautyWorkspace = async () => {
  await runTransaction<undefined>("readwrite", (store) => store.delete(WORKSPACE_KEY));
  return createDefaultBeautyWorkspace();
};
