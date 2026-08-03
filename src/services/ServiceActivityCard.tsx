import { createPortal } from "react-dom";
import { useMemo, useState, type FormEvent } from "react";
import { Bell, BellRing, CalendarDays, CalendarPlus, Check, Clock3, Info, MapPin, Ticket, UserRound, UsersRound, X } from "lucide-react";
import type { Language } from "../types";
import { CardShareAction } from "../components/CardShareAction";
import type { ServicesProfessional } from "./servicesProfessionalDirectory";
import { getServiceArtwork } from "./serviceArtwork";
import "./service-activity-card.css";

type PilotAppointment = { id: string; date: string; time: string; status: string };
type PilotBlock = { id: string; date: string; time: string };
type PilotData = { appointments?: PilotAppointment[]; blocks?: PilotBlock[] };
type Booking = { id: string; profileId: string; date: string; time: string; status: "pending" };
type Reminder = { profileId: string; leadMinutes: number; channel: string; date: string; time: string };

const pilotKey = "go-irl-beauty-pilot-v1";
const bookingsKey = "go-irl-services-bookings-v2";
const remindersKey = "go-irl-services-reminders-v2";
const defaultSlots = ["09:00", "10:30", "12:00", "14:30", "16:00"];

const text = {
  ru: { details: "Подробнее", book: "Записаться", free: "свободно", duration: "Длительность", price: "Цена", address: "Адрес", date: "Дата", master: "Мастер", close: "Закрыть", booking: "Запись к мастеру", chooseDate: "Выберите дату", chooseTime: "Выберите время", send: "Отправить запрос", sent: "Запрос отправлен", reminder: "Напомнить", reminderTitle: "Напоминание о записи", save: "Сохранить напоминание", slots: "Свободные окна" },
  uk: { details: "Докладніше", book: "Записатися", free: "вільно", duration: "Тривалість", price: "Ціна", address: "Адреса", date: "Дата", master: "Майстер", close: "Закрити", booking: "Запис до майстра", chooseDate: "Оберіть дату", chooseTime: "Оберіть час", send: "Надіслати запит", sent: "Запит надіслано", reminder: "Нагадати", reminderTitle: "Нагадування про запис", save: "Зберегти нагадування", slots: "Вільні вікна" },
  cs: { details: "Podrobnosti", book: "Rezervovat", free: "volno", duration: "Délka", price: "Cena", address: "Adresa", date: "Datum", master: "Profesionál", close: "Zavřít", booking: "Rezervace", chooseDate: "Vyberte datum", chooseTime: "Vyberte čas", send: "Odeslat žádost", sent: "Žádost odeslána", reminder: "Připomenout", reminderTitle: "Připomínka rezervace", save: "Uložit připomínku", slots: "Volné termíny" },
  en: { details: "Details", book: "Book", free: "free", duration: "Duration", price: "Price", address: "Address", date: "Date", master: "Professional", close: "Close", booking: "Book a professional", chooseDate: "Choose a date", chooseTime: "Choose a time", send: "Send request", sent: "Request sent", reminder: "Remind me", reminderTitle: "Booking reminder", save: "Save reminder", slots: "Available slots" },
} satisfies Record<Language, Record<string, string>>;

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

const readJson = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || "null") as T || fallback; }
  catch { return fallback; }
};

const freeSlotsFor = (date: string) => {
  const pilot = readJson<PilotData>(pilotKey, {});
  const occupied = new Set([
    ...(pilot.appointments || []).filter((item) => item.date === date && ["pending", "confirmed"].includes(item.status)).map((item) => item.time),
    ...(pilot.blocks || []).filter((item) => item.date === date).map((item) => item.time),
  ]);
  return defaultSlots.filter((slot) => !occupied.has(slot));
};

function ServiceReminderAction({ professional, date, time, language }: { professional: ServicesProfessional; date: string; time: string; language: Language }) {
  const labels = text[language];
  const existing = readJson<Reminder[]>(remindersKey, []).find((item) => item.profileId === professional.profileId);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(Boolean(existing));
  const [leadMinutes, setLeadMinutes] = useState(existing?.leadMinutes || 60);
  const [channel, setChannel] = useState(existing?.channel || "telegram");
  const save = () => {
    const current = readJson<Reminder[]>(remindersKey, []).filter((item) => item.profileId !== professional.profileId);
    localStorage.setItem(remindersKey, JSON.stringify([...current, { profileId: professional.profileId, leadMinutes, channel, date, time }]));
    setSaved(true);
    setOpen(false);
  };
  return <span className="service-reminder-action">
    <button className={saved ? "sport-card-icon-action is-reminder-active" : "sport-card-icon-action"} type="button" aria-label={labels.reminder} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setOpen((value) => !value); }}>{saved ? <BellRing /> : <Bell />}</button>
    {open && <span className="service-reminder-popover" role="dialog" aria-label={labels.reminderTitle}>
      <strong>{labels.reminderTitle}</strong>
      <div>{[15, 60, 180, 1440].map((value) => <button className={leadMinutes === value ? "is-selected" : ""} type="button" key={value} onClick={() => setLeadMinutes(value)}>{value === 1440 ? "1 day" : `${value} min`}{leadMinutes === value && <Check />}</button>)}</div>
      <div>{["telegram", "whatsapp", "instagram", "messenger"].map((value) => <button className={channel === value ? "is-selected" : ""} type="button" key={value} onClick={() => setChannel(value)}>{value}</button>)}</div>
      <button className="service-reminder-save" type="button" onClick={save}>{labels.save}</button>
    </span>}
  </span>;
}

export function ServiceActivityCard({ professional, language }: { professional: ServicesProfessional; language: Language }) {
  const labels = text[language];
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);
  const [date, setDate] = useState(today);
  const freeSlots = useMemo(() => freeSlotsFor(date), [date, bookingOpen]);
  const [time, setTime] = useState(() => freeSlotsFor(today())[0] || "09:00");
  const artwork = getServiceArtwork(professional.serviceName);
  const url = new URL(professional.publicLink, window.location.origin).toString();
  const avatar = professional.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const nextSlot = freeSlots[0] || time;
  const submitBooking = (event: FormEvent) => {
    event.preventDefault();
    const bookings = readJson<Booking[]>(bookingsKey, []);
    localStorage.setItem(bookingsKey, JSON.stringify([...bookings, { id: uid(), profileId: professional.profileId, date, time, status: "pending" }]));
    setBookingSent(true);
  };
  const openMap = () => window.open(`https://mapy.cz/zakladni?q=${encodeURIComponent(professional.publicLocation)}`, "_blank", "noopener,noreferrer");
  const details = detailsOpen ? createPortal(<div className="service-sheet-backdrop" onMouseDown={() => setDetailsOpen(false)}>
    <article className="service-activity-sheet" onMouseDown={(event) => event.stopPropagation()}>
      <button className="service-sheet-close" type="button" aria-label={labels.close} onClick={() => setDetailsOpen(false)}><X /></button>
      <div className="service-sheet-hero">{artwork ? <img src={artwork.sheet} alt="" /> : <span>{avatar}</span>}<div><small>{professional.serviceName}</small><h2>{professional.displayName}</h2></div></div>
      <div className="service-sheet-grid">
        <div><UserRound /><span><small>{labels.master}</small><strong>{professional.displayName}</strong></span></div>
        <div><CalendarDays /><span><small>{labels.date}</small><strong>{date}</strong></span></div>
        <div><Ticket /><span><small>{labels.price}</small><strong>{professional.priceCzk} {professional.currency}</strong></span></div>
        <button type="button" onClick={openMap}><MapPin /><span><small>{labels.address}</small><strong>{professional.publicLocation}</strong></span></button>
        <div><Clock3 /><span><small>{labels.duration}</small><strong>{professional.durationMinutes} min</strong></span></div>
        <div><UsersRound /><span><small>{labels.slots}</small><strong>{freeSlots.length}</strong></span></div>
      </div>
      {artwork && <img className="service-sheet-portfolio" src={artwork.portfolio} alt="" />}
      <button className="service-sheet-book" type="button" onClick={() => { setDetailsOpen(false); setBookingOpen(true); }}>{labels.book}</button>
    </article>
  </div>, document.body) : null;
  const booking = bookingOpen ? createPortal(<div className="service-sheet-backdrop" onMouseDown={() => setBookingOpen(false)}>
    <form className="service-booking-sheet" onSubmit={submitBooking} onMouseDown={(event) => event.stopPropagation()}>
      <button className="service-sheet-close" type="button" aria-label={labels.close} onClick={() => setBookingOpen(false)}><X /></button>
      <h2>{labels.booking}</h2><p>{professional.displayName} · {professional.serviceName}</p>
      <label>{labels.chooseDate}<input type="date" min={today()} value={date} onChange={(event) => { const next = event.target.value; setDate(next); setTime(freeSlotsFor(next)[0] || ""); setBookingSent(false); }} /></label>
      <div className="service-booking-slots">{freeSlots.map((slot) => <button className={time === slot ? "is-selected" : ""} type="button" key={slot} onClick={() => { setTime(slot); setBookingSent(false); }}>{slot}</button>)}</div>
      {bookingSent ? <div className="service-booking-success"><Check />{labels.sent}</div> : <button className="service-sheet-book" type="submit" disabled={!time}><CalendarPlus />{labels.send}</button>}
    </form>
  </div>, document.body) : null;
  return <>
    <article className="services-professional-card service-activity-card">
      <div className="services-professional-artwork" aria-hidden="true">{artwork ? <img src={artwork.sheet} alt="" decoding="async" /> : <span>{avatar}</span>}</div>
      <div className="services-professional-top-actions">
        <ServiceReminderAction professional={professional} date={date} time={nextSlot} language={language} />
        <CardShareAction title={professional.displayName} date={`${date} · ${nextSlot}`} address={professional.publicLocation} url={url} label={labels.book} />
      </div>
      <div className="service-free-slots-badge"><UsersRound /><strong>{freeSlots.length}</strong><span>{labels.free}</span></div>
      <button className="services-professional-main" type="button" onClick={() => setDetailsOpen(true)}><strong>{professional.displayName}</strong><span>{professional.serviceName}</span></button>
      <div className="services-professional-summary"><span><Clock3 />{professional.durationMinutes} min</span><span><Ticket /><b>{professional.priceCzk}</b> {professional.currency}</span></div>
      <div className="services-professional-meta">
        <div className="service-master-avatar"><span>{avatar}</span></div>
        <div><CalendarDays /><span><small>{labels.date}</small><strong>{date}</strong></span></div>
        <div><Ticket /><span><small>{labels.price}</small><strong>{professional.priceCzk} {professional.currency}</strong></span></div>
        <button type="button" onClick={openMap}><MapPin /><span><small>{labels.address}</small><strong>{professional.publicLocation}</strong></span></button>
      </div>
      <div className="services-professional-actions"><button className="secondary" type="button" onClick={() => setDetailsOpen(true)}><Info />{labels.details}</button><button className="primary" type="button" onClick={() => setBookingOpen(true)}><CalendarPlus />{labels.book}</button></div>
    </article>
    {details}{booking}
  </>;
}
