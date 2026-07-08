# Task 1 Audit: Coach + Chat + Weather

Generated: 2026-07-07T14:27:47.471Z

## Purpose

Analyze current Coach, Activity Chat and Weather integration before applying runtime fixes.

## Detected facts

| Check | Result |
|---|---|
| CoachRequestPanel exists | yes |
| ActivityChatPanel exists | yes |
| coachFeature.ts exists | yes |
| activityChatFeature.ts exists | yes |
| SportVertical imports Coach | no |
| SportVertical imports Chat | no |
| App imports Chat | yes |

## Search: Weather

```
ROADMAP.md:169:6. Add safe Open-Meteo weather widget.
docs/Database.md:183:- `weather_dependent boolean`
docs/MVP_STABILIZATION_PLAN.md:25:6. Integrate Open-Meteo weather safely.
docs/MVP_STABILIZATION_PLAN.md:34:- Coach, chat, weather, share, profile, and bug report flows do not conflict.
docs/ai-event-discovery.md:222:- `SportRecommendationEngine`: sport type, skill level, format, time, city, free spots, equipment, weather.
docs/n8n-workflows.md:59:- sport digest can mention skill level, missing players, equipment, and weather dependency.
docs/vertical-experiences.md:134:- weather dependency, if needed
docs/vertical-experiences.md:357:- sport: game level, missing players, weather, equipment
src/i18n.ts:156:  weatherHint: "Погода",
src/i18n.ts:157:  weatherPlaceholder: "Погодная подсказка появится позже",
src/i18n.ts:376:    weatherHint: "Погода",
src/i18n.ts:377:    weatherPlaceholder: "Погодна підказка з'явиться пізніше",
src/i18n.ts:590:    weatherHint: "Počasí",
src/i18n.ts:591:    weatherPlaceholder: "Tip podle počasí bude doplněn později",
src/i18n.ts:806:    weatherHint: "Weather",
src/i18n.ts:807:    weatherPlaceholder: "Weather hint will appear later",
src/services/weather.ts:6:const weatherCache = new Map<string, Promise<WeatherResult | null>>();
src/services/weather.ts:58:  if (weatherCache.has(cacheKey)) return weatherCache.get(cacheKey)!;
src/services/weather.ts:67:    url.searchParams.set("hourly", "temperature_2m,precipitation_probability,wind_speed_10m,weather_code");
src/services/weather.ts:93:    const code = Number(data.hourly.weather_code?.[index] || 0);
src/services/weather.ts:102:  weatherCache.set(cacheKey, promise);
src/verticals/SportVertical.tsx:250:          <div><Sparkles /><span>{t.weatherHint}</span><strong>{t.weatherPlaceholder}</strong></div>

```

## Search: Open-Meteo

```
src/services/weather.ts:64:    const url = new URL("https://api.open-meteo.com/v1/forecast");

```

## Search: Coach panel usage

```
src/components/CoachRequestPanel.tsx:10:type CoachRequestPanelProps = {
src/components/CoachRequestPanel.tsx:27:export function CoachRequestPanel({ activity, userRole }: CoachRequestPanelProps) {

```

## Search: Chat panel usage

```
src/App.tsx:62:import { ActivityChatPanel } from "./components/ActivityChatPanel";
src/App.tsx:1203:              <ActivityChatPanel activity={activity} />
src/components/ActivityChatPanel.tsx:11:type ActivityChatPanelProps = {
src/components/ActivityChatPanel.tsx:25:export function ActivityChatPanel({ activity }: ActivityChatPanelProps) {

```

## Search: BOT_USERNAME

```
README.md:42:VITE_TELEGRAM_BOT_USERNAME=GOirl_bot
supabase/README.md:207:VITE_TELEGRAM_BOT_USERNAME=GOirl_bot
supabase/README.md:219:VITE_TELEGRAM_BOT_USERNAME

```

## Source snippets

## src/components/CoachRequestPanel.tsx

```tsx
import { useEffect, useMemo, useState } from "react";
import { Dumbbell, Star, UserCheck } from "lucide-react";
import {
  getCurrentCoachUserKey,
  loadCoachRequestsForActivity,
  requestCoachForActivity,
} from "../coachFeature";
import type { Activity, CoachRequest, UserRole } from "../types";

type CoachRequestPanelProps = {
  activity: Activity;
  userRole: UserRole;
};

const coachStatusLabel = (status: CoachRequest["status"]) => {
  switch (status) {
    case "pending": return "ожидает подтверждения";
    case "matched": return "тренер найден";
    case "confirmed": return "тренер подтверждён";
    case "completed": return "завершено";
    case "rejected": return "отклонено";
    case "cancelled": return "отменено";
    default: return "в обработке";
  }
};

export function CoachRequestPanel({ activity, userRole }: CoachRequestPanelProps) {
  const [requests, setRequests] = useState<CoachRequest[]>([]);
  const [currentUserKey, setCurrentUserKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isOrganizer = activity.organizerKey === currentUserKey;
  const canManage = isOrganizer || userRole === "admin" || userRole === "moderator";

  const organizerRequest = useMemo(
    () => requests.find((request) => request.requestType === "organizer_request" && request.status !== "cancelled"),
    [requests],
  );

  const participantInterest = useMemo(
    () => requests.find((request) => request.requestType === "participant_interest" && request.requesterUserKey === currentUserKey && request.status !== "cancelled"),
    [requests, currentUserKey],
  );

  const interestCount = useMemo(
    () => requests.filter((request) => request.requestType === "participant_interest" && request.status === "pending").length,
    [requests],
  );

  const reload = async () => {
    const [userKey, coachRequests] = await Promise.all([
      getCurrentCoachUserKey(),
      loadCoachRequestsForActivity(activity.id),
    ]);

    setCurrentUserKey(userKey);
    setRequests(coachRequests);
  };

  useEffect(() => {
    void reload().catch(() => {
      setMessage("Не удалось загрузить тренера");
    });
  }, [activity.id]);

  const handleRequest = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await requestCoachForActivity(
        activity,
        canManage ? "organizer_request" : "participant_interest",
      );

      await reload();
      setMessage(canManage ? "Тренер запрошен" : "Вы хотите тренера");
    } catch {
      setMessage("Не удалось отправить запрос");
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = canManage ? "Пригласить тренера" : "Хочу тренера";
  const disabled = loading || Boolean(canManage ? organizerRequest : participantInterest);

  return (
    <section className="coach-panel" aria-label="Тренер">
      <div className="coach-panel-header">
        <div className="coach-panel-icon">
          <Dumbbell size={18} aria-hidden="true" />
        </div>
        <div>
          <h3>Тренер</h3>
          <p>Тренер поможет провести игру, разминку и объяснить правила новичкам.</p>
        </div>
      </div>

      {organizerRequest ? (
        <div className="coach-panel-status">
          <UserCheck size={18} aria-hidden="true" />
          <span>Тренер запрошен · {coachStatusLabel(organizerRequest.status)}</span>
        </div>
      ) : null}

      {interestCount > 0 && canManage ? (
        <div className="coach-panel-status">
          <Star size={18} aria-hidden="true" />
          <span>{interestCount} участников хотят тренера</span>
        </div>
      ) : null}

      {!canManage && participantInterest ? (
        <div className="coach-panel-status">
          <Star size={18} aria-hidden="true" />
          <span>Вы хотите тренера</span>
        </div>
      ) : null}

      <button
        type="button"
        className="coach-panel-button"
        onClick={handleRequest}
        disabled={disabled}
      >
        {disabled ? "Запрос отправлен" : buttonLabel}
      </button>

      {message ? <div className="coach-panel-message">{message}</div> : null}
    </section>
  );
}

```

## src/components/ActivityChatPanel.tsx

```tsx
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import {
  ensureActivityChat,
  loadActivityChat,
  loadActivityChatMessages,
  sendActivityChatMessage,
} from "../activityChatFeature";
import type { Activity, ActivityChat, ActivityChatMessage } from "../types";

type ActivityChatPanelProps = {
  activity: Activity;
};

const formatCloseTime = (value?: string | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export function ActivityChatPanel({ activity }: ActivityChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<ActivityChat | null>(null);
  const [messages, setMessages] = useState<ActivityChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expired = useMemo(() => {
    if (!chat) return false;
    return chat.status !== "active" || new Date(chat.expiresAt).getTime() <= Date.now();
  }, [chat]);

  const reload = async () => {
    setLoading(true);
    setError(null);

    try {
      await ensureActivityChat(activity.id);
      const [nextChat, nextMessages] = await Promise.all([
        loadActivityChat(activity.id),
        loadActivityChatMessages(activity.id),
      ]);

      setChat(nextChat);
      setMessages(nextMessages);
    } catch {
      setError("Чат доступен только участникам");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void reload();
  }, [activity.id, open]);

  const handleSend = async () => {
    if (!body.trim()) return;

    setSending(true);
    setError(null);

    try {
      await sendActivityChatMessage(activity.id, body);
      setBody("");
      await reload();
    } catch {
      setError("Не удалось отправить сообщение");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="activity-chat-panel">
      <button
        type="button"
        className="activity-chat-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="activity-chat-toggle-icon">
          <MessageCircle size={18} aria-hidden="true" />
        </span>
        <span>
          <strong>Чат события</strong>
          <small>Для участников. Закроется через 24 часа после события.</small>
        </span>
      </button>

      {open ? (
        <div className="activity-chat-box">
          {loading ? <div className="activity-chat-muted">Загрузка чата…</div> : null}

          {chat?.expiresAt ? (
            <div className="activity-chat-muted">
              Чат закроется: {formatCloseTime(chat.expiresAt)}
            </div>
          ) : null}

          {expired ? (
            <div className="activity-chat-muted">Чат закрыт. Сообщения больше недоступны.</div>
          ) : null}

          {error ? <div className="activity-chat-error">{error}</div> : null}

          {!loading && !error ? (
            <div className="activity-chat-messages">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <article key={message.id} className="activity-chat-message">
                    <div className="activity-chat-message-meta">
                      <strong>{message.senderDisplayName || "GO IRL User"}</strong>
                      <span>{formatCloseTime(message.createdAt)}</span>
                    </div>
                    <p>{message.body}</p>
                  </article>
                ))
              ) : (
                <div className="activity-chat-muted">Сообщений пока нет. Напишите первым.</div>
              )}
            </div>
          ) : null}

          {!expired && !error ? (
            <div className="activity-chat-form">
              <input
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Сообщение…"
                maxLength={1000}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !body.trim()}
                aria-label="Отправить"
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

```

## src/coachFeature.ts

```tsx
import { initializeTrustedAuth, getCurrentAuthSession } from "./authSession";
import { supabase } from "./supabase";
import type { Activity, CoachRequest, CoachRequestType } from "./types";

type AuthLike = {
  user?: {
    userKey?: string;
  };
  userKey?: string;
};

const readAuthUserKey = (identity: unknown) => {
  const auth = identity as AuthLike | null;
  return auth?.user?.userKey || auth?.userKey || null;
};

export async function getCurrentCoachUserKey() {
  const existing = getCurrentAuthSession();
  const existingKey = readAuthUserKey(existing);
  if (existingKey) return existingKey;

  const identity = await initializeTrustedAuth();
  return readAuthUserKey(identity);
}

export async function loadCoachRequestsForActivity(activityId: string) {
  const { data, error } = await supabase
    .from("coach_requests")
    .select("*")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    activityId: row.activity_id,
    requesterUserKey: row.requester_user_key,
    coachProfileId: row.coach_profile_id,
    requestType: row.request_type,
    sportType: row.sport_type,
    goal: row.goal,
    level: row.level,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    paymentMode: row.payment_mode,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })) as CoachRequest[];
}

export async function requestCoachForActivity(
  activity: Activity,
  requestType: CoachRequestType,
) {
  const userKey = await getCurrentCoachUserKey();

  if (!userKey) {
    throw new Error("auth_required");
  }

  const { error } = await supabase
    .from("coach_requests")
    .upsert({
      activity_id: activity.id,
      requester_user_key: userKey,
      request_type: requestType,
      sport_type: activity.categoryId || "sport",
      level: null,
      payment_mode: "split",
      status: "pending",
    }, {
      onConflict: "activity_id,requester_user_key,request_type",
      ignoreDuplicates: false,
    });

  if (error) throw error;
}

export async function cancelCoachRequest(requestId: string) {
  const { error } = await supabase
    .from("coach_requests")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;
}

```

## src/activityChatFeature.ts

```tsx
import { initializeTrustedAuth, getCurrentAuthSession } from "./authSession";
import { supabase } from "./supabase";
import type { ActivityChat, ActivityChatMessage } from "./types";

type AuthLike = {
  user?: {
    userKey?: string;
    firstName?: string | null;
    username?: string | null;
  };
  userKey?: string;
  firstName?: string | null;
  username?: string | null;
};

const readAuthUserKey = (identity: unknown) => {
  const auth = identity as AuthLike | null;
  return auth?.user?.userKey || auth?.userKey || null;
};

const readDisplayName = (identity: unknown) => {
  const auth = identity as AuthLike | null;
  return auth?.user?.firstName || auth?.user?.username || auth?.firstName || auth?.username || "GO IRL User";
};

export async function getCurrentChatIdentity() {
  const existing = getCurrentAuthSession();
  const existingUserKey = readAuthUserKey(existing);

  if (existingUserKey) {
    return {
      userKey: existingUserKey,
      displayName: readDisplayName(existing),
    };
  }

  const identity = await initializeTrustedAuth();

  return {
    userKey: readAuthUserKey(identity),
    displayName: readDisplayName(identity),
  };
}

export async function ensureActivityChat(activityId: string) {
  const { data, error } = await supabase.rpc("go_irl_ensure_activity_chat", {
    p_activity_id: activityId,
  });

  if (error) throw error;

  return data as string;
}

export async function loadActivityChat(activityId: string) {
  const { data, error } = await supabase
    .from("activity_chats")
    .select("*")
    .eq("activity_id", activityId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    activityId: data.activity_id,
    createdByUserKey: data.created_by_user_key,
    status: data.status,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as ActivityChat;
}

export async function loadActivityChatMessages(activityId: string) {
  const { data, error } = await supabase
    .from("activity_chat_messages")
    .select("*")
    .eq("activity_id", activityId)
    .eq("status", "visible")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    chatId: row.chat_id,
    activityId: row.activity_id,
    senderUserKey: row.sender_user_key,
    senderDisplayName: row.sender_display_name,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
  })) as ActivityChatMessage[];
}

export async function sendActivityChatMessage(activityId: string, body: string) {
  const trimmed = body.trim();

  if (!trimmed) {
    throw new Error("empty_message");
  }

  if (trimmed.length > 1000) {
    throw new Error("message_too_long");
  }

  const identity = await getCurrentChatIdentity();

  if (!identity.userKey) {
    throw new Error("auth_required");
  }

  const chatId = await ensureActivityChat(activityId);

  const { error } = await supabase
    .from("activity_chat_messages")
    .insert({
      chat_id: chatId,
      activity_id: activityId,
      sender_user_key: identity.userKey,
      sender_display_name: identity.displayName,
      body: trimmed,
      status: "visible",
    });

  if (error) throw error;
}

export async function hideOwnActivityChatMessage(messageId: string) {
  const { error } = await supabase
    .from("activity_chat_messages")
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
    })
    .eq("id", messageId);

  if (error) throw error;
}

```

## src/verticals/SportVertical.tsx

```tsx
import { useEffect, useState } from "react";
import { CalendarDays, CalendarPlus, Check, ChevronRight, CircleUserRound, Clock3, Dumbbell, Bug, MapPin, Pencil, Share2, ShieldCheck, Sparkles, Ticket, Trash2, UsersRound, X } from "lucide-react";
import { getTranslation, localeByLanguage } from "../i18n";
import { useAppStore } from "../store";
import { getUserKey } from "../supabase";
import type { Activity, Language, SportMetadata } from "../types";
import { getSportMetadata, sportEnvironmentLabel, sportEnvironments, sportFormatLabel, sportFormats, sportLevelLabel, sportLevels } from "./sport";

const cleanSportLabel = (value: string | null | undefined) => {
  const raw = String(value || "").trim();
  return raw.replace(/^[^A-Za-zА-Яа-яЁё0-9]+\s*/u, "").trim() || raw || "Спорт";
};

const buildMapsQuery = (parts: Array<string | null | undefined>) =>
  parts.filter(Boolean).map((part) => String(part).trim()).filter(Boolean).join(", ");

const buildGoogleMapsSearchUrl = (query: string) =>
  query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;

type SportCardProps = {
  activity: Activity;
  language: Language;
  onOpen: (activity: Activity) => void;
  onJoin: (activity: Activity) => void;
  onOpenMembers?: (activity: Activity) => void;
};

type SportSheetProps = {
  activity: Activity;
  language: Language;
  cityName: string;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onJoin: (activity: Activity) => void;
  onShare: (activity: Activity) => void;
  onCalendar: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onCloseMiniApp: () => void;
  initialMembersOpen?: boolean;
};

export function SportCreateFields({ language, initialSport }: { language: Language; initialSport: SportMetadata }) {
  const t = getTranslation(language);
  return (
    <div className="sport-create-panel">
      <div className="sport-panel-title"> {t.sportVertical}</div>
      <div className="form-row">
        <label><span>{t.sportLevel}</span><select name="sportLevel" defaultValue={initialSport.level || "intermediate"}>{sportLevels.map((level) => <option key={level.id} value={level.id}>{level.label[language]}</option>)}</select></label>
        <label><span>{t.sportFormat}</span><select name="sportFormat" defaultValue={initialSport.format || "casual"}>{sportFormats.map((format) => <option key={format.id} value={format.id}>{format.label[language]}</option>)}</select></label>
      </div>
      <div className="form-row">
        <label><span>{t.sportEnvironment}</span><select name="sportEnvironment" defaultValue={initialSport.environment || "outdoor"}>{sportEnvironments.map((environment) => <option key={environment.id} value={environment.id}>{environment.label[language]}</option>)}</select></label>
        <label><span>{t.sportDuration}</span><input name="sportDuration" type="number" min="15" max="480" step="15" defaultValue={initialSport.durationMinutes || 90} /></label>
      </div>
      <label className="sport-check"><input name="sportEquipmentNeeded" type="checkbox" defaultChecked={Boolean(initialSport.equipmentNeeded)} /><span>{t.sportEquipmentNeeded}</span></label>
      <label><span>{t.sportEquipment}</span><input name="sportEquipment" defaultValue={initialSport.equipment} placeholder={t.sportEquipmentPlaceholder} /></label>
      <label><span>{t.sportBring}</span><input name="sportBring" defaultValue={initialSport.bring} placeholder={t.sportBringPlaceholder} /></label>
      <label><span>{t.sportRequirements}</span><input name="sportRequirements" defaultValue={initialSport.requirements} placeholder={t.sportRequirementsPlaceholder} /></label>
      <label><span>{t.sportOrganizerTips}</span><textarea name="sportOrganizerTips" rows={3} defaultValue={initialSport.organizerTips} placeholder={t.sportOrganizerTipsPlaceholder} /></label>
    </div>
  );
}

const compactDateLabel = (date: string, language: Language) => {
  const t = getTranslation(language);
  const eventDate = new Date(`${date}T12:00:00`);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date === todayKey) return t.today;
  if (date === tomorrow.toISOString().slice(0, 10)) return t.tomorrow;

  return new Intl.DateTimeFormat(localeByLanguage[language], {
    day: "numeric",
    month: "short",
  }).format(eventDate);
};

const dateLabel = (date: string, language: Language) =>
  new Intl.DateTimeFormat(localeByLanguage[language], {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));

function SportDetailsSkeleton() {
  return (
    <div className="details-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export function SportActivityCard({ activity, language, onOpen, onJoin }: SportCardProps) {
  const { joinedIds, pendingIds } = useAppStore();
  const t = getTranslation(language);
  const meta = getSportMetadata(activity);
  const free = Math.max(activity.capacity - activity.participants, 0);
  const joined = joinedIds.includes(activity.id);
  const pending = pendingIds.includes(activity.id);
  const isOrganizer = activity.organizerKey === getUserKey();
  const full = activity.participants >= activity.capacity;
  const action = isOrganizer ? t.open : pending ? t.requested : joined ? t.joined : full ? t.eventFull : activity.visibility === "invite" ? t.request : t.join;
  const [membersPreviewOpen, setMembersPreviewOpen] = useState(false);

  const joinedMembers = activity.members.filter(m => m.status === "joined");

  return (
    <article className="sport-card">
      <button className="sport-card-main" onClick={() => onOpen(activity)} type="button">
        <div className="sport-card-symbol">{activity.activity[language].split(" ")[0] || "🏆"}</div>
        <div>
          <div className="sport-eyebrow"><Sparkles size={14} aria-hidden="true" /> <span>{sportLevelLabel(meta.level, language)} · {sportEnvironmentLabel(meta.environment, language)}</span></div>
          <h3>{cleanSportLabel(activity.activity[language])}</h3>
          <p>{activity.title[language]}</p>
        </div>
        <ChevronRight className="card-arrow" size={18} />
      </button>
      <div className="sport-chip-row">
        <span className="sport-card-chip"><Dumbbell size={16} aria-hidden="true" /><span>{cleanSportLabel(meta.sportType || activity.activity[language])}</span></span>
        <button
          className="sport-card-participants-chip"
          type="button"
          aria-label={`${t.participants}: ${activity.participants} / ${activity.capacity}`}
          aria-expanded={membersPreviewOpen}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setMembersPreviewOpen(prev => !prev);
          }}
        >
          <UsersRound size={16} aria-hidden="true" />
          <span>{activity.participants} / {activity.capacity}</span>
        </button>
        <span className="sport-card-chip"><Clock3 size={16} aria-hidden="true" /><span>{meta.durationMinutes || 90} {t.minutesShort}</span></span>
      </div>
      {membersPreviewOpen && (
        <div className="sport-card-members-preview">
          {joinedMembers.length > 0 ? (
            joinedMembers.map((member) => (
              <div key={member.userKey} className="sport-card-member-preview-row">
                <span className="sport-card-member-avatar">
                  {member.name?.slice(0, 2).toUpperCase() || "GO"}
                </span>
                <span className="sport-card-member-name">
                  {member.name || "GO IRL User"}
                </span>
              </div>
            ))
          ) : (
            <div className="sport-card-members-empty">
              {t.noParticipants || "Пока никого нет"}
            </div>
          )}
        </div>
      )}
      <div className="activity-card-details sport-details-grid">
        <div><MapPin /><span>{activity.address}</span></div>
        <div><CalendarDays /><span>{compactDateLabel(activity.date, language)}</span></div>
        <div><Ticket /><span>{activity.price ? `${activity.price} Kč` : t.free}</span></div>
        <div><ShieldCheck /><span>{sportFormatLabel(meta.format, language)}</span></div>
      </div>
      <div className="activity-card-footer">
        <span className={free <= 1 ? "spots urgent" : "spots"}><UsersRound />{free > 0 ? `${free} ${t.left}` : t.full}</span>
        <span className="card-status">{t.sportSkillMatch}</span>
        <button className={joined || pending ? "card-join secondary" : "card-join"} onClick={() => isOrganizer ? onOpen(activity) : onJoin(activity)} type="button" disabled={!isOrganizer && full && !joined && !pending}>{action}</button>
      </div>
    </article>
  );
}

export function SportActivitySheet({
  activity,
  language,
  cityName,
  loading,
  error,
  onClose,
  onJoin,
  onShare,
  onCalendar,
  onEdit,
  onDelete,
  onCloseMiniApp,
  initialMembersOpen = false,
}: SportSheetProps) {
  const { joinedIds, pendingIds, userRole, reviewRequest } = useAppStore();
  const [membersOpen, setMembersOpen] = useState(initialMembersOpen);
  const t = getTranslation(language);
  const meta = getSportMetadata(activity);
  const isOrganizer = activity.organizerKey === getUserKey();
  const canDelete = isOrganizer || userRole === "admin";
  const canManageActivity = isOrganizer || userRole === "admin" || userRole === "moderator";
  const joined = joinedIds.includes(activity.id);
  const pending = pendingIds.includes(activity.id);
  const full = activity.participants >= activity.capacity;
  const action = isOrganizer ? t.edit : pending ? t.cancelRequest : joined ? t.leave : full ? t.eventFull : activity.visibility === "invite" ? t.request : t.join;
  const joinedMembers = activity.members.filter((member) => member.status === "joined");
  const waitingMembers = activity.members.filter((member) => member.status === "waiting");
  const pendingMembers = activity.members.filter((member) => member.status === "pending");
  const sportMapQuery = buildMapsQuery([activity.address, cityName]);
  const sportMapSearchUrl = buildGoogleMapsSearchUrl(sportMapQuery);

  useEffect(() => {
    setMembersOpen(initialMembersOpen);
  }, [activity.id, initialMembersOpen]);

  const handleReview = async (memberKey: string, approved: boolean) => {
    await reviewRequest(activity.id, memberKey, approved);
  };

  return (
    <div className="sheet-backdrop" onMouseDown={onClose}>
      <article className="activity-sheet sport-sheet" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={onClose} type="button" aria-label={t.close}><X /></button>
        {loading && <SportDetailsSkeleton />}
        {error && <div className="details-error"><ShieldCheck /><span>{t.databaseError}</span></div>}
        <div className="sport-sheet-hero">
          <div className="sport-card-symbol large">{activity.activity[language].split(" ")[0] || ""}</div>
          <div>
            <div className="sport-eyebrow">{sportLevelLabel(meta.level, language)} · {sportEnvironmentLabel(meta.environment, language)}</div>
            <h2>{activity.title[language]}</h2>
            <p>{activity.description[language]}</p>
          </div>
        </div>
        <div className="sport-chip-row sport-sheet-chips">
          <span>{cleanSportLabel(meta.sportType || activity.activity[language])}</span>
          <span>{sportEnvironmentLabel(meta.environment, language)}</span>
          <span>{meta.durationMinutes || 90} {t.minutesShort}</span>
        </div>
        <div className="detail-list sport-detail-list">
          <div><Sparkles /><span>{t.sportLevel}</span><strong>{sportLevelLabel(meta.level, language)}</strong></div>
          <div><ShieldCheck /><span>{
```

## src/App.tsx

```tsx
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Compass,
  Dices,
  Bug,
  Home,
  MapPin,
  Pencil,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  UserRoundCheck,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { activityOptions, categories } from "./data";
import { AppHeader } from "./components/AppHeader";
import { buildGoogleCalendarUrl } from "./calendar/googleCalendar";
import { initializeTrustedAuth } from "./authSession";
import { cities, getCity } from "./config/cities";
import { getTranslation, localeByLanguage } from "./i18n";
import {
  applyDiscoverFilters,
  matchesActivityInterest,
  searchActivities,
  simpleRecommendationEngine,
  type DiscoverFilter,
} from "./recommendations";
import { useAppStore } from "./store";
import { ShareTemplateService } from "./share";
import { getUserKey } from "./supabase";
import { closeMiniApp, expandMiniApp, getTelegramWebApp, impactTelegram, notifyTelegram, readyMiniApp, showBackButton } from "./telegram";
import type { Activity, AppView, Category, Language, NewActivity, SportEnvironment, SportFormat, SportLevel, SportMetadata } from "./types";
import {
  MAX_EVENT_ADDRESS_LENGTH,
  MAX_EVENT_CAPACITY,
  MAX_EVENT_DESCRIPTION_LENGTH,
  MAX_EVENT_NOTE_LENGTH,
  MAX_EVENT_PRICE,
  MAX_EVENT_TITLE_LENGTH,
  MIN_EVENT_CAPACITY,
  validateEventCapacity,
  validateEventDate,
  validateEventPrice,
  validateMaxLength,
  validateOptionalUrl,
  validateRequiredText,
} from "./validation";
import { ActivityChatPanel } from "./components/ActivityChatPanel";


const activityInviteUrl = (activity: Activity) =>
  `${window.location.origin}/join/${encodeURIComponent(activity.id)}`;

const LazySportActivityCard = lazy(() => import("./verticals/SportVertical").then((module) => ({ default: module.SportActivityCard })));
const LazySportActivitySheet = lazy(() => import("./verticals/SportVertical").then((module) => ({ default: module.SportActivitySheet })));
const LazySportCreateFields = lazy(() => import("./verticals/SportVertical").then((module) => ({ default: module.SportCreateFields })));

const dateLabel = (date: string, language: Language) =>
  new Intl.DateTimeFormat(localeByLanguage[language], {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));

const compactDateLabel = (date: string, language: Language) => {
  const t = getTranslation(language);
  const eventDate = new Date(`${date}T12:00:00`);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date === todayKey) return t.today;
  if (date === tomorrow.toISOString().slice(0, 10)) return t.tomorrow;

  return new Intl.DateTimeFormat(localeByLanguage[language], {
    day: "numeric",
    month: "short",
  }).format(eventDate);
};

const fallbackCategory: Category = {
  id: "custom",
  icon: "✨",
  name: { ru: "Событие", uk: "Подія", cs: "Událost", en: "Event" },
};

const getActivityCategory = (activity: Activity) =>
  categories.find((item) => item.id === activity.categoryId) || fallbackCategory;

const isSportExperience = (activity: Activity) => activity.type === "sport" || activity.categoryId === "sport";

const safeDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const favoriteActivityOptions = (language: Language) => {
  const t = getTranslation(language);
  return [
    { id: "coffee", label: t.templateCoffee },
    { id: "walks", label: t.templateWalk },
    { id: "skating", label: t.templateSkating },
    { id: "cycling", label: t.favoriteCycling },
    { id: "running", label: t.favoriteRunning },
    { id: "hiking", label: t.favoriteHiking },
    { id: "board-games", label: t.templateBoardGames },
    { id: "football", label: t.favoriteFootball },
    { id: "tennis", label: t.favoriteTennis },
    { id: "volleyball", label: t.favoriteVolleyball },
    { id: "basketball", label: t.favoriteBasketball },
    { id: "swimming", label: t.favoriteSwimming },
    { id: "yoga", label: t.favoriteYoga },
    { id: "fitness", label: t.favoriteFitness },
    { id: "concerts", label: t.favoriteConcerts },
    { id: "cinema", label: t.favoriteCinema },
    { id: "food", label: t.templateFood },
    { id: "language-exchange", label: t.favoriteLanguageExchange },
    { id: "other", label: t.templateOther },
  ];
};

const sportMetadataFromForm = (data: FormData, sportType: string): SportMetadata => ({
  sportType,
  level: String(data.get("sportLevel") || "intermediate") as SportLevel,
  format: String(data.get("sportFormat") || "casual") as SportFormat,
  environment: String(data.get("sportEnvironment") || "outdoor") as SportEnvironment,
  equipmentNeeded: data.get("sportEquipmentNeeded") === "on",
  equipment: String(data.get("sportEquipment") || "").trim(),
  bring: String(data.get("sportBring") || "").trim(),
  requirements: String(data.get("sportRequirements") || "").trim(),
  organizerTips: String(data.get("sportOrganizerTips") || "").trim(),
  durationMinutes: Number(data.get("sportDuration") || 90),
});

function App() {
  const store = useAppStore();
  const [selected, setSelected] = useState<Activity | null>(null);
  const [selectedMembersOpen, setSelectedMembersOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [completion, setCompletion] = useState("");
  const [completionActivityId, setCompletionActivityId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const toastTimer = useRef<number | null>(null);
  const showNotice = (msg: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setNotice(msg);
    toastTimer.current = window.setTimeout(() => setNotice(""), 2200);
  };
  const invitationHandled = useRef(false);
  const t = getTranslation(store.language);

  useEffect(() => {
  readyMiniApp();
  expandMiniApp();
  const init = async () => {
    await initializeTrustedAuth();
    await useAppStore.getState().initialize();
  };
  init();

  const handleVisibility = () => {
    if (document.hidden) {
      useAppStore.getState().disposeRealtime();
    } else {
      void (async () => {
        await initializeTrustedAuth();
        await useAppStore.getState().initialize();
      })();
    }
  };

  window.addEventListener("focus", handleVisibility);
  window.addEventListener("blur", handleVisibility);
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    window.removeEventListener("focus", handleVisibility);
    window.removeEventListener("blur", handleVisibility);
    document.removeEventListener("visibilitychange", handleVisibility);
    useAppStore.getState().disposeRealtime();
  };
}, []);

  useEffect(() => {
    if (selected || store.view !== "home") {
      return showBackButton(() => {
        if (selected) setSelected(null);
        else store.setView("home");
      });
    }
    return undefined;
  }, [selected, store.view, store]);

  useEffect(() => {
    if (invitationHandled.current) return;
    const tg = getTelegramWebApp();
    const startParam = tg?.initDataUnsafe?.start_param;
    if (startParam) {
      const invitedActivity = store.activities.find((item) => item.id === startParam);
      if (invitedActivity) {
        invitationHandled.current = true;
        setSelected(invitedActivity);
      }
    }
  }, [store.activities]);

  const flash = (message: string) => {
    setNotice(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setNotice(""), 2200);
  };

  const requestCloseMiniApp = () => {
    if (!closeMiniApp()) flash(t.telegramCloseFallback);
  };

  const openRandom = () => {
    const random = store.activities[Math.floor(Math.random() * store.activities.length)];
    if (random) setSelected(random);
    impactTelegram("medium");
  };

  const handleJoin = async (activity: Activity) => {
    try {
      const result = await store.toggleJoin(activity.id);
      const message = result === "joined"
        ? t.joined
        : result === "pending"
          ? t.requested
          : result === "full"
            ? t.eventFull
            : result === "private"
              ? t.privateJoinInfo
              : t.leave;
      flash(message);
      notifyTelegram(result === "left" || result === "full" || result === "private" ? "warning" : "success");
    } catch {
      flash(t.joinError);
    }
  };

  const handleDelete = async (activity: Activity) => {
    const confirmed = window.confirm(`${t.deleteEventTitle}\n\n${t.deleteEventWarning}`);
    if (!confirmed) return;

    try {
      await store.deleteActivity(activity.id);
      setSelected(null);
      flash(t.eventDeleted);
      notifyTelegram("success");
    } catch {
      flash(t.deleteError);
      notifyTelegram("error");
    }
  };

  const shareActivity = async (activity: Activity) => {
    const url = activityInviteUrl(activity);
    const text = ShareTemplateService.buildPlainText(activity, store.language, url);
    const telegramShareUrl = `https://t.me/share/url?text=${encodeURIComponent(text)}`;

    const webApp = getTelegramWebApp();
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(telegramShareUrl);
      return;
    }

    if (navigator.share) {
      await navigator.share({ title: "GO IRL", text, url });
    } else {
      await navigator.clipboard?.writeText(text);
      showNotice(t.copied);
    }
  };

  const saveToGoogleCalendar = (activity: Activity) => {
    const url = buildGoogleCalendarUrl(activity, {
      language: store.language,
      eventUrl: activityInviteUrl(activity),
    });
    const webApp = getTelegramWebApp();
    if (webApp?.openLink) {
      webApp.openLink(url, { try_instant_view: false });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="app">
      <AppHeader
        language={store.language}
        selectedCityId={store.selectedCityId}
        translation={t}
        onBrandClick={() => store.setView("home")}
        onCityChange={store.setSelectedCity}
        onLanguageChange={store.setLanguage}
      />

      <main>
        {store.syncError && <div className="sync-banner">{t.databaseError}</div>}
        {store.loading && <div className="sync-loading">{t.loadingEvents}</div>}
        {store.view === "home" && (
          <HomeView
            language={store.language}
            onOpen={setSelected}
            onJoin={handleJoin}
            onRandom={openRandom}
            onCreate={() => store.setView("create")}
          />
        )}
        {store.view === "discover" && <DiscoverView language={store.language} onOpen={setSelected} onJoin={handleJoin} />}
        {store.view === "explore" && <ExploreView language={store.language} onOpen={setSelected} onJoin={handleJoin} />}
        {store.view === "create" && <CreateView key={editingActivity?.id || "new-event"} language={store.language} initialActivity={editingActivity} onCancel={() => {
          setEditingActivity(null);
          store.setView("home");
        }} onCreated={(id) => {
          flash(editingActivity ? t.updatedSuccess : t.createdSuccess);
          setEditingActivity(null);
          setCompletionActivityId(id);
          set
```

## src/types.ts

```tsx
export type Language = "ru" | "uk" | "cs" | "en";
export type AppView = "home" | "discover" | "explore" | "create" | "profile";
export type UserRole = "user" | "organizer" | "moderator" | "admin";
export type ActivityType = "sport" | "dating" | "friends" | "food" | "travel" | "culture" | "local" | "custom";
export type SportLevel = "beginner" | "intermediate" | "advanced";
export type SportFormat = "casual" | "training" | "competition";
export type SportEnvironment = "indoor" | "outdoor";
export type CoachRequestType = "organizer_request" | "participant_interest";
export type CoachRequestStatus = "pending" | "matched" | "confirmed" | "cancelled" | "completed" | "rejected";
export type CoachPaymentMode = "organizer" | "split" | "free" | "unknown";

export type SportMetadata = {
  sportType?: string;
  level?: SportLevel;
  format?: SportFormat;
  environment?: SportEnvironment;
  equipmentNeeded?: boolean;
  equipment?: string;
  bring?: string;
  requirements?: string;
  organizerTips?: string;
  durationMinutes?: number;
};

export type ActivityMetadata = {
  sport?: SportMetadata;
  dating?: Record<string, unknown>;
  friends?: Record<string, unknown>;
  food?: Record<string, unknown>;
  travel?: Record<string, unknown>;
  custom?: Record<string, unknown>;
};

export type Category = {
  id: string;
  icon: string;
  name: Record<Language, string>;
};

export type ActivityMember = {
  userKey: string;
  name: string;
  status: "joined" | "waiting" | "pending";
};

export type Activity = {
  id: string;
  type?: ActivityType;
  categoryId: string;
  activity: Record<Language, string>;
  title: Record<Language, string>;
  description: Record<Language, string>;
  date: string;
  time: string;
  cityId: string;
  address: string;
  locationUrl?: string;
  participantNote?: string;
  price: number;
  capacity: number;
  participants: number;
  members: ActivityMember[];
  organizer: string;
  organizerKey: string;
  visibility: "public" | "private" | "invite";
  urgent?: boolean;
  popular?: boolean;
  metadata?: ActivityMetadata;
};

export type NewActivity = Omit<Activity, "id" | "participants" | "members" | "organizer" | "organizerKey" | "activity" | "title" | "description"> & {
  titleText: string;
  descriptionText: string;
  activityText: string;
};

export type CoachProfile = {
  id: string;
  userKey: string;
  displayName: string;
  city?: string;
  bio?: string;
  sports: string[];
  languages: string[];
  priceFrom?: number;
  priceCurrency: string;
  isVerified: boolean;
  isActive: boolean;
  ratingAvg: number;
  ratingCount: number;
  ratingWeighted: number;
  createdAt: string;
  updatedAt: string;
};

export type CoachRequest = {
  id: string;
  activityId: string;
  requesterUserKey: string;
  coachProfileId?: string;
  requestType: CoachRequestType;
  sportType?: string;
  goal?: string;
  level?: string;
  budgetMin?: number;
  budgetMax?: number;
  paymentMode: CoachPaymentMode;
  status: CoachRequestStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type CoachReview = {
  id: string;
  coachProfileId: string;
  activityId: string;
  reviewerUserKey: string;
  overallRating: number;
  communicationRating?: number;
  punctualityRating?: number;
  trainingQualityRating?: number;
  beginnerFriendlinessRating?: number;
  tags: string[];
  comment?: string;
  isPublic: boolean;
  createdAt: string;
};


export type ActivityChatStatus = "active" | "expired" | "archived" | "deleted";

export type ActivityChatMessageStatus = "visible" | "deleted" | "hidden_by_moderator";

export type ActivityChat = {
  id: string;
  activityId: string;
  createdByUserKey: string;
  status: ActivityChatStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivityChatMessage = {
  id: string;
  chatId: string;
  activityId: string;
  senderUserKey: string;
  senderDisplayName?: string | null;
  body: string;
  status: ActivityChatMessageStatus;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
};

```

## src/store.ts

```tsx
import { create } from "zustand";
import { categories } from "./data";
import { supabase, getUserKey } from "./supabase";
import {
  getCurrentDisplayName,
  getCurrentStartParam,
  getCurrentUserRole as getTrustedUserRole,
  initializeTrustedAuth,
  isTrustedAuthReady } from "./authSession";
import { getCurrentUserRole, isCurrentUserAdmin } from "./config/admin";
import { cities, defaultCityId } from "./config/cities";
import { getTranslation } from "./i18n";
import type { Activity, ActivityMetadata, ActivityType, AppView, Language, NewActivity, UserRole } from "./types";

type JoinResult = "joined" | "pending" | "left" | "full" | "private";

type DbActivity = {
  id: string;
  category_id: string;
  activity_ru: string;
  activity_cs: string;
  title_ru: string;
  title_cs: string;
  description_ru: string;
  description_cs: string;
  event_date: string;
  event_time: string;
  city_id?: string | null;
  address: string;
  location_url: string | null;
  participant_note?: string | null;
  activity_type?: ActivityType | null;
  metadata?: ActivityMetadata | null;
  price: number;
  capacity: number;
  organizer: string;
  organizer_key: string;
  visibility: Activity["visibility"];
  urgent: boolean;
  popular: boolean;
};

type DbMember = {
  activity_id: string;
  user_key: string;
  display_name: string;
  status: "joined" | "waiting" | "pending";
};

type AppState = {
  language: Language;
  selectedCityId: string;
  view: AppView;
  activities: Activity[];
  joinedIds: string[];
  waitingIds: string[];
  pendingIds: string[];
  selectedCategory: string | null;
  loading: boolean;
  syncError: string | null;
  userRole: UserRole;
  initialize: () => Promise<void>;
  disposeRealtime: () => void;
  setLanguage: (language: Language) => void;
  setSelectedCity: (cityId: string) => void;
  setView: (view: AppView) => void;
  setCategory: (id: string | null) => void;
  toggleJoin: (id: string) => Promise<JoinResult>;
  createActivity: (activity: NewActivity) => Promise<string>;
  updateActivity: (id: string, activity: NewActivity) => Promise<string>;
  deleteActivity: (id: string) => Promise<void>;
  reviewRequest: (activityId: string, memberKey: string, approved: boolean) => Promise<void>;
};

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

// go-irl-visual-demo-mode-v1
const visualDemoStorageKey = "go-irl-visual-demo-activities-v1";
const visualDemoUserKey = "demo-user";
const isVisualDemoMode = () =>
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) &&
  !isTrustedAuthReady();

const demoLocalized = (value: string) => ({ ru: value, uk: value, cs: value, en: value });

const createSeedDemoActivities = (): Activity[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 5);
  const dateKey = (value: Date) => value.toISOString().slice(0, 10);

  return [
    {
      id: "demo-volleyball",
      type: "sport",
      categoryId: "sport",
      activity: demoLocalized("🏐 Волейбол"),
      title: demoLocalized("Волейбол на песке"),
      description: demoLocalized("Лёгкая игра для визуальной отладки карточек, участников, тренера и чата."),
      date: dateKey(tomorrow),
      time: "18:30",
      cityId: defaultCityId,
      address: "ZŠ Demlova, Olomouc",
      locationUrl: "https://www.google.com/maps/search/?api=1&query=Z%C5%A0%20Demlova%20Olomouc",
      participantNote: "Взять воду. Приходи за 10 минут.",
      price: 0,
      capacity: 8,
      participants: 3,
      members: [
        { userKey: visualDemoUserKey, name: "Тест", status: "joined" },
        { userKey: "demo-maks", name: "Maks", status: "joined" },
        { userKey: "demo-vita", name: "Vita", status: "joined" },
      ],
      organizer: "Тест",
      organizerKey: visualDemoUserKey,
      visibility: "public",
      urgent: true,
      popular: true,
      metadata: {
        sport: {
          sportType: "Волейбол",
          level: "beginner",
          format: "casual",
          environment: "outdoor",
          equipmentNeeded: false,
          bring: "Вода · удобная обувь",
          organizerTips: "Новичкам нормально, правила объясним",
          durationMinutes: 90,
        },
      },
    },
    {
      id: "demo-coffee",
      type: "custom",
      categoryId: "social",
      activity: demoLocalized("☕ Кофе"),
      title: demoLocalized("Кофе и прогулка"),
      description: demoLocalized("Тестовое событие для проверки обычной карточки."),
      date: dateKey(nextWeek),
      time: "16:00",
      cityId: defaultCityId,
      address: "Horní náměstí, Olomouc",
      locationUrl: "https://www.google.com/maps/search/?api=1&query=Horn%C3%AD%20n%C3%A1m%C4%9Bst%C3%AD%20Olomouc",
      participantNote: "Без плана, просто познакомиться.",
      price: 0,
      capacity: 4,
      participants: 1,
      members: [{ userKey: visualDemoUserKey, name: "Тест", status: "joined" }],
      organizer: "Тест",
      organizerKey: visualDemoUserKey,
      visibility: "public",
      urgent: false,
      popular: true,
    },
  ];
};

const readDemoActivities = () => {
  try {
    const stored = localStorage.getItem(visualDemoStorageKey);
    if (stored) return JSON.parse(stored) as Activity[];
  } catch {
    // noop
  }
  const seeded = createSeedDemoActivities();
  localStorage.setItem(visualDemoStorageKey, JSON.stringify(seeded));
  return seeded;
};

const writeDemoActivities = (activities: Activity[]) => {
  localStorage.setItem(visualDemoStorageKey, JSON.stringify(activities));
};

const syncDemoState = (setState: (state: Partial<AppState>) => void, activities: Activity[]) => {
  setState({
    activities: activities.map((activity) => ({
      ...activity,
      participants: activity.members.filter((member) => member.status === "joined").length,
    })),
    joinedIds: activities.filter((activity) => activity.members.some((member) => member.userKey === visualDemoUserKey && member.status === "joined")).map((activity) => activity.id),
    waitingIds: activities.filter((activity) => activity.members.some((member) => member.userKey === visualDemoUserKey && member.status === "waiting")).map((activity) => activity.id),
    pendingIds: activities.filter((activity) => activity.members.some((member) => member.userKey === visualDemoUserKey && member.status === "pending")).map((activity) => activity.id),
    syncError: null,
  });
};


class AuthNotReadyError extends Error {
  constructor() {
    super("Authentication is not ready yet");
    this.name = "AuthNotReadyError";
  }
}

const ensureTrustedAuthForWrite = async () => {
  if (isTrustedAuthReady()) return;

  const session = await initializeTrustedAuth();

  if (!session || !("source" in session) || session.source !== "trusted-telegram") {
    throw new AuthNotReadyError();
  }
};

const localizedDbText = (ru: string, cs: string) => ({
  ru,
  uk: ru,
  cs,
  en: ru });

const normalizeCategoryId = (categoryId: string) => {
  if (categoryId === "inline-skating") return "activities";
  return categories.some((category) => category.id === categoryId) ? categoryId : "activities";
};

const inferActivityType = (categoryId: string, explicitType?: ActivityType | null): ActivityType =>
  explicitType || (normalizeCategoryId(categoryId) === "sport" ? "sport" : "custom");

const mapActivity = (row: DbActivity, members: DbMember[]): Activity => ({
  id: row.id,
  type: activityOverride(row.id).type || inferActivityType(row.category_id, row.activity_type),
  categoryId: normalizeCategoryId(row.category_id),
  activity: localizedDbText(row.activity_ru, row.activity_cs),
  title: localizedDbText(row.title_ru, row.title_cs),
  description: localizedDbText(row.description_ru, row.description_cs),
  date: row.event_date,
  time: row.event_time.slice(0, 5),
  cityId: activityCityId(row),
  address: row.address,
  locationUrl: row.location_url || undefined,
  participantNote: row.participant_note || activityOverride(row.id).participantNote || undefined,
  price: row.price,
  capacity: row.capacity,
  participants: members.filter((member) => member.activity_id === row.id && member.status === "joined").length,
  members: members
    .filter((member) => member.activity_id === row.id)
    .map((member) => ({ userKey: member.user_key, name: member.display_name, status: member.status })),
  organizer: row.organizer,
  organizerKey: row.organizer_key,
  visibility: row.visibility,
  urgent: row.urgent,
  popular: row.popular,
  metadata: row.metadata || activityOverride(row.id).metadata || undefined });

const isMissingOptionalColumnError = (error: { message?: string } | null) =>
  Boolean(error?.message?.includes("city_id") || error?.message?.includes("participant_note") || error?.message?.includes("activity_type") || error?.message?.includes("metadata"));

const optionalActivityColumns = ["city_id", "participant_note", "activity_type", "metadata"] as const;
type OptionalActivityColumn = (typeof optionalActivityColumns)[number];

const deletedActivityMarker = "__go_irl_deleted__";
const missingActivityColumns = new Set<OptionalActivityColumn>();
const activityOverrideStorageKey = "go-irl-activity-overrides";
const legacyCityOverrideStorageKey = "go-irl-activity-city-overrides";

type ActivityOverride = {
  cityId?: string;
  participantNote?: string;
  type?: ActivityType;
  metadata?: ActivityMetadata;
};

const readActivityOverrides = (): Record<string, ActivityOverride> => {
  try {
    return JSON.parse(localStorage.getItem(activityOverrideStorageKey) || "{}") as Record<string, ActivityOverride>;
  } catch {
    return {};
  }
};

const readLegacyCityOverrides = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(legacyCityOverrideStorageKey) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
};

const writeActivityOverride = (activityId: string, override: ActivityOverride) => {
  const overrides = readActivityOverrides();
  overrides[activityId] = { ...overrides[activityId], ...override };
  localStorage.setItem(activityOverrideStorageKey, JSON.stringify(overrides));
};

const removeActivityOverride = (activityId: string) => {
  const overrides = readActivityOverrides();
  delete overrides[activityId];
  localStorage.setItem(activityOverrideStorageKey, JSON.stringify(overrides));
};

const activityOverride = (activityId: string) => readActivityOverrides()[activityId] || {};
const activityCityId = (row: DbActivity) => row.city_id || activityOverride(row.id).cityId || readLegacyCityOverrides()[row.id] || defaultCityId;
const isDeletedActivityRow = (row: DbActivity) => row.title_ru === deletedActivityMarker || row.title_cs === deletedActivityMarker;

const withoutMissingOptionalColumn = <T extends Partial<Record<OptionalActivityColumn, unknown>>>(row: T, error: { message?: string } | null) => {
  const message = error?.message || "";
  const nextRow = { ...row };
  const missingColumns = optionalActivityColumns.filter((column) => message.includes(column));
  const columnsToRemove = missingColumns.length ? missingColumns : optionalActivityColumns;

  for (const column of columnsToRemove) {
    missingActivityColumns.add(column);
    delete nextRow[column];
  }

  return nextRow;
};

const optionalOverrideFromInput = (input: NewActivity): ActivityOverride => {
  const override: ActivityOverride = {};
  if (missingActivityColumns.has("city_id")) override.cityId = input.cityId;
  if (missingActivityColumns.has("participant_note")) override.participantNote = input.participantNote;
  if (missingActivityColumns.has("activity_type")) o
```

## src/i18n.ts

```tsx
import type { Language } from "./types";

export const languageOptions: Array<{ id: Language; shortLabel: string; name: string }> = [
  { id: "ru", shortLabel: "RU", name: "Русский" },
  { id: "uk", shortLabel: "UK", name: "Українська" },
  { id: "cs", shortLabel: "CS", name: "Čeština" },
  { id: "en", shortLabel: "EN", name: "English" },
];

export const localeByLanguage: Record<Language, string> = {
  ru: "ru-RU",
  uk: "uk-UA",
  cs: "cs-CZ",
  en: "en-US",
};

const baseRu = {
  tagline: "Меньше скролла, больше жизни",
  brandMeaning: "GO IN REAL LIFE · Иди жить в реальном мире",
  homeTitle: "Что делаем сегодня?",
  homeSubtitle: "Выберите направление, найдите людей рядом и закройте телефон.",
  liveInCity: "Сейчас в городе",
  upcomingCount: "ближайших",
  activeDirections: "направлений",
  urgentShort: "срочных",
  eventCountLabel: "событий",
  chooseDirection: "Выберите направление",
  selectCity: "Выберите город",
  selectLanguage: "Выберите язык",
  notifications: "Уведомления",
  noNotifications: "Новых уведомлений пока нет",
  close: "Закрыть",
  done: "Готово",
  backToTelegram: "Вернуться в Telegram",
  telegramCloseFallback: "Закройте Mini App кнопкой назад в Telegram",
  closeAfterDoneHint: "Можно закрыть Mini App и вернуться в чат.",
  surprise: "Мне скучно",
  create: "Создать событие",
  categories: "Категории",
  nearby: "Ближайшие события",
  popular: "Популярное",
  urgent: "Срочно нужен участник",
  all: "Все события",
  today: "Сегодня",
  tomorrow: "Завтра",
  forYou: "Для тебя",
  discoverSubtitle: "Быстрые подборки по городу, интересам и свободным местам.",
  searchPlaceholder: "Поиск по событию, адресу, организатору или городу",
  quickFilters: "Быстрые фильтры",
  weekend: "Выходные",
  upTo200: "До 200 Kč",
  beginners: "Новички",
  publicOnly: "Только открытые",
  matchedForYou: "Подходит под фильтры",
  nearestEvents: "Ближайшие события",
  popularEvents: "Популярные события",
  newEvents: "Новые события",
  todaySection: "Сегодня",
  tomorrowSection: "Завтра",
  thisWeekSection: "На этой неделе",
  nearMeSection: "Рядом со мной",
  byInterestsSection: "По твоим интересам",
  enableLocation: "Включить гео",
  nearMeUnavailable: "Геолокация недоступна. Показываем события в выбранном городе.",
  open: "Открыть",
  free: "Бесплатно",
  yes: "Да",
  no: "Нет",
  spots: "мест",
  left: "осталось",
  full: "Мест нет",
  organizerRli: "RLI организатора",
  joined: "Вы участвуете",
  waiting: "Вы в очереди",
  join: "Присоединиться",
  leave: "Покинуть",
  wait: "Встать в очередь",
  request: "Отправить запрос",
  requested: "Запрос отправлен",
  cancelRequest: "Отменить запрос",
  eventFull: "Событие заполнено",
  organizerStatus: "Вы организатор",
  publicStatus: "Можно присоединиться сразу",
  inviteStatus: "Нужна заявка организатору",
  publicAccess: "Открыто для всех",
  inviteAccess: "По приглашению",
  privateAccess: "Закрытое событие",
  privateJoinInfo: "Закрытое событие доступно только по решению организатора",
  city: "Город",
  freeSpots: "Свободные места",
  requests: "Запросы на участие",
  approve: "Принять",
  reject: "Отклонить",
  edit: "Редактировать",
  save: "Сохранить изменения",
  delete: "Удалить",
  deleteEventTitle: "Удалить событие?",
  deleteEventWarning: "Это действие нельзя отменить",
  eventDeleted: "Событие удалено",
  deleteError: "Не удалось удалить событие",
  share: "Поделиться",
  report: "Сообщить о баге",
  organizer: "Организатор",
  participants: "Участники",
  waitingList: "Очередь ожидания",
  eventDetails: "Событие",
  createTitle: "Создать событие",
  createHint: "Повод выйти из дома за 30 секунд.",
  category: "Категория",
  activity: "Активность",
  title: "Название",
  description: "Описание",
  date: "Дата",
  time: "Время",
  address: "Адрес",
  locationUrl: "Ссылка на место",
  participantNote: "Заметка для участников",
  participantNotePlaceholder: "Например: возьмите воду, мяч или напишите мне перед входом",
  price: "Стоимость, Kč",
  priceInvalid: "Введите корректную сумму",
  priceNegative: "Сумма не может быть отрицательной",
  priceTooHigh: "Сумма слишком большая. Максимум 100 000 Kč",
  capacity: "Максимум участников",
  requiredField: "Заполните обязательные поля",
  titleTooLong: "Название слишком длинное. Максимум 80 символов",
  descriptionTooLong: "Описание слишком длинное. Максимум 500 символов",
  addressTooLong: "Адрес слишком длинный. Максимум 140 символов",
  noteTooLong: "Заметка слишком длинная. Максимум 240 символов",
  capacityInvalid: "Количество участников должно быть от 2 до 100",
  dateInPast: "Дата не может быть в прошлом",
  urlInvalid: "Введите корректную ссылку или оставьте поле пустым",
  quickTemplates: "Быстрые шаблоны",
  templateCoffee: "Кофе",
  templateWalk: "Прогулка",
  templateSport: "Спорт",
  templateSkating: "Ролики",
  templateFood: "Еда",
  templateBoardGames: "Настолки",
  templateOther: "Другое",
  sportVertical: "Спортивное событие",
  sportLevel: "Уровень",
  sportFormat: "Формат",
  sportEnvironment: "Локация",
  sportDuration: "Длительность",
  minutesShort: "мин",
  sportEquipmentNeeded: "Нужен инвентарь",
  sportEquipment: "Инвентарь",
  sportEquipmentPlaceholder: "Например: ракетка, мяч, коврик",
  sportBring: "Что взять",
  sportBringPlaceholder: "Например: вода, форма, запасная футболка",
  sportRequirements: "Требования",
  sportRequirementsPlaceholder: "Например: базовый уровень, удобная обувь",
  sportOrganizerTips: "Рекомендации организатора",
  sportOrganizerTipsPlaceholder: "Например: приходите за 10 минут до начала",
  sportSkillMatch: "Подходит по уровню",
  weatherHint: "Погода",
  weatherPlaceholder: "Погодная подсказка появится позже",
  openCreatedEvent: "Открыть событие",
  addToGoogleCalendar: "Добавить в Google Calendar",
  visibility: "Видимость",
  public: "Видно всем",
  private: "Только мне",
  invite: "По ссылке",
  publish: "Опубликовать",
  profile: "Профиль",
  editProfile: "Редактировать",
  name: "Имя",
  shortBio: "Короткое описание",
  avatar: "Аватар",
  favoriteActivities: "Любимые активности",
  favoriteActivitiesHint: "Выберите несколько активностей для персональных рекомендаций.",
  noFavoriteActivities: "Любимые активности пока не выбраны.",
  favoriteCycling: "Велосипед",
  favoriteRunning: "Бег",
  favoriteHiking: "Походы",
  favoriteFootball: "Футбол",
  favoriteTennis: "Теннис",
  favoriteVolleyball: "Волейбол",
  favoriteBasketball: "Баскетбол",
  favoriteSwimming: "Плавание",
  favoriteYoga: "Йога",
  favoriteFitness: "Фитнес",
  favoriteConcerts: "Концерты",
  favoriteCinema: "Кино",
  favoriteLanguageExchange: "Языковой обмен",
  profileBioFallback: "Люблю реальные встречи, новые места и людей рядом.",
  profileBioPlaceholder: "Например: играю в волейбол, люблю прогулки и камерные вечеринки",
  registeredAt: "В GO IRL с",
  profileStats: "Статистика",
  createdEvents: "создано",
  visitedEvents: "посещено",
  activeEvents: "активные",
  pendingRequests: "заявки",
  myEvents: "Мои события",
  organizing: "Организую",
  participating: "Участвую",
  waitingDecision: "Заявки ожидают решения",
  noOrganizedEvents: "Вы пока ничего не организуете.",
  noJoinedEvents: "Вы пока не участвуете в событиях.",
  noPendingRequests: "Нет заявок, которые ждут решения.",
  rli: "Real Life Index",
  confirmed: "подтверждённых встреч",
  lifeMap: "Карта жизни",
  events: "События",
  people: "Новые знакомства",
  activeWeeks: "Активные недели",
  organized: "Организовано",
  achievements: "Достижения",
  referral: "Пригласить друга",
  referralHint: "Бонус после трёх подтверждённых встреч друга",
  navHome: "Главная",
  navDiscover: "Для тебя",
  navExplore: "Найти",
  navCreate: "Создать",
  navProfile: "Профиль",
  noEvents: "Здесь пока тихо. Создайте первое событие.",
  loadingEvents: "Загружаем события…",
  databaseError: "Не удалось подключиться к базе событий",
  joinError: "Не удалось обновить участие",
  copied: "Ссылка скопирована",
  createdSuccess: "Событие опубликовано",
  updatedSuccess: "Изменения сохранены",
  publishError: "Не удалось опубликовать событие",
  noParticipants: "Пока никто не присоединился",
  guestName: "Гость GO IRL",
  titlePlaceholder: "Волейбол после работы",
  locationPlaceholder: "Ссылка Google Maps или Mapy.cz",
  explorer: "Исследователь",
  social: "Общительный",
  organizerLevel: "Организатор",
  legend: "Легенда",
};

const translations = {
  ru: baseRu,
  uk: {
    ...baseRu,
    tagline: "Менше скролу, більше життя",
    brandMeaning: "GO IN REAL LIFE · Іди жити в реальному світі",
    homeTitle: "Що робимо сьогодні?",
    homeSubtitle: "Оберіть напрям, знайдіть людей поруч і закрийте телефон.",
    liveInCity: "Зараз у місті",
    upcomingCount: "найближчих",
    activeDirections: "напрямів",
    urgentShort: "термінових",
    eventCountLabel: "подій",
    chooseDirection: "Оберіть напрям",
    selectCity: "Оберіть місто",
    selectLanguage: "Оберіть мову",
    notifications: "Сповіщення",
    noNotifications: "Нових сповіщень поки немає",
    close: "Закрити",
    done: "Готово",
    backToTelegram: "Повернутися в Telegram",
    telegramCloseFallback: "Закрийте Mini App кнопкою назад у Telegram",
    closeAfterDoneHint: "Можна закрити Mini App і повернутися в чат.",
    surprise: "Мені нудно",
    create: "Створити подію",
    categories: "Категорії",
    nearby: "Найближчі події",
    popular: "Популярне",
    urgent: "Терміново потрібен учасник",
    all: "Усі події",
    today: "Сьогодні",
    tomorrow: "Завтра",
    forYou: "Для тебе",
    discoverSubtitle: "Швидкі добірки за містом, інтересами та вільними місцями.",
    searchPlaceholder: "Пошук за подією, адресою, організатором або містом",
    quickFilters: "Швидкі фільтри",
    weekend: "Вихідні",
    upTo200: "До 200 Kč",
    beginners: "Новачки",
    publicOnly: "Тільки відкриті",
    matchedForYou: "Підходить під фільтри",
    nearestEvents: "Найближчі події",
    popularEvents: "Популярні події",
    newEvents: "Нові події",
    todaySection: "Сьогодні",
    tomorrowSection: "Завтра",
    thisWeekSection: "Цього тижня",
    nearMeSection: "Поруч зі мною",
    byInterestsSection: "За твоїми інтересами",
    enableLocation: "Увімкнути гео",
    nearMeUnavailable: "Геолокація недоступна. Показуємо події у вибраному місті.",
    open: "Відкрити",
    free: "Безкоштовно",
    yes: "Так",
    no: "Ні",
    spots: "місць",
    left: "залишилось",
    full: "Місць немає",
    organizerRli: "RLI організатора",
    joined: "Ви берете участь",
    waiting: "Ви в черзі",
    join: "Приєднатися",
    leave: "Вийти",
    wait: "Стати в чергу",
    request: "Надіслати запит",
    requested: "Запит надіслано",
    cancelRequest: "Скасувати запит",
    eventFull: "Подія заповнена",
    organizerStatus: "Ви організатор",
    publicStatus: "Можна приєднатися одразу",
    inviteStatus: "Потрібна заявка організатору",
    publicAccess: "Відкрита для всіх",
    inviteAccess: "За запрошенням",
    privateAccess: "Закрита подія",
    privateJoinInfo: "Закрита подія доступна лише за рішенням організатора",
    city: "Місто",
    freeSpots: "Вільні місця",
    requests: "Запити на участь",
    approve: "Прийняти",
    reject: "Відхилити",
    edit: "Редагувати",
    save: "Зберегти зміни",
    delete: "Видалити",
    deleteEventTitle: "Видалити подію?",
    deleteEventWarning: "Цю дію не можна скасувати",
    eventDeleted: "Подію видалено",
    deleteError: "Не вдалося видалити подію",
    share: "Поділитися",
    report: "Повідомити про баг",
    organizer: "Організатор",
    participants: "Учасники",
    waitingList: "Черга очікування",
    eventDetails: "Подія",
    createTitle: "Створити подію",
    createHint: "П
```

## Next action

Based on this audit:
1. Verify if Coach and Chat components are mounted in Sport detail screen.
2. Verify if Weather code is currently mounted or only partially present.
3. Patch only the missing/unsafe mounting points.
4. Keep Weather isolated from Coach/Chat state.
