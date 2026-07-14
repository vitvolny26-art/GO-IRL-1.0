import { readEnv } from "../_shared/env.js";
import { renderTelegramShareCardJpeg } from "../_shared/telegram-share-card-image.js";
import { readTelegramShareCardToken } from "../_shared/telegram-share-card-token.js";

type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  end(body?: string | Uint8Array): void;
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
};
