-- Com-Rev120: restore RLS policy helper execution and make Com-Rev119 reproducible

begin;

create or replace function public.go_irl_can_access_external_telegram_chat(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    exists (
      select 1
      from public.user_roles role_row
      where role_row.user_key = public.go_irl_request_user_key()
        and role_row.role in ('moderator', 'admin')
    )
    or exists (
      select 1
      from public.activities activity
      where activity.id = p_activity_id
        and activity.organizer_key = public.go_irl_request_user_key()
    )
    or exists (
      select 1
      from public.activity_members member
      where member.activity_id = p_activity_id
        and member.user_key = public.go_irl_request_user_key()
        and member.status = 'joined'
    );
$$;

create or replace function public.go_irl_is_activity_organizer(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.activities activity
    where activity.id = p_activity_id
      and activity.organizer_key = public.go_irl_request_user_key()
  );
$$;

revoke execute on function public.go_irl_can_access_external_telegram_chat(uuid) from public, anon;
revoke execute on function public.go_irl_is_activity_organizer(uuid) from public, anon;
grant execute on function public.go_irl_can_access_external_telegram_chat(uuid) to authenticated;
grant execute on function public.go_irl_is_activity_organizer(uuid) to authenticated;

commit;
