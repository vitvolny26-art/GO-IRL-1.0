import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Bell, BellRing, Check, MessageCircle, Trash2 } from "lucide-react";
import { getCurrentChatIdentity, loadActivityChatMessages } from "../activityChatFeature";
import {
  activityChatUnreadChangedEvent,
  countUnreadActivityChatMessages,
  latestVisibleActivityChatMessageAt,
  loadActivityChatReadAt,
  markActivityChatRead,
} from "../activityChatUnread";
import {
  eventStartsAt,
  removeEventReminder,
  saveEventReminder,
  type EventReminderPreference,
  type ReminderChannel,
  type ReminderLeadMinutes,
} from "../reminderPreferences";
import {
  readLinkedReminderChannels,
  readServerEventReminder,
  removeServerEventReminder,
  saveServerEventReminder,
  usesServerReminderPersistence,
} from "../reminders/server-preferences";
import { useAppStore } from "../store";
import { readUserPreferences, updateUserPreferences } from "../userPreferences";

type Props = { activityId: string; date: string; time: string; label?: string };

const channels: Array<{ id: ReminderChannel; label: string; icon: string }> = [
  { id: "telegram", label: "Telegram", icon: "/icons/telegram.svg" },
  { id: "whatsapp", label: "WhatsApp", icon: "/icons/whatsapp.svg" },
  { id: "instagram", label: "Instagram", icon: "/icons/instagram.svg" },
  { id: "messenger", label: "Messenger", icon: "/icons/messenger.svg" },
];

const leadOptions: Array<{ value: ReminderLeadMinutes; label: string }> = [
  { value: 15, label: "За 15 минут" },
  { value: 60, label: "За 1 час" },
  { value: 180, label: "За 3 часа" },
  { value: 1440, label: "За 1 день" },
];

export function CardReminderAction({ activityId, date, time, label = "Настроить напоминание" }: Props) {
  const serverBacked = usesServerReminderPersistence();
  const joined = useAppStore((state) => state.joinedIds.includes(activityId));
  const preferredChannel = readUserPreferences().reminderProvider || "telegram";
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<EventReminderPreference | null>(null);
  const [channel, setChannel] = useState<ReminderChannel>(preferredChannel);
  const [leadMinutes, setLeadMinutes] = useState<ReminderLeadMinutes>(60);
  const [linkedChannels, setLinkedChannels] = useState<Set<ReminderChannel> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLSpanElement>(null);
  const latestMessageAtRef = useRef<string | null>(null);

  const refreshUnread = useCallback(async () => {
    if (!joined) {
      setUnreadCount(0);
      return;
    }

    try {
      const [messages, identity] = await Promise.all([
        loadActivityChatMessages(activityId),
        getCurrentChatIdentity(),
      ]);
      latestMessageAtRef.current = latestVisibleActivityChatMessageAt(messages);
      setUnreadCount(countUnreadActivityChatMessages(
        messages,
        identity.userKey,
        loadActivityChatReadAt(activityId, identity.userKey),
      ));
    } catch {
      latestMessageAtRef.current = null;
      setUnreadCount(0);
    }
  }, [activityId, joined]);

  useEffect(() => {
    void refreshUnread();
    const timer = window.setInterval(() => {
      if (!document.hidden) void refreshUnread();
    }, 20_000);
    const handleRefresh = () => { void refreshUnread(); };
    window.addEventListener("focus", handleRefresh);
    window.addEventListener(activityChatUnreadChangedEvent, handleRefresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener(activityChatUnreadChangedEvent, handleRefresh);
    };
  }, [refreshUnread]);

  useEffect(() => {
    if (!serverBacked) return;
    let active = true;
    Promise.all([
      readServerEventReminder(activityId),
      readLinkedReminderChannels(),
    ]).then(([serverReminder, providers]) => {
      if (!active) return;
      setLinkedChannels(providers);
      if (serverReminder) {
        saveEventReminder(serverReminder);
        setSaved(serverReminder);
        setChannel(serverReminder.channel);
        setLeadMinutes(serverReminder.leadMinutes);
      } else {
        removeEventReminder(activityId);
        setSaved(null);
        const preferred = readUserPreferences().reminderProvider;
        if (preferred && providers.has(preferred)) setChannel(preferred);
        else if (!providers.has(channel)) setChannel(providers.values().next().value || "telegram");
      }
    }).catch(() => {
      if (active) setError("Не удалось загрузить настройки напоминания.");
    });
    return () => { active = false; };
  }, [activityId, serverBacked]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const openUnreadChat = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void getCurrentChatIdentity().then((identity) => {
      const latest = latestMessageAtRef.current;
      if (!latest || !markActivityChatRead(activityId, identity.userKey, latest)) return;
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent(activityChatUnreadChangedEvent, { detail: { activityId } }));
    });
    const card = event.currentTarget.closest("article");
    const openChatButton = card?.querySelector<HTMLButtonElement>(".activity-card-footer .sport-coach-action");
    openChatButton?.click();
  };

  const save = async () => {
    const preference = {
      activityId,
      channel,
      leadMinutes,
      eventStartsAt: eventStartsAt(date, time),
      updatedAt: new Date().toISOString(),
    };
    setSaving(true);
    setError("");
    try {
      if (!serverBacked) throw new Error("trusted_auth_required");
      await saveServerEventReminder(activityId, channel, leadMinutes);
      saveEventReminder(preference);
      updateUserPreferences({ reminderProvider: channel });
      setSaved(preference);
      setOpen(false);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "";
      setError(message.includes("provider_not_linked")
        ? "Сначала откройте чат с выбранным ботом GO IRL."
        : message.includes("reminder_time_passed")
          ? "Для этого времени напоминание уже невозможно."
          : "Не удалось сохранить напоминание. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setError("");
    try {
      if (!serverBacked) throw new Error("trusted_auth_required");
      await removeServerEventReminder(activityId);
      removeEventReminder(activityId);
      setSaved(null);
      setOpen(false);
    } catch {
      setError("Не удалось удалить напоминание. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {joined && unreadCount > 0 ? (
        <button
          className="event-request-alert"
          type="button"
          aria-label={`Новых сообщений: ${unreadCount}`}
          onClick={openUnreadChat}
        >
          <MessageCircle aria-hidden="true" />
          <span>{unreadCount > 99 ? "99+" : unreadCount}</span>
        </button>
      ) : null}
      <span className="card-reminder-action" ref={rootRef}>
        <button
          className={saved ? "sport-card-icon-action is-reminder-active" : "sport-card-icon-action"}
          type="button"
          aria-label={label}
          aria-expanded={open}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen((value) => !value);
          }}
        >
          {saved ? <BellRing aria-hidden="true" /> : <Bell aria-hidden="true" />}
        </button>
        {open ? (
          <span className="card-reminder-panel" role="dialog" aria-label={label} onClick={(event) => event.stopPropagation()}>
            <strong>Напомнить о событии</strong>
            <span className="card-reminder-leads">
              {leadOptions.map((option) => (
                <button className={leadMinutes === option.value ? "is-selected" : ""} type="button" key={option.value} onClick={() => setLeadMinutes(option.value)}>
                  {option.label}
                </button>
              ))}
            </span>
            <span className="card-reminder-channels">
              {channels.map((option) => {
                const unavailable = !serverBacked || linkedChannels === null || !linkedChannels.has(option.id);
                return (
                  <button
                    className={channel === option.id ? "is-selected" : ""}
                    type="button"
                    key={option.id}
                    disabled={unavailable || saving}
                    title={unavailable
                      ? serverBacked
                        ? "Канал не подключён или недоступен для доставки"
                        : "Сначала войдите в GO IRL через поддерживаемый мессенджер"
                      : undefined}
                    onClick={() => { setChannel(option.id); setError(""); }}
                  >
                    <img src={option.icon} alt="" /><span>{option.label}</span>{channel === option.id ? <Check aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </span>
            {!serverBacked ? (
              <span className="card-reminder-info">
                Войдите в GO IRL через поддерживаемый мессенджер, чтобы получать напоминания.
              </span>
            ) : null}
            {error ? <span className="card-reminder-error" role="alert">{error}</span> : null}
            <button className="card-reminder-save" type="button" disabled={saving || !serverBacked || linkedChannels === null || !linkedChannels.has(channel)} onClick={save}>
              {saving ? "Сохраняем…" : "Сохранить напоминание"}
            </button>
            {saved ? (
              <button className="card-reminder-remove" type="button" disabled={saving} onClick={remove}>
                <Trash2 aria-hidden="true" /> Удалить
              </button>
            ) : null}
          </span>
        ) : null}
      </span>
    </>
  );
}
