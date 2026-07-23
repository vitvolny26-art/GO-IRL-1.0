create table if not exists public.messaging_operator_alert_state (
  alert_key text primary key,
  last_sent_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.messaging_operator_alert_state enable row level security;

revoke all on table public.messaging_operator_alert_state from anon, authenticated;

create or replace function public.go_irl_claim_messaging_operator_alert(
  p_alert_key text,
  p_cooldown_seconds integer default 1800
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  claimed boolean := false;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role_required';
  end if;

  if nullif(trim(p_alert_key), '') is null then
    raise exception 'alert_key_required';
  end if;

  insert into public.messaging_operator_alert_state (alert_key, last_sent_at, updated_at)
  values (left(trim(p_alert_key), 120), now(), now())
  on conflict (alert_key) do update
  set last_sent_at = excluded.last_sent_at,
      updated_at = excluded.updated_at
  where messaging_operator_alert_state.last_sent_at
    <= now() - make_interval(
      secs => greatest(60, least(coalesce(p_cooldown_seconds, 1800), 86400))
    )
  returning true into claimed;

  return coalesce(claimed, false);
end;
$$;

revoke all on function public.go_irl_claim_messaging_operator_alert(text, integer)
  from public, anon, authenticated;
grant execute on function public.go_irl_claim_messaging_operator_alert(text, integer)
  to service_role;
