import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Language } from "../types.js";
import type {
  BeautyBookingNotificationDelivery,
  BeautyBookingNotificationKind,
  BeautyBookingNotificationOutcome,
  BeautyBookingNotificationRepositoryContract,
} from "./beautyBookingNotifications.js";

type LifecycleEventRow = {
  id: string;
  booking_id: string;
  event_type: "booking_created" | "status_changed" | "booking_cancelled" | "booking_expired" | "notification_enqueued";
  actor_user_key: string | null;
  from_status: string | null;
  to_status: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

type BookingRow = {
  id: string;
  profile_id: string;
  client_user_key: string;
  starts_at: string;
  client_name_snapshot: string;
  service_name_snapshot: Partial<Record<Language, string>> | null;
  public_location_snapshot: string;
};

type ProfileRow = {
  owner_user_key: string;
  display_name: string;
};

type IdentityRow = {
  provider_user_id: string;
};

type UserRow = {
  language_code: string | null;
};

type JournalPayload = {
  sourceEventId?: unknown;
  notificationKind?: unknown;
  recipientUserKey?: unknown;
  provider?: unknown;
  state?: unknown;
  attempt?: unknown;
  claimedAt?: unknown;
  retryAt?: unknown;
};

type JournalRow = {
  payload: JournalPayload | null;
  created_at: string;
};

type NotificationPlan = {
  kind: BeautyBookingNotificationKind;
  recipientUserKey: string;
};

const supportedLanguages = new Set<Language>(["ru", "uk", "cs", "en"]);
const leaseMs = 5 * 60_000;
const maxAttempts = 5;

const normalizeLanguage = (value: string | null | undefined): Language =>
  supportedLanguages.has(value as Language) ? value as Language : "ru";

const notificationPlan = (
  event: LifecycleEventRow,
  booking: BookingRow,
  profile: ProfileRow,
): NotificationPlan | null => {
  if (event.event_type === "booking_created") {
    return { kind: "booking_requested", recipientUserKey: profile.owner_user_key };
  }
  if (event.event_type === "status_changed") {
    if (event.to_status === "confirmed") {
      return { kind: "booking_confirmed", recipientUserKey: booking.client_user_key };
    }
    if (event.to_status === "declined") {
      return { kind: "booking_declined", recipientUserKey: booking.client_user_key };
    }
    return null;
  }
  if (event.event_type === "booking_cancelled") {
    if (event.actor_user_key === booking.client_user_key) {
      return { kind: "booking_cancelled_by_client", recipientUserKey: profile.owner_user_key };
    }
    return {
      kind: "booking_cancelled_by_professional",
      recipientUserKey: booking.client_user_key,
    };
  }
  return null;
};

const journalAttempt = (value: unknown) => {
  const attempt = Number(value);
  return Number.isInteger(attempt) && attempt >= 0 ? attempt : 0;
};

const nextAttempt = (
  rows: JournalRow[],
  sourceEventId: string,
  now: Date,
): number | null => {
  const matching = rows
    .filter((row) => row.payload?.sourceEventId === sourceEventId)
    .sort((left, right) => left.created_at.localeCompare(right.created_at));
  if (!matching.length) return 1;
  if (matching.some((row) => ["sent", "failed", "cancelled"].includes(String(row.payload?.state || "")))) {
    return null;
  }
  const highestAttempt = Math.max(...matching.map((row) => journalAttempt(row.payload?.attempt)));
  if (highestAttempt >= maxAttempts) return null;
  const latest = [...matching]
    .reverse()
    .find((row) => journalAttempt(row.payload?.attempt) === highestAttempt);
  if (!latest?.payload) return null;
  if (latest.payload.state === "retry") {
    const retryAt = new Date(String(latest.payload.retryAt || "")).getTime();
    return Number.isFinite(retryAt) && retryAt <= now.getTime() ? highestAttempt + 1 : null;
  }
  if (latest.payload.state === "sending") {
    const claimedAt = new Date(String(latest.payload.claimedAt || latest.created_at)).getTime();
    return Number.isFinite(claimedAt) && claimedAt <= now.getTime() - leaseMs
      ? highestAttempt + 1
      : null;
  }
  return null;
};

const isUniqueViolation = (error: { code?: string } | null) => error?.code === "23505";

export type BeautyBookingNotificationRepositoryOptions = {
  supabaseUrl: string;
  serviceRoleKey: string;
  origin: string;
  client?: SupabaseClient;
  now?: () => Date;
};

export class BeautyBookingNotificationRepository implements BeautyBookingNotificationRepositoryContract {
  private readonly client: SupabaseClient;
  private readonly now: () => Date;

  constructor(private readonly options: BeautyBookingNotificationRepositoryOptions) {
    this.client = options.client || createClient(options.supabaseUrl, options.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    this.now = options.now || (() => new Date());
  }

  private async loadBooking(bookingId: string): Promise<BookingRow | null> {
    const { data, error } = await this.client
      .from("beauty_bookings")
      .select("id,profile_id,client_user_key,starts_at,client_name_snapshot,service_name_snapshot,public_location_snapshot")
      .eq("id", bookingId)
      .maybeSingle();
    if (error) throw new Error(`beauty_notification_booking_read_failed:${error.code || "unknown"}`);
    return data as BookingRow | null;
  }

  private async loadProfile(profileId: string): Promise<ProfileRow | null> {
    const { data, error } = await this.client
      .from("beauty_professional_profiles")
      .select("owner_user_key,display_name")
      .eq("id", profileId)
      .maybeSingle();
    if (error) throw new Error(`beauty_notification_profile_read_failed:${error.code || "unknown"}`);
    return data as ProfileRow | null;
  }

  private async loadTelegramIdentity(userKey: string) {
    const { data: identity, error: identityError } = await this.client
      .from("user_provider_identities")
      .select("provider_user_id")
      .eq("user_key", userKey)
      .eq("provider", "telegram")
      .eq("status", "active")
      .order("last_inbound_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    if (identityError) {
      throw new Error(`beauty_notification_identity_read_failed:${identityError.code || "unknown"}`);
    }
    const { data: user, error: userError } = await this.client
      .from("app_users")
      .select("language_code")
      .eq("user_key", userKey)
      .maybeSingle();
    if (userError) throw new Error(`beauty_notification_user_read_failed:${userError.code || "unknown"}`);
    return {
      identity: identity as IdentityRow | null,
      language: normalizeLanguage((user as UserRow | null)?.language_code),
    };
  }

  private async loadJournal(bookingId: string): Promise<JournalRow[]> {
    const { data, error } = await this.client
      .from("beauty_booking_events")
      .select("payload,created_at")
      .eq("booking_id", bookingId)
      .eq("event_type", "notification_enqueued")
      .order("created_at", { ascending: true });
    if (error) throw new Error(`beauty_notification_journal_read_failed:${error.code || "unknown"}`);
    return (data || []) as JournalRow[];
  }

  private async appendJournal(
    bookingId: string,
    sourceEventId: string,
    kind: BeautyBookingNotificationKind,
    recipientUserKey: string,
    attempt: number,
    state: "sending" | "sent" | "retry" | "failed" | "cancelled",
    details: Record<string, unknown> = {},
  ) {
    const suffix = state === "sending" ? "claim" : state;
    const deduplicationKey = [
      "beauty-notification",
      sourceEventId,
      "telegram",
      recipientUserKey,
      attempt,
      suffix,
    ].join(":");
    const { error } = await this.client.from("beauty_booking_events").insert({
      booking_id: bookingId,
      event_type: "notification_enqueued",
      actor_user_key: null,
      from_status: null,
      to_status: null,
      payload: {
        sourceEventId,
        notificationKind: kind,
        recipientUserKey,
        provider: "telegram",
        state,
        attempt,
        ...details,
      },
      deduplication_key: deduplicationKey,
    });
    return error;
  }

  async claim(limit = 25): Promise<BeautyBookingNotificationDelivery[]> {
    const boundedLimit = Math.min(50, Math.max(1, limit));
    const { data, error } = await this.client
      .from("beauty_booking_events")
      .select("id,booking_id,event_type,actor_user_key,from_status,to_status,payload,created_at")
      .in("event_type", ["booking_created", "status_changed", "booking_cancelled"])
      .order("created_at", { ascending: false })
      .limit(Math.max(200, boundedLimit * 20));
    if (error) throw new Error(`beauty_notification_event_read_failed:${error.code || "unknown"}`);

    const events = [...((data || []) as LifecycleEventRow[])].reverse();
    const deliveries: BeautyBookingNotificationDelivery[] = [];
    for (const event of events) {
      if (deliveries.length >= boundedLimit) break;
      const booking = await this.loadBooking(event.booking_id);
      if (!booking) continue;
      const profile = await this.loadProfile(booking.profile_id);
      if (!profile) continue;
      const plan = notificationPlan(event, booking, profile);
      if (!plan) continue;
      const journal = await this.loadJournal(booking.id);
      const attempt = nextAttempt(journal, event.id, this.now());
      if (!attempt) continue;
      const recipient = await this.loadTelegramIdentity(plan.recipientUserKey);
      if (!recipient.identity?.provider_user_id) {
        const noRecipientError = await this.appendJournal(
          booking.id,
          event.id,
          plan.kind,
          plan.recipientUserKey,
          attempt,
          "cancelled",
          { reason: "telegram_identity_unavailable" },
        );
        if (noRecipientError && !isUniqueViolation(noRecipientError)) {
          throw new Error(`beauty_notification_journal_write_failed:${noRecipientError.code || "unknown"}`);
        }
        continue;
      }
      const claimedAt = this.now().toISOString();
      const claimError = await this.appendJournal(
        booking.id,
        event.id,
        plan.kind,
        plan.recipientUserKey,
        attempt,
        "sending",
        { claimedAt },
      );
      if (claimError) {
        if (isUniqueViolation(claimError)) continue;
        throw new Error(`beauty_notification_claim_failed:${claimError.code || "unknown"}`);
      }
      deliveries.push({
        sourceEventId: event.id,
        bookingId: booking.id,
        recipientUserKey: plan.recipientUserKey,
        recipientTelegramId: recipient.identity.provider_user_id,
        kind: plan.kind,
        attemptCount: attempt,
        language: recipient.language,
        startsAt: booking.starts_at,
        professionalName: profile.display_name,
        clientName: booking.client_name_snapshot,
        serviceName: booking.service_name_snapshot || {},
        publicLocation: booking.public_location_snapshot,
        openUrl: `${this.options.origin.replace(/\/$/, "")}/services`,
      });
    }
    return deliveries;
  }

  async finish(
    delivery: BeautyBookingNotificationDelivery,
    outcome: BeautyBookingNotificationOutcome,
  ) {
    const details = outcome.status === "sent"
      ? { providerMessageId: outcome.providerMessageId || null, finishedAt: this.now().toISOString() }
      : outcome.status === "retry"
        ? { errorCode: outcome.errorCode, retryAt: outcome.retryAt }
        : outcome.status === "failed"
          ? { errorCode: outcome.errorCode, finishedAt: this.now().toISOString() }
          : { reason: outcome.reason, finishedAt: this.now().toISOString() };
    const error = await this.appendJournal(
      delivery.bookingId,
      delivery.sourceEventId,
      delivery.kind,
      delivery.recipientUserKey,
      delivery.attemptCount,
      outcome.status,
      details,
    );
    if (error && !isUniqueViolation(error)) {
      throw new Error(`beauty_notification_finish_failed:${error.code || "unknown"}`);
    }
  }
}

export const beautyBookingNotificationRepositoryInternals = {
  nextAttempt,
  notificationPlan,
  normalizeLanguage,
} as const;
