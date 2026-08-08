export type GoIrlClient = "telegram" | "web";

type TelegramLike = {
  WebApp?: {
    initData?: string;
    initDataUnsafe?: {
      user?: unknown;
    };
  };
};

export const resolveGoIrlClient = (telegram: TelegramLike | undefined): GoIrlClient =>
  telegram?.WebApp?.initData?.trim() || telegram?.WebApp?.initDataUnsafe?.user ? "telegram" : "web";
