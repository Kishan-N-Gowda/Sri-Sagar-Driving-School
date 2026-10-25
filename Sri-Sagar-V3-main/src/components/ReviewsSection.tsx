import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ExternalLink, Share2, Check, Loader2, MessageSquareQuote } from 'lucide-react';
import ScrollRevealSection from '@/components/ScrollRevealSection';
import { supabase } from '@/lib/supabase';
import { Review, SiteSettings } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';

interface ReviewsSectionProps {
  settings: SiteSettings;
}

const BATCH_SIZE = 6;

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-cyan-600'
];

function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  // If already relative or formatted
  if (dateStr.includes('ago') || dateStr.includes('year') || dateStr.includes('month') || dateStr.includes('week')) {
    return dateStr;
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export default function ReviewsSection({ settings }: ReviewsSectionProps) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const googleReviewsUrl =
    settings.google_reviews_url ||
    'https://www.google.com/maps/place/SRI+SAGAR+DRIVING+SCHOOL/@13.047673,77.5761197,17z/data=!3m1!5s0x3bae17f053401e7d:0xd248a17748c26d52!4m8!3m7!1s0x3bae173c99e1ca75:0x44f6daac4d3d60f6!8m2!3d13.047673!4d77.5761197!9m1!1b1!16s%2Fg%2F11c6zpp6_y';

  const loadInitialReviews = async () => {
    try {
      setLoadingInitial(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range(0, BATCH_SIZE - 1);

      if (error) {
        console.error('Error fetching initial reviews:', error);
        setFetchError(error.message || 'Failed to load reviews');
        return;
      }

      if (data) {
        setReviews(data as Review[]);
        if (data.length < BATCH_SIZE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      console.error('Unexpected error loading initial reviews:', err);
      setFetchError('Unexpected error loading reviews');
    } finally {
      setLoadingInitial(false);
    }
  };

  // Fetch initial batch of reviews from Supabase
  useEffect(() => {
    void loadInitialReviews();
  }, []);

  // Load next batch of reviews from Supabase
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const currentOffset = reviews.length;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + BATCH_SIZE - 1);

      if (error) {
        console.error('Error fetching additional reviews:', error);
        return;
      }

      if (data && data.length > 0) {
        const existingIds = new Set(reviews.map((r) => r.id));
        const newUniqueReviews = (data as Review[]).filter((r) => !existingIds.has(r.id));

        setReviews((prev) => [...prev, ...newUniqueReviews]);

        if (data.length < BATCH_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Unexpected error loading more reviews:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleShare = (review: Review) => {
    const shareText = `"${review.review_text}" — ${review.customer_name} on Sri Sagar Driving School`;
    if (navigator.share) {
      void navigator
        .share({
          title: `${review.customer_name} Review · Sri Sagar Driving School`,
          text: shareText,
          url: googleReviewsUrl
        })
        .catch(() => {});
    } else {
      void navigator.clipboard.writeText(`${shareText}\n\n${googleReviewsUrl}`);
      setCopiedId(review.id);
      setTimeout(() => setCopiedId(null), 2200);
    }
  };

  return (
    <ScrollRevealSection
      id="reviews"
      className="w-full bg-[#0a1628] px-4 sm:px-8 lg:px-12 xl:px-16 py-20 sm:py-28 text-white relative overflow-hidden"
    >
      {/* Subtle background ambient texture */}
      <div className="absolute inset-0 bg-radial-gradient from-white/[0.03] to-transparent pointer-events-none" />

      <div className="relative mx-auto w-full max-w-[1600px]">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 sm:pb-14 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
              <span className="h-2 w-2 rounded-full bg-[#c1272d]" />
              <p className="text-[11px] font-bold font-sans uppercase tracking-[0.25em] text-white/90">
                {t.reviewsEyebrow}
              </p>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {t.reviewsTitle1} <span className="font-serif italic font-normal text-[#f0c0c0]">{t.reviewsTitle2}</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed font-sans text-white/70 max-w-2xl">
              {t.reviewsSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              id="header-view-google-reviews-btn"
              href={googleReviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold font-sans text-[#0a1628] hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 shadow-lg transition duration-200"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>{t.reviewsGoogleBtn}</span>
              <ExternalLink size={14} className="text-slate-500" />
            </a>
          </div>
        </div>

        {/* Initial Loading Skeleton */}
        {loadingInitial && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl border border-white/5 bg-[#0f1b2c]/80 p-6 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="h-3 w-20 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="mt-4 flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="h-4 w-4 bg-white/10 rounded" />
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full bg-white/10 rounded" />
                  <div className="h-3 w-5/6 bg-white/10 rounded" />
                  <div className="h-3 w-2/3 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews Grid */}
        {!loadingInitial && reviews.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {reviews.map((review, index) => {
                const isExpanded = Boolean(expandedIds[review.id]);
                const isLong = review.review_text.length > 180;
                const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                const dateDisplay = formatDateDisplay(review.review_date);

                return (
                  <motion.div
                    key={review.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: (index % BATCH_SIZE) * 0.05 }}
                    className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0f1b2c] p-6 shadow-md hover:border-white/20 hover:shadow-xl transition-all duration-300 relative"
                  >
                    <div>
                      {/* Card Header: Avatar, Name, Date, Google Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-sm ${avatarColor}`}
                          >
                            {review.customer_name ? review.customer_name.trim().charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-sans text-sm sm:text-base font-bold text-white truncate group-hover:text-white transition">
                              {review.customer_name}
                            </h3>
                            {dateDisplay && (
                              <p className="text-[11px] font-medium text-white/50">{dateDisplay}</p>
                            )}
                          </div>
                        </div>

                        {/* Google Review Badge */}
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-white/80 shrink-0"
                          title="Verified Google Review"
                        >
                          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[9px] font-black text-[#4285F4]">
                            G
                          </span>
                          <span>Google</span>
                        </div>
                      </div>

                      {/* Star Rating */}
                      <div className="mt-4 flex items-center gap-1 text-amber-400">
                        {Array.from({ length: Math.min(5, Math.max(1, review.rating || 5)) }).map((_, s) => (
                          <Star key={s} size={15} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      {/* Review Text */}
                      <div className="mt-3.5 relative">
                        <MessageSquareQuote size={18} className="text-white/15 mb-1" />
                        <p
                          className={`text-xs sm:text-sm leading-relaxed font-sans text-white/85 whitespace-pre-line ${
                            !isExpanded && isLong ? 'line-clamp-4' : ''
                          }`}
                        >
                          {review.review_text}
                        </p>
                        {isLong && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(review.id)}
                            className="mt-1.5 inline-block text-[11px] font-bold text-[#c1272d] hover:text-[#e04047] transition-colors focus:outline-none"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: View on Google & Share */}
                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                      <a
                        href={googleReviewsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors"
                      >
                        <span>{t.reviewsViewOnGoogle}</span>
                        <ExternalLink size={12} className="opacity-70" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleShare(review)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/50 hover:bg-white/10 hover:text-white transition"
                        title={copiedId === review.id ? 'Copied link to clipboard' : 'Share review'}
                        aria-label="Share review"
                      >
                        {copiedId === review.id ? (
                          <>
                            <Check size={13} className="text-emerald-400" />
                            <span className="text-[10px] text-emerald-300 font-medium">Copied</span>
                          </>
                        ) : (
                          <Share2 size={13} />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Error State */}
        {!loadingInitial && fetchError && (
          <div className="mt-12 text-center py-12 px-6 rounded-2xl border border-rose-500/20 bg-rose-950/20">
            <p className="text-sm sm:text-base text-white/80">{t.reviewsError}</p>
            <button
              type="button"
              onClick={() => void loadInitialReviews()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-5 py-2.5 text-xs font-bold font-sans text-white transition duration-150"
            >
              {t.reviewsRetry}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingInitial && !fetchError && reviews.length === 0 && (
          <div className="mt-12 text-center py-16 px-4 rounded-2xl border border-white/10 bg-[#0f1b2c]">
            <p className="text-base text-white/70">{t.reviewsEmpty}</p>
          </div>
        )}

        {/* Action Controls Area */}
        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* View More Reviews Button (loads next batch from Supabase) */}
          {hasMore && (
            <button
              id="view-more-reviews-btn"
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold font-sans text-[#0a1628] shadow-xl hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition duration-200 w-full sm:w-auto"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#0a1628]" />
                  <span>{t.reviewsLoading}</span>
                </>
              ) : (
                <span>{t.reviewsViewMore}</span>
              )}
            </button>
          )}

          {/* View More Reviews on Google Button */}
          <a
            id="view-more-reviews-on-google-btn"
            href={googleReviewsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-8 py-3.5 text-sm font-bold font-sans text-white hover:-translate-y-0.5 active:translate-y-0 shadow-lg transition duration-200 w-full sm:w-auto"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>{t.reviewsViewMoreGoogle}</span>
            <ExternalLink size={14} className="text-white/60" />
          </a>
        </div>
      </div>
    </ScrollRevealSection>
  );
}
