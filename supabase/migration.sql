-- Migration SQL pour aligner la base de données Supabase
-- Exécutez ce script dans l'éditeur SQL de votre Dashboard Supabase si vous souhaitez étendre les colonnes.

-- 1. Actualités (News) : Ajout de la colonne contenu riche
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read news" ON public.news;
CREATE POLICY "Public read news" ON public.news
  FOR SELECT TO anon, authenticated USING (published = true);
GRANT SELECT ON public.news TO anon, authenticated;
NOTIFY pgrst, 'reload schema';

-- 1b. Catégories d'actualités gérées depuis l'administration
CREATE TABLE IF NOT EXISTS public.news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS news_categories_name_lower_idx ON public.news_categories (lower(name));
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read news categories" ON public.news_categories;
DROP POLICY IF EXISTS "Authenticated admins manage news categories" ON public.news_categories;
CREATE POLICY "Public read news categories" ON public.news_categories FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated admins manage news categories" ON public.news_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT SELECT ON public.news_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news_categories TO authenticated;
INSERT INTO public.news_categories (name)
SELECT defaults.name
FROM (VALUES
  ('Actualité'), ('Blog personnel'), ('Tribune & Idées'),
  ('Entrepreneuriat'), ('Rencontre'), ('Fondation & Philanthropie')
) AS defaults(name)
WHERE NOT EXISTS (SELECT 1 FROM public.news_categories AS c WHERE lower(c.name) = lower(defaults.name))
ON CONFLICT (name) DO NOTHING;
INSERT INTO public.news_categories (name)
SELECT DISTINCT ON (lower(btrim(n.category))) btrim(n.category)
FROM public.news AS n
WHERE nullif(btrim(n.category), '') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.news_categories AS c WHERE lower(c.name) = lower(btrim(n.category)))
ORDER BY lower(btrim(n.category)), btrim(n.category)
ON CONFLICT (name) DO NOTHING;

-- 1c. Privacy-conscious per-article analytics (no IP address or raw user agent stored)
CREATE TABLE IF NOT EXISTS public.news_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  view_id uuid NOT NULL UNIQUE,
  session_id uuid NOT NULL,
  news_id uuid NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  country_code text NOT NULL DEFAULT 'Unknown',
  source text NOT NULL DEFAULT 'Direct',
  device_type text NOT NULL DEFAULT 'Unknown' CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'Unknown')),
  engaged_seconds integer NOT NULL DEFAULT 0 CHECK (engaged_seconds BETWEEN 0 AND 86400),
  viewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS news_analytics_news_viewed_idx ON public.news_analytics (news_id, viewed_at DESC);
ALTER TABLE public.news_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public record news analytics" ON public.news_analytics;
DROP POLICY IF EXISTS "Authenticated admins read news analytics" ON public.news_analytics;
CREATE POLICY "Public record news analytics" ON public.news_analytics FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Authenticated admins read news analytics" ON public.news_analytics FOR SELECT TO authenticated USING (true);
GRANT INSERT ON public.news_analytics TO anon, authenticated;
GRANT SELECT ON public.news_analytics TO authenticated;

-- Event cover uploads to the media/events folder
DROP POLICY IF EXISTS "Authenticated admins upload event covers" ON storage.objects;
CREATE POLICY "Authenticated admins upload event covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'events');

-- Page content image uploads to the media/pages folder
DROP POLICY IF EXISTS "Authenticated admins upload page content images" ON storage.objects;
CREATE POLICY "Authenticated admins upload page content images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'pages');

-- 2. Demandes de rendez-vous (Meeting Requests) :
ALTER TABLE public.meeting_requests ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.meeting_requests ADD COLUMN IF NOT EXISTS preferred_date date;
ALTER TABLE public.meeting_requests ADD COLUMN IF NOT EXISTS preferred_time text;
ALTER TABLE public.meeting_requests ADD COLUMN IF NOT EXISTS meeting_type text DEFAULT 'online';

-- 3. Événements (Events) :
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_date date;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS date date;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS time text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_enabled boolean DEFAULT true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS capacity integer;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_seats_per_registration integer DEFAULT 1;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_deadline timestamptz;
UPDATE public.events SET date = coalesce(date, event_date) WHERE date IS NULL;
UPDATE public.events SET location = coalesce(location, venue) WHERE location IS NULL;
UPDATE public.events SET image_url = coalesce(image_url, cover_image) WHERE image_url IS NULL;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events
  FOR SELECT TO anon, authenticated USING (status = 'published');
GRANT SELECT ON public.events TO anon, authenticated;

-- 4. Inscriptions aux événements :
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  number_of_seats integer DEFAULT 1,
  confirmation_code text,
  status text DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS seat_numbers integer[];

-- Bring older event bookings forward from the temporary meeting_requests fallback.
WITH legacy AS (
  SELECT DISTINCT ON (code)
    id,
    name,
    email,
    coalesce(nullif(substring(message FROM 'Téléphone: (.+) - Places:'), 'Non renseigné'), '') AS phone,
    coalesce(nullif(substring(message FROM 'Places: ([0-9]+)'), '')::integer, 1) AS seats,
    code,
    event_id::uuid AS event_id,
    created_at
  FROM (
    SELECT *,
      substring(message FROM 'Code Réservation: ([A-Z0-9-]+)') AS code,
      substring(message FROM 'Événement ID: ([0-9a-fA-F-]{36})') AS event_id
    FROM public.meeting_requests
    WHERE message LIKE '%Événement ID:%'
  ) AS parsed
  WHERE code IS NOT NULL AND event_id IS NOT NULL
  ORDER BY code, created_at
)
INSERT INTO public.event_registrations
  (event_id, full_name, email, phone, number_of_seats, confirmation_code, status, location, created_at)
SELECT event_id, name, email, phone, seats, code, 'confirmed', NULL, created_at
FROM legacy
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_registrations AS existing
  WHERE existing.confirmation_code = legacy.code
);

-- Assign deterministic seat numbers to existing registrations that have no seat map yet.
WITH numbered AS (
  SELECT id, event_id, greatest(coalesce(number_of_seats, 1), 1) AS seat_count,
    coalesce(sum(greatest(coalesce(number_of_seats, 1), 1)) OVER (
      PARTITION BY event_id ORDER BY created_at, id
      ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
    ), 0) AS seat_offset
  FROM public.event_registrations
  WHERE status = 'confirmed' AND seat_numbers IS NULL
)
UPDATE public.event_registrations AS registration
SET seat_numbers = ARRAY(
  SELECT generate_series(numbered.seat_offset + 1, numbered.seat_offset + numbered.seat_count)
)
FROM numbered
WHERE registration.id = numbered.id;

-- 5. Books / publications catalog
CREATE TABLE IF NOT EXISTS public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  brief text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Essai',
  image_url text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published books" ON public.books;
DROP POLICY IF EXISTS "Admins manage books" ON public.books;
CREATE POLICY "Public read published books" ON public.books FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage books" ON public.books FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
GRANT SELECT ON public.books TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.books TO authenticated;

-- RLS policies permissives pour dev
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public inserts on event_registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Allow public select on event_registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins read registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins manage registrations" ON public.event_registrations;
CREATE POLICY "Admins read registrations"
  ON public.event_registrations FOR SELECT TO authenticated USING (true);
GRANT SELECT ON public.event_registrations TO authenticated;

-- Atomic seat allocation keeps concurrent bookings from taking the same seat.
DROP FUNCTION IF EXISTS public.register_for_event(uuid, text, text, text, integer);
CREATE OR REPLACE FUNCTION public.register_for_event(
  p_event_id uuid,
  p_full_name text,
  p_email text,
  p_phone text,
  p_location text,
  p_seats integer
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.events%ROWTYPE;
  v_seats integer[];
  v_code text;
  v_existing integer;
BEGIN
  SELECT * INTO v_event FROM public.events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Event not found'); END IF;
  IF coalesce(v_event.status, 'draft') <> 'published' OR coalesce(v_event.registration_enabled, true) IS FALSE THEN
    RETURN json_build_object('success', false, 'error', 'Registration is closed');
  END IF;
  IF v_event.event_date IS NOT NULL AND v_event.event_date < current_date THEN
    RETURN json_build_object('success', false, 'error', 'Event has passed');
  END IF;
  IF v_event.capacity IS NULL OR v_event.capacity < 1 THEN
    RETURN json_build_object('success', false, 'error', 'The organizer has not configured event capacity');
  END IF;
  IF p_seats < 1 OR p_seats > coalesce(v_event.max_seats_per_registration, 1) THEN
    RETURN json_build_object('success', false, 'error', 'Invalid seat count');
  END IF;

  SELECT count(*) INTO v_existing FROM public.event_registrations
    WHERE event_id = p_event_id AND lower(email) = lower(p_email) AND status = 'confirmed';
  IF v_existing > 0 THEN RETURN json_build_object('success', false, 'error', 'This email already has a reservation'); END IF;

  SELECT array_agg(available_seat ORDER BY available_seat) INTO v_seats
  FROM (
    SELECT s.seat_num AS available_seat
    FROM generate_series(1, v_event.capacity) AS s(seat_num)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.event_registrations AS registration
      WHERE registration.event_id = p_event_id
        AND registration.status = 'confirmed'
        AND s.seat_num = ANY(coalesce(registration.seat_numbers, ARRAY[]::integer[]))
    )
    ORDER BY s.seat_num
    LIMIT p_seats
  ) AS open_seats;
  IF coalesce(cardinality(v_seats), 0) < p_seats THEN
    RETURN json_build_object('success', false, 'error', 'Not enough seats remain');
  END IF;

  v_code := 'EVT-' || upper(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 8));
  INSERT INTO public.event_registrations
    (event_id, full_name, email, phone, location, number_of_seats, seat_numbers, confirmation_code, status)
  VALUES
    (p_event_id, p_full_name, p_email, coalesce(nullif(p_phone, ''), ''), nullif(p_location, ''), p_seats, v_seats, v_code, 'confirmed');

  RETURN json_build_object('success', true, 'confirmation_code', v_code, 'seat_numbers', v_seats);
END;
$$;
REVOKE ALL ON FUNCTION public.register_for_event(uuid, text, text, text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_for_event(uuid, text, text, text, text, integer) TO anon, authenticated;

-- 6. Editable public page copy (drafts stay private until published)
CREATE TABLE IF NOT EXISTS public.site_page_content (
  page_key text PRIMARY KEY,
  draft_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_content jsonb,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_page_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published page content" ON public.site_page_content;
DROP POLICY IF EXISTS "Authenticated admins manage page content" ON public.site_page_content;
CREATE POLICY "Public read published page content"
  ON public.site_page_content FOR SELECT TO anon, authenticated
  USING (published = true);
CREATE POLICY "Authenticated admins manage page content"
  ON public.site_page_content FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
GRANT SELECT ON public.site_page_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_page_content TO authenticated;
NOTIFY pgrst, 'reload schema';
