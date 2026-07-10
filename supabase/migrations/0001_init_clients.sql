-- Lexcase — Legal CRM
-- Initial schema: clients table
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query) or via the
-- Supabase CLI (`supabase db push`).

-- Needed for gen_random_uuid() on older projects (no-op if already enabled).
create extension if not exists "pgcrypto";

-- Allowed case statuses.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_status') then
    create type client_status as enum ('NEW', 'IN_PROGRESS', 'CLOSED');
  end if;
end
$$;

create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  status      client_status not null default 'NEW'
);

-- Indexes to keep the dashboard fast as the caseload grows.
create index if not exists clients_created_at_idx on public.clients (created_at desc);
create index if not exists clients_status_idx on public.clients (status);

-- Keep updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- Row Level Security.
-- This prototype has no auth layer, so we allow the anon/authenticated roles to
-- work with the table. Tighten these policies before going to production.
alter table public.clients enable row level security;

drop policy if exists "clients_anon_all" on public.clients;
create policy "clients_anon_all"
  on public.clients
  for all
  to anon, authenticated
  using (true)
  with check (true);
