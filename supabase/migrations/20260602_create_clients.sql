create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users (id) on delete cascade,
  user_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  goals text,
  body_stats jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists clients_trainer_id_idx on public.clients (trainer_id);
create index if not exists clients_user_id_idx on public.clients (user_id);

alter table public.clients enable row level security;

create policy "Trainers can view their clients"
  on public.clients
  for select
  using (trainer_id = auth.uid());

create policy "Clients can view their own client row"
  on public.clients
  for select
  using (user_id = auth.uid());

create policy "Trainers can insert their clients"
  on public.clients
  for insert
  with check (trainer_id = auth.uid());

create policy "Trainers can update their clients"
  on public.clients
  for update
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "Trainers can delete their clients"
  on public.clients
  for delete
  using (trainer_id = auth.uid());
