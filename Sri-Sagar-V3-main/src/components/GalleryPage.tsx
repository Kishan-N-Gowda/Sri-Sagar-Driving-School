import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  LoaderCircle,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MasonryGallery from '@/components/MasonryGallery';
import { fetchPublishedGalleryPhotos } from '@/lib/galleryFetch';
import { navigateTo } from '@/lib/navigation';
import { galleryImageUrl, phoneUrl, supabase, whatsappUrl } from '@/lib/supabase';
import { GalleryCategory, GalleryPhoto, SiteSettings } from '@/lib/types';

const defaultSiteSettings: SiteSettings = {
  id: true,
  business_name: 'Sri Sagar Driving School',
  phone: '+91 90195 04489',
  whatsapp: '+91 90195 04489',
  address: '1st Floor, Srinika Complex, Bhadrappa Layout Service Rd, Bhadrappa Layout, Koti Hosahalli, Bengaluru, Karnataka 560094',
  opening_hours: 'Monday – Sunday: 8:30 AM – 7:30 PM',
  instagram_url: null,
  facebook_url: null,
  google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Sri+Sagar+Driving+School+Srinika+Complex+Bhadrappa+Layout+Bengaluru+560094',
  google_reviews_url: 'https://www.google.com/maps/search/?api=1&query=Sri+Sagar+Driving+School+Srinika+Complex+Bhadrappa+Layout+Bengaluru+560094',
  updated_at: ''
};

const allCategories: Array<'All' | GalleryCategory> = [
  'All',
  'Training',
  'Students',
  'Vehicles',
  'Branches',
  'School',
];

export default function GalleryPage() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'All' | GalleryCategory>('All');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  const loadData = async () => {
    try {
      const [fetchedPhotos, settingsRes] = await Promise.all([
        fetchPublishedGalleryPhotos(),
        supabase.from('site_settings').select('*').maybeSingle(),
      ]);

      setPhotos(fetchedPhotos);

      if (settingsRes?.data) {
        const loaded = settingsRes.data as SiteSettings;
        setSettings({
          ...defaultSiteSettings,
          ...loaded,
          address: loaded.address || defaultSiteSettings.address,
          phone: loaded.phone || defaultSiteSettings.phone,
          whatsapp: loaded.whatsapp || defaultSiteSettings.whatsapp,
          opening_hours: loaded.opening_hours || defaultSiteSettings.opening_hours,
        });
      }
    } catch (err) {
      console.error('Error loading gallery page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();

    // Scroll to top upon mounting
    window.scrollTo(0, 0);

    // Realtime subscription for gallery photo updates
    const channel = supabase
      .channel('public:gallery_page_photos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photos' }, () => {
        void loadData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  // Filtered photos based on selected category tab
  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'All') return photos;
    return photos.filter(
      (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [photos, activeCategory]);

  const selectedPhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  const nextPhoto = useCallback(() => {
    setSelectedPhotoIndex((current) => {
      if (current === null || filteredPhotos.length === 0) return null;
      return (current + 1) % filteredPhotos.length;
    });
  }, [filteredPhotos.length]);

  const previousPhoto = useCallback(() => {
    setSelectedPhotoIndex((current) => {
      if (current === null || filteredPhotos.length === 0) return null;
      return (current - 1 + filteredPhotos.length) % filteredPhotos.length;
    });
  }, [filteredPhotos.length]);

  // Keyboard controls for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
      } else if (e.key === 'ArrowRight') {
        nextPhoto();
      } else if (e.key === 'ArrowLeft') {
        previousPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, nextPhoto, previousPhoto]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedPhotoIndex !== null ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPhotoIndex]);

  const bookingMessage =
    'Hello Sri Sagar Driving School, I was browsing your gallery and would like to enquire about driving classes and batch timings.';

  return (
    <div className="min-h-screen w-full bg-[#faf8f4] text-[#1a1a1a] flex flex-col font-sans selection:bg-[#c1272d] selection:text-white">
      {/* TOP STICKY NAVBAR */}
      <header className="sticky top-0 z-30 w-full border-b border-[#e5e2db] bg-[#faf8f4]/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 sm:h-20 w-full max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16">
          {/* Back to Home Button & Brand */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d5cd] bg-white px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#0a1628] shadow-xs hover:border-[#0a1628] hover:bg-slate-50 transition active:scale-95 cursor-pointer"
              aria-label="Back to Homepage"
            >
              <ArrowLeft size={16} className="text-[#c1272d]" />
              <span className="hidden min-[420px]:inline">{t.galleryBackHome || 'Back to Home'}</span>
              <span className="min-[420px]:hidden">Home</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c1272d] font-bold text-white shadow-sm group-hover:scale-105 transition">
                S
              </div>
              <div className="hidden sm:block">
                <span className="block font-serif text-sm font-bold tracking-tight text-[#0a1628]">
                  SRI SAGAR
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Driving School • Est. 2001
                </span>
              </div>
            </button>
          </div>

          {/* Actions: Phone, WhatsApp, Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={phoneUrl(settings.phone)}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-[#d8d5cd] bg-white px-4 py-2 text-xs font-bold text-[#0a1628] hover:border-[#0a1628] hover:bg-slate-50 transition"
            >
              <Phone size={14} className="text-[#c1272d]" />
              <span>{settings.phone}</span>
            </a>

            <a
              href={whatsappUrl(settings.whatsapp, bookingMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#25D366] px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#20ba5a] hover:shadow-md transition active:scale-95"
            >
              <MessageCircle size={15} />
              <span className="hidden min-[480px]:inline">WhatsApp</span>
            </a>

            <LanguageSwitcher scrolled={true} />
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#f3f0e8] to-[#faf8f4] px-4 sm:px-8 lg:px-12 xl:px-16 pt-10 sm:pt-14 pb-8 sm:pb-10 border-b border-[#e8e5dc]">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8d5cc] bg-white px-3.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#c1272d] shadow-2xs">
                <Sparkles size={13} className="text-[#c1272d]" />
                <span>{t.galleryFullTitle || 'Full Gallery & Fleet'}</span>
              </div>
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a1628] tracking-tight leading-[1.15]">
                {t.galleryAllPhotos || 'All Training & School Photos'}
              </h1>
              <p className="mt-3 text-sm sm:text-base font-sans text-slate-600 max-w-2xl leading-relaxed">
                Browse our real-world training moments, dual-control cars, two-wheeler motor training, learner road-test achievements, and school facility in Bhadrappa Layout & Sanjay Nagar, Bengaluru.
              </p>
            </div>

            {/* Total count indicator */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-2xl border border-[#d8d5cd] bg-white px-5 py-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-[#c1272d]" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Photos
                  </span>
                </div>
                <div className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#0a1628]">
                  {loading ? '...' : photos.length}
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="mt-8 sm:mt-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0 pr-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Filter size={13} />
              <span>Category:</span>
            </div>
            {allCategories.map((cat) => {
              const count =
                cat === 'All'
                  ? photos.length
                  : photos.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;

              if (count === 0 && cat !== 'All') return null;

              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedPhotoIndex(null);
                  }}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold font-sans transition duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#0a1628] text-white shadow-md'
                      : 'border border-[#d8d5cd] bg-white text-slate-700 hover:border-[#0a1628] hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY MAIN CONTENT */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 sm:py-16">
        <div className="mx-auto w-full max-w-[1600px]">
          {loading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
              <LoaderCircle className="animate-spin text-[#c1272d]" size={36} />
              <p className="text-sm font-medium text-slate-500">
                Loading Sri Sagar Driving School gallery...
              </p>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d4d0c8] bg-white/50 p-12 text-center">
              <p className="text-base font-semibold text-[#0a1628]">
                No photos found in category &ldquo;{activeCategory}&rdquo;
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try selecting &ldquo;All&rdquo; to view all available school photos.
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0a1628] px-5 py-2 text-xs font-bold text-white hover:bg-[#12243e]"
              >
                Show All Photos
              </button>
            </div>
          ) : (
            <MasonryGallery
              images={filteredPhotos}
              onSelectImage={setSelectedPhotoIndex}
              variant="full-gallery"
            />
          )}

          {/* BACK TO TOP / RETURN TO HOMEPAGE */}
          {!loading && filteredPhotos.length > 0 && (
            <div className="mt-14 sm:mt-20 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#0a1628] px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-[#12243e] hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>{t.galleryBackHome || 'Back to Homepage'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#d8d5cd] bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-[#0a1628] shadow-xs hover:border-[#0a1628] hover:bg-slate-50 transition cursor-pointer"
              >
                <span>Back to top</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* BOTTOM CTA BANNER */}
      <section className="w-full bg-[#0a1628] px-4 sm:px-8 lg:px-12 xl:px-16 py-14 sm:py-20 text-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c1272d]">
              {t.ctaEyebrow || 'QUERIES & ADMISSIONS'}
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-bold">
              {t.ctaTitle || 'Learn to drive with practical skill and safety.'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed">
              Have queries about driving batches, car lessons, two-wheeler training, or RTO licenses? Call or WhatsApp Sri Sagar Driving School in Bhadrappa Layout.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row shrink-0">
            <a
              href={phoneUrl(settings.phone)}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#0a1628] shadow-lg hover:bg-slate-100 transition"
            >
              <Phone size={15} className="text-[#c1272d]" />
              <span>{t.ctaCallBtn || `Call ${settings.phone}`}</span>
            </a>
            <a
              href={whatsappUrl(settings.whatsapp, bookingMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-[#20ba5a] transition"
            >
              <MessageCircle size={16} />
              <span>{t.ctaWhatsappBtn || 'WhatsApp Us'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/10 bg-[#08111e] px-4 sm:px-8 lg:px-12 xl:px-16 py-8 text-white/70 text-xs">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} Sri Sagar Driving School. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="hover:text-white transition cursor-pointer"
            >
              Home
            </button>
            <span>•</span>
            <a
              href="/admin"
              className="inline-flex items-center gap-1 hover:text-white transition"
            >
              <ShieldCheck size={13} className="text-[#c1272d]" /> Admin Login
            </a>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1628]/95 p-4 sm:p-6 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            aria-label="Close image preview (Escape)"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/30 transition cursor-pointer"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            <X size={22} />
          </button>

          {/* Prev button */}
          <button
            type="button"
            aria-label="Previous image (Left Arrow)"
            className="absolute left-2 sm:left-6 z-10 rounded-full bg-white/15 p-2.5 sm:p-3 text-white hover:bg-white/30 transition cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              previousPhoto();
            }}
          >
            <ChevronLeft size={26} />
          </button>

          {/* Photo & Details Container */}
          <div
            className="relative flex max-h-[92vh] max-w-[90vw] flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImageUrl(selectedPhoto.storage_path)}
              alt={selectedPhoto.title || 'Sri Sagar Driving School'}
              decoding="async"
              onError={(e) => {
                const target = e.currentTarget;
                const raw = (selectedPhoto.storage_path || '').trim();
                const clean = raw.replace(/^\/+/, '').replace(/^images\//, '');
                if (clean && !target.src.endsWith(`/images/${clean}`)) {
                  target.src = `/images/${clean}`;
                }
              }}
              className="max-h-[75vh] sm:max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {/* Caption bar */}
            <div className="mt-3 max-w-2xl text-center">
              <div className="flex items-center justify-center gap-2">
                {selectedPhoto.category && (
                  <span className="rounded-full bg-[#c1272d] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {selectedPhoto.category}
                  </span>
                )}
                <span className="text-xs text-white/60">
                  {selectedPhotoIndex !== null ? `${selectedPhotoIndex + 1} of ${filteredPhotos.length}` : ''}
                </span>
              </div>
              <h3 className="mt-1.5 font-serif text-sm sm:text-base font-bold text-white">
                {selectedPhoto.title || 'Training photo'}
              </h3>
              {selectedPhoto.description && (
                <p className="mt-1 text-xs text-white/70 leading-relaxed max-w-xl">
                  {selectedPhoto.description}
                </p>
              )}
            </div>
          </div>

          {/* Next button */}
          <button
            type="button"
            aria-label="Next image (Right Arrow)"
            className="absolute right-2 sm:right-6 z-10 rounded-full bg-white/15 p-2.5 sm:p-3 text-white hover:bg-white/30 transition cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              nextPhoto();
            }}
          >
            <ChevronRight size={26} />
          </button>
        </div>
      )}
    </div>
  );
}
