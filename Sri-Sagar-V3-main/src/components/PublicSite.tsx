import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Facebook,
  FileCheck2,
  Image as ImageIcon,
  Instagram,
  LoaderCircle,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  Route,
  Search,
  ShieldCheck,
  Star,
  Users,
  X
} from 'lucide-react';
import AppointmentForm from '@/components/AppointmentForm';
import { DrivingCoursesSection } from '@/components/DrivingCoursesSection';
import { DrivingJourneySection } from '@/components/DrivingJourneySection';
import { FaqSection } from '@/components/FaqSection';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MasonryGallery from '@/components/MasonryGallery';
import ReviewsSection from '@/components/ReviewsSection';
import ScrollRevealSection from '@/components/ScrollRevealSection';
import { WhatYouLearnSection } from '@/components/WhatYouLearnSection';
import { useLanguage } from '@/context/LanguageContext';
import { getActiveHardcodedPhotos } from '@/lib/galleryDefaults';
import { fetchPublishedGalleryPhotos } from '@/lib/galleryFetch';
import { navigateTo } from '@/lib/navigation';
import { galleryImageUrl, phoneUrl, supabase, whatsappUrl } from '@/lib/supabase';
import { GalleryPhoto, SiteSettings, courses } from '@/lib/types';

const heroImage = '/images/backroundimage.jpeg';
const aboutImage = '/images/owner.webp';
const ctaHeroImage = '/images/hero-school.png';

const defaultSettings: SiteSettings = {
  id: true,
  business_name: 'Sri Sagar Driving School',
  phone: '+91 90195 04489',
  whatsapp: '+91 90195 04489',
  address: '1st Floor, Srinika Complex, Bhadrappa Layout Service Rd, Bhadrappa Layout, Koti Hosahalli, Bengaluru, Karnataka 560094',
  opening_hours: 'Monday – Sunday: 8:30 AM – 7:30 PM',
  instagram_url: null,
  facebook_url: null,
  google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Sri+Sagar+Driving+School+Srinika+Complex+Bhadrappa+Layout+Bengaluru+560094',
  google_reviews_url: 'https://www.google.com/maps/place/SRI+SAGAR+DRIVING+SCHOOL/@13.047673,77.5761197,17z/data=!3m1!5s0x3bae17f053401e7d:0xd248a17748c26d52!4m8!3m7!1s0x3bae173c99e1ca75:0x44f6daac4d3d60f6!8m2!3d13.047673!4d77.5761197!9m1!1b1!16s%2Fg%2F11c6zpp6_y',
  updated_at: ''
};

function getIsOpenNow(): boolean {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const timeInHours = hour + minute / 60;
    // Open 8:30 AM (8.5) to 7:30 PM (19.5) every day
    return timeInHours >= 8.5 && timeInHours < 19.5;
  } catch {
    return true;
  }
}

export default function PublicSite() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [gallery, setGallery] = useState<GalleryPhoto[]>(() => getActiveHardcodedPhotos());
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [aboutImgLoaded, setAboutImgLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(getIsOpenNow());
    const interval = setInterval(() => {
      setIsOpen(getIsOpenNow());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const benefits = [
    { icon: Award, title: t.benefit1Title, text: t.benefit1Text },
    { icon: Route, title: t.benefit2Title, text: t.benefit2Text },
    { icon: Users, title: t.benefit3Title, text: t.benefit3Text },
    { icon: Users, title: t.benefit4Title, text: t.benefit4Text },
    { icon: Building2, title: t.benefit5Title, text: t.benefit5Text },
    { icon: Clock3, title: t.benefit6Title, text: t.benefit6Text },
    { icon: FileCheck2, title: t.benefit7Title, text: t.benefit7Text }
  ];

  const navLinks = [
    { label: t.navHome, href: '#home' },
    { label: t.navAbout, href: '#about' },
    { label: t.navCourses, href: '#courses' },
    { label: t.navJourney, href: '#journey' },
    { label: t.navLearn, href: '#learn' },
    { label: t.navWhyUs, href: '#why-us' },
    { label: t.navFaq, href: '#faq' },
    { label: t.navGallery, href: '#gallery' },
    { label: t.navReviews, href: '#reviews' },
    { label: t.navLocation, href: '#location' },
    { label: t.navContact, href: '#contact' }
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });

    const load = async () => {
      try {
        const [settingsResult, publishedPhotos] = await Promise.all([
          supabase.from('site_settings').select('*').maybeSingle(),
          fetchPublishedGalleryPhotos()
        ]);

        if (settingsResult?.data) {
          const loaded = settingsResult.data as SiteSettings;
          setSettings({
            ...defaultSettings,
            ...loaded,
            address: loaded.address || defaultSettings.address,
            phone: loaded.phone || defaultSettings.phone,
            whatsapp: loaded.whatsapp || defaultSettings.whatsapp,
            opening_hours: loaded.opening_hours || defaultSettings.opening_hours
          });
        }

        setGallery(publishedPhotos);
      } catch (e) {
        console.warn('Failed to load site data:', e);
      } finally {
        setLoadingGallery(false);
      }
    };

    void load();

    // Auto-refresh gallery when window gains focus or when gallery changes in realtime
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void load();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const channel = supabase
      .channel('public:gallery_photos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photos' }, () => {
        void load();
      })
      .subscribe();

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || selectedIndex !== null ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, selectedIndex]);

  const message = 'Hello Sri Sagar Driving School, I would like to enquire about driving classes in Bhadrappa Layout, Bengaluru.';
  const bookingMessage = 'Hello Sri Sagar Driving School, I would like to book a driving training / RTO enquiry appointment.';
  const selectedPhoto = selectedIndex !== null ? gallery[selectedIndex] : null;

  const nextPhoto = useCallback(() => {
    setSelectedIndex((current) => (current === null || gallery.length === 0 ? current : (current + 1) % gallery.length));
  }, [gallery.length]);

  const previousPhoto = useCallback(() => {
    setSelectedIndex((current) => (current === null || gallery.length === 0 ? current : (current - 1 + gallery.length) % gallery.length));
  }, [gallery.length]);

  // Keyboard controls for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowRight') {
        nextPhoto();
      } else if (e.key === 'ArrowLeft') {
        previousPhoto();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, nextPhoto, previousPhoto]);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.address)}`;

  return (
    <div className="min-h-screen w-full bg-[#faf8f4] text-[#1a1a1a] selection:bg-[#0a1628] selection:text-[#faf8f4]">
      {/* HEADER */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? 'border-b border-black/5 bg-[#faf8f4]/95 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-16 sm:h-20 w-full max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-10 xl:px-14">
          <a href="#home" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 sm:gap-3 shrink-0 mr-2 sm:mr-3 lg:mr-4 xl:mr-6">
            <span className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border text-xs sm:text-sm font-black tracking-tight ${scrolled ? 'border-[#0a1628] bg-[#0a1628] text-white' : 'border-white/30 bg-white/10 text-white backdrop-blur-md'}`}>
              SS
            </span>
            <span className="leading-[1.15] shrink-0">
              <span className={`block font-serif text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] whitespace-nowrap ${scrolled ? 'text-[#c1272d]' : 'text-[#f0c0c0]'}`}>
                {t.taglineSchool}
              </span>
              <span className={`block font-serif text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap ${scrolled ? 'text-[#0a1628]' : 'text-white'}`}>
                {t.drivingSchool}
              </span>
            </span>
          </a>

          <nav className="hidden items-center justify-center flex-1 min-w-0 mx-2 lg:mx-3 xl:mx-6 lg:gap-2.5 xl:gap-4 2xl:gap-5 lg:flex">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`whitespace-nowrap text-[12px] xl:text-[13px] 2xl:text-[13.5px] font-semibold font-sans transition py-1 px-1 xl:px-1.5 shrink-0 ${
                  scrolled ? 'text-slate-600 hover:text-[#0a1628]' : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center shrink-0 lg:flex gap-1.5 xl:gap-2 ml-auto">
            <LanguageSwitcher scrolled={scrolled} />
            <SocialIcon href={settings.instagram_url || 'https://www.instagram.com'} label="Instagram" scrolled={scrolled}><Instagram size={17} /></SocialIcon>
            <SocialIcon href={settings.facebook_url || 'https://www.facebook.com'} label="Facebook" scrolled={scrolled}><Facebook size={17} /></SocialIcon>
            <SocialIcon href={whatsappUrl(settings.whatsapp, message)} label="WhatsApp" scrolled={scrolled}><MessageCircle size={17} /></SocialIcon>
            <SocialIcon href={phoneUrl(settings.phone)} label="Call" scrolled={scrolled}><Phone size={16} /></SocialIcon>
          </div>

          <div className="flex items-center shrink-0 gap-0.5 sm:gap-1.5 lg:hidden">
            <LanguageSwitcher scrolled={scrolled} />
            <div className="flex items-center">
              <SocialIcon href={settings.instagram_url || 'https://www.instagram.com'} label="Instagram" scrolled={scrolled}><Instagram size={16} /></SocialIcon>
              <SocialIcon href={settings.facebook_url || 'https://www.facebook.com'} label="Facebook" scrolled={scrolled}><Facebook size={16} /></SocialIcon>
            </div>
            <a
              href={phoneUrl(settings.phone)}
              aria-label="Call school"
              className={`flex h-9 w-9 sm:h-10 sm:w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition shrink-0 ${scrolled ? 'text-[#0a1628] hover:bg-black/5 active:bg-black/10' : 'text-white hover:bg-white/10 active:bg-white/20'}`}
            >
              <Phone size={16} />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              className={`flex h-9 w-9 sm:h-10 sm:w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition shrink-0 ${scrolled ? 'text-[#0a1628] hover:bg-black/5 active:bg-black/10' : 'text-white hover:bg-white/10 active:bg-white/20'}`}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT MENU */}
      <div className={`fixed inset-0 z-30 bg-[#0a1628] transition-transform duration-300 lg:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col px-6 pt-20 pb-8 overflow-y-auto">
          <div className="mb-2">
            <LanguageSwitcher isMobileNav onLanguageSelect={() => setMenuOpen(false)} />
          </div>

          <nav className="flex flex-col gap-1 my-auto">
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="border-b border-white/10 py-3.5 font-sans text-lg sm:text-xl font-bold text-white/90 active:text-[#c1272d]">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-8 grid gap-3">
            <a href="#contact" onClick={() => setMenuOpen(false)} className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#c1272d] py-3.5 text-sm font-bold font-sans text-white shadow-lg">
              {t.navBookAppointment} <ArrowUpRight size={16} />
            </a>
            <div className="grid grid-cols-2 gap-3">
              <a href={phoneUrl(settings.phone)} className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-xs sm:text-sm font-bold font-sans text-white active:bg-white/10">
                <Phone size={15} /> {t.mobileCall}
              </a>
              <a href={whatsappUrl(settings.whatsapp, bookingMessage)} className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-xs sm:text-sm font-bold font-sans text-white active:bg-white/10">
                <MessageCircle size={15} /> {t.mobileWhatsapp}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={settings.facebook_url || 'https://www.facebook.com'}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook Page"
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-[#1877F2]/15 py-3 text-xs sm:text-sm font-bold font-sans text-white hover:bg-[#1877F2]/25 active:bg-[#1877F2]/35 transition"
              >
                <Facebook size={16} className="text-[#1877F2] shrink-0" /> Facebook
              </a>
              <a
                href={settings.instagram_url || 'https://www.instagram.com'}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram Profile"
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-pink-500/15 py-3 text-xs sm:text-sm font-bold font-sans text-white hover:bg-pink-500/25 active:bg-pink-500/35 transition"
              >
                <Instagram size={16} className="text-pink-400 shrink-0" /> Instagram
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-xs sm:text-sm font-bold font-sans text-white active:bg-white/10"
              >
                <Navigation size={15} /> {t.mobileDirections}
              </a>
              <a
                href="/appointment-status"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-xs sm:text-sm font-bold font-sans text-white active:bg-white/10"
              >
                <Search size={15} /> {t.heroCheckStatusBtn}
              </a>
            </div>
            <a href="/admin" onClick={() => setMenuOpen(false)} className="mt-2 inline-flex min-h-[44px] items-center justify-center gap-2 text-xs font-medium font-sans text-white/50 hover:text-white py-2">
              <ShieldCheck size={14} className="text-[#c1272d]" /> {t.navOwnerLogin}
            </a>
          </div>
        </div>
      </div>

      <main className="w-full">
        {/* HERO */}
        <section id="home" className="relative flex min-h-[100svh] w-full items-center sm:items-end overflow-hidden bg-[#0a1628]">
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={heroImage}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/images/backroundimage.jpeg')) {
                  target.src = '/images/backroundimage.jpeg';
                } else if (!target.src.endsWith('/images/real-school-hero.webp')) {
                  target.src = '/images/real-school-hero.webp';
                }
              }}
              alt="Sri Sagar Motor Driving School Real Building and Training Facility"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-[center_45%] sm:object-[center_35%] lg:object-[60%_35%] scale-100 brightness-95 contrast-105 transition-all duration-500"
            />
            {/* Elegant gradient overlay designed to keep the real school building, signage & fleet clearly visible while keeping hero text 100% readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/45 to-black/20 sm:bg-gradient-to-r sm:from-[#0a1628]/85 sm:via-[#0a1628]/35 sm:to-transparent" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12 xl:px-16 pb-20 sm:pb-20 pt-24 sm:pt-36">
            <div className="max-w-3xl">
              {/* Badges bar */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-[11px] font-bold font-sans uppercase tracking-[0.1em] sm:tracking-[0.14em] text-white/90">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-white/10 border border-white/20 px-2.5 py-1 text-white shrink-0 whitespace-nowrap">
                  <MapPin size={11} className="text-[#c1272d] shrink-0" /> {t.heroLocationBadge}
                </span>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-white/10 border border-white/20 px-2.5 py-1 text-white shrink-0 whitespace-nowrap">
                  <Award size={11} className="text-amber-400 shrink-0" /> {t.heroYearsExp}
                </span>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-white/10 border border-white/20 px-2.5 py-1 text-white shrink-0 whitespace-nowrap">
                  <Users size={11} className="text-pink-300 shrink-0" /> {t.heroInstructorsBadge}
                </span>
                <span className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 border shrink-0 whitespace-nowrap ${isOpen ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' : 'bg-slate-500/20 border-slate-400/40 text-slate-300'}`}>
                  <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0 ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  {isOpen ? t.openNowBadge : t.closedNowBadge}
                </span>
              </div>

              <h1 className="mt-3.5 sm:mt-5 font-serif text-2xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[60px] font-extrabold leading-[1.2] sm:leading-[1.12] tracking-[-0.01em] text-white max-w-2xl lg:max-w-3xl">
                {t.heroTitle1} <br className="hidden sm:inline" />
                <span className="text-white/80">{t.heroTitle2}</span> <span className="font-serif italic font-normal text-[#f0c0c0]">{t.heroTitle3}</span>
              </h1>

              <p className="mt-3 sm:mt-6 max-w-xl text-xs sm:text-base leading-relaxed sm:leading-relaxed font-sans text-white/80">
                {t.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="mt-5 sm:mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 w-full">
                <a
                  href={phoneUrl(settings.phone)}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-full bg-white px-3 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold font-sans text-[#0a1628] shadow-md hover:bg-slate-100 active:scale-[0.98] transition duration-200"
                >
                  <Phone size={14} className="text-[#c1272d] shrink-0" /> <span className="truncate">{t.heroCallNowBtn}</span>
                </a>

                <a
                  href={whatsappUrl(settings.whatsapp, bookingMessage)}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-full bg-[#25D366] px-3 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold font-sans text-white shadow-md hover:bg-[#20ba5a] active:scale-[0.98] transition duration-200"
                >
                  <MessageCircle size={15} className="shrink-0" /> <span className="truncate">{t.heroWhatsappBtn}</span>
                </a>

                <a
                  href="#contact"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-full bg-[#c1272d] px-3 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold font-sans text-white shadow-md hover:bg-[#a51f25] active:scale-[0.98] transition duration-200"
                >
                  <span className="truncate">{t.heroBookBtn}</span> <ArrowRight size={15} className="shrink-0" />
                </a>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-3 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold font-sans text-white hover:bg-white/20 active:scale-[0.98] transition duration-200"
                >
                  <Navigation size={13} className="shrink-0" /> <span className="truncate">{t.heroDirectionsBtn}</span>
                </a>
              </div>

              {/* Trust Indicators Bar */}
              <div className="mt-5 sm:mt-10 flex items-center flex-nowrap gap-2.5 sm:gap-4 md:gap-6 pt-3.5 sm:pt-5 border-t border-white/15 overflow-x-auto no-scrollbar whitespace-nowrap">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className="flex gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={12} className="sm:w-[13px] sm:h-[13px]" fill="currentColor" />
                    ))}
                  </div>
                  <span className="font-sans text-xs sm:text-sm font-bold text-white">4.9</span>
                </div>
                <span className="h-3.5 w-px bg-white/20 shrink-0" />
                <span className="text-xs sm:text-sm font-sans text-white/80 shrink-0">{t.heroEstablished}</span>
                <span className="h-3.5 w-px bg-white/20 shrink-0" />
                <a
                  href="/appointment-status"
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-white/90 hover:text-white underline underline-offset-4 active:text-white transition-colors shrink-0"
                >
                  <Search size={12} className="shrink-0" /> {t.heroCheckStatusBtn}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT US */}
        <ScrollRevealSection id="about" className="w-full bg-[#faf8f4] py-20 sm:py-28 lg:py-32">
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0a1628] shadow-2xl">
                {!aboutImgLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0a1628] animate-pulse">
                    <ImageIcon className="text-white/10" size={32} />
                  </div>
                )}
                <img
                  src={aboutImage}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith('/images/owner.webp')) {
                      target.src = '/images/owner.webp';
                    }
                  }}
                  alt="Sri Sagar Driving School - 25+ Years Experience"
                  loading="eager"
                  decoding="async"
                  onLoad={() => setAboutImgLoaded(true)}
                  className="h-[22rem] sm:h-[32rem] w-full object-cover object-[center_20%] transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:bottom-6 sm:left-6 rounded-2xl bg-[#0a1628] p-4 sm:px-6 sm:py-5 text-white shadow-xl lg:-left-10 border border-white/10">
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f0c0c0]">{t.aboutYearsExp}</p>
                <p className="mt-0.5 text-[11px] sm:text-xs font-semibold font-sans uppercase tracking-wider text-white/70">{t.aboutYearsExpLabel}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold font-sans uppercase tracking-[0.3em] text-[#c1272d]">{t.aboutEyebrow}</p>
              <h2 className="mt-3 font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-[-0.01em] text-[#0a1628]">
                {t.aboutTitle1}<br />{t.aboutTitle2}
              </h2>
              <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed font-sans text-slate-600">
                {t.aboutSubtitle}
              </p>

              <div className="mt-7 grid gap-3.5 sm:grid-cols-2">
                {[
                  t.aboutBullet1,
                  t.aboutBullet2,
                  t.aboutBullet3,
                  t.aboutBullet4,
                  t.aboutBullet5,
                  t.aboutBullet6
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-xs sm:text-sm font-bold font-sans text-[#0a1628]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0a1628] text-white">
                      <Check size={14} />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#courses" className="group inline-flex items-center gap-2 font-sans font-bold text-[#0a1628]">
                  <span className="border-b-2 border-[#c1272d] pb-0.5">{t.aboutExploreBtn}</span>
                  <ArrowRight size={17} className="text-[#c1272d] transition group-hover:translate-x-1" />
                </a>
                <span className="text-slate-300">•</span>
                <a href={phoneUrl(settings.phone)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c1272d] hover:underline">
                  <Phone size={13} /> {settings.phone}
                </a>
              </div>
            </div>
          </div>
          </div>
        </ScrollRevealSection>

        {/* COURSES & TRAINING OPTIONS */}
        <DrivingCoursesSection />

        {/* 5-STEP DRIVING JOURNEY */}
        <DrivingJourneySection />

        {/* WHAT YOU'LL LEARN / CURRICULUM */}
        <WhatYouLearnSection />

        {/* WHY CHOOSE US */}
        <ScrollRevealSection id="why-us" className="w-full bg-[#faf8f4] py-20 sm:py-28">
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold font-sans uppercase tracking-[0.3em] text-[#c1272d]">{t.whyUsEyebrow}</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-bold text-[#0a1628]">
              {t.whyUsTitle1}<br />{t.whyUsTitle2}
            </h2>
            <p className="mt-4 text-sm sm:text-base font-sans text-slate-600">
              {t.whyUsSubtitle}
            </p>
          </div>

          <div className="mt-10 sm:mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="group flex gap-4 sm:gap-5 border-b border-[#e2e0db] pb-6 sm:pb-8">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a1628] text-white group-hover:bg-[#c1272d] transition duration-300">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#0a1628]">{title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed font-sans text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </ScrollRevealSection>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <FaqSection settings={settings} />

        {/* GALLERY */}
        <ScrollRevealSection id="gallery" className="w-full bg-[#faf8f4] py-20 sm:py-28">
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-bold font-sans uppercase tracking-[0.3em] text-[#c1272d]">{t.galleryEyebrow}</p>
                <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-bold text-[#0a1628]">
                  {t.galleryTitle}
                </h2>
              </div>
              <p className="max-w-sm text-sm font-sans text-slate-600">
                {t.gallerySubtitle}
              </p>
            </div>

            {loadingGallery ? (
              <div className="flex min-h-48 items-center justify-center">
                <LoaderCircle className="animate-spin text-[#c1272d]" size={28} />
              </div>
            ) : gallery.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-[#d4d0c8] p-10 text-center text-sm font-sans text-slate-500">
                {t.galleryEmpty}
              </div>
            ) : (
              <>
                <div className="mt-8 sm:mt-10">
                  <MasonryGallery
                    images={gallery}
                    onSelectImage={setSelectedIndex}
                    variant="homepage-asymmetric"
                  />
                </div>

                {/* VIEW MORE BUTTON - NAVIGATES TO /gallery */}
                <div className="mt-10 sm:mt-12 flex items-center justify-center text-center">
                  <button
                    type="button"
                    id="gallery-view-more-btn"
                    onClick={() => navigateTo('/gallery')}
                    className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0a1628] px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold font-sans text-white shadow-lg shadow-[#0a1628]/15 hover:bg-[#12243e] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition duration-200 cursor-pointer"
                  >
                    <span>{t.galleryViewMore || 'View More'}</span>
                    <ArrowRight size={16} className="transition group-hover:translate-x-1 text-white/80" />
                  </button>
                </div>
              </>
            )}
          </div>
        </ScrollRevealSection>

        {/* REVIEWS SECTION */}
        <ReviewsSection settings={settings} />

        {/* CTA / QUERIES BANNER WITH BACKGROUND IMAGE */}
        <ScrollRevealSection className="relative w-full overflow-hidden bg-[#0a1628] px-4 sm:px-8 lg:px-12 xl:px-16 py-16 sm:py-24 text-white">
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={ctaHeroImage}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/images/hero-school.png')) {
                  target.src = '/images/hero-school.png';
                }
              }}
              alt="Sri Sagar Motor Driving School Training Facility"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-[50%_30%] opacity-35 brightness-95 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/85 to-[#c1272d]/85" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#0a1628]/30 to-[#0a1628]/70" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[10px] sm:text-[11px] font-bold font-sans uppercase tracking-[0.25em] text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {t.ctaEyebrow}
              </span>
              <h2 className="mt-3 font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.18] tracking-tight">
                {t.ctaTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm sm:text-base font-sans text-white/85 leading-relaxed">
                {t.ctaSubtitle}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row shrink-0">
              <a
                href={phoneUrl(settings.phone)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-xs sm:text-sm font-bold font-sans text-[#0a1628] shadow-lg hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 transition duration-200"
              >
                <Phone size={15} className="text-[#c1272d]" /> {t.ctaCallBtn}
              </a>
              <a
                href={whatsappUrl(settings.whatsapp, bookingMessage)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-xs sm:text-sm font-bold font-sans text-white shadow-lg hover:bg-[#20ba5a] hover:-translate-y-0.5 active:translate-y-0 transition duration-200"
              >
                <MessageCircle size={16} /> {t.ctaWhatsappBtn}
              </a>
              <a
                href="#contact"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#c1272d] px-7 py-3.5 text-xs sm:text-sm font-bold font-sans text-white shadow-lg hover:bg-[#a51f25] hover:-translate-y-0.5 active:translate-y-0 transition duration-200"
              >
                <span>{t.navBookAppointment}</span> <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </ScrollRevealSection>

        {/* CONTACT + APPOINTMENT FORM */}
        <ScrollRevealSection id="contact" className="w-full bg-[#faf8f4] py-20 sm:py-28">
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div>
              <p className="text-[11px] font-bold font-sans uppercase tracking-[0.3em] text-[#c1272d]">{t.contactEyebrow}</p>
              <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-bold text-[#0a1628]">
                {t.contactTitle1}<br />{t.contactTitle2}
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed font-sans text-slate-600">
                {t.contactSubtitle}
              </p>

              <div className="mt-8 space-y-5">
                <ContactLine icon={Phone} label={t.contactPhoneLabel} value={settings.phone} href={phoneUrl(settings.phone)} />
                <ContactLine
                  icon={Clock3}
                  label={t.contactHoursLabel}
                  value={settings.opening_hours}
                  extraBadge={
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ml-2 ${isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                  }
                />
                <ContactLine icon={MapPin} label={t.contactAddressLabel} value={settings.address} />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={settings.facebook_url || 'https://www.facebook.com'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook Page"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#0a1628]/15 bg-white px-4 py-2.5 text-xs font-bold font-sans text-[#0a1628] shadow-xs hover:border-[#1877F2] hover:text-[#1877F2] active:bg-slate-50 transition duration-200"
                >
                  <Facebook size={16} className="text-[#1877F2] shrink-0" />
                  <span>Facebook</span>
                </a>
                <a
                  href={settings.instagram_url || 'https://www.instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram Profile"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#0a1628]/15 bg-white px-4 py-2.5 text-xs font-bold font-sans text-[#0a1628] shadow-xs hover:border-pink-500 hover:text-pink-600 active:bg-slate-50 transition duration-200"
                >
                  <Instagram size={16} className="text-pink-600 shrink-0" />
                  <span>Instagram</span>
                </a>
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#0a1628]/15 bg-white px-4 py-2.5 text-xs font-bold font-sans text-[#c1272d] hover:underline uppercase"
                >
                  {t.contactViewMaps} <ExternalLink size={14} />
                </a>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#0a1628]/15 bg-white px-4 py-2.5 text-xs font-bold font-sans text-[#0a1628] hover:underline uppercase"
                >
                  {t.contactGetDirections} <ArrowUpRight size={14} />
                </a>
              </div>
            </div>

            <AppointmentForm phone={settings.phone} whatsapp={settings.whatsapp} />
          </div>
          </div>
        </ScrollRevealSection>

        {/* LOCATION MAP SECTION */}
        <ScrollRevealSection id="location" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-20">
          <div className="mx-auto w-full max-w-[1600px] overflow-hidden rounded-2xl sm:rounded-3xl border border-[#e2e0db] bg-white shadow-xl shadow-black/5">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* Left Details */}
              <div className="flex flex-col justify-center bg-[#f4f1ea] p-6 sm:p-10 lg:p-12">
                <span className="text-[11px] font-bold font-sans uppercase tracking-[0.3em] text-[#c1272d]">{t.locationEyebrow}</span>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0a1628]">
                  {t.locationTitle1}<br />{t.locationTitle2}
                </h2>
                <p className="mt-2 text-xs sm:text-sm font-sans text-slate-600">
                  {t.locationSubtitle}
                </p>

                <div className="mt-6 space-y-4 text-xs sm:text-sm font-sans text-slate-600">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-[#c1272d]" />
                    <div>
                      <strong className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.contactAddressLabel}</strong>
                      <p className="mt-0.5 font-semibold text-[#0a1628] leading-relaxed">{settings.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 shrink-0 text-[#c1272d]" />
                    <div>
                      <strong className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.contactPhoneLabel}</strong>
                      <a href={phoneUrl(settings.phone)} className="mt-0.5 block font-bold text-[#0a1628] hover:underline">
                        {settings.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock3 size={18} className="mt-0.5 shrink-0 text-[#c1272d]" />
                    <div>
                      <strong className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.contactHoursLabel}</strong>
                      <p className="mt-0.5 font-semibold text-[#0a1628]">{settings.opening_hours}</p>
                    </div>
                  </div>
                </div>

                {/* Google Maps Action Buttons */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={settings.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a1628] px-5 py-3.5 text-xs font-bold font-sans text-white shadow-md hover:bg-[#12243e] hover:-translate-y-0.5 active:translate-y-0 transition duration-200 uppercase"
                  >
                    {t.contactViewMaps} <ExternalLink size={14} />
                  </a>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0a1628]/20 bg-white px-5 py-3.5 text-xs font-bold font-sans text-[#0a1628] shadow-sm hover:bg-[#f8f6f0] hover:-translate-y-0.5 active:translate-y-0 transition duration-200 uppercase"
                  >
                    {t.contactGetDirections} <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>

              {/* Interactive Google Map Embed */}
              <div className="relative min-h-[300px] sm:min-h-[350px] lg:min-h-[460px] w-full bg-[#e5e3df]">
                <iframe
                  title="Sri Sagar Driving School Map Location"
                  src="https://maps.google.com/maps?q=13.047706,77.576265&hl=en&z=16&output=embed"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen={false}
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </ScrollRevealSection>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#0a1628] px-4 sm:px-8 lg:px-12 xl:px-16 pb-28 sm:pb-12 pt-16 text-white">
        <div className="mx-auto grid w-full max-w-[1600px] gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-xs font-black">
                SS
              </span>
              <span className="leading-[1.15]">
                <span className="block font-serif text-[9.5px] font-bold uppercase tracking-[0.25em] text-[#c1272d]">{t.taglineSchool}</span>
                <span className="block font-serif text-sm font-bold text-white">{t.drivingSchool}</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-xs sm:text-sm leading-relaxed font-sans text-white/50">
              {t.footerDesc}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <SocialIcon href={settings.instagram_url || 'https://www.instagram.com'} label="Instagram"><Instagram size={16} /></SocialIcon>
              <SocialIcon href={settings.facebook_url || 'https://www.facebook.com'} label="Facebook"><Facebook size={16} /></SocialIcon>
              <SocialIcon href={whatsappUrl(settings.whatsapp, message)} label="WhatsApp"><MessageCircle size={16} /></SocialIcon>
              <SocialIcon href={phoneUrl(settings.phone)} label="Call"><Phone size={15} /></SocialIcon>
            </div>
          </div>

          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white/40">{t.footerNavHeading}</h3>
            <div className="mt-4 grid gap-2 text-xs sm:text-sm font-sans text-white/60">
              {navLinks.map((item) => (
                <a key={item.label} href={item.href} className="hover:text-white transition">{item.label}</a>
              ))}
              <a href="/appointment-status" className="hover:text-white transition">{t.navCheckAppointment}</a>
            </div>
          </div>

          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white/40">{t.footerCoursesHeading}</h3>
            <div className="mt-4 grid gap-2 text-xs sm:text-sm font-sans text-white/60">
              {courses.slice(0, 6).map((course) => (
                <a key={course} href="#contact" className="hover:text-white transition">{t.courseNames[course] || course}</a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white/40">{t.footerContactHeading}</h3>
            <a href={phoneUrl(settings.phone)} className="mt-4 block text-xs sm:text-sm font-semibold font-sans text-white/70 hover:text-white">
              {settings.phone}
            </a>
            <p className="mt-2 text-xs font-sans text-white/50 leading-relaxed">{settings.address}</p>
            <p className="mt-2 text-xs font-sans text-white/40">{settings.opening_hours}</p>
          </div>
        </div>

        <div className="mx-auto mt-12 flex w-full max-w-[1600px] flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs font-sans text-white/40 sm:flex-row">
          <span>{t.footerCopyright}</span>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">{t.footerTagline}</span>
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium font-sans text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white transition"
            >
              <ShieldCheck size={14} className="text-[#c1272d]" /> {t.footerAdminLogin}
            </a>
          </div>
        </div>
      </footer>

      {/* MOBILE FIXED BOTTOM ACTION BAR */}
      <div className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-black/10 bg-[#faf8f4]/95 p-2 backdrop-blur-lg sm:hidden gap-1.5">
        <a href={phoneUrl(settings.phone)} className="flex items-center justify-center gap-1 rounded-xl bg-[#0a1628] py-2.5 text-xs font-bold text-white active:bg-[#12243e]">
          <Phone size={13} /> {t.mobileCall}
        </a>
        <a href={whatsappUrl(settings.whatsapp, bookingMessage)} className="flex items-center justify-center gap-1 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white active:bg-[#20ba5a]">
          <MessageCircle size={13} /> {t.mobileWhatsapp}
        </a>
        <a href="#contact" className="flex items-center justify-center gap-1 rounded-xl bg-[#c1272d] py-2.5 text-xs font-bold text-white active:bg-[#a51f25]">
          <ArrowUpRight size={13} /> {t.mobileBook}
        </a>
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-[#0a1628] active:bg-slate-100">
          <Navigation size={13} /> {t.mobileDirections}
        </a>
      </div>

      {/* GALLERY LIGHTBOX */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1628]/95 p-4 sm:p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            aria-label="Close image preview"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition cursor-pointer"
            onClick={() => setSelectedIndex(null)}
          >
            <X size={20} />
          </button>

          {/* Previous button */}
          <button
            type="button"
            aria-label="Previous image"
            className="absolute left-2 sm:left-6 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              previousPhoto();
            }}
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="flex flex-col items-center max-h-[90vh] max-w-[90vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={galleryImageUrl(selectedPhoto.storage_path)}
              alt={selectedPhoto.title || 'Sri Sagar Driving School'}
              onError={(e) => {
                const target = e.currentTarget;
                const raw = (selectedPhoto.storage_path || '').trim();
                const clean = raw.replace(/^\/+/, '').replace(/^images\//, '');
                if (clean && !target.src.endsWith(`/images/${clean}`)) {
                  target.src = `/images/${clean}`;
                }
              }}
              className="max-h-[75vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl"
            />
            {selectedPhoto.title && (
              <div className="mt-3 text-center text-white">
                <p className="font-serif text-base sm:text-lg font-bold">{selectedPhoto.title}</p>
                {selectedPhoto.category && (
                  <p className="text-xs font-sans text-white/70 uppercase tracking-wider mt-0.5">{selectedPhoto.category}</p>
                )}
              </div>
            )}
          </div>

          {/* Next button */}
          <button
            type="button"
            aria-label="Next image"
            className="absolute right-2 sm:right-6 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              nextPhoto();
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

function SocialIcon({
  href,
  label,
  scrolled = false,
  children
}: {
  href: string | null;
  label: string;
  scrolled?: boolean;
  children: React.ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`flex h-10 w-10 sm:h-11 sm:w-11 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] items-center justify-center rounded-full transition shrink-0 ${
        scrolled
          ? 'text-[#0a1628] hover:bg-black/5 active:bg-black/10'
          : 'text-white hover:bg-white/10 active:bg-white/20'
      }`}
    >
      {children}
    </a>
  );
}

function ContactLine({
  icon: Icon,
  label,
  value,
  href,
  extraBadge
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
  extraBadge?: React.ReactNode;
}) {
  const content = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a1628] text-white">
        <Icon size={18} />
      </span>
      <div>
        <div className="flex items-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
          {extraBadge}
        </div>
        <span className="mt-0.5 block max-w-sm font-display font-bold leading-snug text-[#0a1628] text-sm">{value}</span>
      </div>
    </>
  );
  return href ? (
    <a href={href} className="group flex items-start gap-3.5 hover:opacity-90">
      {content}
    </a>
  ) : (
    <div className="flex items-start gap-3.5">{content}</div>
  );
}


