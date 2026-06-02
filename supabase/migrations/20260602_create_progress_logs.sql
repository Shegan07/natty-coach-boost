create extension if not exists pgcrypto;

create table if not exists public.progress_logs (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  log_date date not null,
  weight numeric,
  body_fat numeric,
  chest numeric,
  waist numeric,
  hip numeric,
  created_at timestamptz not null default now()
);

create index if not exists progress_logs_trainer_id_idx on public.progress_logs (trainer_id);
create index if not exists progress_logs_client_id_idx on public.progress_logs (client_id);
create index if not exists progress_logs_log_date_idx on public.progress_logs (log_date desc);

alter table public.progress_logs enable row level security;

create policy "Trainers can read their progress logs"
  on public.progress_logs
  for select
  using (trainer_id = auth.uid());

create policy "Clients can read their own progress logs"
  on public.progress_logs
  for select
  using (
    exists (
      select 1
      from public.clients c
      where c.id = progress_logs.client_id
        and c.user_id = auth.uid()
    )
  );

create policy "Clients can insert their own progress logs"
  on public.progress_logs
  for insert
  with check (
    exists (
      select 1
      from public.clients c
      where c.id = progress_logs.client_id
        and c.user_id = auth.uid()
        and c.trainer_id = progress_logs.trainer_id
    )
  );

create policy "Trainers can insert progress logs"
  on public.progress_logs
  for insert
  with check (trainer_id = auth.uid());

create policy "Trainers can update progress logs"
  on public.progress_logs
  for update
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "Trainers can delete progress logs"
  on public.progress_logs
  for delete
  using (trainer_id = auth.uid());
