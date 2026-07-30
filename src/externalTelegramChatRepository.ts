import { supabase } from "./supabase";
import {
  normalizeExternalTelegramChatUrl,
  type ExternalTelegramChatLink,
} from "./externalTelegramChat";

type ExternalTelegramChatRow = {
  activity_id: string;
  url: string;
  attached_by_user_key: string;
  keep_archive: boolean;
  created_at: string;
  updated_at: string;
  telegram_chat_id: number | null;
  telegram_chat_type: string | null;
  telegram_chat_title: string | null;
  bound_at: string | null;
};

const externalTelegramChatColumns = "activity_id,url,attached_by_user_key,keep_archive,created_at,updated_at,telegram_chat_id,telegram_chat_type,telegram_chat_title,bound_at";

export const mapExternalTelegramChatRow = (
  row: ExternalTelegramChatRow | null | undefined,
): ExternalTelegramChatLink | null => {
  if (!row) return null;
  const url = normalizeExternalTelegramChatUrl(row.url);
  if (!url || !row.attached_by_user_key || !row.created_at) return null;

  const verified = Boolean(row.telegram_chat_id && row.bound_at && ["group", "supergroup"].includes(row.telegram_chat_type || ""));
  return {
    kind: "event",
    url,
    attachedByUserKey: row.attached_by_user_key,
    attachedAt: row.created_at,
    keepArchive: Boolean(row.keep_archive),
    verificationState: verified ? "verified" : "manual",
    boundAt: verified ? row.bound_at || undefined : undefined,
    telegramChatTitle: verified ? row.telegram_chat_title || undefined : undefined,
  };
};

export const loadSharedEventTelegramChatLink = async (activityId: string) => {
  if (!activityId) return null;

  const { data, error } = await supabase
    .from("activity_external_telegram_chats")
    .select(externalTelegramChatColumns)
    .eq("activity_id", activityId)
    .maybeSingle();

  if (error) throw error;
  return mapExternalTelegramChatRow(data as ExternalTelegramChatRow | null);
};

export const saveSharedEventTelegramChatLink = async (
  activityId: string,
  value: string,
  attachedByUserKey: string,
  keepArchive = false,
) => {
  const url = normalizeExternalTelegramChatUrl(value);
  if (!activityId || !url || !attachedByUserKey) return null;

  const { data, error } = await supabase
    .from("activity_external_telegram_chats")
    .upsert({
      activity_id: activityId,
      url,
      attached_by_user_key: attachedByUserKey,
      keep_archive: keepArchive,
      telegram_chat_id: null,
      telegram_chat_type: null,
      telegram_chat_title: null,
      bound_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "activity_id" })
    .select(externalTelegramChatColumns)
    .single();

  if (error) throw error;
  return mapExternalTelegramChatRow(data as ExternalTelegramChatRow);
};

export const removeSharedEventTelegramChatLink = async (activityId: string) => {
  if (!activityId) return;
  const { error } = await supabase
    .from("activity_external_telegram_chats")
    .delete()
    .eq("activity_id", activityId);
  if (error) throw error;
};