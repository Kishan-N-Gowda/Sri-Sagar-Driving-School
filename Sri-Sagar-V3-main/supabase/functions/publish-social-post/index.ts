// Supabase Edge Function: publish-social-post
// Publishes gallery photos to Instagram via Instagram API & Facebook Page via Facebook Graph API
// Also supports connection testing, aspect-ratio handling, and status tracking for Sri Sagar Driving School

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { Image, GIF, decode as decodeImage } from 'https://deno.land/x/imagescript@1.3.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Instagram Feed Photo aspect ratio constraints:
// - Portrait minimum: 4:5 (0.80)
// - Landscape maximum: 1.91:1 (1.91)
// - Square: 1:1 (1.00)
const MIN_IG_ASPECT_RATIO = 0.80; // 4:5 limit
const MAX_IG_ASPECT_RATIO = 1.91; // 1.91:1 limit
const ASPECT_TOLERANCE = 0.005;   // Exact precision buffer

// Resource & safety boundaries for edge compute
const MAX_IMAGE_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_IMAGE_DIMENSION_PX = 8000;               // 8000 x 8000 px

interface RequestPayload {
  action?: 'publish' | 'test_connection' | 'get_history';
  photoId?: string;
  imageUrl?: string;
  caption?: string;
  platforms?: ('instagram' | 'facebook')[];
  retry?: boolean;
}

interface ImageMetadata {
  originalWidth: number;
  originalHeight: number;
  originalRatio: number;
  finalWidth: number;
  finalHeight: number;
  finalRatio: number;
  modified: boolean;
}

interface PreparedImage {
  imageUrl: string;
  tempStoragePath: string | null;
  meta: ImageMetadata;
}

function sanitizeError(error: unknown): string {
  if (!error) return 'Unknown error';
  let message = typeof error === 'string' ? error : (error as { message?: string }).message || JSON.stringify(error);
  // Strip potential Meta access tokens or secret keys from error strings
  message = message.replace(/access_token=[a-zA-Z0-9_-]+/gi, 'access_token=[REDACTED]');
  message = message.replace(/EA[A-Za-z0-9]+/g, '[REDACTED_TOKEN]');
  message = message.replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED]');
  return message.slice(0, 500);
}

/**
 * Validates the image dimensions and enforces Instagram-supported aspect ratios (4:5 to 1.91:1).
 *
 * Scenarios:
 * 1. 1:1 Square (ratio = 1.00) -> kept original (no modification)
 * 2. Standard Landscape (e.g. 4:3, 3:2, 16:9 up to 1.91:1) -> kept original (no modification)
 * 3. Standard Portrait (e.g. 4:5 down to 0.80) -> kept original (no modification)
 * 4. Extreme Portrait (ratio < 0.80, e.g. 9:16 story/reel) -> cropped top/bottom symmetrically to 4:5
 * 5. Extreme Landscape (ratio > 1.91, e.g. 21:9 panorama) -> cropped left/right symmetrically to 1.91:1
 * 6. Decode/Validation failure -> throws clear, actionable user error (never silently sends broken image)
 *
 * The original gallery image in Supabase Storage is NEVER modified or overwritten.
 */
async function prepareInstagramImage(
  supabaseAdmin: SupabaseClient,
  supabaseUrl: string,
  photoId: string,
  sourceImageUrl: string
): Promise<PreparedImage> {
  // 1. Fetch image binary from public URL or storage
  const imgRes = await fetch(sourceImageUrl);
  if (!imgRes.ok) {
    throw new Error(`Failed to download image for Instagram processing (HTTP ${imgRes.status})`);
  }

  const contentLength = Number(imgRes.headers.get('content-length') || 0);
  if (contentLength > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error(
      `Image file exceeds maximum allowable size of 25MB (Size: ${(contentLength / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller image.`
    );
  }

  const arrayBuffer = await imgRes.arrayBuffer();
  const imageBytes = new Uint8Array(arrayBuffer);

  if (imageBytes.length > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error(
      `Image file size (${(imageBytes.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowable 25MB limit.`
    );
  }

  // 2. Decode image using ImageScript WASM engine
  let decoded: Image | GIF;
  try {
    decoded = await decodeImage(imageBytes);
  } catch (decodeErr: unknown) {
    const rawMsg = decodeErr instanceof Error ? decodeErr.message : String(decodeErr);
    throw new Error(
      `Image format could not be verified for Instagram publishing: ${rawMsg}. Please ensure the image is a standard JPG, PNG, or WebP file.`
    );
  }

  const rawImage: Image = decoded instanceof GIF ? decoded[0] : decoded;
  const width = rawImage.width;
  const height = rawImage.height;

  if (!width || !height || width <= 0 || height <= 0) {
    throw new Error('Invalid image dimensions detected. Image cannot be processed for Instagram.');
  }

  if (width > MAX_IMAGE_DIMENSION_PX || height > MAX_IMAGE_DIMENSION_PX) {
    throw new Error(
      `Image resolution (${width}x${height}px) exceeds edge processing limit of 8000px. Please resize the image.`
    );
  }

  const originalRatio = width / height;

  // 3. Check if aspect ratio is already valid for Instagram Feed
  const isRatioSupported =
    originalRatio >= (MIN_IG_ASPECT_RATIO - ASPECT_TOLERANCE) &&
    originalRatio <= (MAX_IG_ASPECT_RATIO + ASPECT_TOLERANCE);

  if (isRatioSupported) {
    return {
      imageUrl: sourceImageUrl,
      tempStoragePath: null,
      meta: {
        originalWidth: width,
        originalHeight: height,
        originalRatio: Number(originalRatio.toFixed(4)),
        finalWidth: width,
        finalHeight: height,
        finalRatio: Number(originalRatio.toFixed(4)),
        modified: false,
      },
    };
  }

  // 4. Crop intelligently to closest valid aspect ratio without stretching or distortion
  let targetWidth = width;
  let targetHeight = height;
  let cropX = 0;
  let cropY = 0;

  if (originalRatio < MIN_IG_ASPECT_RATIO) {
    // Too tall / steep portrait (e.g. 9:16). Crop top and bottom equally to achieve 4:5 (0.80)
    targetWidth = width;
    targetHeight = Math.floor(width / MIN_IG_ASPECT_RATIO);
    if (targetHeight > height) targetHeight = height;
    cropY = Math.max(0, Math.floor((height - targetHeight) / 2));
  } else if (originalRatio > MAX_IG_ASPECT_RATIO) {
    // Too wide / panoramic landscape (e.g. 21:9). Crop left and right equally to achieve 1.91:1
    targetHeight = height;
    targetWidth = Math.floor(height * MAX_IG_ASPECT_RATIO);
    if (targetWidth > width) targetWidth = width;
    cropX = Math.max(0, Math.floor((width - targetWidth) / 2));
  }

  let cropped: Image;
  try {
    cropped = rawImage.crop(cropX, cropY, targetWidth, targetHeight);
  } catch (cropErr: unknown) {
    throw new Error(
      `Failed to crop image to Instagram-supported aspect ratio: ${cropErr instanceof Error ? cropErr.message : String(cropErr)}`
    );
  }

  let jpegBytes: Uint8Array;
  try {
    jpegBytes = await cropped.encodeJPEG(92);
  } catch (encodeErr: unknown) {
    throw new Error(
      `Failed to encode processed image for Instagram: ${encodeErr instanceof Error ? encodeErr.message : String(encodeErr)}`
    );
  }

  // 5. Store temporary processed image in existing 'gallery' bucket with a unique path
  const uniqueId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const tempStoragePath = `temp_instagram/${photoId}_${uniqueId}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('gallery')
    .upload(tempStoragePath, jpegBytes, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(
      `Failed to stage temporary Instagram-compatible image in storage: ${uploadError.message}`
    );
  }

  const tempPublicUrl = `${supabaseUrl}/storage/v1/object/public/gallery/${tempStoragePath}`;
  const finalRatio = targetWidth / targetHeight;

  return {
    imageUrl: tempPublicUrl,
    tempStoragePath,
    meta: {
      originalWidth: width,
      originalHeight: height,
      originalRatio: Number(originalRatio.toFixed(4)),
      finalWidth: targetWidth,
      finalHeight: targetHeight,
      finalRatio: Number(finalRatio.toFixed(4)),
      modified: true,
    },
  };
}

serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase server environment variables not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Authorize the user (Admin check)
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: missing authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await supabaseAuthClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Service-role client for DB reads & writes
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Verify admin access
    const { data: adminRecord } = await supabaseAdmin
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (!adminRecord) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: caller is not an authorized administrator' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve Meta Credentials: check secure database storage first, fallback to Edge Function Secrets
    const metaApiVersion = Deno.env.get('META_API_VERSION') || 'v19.0';
    let fbPageId = Deno.env.get('FACEBOOK_PAGE_ID') || Deno.env.get('META_PAGE_ID') || '';
    let fbPageAccessToken = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN') || Deno.env.get('META_PAGE_ACCESS_TOKEN') || Deno.env.get('META_ACCESS_TOKEN') || '';
    let fbPageName = 'Sri Sagar Driving School';
    let fbCredentialRecordId: string | null = null;
    let fbTokenType: string | null = null;
    let fbUpdatedAt: string | null = null;
    let fbCredentialSource: 'DATABASE' | 'ENVIRONMENT' = 'ENVIRONMENT';
    let fbDbQueryError: string | null = null;
    let fbDbRecordFound = false;

    try {
      const { data: dbCreds, error: dbError } = await supabaseAdmin
        .from('social_media_credentials')
        .select('*')
        .eq('platform', 'facebook')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) {
        fbDbQueryError = dbError.message;
        console.warn('[publish-social-post] Error querying social_media_credentials for Facebook:', dbError.message);
      } else if (dbCreds) {
        fbDbRecordFound = true;
        fbCredentialRecordId = dbCreds.id || null;
        fbTokenType = dbCreds.token_type || null;
        fbUpdatedAt = dbCreds.updated_at || null;
        if (dbCreds.access_token) {
          fbPageAccessToken = dbCreds.access_token;
          fbCredentialSource = 'DATABASE';
        }
        if (dbCreds.page_id || dbCreds.account_id) {
          fbPageId = dbCreds.page_id || dbCreds.account_id;
        }
        if (dbCreds.page_name || dbCreds.account_name) {
          fbPageName = dbCreds.page_name || dbCreds.account_name;
        }
      }
    } catch (dbErr) {
      fbDbQueryError = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.warn('[publish-social-post] Could not query social_media_credentials:', dbErr);
    }

    // Safe Diagnostic Snapshot
    const getFacebookDiagnostics = (endpointType: 'photos' | 'status_check') => ({
      credential_source: fbCredentialSource,
      database_record_id: fbCredentialRecordId,
      platform: 'facebook',
      page_id: fbPageId,
      token_type: fbTokenType || (fbCredentialSource === 'DATABASE' ? 'page' : 'env_fallback'),
      token_present: fbPageAccessToken ? 'YES' : 'NO',
      token_length: fbPageAccessToken ? fbPageAccessToken.length : 0,
      token_last_4: fbPageAccessToken && fbPageAccessToken.length >= 4 ? fbPageAccessToken.slice(-4) : 'N/A',
      credential_updated_at: fbUpdatedAt,
      meta_api_version: metaApiVersion,
      graph_endpoint: endpointType === 'photos'
        ? `https://graph.facebook.com/${metaApiVersion}/${fbPageId || 'PAGE_ID'}/photos`
        : `https://graph.facebook.com/${metaApiVersion}/${fbPageId || 'me'}`,
      database_query_error: fbDbQueryError ? `YES (${fbDbQueryError})` : 'NO',
      database_record_returned: fbDbRecordFound ? 'YES' : 'NO',
    });

    console.log('[publish-social-post:credential_loaded]', getFacebookDiagnostics('photos'));

    let igAccountId = Deno.env.get('INSTAGRAM_ACCOUNT_ID') || Deno.env.get('META_INSTAGRAM_ACCOUNT_ID') || '';
    let igAccessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN') || Deno.env.get('META_INSTAGRAM_ACCESS_TOKEN') || '';
    let igUsername = 'srisagardrivingschool';

    try {
      const { data: igDbCreds, error: igDbError } = await supabaseAdmin
        .from('social_media_credentials')
        .select('*')
        .eq('platform', 'instagram')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!igDbError && igDbCreds) {
        if (igDbCreds.access_token) {
          igAccessToken = igDbCreds.access_token;
        }
        if (igDbCreds.account_id || igDbCreds.page_id) {
          igAccountId = igDbCreds.account_id || igDbCreds.page_id;
        }
        if (igDbCreds.account_name || igDbCreds.page_name) {
          igUsername = (igDbCreds.account_name || igDbCreds.page_name).replace(/^@/, '');
        }
      }
    } catch (igErr) {
      console.warn('[publish-social-post] Could not query Instagram credentials:', igErr);
    }

    // 2. Parse payload
    const body: RequestPayload = await req.json().catch(() => ({}));
    const action = body.action || (body.photoId ? 'publish' : 'test_connection');

    // ACTION: TEST CONNECTION
    if (action === 'test_connection') {
      const fbStatus: { configured: boolean; connected: boolean; name?: string; id?: string; error?: string } = {
        configured: Boolean(fbPageId && fbPageAccessToken),
        connected: false,
      };

      const igStatus: { configured: boolean; connected: boolean; username?: string; id?: string; error?: string } = {
        configured: Boolean(igAccountId && igAccessToken),
        connected: false,
      };

      // Test Facebook Page token
      if (fbStatus.configured) {
        try {
          console.log('[publish-social-post:test_connection_facebook]', getFacebookDiagnostics('status_check'));
          const targetPath = fbPageId && fbPageId !== 'me' ? fbPageId : 'me';
          const fbRes = await fetch(
            `https://graph.facebook.com/${metaApiVersion}/${targetPath}?fields=id,name,link&access_token=${encodeURIComponent(fbPageAccessToken)}`
          );
          const fbData = await fbRes.json();
          if (fbRes.ok && fbData.id) {
            fbStatus.connected = true;
            fbStatus.name = fbData.name || fbPageName || 'Sri Sagar Driving School';
            fbStatus.id = fbData.id;
          } else {
            fbStatus.error = fbData.error?.message || 'Failed to authenticate Facebook Page token with Meta Graph API.';
          }
        } catch (e: unknown) {
          fbStatus.error = sanitizeError(e);
        }
      } else {
        fbStatus.error = 'SETUP REQUIRED: Facebook Page credentials not configured. Click "Reconnect Facebook" to connect.';
      }

      // Test Instagram Account via Meta Graph API or Instagram API
      if (igStatus.configured) {
        try {
          const targetPath = igAccountId && igAccountId !== 'me' ? igAccountId : 'me';
          let igRes = await fetch(
            `https://graph.facebook.com/${metaApiVersion}/${targetPath}?fields=id,username,name&access_token=${encodeURIComponent(igAccessToken)}`
          );
          let igData = await igRes.json();
          if (!igRes.ok || (!igData.id && !igData.username)) {
            const altRes = await fetch(
              `https://graph.instagram.com/v21.0/${targetPath}?fields=id,username,name,account_type&access_token=${encodeURIComponent(igAccessToken)}`
            );
            const altData = await altRes.json();
            if (altRes.ok && (altData.id || altData.username)) {
              igRes = altRes;
              igData = altData;
            }
          }

          if (igRes.ok && (igData.id || igData.username)) {
            igStatus.connected = true;
            igStatus.username = igData.username || igData.name || igUsername || 'srisagardrivingschool';
            igStatus.id = igData.id || igAccountId;
          } else {
            igStatus.error = igData.error?.error_user_msg || igData.error?.message || 'Failed to authenticate Instagram Account';
          }
        } catch (e: unknown) {
          igStatus.error = sanitizeError(e);
        }
      } else {
        igStatus.error = 'Instagram credentials not configured. Please click "Reconnect Instagram".';
      }

      return new Response(
        JSON.stringify({
          success: true,
          facebook: fbStatus,
          instagram: igStatus,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: PUBLISH
    const { photoId, retry = false } = body;
    const targetPlatforms = body.platforms && body.platforms.length > 0
      ? body.platforms
      : ['instagram', 'facebook'];

    if (!photoId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: photoId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Fetch photo record
    const { data: photo, error: photoFetchError } = await supabaseAdmin
      .from('gallery_photos')
      .select('*')
      .eq('id', photoId)
      .maybeSingle();

    if (photoFetchError || !photo) {
      return new Response(
        JSON.stringify({ error: 'Photo record not found in gallery_photos' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct full public image URL
    let imageUrl = body.imageUrl || photo.storage_path;
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      imageUrl = `${supabaseUrl}/storage/v1/object/public/gallery/${photo.storage_path}`;
    }

    // Prepare caption (use explicit caption, or fallback to description/title)
    const caption = (body.caption || photo.caption || photo.description || photo.title || '').trim();

    const results = {
      photoId,
      imageUrl,
      instagram: {
        status: photo.instagram_status || 'not_requested',
        postId: photo.instagram_post_id || null,
        error: photo.instagram_error || null,
      },
      facebook: {
        status: photo.facebook_status || 'not_requested',
        postId: photo.facebook_post_id || null,
        error: photo.facebook_error || null,
      },
    };

    // Update DB to mark publishing in progress for targeted platforms
    const progressUpdates: Record<string, unknown> = {};
    if (targetPlatforms.includes('instagram') && (!photo.instagram_post_id || retry)) {
      progressUpdates.instagram_status = 'publishing';
      progressUpdates.instagram_error = null;
    }
    if (targetPlatforms.includes('facebook') && (!photo.facebook_post_id || retry)) {
      progressUpdates.facebook_status = 'publishing';
      progressUpdates.facebook_error = null;
    }
    if (Object.keys(progressUpdates).length > 0) {
      await supabaseAdmin.from('gallery_photos').update(progressUpdates).eq('id', photoId);
    }

    const finalDbUpdates: Record<string, unknown> = {
      caption: caption || photo.caption,
    };

    // 4. Publish to Instagram Account via Instagram API (graph.instagram.com)
    if (targetPlatforms.includes('instagram')) {
      // Idempotency: if already published and not retrying, keep
      if (photo.instagram_status === 'published' && photo.instagram_post_id && !retry) {
        results.instagram.status = 'published';
        results.instagram.postId = photo.instagram_post_id;
      } else if (!igAccountId || !igAccessToken) {
        const missingMsg = 'SETUP REQUIRED: Instagram credentials not configured. Set INSTAGRAM_ACCOUNT_ID and INSTAGRAM_ACCESS_TOKEN in Supabase Edge Function Secrets.';
        results.instagram.status = 'failed';
        results.instagram.error = missingMsg;
        finalDbUpdates.instagram_status = 'failed';
        finalDbUpdates.instagram_error = missingMsg;
      } else {
        let preparedImage: PreparedImage | null = null;
        try {
          // Validate and prepare aspect-ratio compatible image URL for Instagram
          preparedImage = await prepareInstagramImage(
            supabaseAdmin,
            supabaseUrl,
            photoId,
            imageUrl
          );

          const igImageUrl = preparedImage.imageUrl;

          // Attach non-sensitive aspect ratio metadata
          (results.instagram as Record<string, unknown>).imageMeta = preparedImage.meta;

          const targetIgId = igAccountId && igAccountId !== 'me' ? igAccountId : 'me';

          // Step A: Create media container on graph.instagram.com
          const createUrl = `https://graph.instagram.com/v21.0/${targetIgId}/media`;
          const containerParams = new URLSearchParams({
            image_url: igImageUrl,
            caption: caption,
            access_token: igAccessToken,
          });

          const containerRes = await fetch(`${createUrl}?${containerParams.toString()}`, {
            method: 'POST',
          });

          const containerData = await containerRes.json();

          if (!containerRes.ok || containerData.error || !containerData.id) {
            const errDetail = containerData.error?.error_user_msg || containerData.error?.message || 'Failed to create Instagram media container';
            throw new Error(errDetail);
          }

          const containerId = containerData.id;

          // Step B: Check container status until ready (Meta processes image)
          let ready = false;
          for (let attempt = 0; attempt < 12; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const statusUrl = `https://graph.instagram.com/v21.0/${containerId}?fields=status_code,status&access_token=${igAccessToken}`;
            const statusRes = await fetch(statusUrl);
            const statusData = await statusRes.json();

            if (statusData.status_code === 'FINISHED') {
              ready = true;
              break;
            } else if (statusData.status_code === 'ERROR' || statusData.status_code === 'EXPIRED') {
              throw new Error(statusData.status || statusData.error?.message || 'Instagram media container processing failed on Meta servers');
            }
          }

          if (!ready) {
            throw new Error('Instagram media container processing timed out on Meta servers');
          }

          // Step C: Publish the media container on graph.instagram.com
          const publishUrl = `https://graph.instagram.com/v21.0/${targetIgId}/media_publish`;
          const publishParams = new URLSearchParams({
            creation_id: containerId,
            access_token: igAccessToken,
          });

          const publishRes = await fetch(`${publishUrl}?${publishParams.toString()}`, {
            method: 'POST',
          });

          const publishData = await publishRes.json();

          if (!publishRes.ok || publishData.error || !publishData.id) {
            const publishErrDetail = publishData.error?.error_user_msg || publishData.error?.message || 'Failed to publish media container to Instagram';
            throw new Error(publishErrDetail);
          }

          const igPostId = publishData.id;
          results.instagram.status = 'published';
          results.instagram.postId = igPostId;
          results.instagram.error = null;

          finalDbUpdates.instagram_status = 'published';
          finalDbUpdates.instagram_post_id = igPostId;
          finalDbUpdates.instagram_error = null;
          finalDbUpdates.instagram_published_at = new Date().toISOString();
        } catch (err: unknown) {
          const sanitized = sanitizeError(err);
          results.instagram.status = 'failed';
          results.instagram.error = sanitized;
          finalDbUpdates.instagram_status = 'failed';
          finalDbUpdates.instagram_error = sanitized;
        } finally {
          // Cleanup temporary processed image from storage after Meta has ingested/published it
          if (preparedImage?.tempStoragePath) {
            try {
              await supabaseAdmin.storage.from('gallery').remove([preparedImage.tempStoragePath]);
            } catch (cleanupErr) {
              console.warn('Failed to cleanup temporary Instagram image:', cleanupErr);
            }
          }
        }
      }
    }

    // 5. Publish to Facebook Page via Meta Graph API
    if (targetPlatforms.includes('facebook')) {
      // Idempotency: if already published and not retrying, keep
      if (photo.facebook_status === 'published' && photo.facebook_post_id && !retry) {
        results.facebook.status = 'published';
        results.facebook.postId = photo.facebook_post_id;
      } else if (!fbPageId || !fbPageAccessToken) {
        const missingMsg = 'SETUP REQUIRED: Facebook Page credentials not configured. Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN in Supabase Edge Function Secrets.';
        results.facebook.status = 'failed';
        results.facebook.error = missingMsg;
        finalDbUpdates.facebook_status = 'failed';
        finalDbUpdates.facebook_error = missingMsg;
      } else {
        try {
          // Diagnostic log immediately before Meta Graph API call
          console.log('[publish-social-post:pre_meta_request]', getFacebookDiagnostics('photos'));

          const fbPhotoUrl = `https://graph.facebook.com/${metaApiVersion}/${fbPageId}/photos`;
          const fbParams = new URLSearchParams({
            url: imageUrl,
            message: caption,
            access_token: fbPageAccessToken,
          });

          const fbRes = await fetch(`${fbPhotoUrl}?${fbParams.toString()}`, {
            method: 'POST',
          });

          const fbData = await fbRes.json();

          if (!fbRes.ok || fbData.error) {
            throw new Error(fbData.error?.message || 'Failed to publish photo to Facebook Page');
          }

          const fbPostId = fbData.post_id || fbData.id;
          results.facebook.status = 'published';
          results.facebook.postId = fbPostId;
          results.facebook.error = null;

          finalDbUpdates.facebook_status = 'published';
          finalDbUpdates.facebook_post_id = fbPostId;
          finalDbUpdates.facebook_error = null;
          finalDbUpdates.facebook_published_at = new Date().toISOString();
        } catch (err: unknown) {
          const sanitized = sanitizeError(err);
          results.facebook.status = 'failed';
          results.facebook.error = sanitized;
          finalDbUpdates.facebook_status = 'failed';
          finalDbUpdates.facebook_error = sanitized;
        }
      }
    }

    // 6. Save publishing outcomes back to Supabase database (gallery_photos)
    if (Object.keys(finalDbUpdates).length > 0) {
      await supabaseAdmin
        .from('gallery_photos')
        .update(finalDbUpdates)
        .eq('id', photoId);
    }

    // 7. Insert / Update record in social_media_posts history table
    try {
      await supabaseAdmin.from('social_media_posts').insert({
        gallery_photo_id: photoId,
        caption: caption,
        instagram_status: results.instagram.status as string,
        facebook_status: results.facebook.status as string,
        instagram_media_id: results.instagram.postId,
        facebook_post_id: results.facebook.postId,
        instagram_error: results.instagram.error,
        facebook_error: results.facebook.error,
        published_at: (results.instagram.status === 'published' || results.facebook.status === 'published') ? new Date().toISOString() : null,
        instagram_published_at: results.instagram.status === 'published' ? new Date().toISOString() : null,
        facebook_published_at: results.facebook.status === 'published' ? new Date().toISOString() : null,
      });
    } catch (historyErr) {
      console.warn('Could not write to social_media_posts history:', historyErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMsg = sanitizeError(err);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
