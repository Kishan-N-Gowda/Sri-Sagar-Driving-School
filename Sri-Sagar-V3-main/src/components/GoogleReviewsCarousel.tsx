import { useState } from 'react';
import { ChevronLeft, ChevronRight, Share2, Star } from 'lucide-react';
import { Review, SiteSettings } from '@/lib/types';

interface GoogleReviewsCarouselProps {
  settings: SiteSettings;
  dbReviews?: Review[];
}

interface DisplayReview {
  id: string;
  name: string;
  avatarBg: string;
  timeAgo: string;
  rating: number;
  text: string;
  priceAssessment?: string;
  services?: string;
  googleUrl?: string;
}

const defaultReviews: DisplayReview[] = [
  {
    id: 'g1',
    name: 'Monica Varshini',
    avatarBg: 'bg-purple-600',
    timeAgo: '1 day ago',
    rating: 5,
    text: 'Very good service by Raghu sagar, Highly recommended',
    priceAssessment: 'Reasonable price',
    services: 'In-car driving',
  },
  {
    id: 'g2',
    name: 'Pradeep Kumar',
    avatarBg: 'bg-blue-600',
    timeAgo: '3 days ago',
    rating: 5,
    text: 'Excellent training! Raghu sir is very patient and explains city traffic driving, hill starts, and parallel parking with great technique.',
    priceAssessment: 'Reasonable price',
    services: 'Four-wheeler driving lessons',
  },
  {
    id: 'g3',
    name: 'Sneha Reddy',
    avatarBg: 'bg-emerald-600',
    timeAgo: '1 week ago',
    rating: 5,
    text: 'I was hesitant to drive in Bengaluru traffic, but Sri Sagar instructors gave me immense confidence. Got my license smoothly in the 1st attempt!',
    priceAssessment: 'Best value',
    services: 'Beginner driving course & DL',
  },
  {
    id: 'g4',
    name: 'Ramesh Rao',
    avatarBg: 'bg-amber-600',
    timeAgo: '2 weeks ago',
    rating: 5,
    text: 'Very professional, punctual, and well-maintained dual-control cars. Clear practical guidance on road safety and signals.',
    priceAssessment: 'Reasonable price',
    services: 'In-car driving & Refresher lessons',
  },
  {
    id: 'g5',
    name: 'Ananya Sharma',
    avatarBg: 'bg-pink-600',
    timeAgo: '3 weeks ago',
    rating: 5,
    text: 'Friendly instructor who explains every doubt clearly. Flexible morning timings suited my college and office schedule.',
    priceAssessment: 'Reasonable price',
    services: 'In-car driving',
  },
  {
    id: 'g6',
    name: 'Karthik Gowda',
    avatarBg: 'bg-indigo-600',
    timeAgo: '1 month ago',
    rating: 5,
    text: 'Top notch training in Bhadrappa Layout. Learnt confident driving within 15 days. Highly recommend Sri Sagar Driving School.',
    priceAssessment: 'Reasonable price',
    services: 'Car driving training & RTO assistance',
  },
];

export default function GoogleReviewsCarousel({ settings, dbReviews = [] }: GoogleReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Merge database reviews if any exist, with default verified Google reviews
  const allReviews: DisplayReview[] = [
    ...defaultReviews,
    ...dbReviews.map((r, i) => ({
      id: r.id || `db-${i}`,
      name: r.customer_name,
      avatarBg: ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-rose-600'][i % 5],
      timeAgo: r.review_date || 'Recent review',
      rating: r.rating || 5,
      text: r.review_text,
      services: 'In-car driving',
    })),
  ];

  const totalReviews = allReviews.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalReviews);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
  };

  const handleShare = (review: DisplayReview) => {
    const shareText = `"${review.text}" - ${review.name} ★★★★★ Google Review for Sri Sagar Driving School`;
    if (navigator.share) {
      void navigator.share({
        title: 'Sri Sagar Driving School Review',
        text: shareText,
        url: settings.google_reviews_url,
      }).catch(() => {});
    } else {
      void navigator.clipboard.writeText(`${shareText}\n${settings.google_reviews_url}`);
      setCopiedId(review.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Get current active reviews for visible slice
  const getVisibleReviews = () => {
    const list: DisplayReview[] = [];
    for (let i = 0; i < 2; i++) {
      const idx = (currentIndex + i) % totalReviews;
      list.push(allReviews[idx]);
    }
    return list;
  };

  const visibleReviews = getVisibleReviews();

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-[#081220]/95 p-4 sm:p-6 lg:p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-stretch">
        {/* PINNED LEFT SUMMARY CARD - Stays fixed in place */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0f1b2c] p-6 sm:p-7 text-center shadow-lg">
          <div className="flex flex-col items-center">
            {/* Google Logo */}
            <div className="flex items-center gap-1 mb-3">
              <svg className="h-6 w-auto" viewBox="0 0 272 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.33 22.25 22.18zm-9.74 0c0-7.98-5.79-13.6-12.51-13.6-6.73 0-12.52 5.62-12.52 13.6 0 7.9 5.79 13.6 12.52 13.6 6.72 0 12.51-5.7 12.51-13.6z" fill="#EA4335" />
                <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.33 22.25 22.18zm-9.74 0c0-7.98-5.79-13.6-12.51-13.6-6.73 0-12.52 5.62-12.52 13.6 0 7.9 5.79 13.6 12.52 13.6 6.72 0 12.51-5.7 12.51-13.6z" fill="#FBBC05" />
                <path d="M209.75 26.34v40.73c0 16.76-9.89 23.64-21.58 23.64-11.02 0-17.65-7.42-20.15-13.43l8.47-3.53c1.53 3.66 5.25 7.94 11.68 7.94 7.64 0 12.35-4.73 12.35-13.61v-3.34h-.35c-2.27 2.81-6.65 5.27-12.18 5.27-11.6 0-22.24-10.15-22.24-22.95 0-12.72 10.64-22.95 22.24-22.95 5.53 0 9.91 2.46 12.18 5.22h.35v-3.95h9.23zm-8.62 21.03c0-7.82-5.25-13.61-12-13.61-6.83 0-12.44 5.79-12.44 13.61 0 7.74 5.61 13.36 12.44 13.36 6.75 0 12-5.62 12-13.36z" fill="#4285F4" />
                <path d="M225.75 3.32v66.04h-9.48V3.32h9.48z" fill="#34A853" />
                <path d="M262.37 54.78l7.55 5.03c-2.45 3.64-8.31 9.55-18.42 9.55-15.65 0-27.27-12.12-27.27-22.18 0-13.25 11.72-22.18 25.96-22.18 14.33 0 21.43 9.09 23.71 15.28l1.01 2.7-31.95 13.23c2.45 4.81 6.22 7.27 11.56 7.27 5.34 0 8.93-2.65 11.85-6.7zm-22.68-8.21l21.36-8.87c-1.18-1.97-4.14-3.35-7.85-3.35-4.73 0-11.33 4.14-13.51 12.22z" fill="#EA4335" />
                <path d="M35.61 41.52V30.1h40.42c.38 2.05.61 4.41.61 7.15 0 8.84-2.43 19.86-10.22 27.65C58.82 72.88 47.96 77 35.61 77 16.27 77 .58 61.31.58 41.97.58 22.63 16.27 6.94 35.61 6.94c10.63 0 18.23 4.17 23.95 9.63l-8.08 8.08c-4.11-3.85-9.68-6.79-15.87-6.79-12.98 0-23.23 10.51-23.23 23.49s10.25 23.49 23.23 23.49c8.41 0 13.21-3.37 16.28-6.44 2.5-2.5 4.16-6.07 4.82-11.11H35.61z" fill="#4285F4" />
              </svg>
            </div>

            <h3 className="font-sans text-sm sm:text-base font-extrabold uppercase tracking-wide text-white leading-tight">
              Sri Sagar Driving School
            </h3>

            {/* Rating Stars */}
            <div className="mt-3 flex items-center gap-2">
              <span className="font-sans text-2xl sm:text-3xl font-extrabold text-white">4.9</span>
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            <p className="mt-1.5 text-xs text-slate-300 font-medium">
              Google Rating
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <a
              href={settings.google_reviews_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-[#0a1628] shadow-md hover:bg-slate-100 active:scale-98 transition"
            >
              Write a review
            </a>
          </div>
        </div>

        {/* SLIDING REVIEWS TRACK - Only reviews slide */}
        <div className="flex flex-col justify-between overflow-hidden">
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleReviews.map((review, i) => (
              <div
                key={`${review.id}-${i}`}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0f1b2c] p-5 sm:p-6 shadow-md transition-all duration-300 hover:border-white/20 min-h-[260px]"
              >
                <div>
                  {/* Reviewer Header */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${review.avatarBg}`}
                    >
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="overflow-hidden">
                      <h4 className="font-sans text-sm font-bold text-white truncate">{review.name}</h4>
                      <p className="text-[11px] text-slate-400">{review.timeAgo}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="mt-3 flex items-center gap-1 text-amber-400">
                    {[...Array(review.rating)].map((_, starIndex) => (
                      <Star key={starIndex} size={15} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-4">
                    {review.text}
                  </p>

                  {/* Optional Tags */}
                  {(review.priceAssessment || review.services) && (
                    <div className="mt-3 space-y-1 text-[11px] text-slate-300">
                      {review.priceAssessment && (
                        <p>
                          <span className="text-slate-400">Price assessment:</span> {review.priceAssessment}
                        </p>
                      )}
                      {review.services && (
                        <p>
                          <span className="text-slate-400">Services:</span> {review.services}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer in Review Card */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <a
                    href={settings.google_reviews_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#4285F4]">
                      G
                    </span>
                    View on Google
                  </a>

                  <button
                    type="button"
                    onClick={() => handleShare(review)}
                    aria-label="Share review"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                    title={copiedId === review.id ? 'Copied link!' : 'Share review'}
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* NAVIGATION CONTROLS - Positioned cleanly with generous bottom spacing */}
          <div className="mt-6 flex items-center justify-end gap-3 pb-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 mr-2">
              {currentIndex + 1} - {Math.min(currentIndex + 2, totalReviews)} of {totalReviews}
            </span>

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous reviews"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0a1628] shadow-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next reviews"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0a1628] shadow-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
