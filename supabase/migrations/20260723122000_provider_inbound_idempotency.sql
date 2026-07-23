-- Durable, privacy-minimized idempotency for Meta and WhatsApp inbound events.
-- Only a SHA-256 event key is stored; raw provider event IDs and payloads are not.

begin;

create table if not exists public.provider_inbound_events (
  provider text not null check (provider in ('whatsapp', 'instagram', 'messenger')),
  event_key text not null check (event_key ~ '^[0-9a-f]{64}$'),
  status text not null default 'processing' check (status in ('processing', 'processed', 'failed')),
  attempt_count smallint not null default 1 check (attempt_count between 1 and 20),
  leased_at timestamptz,
  processed_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (provider, event_key)
);

create index if not exists provider_inbound_events_status_idx
on public.provider_inbound_events(status, leased_at);

alter table public.provider_inbound_events enable row level security;
revoke all on public.provider_inbound_events from anon, authenticated;

create or replace function public.go_irl_claim_provider_inbound_event(
  p_provider text,
  p_event_key text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_claimed boolean;
begin
  if p_provider not in ('whatsapp', 'instagram', 'messenger') then
    raise exception 'unsupported_provider';
  end if;
  if p_event_key !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_event_key';
  end if;

  insert into public.provider_inbound_events (
    provider,
    event_key,
    status,
    attempt_count,
    leased_at,
    processed_at,
    last_error_code,
    updated_at
  ) values (
    p_provider,
    p_event_key,
    'processing',
    1,
    now(),
    null,
    null,
    now()
  )
  on conflict (provider, event_key) do update
  set
    status = 'processing',
    attempt_count = public.provider_inbound_events.attempt_count + 1,
    leased_at = now(),
    processed_at = null,
    last_error_code = null,
    updated_at = now()
  where (
      public.provider_inbound_events.status = 'failed'
      or (
        public.provider_inbound_events.status = 'processing'
        and public.provider_inbound_events.leased_at < now() - interval '5 minutes'
      )
    )
    and public.provider_inbound_events.attempt_count < 20
  returning true into v_claimed;

  return coalesce(v_claimed, false);
end;
$$;

create or replace function public.go_irl_complete_provider_inbound_event(
  p_provider text,
  p_event_key text,
  p_success boolean,
  p_error_code text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.provider_inbound_events
  set
    status = case when p_success then 'processed' else 'failed' end,
    leased_at = null,
    processed_at = case when p_success then now() else null end,
    last_error_code = case when p_success then null else left(coalesce(p_error_code, 'unknown_error'), 120) end,
    updated_at = now()
  where provider = p_provider
    and event_key = p_event_key
    and status = 'processing';
end;
$$;

revoke all on function public.go_irl_claim_provider_inbound_event(text, text)
from public, anon, authenticated;
revoke all on function public.go_irl_complete_provider_inbound_event(text, text, boolean, text)
from public, anon, authenticated;
grant execute on function public.go_irl_claim_provider_inbound_event(text, text)
to service_role;
grant execute on function public.go_irl_complete_provider_inbound_event(text, text, boolean, text)
to service_role;

commit;
