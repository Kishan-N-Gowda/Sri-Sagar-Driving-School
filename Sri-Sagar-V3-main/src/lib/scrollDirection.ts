let currentDirection: 'up' | 'down' = 'down';
let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
let isListening = false;
const listeners = new Set<(dir: 'up' | 'down') => void>();

function handleScroll() {
  const currentY = window.scrollY;
  const diff = currentY - lastScrollY;

  // Threshold to avoid micro-jitter
  if (Math.abs(diff) >= 3) {
    const newDir = diff > 0 ? 'down' : 'up';
    currentDirection = newDir;
    listeners.forEach((listener) => listener(newDir));
    lastScrollY = currentY;
  }
}

export function getScrollDirection(): 'up' | 'down' {
  return currentDirection;
}

export function subscribeScrollDirection(cb: (dir: 'up' | 'down') => void) {
  listeners.add(cb);
  if (!isListening && typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true });
    isListening = true;
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && isListening && typeof window !== 'undefined') {
      window.removeEventListener('scroll', handleScroll);
      isListening = false;
    }
  };
}
