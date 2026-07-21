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
  const [saved, setSaved] = useState(() => readEventReminder(activityId));
  const [channel, setChannel] = useState<ReminderChannel>(saved?.channel || "telegram");
  const [leadMinutes, setLeadMinutes] = useState<ReminderLeadMinutes>(saved?.leadMinutes || 60);
  const rootRef = useRef<HTMLSpanElement>(null);

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

  const save = () => {
    const preference = {
      activityId,
      channel,
      leadMinutes,
      eventStartsAt: eventStartsAt(date, time),
      updatedAt: new Date().toISOString(),
    };
    saveEventReminder(preference);
    setSaved(preference);
    setOpen(false);
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
            {channels.map((option) => (
              <button className={channel === option.id ? "is-selected" : ""} type="button" key={option.id} onClick={() => setChannel(option.id)}>
                <img src={option.icon} alt="" /><span>{option.label}</span>{channel === option.id ? <Check aria-hidden="true" /> : null}
              </button>
            ))}
          </span>
          <button className="card-reminder-save" type="button" onClick={save}>Сохранить напоминание</button>
          {saved ? (
            <button className="card-reminder-remove" type="button" onClick={() => { removeEventReminder(activityId); setSaved(null); setOpen(false); }}>
              <Trash2 aria-hidden="true" /> Удалить
            </button>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
