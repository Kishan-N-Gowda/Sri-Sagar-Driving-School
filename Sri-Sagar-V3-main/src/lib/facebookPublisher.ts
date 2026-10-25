import { supabase } from './supabase';

export interface PublishFacebookParams {
  message: string;
  imageUrl?: string | null;
  photoId?: string | null;
}

export interface PublishFacebookResult {
  success: boolean;
  postId?: string | null;
  message?: string;
  error?: string | null;
  isAuthExpired?: boolean;
}

/**
 * Publishes a post or photo to the Facebook Business Page via the Supabase Edge Function `publish-social-post`.
 *
 * Security & Integrity:
 * - Uses the authenticated Supabase session access token in the Authorization header.
 * - Facebook Page Access Token and Page ID are retrieved from `social_media_credentials` server-side.
 * - No Facebook secrets or access tokens are ever handled or exposed in frontend code or console logs.
 */
export async function publishFacebookPost({
  message,
  imageUrl,
  photoId,
}: PublishFacebookParams): Promise<PublishFacebookResult> {
  const trimmedMessage = message?.trim();
  if (!trimmedMessage) {
    return {
      success: false,
      error: 'Please enter a message for the Facebook post.',
    };
  }

  // 1. Get current authenticated Supabase session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (sessionError || !session || !session.access_token) {
    return {
      success: false,
      error: 'Your session has expired. Please log in again to publish to Facebook.',
      isAuthExpired: true,
    };
  }

  // 2. Mark database status as publishing if attached to a gallery photo
  if (photoId) {
    try {
      await supabase
        .from('gallery_photos')
        .update({
          facebook_status: 'publishing',
          facebook_error: null,
        })
        .eq('id', photoId);
    } catch {
      // Non-blocking database status update
    }
  }

  try {
    // 3. Call the deployed Supabase Edge Function `publish-social-post`
    const { data, error } = await supabase.functions.invoke('publish-social-post', {
      body: {
        action: 'publish',
        photoId: photoId || undefined,
        imageUrl: imageUrl || undefined,
        caption: trimmedMessage,
        platforms: ['facebook'],
        retry: true,
      },
    });

    if (error) {
      const isAuthIssue = error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('Unauthorized');
      const errorMsg = error.message || 'Facebook publishing request failed.';

      if (photoId) {
        await supabase
          .from('gallery_photos')
          .update({
            facebook_status: 'failed',
            facebook_error: errorMsg,
          })
          .eq('id', photoId);
      }

      return {
        success: false,
        error: errorMsg,
        isAuthExpired: isAuthIssue,
      };
    }

    const fbResult = data?.facebook;
    if (fbResult && fbResult.status === 'published') {
      const postId = fbResult.postId || null;

      if (photoId) {
        await supabase
          .from('gallery_photos')
          .update({
            facebook_status: 'published',
            facebook_post_id: postId,
            facebook_published_at: new Date().toISOString(),
            facebook_error: null,
          })
          .eq('id', photoId);
      }

      return {
        success: true,
        postId,
        message: 'Published successfully to Facebook Page.',
      };
    }

    const failureReason = fbResult?.error || data?.error || 'Facebook publishing failed.';
    if (photoId) {
      await supabase
        .from('gallery_photos')
        .update({
          facebook_status: 'failed',
          facebook_error: failureReason,
        })
        .eq('id', photoId);
    }

    return {
      success: false,
      error: failureReason,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'Network error occurred while connecting to the Facebook publishing service.';

    if (photoId) {
      try {
        await supabase
          .from('gallery_photos')
          .update({
            facebook_status: 'failed',
            facebook_error: errorMsg,
          })
          .eq('id', photoId);
      } catch {
        // Non-blocking
      }
    }

    return {
      success: false,
      error: errorMsg,
    };
  }
}

