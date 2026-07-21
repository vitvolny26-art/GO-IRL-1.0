import type { TelegramEventCardInput } from "../_shared/telegram-event-card.js";
import { readEnv } from "../_shared/env.js";
import { isShareEventId, isShareLanguage, loadTrustedTelegramEventCard } from "../_shared/telegram-share-event.js";

type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  end(body?: string): void;
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
};
