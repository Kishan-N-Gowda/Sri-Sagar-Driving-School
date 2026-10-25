import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ScrollRevealSection from '@/components/ScrollRevealSection';
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Navigation,
  Phone,
  Send,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { phoneUrl, whatsappUrl } from '@/lib/supabase';
import { SiteSettings } from '@/lib/types';

interface FaqSectionProps {
  settings: SiteSettings;
}

export function FaqSection({ settings }: FaqSectionProps) {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    settings.address
  )}`;
  const enquiryMessage =
    'Hello Sri Sagar Driving School, I have a query about driving training classes in Bhadrappa Layout.';

  const isKn = language === 'kn';

  const faqs = [
    {
      q: isKn
        ? 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ ಎಲ್ಲಿದೆ?'
        : 'Where is Sri Sagar Driving School located?',
      a: isKn
        ? 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ 1ನೇ ಮಹಡಿ, ಶ್ರೀನಿಕ ಕಾಂಪ್ಲೆಕ್ಸ್, ಭದ್ರಪ್ಪ ಲೇಔಟ್ ಸರ್ವೀಸ್ ರೋಡ್, ಭದ್ರಪ್ಪ ಲೇಔಟ್, ಕೋಟಿ ಹೊಸಹಳ್ಳಿ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ 560094 ರಲ್ಲಿದೆ. ಕಿರು ಸ್ಥಳ: ಭದ್ರಪ್ಪ ಲೇಔಟ್, ಬೆಂಗಳೂರು.'
        : 'Sri Sagar Driving School is located at 1st Floor, Srinika Complex, Bhadrappa Layout Service Rd, Bhadrappa Layout, Koti Hosahalli, Bengaluru, Karnataka 560094. (Short Location: Bhadrappa Layout, Bengaluru).',
      showDirections: true,
    },
    {
      q: isKn
        ? 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ ಎಷ್ಟು ವರ್ಷಗಳಿಂದ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿ ನೀಡುತ್ತಿದೆ?'
        : 'How long has Sri Sagar Driving School been providing driving training?',
      a: isKn
        ? 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ 2001 ರಲ್ಲಿ ಸ್ಥಾಪನೆಯಾಗಿದ್ದು, ಡ್ರೈವಿಂಗ್ ಮತ್ತು ಮೋಟಾರ್ ತರಬೇತಿಯಲ್ಲಿ 25+ ವರ್ಷಗಳ ಅನುಭವವನ್ನು ಹೊಂದಿದೆ.'
        : 'Sri Sagar Driving School was established in 2001 and has 25+ years of experience in driving and motor training.',
    },
    {
      q: isKn
        ? 'ಯಾವ ರೀತಿಯ ವಾಹನ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿಗಳು ಲಭ್ಯವಿದೆ?'
        : 'What types of driving training are available?',
      a: isKn
        ? 'ದ್ವಿಚಕ್ರ ವಾಹನಗಳು (ಟೂ-ವ್ಹೀಲರ್) ಮತ್ತು ಕಾರುಗಳು / ನಾಲ್ಕು ಚಕ್ರಗಳ ವಾಹನಗಳಿಗೆ (ಫೋರ್-ವ್ಹೀಲರ್) ಪ್ರಾಯೋಗಿಕ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿಯನ್ನು ನೀಡಲಾಗುತ್ತದೆ. ಜೊತೆಗೆ ಅನುಭವಸ್ಥರಿಗೆ ರಿಫ್ರೆಶರ್ ತರಬೇತಿ ಮತ್ತು ಹೆವಿ ವೆಹಿಕಲ್ ಮಾರ್ಗದರ್ಶನವೂ ಲಭ್ಯವಿದೆ.'
        : 'The school provides practical driving and motor training for two-wheelers and four-wheelers/cars, as well as beginner foundation, refresher courses, and heavy vehicle training.',
    },
    {
      q: isKn
        ? 'ಪುರುಷರು ಮತ್ತು ಮಹಿಳೆಯರಿಬ್ಬರಿಗೂ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿ ಲಭ್ಯವಿದೆಯೇ?'
        : 'Is driving training available for both men and women?',
      a: isKn
        ? 'ಹೌದು. ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ ಪುರುಷರು ಮತ್ತು ಮಹಿಳೆಯರಿಬ್ಬರಿಗೂ ಗೌರವಯುತ ಹಾಗೂ ಸ್ನೇಹಪರ ವಾತಾವರಣದಲ್ಲಿ ಸುರಕ್ಷಿತ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿಯನ್ನು ಒದಗಿಸುತ್ತದೆ.'
        : 'Yes. The school provides driving training for both men and women in a comfortable, supportive, and safe learning environment.',
    },
    {
      q: isKn
        ? 'ಪುರುಷ ಮತ್ತು ಮಹಿಳಾ ಡ್ರೈವಿಂಗ್ ತರಬೇತುದಾರರು (ಇನ್‌ಸ್ಟ್ರಕ್ಟರ್ಸ್) ಲಭ್ಯವಿದ್ದಾರೆಯೇ?'
        : 'Are male and female driving instructors available?',
      a: isKn
        ? 'ಹೌದು. ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್‌ನಲ್ಲಿ ಪುರುಷ ಮತ್ತು ಮಹಿಳಾ ತರಬೇತುದಾರರಿಬ್ಬರೂ ಲಭ್ಯವಿದ್ದಾರೆ. ಕಲಿಯುವವರು ತರಗತಿಗಳಿಗೆ ವಿಚಾರಿಸುವಾಗ ಲಭ್ಯತೆಗೆ ಒಳಪಟ್ಟು ತಮ್ಮ ಆದ್ಯತೆಯ ತರಬೇತುದಾರರ ಆಯ್ಕೆಯನ್ನು ಚರ್ಚಿಸಬಹುದು.'
        : 'Yes. Sri Sagar Driving School has both male and female driving instructors. Learners can discuss their preferred instructor option when enquiring about driving classes, subject to instructor availability.',
    },
    {
      q: isKn
        ? 'ಶಾಲೆ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಸಮಯ ಯಾವುದು?'
        : 'What are the operating hours?',
      a: isKn
        ? 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ ಸೋಮವಾರದಿಂದ ಭಾನುವಾರದವರೆಗೆ ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ 8:30 ರಿಂದ ಸಂಜೆ 7:30 ರವರೆಗೆ ತೆರೆದಿರುತ್ತದೆ.'
        : 'Sri Sagar Driving School is open Monday – Sunday: 8:30 AM – 7:30 PM every day.',
    },
    {
      q: isKn
        ? 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ ಅನ್ನು ಹೇಗೆ ಸಂಪರ್ಕಿಸುವುದು?'
        : 'How can I contact Sri Sagar Driving School?',
      a: isKn
        ? 'ಗ್ರಾಹಕರು ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿರುವ ನೇರ ಕರೆ (Call Now) ಅಥವಾ ವಾಟ್ಸಾಪ್ (WhatsApp) ಬಟನ್‌ಗಳ ಮೂಲಕ ಸುಲಭವಾಗಿ ಸಂಪರ್ಕಿಸಬಹುದು.'
        : `Customers can contact the school directly through the Call Now button (${settings.phone}) or WhatsApp chat.`,
    },
    {
      q: isKn
        ? 'ಡ್ರೈವಿಂಗ್ ತರಗತಿಗಳ ಬಗ್ಗೆ ಹೇಗೆ ವಿಚಾರಿಸುವುದು?'
        : 'How can I enquire about driving classes?',
      a: isKn
        ? 'ನೀವು ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿರುವ "Enquire Now" ಫಾರ್ಮ್ ಭರ್ತಿ ಮಾಡಬಹುದು ಅಥವಾ ನೇರವಾಗಿ ಫೋನ್ / ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ ಮಾಹಿತಿ ಪಡೆಯಬಹುದು.'
        : 'Customers can use the Enquire Now button / booking form on this website or reach out directly by phone/WhatsApp to get all the required details.',
    },
    {
      q: isKn
        ? 'ಶಾಲೆ ಪ್ರಾಯೋಗಿಕ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿಯನ್ನು ನೀಡುತ್ತದೆಯೇ?'
        : 'Does the school provide practical driving training?',
      a: isKn
        ? 'ಹೌದು. ನಮ್ಮ ತರಬೇತಿಯು ಪ್ರಾಯೋಗಿಕ ಡ್ರೈವಿಂಗ್ ಕೌಶಲ್ಯಗಳು, ರಸ್ತೆ ನಿಯಮಗಳ ಅರಿವು, ವಾಹನ ನಿಯಂತ್ರಣ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಬೆಳೆಸುವತ್ತ ಸಂಪೂರ್ಣವಾಗಿ ಗಮನಹರಿಸುತ್ತದೆ.'
        : 'Yes. The training focuses on developing real-world practical driving skills, complete vehicle control, city traffic confidence, and road-safety awareness.',
    },
    {
      q: isKn
        ? 'ಡ್ರೈವಿಂಗ್ ತರಗತಿಗಳನ್ನು ಪ್ರಾರಂಭಿಸುವುದು ಹೇಗೆ?'
        : 'How do I get started with driving classes?',
      a: isKn
        ? 'Call Now, WhatsApp, ಅಥವಾ Enquire Now ಮೂಲಕ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ ನಿಮ್ಮ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕ ತರಬೇತಿಯ ವಿವರಗಳನ್ನು ಪಡೆದು ತರಗತಿಗಳಿಗೆ ಸುಲಭವಾಗಿ ದಾಖಲಾಗಬಹುದು.'
        : 'Simply contact Sri Sagar Driving School through Call Now, WhatsApp, or Enquire Now to discuss your training requirements and get all relevant information before starting your classes.',
    },
    {
      q: isKn
        ? 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ ಅನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು?'
        : 'What makes Sri Sagar Driving School an experienced choice?',
      a: isKn
        ? '2001 ರಲ್ಲಿ ಸ್ಥಾಪನೆ, 25+ ವರ್ಷಗಳ ಸುದೀರ್ಘ ಅನುಭವ, ಭದ್ರಪ್ಪ ಲೇಔಟ್‌ನಲ್ಲಿ ಸುಲಭ ತಲುಪುವ ಸ್ಥಳ, ದ್ವಿಚಕ್ರ ಮತ್ತು ನಾಲ್ಕು ಚಕ್ರಗಳ ತರಬೇತಿ, ಪುರುಷ ಮತ್ತು ಮಹಿಳೆಯರಿಗೆ ಪ್ರತ್ಯೇಕ ಗಮನ, ಪುರುಷ ಮತ್ತು ಮಹಿಳಾ ತರಬೇತುದಾರರ ಲಭ್ಯತೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಪ್ರಾಯೋಗಿಕ ವಿಧಾನ.'
        : 'Established in 2001 with 25+ years of driving training experience in Bhadrappa Layout, Bengaluru. Providing two-wheeler and four-wheeler training for men and women with male & female instructor options and a dedicated focus on practical safety.',
    },
    {
      q: isKn
        ? 'ಡ್ರೈವಿಂಗ್ ಶಾಲೆಗೆ ತಲುಪುವುದು ಹೇಗೆ (ರೂಟ್ ಮ್ಯಾಪ್)?'
        : 'How can I find the driving school?',
      a: isKn
        ? 'ವಿಳಾಸ: 1ನೇ ಮಹಡಿ, ಶ್ರೀನಿಕ ಕಾಂಪ್ಲೆಕ್ಸ್, ಭದ್ರಪ್ಪ ಲೇಔಟ್ ಸರ್ವೀಸ್ ರೋಡ್, ಭದ್ರಪ್ಪ ಲೇಔಟ್, ಕೋಟಿ ಹೊಸಹಳ್ಳಿ, ಬೆಂಗಳೂರು 560094. ಕೆಳಗಿನ Get Directions ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ನೇರ ಗೂಗಲ್ ಮ್ಯಾಪ್ ಮಾರ್ಗವನ್ನು ಪಡೆಯಿರಿ.'
        : 'Address: 1st Floor, Srinika Complex, Bhadrappa Layout Service Rd, Bhadrappa Layout, Koti Hosahalli, Bengaluru, Karnataka 560094. Click the Get Directions button below for live navigation on Google Maps.',
      showDirections: true,
    },
  ];

  return (
    <ScrollRevealSection
      id="faq"
      className="w-full bg-[#faf8f4] py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-4xl lg:max-w-5xl px-4 sm:px-8 lg:px-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#c1272d]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-[#c1272d]">
          <HelpCircle size={13} /> {isKn ? 'ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು' : 'Got Questions?'}
        </div>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a1628]">
          {isKn ? 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು (FAQ)' : 'Frequently Asked Questions'}
        </h2>
        <p className="mt-3 text-sm sm:text-base font-sans text-slate-600">
          {isKn
            ? 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್, ಭದ್ರಪ್ಪ ಲೇಔಟ್ ಬೆಂಗಳೂರಿನಲ್ಲಿ ನಮ್ಮ ತರಗತಿಗಳು, ಸಮಯ ಮತ್ತು ತರಬೇತಿ ಕುರಿತ ಅಗತ್ಯ ಮಾಹಿತಿ ಇಲ್ಲಿದೆ.'
            : 'Everything you need to know about driving classes, instructor options, timings, and location at Sri Sagar Driving School, Bhadrappa Layout, Bengaluru.'}
        </p>
      </div>

      {/* Accordion List */}
      <div className="mt-10 sm:mt-12 space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-[#0a1628]/20 bg-white shadow-sm ring-1 ring-[#0a1628]/5'
                  : 'border-[#e2e0db] bg-white/70 hover:bg-white hover:border-[#d0cdc4]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left text-[#0a1628] focus:outline-none"
              >
                <span className="font-serif text-sm sm:text-base font-bold leading-snug">
                  {faq.q}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                    isOpen
                      ? 'bg-[#0a1628] text-white rotate-180'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ChevronDown size={16} />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-black/5 px-4 sm:px-5 pb-5 pt-3 text-xs sm:text-sm leading-relaxed font-sans text-slate-600">
                      <p>{faq.a}</p>

                      {faq.showDirections && (
                        <div className="mt-3.5 pt-2">
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a1628] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#152a4a] transition"
                          >
                            <Navigation size={13} /> {isKn ? 'ದಿಕ್ಕುಗಳನ್ನು ಪಡೆಯಿರಿ' : 'Get Directions on Map'}
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Card */}
      <div className="mt-12 rounded-2xl sm:rounded-3xl border border-[#e2e0db] bg-gradient-to-br from-[#f4f1ea] to-[#ece8df] p-6 sm:p-8 text-center shadow-xs">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0a1628]">
          {isKn ? 'ಇನ್ನೂ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?' : 'Still have questions?'}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          {isKn
            ? 'ನಮ್ಮನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ತರಬೇತಿ ವಿವರಗಳು ಹಾಗೂ ಲಭ್ಯತೆ ಕುರಿತು ತಕ್ಷಣ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.'
            : 'Feel free to contact our team directly for course details, scheduling, or any custom requirements.'}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <a
            href={phoneUrl(settings.phone)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0a1628] px-5 py-2.5 text-xs sm:text-sm font-bold font-sans text-white shadow-sm hover:bg-[#12243e] active:scale-[0.98] transition"
          >
            <Phone size={14} className="text-[#c1272d]" /> {isKn ? 'ಈಗ ಕರೆ ಮಾಡಿ' : 'Call Now'}
          </a>

          <a
            href={whatsappUrl(settings.whatsapp, enquiryMessage)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-5 py-2.5 text-xs sm:text-sm font-bold font-sans text-white shadow-sm hover:bg-[#20ba5a] active:scale-[0.98] transition"
          >
            <MessageCircle size={15} /> {isKn ? 'ವಾಟ್ಸಾಪ್' : 'WhatsApp'}
          </a>

          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#c1272d] px-5 py-2.5 text-xs sm:text-sm font-bold font-sans text-white shadow-sm hover:bg-[#a51f25] active:scale-[0.98] transition"
          >
            <Send size={13} /> {isKn ? 'ಈಗಲೇ ವಿಚಾರಿಸಿ' : 'Enquire Now'}
          </a>
        </div>
      </div>
      </div>
    </ScrollRevealSection>
  );
}
