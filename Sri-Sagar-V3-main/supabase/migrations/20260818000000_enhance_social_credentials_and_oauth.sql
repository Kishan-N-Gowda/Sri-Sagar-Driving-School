-- Migration: Ensure platform column and unique constraint for reliable Facebook credential upserts
-- Also add app_origin and platform columns to oauth_states for secure postMessage origin handling

ALTER TABLE public.social_media_credentials
  ADD COLUMN IF NOT EXISTS platform text,
  ADD COLUMN IF NOT EXISTS account_id text,
  ADD COLUMN IF NOT EXISTS account_name text;

-- Ensure existing records have platform populated
UPDATE public.social_media_credentials
SET platform = 'facebook'
WHERE id = 'facebook' AND (platform IS NULL OR platform = '');

-- Create unique constraint/index on platform to allow ON CONFLICT (platform)
CREATE UNIQUE INDEX IF NOT EXISTS social_media_credentials_platform_key 
  ON public.social_media_credentials(platform);

-- Add support for app_origin and platform tracking in oauth_states
ALTER TABLE public.oauth_states
  ADD COLUMN IF NOT EXISTS platform text,
  ADD COLUMN IF NOT EXISTS app_origin text;
