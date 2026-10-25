import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestPayload {
  caption?: string;
  image_url?: string;
}

interface MetaErrorDetail {
  message: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

function sanitizeMetaError(rawError: unknown): MetaErrorDetail {
  if (!rawError) {
    return { message: 'Unknown error occurred while communicating with Instagram API' };
  }

  if (typeof rawError === 'string') {
    return {
      message: rawError
        .replace(/access_token=[a-zA-Z0-9._-]+/gi, 'access_token=[REDACTED]')
        .replace(/EA[A-Za-z0-9._-]+/g, '[REDACTED_TOKEN]'),
    };
  }

  const errObj = (rawError as Record<string, unknown>).error || rawError;
  const typedErr = errObj as Record<string, unknown>;

  let message = typeof typedErr.message === 'string' ? typedErr.message : JSON.stringify(typedErr);
  message = message
    .replace(/access_token=[a-zA-Z0-9._-]+/gi, 'access_token=[REDACTED]')
    .replace(/EA[A-Za-z0-9._-]+/g, '[REDACTED_TOKEN]');

  return {
    message,
    type: typeof typedErr.type === 'string' ? typedErr.type : undefined,
    code: typeof typedErr.code === 'number' ? typedErr.code : undefined,
    error_subcode: typeof typedErr.error_subcode === 'number' ? typedErr.error_subcode : undefined,
    fbtrace_id: typeof typedErr.fbtrace_id === 'string' ? typedErr.fbtrace_id : undefined,
  };
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Enforce POST only
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: {
          message: 'Method not allowed. Only POST is supported.',
        },
      }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 3. Secrets retrieval (kept strictly server-side)
    const igAccountId =
      Deno.env.get('INSTAGRAM_ACCOUNT_ID') ||
      Deno.env.get('META_INSTAGRAM_ACCOUNT_ID') ||
      '';
    const igAccessToken =
      Deno.env.get('INSTAGRAM_ACCESS_TOKEN') ||
      Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN') ||
      Deno.env.get('META_ACCESS_TOKEN') ||
      '';

    if (!igAccountId || !igAccessToken) {
      return new Response(
        JSON.stringify({
          error: {
            message:
              'Missing Instagram credentials in server secrets. Please set INSTAGRAM_ACCOUNT_ID and INSTAGRAM_ACCESS_TOKEN.',
            type: 'ConfigurationError',
          },
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Parse & Validate Payload
    let body: RequestPayload = {};
    try {
      body = (await req.json()) as RequestPayload;
    } catch {
      return new Response(
        JSON.stringify({
          error: {
            message: 'Invalid JSON payload in request body.',
          },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageUrl = body.image_url?.trim();
    const caption = body.caption?.trim() || '';

    if (!imageUrl) {
      return new Response(
        JSON.stringify({
          error: {
            message: 'Missing required parameter: image_url',
          },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!imageUrl.startsWith('https://')) {
      return new Response(
        JSON.stringify({
          error: {
            message: 'image_url must be a valid public HTTPS URL.',
          },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Instagram Graph API v26.0 - Step 1: Create Media Container
    const createParams = new URLSearchParams();
    createParams.set('image_url', imageUrl);
    if (caption) {
      createParams.set('caption', caption);
    }
    createParams.set('access_token', igAccessToken);

    const createRes = await fetch(`https://graph.instagram.com/v26.0/${igAccountId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: createParams.toString(),
    });

    const createData = await createRes.json();

    if (!createRes.ok || createData.error || !createData.id) {
      const sanitized = sanitizeMetaError(createData.error || createData);
      return new Response(
        JSON.stringify({ error: sanitized }),
        { status: createRes.status >= 400 ? createRes.status : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const containerId = createData.id;

    // 6. Step 2: Poll Container Status until FINISHED
    let isReady = false;
    let lastStatus = '';

    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const statusRes = await fetch(
        `https://graph.instagram.com/v26.0/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(igAccessToken)}`
      );
      const statusData = await statusRes.json();

      if (statusData.status_code === 'FINISHED') {
        isReady = true;
        break;
      }

      if (statusData.status_code === 'ERROR' || statusData.status_code === 'EXPIRED') {
        const sanitized = sanitizeMetaError(
          statusData.error || {
            message: statusData.status || `Instagram container status failed with ${statusData.status_code}`,
            code: statusData.error_subcode,
          }
        );
        return new Response(
          JSON.stringify({ error: sanitized }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      lastStatus = statusData.status_code || statusData.status || 'IN_PROGRESS';
    }

    if (!isReady) {
      return new Response(
        JSON.stringify({
          error: {
            message: `Instagram container processing timed out. Last status: ${lastStatus}`,
          },
        }),
        { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Step 3: Publish Media Container
    const publishParams = new URLSearchParams();
    publishParams.set('creation_id', containerId);
    publishParams.set('access_token', igAccessToken);

    const publishRes = await fetch(`https://graph.instagram.com/v26.0/${igAccountId}/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: publishParams.toString(),
    });

    const publishData = await publishRes.json();

    if (!publishRes.ok || publishData.error || !publishData.id) {
      const sanitized = sanitizeMetaError(publishData.error || publishData);
      return new Response(
        JSON.stringify({ error: sanitized }),
        { status: publishRes.status >= 400 ? publishRes.status : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Return Success with Instagram Media ID
    return new Response(
      JSON.stringify({
        success: true,
        id: publishData.id,
        media_id: publishData.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const sanitized = sanitizeMetaError(err);
    return new Response(
      JSON.stringify({ error: sanitized }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
