import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';

interface LanguageSwitcherProps {
  scrolled?: boolean;
  className?: string;
  isMobileNav?: boolean;
  onLanguageSelect?: () => void;
}

export default function LanguageSwitcher({
  scrolled = false,
  className = '',
  isMobileNav = false,
  onLanguageSelect
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectLang = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
    onLanguageSelect?.();
  };

  if (isMobileNav) {
    return (
      <div className="w-full rounded-2xl border border-white/15 bg-white/5 p-3 text-white">
        <div className="flex items-center gap-2 px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-white/60">
          <Globe size={14} className="text-[#f0c0c0]" />
          <span>{t.selectLanguage}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => selectLang('en')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              language === 'en'
                ? 'bg-[#c1272d] text-white shadow-md'
                : 'border border-white/10 bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {language === 'en' && <Check size={14} />}
            <span>English</span>
          </button>
          <button
            type="button"
            onClick={() => selectLang('kn')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              language === 'kn'
                ? 'bg-[#c1272d] text-white shadow-md'
                : 'border border-white/10 bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {language === 'kn' && <Check size={14} />}
            <span>ಕನ್ನಡ</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t.selectLanguage || "Select language"}
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex h-8 w-8 min-[360px]:h-8.5 min-[360px]:w-8.5 min-[390px]:h-9 min-[390px]:w-9 sm:h-10 sm:w-10 lg:w-auto lg:h-9 items-center justify-center rounded-lg lg:rounded-full lg:px-3.5 lg:py-1.5 lg:gap-1.5 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-[#c1272d] ${
          scrolled
            ? 'border border-slate-200/80 bg-white/90 text-[#0a1628] shadow-xs hover:border-[#0a1628] hover:bg-slate-50'
            : 'border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:border-white/40'
        }`}
      >
        <Globe size={16} className={`shrink-0 min-[360px]:w-[17px] min-[360px]:h-[17px] sm:w-[18px] sm:h-[18px] lg:w-3.5 lg:h-3.5 ${scrolled ? 'text-[#c1272d]' : 'text-white'}`} />
        <span className="hidden lg:inline font-semibold">
          {language === 'kn' ? 'ಕನ್ನಡ' : 'Language'}
        </span>
        <ChevronDown size={12} className={`hidden lg:block shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-36 sm:w-40 origin-top-right rounded-xl border border-black/10 bg-white p-1.5 text-[#0a1628] shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => selectLang('en')}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition ${
              language === 'en'
                ? 'bg-[#0a1628] text-white'
                : 'text-[#0a1628] hover:bg-[#f4f1ea]'
            }`}
          >
            <span>English</span>
            {language === 'en' && <Check size={14} className="text-[#f0c0c0]" />}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => selectLang('kn')}
            className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition ${
              language === 'kn'
                ? 'bg-[#0a1628] text-white'
                : 'text-[#0a1628] hover:bg-[#f4f1ea]'
            }`}
          >
            <span>ಕನ್ನಡ</span>
            {language === 'kn' && <Check size={14} className="text-[#f0c0c0]" />}
          </button>
        </div>
      )}
    </div>
  );
}
