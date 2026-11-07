-- Supabase schema for Touré Ahmed Bouah website

create extension if not exists "pgcrypto";

-- NEWS
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text,
  content text,
  category text,
  date date,
  image_url text,
  slug text unique,
  published boolean default false,
  created_at timestamptz default now()
);

-- EVENTS
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  description text,
  cover_image text,
  event_date date not null,
  start_time time,
  end_time time,
  timezone text default 'Africa/Abidjan',
  venue text,
  address text,
  map_url text,
  capacity integer,
  max_seats_per_registration integer default 1,
  registration_enabled boolean default false,
  registration_opens_at timestamptz,
  registration_deadline timestamptz,
  status text default 'draft',
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- EVENT REGISTRATIONS
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  number_of_seats integer default 1,
  confirmation_code text unique,
  status text default 'confirmed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MEETING REQUESTS
create table if not exists public.meeting_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organization text,
  message text,
  meeting_type text default 'online',
  preferred_date date,
  preferred_time text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ADMINS
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_events_date on public.events(event_date);
create index if not exists idx_registrations_event on public.event_registrations(event_id);
create index if not exists idx_registrations_email on public.event_registrations(email);

-- RLS
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.meeting_requests enable row level security;

-- Policies
drop policy if exists "Public read news" on public.news;
drop policy if exists "Public read events" on public.events;
drop policy if exists "Anyone can request meeting" on public.meeting_requests;
drop policy if exists "Admins manage news" on public.news;
drop policy if exists "Admins manage events" on public.events;
drop policy if exists "Admins read meetings" on public.meeting_requests;
drop policy if exists "Admins read registrations" on public.event_registrations;
drop policy if exists "Admins manage registrations" on public.event_registrations;

create policy "Public read news" on public.news for select using (published = true);
create policy "Public read events" on public.events for select using (status = 'published');
create policy "Anyone can request meeting" on public.meeting_requests for insert with check (true);
create policy "Admins manage news" on public.news for all using (auth.role() = 'authenticated');
create policy "Admins manage events" on public.events for all using (auth.role() = 'authenticated');
create policy "Admins read meetings" on public.meeting_requests for select using (auth.role() = 'authenticated');
create policy "Admins read registrations" on public.event_registrations for select using (auth.role() = 'authenticated');
create policy "Admins manage registrations" on public.event_registrations for all using (auth.role() = 'authenticated');

-- Registration RPC (atomic)
create or replace function public.register_for_event(
  p_event_id uuid,
  p_full_name text,
  p_email text,
  p_phone text,
  p_seats integer
) returns json
language plpgsql
security definer
as $$
declare
  v_event record;
  v_reserved integer;
  v_code text;
  v_existing integer;
begin
  select * into v_event from public.events where id = p_event_id for update;
  if not found then
    return json_build_object('success', false, 'error', 'Event not found');
  end if;
  if v_event.status <> 'published' then
    return json_build_object('success', false, 'error', 'Registration closed');
  end if;
  if v_event.registration_enabled is false then
    return json_build_object('success', false, 'error', 'Registration disabled');
  end if;
  if v_event.registration_deadline is not null and now() > v_event.registration_deadline then
    return json_build_object('success', false, 'error', 'Registration deadline passed');
  end if;
  if v_event.event_date < current_date then
    return json_build_object('success', false, 'error', 'Event has passed');
  end if;
  if p_seats < 1 or p_seats > v_event.max_seats_per_registration then
    return json_build_object('success', false, 'error', 'Invalid seat count');
  end if;
  -- duplicate check
  select count(*) into v_existing from public.event_registrations
    where event_id = p_event_id and lower(email) = lower(p_email) and status = 'confirmed';
  if v_existing > 0 then
    return json_build_object('success', false, 'error', 'Duplicate registration');
  end if;
  -- capacity check
  if v_event.capacity is not null then
    select coalesce(sum(number_of_seats),0) into v_reserved from public.event_registrations
      where event_id = p_event_id and status = 'confirmed';
    if v_reserved + p_seats > v_event.capacity then
      return json_build_object('success', false, 'error', 'Not enough capacity');
    end if;
  end if;
  -- generate code
  v_code := upper(substring(md5(random()::text) from 1 for 8));
  insert into public.event_registrations (event_id, full_name, email, phone, number_of_seats, confirmation_code, status)
  values (p_event_id, p_full_name, p_email, p_phone, p_seats, v_code, 'confirmed');
  return json_build_object('success', true, 'confirmation_code', v_code);
end;
$$;

alter table public.meeting_requests add column if not exists meeting_type text default 'online';
alter table public.meeting_requests add column if not exists preferred_date date;
alter table public.meeting_requests add column if not exists preferred_time text;
alter table public.meeting_requests add column if not exists status text default 'pending';
