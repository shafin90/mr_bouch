-- Migration SQL pour aligner la base de données Supabase
-- Exécutez ce script dans l'éditeur SQL de votre Dashboard Supabase si vous souhaitez étendre les colonnes.

-- 1. Actualités (News) : Ajout de la colonne contenu riche
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS content text;

-- 2. Demandes de rendez-vous (Meeting Requests) :
ALTER TABLE public.meeting_requests ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.meeting_requests ADD COLUMN IF NOT EXISTS preferred_date date;
ALTER TABLE public.meeting_requests ADD COLUMN IF NOT EXISTS preferred_time text;
ALTER TABLE public.meeting_requests ADD COLUMN IF NOT EXISTS meeting_type text DEFAULT 'online';

-- 3. Événements (Events) :
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_date date;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_enabled boolean DEFAULT true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS capacity integer;

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

-- RLS policies permissives pour dev
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on event_registrations"
  ON public.event_registrations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public select on event_registrations"
  ON public.event_registrations
  FOR SELECT
  TO public
  USING (true);
