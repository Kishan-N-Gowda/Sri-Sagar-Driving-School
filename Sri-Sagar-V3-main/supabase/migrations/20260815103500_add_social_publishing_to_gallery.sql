/*
  # Add Social Publishing fields to gallery_photos

  1. New Columns on `gallery_photos`:
    - `caption` (text) - Custom social media caption
    - `instagram_status` (text) - 'pending', 'publishing', 'published', 'failed'
    - `instagram_post_id` (text) - Meta Instagram post ID
    - `instagram_error` (text) - Readable error if Instagram publishing failed
    - `instagram_published_at` (timestamptz) - Timestamp when published to Instagram
    - `facebook_status` (text) - 'pending', 'publishing', 'published', 'failed'
    - `facebook_post_id` (text) - Meta Facebook Page post / photo ID
    - `facebook_error` (text) - Readable error if Facebook publishing failed
    - `facebook_published_at` (timestamptz) - Timestamp when published to Facebook

  2. Security:
    - Retains RLS policies: only authorized admins can insert, update, or delete gallery photos.
    - Public visitors can view published photos.
*/

ALTER TABLE public.gallery_photos 
ADD COLUMN IF NOT EXISTS caption text,
ADD COLUMN IF NOT EXISTS instagram_status text CHECK (instagram_status IN ('pending', 'publishing', 'published', 'failed')),
ADD COLUMN IF NOT EXISTS instagram_post_id text,
ADD COLUMN IF NOT EXISTS instagram_error text,
ADD COLUMN IF NOT EXISTS instagram_published_at timestamptz,
ADD COLUMN IF NOT EXISTS facebook_status text CHECK (facebook_status IN ('pending', 'publishing', 'published', 'failed')),
ADD COLUMN IF NOT EXISTS facebook_post_id text,
ADD COLUMN IF NOT EXISTS facebook_error text,
ADD COLUMN IF NOT EXISTS facebook_published_at timestamptz;

CREATE INDEX IF NOT EXISTS gallery_social_status_idx ON public.gallery_photos (instagram_status, facebook_status);
