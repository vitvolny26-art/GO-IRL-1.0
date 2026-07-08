export type DemoIdentitySource = "telegram-init-data-unsafe" | "guest-local-storage";

export type DemoIdentityResolution = {
  userKey: string;
  source: DemoIdentitySource;
  security: "unsafe-demo-only";
};

type IdentityStorage = Pick<Storage, "getItem" | "setItem">;

export function resolveDemoIdentity(options: {
  telegramId?: number;
  storage: IdentityStorage;
  randomUUID: () => string;
}): DemoIdentityResolution {
  if (options.telegramId) {
    return {
      userKey: `telegram:${options.telegramId}`,
      source: "telegram-init-data-unsafe",
      security: "unsafe-demo-only",
    };
  }

  const storageKey = "go-irl-guest-id";
  const saved = options.storage.getItem(storageKey);
  if (saved) {
    return {
      userKey: saved,
      source: "guest-local-storage",
      security: "unsafe-demo-only",
    };
  }

  const generated = `guest:${options.randomUUID()}`;
  options.storage.setItem(storageKey, generated);
  return {
    userKey: generated,
    source: "guest-local-storage",
    security: "unsafe-demo-only",
  };
}
