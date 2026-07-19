-- GO IRL Phase A: minimal production user profile.
-- Additive migration only. Apply after trusted Telegram auth migration v4.
-- This file does not create or change the avatar Storage bucket.

create table if not exists public.user_profiles (
  user_key text primary key references public.app_users(user_key),
  display_name text not null,
  bio text not null default '',
  city_id text not null default 'olomouc',
  avatar_path text,
  avatar_code text,
  is_public boolean not null default true,
  show