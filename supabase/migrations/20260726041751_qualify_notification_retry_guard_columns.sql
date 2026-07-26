create or replace function public.go_irl_claim_event_notifications(
  p_providers text[],
  p_limit integer default 50,
  p_lease_seconds integer default 300
)
returns table (
  id uuid,
  user_key text,
  activity_id uuid,
  kind text,
  payload jsonb,
  attempt_count smallint,
  provider text,
  provider_user_id text,
  recipient_last_inbound_at timestamptz,
  language_code text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 200 then raise exception 'invalid_claim_limit'; end if;
  if p_lease_seconds < 30 or p_lease_seconds > 1800 then raise exception 'invalid_lease_seconds'; end if;
  if p_providers is null or cardinality(p_providers) = 0
    or (p_providers <@ array['telegram','whatsapp','instagram','messenger']::text[]) is not true then
    raise exception 'invalid_providers';
  end if;

  update public.event_notifications as terminal_notification
  set status = 'failed',
      next_attempt_at = null,
      leased_at = null,
      last_error_code = coalesce(terminal_notification.last_error_code, 'delivery_attempt_limit_reached'),
      updated_at = now()
  where terminal_notification.status = 'sending'
    and terminal_notification.attempt_count >= 5
    and terminal_notification.leased_at <= now() - make_interval(secs => p_lease_seconds);

  return query
  with due as (
    select notification.id, identity.provider, identity.provider_user_id,
      identity.last_inbound_at, identity.language_code
    from public.event_notifications notification
    join lateral (
      select linked.provider, linked.provider_user_id, linked.last_inbound_at,
        app_user.language_code
      from public.user_provider_identities linked
      left join public.app_users app_user on app_user.user_key = notification.user_key
      where linked.user_key = notification.user_key
        and linked.status = 'active'
        and linked.provider = any(p_providers)
      order by
        (linked.provider = app_user.auth_provider) desc,
        linked.delivery_confirmed_at desc nulls last,
        linked.last_inbound_at desc nulls last,
        linked.created_at asc
      limit 1
    ) identity on true
    where (
      notification.status = 'scheduled'
      and notification.attempt_count < 5
      and coalesce(notification.next_attempt_at, notification.created_at) <= now()
    ) or (
      notification.status = 'failed'
      and notification.attempt_count < 5
      and notification.next_attempt_at is not null
      and notification.next_attempt_at <= now()
    ) or (
      notification.status = 'sending'
      and notification.attempt_count < 5
      and notification.leased_at <= now() - make_interval(secs => p_lease_seconds)
    )
    order by coalesce(notification.next_attempt_at, notification.created_at), notification.id
    for update of notification skip locked
    limit p_limit
  ),
  claimed as (
    update public.event_notifications notification
    set status = 'sending',
        attempt_count = notification.attempt_count + 1,
        leased_at = now(),
        provider = due.provider,
        updated_at = now()
    from due
    where notification.id = due.id
    returning notification.*
  )
  select claimed.id, claimed.user_key, claimed.activity_id, claimed.kind,
    claimed.payload, claimed.attempt_count, due.provider, due.provider_user_id,
    due.last_inbound_at, due.language_code
  from claimed join due on due.id = claimed.id;
end;
$$;

revoke all on function public.go_irl_claim_event_notifications(text[], integer, integer)
from public, anon, authenticated;
grant execute on function public.go_irl_claim_event_notifications(text[], integer, integer)
to service_role;

notify pgrst, 'reload schema';
