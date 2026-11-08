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

-- NEWS CATEGORIES (admin-managed catalog)
create table if not exists public.news_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
create unique index if not exists news_categories_name_lower_idx on public.news_categories (lower(name));
insert into public.news_categories (name)
select defaults.name
from (values
  ('Actualité'), ('Blog personnel'), ('Tribune & Idées'),
  ('Entrepreneuriat'), ('Rencontre'), ('Fondation & Philanthropie')
) as defaults(name)
where not exists (select 1 from public.news_categories as c where lower(c.name) = lower(defaults.name))
on conflict (name) do nothing;

-- Per-article analytics; country is edge-provided and no IP/raw user agent is stored.
create table if not exists public.news_analytics (
  id uuid primary key default gen_random_uuid(),
  view_id uuid not null unique,
  session_id uuid not null,
  news_id uuid not null references public.news(id) on delete cascade,
  country_code text not null default 'Unknown',
  source text not null default 'Direct',
  device_type text not null default 'Unknown' check (device_type in ('mobile', 'tablet', 'desktop', 'Unknown')),
  engaged_seconds integer not null default 0 check (engaged_seconds between 0 and 86400),
  viewed_at timestamptz not null default now()
);
create index if not exists news_analytics_news_viewed_idx on public.news_analytics (news_id, viewed_at desc);
insert into public.news_categories (name)
select distinct on (lower(btrim(n.category))) btrim(n.category)
from public.news as n
where nullif(btrim(n.category), '') is not null
  and not exists (select 1 from public.news_categories as c where lower(c.name) = lower(btrim(n.category)))
order by lower(btrim(n.category)), btrim(n.category)
on conflict (name) do nothing;

-- BOOKS / PUBLICATIONS
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brief text not null default '',
  category text not null default 'Essai',
  image_url text,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  location text,
  seat_numbers integer[],
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
alter table public.news_categories enable row level security;
alter table public.news_analytics enable row level security;
alter table public.books enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.meeting_requests enable row level security;

-- Policies
drop policy if exists "Public read news" on public.news;
drop policy if exists "Public read news categories" on public.news_categories;
drop policy if exists "Authenticated admins manage news categories" on public.news_categories;
drop policy if exists "Public record news analytics" on public.news_analytics;
drop policy if exists "Authenticated admins read news analytics" on public.news_analytics;
drop policy if exists "Public read published books" on public.books;
drop policy if exists "Public read events" on public.events;
drop policy if exists "Anyone can request meeting" on public.meeting_requests;
drop policy if exists "Admins manage news" on public.news;
drop policy if exists "Admins manage books" on public.books;
drop policy if exists "Admins manage events" on public.events;
drop policy if exists "Admins read meetings" on public.meeting_requests;
drop policy if exists "Admins read registrations" on public.event_registrations;
drop policy if exists "Admins manage registrations" on public.event_registrations;
drop policy if exists "Allow public inserts on event_registrations" on public.event_registrations;
drop policy if exists "Allow public select on event_registrations" on public.event_registrations;

create policy "Public read news" on public.news for select using (published = true);
create policy "Public read news categories" on public.news_categories for select to public using (true);
create policy "Authenticated admins manage news categories" on public.news_categories for all to authenticated using (true) with check (true);
create policy "Public record news analytics" on public.news_analytics for insert to public with check (true);
create policy "Authenticated admins read news analytics" on public.news_analytics for select to authenticated using (true);
grant select on public.news_categories to anon, authenticated;
grant insert, update, delete on public.news_categories to authenticated;
grant insert on public.news_analytics to anon, authenticated;
grant select on public.news_analytics to authenticated;
create policy "Public read published books" on public.books for select using (status = 'published');
grant select on public.books to anon, authenticated;
grant insert, update, delete on public.books to authenticated;
create policy "Public read events" on public.events for select using (status = 'published');
create policy "Anyone can request meeting" on public.meeting_requests for insert with check (true);
create policy "Admins manage news" on public.news for all using (auth.role() = 'authenticated');
create policy "Admins manage books" on public.books for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admins manage events" on public.events for all using (auth.role() = 'authenticated');
create policy "Admins read meetings" on public.meeting_requests for select using (auth.role() = 'authenticated');
create policy "Admins read registrations" on public.event_registrations for select using (auth.role() = 'authenticated');
grant select on public.event_registrations to authenticated;

-- Registration RPC (atomic)
drop function if exists public.register_for_event(uuid, text, text, text, integer);
create or replace function public.register_for_event(
  p_event_id uuid,
  p_full_name text,
  p_email text,
  p_phone text,
  p_location text,
  p_seats integer
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
  v_seats integer[];
  v_code text;
  v_existing integer;
begin
  select * into v_event from public.events where id = p_event_id for update;
  if not found then return json_build_object('success', false, 'error', 'Event not found'); end if;
  if coalesce(v_event.status, 'draft') <> 'published' or coalesce(v_event.registration_enabled, true) is false then
    return json_build_object('success', false, 'error', 'Registration is closed');
  end if;
  if v_event.event_date is not null and v_event.event_date < current_date then
    return json_build_object('success', false, 'error', 'Event has passed');
  end if;
  if v_event.capacity is null or v_event.capacity < 1 then
    return json_build_object('success', false, 'error', 'The organizer has not configured event capacity');
  end if;
  if p_seats < 1 or p_seats > coalesce(v_event.max_seats_per_registration, 1) then
    return json_build_object('success', false, 'error', 'Invalid seat count');
  end if;
  select count(*) into v_existing from public.event_registrations
    where event_id = p_event_id and lower(email) = lower(p_email) and status = 'confirmed';
  if v_existing > 0 then return json_build_object('success', false, 'error', 'This email already has a reservation'); end if;

  select array_agg(available_seat order by available_seat) into v_seats
  from (
      select s.seat_num as available_seat
    from generate_series(1, v_event.capacity) as s(seat_num)
    where not exists (
      select 1 from public.event_registrations as registration
      where registration.event_id = p_event_id and registration.status = 'confirmed'
        and s.seat_num = any(coalesce(registration.seat_numbers, array[]::integer[]))
    )
    order by s.seat_num limit p_seats
  ) as open_seats;
  if coalesce(cardinality(v_seats), 0) < p_seats then
    return json_build_object('success', false, 'error', 'Not enough seats remain');
  end if;

  v_code := 'EVT-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  insert into public.event_registrations
    (event_id, full_name, email, phone, location, number_of_seats, seat_numbers, confirmation_code, status)
  values (p_event_id, p_full_name, p_email, coalesce(nullif(p_phone, ''), ''), nullif(p_location, ''), p_seats, v_seats, v_code, 'confirmed');
  return json_build_object('success', true, 'confirmation_code', v_code, 'seat_numbers', v_seats);
end;
$$;
revoke all on function public.register_for_event(uuid, text, text, text, text, integer) from public;
grant execute on function public.register_for_event(uuid, text, text, text, text, integer) to anon, authenticated;

-- EDITABLE PUBLIC PAGE CONTENT
create table if not exists public.site_page_content (
  page_key text primary key,
  draft_content jsonb not null default '{}'::jsonb,
  published_content jsonb,
  published boolean not null default false,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.site_page_content enable row level security;
drop policy if exists "Public read published page content" on public.site_page_content;
drop policy if exists "Authenticated admins manage page content" on public.site_page_content;
create policy "Public read published page content"
  on public.site_page_content for select to anon, authenticated using (published = true);
create policy "Authenticated admins manage page content"
  on public.site_page_content for all to authenticated using (true) with check (true);
grant select on public.site_page_content to anon, authenticated;
grant insert, update, delete on public.site_page_content to authenticated;

-- Page content image uploads to the media/pages folder
drop policy if exists "Authenticated admins upload page content images" on storage.objects;
create policy "Authenticated admins upload page content images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'pages');

alter table public.meeting_requests add column if not exists meeting_type text default 'online';
alter table public.meeting_requests add column if not exists preferred_date date;
alter table public.meeting_requests add column if not exists preferred_time text;
alter table public.meeting_requests add column if not exists status text default 'pending';
