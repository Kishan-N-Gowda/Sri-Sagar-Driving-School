import express, { Request, Response } from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://wcurzjcdqxkahcardcyi.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2PguQk3d0whzDe5_qGT7Bg__jyyWdgS';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Meta App credentials from environment
const metaAppId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID || '';
const metaAppSecret = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET || '';
const metaApiVersion = process.env.META_API_VERSION || 'v19.0';
const DEFAULT_TARGET_PAGE_NAME = 'Sri Sagar Driving School';

// Meta scopes required for Facebook Page management
const META_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
].join(',');

export { META_SCOPES };

const INSTAGRAM_BUSINESS_SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_messages',
  'instagram_business_manage_comments',
  'instagram_business_content_publish',
  'instagram_business_manage_insights',
].join(',');

function sanitizeErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error occurred.';
  let message = typeof err === 'string' ? err : (err as { message?: string }).message || JSON.stringify(err);
  // Redact any access tokens or secrets
  message = message.replace(/access_token=[a-zA-Z0-9._-]+/gi, 'access_token=[REDACTED]');
  message = message.replace(/EA[A-Za-z0-9._-]+/g, '[REDACTED_TOKEN]');
  message = message.replace(/client_secret=[a-zA-Z0-9._-]+/gi, 'client_secret=[REDACTED]');
  message = message.replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED]');

  if (message.includes('Session has been invalidated') || message.includes('user logged out') || message.includes('Error validating access token')) {
    return 'Facebook connection expired or user logged out. Please reconnect your Facebook account.';
  }
  if (message.includes('permission') || message.includes('pages_manage_posts') || message.includes('pages_show_list')) {
    return 'Missing required Facebook Page permissions. Please reconnect and grant page management permissions.';
  }
  return message.slice(0, 300);
}

function getAppOrigin(req: Request): string {
  // 1. Check explicit client app origin passed from browser window.location.origin
  const clientOrigin = req.body?.app_origin || req.body?.appOrigin || req.body?.origin || req.headers.origin || req.headers.referer;
  if (clientOrigin && typeof clientOrigin === 'string' && clientOrigin.startsWith('http')) {
    try {
      const parsed = new URL(clientOrigin);
      const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      const proto = isLocal ? parsed.protocol.replace(':', '') : 'https';
      return `${proto}://${parsed.host}`;
    } catch {
      // fallback to header inspection below
    }
  }

  // 2. Inspect host and forwarded headers
  const rawHost = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  const singleHost = Array.isArray(rawHost) ? rawHost[0] : rawHost.split(',')[0].trim();
  const isLocalHost = singleHost.startsWith('localhost') || singleHost.startsWith('127.0.0.1');

  // Meta OAuth strictly requires HTTPS for all public/cloud domains (such as *.run.app)
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protoHeader = Array.isArray(forwardedProto) ? forwardedProto[0] : (forwardedProto ? forwardedProto.split(',')[0].trim() : '');
  const finalProto = isLocalHost ? (protoHeader || 'http') : 'https';

  return `${finalProto}://${singleHost}`;
}

// -------------------------------------------------------------
// 1. API: Health Check
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// 2. API: Start Meta OAuth Flow (/api/auth/facebook/start)
// -------------------------------------------------------------
app.post('/api/auth/facebook/start', async (req: Request, res: Response) => {
  try {
    const origin = getAppOrigin(req);
    // Delegate to production Supabase Edge Function `facebook-auth` which uses whitelisted callback
    const { data, error } = await supabaseAdmin.functions.invoke('facebook-auth', {
      body: { action: 'get_auth_url', app_origin: origin },
    });

    if (error || !data?.auth_url) {
      return res.status(400).json({
        success: false,
        error: data?.error || error?.message || 'Could not initiate Facebook authentication.',
      });
    }

    return res.json({
      success: true,
      auth_url: data.auth_url,
      state: data.state,
      redirect_uri: data.redirect_uri,
      target_page_name: data.targetPageName || DEFAULT_TARGET_PAGE_NAME,
    });
  } catch (err: unknown) {
    const safeError = sanitizeErrorMessage(err);
    return res.status(500).json({ success: false, error: safeError });
  }
});

// -------------------------------------------------------------
// 3. OAUTH CALLBACK: (/auth/facebook/callback & /api/auth/facebook/callback)
// -------------------------------------------------------------
const handleFacebookCallback = async (req: Request, res: Response) => {
  const origin = getAppOrigin(req);
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  const metaError = req.query.error as string | undefined;
  const metaErrorDesc = (req.query.error_description || req.query.error_message || metaError) as string | undefined;

  // 1. Handle user cancellation or Meta authorization errors
  if (metaError || !code) {
    const errorDetail = metaErrorDesc
      ? sanitizeErrorMessage(metaErrorDesc)
      : 'Facebook authorization was cancelled or denied.';
    return res.redirect(`/admin?fb_error=${encodeURIComponent(errorDetail)}`);
  }

  // 2. Validate state parameter
  if (!state) {
    return res.redirect(`/admin?fb_error=${encodeURIComponent('Invalid request: missing OAuth state parameter.')}`);
  }

  try {
    const redirectUri = `${origin}/auth/facebook/callback`;

    // 3. Exchange authorization code for Short-Lived User Access Token
    if (!metaAppId || !metaAppSecret) {
      // If server doesn't have secrets directly, attempt delegating to Supabase Edge Function
      try {
        const edgeRes = await fetch(`${supabaseUrl}/functions/v1/facebook-auth?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
        if (edgeRes.ok) {
          return res.redirect(`/admin?fb_connected=true&page_name=${encodeURIComponent(DEFAULT_TARGET_PAGE_NAME)}`);
        }
      } catch {
        // proceed
      }
      return res.redirect(`/admin?fb_error=${encodeURIComponent('META_APP_ID or META_APP_SECRET is not configured on the server.')}`);
    }

    const tokenExchangeUrl = `https://graph.facebook.com/${metaApiVersion}/oauth/access_token?client_id=${encodeURIComponent(metaAppId)}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(metaAppSecret)}&code=${encodeURIComponent(code)}`;

    let tokenRes = await fetch(tokenExchangeUrl);
    let tokenData = await tokenRes.json();

    // Fallback: If redirectUri mismatch (e.g. /api/auth/facebook/callback vs /auth/facebook/callback)
    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      const altRedirectUri = `${origin}/api/auth/facebook/callback`;
      const fallbackExchangeUrl = `https://graph.facebook.com/${metaApiVersion}/oauth/access_token?client_id=${encodeURIComponent(metaAppId)}&redirect_uri=${encodeURIComponent(altRedirectUri)}&client_secret=${encodeURIComponent(metaAppSecret)}&code=${encodeURIComponent(code)}`;
      const fallbackRes = await fetch(fallbackExchangeUrl);
      const fallbackData = await fallbackRes.json();
      if (fallbackRes.ok && fallbackData.access_token) {
        tokenRes = fallbackRes;
        tokenData = fallbackData;
      }
    }

    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      const errorMsg = sanitizeErrorMessage(tokenData.error?.message || 'Failed to exchange authorization code with Meta.');
      return res.redirect(`/admin?fb_error=${encodeURIComponent(errorMsg)}`);
    }

    const shortLivedUserToken = tokenData.access_token;

    // 4. Exchange Short-Lived User Token for Long-Lived User Token (60 days)
    const longLivedUrl = `https://graph.facebook.com/${metaApiVersion}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(metaAppId)}&client_secret=${encodeURIComponent(metaAppSecret)}&fb_exchange_token=${encodeURIComponent(shortLivedUserToken)}`;

    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    const userAccessToken = (longLivedRes.ok && longLivedData.access_token) ? longLivedData.access_token : shortLivedUserToken;

    // 5. Fetch User's Managed Facebook Pages (/me/accounts)
    const pagesUrl = `https://graph.facebook.com/${metaApiVersion}/me/accounts?fields=id,name,access_token,category,tasks&limit=100&access_token=${encodeURIComponent(userAccessToken)}`;

    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (!pagesRes.ok || pagesData.error || !Array.isArray(pagesData.data)) {
      const errorMsg = sanitizeErrorMessage(pagesData.error?.message || 'Failed to retrieve Facebook Pages from Meta.');
      return res.redirect(`/admin?fb_error=${encodeURIComponent(errorMsg)}`);
    }

    const pages: Array<{ id: string; name: string; access_token: string; category?: string }> = pagesData.data;

    if (pages.length === 0) {
      return res.redirect(`/admin?fb_error=${encodeURIComponent('No Facebook Pages found for this account. Please ensure your account is an admin of the Sri Sagar Driving School Facebook Page.')}`);
    }

    // 6. Identify target Page
    let targetPage = pages.find((p) => p.name.trim().toLowerCase() === DEFAULT_TARGET_PAGE_NAME.toLowerCase());

    if (!targetPage) {
      targetPage = pages.find((p) =>
        p.name.toLowerCase().includes('sri sagar driving school') ||
        p.name.toLowerCase().includes('sri sagar') ||
        p.name.toLowerCase().includes('sagar driving')
      );
    }

    if (!targetPage && pages.length === 1) {
      targetPage = pages[0];
    }

    if (!targetPage) {
      targetPage = pages[0];
    }

    if (!targetPage.access_token) {
      return res.redirect(`/admin?fb_error=${encodeURIComponent(`The authorized account does not have publishing permissions for page '${targetPage.name}'.`)}`);
    }

    // 7. Store new credentials securely in Supabase DB
    const credentialData = {
      id: 'facebook',
      platform: 'facebook',
      page_id: targetPage.id,
      account_id: targetPage.id,
      page_name: targetPage.name,
      account_name: targetPage.name,
      access_token: targetPage.access_token,
      token_type: 'page_access_token',
      updated_at: new Date().toISOString(),
    };

    let { error: dbError } = await supabaseAdmin
      .from('social_media_credentials')
      .upsert(credentialData, { onConflict: 'platform' });

    if (dbError) {
      const fallbackRes = await supabaseAdmin
        .from('social_media_credentials')
        .upsert(credentialData, { onConflict: 'id' });
      dbError = fallbackRes.error;
    }

    if (dbError) {
      console.error('Database credential storage error:', dbError);
    }

    // 8. Clean up consumed state
    try {
      await supabaseAdmin.from('oauth_states').delete().eq('state', state);
    } catch {
      // safe ignore
    }

    // 9. Clean HTTP 302 Redirect to website admin panel
    return res.redirect(
      `/admin?fb_connected=true&page_name=${encodeURIComponent(targetPage.name)}&page_id=${encodeURIComponent(targetPage.id)}`
    );
  } catch (err: unknown) {
    const errorMsg = sanitizeErrorMessage(err);
    return res.redirect(`/admin?fb_error=${encodeURIComponent(errorMsg)}`);
  }
};

app.get('/auth/facebook/callback', handleFacebookCallback);
app.get('/api/auth/facebook/callback', handleFacebookCallback);

// -------------------------------------------------------------
// 4. API: Check Facebook Connection Health (/api/auth/facebook/status)
// -------------------------------------------------------------
app.get('/api/auth/facebook/status', async (_req: Request, res: Response) => {
  try {
    // 1. Retrieve stored credentials from DB
    const { data: dbCreds, error: dbError } = await supabaseAdmin
      .from('social_media_credentials')
      .select('*')
      .or('id.eq.facebook,platform.eq.facebook')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dbError || !dbCreds || !dbCreds.access_token) {
      return res.json({
        success: true,
        configured: false,
        connected: false,
        error: 'Facebook credentials not configured. Please click "Reconnect Facebook".',
        page_name: dbCreds?.page_name || DEFAULT_TARGET_PAGE_NAME,
      });
    }

    const pageId = dbCreds.page_id || dbCreds.account_id || 'me';
    const accessToken = dbCreds.access_token;

    // 2. Validate token with Meta Graph API
    const targetPath = pageId && pageId !== 'me' ? pageId : 'me';
    const fbRes = await fetch(
      `https://graph.facebook.com/${metaApiVersion}/${targetPath}?fields=id,name,link&access_token=${encodeURIComponent(accessToken)}`
    );
    const fbData = await fbRes.json();

    if (fbRes.ok && fbData.id) {
      return res.json({
        success: true,
        configured: true,
        connected: true,
        page_id: fbData.id,
        page_name: fbData.name || dbCreds.page_name || DEFAULT_TARGET_PAGE_NAME,
      });
    }

    // Token was rejected by Meta Graph API (e.g. user logged out or token expired)
    const rawError = fbData.error?.message || 'Error validating access token';
    const sanitized = sanitizeErrorMessage(rawError);

    return res.json({
      success: true,
      configured: true,
      connected: false,
      is_auth_expired: true,
      error: sanitized,
      page_name: dbCreds.page_name || DEFAULT_TARGET_PAGE_NAME,
    });
  } catch (err: unknown) {
    return res.json({
      success: false,
      configured: true,
      connected: false,
      error: sanitizeErrorMessage(err),
    });
  }
});

// -------------------------------------------------------------
// 5. API: Disconnect Facebook (/api/auth/facebook/disconnect)
// -------------------------------------------------------------
app.post('/api/auth/facebook/disconnect', async (_req: Request, res: Response) => {
  try {
    await supabaseAdmin
      .from('social_media_credentials')
      .delete()
      .or('id.eq.facebook,platform.eq.facebook');

    return res.json({ success: true, message: 'Facebook disconnected successfully.' });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: sanitizeErrorMessage(err) });
  }
});

// -------------------------------------------------------------
// 6. API: Start Instagram OAuth Flow (/api/auth/instagram/start)
// -------------------------------------------------------------
app.post('/api/auth/instagram/start', async (req: Request, res: Response) => {
  try {
    const origin = getAppOrigin(req);
    const redirectUri = `${origin}/auth/instagram/callback`;

    // 1. Delegate directly to Supabase facebook-auth edge function if available
    try {
      const { data, error } = await supabaseAdmin.functions.invoke('facebook-auth', {
        body: { action: 'get_instagram_auth_url', platform: 'instagram', app_origin: origin },
      });
      if (!error && (data?.auth_url || data?.authUrl)) {
        const generatedUrl = data.auth_url || data.authUrl;
        return res.json({
          success: true,
          auth_url: generatedUrl,
          state: data.state,
          redirect_uri: data.redirect_uri || redirectUri,
        });
      }
    } catch {
      // Fall through to local fallback
    }

    const instagramAppId = process.env.INSTAGRAM_APP_ID || '39991020200546069';

    // 2. Generate secure state
    const state = crypto.randomUUID();

    // 3. Store state in public.oauth_states
    try {
      await supabaseAdmin.from('oauth_states').insert({
        state,
        platform: 'instagram',
        provider: 'instagram',
        redirect_uri: redirectUri,
        app_origin: origin,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
    } catch (insertErr) {
      console.warn('Could not store state in oauth_states for Instagram:', insertErr);
    }

    // 4. Build official Instagram Business Login OAuth authorization URL
    const authUrl = new URL('https://www.instagram.com/oauth/authorize');
    authUrl.searchParams.set('force_reauth', 'true');
    authUrl.searchParams.set('client_id', instagramAppId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', INSTAGRAM_BUSINESS_SCOPES);
    authUrl.searchParams.set('response_type', 'code');

    return res.json({
      success: true,
      auth_url: authUrl.toString(),
      state,
      redirect_uri: redirectUri,
    });
  } catch (err: unknown) {
    const safeError = sanitizeErrorMessage(err);
    return res.status(500).json({ success: false, error: safeError });
  }
});

// -------------------------------------------------------------
// 7. OAUTH CALLBACK: (/auth/instagram/callback & /api/auth/instagram/callback)
// -------------------------------------------------------------
const handleInstagramCallback = async (req: Request, res: Response) => {
  const origin = getAppOrigin(req);
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  const metaError = req.query.error as string | undefined;
  const metaErrorDesc = (req.query.error_description || req.query.error_message || metaError) as string | undefined;

  // 1. Handle user cancellation or Meta authorization errors
  if (metaError || !code) {
    const errorDetail = metaErrorDesc
      ? sanitizeErrorMessage(metaErrorDesc)
      : 'Instagram authorization was cancelled or denied.';
    return res.redirect(`/admin?ig_error=${encodeURIComponent(errorDetail)}`);
  }

  // 2. Validate state parameter
  if (!state) {
    return res.redirect(`/admin?ig_error=${encodeURIComponent('Invalid request: missing OAuth state parameter.')}`);
  }

  try {
    const redirectUri = `${origin}/auth/instagram/callback`;

    // 3. Exchange authorization code for Short-Lived User Access Token
    if (!metaAppId || !metaAppSecret) {
      try {
        const edgeRes = await fetch(
          `${supabaseUrl}/functions/v1/facebook-auth?platform=instagram&code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        );
        if (edgeRes.ok) {
          return res.redirect(`/admin?ig_connected=true&ig_username=srisagardrivingschool`);
        }
      } catch {
        // proceed
      }
      return res.redirect(`/admin?ig_error=${encodeURIComponent('META_APP_ID or META_APP_SECRET is not configured on the server.')}`);
    }

    const tokenExchangeUrl = `https://graph.facebook.com/${metaApiVersion}/oauth/access_token?client_id=${encodeURIComponent(metaAppId)}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(metaAppSecret)}&code=${encodeURIComponent(code)}`;

    let tokenRes = await fetch(tokenExchangeUrl);
    let tokenData = await tokenRes.json();

    // Fallback if redirectUri mismatch
    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      const altRedirectUri = `${origin}/api/auth/instagram/callback`;
      const fallbackExchangeUrl = `https://graph.facebook.com/${metaApiVersion}/oauth/access_token?client_id=${encodeURIComponent(metaAppId)}&redirect_uri=${encodeURIComponent(altRedirectUri)}&client_secret=${encodeURIComponent(metaAppSecret)}&code=${encodeURIComponent(code)}`;
      const fallbackRes = await fetch(fallbackExchangeUrl);
      const fallbackData = await fallbackRes.json();
      if (fallbackRes.ok && fallbackData.access_token) {
        tokenRes = fallbackRes;
        tokenData = fallbackData;
      }
    }

    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      const errorMsg = sanitizeErrorMessage(tokenData.error?.message || 'Failed to exchange authorization code with Meta.');
      return res.redirect(`/admin?ig_error=${encodeURIComponent(errorMsg)}`);
    }

    const shortLivedUserToken = tokenData.access_token;

    // 4. Exchange Short-Lived Token for Long-Lived User Token (60 days)
    const longLivedUrl = `https://graph.facebook.com/${metaApiVersion}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(metaAppId)}&client_secret=${encodeURIComponent(metaAppSecret)}&fb_exchange_token=${encodeURIComponent(shortLivedUserToken)}`;

    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    const userAccessToken = (longLivedRes.ok && longLivedData.access_token) ? longLivedData.access_token : shortLivedUserToken;

    // 5. Fetch User's Managed Facebook Pages and linked Instagram Business Accounts
    const pagesUrl = `https://graph.facebook.com/${metaApiVersion}/me/accounts?fields=id,name,access_token,category,instagram_business_account{id,username,name,profile_picture_url}&limit=100&access_token=${encodeURIComponent(userAccessToken)}`;

    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (!pagesRes.ok || pagesData.error || !Array.isArray(pagesData.data)) {
      const errorMsg = sanitizeErrorMessage(pagesData.error?.message || 'Failed to retrieve Facebook Pages and connected Instagram accounts from Meta.');
      return res.redirect(`/admin?ig_error=${encodeURIComponent(errorMsg)}`);
    }

    const pages: Array<{
      id: string;
      name: string;
      access_token: string;
      instagram_business_account?: {
        id: string;
        username?: string;
        name?: string;
        profile_picture_url?: string;
      };
    }> = pagesData.data;

    // 6. Find connected Instagram Professional/Business account
    let targetPage = pages.find((p) => Boolean(p.instagram_business_account?.id));

    // If multiple pages have IG accounts, prioritize Sri Sagar driving school
    if (pages.filter((p) => p.instagram_business_account?.id).length > 1) {
      const preferred = pages.find(
        (p) =>
          p.instagram_business_account?.id &&
          (p.name.toLowerCase().includes('sri sagar') ||
            p.name.toLowerCase().includes('sagar driving') ||
            (p.instagram_business_account.username && p.instagram_business_account.username.toLowerCase().includes('sri_sagar')))
      );
      if (preferred) {
        targetPage = preferred;
      }
    }

    let igAccountId = targetPage?.instagram_business_account?.id;
    let igUsername = targetPage?.instagram_business_account?.username || targetPage?.instagram_business_account?.name;
    let igAccessToken = targetPage?.access_token || userAccessToken;

    // Fallback: Query /me/instagram_accounts if not attached directly to page
    if (!igAccountId) {
      try {
        const directIgUrl = `https://graph.facebook.com/${metaApiVersion}/me?fields=id,name,instagram_accounts{id,username,name}&access_token=${encodeURIComponent(userAccessToken)}`;
        const directRes = await fetch(directIgUrl);
        const directData = await directRes.json();
        if (directData?.instagram_accounts?.data?.length > 0) {
          const directIg = directData.instagram_accounts.data[0];
          igAccountId = directIg.id;
          igUsername = directIg.username || directIg.name;
          igAccessToken = userAccessToken;
        }
      } catch {
        // safe ignore
      }
    }

    if (!igAccountId) {
      return res.redirect(
        `/admin?ig_error=${encodeURIComponent(
          'No Instagram Professional/Business account found linked to your Facebook Pages. Please ensure your Instagram account is set as a Professional account and connected to your Facebook Page in Meta Business Suite.'
        )}`
      );
    }

    // Try to fetch additional details if username is still missing
    if (!igUsername && igAccountId) {
      try {
        const infoUrl = `https://graph.facebook.com/${metaApiVersion}/${igAccountId}?fields=id,username,name&access_token=${encodeURIComponent(igAccessToken)}`;
        const infoRes = await fetch(infoUrl);
        const infoData = await infoRes.json();
        if (infoData?.username || infoData?.name) {
          igUsername = infoData.username || infoData.name;
        }
      } catch {
        // safe ignore
      }
    }

    const displayUsername = igUsername || 'srisagardrivingschool';

    // 7. Store Instagram credentials securely in Supabase DB without creating duplicate records
    const igCredentialData = {
      id: 'instagram',
      platform: 'instagram',
      page_id: igAccountId,
      account_id: igAccountId,
      page_name: displayUsername.startsWith('@') ? displayUsername : `@${displayUsername}`,
      account_name: displayUsername,
      access_token: igAccessToken,
      token_type: 'instagram_business',
      updated_at: new Date().toISOString(),
    };

    const { data: existingIg } = await supabaseAdmin
      .from('social_media_credentials')
      .select('id')
      .or('id.eq.instagram,platform.eq.instagram')
      .maybeSingle();

    let dbError = null;
    if (existingIg?.id) {
      const updateRes = await supabaseAdmin
        .from('social_media_credentials')
        .update(igCredentialData)
        .eq('id', existingIg.id);
      dbError = updateRes.error;
    } else {
      const insertRes = await supabaseAdmin
        .from('social_media_credentials')
        .upsert(igCredentialData, { onConflict: 'platform' });
      dbError = insertRes.error;
      if (dbError) {
        const fallbackRes = await supabaseAdmin
          .from('social_media_credentials')
          .upsert(igCredentialData, { onConflict: 'id' });
        dbError = fallbackRes.error;
      }
    }

    if (dbError) {
      console.error('Database Instagram credential storage error:', dbError);
    }

    // 8. Clean up consumed state
    try {
      await supabaseAdmin.from('oauth_states').delete().eq('state', state);
    } catch {
      // safe ignore
    }

    // 9. Redirect cleanly to admin page (no tokens in URL)
    return res.redirect(
      `/admin?ig_connected=true&ig_username=${encodeURIComponent(displayUsername)}&ig_id=${encodeURIComponent(igAccountId)}`
    );
  } catch (err: unknown) {
    const errorMsg = sanitizeErrorMessage(err);
    return res.redirect(`/admin?ig_error=${encodeURIComponent(errorMsg)}`);
  }
};

app.get('/auth/instagram/callback', handleInstagramCallback);
app.get('/api/auth/instagram/callback', handleInstagramCallback);

// -------------------------------------------------------------
// 8. API: Check Instagram Connection Health (/api/auth/instagram/status)
// -------------------------------------------------------------
app.get('/api/auth/instagram/status', async (_req: Request, res: Response) => {
  try {
    // 1. Retrieve stored Instagram credentials from DB
    const { data: dbCreds, error: dbError } = await supabaseAdmin
      .from('social_media_credentials')
      .select('*')
      .or('id.eq.instagram,platform.eq.instagram')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dbError || !dbCreds || !dbCreds.access_token) {
      return res.json({
        success: true,
        configured: false,
        connected: false,
        error: 'Instagram credentials not configured. Please click "Reconnect Instagram".',
        username: dbCreds?.account_name || 'srisagardrivingschool',
      });
    }

    const igAccountId = dbCreds.account_id || dbCreds.page_id || 'me';
    const accessToken = dbCreds.access_token;
    const targetPath = igAccountId && igAccountId !== 'me' ? igAccountId : 'me';

    // 2. Validate token with Meta Graph API
    let igRes = await fetch(
      `https://graph.facebook.com/${metaApiVersion}/${targetPath}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(accessToken)}`
    );
    let igData = await igRes.json();

    if (!igRes.ok || (!igData.id && !igData.username)) {
      // Fallback: graph.instagram.com
      const altRes = await fetch(
        `https://graph.instagram.com/v21.0/${targetPath}?fields=id,username,name,account_type&access_token=${encodeURIComponent(accessToken)}`
      );
      const altData = await altRes.json();
      if (altRes.ok && (altData.id || altData.username)) {
        igRes = altRes;
        igData = altData;
      }
    }

    if (igRes.ok && (igData.id || igData.username)) {
      return res.json({
        success: true,
        configured: true,
        connected: true,
        id: igData.id || igAccountId,
        username: igData.username || igData.name || dbCreds.account_name || 'srisagardrivingschool',
      });
    }

    const rawError = igData.error?.message || 'Error validating Instagram access token';
    const sanitized = sanitizeErrorMessage(rawError);

    return res.json({
      success: true,
      configured: true,
      connected: false,
      is_auth_expired: true,
      error: sanitized,
      username: dbCreds.account_name || 'srisagardrivingschool',
    });
  } catch (err: unknown) {
    return res.json({
      success: false,
      configured: true,
      connected: false,
      error: sanitizeErrorMessage(err),
    });
  }
});

// -------------------------------------------------------------
// 9. API: Disconnect Instagram (/api/auth/instagram/disconnect)
// -------------------------------------------------------------
app.post('/api/auth/instagram/disconnect', async (_req: Request, res: Response) => {
  try {
    await supabaseAdmin
      .from('social_media_credentials')
      .delete()
      .or('id.eq.instagram,platform.eq.instagram');

    return res.json({ success: true, message: 'Instagram disconnected successfully.' });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: sanitizeErrorMessage(err) });
  }
});

// -------------------------------------------------------------
// 10. Vite middleware (dev) / Static file serving (prod)
// -------------------------------------------------------------
async function startServer() {
  // Always explicitly serve static public images directory
  const publicImagesPath = path.join(process.cwd(), 'public/images');
  app.use('/images', express.static(publicImagesPath, {
    maxAge: '1d',
    fallthrough: true,
  }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
