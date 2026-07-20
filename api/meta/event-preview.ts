import { readEnv } from "../_shared/env.js";
import { loadTrustedTelegramEventCard, isShareEventId, isShareLanguage } from "../_shared/telegram-share-event.js";
import { createMetaInvitationCardToken } from "../_shared/telegram-share-card-token.js";

type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse