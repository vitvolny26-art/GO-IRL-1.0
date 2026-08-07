const fs = require('node:fs');

const replaceOne = (path, before, after) => {
  const source = fs.readFileSync(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Missing patch anchor in ${path}: ${before.slice(0, 100)}`);
  const next = source.replace(before, after);
  fs.writeFileSync(path, next);
};

const appendOnce = (path, marker, block) => {
  const source = fs.readFileSync(path, 'utf8');
  if (source.includes(marker)) return;
  fs.writeFileSync(path, `${source.trimEnd()}\n\n${block.trim()}\n`);
};

const writeNew = (path, content) => {
  if (fs.existsSync(path)) throw new Error(`Refusing to overwrite ${path}`);
  fs.writeFileSync(path, content.trimStart());
};

const cardPath = 'src/services/ServiceActivityCard.tsx';
replaceOne(
  cardPath,
  '      <h2>{labels.booking}</h2><p>{professional.displayName} · {professional.serviceName}</p>',
  `      <h2>{labels.booking}</h2><p>{professional.displayName}</p>\n      <button className="service-booking-service-select" type="button" onClick={() => { resetBookingAttempt(); setServicesOpen(true); }}>\n        <span>{labels.selectService}</span>\n        <strong>{professional.serviceName}</strong>\n        <small>{professional.durationMinutes} min · {professional.priceCzk} CZK</small>\n      </button>`,
);

appendOnce(
  'src/services/service-activity-card-overrides.css',
  '.service-booking-service-select {',
  `
.service-booking-service-select {
  display: grid;
  width: 100%;
  gap: 4px;
  margin: 0 0 12px;
  padding: 12px 14px;
  border: 1px solid #d4af37;
  border-radius: 14px;
  background: rgba(36, 20, 45, 0.92);
  color: #fff;
  text-align: left;
}

.service-booking-service-select span,
.service-booking-service-select small {
  color: #cbbbcf;
  font-size: 12px;
}

.service-booking-service-select strong {
  font-size: 16px;
  line-height: 1.25;
}
`,
);

const repoPath = 'src/services/servicesBookingClientRepository.ts';
replaceOne(
  repoPath,
  'import { listServiceBookings, type ServiceBooking } from "./servicesBookingRepository";',
  'import { listServiceBookings, updateServiceBookingStatus, type ServiceBooking } from "./servicesBookingRepository";',
);
replaceOne(
  repoPath,
  `export type ClientServiceBookingSnapshot = {\n  bookings: ClientServiceBooking[];\n  source: ClientServiceBookingSource;\n};`,
  `export type ClientServiceBookingSnapshot = {\n  bookings: ClientServiceBooking[];\n  source: ClientServiceBookingSource;\n};\n\nexport type CancelClientServiceBookingResult =\n  | "cancelled"\n  | "stale"\n  | "policy_required"\n  | "not_found"\n  | "local_cancelled";`,
);
replaceOne(
  repoPath,
  'export const serviceBookingClientRepositoryInternals = {',
  `export const cancelClientServiceBooking = async (\n  booking: ClientServiceBooking,\n  dependencies: Pick<RepositoryDependencies, "client" | "browserMock" | "initializeAuth"> & {\n    updateLocal?: typeof updateServiceBookingStatus;\n  } = {},\n): Promise<CancelClientServiceBookingResult> => {\n  const updateLocal = dependencies.updateLocal || updateServiceBookingStatus;\n  const cancelLocal = (): CancelClientServiceBookingResult => {\n    updateLocal(booking.id, "cancelled");\n    return "local_cancelled";\n  };\n\n  const browserMock = dependencies.browserMock ?? isBrowserMockMode();\n  if (browserMock) return cancelLocal();\n\n  const initializeAuth = dependencies.initializeAuth || initializeTrustedAuth;\n  const identity = await initializeAuth();\n  if (identity?.source !== "trusted-telegram") return cancelLocal();\n\n  const client = dependencies.client || (supabase as unknown as BookingRpcClient);\n  const response = await client.rpc("go_irl_cancel_my_beauty_booking", {\n    p_booking_id: booking.id,\n    p_expected_updated_at: booking.updatedAt,\n  });\n  if (response.error) {\n    if (isMissingRpc(response.error)) throw new Error("Beauty booking cancellation RPC is unavailable");\n    throw response.error;\n  }\n\n  const row = Array.isArray(response.data)\n    ? response.data[0] as { result?: unknown } | undefined\n    : undefined;\n  const result = String(row?.result || "");\n  if (!["cancelled", "stale", "policy_required", "not_found"].includes(result)) {\n    throw new Error("Unexpected Beauty booking cancellation RPC result");\n  }\n  return result as CancelClientServiceBookingResult;\n};\n\nexport const serviceBookingClientRepositoryInternals = {`,
);

const viewPath = 'src/services/ServicesBookingsView.tsx';
replaceOne(
  viewPath,
  'import { CalendarDays, Clock3, MapPin, RefreshCw, Ticket } from "lucide-react";',
  'import { CalendarDays, Clock3, MapPin, RefreshCw, Ticket, XCircle } from "lucide-react";',
);
replaceOne(
  viewPath,
  '  loadClientServiceBookings,\n  type ClientServiceBooking,',
  '  cancelClientServiceBooking,\n  loadClientServiceBookings,\n  type ClientServiceBooking,',
);
replaceOne(viewPath, '    duration: "Длительность",', '    duration: "Длительность",\n    cancel: "Отменить запись",\n    cancelling: "Отменяем…",\n    cancelConfirm: "Отменить эту запись?",\n    cancelLocked: "Отмена доступна не позднее чем за 24 часа до начала.",\n    cancelFailed: "Не удалось отменить запись",');
replaceOne(viewPath, '    duration: "Тривалість",', '    duration: "Тривалість",\n    cancel: "Скасувати запис",\n    cancelling: "Скасовуємо…",\n    cancelConfirm: "Скасувати цей запис?",\n    cancelLocked: "Скасування доступне не пізніше ніж за 24 години до початку.",\n    cancelFailed: "Не вдалося скасувати запис",');
replaceOne(viewPath, '    duration: "Délka",', '    duration: "Délka",\n    cancel: "Zrušit rezervaci",\n    cancelling: "Rušíme…",\n    cancelConfirm: "Zrušit tuto rezervaci?",\n    cancelLocked: "Rezervaci lze zrušit nejpozději 24 hodin před začátkem.",\n    cancelFailed: "Rezervaci se nepodařilo zrušit",');
replaceOne(viewPath, '    duration: "Duration",', '    duration: "Duration",\n    cancel: "Cancel booking",\n    cancelling: "Cancelling…",\n    cancelConfirm: "Cancel this booking?",\n    cancelLocked: "Cancellation is available until 24 hours before the appointment.",\n    cancelFailed: "Could not cancel the booking",');
replaceOne(
  viewPath,
  'const emptySnapshot: ClientServiceBookingSnapshot = { bookings: [], source: "browser-local" };',
  'const emptySnapshot: ClientServiceBookingSnapshot = { bookings: [], source: "browser-local" };\nconst cancellationLeadMs = 24 * 60 * 60 * 1000;',
);
replaceOne(
  viewPath,
  'function BookingCard({ booking, language }: { booking: ClientServiceBooking; language: Language }) {',
  `function BookingCard({\n  booking,\n  language,\n  cancelling,\n  onCancel,\n}: {\n  booking: ClientServiceBooking;\n  language: Language;\n  cancelling: boolean;\n  onCancel: (booking: ClientServiceBooking) => void;\n}) {`,
);
replaceOne(
  viewPath,
  '  const location = booking.exactAddress || booking.publicLocation;',
  `  const location = booking.exactAddress || booking.publicLocation;\n  const cancellationStatus = booking.status === "pending" || booking.status === "confirmed";\n  const startsAt = new Date(booking.startsAt).getTime();\n  const cancellationAllowed = cancellationStatus\n    && Number.isFinite(startsAt)\n    && startsAt - Date.now() >= cancellationLeadMs;`,
);
replaceOne(
  viewPath,
  '        <div><MapPin /><span><small>{text.address}</small><strong>{location}</strong></span></div>\n      </div>\n    </article>',
  `        <div><MapPin /><span><small>{text.address}</small><strong>{location}</strong></span></div>\n      </div>\n      {cancellationStatus && <div className="services-booking-cancel">\n        {cancellationAllowed\n          ? <button type="button" onClick={() => onCancel(booking)} disabled={cancelling}><XCircle />{cancelling ? text.cancelling : text.cancel}</button>\n          : <small>{text.cancelLocked}</small>}\n      </div>}\n    </article>`,
);
replaceOne(
  viewPath,
  '  const [state, setState] = useState<"loading" | "ready" | "error">("loading");',
  '  const [state, setState] = useState<"loading" | "ready" | "error">("loading");\n  const [cancellingId, setCancellingId] = useState("");\n  const [actionError, setActionError] = useState("");',
);
replaceOne(
  viewPath,
  '  useEffect(() => {',
  `  const cancelBooking = useCallback(async (booking: ClientServiceBooking) => {\n    if (!window.confirm(text.cancelConfirm)) return;\n    setCancellingId(booking.id);\n    setActionError("");\n    try {\n      const result = await cancelClientServiceBooking(booking);\n      if (result !== "cancelled" && result !== "local_cancelled") {\n        setActionError(result === "policy_required" ? text.cancelLocked : text.cancelFailed);\n      }\n      await refresh();\n    } catch {\n      setActionError(text.cancelFailed);\n    } finally {\n      setCancellingId("");\n    }\n  }, [refresh, text]);\n\n  useEffect(() => {`,
);
replaceOne(
  viewPath,
  '      {snapshot.source === "local-fallback" && <div className="services-bookings-fallback">{text.fallback}</div>}',
  '      {snapshot.source === "local-fallback" && <div className="services-bookings-fallback">{text.fallback}</div>}\n      {actionError && <div className="services-bookings-state is-error">{actionError}</div>}',
);
replaceOne(
  viewPath,
  '<BookingCard key={booking.id} booking={booking} language={language} />',
  '<BookingCard key={booking.id} booking={booking} language={language} cancelling={cancellingId === booking.id} onCancel={(item) => void cancelBooking(item)} />',
);

appendOnce(
  'src/services/services-bookings.css',
  '.services-booking-cancel {',
  `
.services-booking-cancel {
  display: grid;
  gap: 7px;
}
.services-booking-cancel button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 12px;
  border: 1px solid rgba(255,111,97,.55);
  border-radius: 9px;
  background: rgba(255,111,97,.08);
  color: var(--coral);
  font: inherit;
  font-weight: 800;
}
.services-booking-cancel button:disabled { opacity: .55; }
.services-booking-cancel button svg { width: 17px; height: 17px; }
.services-booking-cancel small { color: var(--muted); font-size: 11px; line-height: 1.35; }
`,
);

writeNew(
  'supabase/migrations/20260807142500_beauty_client_cancel_24h_policy.sql',
  `-- Beauty007: allow a client to cancel pending or confirmed bookings until 24 hours before start.\n\nbegin;\n\ncreate or replace function public.go_irl_cancel_my_beauty_booking(\n  p_booking_id uuid,\n  p_expected_updated_at timestamptz\n)\nreturns table (\n  result text,\n  booking_id uuid,\n  booking_status text,\n  updated_at timestamptz\n)\nlanguage plpgsql\nsecurity definer\nset search_path to 'pg_catalog', 'public'\nas $function$\ndeclare\n  v_user_key text := public.go_irl_auth_user_key();\n  v_booking public.beauty_bookings%rowtype;\n  v_from_status text;\nbegin\n  if v_user_key is null then\n    raise exception 'trusted authenticated user required' using errcode = '42501';\n  end if;\n\n  select * into v_booking\n  from public.beauty_bookings booking\n  where booking.id = p_booking_id\n    and booking.client_user_key = v_user_key\n  for update;\n\n  if not found then\n    return query select 'not_found'::text, null::uuid, null::text, null::timestamptz;\n    return;\n  end if;\n\n  if p_expected_updated_at is distinct from v_booking.updated_at then\n    return query select 'stale'::text, v_booking.id, v_booking.status, v_booking.updated_at;\n    return;\n  end if;\n\n  if v_booking.status not in ('pending', 'confirmed')\n    or v_booking.starts_at < now() + interval '24 hours' then\n    return query select 'policy_required'::text, v_booking.id, v_booking.status, v_booking.updated_at;\n    return;\n  end if;\n\n  v_from_status := v_booking.status;\n\n  update public.beauty_bookings booking\n  set status = 'cancelled', cancelled_at = now()\n  where booking.id = v_booking.id\n  returning * into v_booking;\n\n  insert into public.beauty_booking_events (\n    booking_id,\n    event_type,\n    actor_user_key,\n    from_status,\n    to_status,\n    payload,\n    deduplication_key\n  ) values (\n    v_booking.id,\n    'booking_cancelled',\n    v_user_key,\n    v_from_status,\n    'cancelled',\n    jsonb_build_object('source', 'client_rpc', 'policy', 'client_cancel_24h'),\n    'beauty-booking:' || v_booking.id::text || ':' || v_from_status || ':cancelled:' || extract(epoch from p_expected_updated_at)::bigint::text\n  );\n\n  return query select 'cancelled'::text, v_booking.id, v_booking.status, v_booking.updated_at;\nend;\n$function$;\n\nrevoke all on function public.go_irl_cancel_my_beauty_booking(uuid, timestamptz)\nfrom public, anon;\ngrant execute on function public.go_irl_cancel_my_beauty_booking(uuid, timestamptz)\nto authenticated, service_role;\n\nnotify pgrst, 'reload schema';\n\ncommit;\n`,
);

writeNew(
  'supabase/verify_beauty_client_cancel_24h_policy.sql',
  `-- Rollback-only verifier for the Beauty client 24-hour cancellation policy.\n\nbegin;\n\ndo $$\ndeclare\n  definition text;\nbegin\n  select pg_get_functiondef(\n    'public.go_irl_cancel_my_beauty_booking(uuid,timestamptz)'::regprocedure\n  ) into definition;\n\n  if definition not like '%v_booking.status not in (''pending'', ''confirmed'')%' then\n    raise exception 'pending/confirmed client cancellation policy missing';\n  end if;\n\n  if definition not like '%interval ''24 hours''%' then\n    raise exception '24-hour cancellation cutoff missing';\n  end if;\n\n  if definition not like '%v_from_status := v_booking.status%' then\n    raise exception 'dynamic cancellation source status missing';\n  end if;\n\n  if has_function_privilege(\n    'anon',\n    'public.go_irl_cancel_my_beauty_booking(uuid,timestamptz)',\n    'execute'\n  ) then\n    raise exception 'anon can cancel Beauty bookings';\n  end if;\n\n  if not has_function_privilege(\n    'authenticated',\n    'public.go_irl_cancel_my_beauty_booking(uuid,timestamptz)',\n    'execute'\n  ) then\n    raise exception 'authenticated client cannot execute Beauty cancellation RPC';\n  end if;\nend\n$$;\n\nrollback;\n`,
);

writeNew(
  'src/services/BeautyClientBookingActions.ux.test.ts',
  `import { describe, expect, it } from "vitest";\nimport cardSource from "./ServiceActivityCard.tsx?raw";\nimport bookingsSource from "./ServicesBookingsView.tsx?raw";\nimport clientRepositorySource from "./servicesBookingClientRepository.ts?raw";\nimport cancellationMigrationSource from "../../supabase/migrations/20260807142500_beauty_client_cancel_24h_policy.sql?raw";\n\ndescribe("Beauty client booking actions", () => {\n  it("lets the client choose a service inside the booking sheet", () => {\n    expect(cardSource).toContain("service-booking-service-select");\n    expect(cardSource).toContain("setServicesOpen(true)");\n    expect(cardSource).toContain("professional.serviceName");\n  });\n\n  it("wires client cancellation to the trusted Beauty RPC", () => {\n    expect(bookingsSource).toContain("cancelClientServiceBooking");\n    expect(bookingsSource).toContain("cancellationLeadMs = 24 * 60 * 60 * 1000");\n    expect(clientRepositorySource).toContain('rpc("go_irl_cancel_my_beauty_booking"');\n  });\n\n  it("keeps the 24-hour cutoff enforced server-side", () => {\n    expect(cancellationMigrationSource).toContain("status not in ('pending', 'confirmed')");\n    expect(cancellationMigrationSource).toContain("interval '24 hours'");\n  });\n});\n`,
);

writeNew(
  'docs/reports/2026-08-07-beauty007-client-cancel-service-picker.md',
  `---\ntitle: Agent Report\nowner: Chief Archivist / Technical Lead\nstatus: Draft\nsource_of_truth: false\nlast_review: 2026-08-07\nnext_review: 2026-08-14\n---\n\n# Agent Report\n\n## Task\n\nAdd service selection inside the Beauty booking flow and allow client cancellation of pending/confirmed bookings until 24 hours before start.\n\n## Files inspected\n\n- src/services/ServiceActivityCard.tsx\n- src/services/ServicesBookingsView.tsx\n- src/services/servicesBookingClientRepository.ts\n- src/services/servicesBookingRepository.ts\n- production go_irl_cancel_my_beauty_booking RPC\n\n## Findings\n\nThe booking sheet displayed the current service but did not expose the existing service picker. The client bookings view had no cancellation action. The existing server cancellation RPC only accepted pending bookings.\n\n## Changes made\n\n- expose the existing service picker directly inside the booking sheet;\n- refresh service-specific availability through the existing selected-service state;\n- add client cancellation action and clear 24-hour cutoff copy;\n- wire cancellation to go_irl_cancel_my_beauty_booking;\n- update the RPC to allow pending/confirmed cancellation only when starts_at is at least 24 hours away;\n- retain existing ownership, stale-write and notification event boundaries.\n\n## Checks\n\nPending exact-head CI and production migration verification.\n\n## Next step\n\nRun checks, apply the explicitly approved production migration, verify the function, then request separate merge/deploy approval.\n`,
);

console.log('Beauty client cancel/service picker patch applied');
