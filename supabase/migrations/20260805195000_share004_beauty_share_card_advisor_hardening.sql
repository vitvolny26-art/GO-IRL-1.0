-- SHARE004-A hardening: use trusted JWT role claims in RLS and remove exposed SECURITY DEFINER helpers.
-- Repository-only migration. Production application still requires separate explicit approval.

-- Owner access remains covered by the existing owner policies.
drop policy if exists "beauty share cards admin read" on public.beauty_share_cards;
drop policy if exists "beauty share cards staff read" on public.beauty_share_cards;
create policy "beauty share cards staff read"
on public.beauty_share_cards for select to authenticated
using (
  coalesce(auth.jwt() ->> 'go_irl_role', '') in ('admin', 'organizer')
);

create or replace function public.go_irl_get_beauty_share_card_status(p_profile_id uuid)
returns table (
  profile_id uuid,
  card_status text,
  template_version integer,
  has_generated_image boolean,
  generated_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select
    card.profile_id,
    card.status,
    card.template_version,
    card.generated_object_path is not null,
    card.generated_at,
    card.updated_at
  from public.beauty_share_cards card
  where card.profile_id = p_profile_id;
$$;

revoke all on function public.go_irl_get_beauty_share_card_status(uuid) from public;
revoke all on function public.go_irl_get_beauty_share_card_status(uuid) from anon;
grant execute on function public.go_irl_get_beauty_share_card_status(uuid) to authenticated;

-- No remaining policy or RPC depends on this generic role helper.
revoke all on function public.go_irl_current_user_has_any_role(text[]) from public;
revoke all on function public.go_irl_current_user_has_any_role(text[]) from anon;
revoke all on function public.go_irl_current_user_has_any_role(text[]) from authenticated;
drop function public.go_irl_current_user_has_any_role(text[]);

notify pgrst, 'reload schema';
