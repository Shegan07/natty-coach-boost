create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('trainer', 'client')),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by their owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles are updatable by their owner"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
