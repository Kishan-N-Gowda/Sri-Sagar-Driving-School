/*
# Create driving school management data

1. New Tables
- `appointments`: public booking requests with server-generated appointment IDs and admin-managed status.
- `gallery_photos`: published/unpublished gallery metadata linked to Supabase Storage objects.
- `reviews`: owner-managed published review entries.
- `site_settings`: one public business settings row editable by admins.
- `admin_users`: explicit allow-list of Supabase Auth users who may access the admin area.
- `appointment_number_seq`: sequence used to create unique appointment IDs.
2. Security
- All new tables use Row Level Security.
- Anonymous visitors can insert appointments, read published gallery/reviews/settings, and use a narrowly scoped appointment lookup function.
- Only authenticated users listed in `admin_users` can manage private records.
- Storage gallery files are publicly readable but writable/deletable only by admins.
3. Important notes
- Appointment status and IDs are generated or managed server-side.
- The public status lookup returns only the requested appointment's safe display fields.
- Admin access requires a Supabase Auth account to be added to `admin_users` by an operator.
*/

CREATE SEQUENCE IF NOT EXISTS public.appointment_number_seq;

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  course text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Training' CHECK (category IN ('Training', 'Vehicles', 'Students', 'Branches', 'School')),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text NOT NULL,
  review_date date,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  business_name text NOT NULL DEFAULT 'Sri Sagar Driving School',
  phone text NOT NULL DEFAULT '+919019504489',
  whatsapp text NOT NULL DEFAULT '+919019504489',
  address text NOT NULL DEFAULT '1st Floor, Srinika Complex, Bhadrappa Layout Service Road, Bhadrappa Layout, Koti Hosahalli, Bengaluru, Karnataka 560094',
  opening_hours text NOT NULL DEFAULT 'Open daily · 8:30 AM – 7:30 PM',
  instagram_url text,
  facebook_url text,
  google_maps_url text NOT NULL DEFAULT 'https://www.google.com/maps/search/?api=1&query=Sri%20Sagar%20Driving%20School%2C%20Bhadrappa%20Layout%2C%20Bengaluru',
  google_reviews_url text NOT NULL DEFAULT 'https://www.google.com/maps/search/?api=1&query=Sri%20Sagar%20Driving%20School%2C%20Bhadrappa%20Layout%2C%20Bengaluru',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.site_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.set_appointment_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.appointment_id IS NULL OR NEW.appointment_id = '' THEN
    NEW.appointment_id := 'SSDS-' || to_char(COALESCE(NEW.created_at, now()), 'YYYYMMDD') || '-' || lpad(nextval('public.appointment_number_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS appointments_set_id ON public.appointments;
CREATE TRIGGER appointments_set_id BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_appointment_id();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.lookup_appointment(p_appointment_id text DEFAULT NULL, p_phone text DEFAULT NULL)
RETURNS TABLE (appointment_id text, name text, course text, preferred_date date, preferred_time text, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.appointment_id, a.name, a.course, a.preferred_date, a.preferred_time, a.status
  FROM public.appointments a
  WHERE (p_appointment_id IS NOT NULL AND upper(trim(a.appointment_id)) = upper(trim(p_appointment_id)))
     OR (p_phone IS NOT NULL AND regexp_replace(a.phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g'))
  ORDER BY a.created_at DESC
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.lookup_appointment(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.lookup_appointment(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_appointment(
  p_name text,
  p_phone text,
  p_course text,
  p_preferred_date date,
  p_preferred_time text,
  p_email text DEFAULT NULL,
  p_message text DEFAULT NULL
)
RETURNS TABLE (
  appointment_id text,
  name text,
  course text,
  preferred_date date,
  preferred_time text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec record;
BEGIN
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Name is required';
  END IF;
  IF p_phone IS NULL OR trim(p_phone) = '' THEN
    RAISE EXCEPTION 'Phone number is required';
  END IF;
  IF p_course IS NULL OR trim(p_course) = '' THEN
    RAISE EXCEPTION 'Course selection is required';
  END IF;
  IF p_preferred_date IS NULL THEN
    RAISE EXCEPTION 'Preferred date is required';
  END IF;
  IF p_preferred_time IS NULL OR trim(p_preferred_time) = '' THEN
    RAISE EXCEPTION 'Preferred time is required';
  END IF;

  INSERT INTO public.appointments (
    name,
    phone,
    email,
    course,
    preferred_date,
    preferred_time,
    message,
    status
  )
  VALUES (
    trim(p_name),
    trim(p_phone),
    NULLIF(trim(p_email), ''),
    trim(p_course),
    p_preferred_date,
    trim(p_preferred_time),
    NULLIF(trim(p_message), ''),
    'pending'
  )
  RETURNING
    appointments.appointment_id,
    appointments.name,
    appointments.course,
    appointments.preferred_date,
    appointments.preferred_time
  INTO v_rec;

  RETURN QUERY SELECT v_rec.appointment_id, v_rec.name, v_rec.course, v_rec.preferred_date, v_rec.preferred_time;
END;
$$;
REVOKE ALL ON FUNCTION public.create_appointment(text, text, text, date, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_appointment(text, text, text, date, text, text, text) TO anon, authenticated;

DROP POLICY IF EXISTS "public_insert_appointments" ON public.appointments;
CREATE POLICY "public_insert_appointments" ON public.appointments FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
DROP POLICY IF EXISTS "admins_select_appointments" ON public.appointments;
CREATE POLICY "admins_select_appointments" ON public.appointments FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "admins_update_appointments" ON public.appointments;
CREATE POLICY "admins_update_appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admins_delete_appointments" ON public.appointments;
CREATE POLICY "admins_delete_appointments" ON public.appointments FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "public_read_gallery" ON public.gallery_photos;
CREATE POLICY "public_read_gallery" ON public.gallery_photos FOR SELECT TO anon, authenticated USING (published = true OR public.is_admin());
DROP POLICY IF EXISTS "admins_insert_gallery" ON public.gallery_photos;
CREATE POLICY "admins_insert_gallery" ON public.gallery_photos FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admins_update_gallery" ON public.gallery_photos;
CREATE POLICY "admins_update_gallery" ON public.gallery_photos FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admins_delete_gallery" ON public.gallery_photos;
CREATE POLICY "admins_delete_gallery" ON public.gallery_photos FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "public_read_reviews" ON public.reviews;
CREATE POLICY "public_read_reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (published = true OR public.is_admin());
DROP POLICY IF EXISTS "admins_insert_reviews" ON public.reviews;
CREATE POLICY "admins_insert_reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admins_update_reviews" ON public.reviews;
CREATE POLICY "admins_update_reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admins_delete_reviews" ON public.reviews;
CREATE POLICY "admins_delete_reviews" ON public.reviews FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "public_read_settings" ON public.site_settings;
CREATE POLICY "public_read_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admins_update_settings" ON public.site_settings;
CREATE POLICY "admins_update_settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admins_read_admin_users" ON public.admin_users;
CREATE POLICY "admins_read_admin_users" ON public.admin_users FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "public_read_gallery_files" ON storage.objects;
CREATE POLICY "public_read_gallery_files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');
DROP POLICY IF EXISTS "admins_insert_gallery_files" ON storage.objects;
CREATE POLICY "admins_insert_gallery_files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
DROP POLICY IF EXISTS "admins_update_gallery_files" ON storage.objects;
CREATE POLICY "admins_update_gallery_files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.is_admin()) WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
DROP POLICY IF EXISTS "admins_delete_gallery_files" ON storage.objects;
CREATE POLICY "admins_delete_gallery_files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.is_admin());

CREATE INDEX IF NOT EXISTS appointments_date_status_idx ON public.appointments (preferred_date, status);
CREATE INDEX IF NOT EXISTS appointments_phone_idx ON public.appointments (phone);
CREATE INDEX IF NOT EXISTS gallery_published_created_idx ON public.gallery_photos (published, created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_published_featured_idx ON public.reviews (published, featured);
