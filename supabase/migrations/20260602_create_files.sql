create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do update
set public = excluded.public;

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  bucket_id text not null default 'client-files',
  file_path text not null unique,
  file_name text not null,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

create index if not exists files_trainer_id_idx on public.files (trainer_id);
create index if not exists files_client_id_idx on public.files (client_id);

alter table public.files enable row level security;

create policy "Trainers can read their files"
  on public.files
  for select
  using (trainer_id = auth.uid());

create policy "Clients can read their own files"
  on public.files
  for select
  using (
    exists (
      select 1
      from public.clients c
      where c.id = files.client_id
        and c.user_id = auth.uid()
    )
  );

create policy "Trainers can insert files"
  on public.files
  for insert
  with check (trainer_id = auth.uid());

create policy "Trainers can update files"
  on public.files
  for update
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "Trainers can delete files"
  on public.files
  for delete
  using (trainer_id = auth.uid());

create policy "Trainers can upload objects"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'client-files'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Trainers can manage their uploaded objects"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'client-files'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Clients can read assigned file objects"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'client-files'
    and exists (
      select 1
      from public.files f
      join public.clients c on c.id = f.client_id
      where f.file_path = storage.objects.name
        and c.user_id = auth.uid()
    )
  );

create policy "Trainers can delete uploaded objects"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'client-files'
    and split_part(name, '/', 1) = auth.uid()::text
  );
