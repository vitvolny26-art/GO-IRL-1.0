-- GO IRL Phase A2: private profile avatar Storage.
-- Stores only object paths in public.user_profiles.avatar_path.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'avatars',
  'avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatar objects own insert" on storage.objects;
create policy "avatar objects own insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = public.go_irl_auth_user_key()
);

drop policy if exists "avatar objects own select" on storage.objects;
create policy "avatar objects own select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = public.go_irl_auth_user_key()
);

drop policy if exists "avatar objects own delete" on storage.objects;
create policy "avatar objects own delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = public.go_irl_auth_user_key()
);

drop policy if exists "avatar objects public profile select" on storage.objects;
create policy "avatar objects public profile select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and exists (
    select 1
    from public.user_profiles profile
    where profile.avatar_path = storage.objects.name
      and profile.is_public = true
  )
);
