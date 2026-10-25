/**
 * Client-side navigation helper that pushes browser history state
 * and triggers window popstate event so App router re-renders immediately.
 */
export function navigateTo(path: string, options: { scrollToTop?: boolean } = { scrollToTop: true }) {
  if (typeof window === 'undefined') return;

  const targetPath = path.startsWith('/') ? path : `/${path}`;
  if (window.location.pathname !== targetPath) {
    window.history.pushState({}, '', targetPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  if (options.scrollToTop !== false) {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
