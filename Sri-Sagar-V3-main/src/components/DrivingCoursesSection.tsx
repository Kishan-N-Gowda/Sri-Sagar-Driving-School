import React from 'react';
import ScrollRevealSection from '@/components/ScrollRevealSection';
import {
  Bike,
  BookCheck,
  CarFront,
  ChevronRight,
  GraduationCap,
  RefreshCw,
  Truck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function DrivingCoursesSection() {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const courses = [
    {
      icon: Bike,
      title: isKn ? 'ದ್ವಿಚಕ್ರ ವಾಹನ ತರಬೇತಿ' : 'Two-Wheeler Training',
      tag: isKn ? 'ಗೇರ್ ಮತ್ತು ಗೇರ್‌ರಹಿತ' : 'Gear & Non-Gear',
      desc: isKn
        ? 'ಮೋಟಾರ್‌ಸೈಕಲ್ ಮತ್ತು ಸ್ಕೂಟರ್ ಪ್ರಾಯೋಗಿಕ ತರಬೇತಿ: ವಾಹನ ನಿಯಂತ್ರಣ, ಬ್ರೇಕಿಂಗ್, ಬ್ಯಾಲೆನ್ಸಿಂಗ್, ತಿರುವುಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ನಗರ ಚಾಲನೆ.'
        : 'Practical motorcycle and scooter training covering vehicle control, braking, turning, balance, traffic awareness, and safe road riding.',
      courseKey: 'Two-Wheeler Driving Classes',
    },
    {
      icon: CarFront,
      title: isKn ? 'ಕಾರು ಡ್ರೈವಿಂಗ್ ತರಬೇತಿ' : 'Car Driving Training',
      tag: isKn ? 'ನಾಲ್ಕು ಚಕ್ರಗಳ ವಾಹನ' : 'Four-Wheeler',
      desc: isKn
        ? 'ಕಾರು ಚಾಲನೆಯ ಸಮಗ್ರ ಪ್ರಾಯೋಗಿಕ ತರಬೇತಿ: ಸ್ಟೀರಿಂಗ್, ಬ್ರೇಕಿಂಗ್, ಗೇರ್/ಕ್ಲಚ್ ನಿಯಂತ್ರಣ, ಪಾರ್ಕಿಂಗ್, ರಿವರ್ಸಿಂಗ್ ಮತ್ತು ರಸ್ತೆ ಚಾಲನೆ.'
        : 'Practical car training covering vehicle controls, steering, braking, gear/clutch control where applicable, parking, reversing, and road driving.',
      courseKey: 'Car Driving Classes (Four-Wheeler)',
    },
    {
      icon: Truck,
      title: isKn ? 'ಹೆವಿ ವೆಹಿಕಲ್ ತರಬೇತಿ' : 'Heavy Vehicle Training',
      tag: isKn ? 'ವಾಣಿಜ್ಯ & ಹೆವಿ ವಾಹನ' : 'Commercial & Heavy',
      desc: isKn
        ? 'ಹೆವಿ ವಾಹನಗಳ ನಿರ್ವಹಣೆ, ರಸ್ತೆ ಜಾಗೃತಿ, ಸುರಕ್ಷಿತ ತಿರುವುಗಳು ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ನಿಯಂತ್ರಣದ ಮೇಲಿನ ವಿಶೇಷ ತರಬೇತಿ.'
        : 'Training for heavy vehicles with focus on vehicle handling, road awareness, safety, and practical control.',
      courseKey: 'Heavy Vehicle Training',
    },
    {
      icon: GraduationCap,
      title: isKn ? 'ಆರಂಭಿಕರಿಗಾಗಿ ಮೂಲಭೂತ ತರಬೇತಿ' : 'Beginner Training',
      tag: isKn ? 'ಹಂತ ಹಂತದ ಕಲಿಕೆ' : 'Zero Experience',
      desc: isKn
        ? 'ಹೊಸದಾಗಿ ಕಲಿಯುವವರಿಗಾಗಿ ಮೂಲಭೂತ ಹಂತಗಳಿಂದ ಆರಂಭಿಸಿ ಹಂತ-ಹಂತದ ತರಬೇತಿಯ ಮೂಲಕ ಸಂಪೂರ್ಣ ಆತ್ಮವಿಶ್ವಾಸ ಬೆಳೆಸುವ ಕೋರ್ಸ್.'
        : 'For learners starting from the basics and building confidence through structured practical training.',
      courseKey: 'Motor Training (Beginner)',
    },
    {
      icon: RefreshCw,
      title: isKn ? 'ರಿಫ್ರೆಶರ್ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿ' : 'Refresher Training',
      tag: isKn ? 'ಕೌಶಲ್ಯ ಸುಧಾರಣೆ' : 'Skill Polish',
      desc: isKn
        ? 'ಈಗಾಗಲೇ ಡ್ರೈವಿಂಗ್ ತಿಳಿದಿರುವವರಿಗೆ ನಗರದ ದಟ್ಟಣೆ, ಪಾರ್ಕಿಂಗ್, ರಿವರ್ಸಿಂಗ್ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಮರುಪಡೆಯಲು ಸೂಕ್ತ ತರಬೇತಿ.'
        : 'For existing drivers who want to improve confidence, vehicle control, parking, traffic handling, or specific driving skills.',
      courseKey: 'Refresher / Practice Driving Course',
    },
    {
      icon: BookCheck,
      title: isKn ? 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ಮತ್ತು RTO ಮಾರ್ಗದರ್ಶನ' : 'Driving Licence & RTO Assistance',
      tag: isKn ? 'ದಾಖಲಾತಿ ಮಾರ್ಗದರ್ಶನ' : 'Guidance & Docs',
      desc: isKn
        ? 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್, ಎಲ್‌ಎಲ್‌ಆರ್ ಮತ್ತು ಆರ್‌ಟಿಒ ಸಂಬಂಧಿತ ಕಾರ್ಯವಿಧಾನಗಳು ಹಾಗೂ ದಾಖಲೆಗಳ ಕುರಿತು ಅಧಿಕೃತ ನಿಯಮಾನುಸಾರ ಸೂಕ್ತ ಮಾರ್ಗದರ್ಶನ.'
        : 'Guidance related to the driving licence and RTO process, documentation, and related procedures, without making guarantees about government approval or licence issuance.',
      courseKey: 'RTO & Licence Assistance',
    },
  ];

  return (
    <ScrollRevealSection
      id="courses"
      className="w-full bg-[#0a1628] px-4 sm:px-8 lg:px-12 xl:px-16 py-20 sm:py-28 text-white"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold font-sans uppercase tracking-[0.3em] text-[#c1272d]">
              {isKn ? 'ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮಗಳು' : 'Courses & Training'}
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {isKn ? 'ಡ್ರೈವಿಂಗ್ ಕೋರ್ಸ್‌ಗಳು ಮತ್ತು ಆಯ್ಕೆಗಳು' : 'Driving Courses & Training Options'}
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base font-sans text-white/60">
            {isKn
              ? 'ಪ್ರತಿಯೊಬ್ಬ ಕಲಿಯುವವರ ಅನುಕೂಲಕ್ಕೆ ತಕ್ಕಂತೆ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಪ್ರಾಯೋಗಿಕ ಮತ್ತು ಸುರಕ್ಷಿತ ಮೋಟಾರ್ ತರಬೇತಿ ಆಯ್ಕೆಗಳು.'
              : 'Structured driving courses designed around practical skill, dual-control safety, and individual learner comfort.'}
          </p>
        </div>

        {/* 6 Courses Grid */}
        <div className="mt-12 sm:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const Icon = c.icon;
            return (
              <article
                key={c.courseKey}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08] hover:border-white/20"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white group-hover:bg-[#c1272d] transition duration-300">
                      <Icon size={22} />
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">
                      {c.tag}
                    </span>
                  </div>

                  <h3 className="mt-5 font-serif text-lg sm:text-xl font-bold text-white leading-snug">
                    {c.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed font-sans text-white/65">
                    {c.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold font-sans text-[#f0c0c0] group-hover:text-white transition"
                  >
                    <span>{isKn ? 'ಈ ಕೋರ್ಸ್‌ಗೆ ವಿಚಾರಿಸಿ' : 'Enquire for this course'}</span>
                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </ScrollRevealSection>
  );
}
