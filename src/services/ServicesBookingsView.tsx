import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, RefreshCw, Ticket } from "lucide-react";
import type { Language } from "../types";
import {
  loadClientServiceBookings,
  type ClientServiceBooking,
  type ClientServiceBookingSnapshot,
  type ClientServiceBookingStatus,
} from "./servicesBookingClientRepository";
import { subscribeServiceBookings } from "./servicesBookingRepository";
import "./services-bookings.css";

const copy = {
  ru: {
    title: "Мои записи",
    hint: "Запросы и подтверждённые записи к мастерам",
    loading: "Загружаем записи…",
    error: "Не удалось загрузить записи",
    retry: "Повторить",
    empty: "У вас пока нет записей",
    fallback: "Сервер записей ещё не подключён. Показаны записи с этого устройства.",
    address: "Место",
    duration: "Длительность",
  },
  uk: {
    title: "Мої записи",
    hint: "Запити та підтверджені записи до майстрів",
    loading: "Завантажуємо записи…",
    error: "Не вдалося завантажити записи",
    retry: "Повторити",
    empty: "У вас поки немає записів",
    fallback: "Сервер записів ще не підключений. Показано записи з цього пристрою.",
    address: "Місце",
    duration: "Тривалість",
  },
  cs: {
    title: "Moje rezervace",
    hint: "Žádosti a potvrzené rezervace u profesionálů",
    loading: "Načítáme rezervace…",
    error: "Rezervace se nepodařilo načíst",
    retry: "Opakovat",
    empty: "Zatím nemáte žádné rezervace",
    fallback: "Server rezervací ještě není připojen. Zobrazují se záznamy z tohoto zařízení.",
    address: "Místo",
    duration: "Délka",
  },
  en: {
    title: "My bookings",
    hint: "Requests and confirmed professional appointments",
    loading: "Loading bookings…",
    error: "Bookings could not be loaded",
    retry: "Retry",
    empty: "You have no bookings yet",
    fallback: "The booking server is not connected yet. Showing records from this device.",
    address: "Location",
    duration: "Duration",
  },
} satisfies Record<Language, Record<string, string>>;

const statusCopy: Record<Language, Record<ClientServiceBookingStatus, string>> = {
  ru: {
    pending: "Ожидает подтверждения",
    confirmed: "Подтверждена",
    declined: "Отклонена",
    cancelled: "Отменена",
    completed: "Завершена",
    no_show: "Неявка",
    expired: "Истекла",
  },
  uk: {
    pending: "Очікує підтвердження",
    confirmed: "Підтверджено",
    declined: "Відхилено",
    cancelled: "Скасовано",
    completed: "Завершено",
    no_show: "Неявка",
    expired: "Термін минув",
  },
  cs: {
    pending: "Čeká na potvrzení",
    confirmed: "Potvrzeno",
    declined: "Odmítnuto",
    cancelled: "Zrušeno",
    completed: "Dokončeno",
    no_show: "Nedostavil se",
    expired: "Vypršelo",
  },
  en: {
    pending: "Awaiting confirmation",
    confirmed: "Confirmed",
    declined: "Declined",
    cancelled: "Cancelled",
    completed: "Completed",
    no_show: "No-show",
    expired: "Expired",
  },
};

const locale: Record<Language, string> = {
  ru: "ru-RU",
  uk: "uk-UA",
  cs: "cs-CZ",
  en: "en-GB",
};

const emptySnapshot: ClientServiceBookingSnapshot = { bookings: [], source: "browser-local" };

const formatDate = (booking: ClientServiceBooking, language: Language) => {
  const date = new Date(`${booking.date}T12:00:00`);
  if (Number.isNaN(date.getTime())) return booking.date;
  return new Intl.DateTimeFormat(locale[language], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

function BookingCard({ booking, language }: { booking: ClientServiceBooking; language: Language }) {
  const text = copy[language];
  const location = booking.exactAddress || booking.publicLocation;
  return (
    <article className={`services-booking-card status-${booking.status}`}>
      <header>
        <span><strong>{booking.professionalName}</strong><small>{booking.serviceName}</small></span>
        <b>{statusCopy[language][booking.status]}</b>
      </header>
      <div className="services-booking-meta">
        <div><CalendarDays /><span><small>{formatDate(booking, language)}</small><strong>{booking.time}</strong></span></div>
        <div><Clock3 /><span><small>{text.duration}</small><strong>{booking.durationMinutes} min</strong></span></div>
        <div><Ticket /><span><small>{booking.priceCzk} {booking.currency}</small><strong>{booking.serviceName}</strong></span></div>
        <div><MapPin /><span><small>{text.address}</small><strong>{location}</strong></span></div>
      </div>
    </article>
  );
}

export function ServicesBookingsView({ language }: { language: Language }) {
  const text = copy[language];
  const [snapshot, setSnapshot] = useState<ClientServiceBookingSnapshot>(emptySnapshot);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const refresh = useCallback(async () => {
    setState((current) => current === "ready" ? "ready" : "loading");
    try {
      const next = await loadClientServiceBookings(language);
      setSnapshot(next);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [language]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const next = await loadClientServiceBookings(language);
        if (!active) return;
        setSnapshot(next);
        setState("ready");
      } catch {
        if (active) setState("error");
      }
    };
    void run();
    const unsubscribe = subscribeServiceBookings(() => { void run(); });
    const onFocus = () => { void run(); };
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [language]);

  return (
    <section className="page-section services-client-view services-bookings-view">
      <div className="page-title"><CalendarDays /><div><h1>{text.title}</h1><p>{text.hint}</p></div></div>
      {snapshot.source === "local-fallback" && <div className="services-bookings-fallback">{text.fallback}</div>}
      {state === "loading" && <div className="services-bookings-state">{text.loading}</div>}
      {state === "error" && <div className="services-bookings-state is-error"><span>{text.error}</span><button type="button" onClick={() => void refresh()}><RefreshCw />{text.retry}</button></div>}
      {state === "ready" && (snapshot.bookings.length
        ? <div className="services-bookings-list">{snapshot.bookings.map((booking) => <BookingCard key={booking.id} booking={booking} language={language} />)}</div>
        : <div className="services-bookings-state">{text.empty}</div>)}
    </section>
  );
}
