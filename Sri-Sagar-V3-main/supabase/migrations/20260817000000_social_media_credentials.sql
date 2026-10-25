/*
  # Social Media Secure Credentials Storage

  1. New Table `public.social_media_credentials`:
    - Secure server-side credential storage for Facebook Page access tokens
    - `id` (text primary key, e.g. 'facebook')
    - `page_id` (text)
    - `page_name` (text)
    - `access_token` (text, server-side secret accessible only by authorized admins and service role)
    - `token_type` (text DEFAULT 'page_access_token')
    - `expires_at` (timestamptz)
    - `updated_at` (timestamptz NOT NULL DEFAULT now())
    - `updated_by` (uuid REFERENCES auth.users)

  2. New Table `public.oauth_states`:
    - Stores short-lived CSRF state tokens during Meta OAuth authorization flows
    - `state` (text primary key)
    - `user_id` (uuid NOT NULL REFERENCES auth.users)
    - `provider` (text NOT NULL DEFAULT 'facebook')
    - `redirect_uri` (text NOT NULL)
    - `created_at` (timestamptz NOT NULL DEFAULT now())
    - `expires_at` (timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'))

  3. Security & Row Level Security:
    - RLS enabled on both tables
    - Public / Anon access: FORBIDDEN (no anon policies)
    - Authenticated users: Read & write restricted strictly to confirmed administrators via `public.is_admin()`
    - Service-role: Full access for Edge Functions
*/

CREATE TABLE IF NOT EXISTS public.social_media_credentials (
  id text PRIMARY KEY,
  page_id text,
  page_name text,
  access_token text NOT NULL,
  token_type text DEFAULT 'page_access_token',
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.social_media_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage social_media_credentials" ON public.social_media_credentials;
CREATE POLICY "Admins can manage social_media_credentials"
  ON public.social_media_credentials
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.oauth_states (
  state text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'facebook',
  redirect_uri text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes')
);

ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage oauth_states" ON public.oauth_states;
CREATE POLICY "Admins can manage oauth_states"
  ON public.oauth_states
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
