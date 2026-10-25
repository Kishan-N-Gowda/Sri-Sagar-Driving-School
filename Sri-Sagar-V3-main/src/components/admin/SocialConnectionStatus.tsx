import {
  AlertCircle,
  CheckCircle2,
  Facebook,
  Instagram,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  KeyRound,
  Check,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabase, supabaseUrl } from '@/lib/supabase';

interface PlatformStatus {
  configured: boolean;
  connected: boolean;
  name?: string;
  username?: string;
  id?: string;
  error?: string;
  is_auth_expired?: boolean;
}

interface ConnectionResult {
  facebook: PlatformStatus;
  instagram: PlatformStatus;
}

export function SocialConnectionStatus() {
  const [testing, setTesting] = useState(false);
  const [reconnectingFb, setReconnectingFb] = useState(false);
  const [reconnectingIg, setReconnectingIg] = useState(false);
  const [lastTested, setLastTested] = useState<Date | null>(null);
  const [connectionData, setConnectionData] =
    useState<ConnectionResult | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const popupRef = useRef<Window | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );

  const isAuthCompletedRef = useRef(false);
  const authPlatformRef = useRef<'facebook' | 'instagram' | null>(null);

  /*
   * ---------------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------------
   */

  const cleanupAuth = () => {
    if (pollIntervalRef.current !== null) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
      messageHandlerRef.current = null;
    }

    if (popupRef.current && !popupRef.current.closed) {
      try {
        popupRef.current.close();
      } catch {
        // Ignore popup close errors.
      }
    }

    popupRef.current = null;

    setReconnectingFb(false);
    setReconnectingIg(false);
  };

  /*
   * ---------------------------------------------------------
   * TRUSTED OAUTH ORIGIN
   * ---------------------------------------------------------
   */

  const isTrustedOAuthOrigin = (origin: string): boolean => {
    if (!origin) return false;

    try {
      const messageOrigin = new URL(origin).origin.toLowerCase();
      const currentOrigin = new URL(window.location.origin)
        .origin.toLowerCase();

      if (messageOrigin === currentOrigin) {
        return true;
      }

      if (supabaseUrl) {
        const configuredSupabaseOrigin = new URL(supabaseUrl)
          .origin.toLowerCase();

        if (messageOrigin === configuredSupabaseOrigin) {
          return true;
        }
      }

      if (
        messageOrigin ===
        'https://wcurzjcdqxkahcardcyi.supabase.co'
      ) {
        return true;
      }

      if (
        window.location.hostname === 'localhost' &&
        messageOrigin.includes('localhost')
      ) {
        return true;
      }
    } catch {
      return false;
    }

    return false;
  };

  /*
   * ---------------------------------------------------------
   * ERROR FORMATTER
   * ---------------------------------------------------------
   */

  const formatErrorMessage = (rawError?: string | null): string => {
    if (!rawError) {
      return 'Connection expired. Please reconnect your account.';
    }

    const text = String(rawError);

    if (
      text.includes('Session has been invalidated') ||
      text.includes('user logged out') ||
      text.includes('Error validating access token') ||
      text.includes('token is expired') ||
      text.includes('invalid_token') ||
      text.includes('OAuthException')
    ) {
      return 'Connection expired. Please reconnect your account.';
    }

    if (
      text.includes('access_denied') ||
      text.includes('cancelled') ||
      text.includes('denied')
    ) {
      return 'Authorization was cancelled or denied.';
    }

    if (
      text.includes('permission') ||
      text.includes('pages_manage_posts') ||
      text.includes('pages_show_list') ||
      text.includes('instagram_business_basic') ||
      text.includes('instagram_business_content_publish')
    ) {
      return 'Missing required permissions. Please reconnect and grant the requested permissions in Meta.';
    }

    if (
      text.includes('No Instagram Professional') ||
      text.includes('Instagram Professional')
    ) {
      return 'No Instagram Professional/Business account found linked to your Facebook Page. Please ensure your Instagram is connected to your Facebook Page in Meta Business Suite.';
    }

    if (
      text.includes('No Facebook Pages') ||
      text.includes('Page not accessible')
    ) {
      return 'Sri Sagar Driving School Facebook Page was not found in the connected account.';
    }

    if (
      text.includes('redirect_uri') ||
      text.includes('redirect URI') ||
      text.includes('Invalid redirect')
    ) {
      return 'Invalid Meta redirect URI. Please check the Meta Developer App OAuth redirect URI configuration.';
    }

    if (
      text.includes('HTML') ||
      text.includes('<!DOCTYPE') ||
      text.includes('<html')
    ) {
      return 'Authentication response could not be parsed. Please try reconnecting.';
    }

    return text.length > 180
      ? `${text.slice(0, 180)}...`
      : text;
  };

  /*
   * ---------------------------------------------------------
   * TEST CONNECTION
   * ---------------------------------------------------------
   */

  const testConnection = async (): Promise<(ConnectionResult & { facebookConnected: boolean }) | null> => {
    setTesting(true);
    setErrorNotice(null);

    try {
      /*
       * FACEBOOK
       */

      let fbStatus: PlatformStatus = {
        configured: false,
        connected: false,
        name: 'Sri Sagar Driving School',
      };

      try {
        const serverStatusRes = await fetch(
          '/api/auth/facebook/status',
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (serverStatusRes.ok) {
          const serverStatus = await serverStatusRes.json();

          if (serverStatus.success) {
            fbStatus = {
              configured: Boolean(serverStatus.configured),
              connected: Boolean(serverStatus.connected),
              name:
                serverStatus.page_name ||
                'Sri Sagar Driving School',
              id: serverStatus.page_id,
              error: serverStatus.error
                ? formatErrorMessage(serverStatus.error)
                : undefined,
              is_auth_expired: Boolean(
                serverStatus.is_auth_expired
              ),
            };
          }
        }
      } catch {
        // Continue to Supabase Edge Function.
      }

      /*
       * FACEBOOK EDGE FUNCTION
       */

      const {
        data: facebookStatus,
        error: facebookStatusError,
      } = await supabase.functions.invoke('facebook-auth', {
        body: {
          action: 'test_connection',
        },
      });

      /*
       * INSTAGRAM DEFAULT STATUS
       */

      let instagramStatus: PlatformStatus = {
        configured: false,
        connected: false,
        username: 'srisagardrivingschool',
        error:
          'Instagram credentials not configured. Please click "Reconnect Instagram".',
      };

      /*
       * INSTAGRAM LOCAL API
       */

      let igCheckedViaApi = false;

      try {
        const igServerRes = await fetch(
          '/api/auth/instagram/status',
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (igServerRes.ok) {
          const igServerData = await igServerRes.json();

          if (igServerData.success) {
            instagramStatus = {
              configured: Boolean(
                igServerData.configured
              ),
              connected: Boolean(
                igServerData.connected
              ),
              username:
                igServerData.username ||
                'srisagardrivingschool',
              id: igServerData.id,
              error: igServerData.error
                ? formatErrorMessage(
                    igServerData.error
                  )
                : undefined,
              is_auth_expired: Boolean(
                igServerData.is_auth_expired
              ),
            };

            igCheckedViaApi = true;
          }
        }
      } catch {
        // Continue to Edge Function.
      }

      /*
       * INSTAGRAM EDGE FUNCTION
       */

      if (!igCheckedViaApi || !instagramStatus.connected) {
        try {
          const {
            data: socialData,
            error: socialError,
          } = await supabase.functions.invoke(
            'publish-social-post',
            {
              body: {
                action: 'test_connection',
              },
            }
          );

          if (
            !socialError &&
            socialData?.instagram
          ) {
            instagramStatus = {
              ...socialData.instagram,
              username:
                socialData.instagram.username ||
                instagramStatus.username ||
                'srisagardrivingschool',
              error: socialData.instagram.error
                ? formatErrorMessage(
                    socialData.instagram.error
                  )
                : undefined,
            };
          } else if (
            socialError &&
            !igCheckedViaApi
          ) {
            instagramStatus.error =
              formatErrorMessage(
                socialError.message
              );
          }
        } catch (instagramError: unknown) {
          if (!igCheckedViaApi) {
            instagramStatus.error =
              formatErrorMessage(
                instagramError instanceof Error
                  ? instagramError.message
                  : String(instagramError)
              );
          }
        }
      }

      /*
       * FACEBOOK ERROR
       */

      if (facebookStatusError) {
        console.error(
          'Facebook status check failed:',
          facebookStatusError
        );

        const fallbackData = {
          facebook: fbStatus,
          instagram: instagramStatus,
        };

        setConnectionData(fallbackData);
        setLastTested(new Date());

        return {
          ...fallbackData,
          facebookConnected: Boolean(
            fbStatus.connected &&
              !fbStatus.error
          ),
        };
      }

      /*
       * FACEBOOK FINAL STATUS
       */

      const facebookCredential =
        facebookStatus?.credential;

      const finalFacebook: PlatformStatus = {
        configured: Boolean(
          facebookCredential ||
            fbStatus.configured
        ),

        connected: Boolean(
          facebookStatus?.connected ||
            fbStatus.connected
        ),

        name:
          facebookStatus?.pageName ||
          facebookCredential?.page_name ||
          facebookCredential?.account_name ||
          fbStatus.name ||
          'Sri Sagar Driving School',

        id:
          facebookCredential?.page_id ||
          facebookCredential?.account_id ||
          fbStatus.id,

        error: facebookStatus?.error
          ? formatErrorMessage(
              facebookStatus.error
            )
          : fbStatus.error,

        is_auth_expired:
          fbStatus.is_auth_expired ||
          false,
      };

      const finalData = {
        facebook: finalFacebook,
        instagram: instagramStatus,
      };

      setConnectionData(finalData);
      setLastTested(new Date());

      return {
        ...finalData,
        facebookConnected: Boolean(
          finalFacebook.connected &&
            !finalFacebook.error
        ),
      };
    } catch (err: unknown) {
      setErrorNotice(
        formatErrorMessage(
          err instanceof Error
            ? err.message
            : String(err)
        )
      );

      return null;
    } finally {
      setTesting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * FACEBOOK RECONNECT
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * The popup is only responsible for OAuth.
   * The OAuth callback must send a postMessage back
   * to the admin window and then close itself.
   *
   * We DO NOT inspect popup.location.href.
   * We DO NOT assume popup closing means cancellation.
   * ---------------------------------------------------------
   */

  const handleReconnectFacebook = async () => {
    cleanupAuth();

    isAuthCompletedRef.current = false;
    authPlatformRef.current = 'facebook';

    setReconnectingFb(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    /*
     * Message listener MUST be installed before popup opens.
     */

    const handleAuthMessage = async (
      event: MessageEvent
    ) => {
      if (isAuthCompletedRef.current) {
        return;
      }

      if (!isTrustedOAuthOrigin(event.origin)) {
        return;
      }

      if (
        !event.data ||
        typeof event.data !== 'object'
      ) {
        return;
      }

      const messageType = event.data.type;

      if (
        messageType !==
          'FACEBOOK_AUTH_COMPLETE' &&
        messageType !== 'FB_AUTH_SUCCESS' &&
        messageType !== 'FB_AUTH_ERROR'
      ) {
        return;
      }

      isAuthCompletedRef.current = true;

      /*
       * Stop polling immediately.
       */

      if (pollIntervalRef.current !== null) {
        window.clearInterval(
          pollIntervalRef.current
        );
        pollIntervalRef.current = null;
      }

      /*
       * Remove message listener.
       */

      if (messageHandlerRef.current) {
        window.removeEventListener(
          'message',
          messageHandlerRef.current
        );

        messageHandlerRef.current = null;
      }

      /*
       * Close OAuth popup.
       */

      if (
        popupRef.current &&
        !popupRef.current.closed
      ) {
        try {
          popupRef.current.close();
        } catch {
          // Ignore.
        }
      }

      popupRef.current = null;
      setReconnectingFb(false);

      /*
       * OAuth failed.
       */

      if (
        event.data.success === false ||
        messageType === 'FB_AUTH_ERROR'
      ) {
        setSuccessNotice(null);

        setErrorNotice(
          formatErrorMessage(
            event.data.error
          )
        );

        return;
      }

      /*
       * OAuth succeeded.
       */

      const pageName =
        event.data.pageName ||
        event.data.page_name ||
        'Sri Sagar Driving School';

      setSuccessNotice(
        `Facebook connected successfully (${pageName}) ✓`
      );

      setErrorNotice(null);

      /*
       * Allow backend/database a moment to finish saving
       * the new credentials.
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 800)
      );

      await testConnection();
    };

    messageHandlerRef.current =
      handleAuthMessage;

    window.addEventListener(
      'message',
      handleAuthMessage
    );

    try {
      /*
       * Request OAuth URL from Supabase.
       */

      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          'facebook-auth',
          {
            body: {
              action: 'get_auth_url',
              app_origin:
                window.location.origin,
            },
          }
        );

      if (error) {
        throw new Error(
          formatErrorMessage(error.message)
        );
      }

      const authUrl =
        data?.auth_url ||
        data?.authUrl;

      if (!authUrl) {
        throw new Error(
          data?.error ||
            'Could not initiate Facebook authentication. Please check your Meta App configuration.'
        );
      }

      /*
       * Open OAuth popup.
       */

      const width = 620;
      const height = 740;

      const left = Math.max(
        0,
        window.screenX +
          (window.outerWidth - width) / 2
      );

      const top = Math.max(
        0,
        window.screenY +
          (window.outerHeight - height) / 2
      );

      const popup = window.open(
        authUrl,
        'meta_oauth_reconnect_fb',
        [
          `width=${width}`,
          `height=${height}`,
          `left=${left}`,
          `top=${top}`,
          'status=no',
          'toolbar=no',
          'menubar=no',
          'resizable=yes',
          'scrollbars=yes',
        ].join(',')
      );

      if (!popup) {
        cleanupAuth();

        setErrorNotice(
          'Please allow popups for this website and click "Reconnect Facebook" again.'
        );

        return;
      }

      popupRef.current = popup;

      try {
        popup.focus();
      } catch {
        // Ignore.
      }

      /*
       * Popup closed polling.
       *
       * IMPORTANT:
       * A closed popup is NOT immediately treated as
       * cancellation. We first give the callback a chance
       * to send its postMessage.
       */

      pollIntervalRef.current =
        window.setInterval(async () => {
          if (!popup.closed) {
            return;
          }

          if (isAuthCompletedRef.current) {
            return;
          }

          /*
           * Stop polling.
           */

          if (
            pollIntervalRef.current !== null
          ) {
            window.clearInterval(
              pollIntervalRef.current
            );

            pollIntervalRef.current = null;
          }

          if (messageHandlerRef.current) {
            window.removeEventListener(
              'message',
              messageHandlerRef.current
            );

            messageHandlerRef.current =
              null;
          }

          popupRef.current = null;
          setReconnectingFb(false);

          /*
           * Give backend time to save credentials.
           */

          await new Promise((resolve) =>
            setTimeout(resolve, 1200)
          );

          if (isAuthCompletedRef.current) {
            return;
          }

          const result =
            await testConnection();

          if (
            result?.facebookConnected
          ) {
            isAuthCompletedRef.current =
              true;

            setSuccessNotice(
              `Facebook connected successfully (${result.facebook?.name || 'Sri Sagar Driving School'}) ✓`
            );

            setErrorNotice(null);

            return;
          }

          /*
           * Only now report cancellation.
           */

          if (
            !isAuthCompletedRef.current
          ) {
            setErrorNotice(
              'Facebook reconnection was cancelled or was not completed.'
            );

            setSuccessNotice(null);
          }
        }, 500);
    } catch (err: unknown) {
      setErrorNotice(
        formatErrorMessage(
          err instanceof Error
            ? err.message
            : String(err)
        )
      );

      cleanupAuth();
    }
  };

  /*
   * ---------------------------------------------------------
   * INSTAGRAM RECONNECT
   * ---------------------------------------------------------
   */

  const handleReconnectInstagram = async () => {
    cleanupAuth();

    isAuthCompletedRef.current = false;
    authPlatformRef.current = 'instagram';

    setReconnectingIg(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          'facebook-auth',
          {
            body: {
              action:
                'get_instagram_auth_url',
              platform: 'instagram',
              app_origin:
                window.location.origin,
            },
          }
        );

      if (error) {
        throw new Error(
          formatErrorMessage(
            error.message
          )
        );
      }

      const authUrl =
        data?.auth_url ||
        data?.authUrl;

      if (!authUrl) {
        throw new Error(
          data?.error ||
            'Could not initiate Instagram authentication. Please check your Meta App configuration.'
        );
      }

      /*
       * Message listener.
       */

      const handleAuthMessage = async (
        event: MessageEvent
      ) => {
        if (isAuthCompletedRef.current) {
          return;
        }

        if (
          !isTrustedOAuthOrigin(
            event.origin
          )
        ) {
          return;
        }

        if (
          !event.data ||
          typeof event.data !== 'object'
        ) {
          return;
        }

        const messageType =
          event.data.type;

        if (
          messageType !==
            'INSTAGRAM_AUTH_COMPLETE' &&
          messageType !== 'IG_AUTH_SUCCESS' &&
          messageType !== 'IG_AUTH_ERROR'
        ) {
          return;
        }

        isAuthCompletedRef.current =
          true;

        cleanupAuth();

        /*
         * Error.
         */

        if (
          event.data.success === false ||
          messageType === 'IG_AUTH_ERROR'
        ) {
          setErrorNotice(
            formatErrorMessage(
              event.data.error
            )
          );

          setSuccessNotice(null);

          await testConnection();

          return;
        }

        /*
         * Success.
         */

        const username =
          event.data.username ||
          event.data.igUsername ||
          'srisagardrivingschool';

        setSuccessNotice(
          `Instagram connected successfully (@${String(
            username
          ).replace(/^@/, '')}) ✓`
        );

        setErrorNotice(null);

        await new Promise((resolve) =>
          setTimeout(resolve, 800)
        );

        await testConnection();
      };

      messageHandlerRef.current =
        handleAuthMessage;

      window.addEventListener(
        'message',
        handleAuthMessage
      );

      /*
       * Open popup.
       */

      const width = 620;
      const height = 740;

      const left = Math.max(
        0,
        window.screenX +
          (window.outerWidth - width) / 2
      );

      const top = Math.max(
        0,
        window.screenY +
          (window.outerHeight - height) / 2
      );

      const popup = window.open(
        authUrl,
        'meta_oauth_reconnect_ig',
        [
          `width=${width}`,
          `height=${height}`,
          `left=${left}`,
          `top=${top}`,
          'status=no',
          'toolbar=no',
          'menubar=no',
          'resizable=yes',
          'scrollbars=yes',
        ].join(',')
      );

      /*
       * Popup blocked.
       */

      if (!popup) {
        cleanupAuth();

        setErrorNotice(
          'Please allow popups for this website and click "Reconnect Instagram" again.'
        );

        return;
      }

      popupRef.current = popup;

      try {
        popup.focus();
      } catch {
        // Ignore.
      }

      /*
       * Detect manual popup close.
       */

      pollIntervalRef.current =
        window.setInterval(async () => {
          if (!popup.closed) {
            return;
          }

          if (isAuthCompletedRef.current) {
            return;
          }

          if (
            pollIntervalRef.current !== null
          ) {
            window.clearInterval(
              pollIntervalRef.current
            );

            pollIntervalRef.current = null;
          }

          if (messageHandlerRef.current) {
            window.removeEventListener(
              'message',
              messageHandlerRef.current
            );

            messageHandlerRef.current =
              null;
          }

          popupRef.current = null;
          setReconnectingIg(false);

          await new Promise((resolve) =>
            setTimeout(resolve, 1200)
          );

          if (isAuthCompletedRef.current) {
            return;
          }

          /*
           * Report cancellation / failure if no auth success message was received.
           * Do NOT treat pre-existing database credentials as a new success.
           */
          if (!isAuthCompletedRef.current) {
            setErrorNotice(
              'Instagram reconnection was cancelled or was not completed.'
            );

            setSuccessNotice(null);

            await testConnection();
          }
        }, 500);
    } catch (err: unknown) {
      setErrorNotice(
        formatErrorMessage(
          err instanceof Error
            ? err.message
            : String(err)
        )
      );

      cleanupAuth();
    }
  };

  /*
   * ---------------------------------------------------------
   * HANDLE OAUTH CALLBACK PARAMETERS
   * ---------------------------------------------------------
   *
   * This supports the callback page if the OAuth callback
   * redirects back to this application.
   *
   * If opened as a popup, it sends the result to the
   * original admin window and closes itself.
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const fbConnected =
      params.get('fb_connected');

    const fbError =
      params.get('fb_error');

    const pageName =
      params.get('page_name');

    const igConnected =
      params.get('ig_connected');

    const igError =
      params.get('ig_error');

    const igUsername =
      params.get('ig_username');

    /*
     * FACEBOOK SUCCESS
     */

    if (fbConnected === 'true') {
      const displayPage =
        pageName
          ? decodeURIComponent(pageName)
          : 'Sri Sagar Driving School';

      if (
        window.opener &&
        !window.opener.closed
      ) {
        try {
          window.opener.postMessage(
            {
              type:
                'FACEBOOK_AUTH_COMPLETE',
              success: true,
              pageName: displayPage,
              platform: 'facebook',
            },
            window.location.origin
          );
        } catch {
          // Ignore.
        }

        /*
         * Close callback popup.
         *
         * IMPORTANT:
         * The parent window will receive the
         * postMessage BEFORE this popup closes.
         */

        try {
          window.close();
          return;
        } catch {
          // Ignore.
        }
      }

      /*
       * If opened directly, show success.
       */

      setSuccessNotice(
        `Facebook connected successfully (${displayPage}) ✓`
      );

      setErrorNotice(null);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      void testConnection();

      return;
    }

    /*
     * FACEBOOK ERROR
     */

    if (fbError) {
      const errText =
        decodeURIComponent(fbError);

      if (
        window.opener &&
        !window.opener.closed
      ) {
        try {
          window.opener.postMessage(
            {
              type:
                'FACEBOOK_AUTH_COMPLETE',
              success: false,
              error: errText,
              platform: 'facebook',
            },
            window.location.origin
          );
        } catch {
          // Ignore.
        }

        try {
          window.close();
          return;
        } catch {
          // Ignore.
        }
      }

      setErrorNotice(
        formatErrorMessage(errText)
      );

      setSuccessNotice(null);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      void testConnection();

      return;
    }

    /*
     * INSTAGRAM SUCCESS
     */

    if (igConnected === 'true') {
      const displayIg =
        igUsername
          ? decodeURIComponent(
              igUsername
            ).replace(/^@/, '')
          : 'srisagardrivingschool';

      if (
        window.opener &&
        !window.opener.closed
      ) {
        try {
          window.opener.postMessage(
            {
              type:
                'INSTAGRAM_AUTH_COMPLETE',
              success: true,
              username: displayIg,
              platform: 'instagram',
            },
            window.location.origin
          );
        } catch {
          // Ignore.
        }

        try {
          window.close();
          return;
        } catch {
          // Ignore.
        }
      }

      setSuccessNotice(
        `Instagram connected successfully (@${displayIg}) ✓`
      );

      setErrorNotice(null);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      void testConnection();

      return;
    }

    /*
     * INSTAGRAM ERROR
     */

    if (igError) {
      const errText =
        decodeURIComponent(igError);

      if (
        window.opener &&
        !window.opener.closed
      ) {
        try {
          window.opener.postMessage(
            {
              type:
                'INSTAGRAM_AUTH_COMPLETE',
              success: false,
              error: errText,
              platform: 'instagram',
            },
            window.location.origin
          );
        } catch {
          // Ignore.
        }

        try {
          window.close();
          return;
        } catch {
          // Ignore.
        }
      }

      setErrorNotice(
        formatErrorMessage(errText)
      );

      setSuccessNotice(null);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      void testConnection();

      return;
    }

    /*
     * NORMAL ADMIN PANEL LOAD
     */

    void testConnection();

    const handleVisibilityOrFocus =
      () => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          void testConnection();
        }
      };

    window.addEventListener(
      'focus',
      handleVisibilityOrFocus
    );

    document.addEventListener(
      'visibilitychange',
      handleVisibilityOrFocus
    );

    return () => {
      window.removeEventListener(
        'focus',
        handleVisibilityOrFocus
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityOrFocus
      );

      cleanupAuth();
    };

    // This initialization should only happen once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div
      id="social-connection-panel"
      className="w-full max-w-full overflow-hidden rounded-2xl border border-[#e2e0db] bg-white p-4 sm:p-6 shadow-xs"
    >
      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-black/5 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-2.5 w-2.5 shrink-0 rounded-full ${
                connectionData?.facebook.connected &&
                connectionData?.instagram.connected
                  ? 'bg-emerald-500 animate-pulse'
                  : connectionData?.facebook
                        .connected ||
                    connectionData?.instagram
                        .connected
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
            />

            <h3 className="font-display text-base font-extrabold text-[#0a1628] truncate">
              Social Media Connection Status
            </h3>
          </div>

          <p className="text-xs text-slate-500 mt-0.5 break-words">
            Meta Graph API Integration
            {lastTested &&
              ` · Verified ${lastTested.toLocaleTimeString()}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="test-social-connection-btn"
            type="button"
            disabled={
              testing ||
              reconnectingFb ||
              reconnectingIg
            }
            onClick={() =>
              void testConnection()
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0a1628] px-3.5 py-2 text-xs font-bold text-white hover:bg-black transition disabled:opacity-50 cursor-pointer"
          >
            {testing ? (
              <LoaderCircle
                className="animate-spin"
                size={14}
              />
            ) : (
              <RefreshCw size={14} />
            )}

            {testing
              ? 'Testing...'
              : 'Test Connection'}
          </button>
        </div>
      </div>

      {/* ERROR */}

      {errorNotice && (
        <div
          id="social-error-notice"
          className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700 break-words"
        >
          <AlertCircle
            size={16}
            className="shrink-0 mt-0.5 text-red-600"
          />

          <div className="min-w-0 flex-1">
            <p>{errorNotice}</p>
          </div>
        </div>
      )}

      {/* SUCCESS */}

      {successNotice && (
        <div
          id="social-success-notice"
          className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 break-words"
        >
          <CheckCircle2
            size={16}
            className="shrink-0 mt-0.5 text-emerald-600"
          />

          <span className="min-w-0 flex-1">
            {successNotice}
          </span>
        </div>
      )}

      {/* PLATFORM GRID */}

      <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {/* FACEBOOK */}

        <div
          id="facebook-connection-card"
          className="rounded-xl border border-[#e2e0db] bg-[#faf9f6] p-3.5 sm:p-4 flex flex-col justify-between min-w-0 w-full overflow-hidden"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1877F2] text-white shadow-xs">
                  <Facebook size={17} />
                </span>

                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-[#0a1628] truncate">
                    Facebook Page
                  </span>

                  <span
                    className="block text-[11px] text-slate-500 truncate font-medium"
                    title={
                      connectionData?.facebook
                        .name ||
                      'Sri Sagar Driving School'
                    }
                  >
                    {connectionData?.facebook
                      .name ||
                      'Sri Sagar Driving School'}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {connectionData ? (
                  connectionData.facebook
                    .connected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2
                        size={13}
                        className="text-emerald-600"
                      />
                      Connected ✓
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                      <ShieldAlert
                        size={13}
                        className="text-amber-600"
                      />
                      Reconnect Required
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    Checking...
                  </span>
                )}
              </div>
            </div>

            {connectionData &&
              !connectionData.facebook
                .connected && (
                <p className="mt-2.5 text-[11px] text-amber-800/90 leading-relaxed bg-amber-50/70 rounded-lg p-2.5 border border-amber-200/50 break-words">
                  {connectionData.facebook
                    .error ||
                    'Facebook connection expired. Please reconnect your Facebook account.'}
                </p>
              )}

            {connectionData &&
              connectionData.facebook
                .connected && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/70 rounded-lg p-2 border border-emerald-200/50">
                  <Check
                    size={12}
                    className="text-emerald-600 shrink-0"
                  />

                  <span className="truncate">
                    Page token active for{' '}
                    <strong>
                      {connectionData.facebook
                        .name ||
                        'Sri Sagar Driving School'}
                    </strong>
                  </span>
                </div>
              )}
          </div>

          {/* FACEBOOK BUTTON */}

          <div className="mt-3.5 pt-3 border-t border-black/5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] text-slate-500 font-medium truncate">
              {connectionData?.facebook
                .connected
                ? 'Refresh or switch Page'
                : 'Authorize Meta permissions'}
            </span>

            <button
              id="reconnect-facebook-btn"
              type="button"
              disabled={
                reconnectingFb ||
                reconnectingIg ||
                testing
              }
              onClick={() =>
                void handleReconnectFacebook()
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1877F2] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#166fe5] transition disabled:opacity-50 shadow-xs shrink-0 w-full sm:w-auto cursor-pointer"
            >
              {reconnectingFb ? (
                <LoaderCircle
                  className="animate-spin"
                  size={13}
                />
              ) : (
                <KeyRound size={13} />
              )}

              {reconnectingFb
                ? 'Opening Meta Login...'
                : 'Reconnect Facebook'}
            </button>
          </div>
        </div>

        {/* INSTAGRAM */}

        <div
          id="instagram-connection-card"
          className="rounded-xl border border-[#e2e0db] bg-[#faf9f6] p-3.5 sm:p-4 flex flex-col justify-between min-w-0 w-full overflow-hidden"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-xs">
                  <Instagram size={17} />
                </span>

                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-[#0a1628] truncate">
                    Instagram Professional
                  </span>

                  <span
                    className="block text-[11px] text-slate-500 truncate font-medium"
                    title={
                      connectionData?.instagram
                        .username
                        ? `@${connectionData.instagram.username.replace(
                            /^@/,
                            ''
                          )}`
                        : '@srisagardrivingschool'
                    }
                  >
                    {connectionData?.instagram
                      .username
                      ? `@${connectionData.instagram.username.replace(
                          /^@/,
                          ''
                        )}`
                      : '@srisagardrivingschool'}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {connectionData ? (
                  connectionData.instagram
                    .connected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2
                        size={13}
                        className="text-emerald-600"
                      />
                      Connected ✓
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                      <ShieldAlert
                        size={13}
                        className="text-amber-600"
                      />
                      Reconnect Required
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    Checking...
                  </span>
                )}
              </div>
            </div>

            {connectionData &&
              !connectionData.instagram
                .connected && (
                <p className="mt-2.5 text-[11px] text-amber-800/90 leading-relaxed bg-amber-50/70 rounded-lg p-2.5 border border-amber-200/50 break-words">
                  {connectionData.instagram
                    .error ||
                    'Instagram connection expired or not configured. Click "Reconnect Instagram" to authorize.'}
                </p>
              )}

            {connectionData &&
              connectionData.instagram
                .connected && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/70 rounded-lg p-2 border border-emerald-200/50">
                  <Check
                    size={12}
                    className="text-emerald-600 shrink-0"
                  />

                  <span className="truncate">
                    Instagram Graph API active
                    for @
                    {connectionData.instagram
                      .username?.replace(
                        /^@/,
                        ''
                      ) ||
                      'srisagardrivingschool'}
                  </span>
                </div>
              )}
          </div>

          {/* INSTAGRAM BUTTON */}

          <div className="mt-3.5 pt-3 border-t border-black/5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] text-slate-500 font-medium truncate">
              {connectionData?.instagram
                .connected
                ? 'Refresh or switch Account'
                : 'Authorize Meta permissions'}
            </span>

            <button
              id="reconnect-instagram-btn"
              type="button"
              disabled={
                reconnectingIg ||
                reconnectingFb ||
                testing
              }
              onClick={() =>
                void handleReconnectInstagram()
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-50 shadow-xs shrink-0 w-full sm:w-auto cursor-pointer"
            >
              {reconnectingIg ? (
                <LoaderCircle
                  className="animate-spin"
                  size={13}
                />
              ) : (
                <KeyRound size={13} />
              )}

              {reconnectingIg
                ? 'Opening Meta Login...'
                : 'Reconnect Instagram'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}