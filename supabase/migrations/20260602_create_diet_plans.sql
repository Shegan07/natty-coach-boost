create extension if not exists pgcrypto;

create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  title text not null,
  schedule text not null,
  meals jsonb not null default '[]'::jsonb,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists diet_plans_trainer_id_idx on public.diet_plans (trainer_id);
create index if not exists diet_plans_client_id_idx on public.diet_plans (client_id);

alter table public.diet_plans enable row level security;

create policy "Trainers can read their diet plans"
  on public.diet_plans
  for select
  using (trainer_id = auth.uid());

create policy "Clients can read their assigned diet plans"
  on public.diet_plans
  for select
  using (
    exists (
      select 1
      from public.clients c
      where c.id = diet_plans.client_id
        and c.user_id = auth.uid()
    )
  );

create policy "Trainers can insert diet plans"
  on public.diet_plans
  for insert
  with check (trainer_id = auth.uid());

create policy "Trainers can update diet plans"
  on public.diet_plans
  for update
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "Trainers can delete diet plans"
  on public.diet_plans
  for delete
  using (trainer_id = auth.uid());
