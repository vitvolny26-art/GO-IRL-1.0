import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { Bell, BellRing, CalendarDays, CalendarPlus, Check, ChevronLeft, ChevronRight, Clock3, MapPin, Scissors, Ticket, UserRound, UsersRound, X } from "lucide-react";
import type { Language } from "../types";
import { CardShareAction } from "../components/CardShareAction";
import type { ServicesProfessional } from "./servicesProfessionalDirectory";
import { getServiceArtwork } from "./serviceArtwork";
import { createServiceBooking, listServiceBookings } from "./servicesBookingRepository";
import "./service-activity-card.css";
import "./service-activity-card-overrides.css";

type PilotAppointment = { id: string; date: string; time: string; status: string };
type PilotBlock = { id: string; date: string; time: string };
type PilotData = { appointments?: PilotAppointment[]; blocks?: PilotBlock[] };
type Reminder = { profileId: string; serviceName?: string; leadMinutes: number; channel: string; date: string; time: string };
type WorkspaceSnapshot = { availability?: { weekdays?: string[] } };

const pilotKey = "go-irl-beauty-pilot-v1";
const remindersKey = "go-irl-services-reminders-v2";
const workspaceRecoveryKey = "go-irl-beauty-workspace-v2";
const defaultSlots = ["09:00", "10:30", "12:00", "14:30", "16:00"];
const locale: Record<Language, string> = { ru: "ru-RU", uk: "uk-UA", cs: "cs-CZ", en: "en-GB" };
const weekdayNumber: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

const text = {
  ru: { services: "Услуги", selectService: "Выберите услугу", book: "Записаться", duration: "Длительность", price: "Цена", address: "Адрес", date: "Дата", master: "Мастер", close: "Закрыть", booking: "Запись к мастеру", chooseDate: "Выберите дату", chooseTime: "Выберите время", send: "Отправить запрос", sent: "Запрос отправлен", reminder: "Напомнить", reminderTitle: "Напоминание о записи", save: "Сохранить напоминание", slots: "Свободные окна", noSlots: "Нет свободного времени", previousMonth: "Предыдущий месяц", nextMonth: "Следующий месяц", name: "Имя", contact: "Контакт", required: "Обязательное поле" },
  uk: { services: "Послуги", selectService: "Оберіть послугу", book: "Записатися", duration: "Тривалість", price: "Ціна", address: "Адреса", date: "Дата", master: "Майстер", close: "Закрити", booking: "Запис до майстра", chooseDate: "Оберіть дату", chooseTime: "Оберіть час", send: "Надіслати запит", sent: "Запит надіслано", reminder: "Нагадати", reminderTitle: "Нагадування про запис", save: "Зберегти нагадування", slots: "Вільні вікна", noSlots: "Немає вільного часу", previousMonth: "Попередній місяць", nextMonth: "Наступний місяць", name: "Ім’я", contact: "Контакт", required: "Обов’язкове поле" },
  cs: { services: "Služby", selectService: "Vyberte službu", book: "Rezervovat", duration: "Délka", price: "Cena", address: "Adresa", date: "Datum", master: "Profesionál", close: "Zavřít", booking: "Rezervace", chooseDate: "Vyberte datum", chooseTime: "Vyberte čas", send: "Odeslat žádost", sent: "Žádost odeslána", reminder: "Připomenout", reminderTitle: "Připomínka rezervace", save: "Uložit připomínku", slots: "Volné termíny", noSlots: "Žádný volný termín", previousMonth: "Předchozí měsíc", nextMonth: "Další měsíc", name: "Jméno", contact: "Kontakt", required: "Povinné pole" },
  en: { services: "Services", selectService: "Choose a service", book: "Book", duration: "Duration", price: "Price", address: "Address", date: "Date", master: "Professional", close: "Close", booking: "Book a professional", chooseDate: "Choose a date", chooseTime: "Choose a time", send: "Send request", sent: "Request sent", reminder: "Remind me", reminderTitle: "Booking reminder", save: "Save reminder", slots: "Available slots", noSlots: "No available time", previousMonth: "Previous month", nextMonth: "Next month", name: "Name", contact: "Contact", required: "Required field" },
} satisfies Record<Language, Record<string, string>>;

const localDateKey = (value = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

const monthKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
const serviceKey = (professional: ServicesProfessional) => `${professional.profileId}:${professional.serviceName}:${professional.durationMinutes}:${professional.priceCzk}`;

const readJson = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || "null") as T || fallback; }
  catch { return fallback; }
};

const workingWeekdays = () => {
  const snapshot = readJson<WorkspaceSnapshot>(workspaceRecoveryKey, {});
  const configured = snapshot.availability?.weekdays?.map((item) => weekdayNumber[item]).filter((item): item is number => typeof item === "number");
  return new Set(configured?.length ? configured : [1, 2, 3, 4, 5]);
};

const freeSlotsFor = (date: string, profileId: string, serviceName: string) => {
  const pilot = readJson<PilotData>(pilotKey, {});
  const bookings = listServiceBookings();
  const occupied = new Set([
    ...(pilot.appointments || []).filter((item) => item.date === date && ["pending", "confirmed"].includes(item.status)).map((item) => item.time),
    ...(pilot.blocks || []).filter((item) => item.date === date).map((item) => item.time),
    ...bookings.filter((item) => item.profileId === profileId && item.serviceName === serviceName && item.date === date && ["pending", "confirmed"].includes(item.status)).map((item) => item.time),
  ]);
  return defaultSlots.filter((slot) => !occupied.has(slot));
};

const formatCompactDate = (date: string, language: Language) => new Intl.DateTimeFormat(locale[language], {
  day: "2-digit",
  month: "short",
}).format(parseDateKey(date)).replace(/\.$/, "");

const useTodayKey = () => {
  const [value, setValue] = useState(localDateKey);
  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      setValue(localDateKey());
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      timer = window.setTimeout(schedule, Math.max(1000, next.getTime() - now.getTime()));
    };
    const onVisibility = () => { if (!document.hidden) setValue(localDateKey()); };
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return value;
};

const calendarCells = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(year, monthNumber - 1, 1, 12);
  const days = new Date(year, monthNumber, 0, 12).getDate();
  const mondayOffset = (first.getDay() + 6) % 7;
  return [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from({ length: days }, (_, index) => localDateKey(new Date(year, monthNumber - 1, index + 1, 12))),
  ];
};

function ServiceReminderAction({ professional, date, time, language }: { professional: ServicesProfessional; date: string; time: string; language: Language }) {
  const labels = text[language];
  const existing = readJson<Reminder[]>(remindersKey, []).find((item) => item.profileId === professional.profileId && (!item.serviceName || item.serviceName === professional.serviceName));
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(Boolean(existing));
  const [leadMinutes, setLeadMinutes] = useState(existing?.leadMinutes || 60);
  const [channel, setChannel] = useState(existing?.channel || "telegram");

  useEffect(() => {
    const current = readJson<Reminder[]>(remindersKey, []).find((item) => item.profileId === professional.profileId && (!item.serviceName || item.serviceName === professional.serviceName));
    setSaved(Boolean(current));
    setLeadMinutes(current?.leadMinutes || 60);
    setChannel(current?.channel || "telegram");
    setOpen(false);
  }, [professional.profileId, professional.serviceName]);

  const save = () => {
    const current = readJson<Reminder[]>(remindersKey, []).filter((item) => !(item.profileId === professional.profileId && (!item.serviceName || item.serviceName === professional.serviceName)));
    localStorage.setItem(remindersKey, JSON.stringify([...current, { profileId: professional.profileId, serviceName: professional.serviceName, leadMinutes, channel, date, time }]));
    setSaved(true);
    setOpen(false);
  };

  const popup = open ? createPortal(<div className="service-popup-backdrop" onPointerDown={() => setOpen(false)}>
    <section className="service-popup-panel service-reminder-popover" role="dialog" aria-modal="true" aria-label={labels.reminderTitle} onPointerDown={(event) => event.stopPropagation()}>
      <button className="service-popup-close" type="button" aria-label={labels.close} onClick={() => setOpen(false)}><X /></button>
      <strong>{labels.reminderTitle}</strong>
      <small>{professional.serviceName} · {formatCompactDate(date, language)} · {time}</small>
      <div className="service-reminder-choice-grid">{[15, 60, 180, 1440].map((value) => <button className={leadMinutes === value ? "is-selected" : ""} type="button" key={value} onClick={() => setLeadMinutes(value)}>{value === 1440 ? "1 day" : `${value} min`}{leadMinutes === value && <Check />}</button>)}</div>
      <div className="service-reminder-channel-grid">{["telegram", "whatsapp", "instagram", "messenger"].map((value) => <button className={channel === value ? "is-selected" : ""} type="button" key={value} onClick={() => setChannel(value)}>{value}</button>)}</div>
      <button className="service-reminder-save" type="button" onClick={save}>{labels.save}</button>
    </section>
  </div>, document.body) : null;

  return <span className="service-reminder-action">
    <button className={saved ? "sport-card-icon-action is-reminder-active" : "sport-card-icon-action"} type="button" aria-label={labels.reminder} aria-expanded={open} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setOpen((value) => !value); }}>{saved ? <BellRing /> : <Bell />}</button>
    {popup}
  </span>;
}

type ServiceActivityCardProps = {
  professional: ServicesProfessional;
  serviceOptions?: ServicesProfessional[];
  language: Language;
};

export function ServiceActivityCard({ professional: initialProfessional, serviceOptions = [], language }: ServiceActivityCardProps) {
  const labels = text[language];
  const options = useMemo(() => Array.from(new Map([initialProfessional, ...serviceOptions].map((item) => [serviceKey(item), item])).values()), [initialProfessional, serviceOptions]);
  const [selectedServiceKey, setSelectedServiceKey] = useState(() => serviceKey(initialProfessional));
  const professional = options.find((item) => serviceKey(item) === selectedServiceKey) || options[0] || initialProfessional;
  const todayDate = useTodayKey();
  const [cardDate, setCardDate] = useState(todayDate);
  const [compactCalendarOpen, setCompactCalendarOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(cardDate);
  const [calendarMonth, setCalendarMonth] = useState(() => cardDate.slice(0, 7));
  const [bookingName, setBookingName] = useState("");
  const [bookingContact, setBookingContact] = useState("");
  const cardSlots = useMemo(() => freeSlotsFor(cardDate, professional.profileId, professional.serviceName), [cardDate, professional.profileId, professional.serviceName, bookingSent]);
  const bookingSlots = useMemo(() => freeSlotsFor(bookingDate, professional.profileId, professional.serviceName), [bookingDate, professional.profileId, professional.serviceName, bookingSent]);
  const [time, setTime] = useState(() => freeSlotsFor(cardDate, initialProfessional.profileId, initialProfessional.serviceName)[0] || "");
  const artwork = getServiceArtwork(professional.serviceName);
  const url = new URL(professional.publicLink, window.location.origin).toString();
  const avatar = professional.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const nextSlot = cardSlots[0] || "09:00";
  const occupiedCount = defaultSlots.length - cardSlots.length;
  const allowedWeekdays = useMemo(workingWeekdays, [bookingOpen]);
  const days = useMemo(() => calendarCells(calendarMonth), [calendarMonth]);
  const weekdayLabels = useMemo(() => {
    const monday = new Date(2026, 7, 3, 12);
    return Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale[language], { weekday: "short" }).format(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index, 12)).slice(0, 2));
  }, [language]);
  const bookingFormValid = Boolean(time && bookingName.trim() && bookingContact.trim());

  useEffect(() => {
    if (!options.some((item) => serviceKey(item) === selectedServiceKey)) setSelectedServiceKey(serviceKey(options[0] || initialProfessional));
  }, [initialProfessional, options, selectedServiceKey]);

  useEffect(() => {
    if (cardDate < todayDate) setCardDate(todayDate);
  }, [cardDate, todayDate]);

  useEffect(() => {
    const slots = freeSlotsFor(cardDate, professional.profileId, professional.serviceName);
    setBookingDate(cardDate);
    setCalendarMonth(cardDate.slice(0, 7));
    setTime(slots[0] || "");
    setBookingSent(false);
    setSlotsOpen(false);
    setCompactCalendarOpen(false);
  }, [cardDate, professional.profileId, professional.serviceName]);

  const isSelectableDate = (date: string) => date >= todayDate
    && allowedWeekdays.has(parseDateKey(date).getDay())
    && freeSlotsFor(date, professional.profileId, professional.serviceName).length > 0;

  const chooseDate = (date: string) => {
    if (!isSelectableDate(date)) return;
    const slots = freeSlotsFor(date, professional.profileId, professional.serviceName);
    setBookingDate(date);
    setTime(slots[0] || "");
    setBookingSent(false);
  };

  const chooseCardDate = (date: string) => {
    if (!isSelectableDate(date)) return;
    const slots = freeSlotsFor(date, professional.profileId, professional.serviceName);
    setCardDate(date);
    setBookingDate(date);
    setTime(slots[0] || "");
    setBookingSent(false);
    setCompactCalendarOpen(false);
  };

  const moveMonth = (offset: number) => {
    const [year, month] = calendarMonth.split("-").map(Number);
    const next = new Date(year, month - 1 + offset, 1, 12);
    const nextKey = monthKey(next);
    if (nextKey < todayDate.slice(0, 7)) return;
    setCalendarMonth(nextKey);
  };

  const openBooking = (date = cardDate, selectedTime?: string) => {
    const slots = freeSlotsFor(date, professional.profileId, professional.serviceName);
    setBookingDate(date);
    setCalendarMonth(date.slice(0, 7));
    setTime(selectedTime && slots.includes(selectedTime) ? selectedTime : slots[0] || "");
    setBookingSent(false);
    setBookingOpen(true);
  };

  const submitBooking = () => {
    if (!bookingFormValid) return;
    createServiceBooking({
      profileId: professional.profileId,
      professionalName: professional.displayName,
      serviceName: professional.serviceName,
      clientName: bookingName.trim(),
      clientContact: bookingContact.trim(),
      date: bookingDate,
      time,
      durationMinutes: professional.durationMinutes,
      priceCzk: professional.priceCzk,
      currency: professional.currency,
      publicLocation: professional.publicLocation,
    });
    setBookingSent(true);
  };

  const selectService = (item: ServicesProfessional) => {
    setSelectedServiceKey(serviceKey(item));
    setServicesOpen(false);
  };

  const openMap = () => window.open(`https://mapy.cz/zakladni?q=${encodeURIComponent(professional.publicLocation)}`, "_blank", "noopener,noreferrer");

  const details = detailsOpen ? createPortal(<div className="service-sheet-backdrop" onPointerDown={() => setDetailsOpen(false)}>
    <article className="service-activity-sheet" onPointerDown={(event) => event.stopPropagation()}>
      <button className="service-sheet-close" type="button" aria-label={labels.close} onClick={() => setDetailsOpen(false)}><X /></button>
      <div className="service-sheet-hero">{artwork ? <img src={artwork.sheet} alt="" /> : <span>{avatar}</span>}<div><small>{professional.serviceName}</small><h2>{professional.displayName}</h2></div></div>
      <div className="service-sheet-grid">
        <div><UserRound /><span><small>{labels.master}</small><strong>{professional.displayName}</strong></span></div>
        <div><CalendarDays /><span><small>{labels.date}</small><strong>{formatCompactDate(cardDate, language)}</strong></span></div>
        <div><Ticket /><span><small>{labels.price}</small><strong>{professional.priceCzk} {professional.currency}</strong></span></div>
        <button type="button" onClick={openMap}><MapPin /><span><small>{labels.address}</small><strong>{professional.publicLocation}</strong></span></button>
        <div><Clock3 /><span><small>{labels.duration}</small><strong>{professional.durationMinutes} min</strong></span></div>
        <div><UsersRound /><span><small>{labels.slots}</small><strong>{occupiedCount}/{defaultSlots.length}</strong></span></div>
      </div>
      {artwork && <img className="service-sheet-portfolio" src={artwork.portfolio} alt="" />}
      <button className="service-sheet-book" type="button" onClick={() => { setDetailsOpen(false); openBooking(); }}>{labels.book}</button>
    </article>
  </div>, document.body) : null;

  const booking = bookingOpen ? createPortal(<div className="service-sheet-backdrop" onPointerDown={() => setBookingOpen(false)}>
    <section className="service-booking-sheet service-booking-calendar-sheet" role="dialog" aria-modal="true" onPointerDown={(event) => event.stopPropagation()}>
      <button className="service-sheet-close" type="button" aria-label={labels.close} onClick={() => setBookingOpen(false)}><X /></button>
      <h2>{labels.booking}</h2><p>{professional.displayName} · {professional.serviceName}</p>
      <div className="service-booking-contact-grid">
        <label><span>{labels.name} *</span><input required value={bookingName} onChange={(event) => { setBookingName(event.target.value); setBookingSent(false); }} placeholder={labels.required} /></label>
        <label><span>{labels.contact} *</span><input required value={bookingContact} onChange={(event) => { setBookingContact(event.target.value); setBookingSent(false); }} placeholder="Telegram / phone / email" /></label>
      </div>
      <div className="service-calendar-toolbar">
        <button type="button" aria-label={labels.previousMonth} onClick={() => moveMonth(-1)} disabled={calendarMonth <= todayDate.slice(0, 7)}><ChevronLeft /></button>
        <input aria-label={labels.chooseDate} type="month" min={todayDate.slice(0, 7)} value={calendarMonth} onChange={(event) => setCalendarMonth(event.target.value || todayDate.slice(0, 7))} />
        <button type="button" aria-label={labels.nextMonth} onClick={() => moveMonth(1)}><ChevronRight /></button>
      </div>
      <div className="service-calendar-weekdays">{weekdayLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>
      <div className="service-calendar-grid">{days.map((date, index) => date ? <button
        className={date === bookingDate ? "is-selected" : ""}
        type="button"
        key={date}
        disabled={!isSelectableDate(date)}
        onClick={() => chooseDate(date)}
      ><span>{parseDateKey(date).getDate()}</span><small>{freeSlotsFor(date, professional.profileId, professional.serviceName).length || "—"}</small></button> : <span key={`empty-${index}`} />)}</div>
      <div className="service-booking-selected"><CalendarDays /><strong>{formatCompactDate(bookingDate, language)}</strong><span>{labels.chooseTime}</span></div>
      <div className="service-booking-slots">{bookingSlots.map((slot) => <button className={time === slot ? "is-selected" : ""} type="button" key={slot} onClick={() => { setTime(slot); setBookingSent(false); }}>{slot}</button>)}</div>
      {!bookingSlots.length && <div className="service-booking-empty">{labels.noSlots}</div>}
      {bookingSent ? <div className="service-booking-success"><Check />{labels.sent}</div> : <button className="service-sheet-book" type="button" onClick={submitBooking} disabled={!bookingFormValid}><CalendarPlus />{labels.send}</button>}
    </section>
  </div>, document.body) : null;

  const servicePicker = servicesOpen ? createPortal(<div className="service-popup-backdrop" onPointerDown={() => setServicesOpen(false)}>
    <section className="service-popup-panel service-picker-popover" role="dialog" aria-modal="true" aria-label={labels.selectService} onPointerDown={(event) => event.stopPropagation()}>
      <button className="service-popup-close" type="button" aria-label={labels.close} onClick={() => setServicesOpen(false)}><X /></button>
      <h3>{labels.selectService}</h3>
      <div className="service-picker-list">{options.map((item) => {
        const active = serviceKey(item) === serviceKey(professional);
        const free = freeSlotsFor(cardDate, item.profileId, item.serviceName).length;
        return <button className={active ? "is-selected" : ""} type="button" key={serviceKey(item)} onClick={() => selectService(item)}>
          <span><strong>{item.serviceName}</strong><small>{item.durationMinutes} min · {defaultSlots.length - free}/{defaultSlots.length} {labels.slots.toLowerCase()}</small></span>
          <b>{item.priceCzk} {item.currency}</b>
        </button>;
      })}</div>
    </section>
  </div>, document.body) : null;

  const slotsPicker = slotsOpen ? createPortal(<div className="service-popup-backdrop" onPointerDown={() => setSlotsOpen(false)}>
    <section className="service-popup-panel service-slots-popover" role="dialog" aria-modal="true" aria-label={labels.slots} onPointerDown={(event) => event.stopPropagation()}>
      <button className="service-popup-close" type="button" aria-label={labels.close} onClick={() => setSlotsOpen(false)}><X /></button>
      <h3>{labels.slots}</h3><p>{professional.serviceName} · {formatCompactDate(cardDate, language)}</p>
      <div className="service-free-slots-list" role="list">{cardSlots.length ? cardSlots.map((slot) => <button type="button" key={slot} onClick={() => { setSlotsOpen(false); openBooking(cardDate, slot); }}>{slot}</button>) : <span>{labels.noSlots}</span>}</div>
    </section>
  </div>, document.body) : null;

  const compactCalendar = compactCalendarOpen ? createPortal(<div className="service-popup-backdrop" onPointerDown={() => setCompactCalendarOpen(false)}>
    <section className="service-popup-panel service-card-calendar-popover" role="dialog" aria-modal="true" aria-label={labels.chooseDate} onPointerDown={(event) => event.stopPropagation()}>
      <button className="service-popup-close" type="button" aria-label={labels.close} onClick={() => setCompactCalendarOpen(false)}><X /></button>
      <div className="service-card-calendar-toolbar">
        <button type="button" aria-label={labels.previousMonth} onClick={() => moveMonth(-1)} disabled={calendarMonth <= todayDate.slice(0, 7)}><ChevronLeft /></button>
        <strong>{new Intl.DateTimeFormat(locale[language], { month: "long", year: "numeric" }).format(parseDateKey(`${calendarMonth}-01`))}</strong>
        <button type="button" aria-label={labels.nextMonth} onClick={() => moveMonth(1)}><ChevronRight /></button>
      </div>
      <div className="service-card-calendar-weekdays">{weekdayLabels.map((label, index) => <span key={`compact-${label}-${index}`}>{label}</span>)}</div>
      <div className="service-card-calendar-grid">{days.map((date, index) => date ? <button
        className={date === cardDate ? "is-selected" : ""}
        type="button"
        key={`compact-${date}`}
        disabled={!isSelectableDate(date)}
        onClick={() => chooseCardDate(date)}
      >{parseDateKey(date).getDate()}</button> : <span key={`compact-empty-${index}`} />)}</div>
    </section>
  </div>, document.body) : null;

  return <>
    <article className="services-professional-card service-activity-card">
      <div className="services-professional-artwork" aria-hidden="true">{artwork ? <img src={artwork.sheet} alt="" decoding="async" /> : <span>{avatar}</span>}</div>
      <div className="services-professional-top-actions">
        <ServiceReminderAction professional={professional} date={cardDate} time={nextSlot} language={language} />
        <CardShareAction title={professional.displayName} date={`${formatCompactDate(cardDate, language)} · ${nextSlot}`} address={professional.publicLocation} url={url} label={labels.book} />
      </div>
      <div className="service-card-right-stack">
        <button className="service-free-slots-badge" type="button" aria-expanded={slotsOpen} onClick={() => setSlotsOpen((value) => !value)}><UsersRound /><strong>{occupiedCount}/{defaultSlots.length}</strong></button>
        <div className="service-duration-badge"><Clock3 /><strong>{professional.durationMinutes}</strong><span>min</span></div>
      </div>
      <button className="services-professional-main" type="button" onClick={() => setDetailsOpen(true)}><strong>{professional.displayName}</strong><span>{professional.serviceName}</span></button>
      <div className="services-professional-meta service-professional-meta-row">
        <div className="service-master-avatar" aria-label={professional.displayName}><span>{avatar}</span></div>
        <button className="service-meta-item service-meta-date-item" type="button" aria-expanded={compactCalendarOpen} onClick={() => { setCalendarMonth(cardDate.slice(0, 7)); setCompactCalendarOpen(true); }}><CalendarDays /><strong>{formatCompactDate(cardDate, language)}</strong></button>
        <div className="service-meta-item"><Ticket /><strong>{professional.priceCzk} {professional.currency}</strong></div>
        <button className="service-meta-item" type="button" onClick={openMap}><MapPin /><strong>{professional.publicLocation}</strong></button>
      </div>
      <div className="services-professional-actions"><button className="secondary" type="button" onClick={() => setServicesOpen(true)}><Scissors />{labels.services}</button><button className="primary" type="button" onClick={() => openBooking()}><CalendarPlus />{labels.book}</button></div>
    </article>
    {details}{booking}{servicePicker}{slotsPicker}{compactCalendar}
  </>;
}
