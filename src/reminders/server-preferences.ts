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
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let linkedReminderChannelsRequest: Promise<Set<ReminderChannel>> | null = null;

export const isServerActivityId = (activityId: string) => uuidPattern.test(activityId);
export const usesServerReminderPersistence = () => isTrustedAuthReady();

export async function readServerEventReminder(activityId: string) {
  if (!isServerActivityId(activityId)) return null;
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
  if (!linkedReminderChannelsRequest) {
    linkedReminderChannelsRequest = (async () => {
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
    })().catch((error) => {
      linkedReminderChannelsRequest = null;
      throw error;
    });
  }
  return linkedReminderChannelsRequest;
}

export async function saveServerEventReminder(
  activityId: string,
  provider: ReminderChannel,
  leadMinutes: ReminderLeadMinutes,
) {
  if (!isServerActivityId(activityId)) throw new Error("invalid_activity_id");
  const { error } = await supabase.rpc("go_irl_upsert_event_reminder", {
    p_activity_id: activityId,
    p_provider: provider,
    p_lead_minutes: leadMinutes,
  });
  if (error) throw error;
}

export async function removeServerEventReminder(activityId: string) {
  if (!isServerActivityId(activityId)) return;
  const { error } = await supabase
    .from("event_reminders")
    .delete()
    .eq("activity_id", activityId);
  if (error) throw error;
}