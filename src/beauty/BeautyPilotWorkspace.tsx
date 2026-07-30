import { useMemo, useState } from "react";
import { Ban, CalendarDays, Check, Clock3, MessageCircle, Plus, Scissors, UserRound, X, type LucideIcon } from "lucide-react";
import type { BeautyWorkspace } from "./beautySetupModel";

type Status = "pending" | "confirmed" | "declined" | "cancelled" | "completed" | "no_show";
type Appointment = { id: string; clientName: string; phone: string; date: string; time: string; requestedTime?: string; status: Status; source: "client" | "professional" };
type TimeBlock = { id: string; date: string; time: string; label: string };
type PilotData = { appointments: Appointment[]; blocks: TimeBlock[] };
type View = "today" | "week" | "client" | "services";

const pilotKey = "go-irl-beauty-pilot-v1";
export const resetBeautyPilotWorkspace = () => localStorage.removeItem(pilotKey);
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
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
function NavButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void }) {
  return <button className={active ? "is-active" : ""} type="button" onClick={onClick}><Icon size={18} />{label}</button>;
}

export function BeautyPilotWorkspace({ setup, onEdit }: { setup: BeautyWorkspace; onEdit: () => void }) {
  const [data, setData] = useState<PilotData>(load);
  const [view, setView] = useState<View>("today");
  const [selected, setSelected] = useState("");
  const [dialog, setDialog] = useState<"appointment" | "block" | "booking" | "reschedule" | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", date: today(), time: "09:00", label: "" });
  const persist = (next: PilotData) => { setData(next); localStorage.setItem(pilotKey, JSON.stringify(next)); };
  const appointments = useMemo(() => data.appointments.filter((item) => view !== "today" || item.date === today()), [data, view]);
  const current = data.appointments.find((item) => item.id === selected);
  const occupied = new Set([...data.appointments.filter((item) => ["pending", "confirmed"].includes(item.status)).map((item) => `${item.date}:${item.time}`), ...data.blocks.map((item) => `${item.date}:${item.time}`)]);
  const slots = ["09:00", "10:30", "12:00", "14:30", "16:00"];
  const updateStatus = (status: Status) => {
    persist({ ...data, appointments: data.appointments.map((item) => item.id === selected ? { ...item, status, requestedTime: undefined } : item) });
    setSelected("");
  };
  const approveReschedule = () => {
    if (!current?.requestedTime) return;
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
    if (!current || occupied.has(`${current.date}:${form.time}`)) return;
    persist({ ...data, appointments: data.appointments.map((item) => item.id === current.id ? { ...item, requestedTime: form.time } : item) });
    setDialog(null);
  };
  const calendarDownload = (item: Appointment) => {
    const date = item.date.replaceAll("-", "");
    const start = item.time.replace(":", "") + "00";
    const file = new Blob([`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${date}T${start}\nSUMMARY:${setup.service.name}\nLOCATION:${setup.profile.exactAddress}\nEND:VEVENT\nEND:VCALENDAR`], { type: "text/calendar" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(file); link.download = "go-irl-beauty.ics"; link.click(); URL.revokeObjectURL(link.href);
  };

  return <div className="beauty-pilot">
    <nav className="beauty-pilot-nav">
      <NavButton active={view === "today"} icon={Clock3} label="Сегодня" onClick={() => setView("today")} />
      <NavButton active={view === "week"} icon={CalendarDays} label="Неделя" onClick={() => setView("week")} />
      <NavButton active={view === "client"} icon={UserRound} label="Клиент" onClick={() => setView("client")} />
      <NavButton active={view === "services"} icon={Scissors} label="Услуга" onClick={() => setView("services")} />
    </nav>
    {view === "client" ? <section className="beauty-pilot-public">
      <span className="beauty-preview-badge">PUBLIC MOCK · БЕЗ РЕГИСТРАЦИИ</span><h2>{setup.profile.displayName}</h2><p>{setup.profile.publicLocation}</p>
      <div className="beauty-preview-card"><strong>{setup.service.name}</strong><span>{setup.service.durationMinutes} мин</span><b>{setup.service.priceCzk} Kč</b></div>
      <p className="beauty-muted">Точный адрес появится только после подтверждения мастером.</p>
      <button className="beauty-primary" type="button" onClick={() => setDialog("booking")}>Запросить запись</button>
    </section> : view === "services" ? <section className="beauty-pilot-public">
      <h2>Услуга и доступность</h2>
      <div className="beauty-preview-card"><strong>{setup.service.name}</strong><span>{setup.service.durationMinutes} мин + {setup.service.bufferMinutes} мин буфер</span><b>{setup.service.priceCzk} Kč</b></div>
      <div className="beauty-preview-card"><strong>Рабочие часы</strong><span>{setup.availability.weekdays.join(", ")}</span><span>{setup.availability.startTime}–{setup.availability.endTime}</span></div>
      <button className="beauty-secondary" type="button" onClick={onEdit}>Изменить настройки</button>
    </section> : <section>
      <div className="beauty-pilot-heading"><div><span className="beauty-preview-badge">PROFESSIONAL · LOCAL MOCK</span><h2>{view === "today" ? "Сегодня" : "Неделя"}</h2></div><div><button className="beauty-secondary" type="button" onClick={() => setDialog("block")}>Блок</button><button className="beauty-primary" type="button" onClick={() => setDialog("appointment")}><Plus size={18} />Запись</button></div></div>
      <div className="beauty-pilot-list">
        {appointments.map((item) => <button className="beauty-appointment-card" type="button" key={item.id} onClick={() => setSelected(item.id)}><span><b>{item.time}</b><small>{item.date}</small></span><span><strong>{item.clientName}</strong><small>{setup.service.name}</small></span><i className={`status-${item.status}`}>{labels[item.status]}</i></button>)}
        {data.blocks.filter((item) => view !== "today" || item.date === today()).map((item) => <div className="beauty-time-block" key={item.id}><Ban size={17} /><span><b>{item.time}</b> · {item.label}</span><button type="button" onClick={() => persist({ ...data, blocks: data.blocks.filter((block) => block.id !== item.id) })}><X size={16} /></button></div>)}
        {!appointments.length && <div className="beauty-note">Пока нет записей.</div>}
      </div>
    </section>}
    {current && <div className="beauty-dialog-backdrop" role="presentation" onMouseDown={() => setSelected("")}><section className="beauty-dialog" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
      <button className="beauty-dialog-close" type="button" onClick={() => setSelected("")}><X /></button><span className={`beauty-preview-badge status-${current.status}`}>{labels[current.status]}</span>
      <h2>{current.clientName}</h2><p>{current.date} · {current.time}</p><p><MessageCircle size={16} /> {current.phone}</p>
      {current.requestedTime && <div className="beauty-note"><strong>Запрошен перенос на {current.requestedTime}</strong><button className="beauty-primary" type="button" onClick={approveReschedule}>Подтвердить перенос</button></div>}
      <div className="beauty-dialog-actions">
        {current.status === "pending" && <><button className="beauty-primary" type="button" onClick={() => updateStatus("confirmed")}><Check size={17} />Подтвердить</button><button className="beauty-secondary" type="button" onClick={() => updateStatus("declined")}>Отклонить</button></>}
        {current.status === "confirmed" && <><button className="beauty-secondary" type="button" onClick={() => { setDialog("reschedule"); setForm({ ...form, time: current.time, date: current.date }); }}>Перенести</button><button className="beauty-secondary" type="button" onClick={() => calendarDownload(current)}>В календарь</button><button className="beauty-primary" type="button" onClick={() => updateStatus("completed")}>Завершить</button><button className="beauty-secondary" type="button" onClick={() => updateStatus("no_show")}>No-show</button><button className="beauty-danger" type="button" onClick={() => updateStatus("cancelled")}>Отменить</button></>}
      </div>
    </section></div>}
    {dialog && <div className="beauty-dialog-backdrop"><section className="beauty-dialog" role="dialog" aria-modal="true">
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
