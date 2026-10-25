// Supabase Edge Function: facebook-auth
// Handles secure Meta OAuth 2.0 flow for Facebook Page and
// Instagram Professional account reconnection.
//
// POST:
//   - get_auth_url
//   - get_instagram_auth_url
//   - test_connection
//
// GET:
//   - Meta OAuth callback
//
// IMPORTANT:
// The OAuth callback does NOT redirect an OAuth popup to /admin.
// When opened by the Admin Panel, it sends the result back to the
// parent window using postMessage and closes itself.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const META_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
].join(',');

const INSTAGRAM_BUSINESS_SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_messages',
  'instagram_business_manage_comments',
  'instagram_business_content_publish',
  'instagram_business_manage_insights',
].join(',');

const DEFAULT_TARGET_PAGE_NAME = 'Sri Sagar Driving School';

interface OAuthPayload {
  pageName?: string;
  pageId?: string;
  username?: string;
  error?: string;
  platform?: string;
}

function sanitizeError(error: unknown): string {
  if (!error) return 'Unknown error';

  let message =
    typeof error === 'string'
      ? error
      : (error as { message?: string }).message ||
        JSON.stringify(error);

  // Never expose access tokens or secrets.
  message = message.replace(
    /access_token=[a-zA-Z0-9._-]+/gi,
    'access_token=[REDACTED]',
  );

  message = message.replace(
    /EA[A-Za-z0-9._-]+/g,
    '[REDACTED_TOKEN]',
  );

  message = message.replace(
    /client_secret=[a-zA-Z0-9._-]+/gi,
    'client_secret=[REDACTED]',
  );

  message = message.replace(
    /bearer\s+[a-zA-Z0-9._-]+/gi,
    'Bearer [REDACTED]',
  );

  return message.slice(0, 500);
}

function validateAppOrigin(targetOrigin: string): string {
  const configuredOrigin = (
    Deno.env.get('APP_ORIGIN') ||
    Deno.env.get('FRONTEND_URL') ||
    'https://srisagardrivingschool.vercel.app'
  ).replace(/\/+$/, '');

  if (
    !targetOrigin ||
    targetOrigin === '*' ||
    targetOrigin === 'null' ||
    targetOrigin === 'undefined'
  ) {
    return configuredOrigin;
  }

  try {
    const parsed = new URL(targetOrigin.trim());
    const origin = parsed.origin;
    const hostname = parsed.hostname.toLowerCase();

    // Local development.
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    ) {
      return origin;
    }

    // Google AI Studio / Cloud Run.
    if (hostname.endsWith('.run.app')) {
      return origin;
    }

    // Vercel.
    if (hostname.endsWith('.vercel.app')) {
      return origin;
    }

    // Configured production hostname.
    try {
      const configured = new URL(
        configuredOrigin.startsWith('http')
          ? configuredOrigin
          : `https://${configuredOrigin}`,
      );

      if (
        hostname === configured.hostname.toLowerCase()
      ) {
        return origin;
      }
    } catch {
      // Ignore invalid configured origin.
    }
  } catch {
    // Ignore invalid requested origin.
  }

  return configuredOrigin;
}

/**
 * OAuth callback response.
 *
 * If this function was opened by the Admin Panel:
 *
 *   Meta
 *     ↓
 *   Supabase callback
 *     ↓
 *   postMessage()
 *     ↓
 *   close popup
 *
 * It NEVER navigates that popup to /admin.
 *
 * If somebody opens the callback directly without an opener,
 * then /admin?fb_connected=true or /admin?ig_connected=true
 * is used as a fallback.
 */
function buildRedirectResponse(
  success: boolean,
  targetOrigin: string,
  payload: OAuthPayload = {},
): Response {
  const baseOrigin = validateAppOrigin(targetOrigin);

  const isInstagram =
    payload.platform === 'instagram';

  const params = new URLSearchParams();

  if (success) {
    if (isInstagram) {
      params.set('ig_connected', 'true');

      if (payload.username) {
        params.set('ig_username', payload.username);
      }

      if (payload.pageId) {
        params.set('ig_id', payload.pageId);
      }

      params.set('platform', 'instagram');
    } else {
      params.set('fb_connected', 'true');

      if (payload.pageName) {
        params.set('page_name', payload.pageName);
      }

      if (payload.pageId) {
        params.set('page_id', payload.pageId);
      }

      params.set('platform', 'facebook');
    }
  } else {
    if (isInstagram) {
      params.set(
        'ig_error',
        payload.error || 'Instagram authentication failed',
      );

      params.set('platform', 'instagram');
    } else {
      params.set(
        'fb_error',
        payload.error || 'Facebook authentication failed',
      );

      params.set('platform', 'facebook');
    }
  }

  const callbackUrl =
    `${baseOrigin}/oauth/callback?${params.toString()}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: callbackUrl,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
Deno.serve(async (req: Request) => {
  // -------------------------------------------------------------
  // 1. CORS
  // -------------------------------------------------------------

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);

    const supabaseUrl =
      Deno.env.get('SUPABASE_URL') || '';

    const supabaseAnonKey =
      Deno.env.get('SUPABASE_ANON_KEY') || '';

    const supabaseServiceRoleKey =
      Deno.env.get(
        'SUPABASE_SERVICE_ROLE_KEY',
      ) || '';

    if (
      !supabaseUrl ||
      !supabaseServiceRoleKey
    ) {
      return new Response(
        JSON.stringify({
          error:
            'Supabase server environment variables are not configured.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        supabaseServiceRoleKey,
      );

    const metaAppId =
      Deno.env.get('META_APP_ID') ||
      Deno.env.get('FACEBOOK_APP_ID') ||
      '';

    const metaAppSecret =
      Deno.env.get('META_APP_SECRET') ||
      Deno.env.get('FACEBOOK_APP_SECRET') ||
      '';

    const instagramAppId =
      Deno.env.get('INSTAGRAM_APP_ID') ||
      '39991020200546069';

    const instagramAppSecret =
      Deno.env.get('INSTAGRAM_APP_SECRET') ||
      Deno.env.get('META_APP_SECRET') ||
      '';

    const metaApiVersion =
      Deno.env.get('META_API_VERSION') ||
      'v19.0';

    const configuredPageId =
      Deno.env.get('FACEBOOK_PAGE_ID') ||
      Deno.env.get('META_PAGE_ID') ||
      '';

    const defaultRedirectUri =
      `${supabaseUrl}/functions/v1/facebook-auth/callback`;

    // -------------------------------------------------------------
    // 2. POST
    // -------------------------------------------------------------

    if (req.method === 'POST') {
      const authHeader =
        req.headers.get('Authorization') || '';

      const token = authHeader
        .replace(/^Bearer\s+/i, '')
        .trim();

      if (!token) {
        return new Response(
          JSON.stringify({
            error:
              'Unauthorized: missing authorization header.',
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              'Content-Type':
                'application/json',
            },
          },
        );
      }

      // Validate Supabase session.
      const supabaseAuth =
        createClient(
          supabaseUrl,
          supabaseAnonKey,
          {
            global: {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          },
        );

      const {
        data: { user },
        error: userError,
      } =
        await supabaseAuth.auth.getUser(
          token,
        );

      if (userError || !user) {
        return new Response(
          JSON.stringify({
            error:
              `Unauthorized: ${
                userError?.message ||
                'Invalid or expired session.'
              }`,
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              'Content-Type':
                'application/json',
            },
          },
        );
      }

      // Verify admin.
      const {
        data: adminUser,
        error: adminError,
      } = await supabaseAdmin
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminError || !adminUser) {
        return new Response(
          JSON.stringify({
            error:
              'Forbidden: Current user is not an administrator.',
          }),
          {
            status: 403,
            headers: {
              ...corsHeaders,
              'Content-Type':
                'application/json',
            },
          },
        );
      }

      const body =
        await req.json().catch(
          () => ({}),
        );

      const action =
        body.action || 'get_auth_url';

      // -----------------------------------------------------------
      // 2A. START FACEBOOK / INSTAGRAM OAUTH
      // -----------------------------------------------------------

      if (
        action === 'get_auth_url' ||
        action === 'start' ||
        action === 'start_oauth' ||
        action === 'get_instagram_auth_url'
      ) {
        const isInstagram =
          body.platform === 'instagram' ||
          action ===
            'get_instagram_auth_url';

        if (isInstagram) {
          if (!instagramAppId) {
            return new Response(
              JSON.stringify({
                error:
                  'Instagram App ID is not configured.',
              }),
              {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type':
                    'application/json',
                },
              },
            );
          }
        } else {
          if (!metaAppId) {
            return new Response(
              JSON.stringify({
                error:
                  'META_APP_ID is not configured in Supabase Edge Function Secrets.',
              }),
              {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type':
                    'application/json',
                },
              },
            );
          }
        }

        // Secure CSRF state.
        const state =
          crypto.randomUUID();

        const redirectUri =
          defaultRedirectUri;

        // Determine frontend origin.
        const rawAppOrigin =
          body.app_origin ||
          body.appOrigin ||
          body.origin ||
          req.headers.get('origin') ||
          req.headers.get('referer') ||
          '';

        let cleanAppOrigin = '';

        if (rawAppOrigin) {
          try {
            cleanAppOrigin = new URL(rawAppOrigin).origin;
          } catch {
            cleanAppOrigin = '';
          }
        }

        if (!cleanAppOrigin) {
          cleanAppOrigin =
            Deno.env.get('APP_ORIGIN') ||
            Deno.env.get('FRONTEND_URL') ||
            'https://srisagardrivingschool.vercel.app';
        }

        // Store OAuth state.
        const stateRecord = {
          state,
          platform: isInstagram
            ? 'instagram'
            : 'facebook',
          app_origin:
            cleanAppOrigin,
          expires_at:
            new Date(
              Date.now() +
                15 * 60 * 1000,
            ).toISOString(),
        };

        const {
          error: stateInsertError,
        } = await supabaseAdmin
          .from('oauth_states')
          .insert(
            stateRecord,
          );

        if (stateInsertError) {
          return new Response(
            JSON.stringify({
              error:
                `Failed to create OAuth session state: ${stateInsertError.message}`,
            }),
            {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type':
                  'application/json',
              },
            },
          );
        }

        // Build OAuth URL.
        let authUrl: URL;

        if (isInstagram) {
          authUrl = new URL('https://www.instagram.com/oauth/authorize');
          authUrl.searchParams.set('force_reauth', 'true');
          authUrl.searchParams.set('client_id', instagramAppId);
          authUrl.searchParams.set('redirect_uri', redirectUri);
          authUrl.searchParams.set('response_type', 'code');
          authUrl.searchParams.set('scope', INSTAGRAM_BUSINESS_SCOPES);
          authUrl.searchParams.set('state', state);
        } else {
          authUrl =
            new URL(
              `https://www.facebook.com/${metaApiVersion}/dialog/oauth`,
            );

          authUrl.searchParams.set(
            'client_id',
            metaAppId,
          );

          authUrl.searchParams.set(
            'redirect_uri',
            redirectUri,
          );

          authUrl.searchParams.set(
            'state',
            state,
          );

          authUrl.searchParams.set(
            'scope',
            META_SCOPES,
          );

          authUrl.searchParams.set(
            'response_type',
            'code',
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            auth_url:
              authUrl.toString(),
            authUrl:
              authUrl.toString(),
            state,
            redirect_uri:
              redirectUri,
            targetPageName:
              DEFAULT_TARGET_PAGE_NAME,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type':
                'application/json',
            },
          },
        );
      }

      // -----------------------------------------------------------
      // 2B. TEST FACEBOOK CONNECTION
      // -----------------------------------------------------------

      if (
        action === 'get_status' ||
        action === 'test_connection'
      ) {
        const {
          data: dbCreds,
          error: dbCredsError,
        } = await supabaseAdmin
          .from(
            'social_media_credentials',
          )
          .select('*')
          .eq(
            'platform',
            'facebook',
          )
          .order(
            'updated_at',
            {
              ascending: false,
            },
          )
          .limit(1)
          .maybeSingle();

        return new Response(
          JSON.stringify({
            success: true,
            credential:
              dbCreds || null,
            connected:
              Boolean(
                dbCreds?.access_token,
              ),
            pageName:
              dbCreds?.page_name ||
              dbCreds?.account_name ||
              DEFAULT_TARGET_PAGE_NAME,
            error:
              dbCredsError?.message ||
              null,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type':
                'application/json',
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          error:
            `Unknown action: ${action}`,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    // -------------------------------------------------------------
    // 3. GET — META OAUTH CALLBACK
    // -------------------------------------------------------------

    if (req.method === 'GET') {
      const code =
        url.searchParams.get(
          'code',
        );

      const state =
        url.searchParams.get(
          'state',
        );

      const metaError =
        url.searchParams.get(
          'error',
        );

      const metaErrorDesc =
        url.searchParams.get(
          'error_description',
        ) ||
        url.searchParams.get(
          'error_message',
        ) ||
        metaError;

      let determinedAppOrigin =
        Deno.env.get(
          'APP_ORIGIN',
        ) ||
        Deno.env.get(
          'FRONTEND_URL',
        ) ||
        'https://srisagardrivingschool.vercel.app';

      // -----------------------------------------------------------
      // Meta denied/cancelled authorization.
      // -----------------------------------------------------------

      if (metaError || !code) {
        const errorMessage =
          metaErrorDesc ||
          'Meta authorization was cancelled or denied by the user.';

        return buildRedirectResponse(
          false,
          determinedAppOrigin,
          {
            error: sanitizeError(
              errorMessage,
            ),
          },
        );
      }

      if (!state) {
        return buildRedirectResponse(
          false,
          determinedAppOrigin,
          {
            error:
              'Missing OAuth state parameter.',
          },
        );
      }

      try {
        // ---------------------------------------------------------
        // 3A. Validate OAuth state.
        // ---------------------------------------------------------

        const {
          data: stateRecord,
          error: stateError,
        } = await supabaseAdmin
          .from('oauth_states')
          .select('*')
          .eq('state', state)
          .maybeSingle();

        if (
          stateError ||
          !stateRecord
        ) {
          return buildRedirectResponse(
            false,
            determinedAppOrigin,
            {
              error:
                'The authorization session has expired or is invalid. Please try reconnecting again from the Admin Panel.',
            },
          );
        }

        if (stateRecord.app_origin) {
          determinedAppOrigin =
            validateAppOrigin(
              stateRecord.app_origin,
            );
        }

        // Check expiration.
        if (
          stateRecord.expires_at &&
          new Date(
            stateRecord.expires_at,
          ).getTime() <
            Date.now()
        ) {
          await supabaseAdmin
            .from('oauth_states')
            .delete()
            .eq(
              'state',
              state,
            );

          return buildRedirectResponse(
            false,
            determinedAppOrigin,
            {
              error:
                'The authorization session has expired. Please reconnect again.',
            },
          );
        }

        const isInstagram =
          stateRecord.platform ===
          'instagram';

        // =========================================================
        // 4. INSTAGRAM BUSINESS LOGIN CALLBACK
        // =========================================================

        if (isInstagram) {
          if (!instagramAppSecret) {
            return buildRedirectResponse(
              false,
              determinedAppOrigin,
              {
                platform: 'instagram',
                error:
                  'INSTAGRAM_APP_SECRET (or META_APP_SECRET) is not configured in Supabase Edge Function Secrets.',
              },
            );
          }

          const redirectUri =
            defaultRedirectUri;

          // 1. Exchange authorization code for Instagram access token
          const tokenFormData =
            new URLSearchParams();
          tokenFormData.set(
            'client_id',
            instagramAppId,
          );
          tokenFormData.set(
            'client_secret',
            instagramAppSecret,
          );
          tokenFormData.set(
            'grant_type',
            'authorization_code',
          );
          tokenFormData.set(
            'redirect_uri',
            redirectUri,
          );
          tokenFormData.set(
            'code',
            code,
          );

          let tokenRes =
            await fetch(
              'https://api.instagram.com/oauth/access_token',
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/x-www-form-urlencoded',
                },
                body: tokenFormData.toString(),
              },
            );

          let tokenData =
            await tokenRes.json();

          // Fallback if dynamic redirect URI differed
          if (
            !tokenRes.ok ||
            tokenData.error_message ||
            tokenData.error_type ||
            !tokenData.access_token
          ) {
            const callbackUrl =
              new URL(req.url);
            callbackUrl.search = '';
            const dynamicRedirectUri =
              callbackUrl.toString();

            if (
              dynamicRedirectUri !==
              redirectUri
            ) {
              const fallbackFormData =
                new URLSearchParams();
              fallbackFormData.set(
                'client_id',
                instagramAppId,
              );
              fallbackFormData.set(
                'client_secret',
                instagramAppSecret,
              );
              fallbackFormData.set(
                'grant_type',
                'authorization_code',
              );
              fallbackFormData.set(
                'redirect_uri',
                dynamicRedirectUri,
              );
              fallbackFormData.set(
                'code',
                code,
              );

              const fallbackRes =
                await fetch(
                  'https://api.instagram.com/oauth/access_token',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type':
                        'application/x-www-form-urlencoded',
                    },
                    body: fallbackFormData.toString(),
                  },
                );

              const fallbackData =
                await fallbackRes.json();

              if (
                fallbackRes.ok &&
                fallbackData.access_token
              ) {
                tokenRes =
                  fallbackRes;
                tokenData =
                  fallbackData;
              }
            }
          }

          if (
            !tokenRes.ok ||
            tokenData.error_message ||
            tokenData.error_type ||
            !tokenData.access_token
          ) {
            const rawErr =
              tokenData.error_message ||
              tokenData.error?.message ||
              tokenData.error_type ||
              'Failed to exchange Instagram authorization code for access token.';
            throw new Error(rawErr);
          }

          const shortLivedToken =
            tokenData.access_token;
          const rawUserId =
            String(
              tokenData.user_id ||
                '',
            );

          // 2. Exchange short-lived token for long-lived Instagram token (60 days)
          let igAccessToken =
            shortLivedToken;

          try {
            const longLivedUrl =
              `https://graph.instagram.com/access_token` +
              `?grant_type=ig_exchange_token` +
              `&client_secret=${encodeURIComponent(instagramAppSecret)}` +
              `&access_token=${encodeURIComponent(shortLivedToken)}`;

            const longLivedRes =
              await fetch(
                longLivedUrl,
              );
            const longLivedData =
              await longLivedRes.json();

            if (
              longLivedRes.ok &&
              longLivedData.access_token
            ) {
              igAccessToken =
                longLivedData.access_token;
            }
          } catch (llErr) {
            console.warn(
              '[facebook-auth] Could not exchange for long-lived Instagram token:',
              llErr,
            );
          }

          // 3. Fetch Instagram user info for username and account ID
          let igAccountId =
            rawUserId;
          let igUsername =
            'srisagardrivingschool';

          try {
            const profileUrl =
              `https://graph.instagram.com/v21.0/me` +
              `?fields=id,username,name,account_type` +
              `&access_token=${encodeURIComponent(igAccessToken)}`;

            const profileRes =
              await fetch(
                profileUrl,
              );
            const profileData =
              await profileRes.json();

            if (
              profileRes.ok &&
              (profileData.id ||
                profileData.username)
            ) {
              if (profileData.id) {
                igAccountId =
                  String(
                    profileData.id,
                  );
              }
              if (
                profileData.username ||
                profileData.name
              ) {
                igUsername =
                  profileData.username ||
                  profileData.name;
              }
            } else {
              const altProfileUrl =
                `https://graph.instagram.com/me` +
                `?fields=id,username,name` +
                `&access_token=${encodeURIComponent(igAccessToken)}`;

              const altProfileRes =
                await fetch(
                  altProfileUrl,
                );
              const altProfileData =
                await altProfileRes.json();

              if (
                altProfileRes.ok &&
                (altProfileData.id ||
                  altProfileData.username)
              ) {
                if (
                  altProfileData.id
                ) {
                  igAccountId =
                    String(
                      altProfileData.id,
                    );
                }
                if (
                  altProfileData.username ||
                  altProfileData.name
                ) {
                  igUsername =
                    altProfileData.username ||
                    altProfileData.name;
                }
              }
            }
          } catch (profileErr) {
            console.warn(
              '[facebook-auth] Could not query Instagram profile fields:',
              profileErr,
            );
          }

          if (!igAccountId) {
            throw new Error(
              'Could not identify Instagram account ID from authorization response.',
            );
          }

          const displayUsername =
            igUsername ||
            'srisagardrivingschool';

          // 4. Save/update Instagram credentials in database
          const igCredentialData = {
            platform: 'instagram',
            page_id: igAccountId,
            account_id: igAccountId,
            page_name:
              displayUsername.startsWith(
                '@',
              )
                ? displayUsername
                : `@${displayUsername}`,
            account_name:
              displayUsername,
            access_token:
              igAccessToken,
            token_type:
              'instagram_business',
            updated_at:
              new Date().toISOString(),
          };

          const {
            data: existingIgCredential,
            error: igLookupError,
          } = await supabaseAdmin
            .from(
              'social_media_credentials',
            )
            .select('id')
            .eq(
              'platform',
              'instagram',
            )
            .maybeSingle();

          if (igLookupError) {
            throw new Error(
              `Failed to check existing Instagram credentials: ${igLookupError.message}`,
            );
          }

          let igDbError = null;

          if (
            existingIgCredential?.id
          ) {
            const result =
              await supabaseAdmin
                .from(
                  'social_media_credentials',
                )
                .update(
                  igCredentialData,
                )
                .eq(
                  'id',
                  existingIgCredential.id,
                );

            igDbError =
              result.error;
          } else {
            const result =
              await supabaseAdmin
                .from(
                  'social_media_credentials',
                )
                .insert(
                  igCredentialData,
                );

            igDbError =
              result.error;
          }

          if (igDbError) {
            throw new Error(
              `Failed to store Instagram credentials in database: ${igDbError.message}`,
            );
          }

          // Consume OAuth state.
          await supabaseAdmin
            .from('oauth_states')
            .delete()
            .eq(
              'state',
              state,
            );

          return buildRedirectResponse(
            true,
            determinedAppOrigin,
            {
              platform:
                'instagram',
              username:
                displayUsername,
              pageId:
                igAccountId,
            },
          );
        }

        // =========================================================
        // 5. FACEBOOK PAGE (UNTAMPERED)
        // =========================================================

        if (
          !metaAppId ||
          !metaAppSecret
        ) {
          return buildRedirectResponse(
            false,
            determinedAppOrigin,
            {
              error:
                'META_APP_ID or META_APP_SECRET is not configured in Supabase Edge Function Secrets.',
            },
          );
        }

        const redirectUri =
          defaultRedirectUri;

        // ---------------------------------------------------------
        // 5A. Exchange authorization code for Facebook.
        // ---------------------------------------------------------

        const tokenExchangeUrl =
          `https://graph.facebook.com/${metaApiVersion}/oauth/access_token` +
          `?client_id=${encodeURIComponent(metaAppId)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&client_secret=${encodeURIComponent(metaAppSecret)}` +
          `&code=${encodeURIComponent(code)}`;

        let tokenRes =
          await fetch(
            tokenExchangeUrl,
          );

        let tokenData =
          await tokenRes.json();

        // Fallback for exact callback URL mismatch.
        if (
          !tokenRes.ok ||
          tokenData.error ||
          !tokenData.access_token
        ) {
          const callbackUrl =
            new URL(req.url);

          callbackUrl.search = '';

          const dynamicRedirectUri =
            callbackUrl.toString();

          if (
            dynamicRedirectUri !==
            redirectUri
          ) {
            const fallbackExchangeUrl =
              `https://graph.facebook.com/${metaApiVersion}/oauth/access_token` +
              `?client_id=${encodeURIComponent(metaAppId)}` +
              `&redirect_uri=${encodeURIComponent(dynamicRedirectUri)}` +
              `&client_secret=${encodeURIComponent(metaAppSecret)}` +
              `&code=${encodeURIComponent(code)}`;

            const fallbackRes =
              await fetch(
                fallbackExchangeUrl,
              );

            const fallbackData =
              await fallbackRes.json();

            if (
              fallbackRes.ok &&
              fallbackData.access_token
            ) {
              tokenRes =
                fallbackRes;

              tokenData =
                fallbackData;
            }
          }
        }

        if (
          !tokenRes.ok ||
          tokenData.error ||
          !tokenData.access_token
        ) {
          throw new Error(
            tokenData.error?.message ||
              'Failed to exchange authorization code for a Meta access token.',
          );
        }

        const shortLivedUserToken =
          tokenData.access_token;

        // ---------------------------------------------------------
        // 5B. Exchange for long-lived user token.
        // ---------------------------------------------------------

        const longLivedUrl =
          `https://graph.facebook.com/${metaApiVersion}/oauth/access_token` +
          `?grant_type=fb_exchange_token` +
          `&client_id=${encodeURIComponent(metaAppId)}` +
          `&client_secret=${encodeURIComponent(metaAppSecret)}` +
          `&fb_exchange_token=${encodeURIComponent(shortLivedUserToken)}`;

        const longLivedRes =
          await fetch(
            longLivedUrl,
          );

        const longLivedData =
          await longLivedRes.json();

        const userAccessToken =
          longLivedRes.ok &&
          longLivedData.access_token
            ? longLivedData.access_token
            : shortLivedUserToken;

        // =========================================================
        // 5. FACEBOOK PAGE
        // =========================================================

        const pagesUrl =
          `https://graph.facebook.com/${metaApiVersion}/me/accounts` +
          `?fields=id,name,access_token,category,tasks` +
          `&limit=100` +
          `&access_token=${encodeURIComponent(userAccessToken)}`;

        const pagesRes =
          await fetch(
            pagesUrl,
          );

        const pagesData =
          await pagesRes.json();

        if (
          !pagesRes.ok ||
          pagesData.error ||
          !Array.isArray(
            pagesData.data,
          )
        ) {
          throw new Error(
            pagesData.error?.message ||
              'Failed to retrieve Facebook Pages for the authorized account.',
          );
        }

        const pages:
          Array<{
            id: string;
            name: string;
            access_token: string;
            category?: string;
          }> =
          pagesData.data;

        if (pages.length === 0) {
          throw new Error(
            'No Facebook Pages found for this account. Please ensure your Facebook account is an administrator of the Facebook Page and granted page management permissions.',
          );
        }

        // ---------------------------------------------------------
        // Select Sri Sagar Driving School.
        // ---------------------------------------------------------

        let targetPage =
          pages.find(
            (page) =>
              configuredPageId &&
              page.id ===
                configuredPageId,
          );

        if (!targetPage) {
          targetPage =
            pages.find(
              (page) =>
                page.name
                  .trim()
                  .toLowerCase() ===
                DEFAULT_TARGET_PAGE_NAME.toLowerCase(),
            );
        }

        if (!targetPage) {
          targetPage =
            pages.find(
              (page) => {
                const name =
                  page.name.toLowerCase();

                return (
                  name.includes(
                    'sri sagar driving school',
                  ) ||
                  name.includes(
                    'sri sagar',
                  ) ||
                  name.includes(
                    'sagar driving',
                  )
                );
              },
            );
        }

        if (
          !targetPage &&
          pages.length === 1
        ) {
          targetPage =
            pages[0];
        }

        if (!targetPage) {
          const availableNames =
            pages
              .map(
                (page) =>
                  `"${page.name}" (ID: ${page.id})`,
              )
              .join(', ');

          throw new Error(
            `Could not find the '${DEFAULT_TARGET_PAGE_NAME}' Facebook Page in your account. Found pages: ${availableNames || 'None'}.`,
          );
        }

        if (
          !targetPage.access_token
        ) {
          throw new Error(
            `The authorized Facebook account does not have publishing permissions for page '${targetPage.name}'.`,
          );
        }

        // ---------------------------------------------------------
        // Save Facebook Page credentials.
        // ---------------------------------------------------------

        const credentialData = {
          platform: 'facebook',
          page_id:
            targetPage.id,
          account_id:
            targetPage.id,
          page_name:
            targetPage.name,
          account_name:
            targetPage.name,
          access_token:
            targetPage.access_token,
          token_type:
            'page',
          updated_at:
            new Date().toISOString(),
        };

        const {
          data: existingCredential,
          error: lookupError,
        } = await supabaseAdmin
          .from(
            'social_media_credentials',
          )
          .select('id')
          .eq(
            'platform',
            'facebook',
          )
          .maybeSingle();

        if (lookupError) {
          throw new Error(
            `Failed to check existing Facebook credentials: ${lookupError.message}`,
          );
        }

        let dbError = null;

        if (
          existingCredential?.id
        ) {
          const result =
            await supabaseAdmin
              .from(
                'social_media_credentials',
              )
              .update(
                credentialData,
              )
              .eq(
                'id',
                existingCredential.id,
              );

          dbError =
            result.error;
        } else {
          const result =
            await supabaseAdmin
              .from(
                'social_media_credentials',
              )
              .insert(
                credentialData,
              );

          dbError =
            result.error;
        }

        if (dbError) {
          throw new Error(
            `Failed to store Facebook credentials in database: ${dbError.message}`,
          );
        }

        // Consume OAuth state.
        await supabaseAdmin
          .from('oauth_states')
          .delete()
          .eq(
            'state',
            state,
          );

        // ---------------------------------------------------------
        // IMPORTANT:
        // This returns an HTML callback page.
        // It sends FACEBOOK_AUTH_COMPLETE to the parent Admin Panel
        // and closes the popup.
        // ---------------------------------------------------------

        return buildRedirectResponse(
          true,
          determinedAppOrigin,
          {
            platform:
              'facebook',
            pageName:
              targetPage.name,
            pageId:
              targetPage.id,
          },
        );
      } catch (err: unknown) {
        const sanitized =
          sanitizeError(err);

        // Best effort cleanup.
        try {
          await supabaseAdmin
            .from('oauth_states')
            .delete()
            .eq(
              'state',
              state,
            );
        } catch {
          // Ignore cleanup errors.
        }

        return buildRedirectResponse(
          false,
          determinedAppOrigin,
          {
            platform:
              state
                ? undefined
                : 'facebook',
            error:
              sanitized,
          },
        );
      }
    }

    // -------------------------------------------------------------
    // Unsupported method.
    // -------------------------------------------------------------

    return new Response(
      JSON.stringify({
        error:
          `Method ${req.method} not supported.`,
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type':
            'application/json',
        },
      },
    );
  } catch (globalErr: unknown) {
    const errorMsg =
      sanitizeError(globalErr);

    return new Response(
      JSON.stringify({
        error:
          `Server error: ${errorMsg}`,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type':
            'application/json',
        },
      },
    );
  }
});
