import { useEffect } from 'react';

const isAllowedTargetOrigin = (origin: string): boolean => {
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.vercel.app') ||
      hostname.endsWith('.run.app') ||
      hostname === 'srisagardrivingschool.vercel.app' ||
      hostname === 'srisagardrivingschool.com' ||
      hostname.endsWith('.srisagardrivingschool.com')
    );
  } catch {
    return false;
  }
};

export default function OAuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const platform = params.get('platform') || 'facebook';

    const success =
      params.get('fb_connected') === 'true' ||
      params.get('ig_connected') === 'true';

    const message = {
      type:
        platform === 'instagram'
          ? 'INSTAGRAM_AUTH_COMPLETE'
          : 'FACEBOOK_AUTH_COMPLETE',
      success,
      platform,
      pageName: params.get('page_name') || '',
      pageId: params.get('page_id') || '',
      username: params.get('ig_username') || '',
      error:
        params.get('fb_error') ||
        params.get('ig_error') ||
        '',
    };

    if (window.opener && !window.opener.closed) {
      const currentOrigin = window.location.origin;
      const targetOrigin = isAllowedTargetOrigin(currentOrigin)
        ? currentOrigin
        : 'https://srisagardrivingschool.vercel.app';

      window.opener.postMessage(message, targetOrigin);

      setTimeout(() => {
        window.close();
      }, 300);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
      }}
    >
      <div>
        <h2>Authentication complete ✓</h2>
        <p>You can close this window.</p>
      </div>
    </div>
  );
}