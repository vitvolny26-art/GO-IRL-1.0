import { isTrustedAuthReady } from "../authSession.js";
import type {
  EventReminderPreference,
  ReminderChannel,
  ReminderLeadMinutes,
} from "../reminderPreferences.js";
import { supabase } from "../supabase.js";

type ReminderRow = {
  activity_id: string;
  provider: ReminderChannel;
  lead_minutes: ReminderLeadMinutes;
  event_starts_at: string;
  updated_at: string;
};

const reminderColumns =
  "activity_id,provider,lead_minutes,event_starts_at,updated_at";

export const usesServerReminderPersistence = () => isTrustedAuthReady();

export async function readServerEventReminder(activityId: string) {
  const { data, error } = await supabase
    .from("event_reminders")
    .select(reminderColumns)
    .eq("activity_id", activityId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as ReminderRow;
  return {
    activityId: row.activity_id,
    channel: row.provider,
    leadMinutes: row.lead_minutes,
    eventStartsAt: row.event_starts_at,
    updatedAt: row.updated_at,
  } satisfies EventReminderPreference;
}

export async function readLinkedReminderChannels() {
  const { data, error } = await supabase
    .from("user_provider_identities")
    .select("provider")
    .eq("status", "active");
  if (error) throw error;
  return new Set(
    (data || [])
      .map((row) => row.provider)
      .filter((provider): provider is ReminderChannel =>
        ["telegram", "whatsapp", "instagram", "messenger"].includes(provider)),
  );
}

export async function saveServerEventReminder(
  activityId: string,
  provider: ReminderChannel,
  leadMinutes: ReminderLeadMinutes,
) {
  const { error } = await supabase.rpc("go_irl_upsert_event_reminder", {
    p_activity_id: activityId,
    p_provider: provider,
    p_lead_minutes: leadMinutes,
  });
  if (error) throw error;
}

export async function removeServerEventReminder(activityId: string) {
  const { error } = await supabase
    .from("event_reminders")
    .delete()
    .eq("activity_id", activityId);
  if (error) throw error;
}
