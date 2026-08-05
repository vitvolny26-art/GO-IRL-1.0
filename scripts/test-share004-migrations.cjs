const { execFileSync } = require("node:child_process");
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");

const repositoryRoot = resolve(__dirname, "..");
const migrationPaths = [
  "supabase/migrations/20260805193000_share004_beauty_share_card_persistence.sql",
  "supabase/migrations/20260805194000_share004_beauty_share_card_service_keys_hotfix.sql",
  "supabase/migrations/20260805195000_share004_beauty_share_card_advisor_hardening.sql",
];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required for the SHARE004 migration smoke test.");
  process.exit(1);
}

const baselineSql = String.raw`
create extension if not exists pgcrypto;

create role anon nologin;
create role authenticated nologin;

create schema auth;
create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

grant usage on schema auth to authenticated;
grant execute on function auth.jwt() to authenticated;

create schema storage;
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null references storage.buckets(id),
  name text not null
);
alter table storage.objects enable row level security;
create or replace function storage.foldername(object_name text)
returns text[]
language sql
immutable
as $$
  select string_to_array(object_name, '/');
$$;

grant usage on schema storage to authenticated;
grant select, insert, update, delete on storage.objects to authenticated;
grant execute on function storage.foldername(text) to authenticated;

create table public.user_roles (
  user_key text primary key,
  role text not null
);

create table public.beauty_professional_profiles (
  id uuid primary key,
  owner_user_key text not null unique
);

create table public.beauty_professional_services (
  id uuid primary key,
  profile_id uuid not null references public.beauty_professional_profiles(id) on delete cascade,
  client_key text not null,
  active boolean not null default true,
  archived boolean not null default false,
  unique (profile_id, client_key)
);

create or replace function public.go_irl_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.go_irl_auth_user_key()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'go_irl_user_key', '');
$$;

create or replace function public.go_irl_owns_beauty_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.beauty_professional_profiles profile
    where profile.id = p_profile_id
      and profile.owner_user_key = public.go_irl_auth_user_key()
  );
$$;

create or replace function public.go_irl_current_user_is_professional()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(auth.jwt() ->> 'go_irl_role', '') = 'professional';
$$;

revoke all on function public.go_irl_owns_beauty_profile(uuid) from public, anon;
revoke all on function public.go_irl_current_user_is_professional() from public, anon;
grant execute on function public.go_irl_owns_beauty_profile(uuid) to authenticated;
grant execute on function public.go_irl_current_user_is_professional() to authenticated;
`;

const verificationSql = String.raw`
insert into public.beauty_professional_profiles (id, owner_user_key)
values ('11111111-1111-4111-8111-111111111111', 'telegram:100');

insert into public.beauty_share_cards (
  profile_id,
  template_version,
  status,
  background_position_y,
  service_ids
)
values (
  '11111111-1111-4111-8111-111111111111',
  1,
  'deleted',
  50,
  array[]::text[]
);

do $$
declare
  service_ids_type text;
  status_rpc_is_definer boolean;
  staff_policy_count integer;
  bucket_count integer;
begin
  select column.udt_name
  into service_ids_type
  from information_schema.columns column
  where column.table_schema = 'public'
    and column.table_name = 'beauty_share_cards'
    and column.column_name = 'service_ids';

  if service_ids_type is distinct from '_text' then
    raise exception 'service_ids must be text[], got %', service_ids_type;
  end if;

  if to_regprocedure('public.go_irl_current_user_has_any_role(text[])') is not null then
    raise exception 'generic SECURITY DEFINER role helper must be removed';
  end if;

  select procedure.prosecdef
  into status_rpc_is_definer
  from pg_proc procedure
  where procedure.oid = to_regprocedure('public.go_irl_get_beauty_share_card_status(uuid)');

  if status_rpc_is_definer is null or status_rpc_is_definer then
    raise exception 'status RPC must exist as SECURITY INVOKER';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.go_irl_get_beauty_share_card_status(uuid)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role must execute status RPC';
  end if;

  if has_function_privilege(
    'anon',
    'public.go_irl_get_beauty_share_card_status(uuid)',
    'EXECUTE'
  ) then
    raise exception 'anon role must not execute status RPC';
  end if;

  select count(*)
  into staff_policy_count
  from pg_policies policy
  where policy.schemaname = 'public'
    and policy.tablename = 'beauty_share_cards'
    and policy.policyname = 'beauty share cards staff read';

  if staff_policy_count <> 1 then
    raise exception 'staff read RLS policy missing';
  end if;

  select count(*)
  into bucket_count
  from storage.buckets bucket
  where bucket.id in ('beauty-share-assets', 'beauty-share-cards');

  if bucket_count <> 2 then
    raise exception 'expected two Beauty share-card buckets, got %', bucket_count;
  end if;
end;
$$;

set role authenticated;
select set_config(
  'request.jwt.claims',
  '{"go_irl_role":"organizer","go_irl_user_key":"telegram:200"}',
  false
);

do $$
begin
  if (select count(*) from public.beauty_share_cards) <> 1 then
    raise exception 'organizer must see persistent Beauty card status';
  end if;

  if (
    select count(*)
    from public.go_irl_get_beauty_share_card_status(
      '11111111-1111-4111-8111-111111111111'
    )
  ) <> 1 then
    raise exception 'organizer status RPC visibility failed';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"go_irl_role":"user","go_irl_user_key":"telegram:200"}',
  false
);

do $$
begin
  if (select count(*) from public.beauty_share_cards) <> 0 then
    raise exception 'ordinary user must not see Beauty card status';
  end if;

  if (
    select count(*)
    from public.go_irl_get_beauty_share_card_status(
      '11111111-1111-4111-8111-111111111111'
    )
  ) <> 0 then
    raise exception 'ordinary user status RPC must be filtered by RLS';
  end if;
end;
$$;

reset role;
`;

const tempDirectory = mkdtempSync(join(tmpdir(), "go-irl-share004-"));
const smokeSqlPath = join(tempDirectory, "share004-smoke.sql");

try {
  const migrations = migrationPaths.map((relativePath) => {
    const absolutePath = join(repositoryRoot, relativePath);
    return `\n-- BEGIN ${relativePath}\n${readFileSync(absolutePath, "utf8")}\n-- END ${relativePath}\n`;
  });

  writeFileSync(
    smokeSqlPath,
    ["\\set ON_ERROR_STOP on", baselineSql, ...migrations, verificationSql].join("\n"),
    "utf8",
  );

  execFileSync("psql", [databaseUrl, "-X", "-v", "ON_ERROR_STOP=1", "-f", smokeSqlPath], {
    cwd: repositoryRoot,
    stdio: "inherit",
  });

  console.log("SHARE004 migration smoke PASS: exact migration chain, catalog, RPC grants and RLS visibility verified.");
} finally {
  rmSync(tempDirectory, { recursive: true, force: true });
}
