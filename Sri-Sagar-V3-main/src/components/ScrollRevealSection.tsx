import React, { useEffect, useRef, useState } from 'react';
import { getScrollDirection, subscribeScrollDirection } from '@/lib/scrollDirection';

interface ScrollRevealSectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article';
  innerClassName?: string;
  children: React.ReactNode;
}

export function ScrollRevealSection({
  as: Component = 'section',
  className = '',
  innerClassName = '',
  children,
  id,
  style,
  ...rest
}: ScrollRevealSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({
    opacity: 1,
    transform: 'translateY(0px)',
  });

  const hasAnimatedRef = useRef(false);
  const isIntersectingRef = useRef(false);

  useEffect(() => {
    // Respect reduced motion settings
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimationStyle({
        opacity: 1,
        transform: 'translateY(0px)',
      });
      return;
    }

    const unsubscribe = subscribeScrollDirection(() => {});
    const el = sectionRef.current;
    if (!el) return unsubscribe;

    // Check initial position on mount
    const rect = el.getBoundingClientRect();
    const isInitiallyInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (isInitiallyInView) {
      hasAnimatedRef.current = true;
      setAnimationStyle({
        opacity: 1,
        transform: 'translateY(0px)',
      });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        const dir = getScrollDirection();

        if (isIntersecting && !isIntersectingRef.current) {
          isIntersectingRef.current = true;

          if (dir === 'up') {
            // Buttery smooth upward scroll reveal:
            // Starts at translateY(30px) and opacity 0.85 (never 0, zero blank gap)
            setAnimationStyle({
              opacity: 0.85,
              transform: 'translateY(30px)',
              transition: 'none',
            });

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setAnimationStyle({
                  opacity: 1,
                  transform: 'translateY(0px)',
                  transition: 'opacity 800ms cubic-bezier(0.22, 1, 0.36, 1), transform 800ms cubic-bezier(0.22, 1, 0.36, 1)',
                  willChange: 'transform, opacity',
                });
              });
            });
          } else {
            // Downward scroll reveal (preserving existing smooth behavior)
            if (!hasAnimatedRef.current) {
              setAnimationStyle({
                opacity: 0.9,
                transform: 'translateY(20px)',
                transition: 'none',
              });

              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setAnimationStyle({
                    opacity: 1,
                    transform: 'translateY(0px)',
                    transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                  });
                });
              });
            } else {
              setAnimationStyle({
                opacity: 1,
                transform: 'translateY(0px)',
                transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
              });
            }
          }
          hasAnimatedRef.current = true;
        } else if (!isIntersecting) {
          isIntersectingRef.current = false;
        }
      },
      {
        rootMargin: '120px 0px 120px 0px',
        threshold: 0.05,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, []);

  return (
    <Component
      ref={sectionRef as React.Ref<HTMLDivElement & HTMLElement>}
      id={id}
      className={className}
      style={style}
      {...rest}
    >
      <div className={`w-full ${innerClassName}`} style={animationStyle}>
        {children}
      </div>
    </Component>
  );
}
export default ScrollRevealSection;
