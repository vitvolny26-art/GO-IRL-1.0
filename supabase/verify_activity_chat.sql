-- GO IRL verify temporary activity chat

select
  'activity_chats_table' as check_name,
  case when to_regclass('public.activity_chats') is not null then 'ok' else 'missing' end as status;

select
  'activity_chat_messages_table' as check_name,
  case when to_regclass('public.activity_chat_messages') is not null then 'ok' else 'missing' end as status;

select
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('activity_chats', 'activity_chat_messages')
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
  and cls.relname in ('activity_chats', 'activity_chat_messages')
order by cls.relname, pol.polname;

select
  p.proname as function_name,
  p.oid::regprocedure as signature
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'go_irl_activity_chat_expires_at',
    'go_irl_can_access_activity_chat',
    'go_irl_can_write_activity_chat',
    'go_irl_ensure_activity_chat',
    'go_irl_expire_activity_chats',
    'go_irl_cleanup_expired_activity_chat_messages'
  )
order by p.proname;
