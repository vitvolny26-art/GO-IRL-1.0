import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, Check, Trash2 } from "lucide-react";
import {
  eventStartsAt,
  readEventReminder,
  removeEventReminder,
  saveEventReminder,
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
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(() =>
    usesServerReminderPersistence() ? null : readEventReminder(activityId));
  const [channel, setChannel] = useState<ReminderChannel>(saved?.channel || "telegram");
  const [leadMinutes, setLeadMinutes] = useState<ReminderLeadMinutes>(saved?.leadMinutes || 60);
  const [linkedChannels, setLinkedChannels] = useState<Set<ReminderChannel> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!usesServerReminderPersistence()) return;
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
      }
    }).catch(() => {
      if (active) setError("Не удалось загрузить настройки напоминания.");
    });
    return () => { active = false; };
  }, [activityId]);

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
      if (usesServerReminderPersistence()) {
        await saveServerEventReminder(activityId, channel, leadMinutes);
      }
      saveEventReminder(preference);
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
      if (usesServerReminderPersistence()) {
        await removeServerEventReminder(activityId);
      }
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
              const unavailable = linkedChannels !== null && !linkedChannels.has(option.id);
              return (
              <button
                className={channel === option.id ? "is-selected" : ""}
                type="button"
                key={option.id}
                disabled={unavailable || saving}
                title={unavailable ? "Сначала откройте чат с ботом GO IRL в этом мессенджере" : undefined}
                onClick={() => { setChannel(option.id); setError(""); }}
              >
                <img src={option.icon} alt="" /><span>{option.label}</span>{channel === option.id ? <Check aria-hidden="true" /> : null}
              </button>
              );
            })}
          </span>
          {error ? <span className="card-reminder-error" role="alert">{error}</span> : null}
          <button className="card-reminder-save" type="button" disabled={saving} onClick={save}>
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
  );
}
