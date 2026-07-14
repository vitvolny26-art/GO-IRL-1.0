type RuntimeGlobal = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

export const readEnv = (name: string) =>
  (globalThis as RuntimeGlobal).process?.env?.[name]?.trim() || "";

export const requireEnv = (name: string) => {
  const value = readEnv(name);
  if (!value) throw new Error(`missing_environment:${name}`);
  return value;
};
