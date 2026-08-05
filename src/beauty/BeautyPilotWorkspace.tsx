import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Ban, BellDot, CalendarDays, Check, Clock3, CreditCard, House, MessageCircle, Plus, Scissors, UserRound, X, type LucideIcon } from "lucide-react";
import {
  listServiceBookings,
  subscribeServiceBookings,
  updateServiceBookingStatus,
  type ServiceBooking,
  type ServiceBookingStatus,
} from "../services/servicesBookingRepository";
import type { BeautyWorkspace } from "./beautySetupModel";

type Status = ServiceBookingStatus;
type Appointment = { id: string; clientName: string; phone: string; date: string; time: string; requestedTime?: string; contactBeforeConfirmation?: boolean; status: Status; source: "client" | "professional"; bookingId?: string };
type TimeBlock = { id: string; date: string; time: string; label: string };
type PilotData = { appointments: Appointment[]; blocks: TimeBlock[] };
type View = "overview" | "requests" | "appointments" | "page" | "business-card";

const pilotKey = "go-irl-beauty-pilot-v1";
export const resetBeautyPilotWorkspace = () => localStorage.removeItem(pilotKey);
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const appointmentKey = (item: Appointment) => `${item.date}T${item.time}`;
const sortAppointments = (items: Appointment[]) => [...items].sort((left, right) => appointmentKey(left).localeCompare(appointmentKey(right)));
const initialData = (): PilotData => ({
  appointments: [
    { id: uid(), clientName: "Petra K.", phone: "+420 777 222 333", date: today(), time: "10:30", status: "pending", source: "client" },
    { id: uid(), clientName: "Eva M.", phone: "+420 777 444 555", date: today(), time: "14:30", status: "confirmed", source: "professional" },
  ],
  blocks: [{ id: uid(), date: today(), time: "12:00", label: "Обед" }],
});
const load = (): PilotData => {
  try {
    const value = JSON.parse(localStorage.getItem(pilotKey) || "null") as PilotData | null;
    return value?.appointments && value?.blocks ? value : initialData();
  } catch { return initialData(); }
};
const labels: Record<Status, string> = {
  pending: "Ожидает", confirmed: "Подтверждена", declined: "Отклонена",
  cancelled: "Отменена", completed: "Завершена", no_show: "Не пришла",
};
function NavButton({ active, icon: Icon, label, badge = 0, onClick }: { active: boolean; icon: LucideIcon; label: string; badge?: number; onClick: () => void }) {
  return <button className={active ? "is-active" : ""} type="button" aria-current={active ? "page" : undefined} onClick={onClick}><Icon size={19} /><span>{label}</span>{badge > 0 && <b>{badge > 99 ? "99+" : badge}</b>}</button>;
}

const bookingAppointment = (booking: ServiceBooking): Appointment => ({
  id: `service-booking:${booking.id}`,
  bookingId: booking.id,
  clientName: booking.clientName,
  phone: booking.clientContact,
  contactBeforeConfirmation: booking.contactBeforeConfirmation,
  date: booking.date,
  time: booking.time,
  status: booking.status,
  source: "client",
});

type BeautyPilotWorkspaceProps = {
  setup: BeautyWorkspace;
  onEdit: () => void;
  pageEditor?: ReactNode;
  businessCardEditor?: ReactNode;
};

export function BeautyPilotWorkspace({ setup, onEdit, pageEditor, businessCardEditor }: BeautyPilotWorkspaceProps) {
  const [data, setData] = useState<PilotData>(load);
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>(listServiceBookings);
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState("");
  const [dialog, setDialog] = useState<"appointment" | "block" | "booking" | "reschedule" | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", date: today(), time: "09:00", label: "" });
  const persist = (next: PilotData) => { setData(next); localStorage.setItem(pilotKey, JSON.stringify(next)); };
  const refreshServiceBookings = () => setServiceBookings(listServiceBookings());

  useEffect(() => subscribeServiceBookings(refreshServiceBookings), []);

  const relevantServiceBookings = useMemo(() => serviceBookings.filter((booking) =>
    booking.professionalName === setup.profile.displayName
    || booking.serviceName === setup.service.name
  ), [serviceBookings, setup.profile.displayName, setup.service.name]);
  const allAppointments = useMemo(() => sortAppointments([
    ...data.appointments,
    ...relevantServiceBookings.map(bookingAppointment),
  ]), [data.appointments, relevantServiceBookings]);
  const pendingAppointments = useMemo(() => allAppointments.filter((item) => item.status === "pending"), [allAppointments]);
  const upcomingAppointments = useMemo(() => allAppointments.filter((item) => item.status === "confirmed" && item.date >= today()), [allAppointments]);
  const todayAppointments = useMemo(() => allAppointments.filter((item) => item.date === today() && ["pending", "confirmed"].includes(item.status)), [allAppointments]);
  const upcomingBlocks = useMemo(() => data.blocks.filter((item) => item.date >= today()).sort((left, right) => `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`)), [data.blocks]);
  const todayBlocks = upcomingBlocks.filter((item) => item.date === today());
  const current = allAppointments.find((item) => item.id === selected);
  const occupied = new Set([...allAppointments.filter((item) => ["pending", "confirmed"].includes(item.status)).map((item) => `${item.date}:${item.time}`), ...data.blocks.map((item) => `${item.date}:${item.time}`)]);
  const slots = ["09:00", "10:30", "12:00", "14:30", "16:00"];
  const nextAppointment = upcomingAppointments[0];
  const activeServiceCount = setup.services.filter((service) => service.active).length || 1;

  const updateStatus = (status: Status) => {
    if (current?.bookingId) {
      updateServiceBookingStatus(current.bookingId, status);
      refreshServiceBookings();
    } else {
      persist({ ...data, appointments: data.appointments.map((item) => item.id === selected ? { ...item, status, requestedTime: undefined } : item) });
    }
    setSelected("");
  };
  const approveReschedule = () => {
    if (!current?.requestedTime || current.bookingId) return;
    persist({ ...data, appointments: data.appointments.map((item) => item.id === current.id ? { ...item, time: item.requestedTime!, requestedTime: undefined, status: "confirmed" } : item) });
    setSelected("");
  };
  const submit = () => {
    if (dialog === "block") {
      if (!form.label.trim() || occupied.has(`${form.date}:${form.time}`)) return;
      persist({ ...data, blocks: [...data.blocks, { id: uid(), date: form.date, time: form.time, label: form.label.trim() }] });
    } else {
      if (!form.name.trim() || !form.phone.trim() || occupied.has(`${form.date}:${form.time}`)) return;
      persist({ ...data, appointments: [...data.appointments, { id: uid(), clientName: form.name.trim(), phone: form.phone.trim(), date: form.date, time: form.time, status: dialog === "appointment" ? "confirmed" : "pending", source: dialog === "appointment" ? "professional" : "client" }] });
    }
    setDialog(null);
    setForm({ name: "", phone: "", date: today(), time: "09:00", label: "" });
  };
  const requestReschedule = () => {
    if (!current || current.bookingId || occupied.has(`${current.date}:${form.time}`)) return;
    persist({ ...data, appointments: data.appointments.map((item) => item.id === current.id ? { ...item, requestedTime: form.time } : item) });
    setDialog(null);
  };
  const calendarDownload = (item: Appointment) => {
    const date = item.date.replaceAll("-", "");
    const start = item.time.replace(":", "") + "00";
    const file = new Blob([`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${date}T${start}\nSUMMARY:${setup.service.name}\nLOCATION:${setup.profile.exactAddress}\nEND:VEVENT\nEND:VCALENDAR`], { type: "text/calendar" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(file); link.download = "go-irl-beauty.ics"; link.click(); URL.revokeObjectURL(link.href);
  };

  const appointmentList = (items: Appointment[], emptyText: string) => <div className="beauty-pilot-list">
    {items.map((item) => <button className="beauty-appointment-card" type="button" key={item.id} onClick={() => setSelected(item.id)}>
      <span><b>{item.time}</b><small>{item.date}</small></span>
      <span><strong>{item.clientName}</strong><small>{setup.service.name}{item.contactBeforeConfirmation ? " · сначала связаться" : ""}</small></span>
      <i className={`status-${item.status}`}>{labels[item.status]}</i>
    </button>)}
    {!items.length && <div className="beauty-workspace-empty">{emptyText}</div>}
  </div>;

  const timeBlocks = (items: TimeBlock[]) => items.map((item) => <div className="beauty-time-block" key={item.id}><Ban size={17} /><span><b>{item.date} · {item.time}</b> · {item.label}</span><button type="button" aria-label="Удалить блок" onClick={() => persist({ ...data, blocks: data.blocks.filter((block) => block.id !== item.id) })}><X size={16} /></button></div>);

  const overview = <section className="beauty-workspace-view">
    <div className="beauty-workspace-section-head"><div><span className="beauty-preview-badge">РАБОЧИЙ ДЕНЬ</span><h2>Обзор</h2><p>Новые запросы, подтверждённые записи и ближайшее свободное действие.</p></div><button className="beauty-primary" type="button" onClick={() => setDialog("appointment")}><Plus size={18} />Добавить запись</button></div>
    <div className="beauty-workspace-summary">
      <button type="button" onClick={() => setView("requests")}><BellDot /><span>Новые запросы</span><strong>{pendingAppointments.length}</strong></button>
      <button type="button" onClick={() => setView("appointments")}><CalendarDays /><span>Будущие записи</span><strong>{upcomingAppointments.length}</strong></button>
      <div><Clock3 /><span>Сегодня</span><strong>{todayAppointments.length}</strong></div>
      <div><UserRound /><span>Следующая запись</span><strong>{nextAppointment ? `${nextAppointment.date} · ${nextAppointment.time}` : "—"}</strong></div>
    </div>
    <div className="beauty-workspace-subsection"><div className="beauty-workspace-subsection-head"><div><h3>Сегодня</h3><p>Запросы и подтверждённые записи на текущий день.</p></div><button className="beauty-secondary" type="button" onClick={() => setDialog("block")}>Заблокировать время</button></div>{appointmentList(todayAppointments, "На сегодня записей нет.")}{timeBlocks(todayBlocks)}</div>
  </section>;

  const requests = <section className="beauty-workspace-view">
    <div className="beauty-workspace-section-head"><div><span className="beauty-preview-badge">ТРЕБУЕТ РЕШЕНИЯ</span><h2>Запросы</h2><p>Новые заявки клиентов. Откройте заявку, свяжитесь с клиентом при необходимости и подтвердите или отклоните её.</p></div><strong className="beauty-workspace-count">{pendingAppointments.length}</strong></div>
    {appointmentList(pendingAppointments, "Новых запросов нет.")}
  </section>;

  const appointments = <section className="beauty-workspace-view">
    <div className="beauty-workspace-section-head"><div><span className="beauty-preview-badge">КАЛЕНДАРЬ</span><h2>Записи</h2><p>Подтверждённые будущие записи и заблокированное время.</p></div><div className="beauty-workspace-head-actions"><button className="beauty-secondary" type="button" onClick={() => setDialog("block")}>Блок</button><button className="beauty-primary" type="button" onClick={() => setDialog("appointment")}><Plus size={18} />Запись</button></div></div>
    {appointmentList(upcomingAppointments, "Подтверждённых записей пока нет.")}
    {upcomingBlocks.length > 0 && <div className="beauty-workspace-subsection"><div className="beauty-workspace-subsection-head"><div><h3>Заблокированное время</h3><p>Перерывы и личные дела, недоступные клиентам.</p></div></div><div className="beauty-pilot-list">{timeBlocks(upcomingBlocks)}</div></div>}
  </section>;

  const page = <section className="beauty-workspace-view beauty-workspace-page-view">
    <div className="beauty-workspace-section-head"><div><span className="beauty-preview-badge">{setup.published ? "ОПУБЛИКОВАНА" : "ЧЕРНОВИК"}</span><h2>Страница мастера</h2><p>Предпросмотр, услуги, контент и данные, которые видит клиент.</p></div><button className="beauty-secondary" type="button" onClick={onEdit}><Scissors size={18} />Основные данные</button></div>
    <div className="beauty-workspace-page-card"><div><UserRound /><span><strong>{setup.profile.displayName}</strong><small>{setup.profile.publicLocation}</small></span></div><div><strong>{activeServiceCount}</strong><small>активных услуг</small></div></div>
    <div className="beauty-workspace-page-actions"><button className="beauty-secondary" type="button" onClick={() => window.open(new URL(setup.publicLink, window.location.origin).toString(), "_blank", "noopener,noreferrer")}>Открыть страницу клиента</button><button className="beauty-primary" type="button" onClick={onEdit}>Профиль, прайс и расписание</button></div>
    {pageEditor && <div className="beauty-workspace-page-editor">{pageEditor}</div>}
  </section>;

  const businessCard = <section className="beauty-workspace-view beauty-workspace-business-card-view">
    <div className="beauty-workspace-section-head"><div><span className="beauty-preview-badge">ВИЗИТКА</span><h2>Визитка мастера</h2><p>Предпросмотр, фон, логотип, услуги и статус карточки для шаринга.</p></div></div>
    {businessCardEditor ? <div className="beauty-workspace-business-card-editor">{businessCardEditor}</div> : <div className="beauty-workspace-empty">Редактор визитки недоступен.</div>}
  </section>;

  const currentView = view === "overview"
    ? overview
    : view === "requests"
      ? requests
      : view === "appointments"
        ? appointments
        : view === "page"
          ? page
          : businessCard;

  return <div className="beauty-pilot">
    {currentView}
    <nav className="beauty-pilot-nav" aria-label="Разделы кабинета мастера">
      <NavButton active={view === "overview"} icon={House} label="Обзор" onClick={() => setView("overview")} />
      <NavButton active={view === "requests"} icon={BellDot} label="Запросы" badge={pendingAppointments.length} onClick={() => setView("requests")} />
      <NavButton active={view === "appointments"} icon={CalendarDays} label="Записи" onClick={() => setView("appointments")} />
      <NavButton active={view === "page"} icon={UserRound} label="Страница" onClick={() => setView("page")} />
      <NavButton active={view === "business-card"} icon={CreditCard} label="Визитка" onClick={() => setView("business-card")} />
    </nav>
    {current && <div className="beauty-dialog-backdrop" role="presentation" onPointerDown={() => setSelected("")}><section className="beauty-dialog" role="dialog" aria-modal="true" onPointerDown={(event) => event.stopPropagation()}>
      <button className="beauty-dialog-close" type="button" onClick={() => setSelected("")}><X /></button><span className={`beauty-preview-badge status-${current.status}`}>{labels[current.status]}</span>
      <h2>{current.clientName}</h2><p>{current.date} · {current.time}</p><p><MessageCircle size={16} /> {current.phone}</p>
      {current.contactBeforeConfirmation && <div className="beauty-note"><strong>Связаться с клиентом до подтверждения записи.</strong></div>}
      {current.requestedTime && <div className="beauty-note"><strong>Запрошен перенос на {current.requestedTime}</strong><button className="beauty-primary" type="button" onClick={approveReschedule}>Подтвердить перенос</button></div>}
      <div className="beauty-dialog-actions">
        {current.status === "pending" && <><button className="beauty-primary" type="button" onClick={() => updateStatus("confirmed")}><Check size={17} />Подтвердить</button><button className="beauty-secondary" type="button" onClick={() => updateStatus("declined")}>Отклонить</button></>}
        {current.status === "confirmed" && <><button className="beauty-secondary" type="button" disabled={Boolean(current.bookingId)} onClick={() => { setDialog("reschedule"); setForm({ ...form, time: current.time, date: current.date }); }}>Перенести</button><button className="beauty-secondary" type="button" onClick={() => calendarDownload(current)}>В календарь</button><button className="beauty-primary" type="button" onClick={() => updateStatus("completed")}>Завершить</button><button className="beauty-secondary" type="button" onClick={() => updateStatus("no_show")}>No-show</button><button className="beauty-danger" type="button" onClick={() => updateStatus("cancelled")}>Отменить</button></>}
      </div>
    </section></div>}
    {dialog && <div className="beauty-dialog-backdrop" onPointerDown={() => setDialog(null)}><section className="beauty-dialog" role="dialog" aria-modal="true" onPointerDown={(event) => event.stopPropagation()}>
      <button className="beauty-dialog-close" type="button" onClick={() => setDialog(null)}><X /></button><h2>{dialog === "booking" ? "Запрос записи" : dialog === "appointment" ? "Ручная запись" : dialog === "block" ? "Блок времени" : "Перенос"}</h2>
      {dialog !== "reschedule" && dialog !== "block" && <><label>Имя<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Телефон<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label></>}
      {dialog === "block" && <label>Причина (только для мастера)<input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></label>}
      {dialog !== "reschedule" && <label>Дата<input type="date" min={today()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>}
      <div className="beauty-slots">{slots.map((slot) => <button type="button" disabled={occupied.has(`${dialog === "reschedule" ? current?.date : form.date}:${slot}`) && slot !== current?.time} className={form.time === slot ? "is-selected" : ""} key={slot} onClick={() => setForm({ ...form, time: slot })}>{slot}</button>)}</div>
      {occupied.has(`${form.date}:${form.time}`) && dialog !== "reschedule" && <div className="beauty-errors">Этот слот уже занят. Выберите другой.</div>}
      <div className="beauty-note"><span>{dialog === "booking" ? "Запрос останется pending, пока мастер его не подтвердит." : "Все изменения хранятся только на этом устройстве."}</span></div>
      <button className="beauty-primary" type="button" onClick={dialog === "reschedule" ? requestReschedule : submit}>{dialog === "booking" ? "Отправить запрос" : "Сохранить"}</button>
    </section></div>}
  </div>;
}
