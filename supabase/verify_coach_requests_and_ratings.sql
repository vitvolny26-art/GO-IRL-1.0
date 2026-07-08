-- GO IRL verify coach requests and ratings

select
  'coach_profiles_table' as check_name,
  case when to_regclass('public.coach_profiles') is not null then 'ok' else 'missing' end as status;

select
  'coach_requests_table' as check_name,
  case when to_regclass('public.coach_requests') is not null then 'ok' else 'missing' end as status;

select
  'coach_reviews_table' as check_name,
  case when to_regclass('public.coach_reviews') is not null then 'ok' else 'missing' end as status;

select
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('coach_profiles', 'coach_requests', 'coach_reviews')
order by tablename;

select
  cls.relname as table_name,
  pol.polname as policy_name,
  pol.polcmd as command,
  pg_get_expr(pol.polqual, pol.polrelid) as using_expr,
  pg_get_expr(pol.polwithcheck, pol.polrelid) as check_expr
from pg_policy pol
join pg_class cls on cls.oid = pol.polrelid
join pg_namespace ns on ns.oid = cls.relnamespace
where ns.nspname = 'public'
  and cls.relname in ('coach_profiles', 'coach_requests', 'coach_reviews')
order by cls.relname, pol.polname;

select
  p.proname as function_name,
  p.oid::regprocedure as signature
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'go_irl_can_manage_activity',
    'go_irl_recalculate_coach_rating',
    'go_irl_coach_review_rating_trigger'
  )
order by p.proname;
