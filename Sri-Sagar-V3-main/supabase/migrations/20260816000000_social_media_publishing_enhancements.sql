/*
  # Social Media Publishing Enhancements
  
  1. New Table `public.social_media_posts`:
    - Tracks complete historical publishing records for every attempt
    - `id` (uuid primary key)
    - `gallery_photo_id` (uuid foreign key to gallery_photos)
    - `caption` (text)
    - `instagram_status` (text: 'pending', 'publishing', 'published', 'failed')
    - `facebook_status` (text: 'pending', 'publishing', 'published', 'failed')
    - `instagram_media_id` (text)
    - `facebook_post_id` (text)
    - `instagram_error` (text)
    - `facebook_error` (text)
    - `published_at` (timestamptz)
    - `instagram_published_at` (timestamptz)
    - `facebook_published_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Site Settings additions:
    - `social_auto_publish` (boolean, default false)
    - `social_auto_publish_instagram` (boolean, default true)
    - `social_auto_publish_facebook` (boolean, default true)

  3. Security & RLS:
    - RLS enabled on `social_media_posts`
    - Admins only can insert, update, select, and delete
*/

CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_photo_id uuid REFERENCES public.gallery_photos(id) ON DELETE CASCADE,
  caption text,
  instagram_status text CHECK (instagram_status IN ('pending', 'publishing', 'published', 'failed')),
  facebook_status text CHECK (facebook_status IN ('pending', 'publishing', 'published', 'failed')),
  instagram_media_id text,
  facebook_post_id text,
  instagram_error text,
  facebook_error text,
  published_at timestamptz,
  instagram_published_at timestamptz,
  facebook_published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage social_media_posts" ON public.social_media_posts;
CREATE POLICY "Admins can manage social_media_posts"
  ON public.social_media_posts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS social_media_posts_photo_idx ON public.social_media_posts(gallery_photo_id);
CREATE INDEX IF NOT EXISTS social_media_posts_created_idx ON public.social_media_posts(created_at DESC);

-- Add auto-publish settings to site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS social_auto_publish boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_auto_publish_instagram boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS social_auto_publish_facebook boolean NOT NULL DEFAULT true;
