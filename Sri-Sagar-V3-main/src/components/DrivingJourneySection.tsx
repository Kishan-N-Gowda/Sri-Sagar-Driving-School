import React from 'react';
import ScrollRevealSection from '@/components/ScrollRevealSection';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Compass,
  FileCheck,
  Users,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function DrivingJourneySection() {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const steps = [
    {
      number: '01',
      icon: BookOpen,
      title: isKn ? 'ನಿಮ್ಮ ಕೋರ್ಸ್ ಆಯ್ಕೆಮಾಡಿ' : 'Choose Your Course',
      desc: isKn
        ? 'ನಿಮ್ಮ ಅಗತ್ಯಕ್ಕೆ ಸರಿಹೊಂದುವ ದ್ವಿಚಕ್ರ, ಕಾರು ಅಥವಾ ಮೋಟಾರ್ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿ ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
        : 'Choose the driving or vehicle training service that suits your requirement.',
    },
    {
      number: '02',
      icon: Users,
      title: isKn ? 'ತರಬೇತುದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Choose Your Instructor',
      desc: isKn
        ? 'ಲಭ್ಯತೆಗೆ ಒಳಪಟ್ಟು ಮತ್ತು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಆಧಾರದ ಮೇಲೆ ಪುರುಷ ಮತ್ತು ಮಹಿಳಾ ತರಬೇತುದಾರರು ಲಭ್ಯವಿರುತ್ತಾರೆ.'
        : 'Male and female instructors are available, subject to instructor availability and your preferred option.',
    },
    {
      number: '03',
      icon: CalendarCheck,
      title: isKn ? 'ತರಬೇತಿ ಸಮಯ ನಿಗದಿಪಡಿಸಿ' : 'Schedule Your Training',
      desc: isKn
        ? 'ವಿಚಾರಣಾ ಪ್ರಕ್ರಿಯೆಯ ಮೂಲಕ ನಿಮಗೆ ಅನುಕೂಲಕರವಾದ ದಿನ ಮತ್ತು ಸಮಯದ ತರಬೇತಿ ಬ್ಯಾಚ್ ಅನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
        : 'Choose a convenient training date and time through the enquiry process.',
    },
    {
      number: '04',
      icon: Compass,
      title: isKn ? 'ಪ್ರಾಯೋಗಿಕ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿ' : 'Practical Driving Training',
      desc: isKn
        ? 'ವಾಹನ ನಿಯಂತ್ರಣ, ರಸ್ತೆ ಜಾಗೃತಿ, ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಸುರಕ್ಷತೆಯೊಂದಿಗೆ ರಚನಾತ್ಮಕ ಪ್ರಾಯೋಗಿಕ ತರಬೇತಿ ಪಡೆಯಿರಿ.'
        : 'Learn through structured practical training with a focus on vehicle control, road awareness, confidence, and safety.',
    },
    {
      number: '05',
      icon: FileCheck,
      title: isKn ? 'ಲೈಸೆನ್ಸ್ ಮತ್ತು RTO ಮಾರ್ಗದರ್ಶನ' : 'Licence & RTO Guidance',
      desc: isKn
        ? 'ಅನ್ವಯವಾಗುವಂತೆ ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ಮತ್ತು RTO ಪ್ರಕ್ರಿಯೆಗಳಿಗೆ ಸೂಕ್ತ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ದಾಖಲಾತಿ ನೆರವು ಪಡೆಯಿರಿ.'
        : 'Get guidance for driving licence and RTO-related procedures where applicable.',
    },
  ];

  return (
    <ScrollRevealSection
      id="journey"
      className="w-full bg-[#faf8f4] py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12 xl:px-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-bold font-sans uppercase tracking-[0.3em] text-[#c1272d]">
          {isKn ? 'ಹಂತ-ಹಂತದ ವಿಧಾನ' : 'Step-By-Step Process'}
        </span>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a1628]">
          {isKn ? 'ನಿಮ್ಮ ಡ್ರೈವಿಂಗ್ ಕಲಿಕೆಯ ಹಾದಿ' : 'How Your Driving Journey Works'}
        </h2>
        <p className="mt-3 text-sm sm:text-base font-sans text-slate-600">
          {isKn
            ? 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್‌ನಲ್ಲಿ ನೋಂದಣಿಯಿಂದ ರಸ್ತೆಯಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ವಾಹನ ಚಲಾಯಿಸುವವರೆಗಿನ 5 ಸರಳ ಹಂತಗಳು.'
            : 'A transparent, structured 5-step training process designed to build confidence, practical skill, and road safety.'}
        </p>
      </div>

      {/* 5 Steps Grid with visual connection */}
      <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative flex flex-col justify-between rounded-2xl border border-[#e2e0db] bg-white p-6 shadow-xs hover:shadow-md hover:border-[#0a1628]/20 transition-all duration-300 group"
            >
              <div>
                {/* Step number badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a1628] text-white font-mono text-xs font-bold shadow-xs group-hover:bg-[#c1272d] transition-colors">
                    {step.number}
                  </span>
                  <span className="text-slate-400 group-hover:text-[#0a1628] transition-colors">
                    <Icon size={20} />
                  </span>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0a1628] leading-snug">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div className="mt-12 text-center">
        <a
          href="#contact"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c1272d] px-8 py-3.5 text-xs sm:text-sm font-bold font-sans text-white shadow-lg shadow-red-900/15 hover:bg-[#a51f25] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition duration-200"
        >
          <span>{isKn ? 'ನಿಮ್ಮ ತರಬೇತಿಯನ್ನು ಪ್ರಾರಂಭಿಸಿ' : 'Start Your Training'}</span>
          <ArrowRight size={16} />
        </a>
      </div>
      </div>
    </ScrollRevealSection>
  );
}
