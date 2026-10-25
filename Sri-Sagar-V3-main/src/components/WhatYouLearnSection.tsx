import React from 'react';
import ScrollRevealSection from '@/components/ScrollRevealSection';
import {
  CheckCircle2,
  Compass,
  Eye,
  Gauge,
  Layers,
  Move,
  Navigation2,
  ParkingCircle,
  RotateCcw,
  Shield,
  Sliders,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function WhatYouLearnSection() {
  const { language } = useLanguage();
  const isKn = language === 'kn';

  const topics = [
    {
      icon: Sliders,
      title: isKn ? 'ವಾಹನ ನಿಯಂತ್ರಣಗಳು' : 'Vehicle Controls',
      desc: isKn
        ? 'ಸ್ಟೀರಿಂಗ್, ಪೆಡಲ್‌ಗಳು, ಇಂಡಿಕೇಟರ್‌ಗಳು, ವೈಪರ್‌ಗಳು ಮತ್ತು ಕನ್ನಡಿಗಳ ಸಂಪೂರ್ಣ ಕಾರ್ಯಕ್ಷಮತೆ ತಿಳಿಯಿರಿ.'
        : 'Master steering positioning, pedals, indicators, dashboard lights, and mirror setups.',
    },
    {
      icon: Gauge,
      title: isKn ? 'ಪ್ರಾರಂಭ ಮತ್ತು ನಿಲುಗಡೆ' : 'Starting & Stopping',
      desc: isKn
        ? 'ವಾಹನವನ್ನು ಸರಾಗವಾಗಿ ಸ್ಟಾರ್ಟ್ ಮಾಡುವುದು ಮತ್ತು ಜರ್ಕ್ ಇಲ್ಲದೆ ಮೃದುವಾಗಿ ನಿಲ್ಲಿಸುವ ಕೌಶಲ್ಯ.'
        : 'Smooth ignition, gradual throttle control, and smooth jerk-free braking techniques.',
    },
    {
      icon: Move,
      title: isKn ? 'ಸ್ಟೀರಿಂಗ್ ನಿಯಂತ್ರಣ' : 'Steering Control',
      desc: isKn
        ? 'ಸರಿಯಾದ ಕೈ ಹಿಡಿತ, ತಿರುವುಗಳಲ್ಲಿ ನಿಖರ ನಿಯಂತ್ರಣ ಮತ್ತು ನೇರ ಲೇನ್ ಶಿಸ್ತು.'
        : 'Correct hand positioning, turn-radius judgment, cornering, and lane centering.',
    },
    {
      icon: Layers,
      title: isKn ? 'ಗೇರ್ ಮತ್ತು ಕ್ಲಚ್ ನಿಯಂತ್ರಣ' : 'Gear & Clutch Control',
      desc: isKn
        ? 'ಕ್ಲಚ್ ಬೈಟಿಂಗ್ ಪಾಯಿಂಟ್ ನಿಯಂತ್ರಣ, ಗೇರ್ ಬದಲಾವಣೆ ಮತ್ತು ಇಳಿಜಾರು/ಏರುಮುಖಗಳಲ್ಲಿ ನಿಯಂತ್ರಣ.'
        : 'Clutch friction point mastery, seamless gear shifts, and stall-free hill-starts.',
    },
    {
      icon: Zap,
      title: isKn ? 'ಬ್ರೇಕಿಂಗ್ ಮತ್ತು ವೇಗವರ್ಧನೆ' : 'Braking & Acceleration',
      desc: isKn
        ? 'ಪ್ರಗತಿಪರ ಬ್ರೇಕಿಂಗ್, ತುರ್ತು ನಿಲುಗಡೆ ಮತ್ತು ವೇಗವನ್ನು ಸರಿಯಾಗಿ ನಿಯಂತ್ರಿಸುವ ವಿಧಾನ.'
        : 'Progressive deceleration, controlled emergency braking, and safe speed moderation.',
    },
    {
      icon: ParkingCircle,
      title: isKn ? 'ಪಾರ್ಕಿಂಗ್ ಕೌಶಲ್ಯಗಳು' : 'Parking',
      desc: isKn
        ? 'ಪ್ಯಾರಲಲ್, ಪರ್ಪೆಂಡಿಕ್ಯುಲರ್ ಮತ್ತು ಸಣ್ಣ ಜಾಗಗಳಲ್ಲಿ ನಿಖರ ಪಾರ್ಕಿಂಗ್ ಅಭ್ಯಾಸ.'
        : 'Parallel, perpendicular, angular, and garage parking between tight obstacles.',
    },
    {
      icon: RotateCcw,
      title: isKn ? 'ರಿವರ್ಸಿಂಗ್ (ಹಿಮ್ಮುಖ ಚಲನೆ)' : 'Reversing',
      desc: isKn
        ? 'ಹಿಂಬದಿಯ ಕನ್ನಡಿಗಳನ್ನು ಬಳಸಿ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಹಿಮ್ಮುಖವಾಗಿ ಚಲಾಯಿಸುವ ಕಲೆ.'
        : 'Confident reverse navigation, mirror tracking, and tight space maneuvering.',
    },
    {
      icon: Navigation2,
      title: isKn ? 'ರಸ್ತೆಯ ಸ್ಥಾನ ಮತ್ತು ಲೇನ್ ಶಿಸ್ತು' : 'Road Positioning',
      desc: isKn
        ? 'ಸರಿಯಾದ ಲೇನ್ ಆಯ್ಕೆ, ಸುರಕ್ಷಿತ ಅಂತರ ಕಾಪಾಡುವುದು ಮತ್ತು ಜಂಕ್ಷನ್ ಪ್ರವೇಶ.'
        : 'Maintaining lane centering, safe following distance, and safe junction entry.',
    },
    {
      icon: Eye,
      title: isKn ? 'ಟ್ರಾಫಿಕ್ ಜಾಗೃತಿ' : 'Traffic Awareness',
      desc: isKn
        ? 'ಪಾದಚಾರಿಗಳು, ದ್ವಿಚಕ್ರ ಸವಾರರು ಮತ್ತು ಬೆಂಗಳೂರು ನಗರದ ದಟ್ಟಣೆಯನ್ನು ಗಮನಿಸುವ ಚುರುಕುತನ.'
        : 'Anticipating pedestrian movement, two-wheeler behavior, and busy traffic flow.',
    },
    {
      icon: Compass,
      title: isKn ? 'ನಗರ ರಸ್ತೆಗಳ ಅಭ್ಯಾಸ' : 'City Road Practice',
      desc: isKn
        ? 'ಫ್ಲೈಓವರ್‌ಗಳು, ಯು-ಟರ್ನ್‌ಗಳು, ಸಿಗ್ನಲ್‌ಗಳು ಮತ್ತು ಮುಖ್ಯ ರಸ್ತೆಗಳಲ್ಲಿ ನೈಜ ತರಬೇತಿ.'
        : 'Navigating main roads, flyovers, busy U-turns, roundabouts, and traffic signals.',
    },
    {
      icon: Shield,
      title: isKn ? 'ಸುರಕ್ಷಿತ ಮತ್ತು ರಕ್ಷಣಾತ್ಮಕ ಡ್ರೈವಿಂಗ್' : 'Safe & Defensive Driving',
      desc: isKn
        ? 'ಅಪಾಯಗಳನ್ನು ಮುಂಚಿತವಾಗಿ ಊಹಿಸುವುದು, ಬ್ಲೈಂಡ್ ಸ್ಪಾಟ್ ತಪಾಸಣೆ ಮತ್ತು ಸುರಕ್ಷತಾ ನಿಯಮಗಳು.'
        : 'Hazard perception, blind spot awareness, night driving safety, and weather caution.',
    },
    {
      icon: CheckCircle2,
      title: isKn ? 'ಸ್ಟೀರಿಂಗ್ ಮೇಲೆ ಪೂರ್ಣ ಆತ್ಮವಿಶ್ವಾಸ' : 'Confidence Behind the Wheel',
      desc: isKn
        ? 'ಭಯವನ್ನು ಹೋಗಲಾಡಿಸಿ ಸ್ವತಂತ್ರವಾಗಿ ಮತ್ತು ಶಾಂತವಾಗಿ ವಾಹನ ಚಲಾಯಿಸುವ ಸಾಮರ್ಥ್ಯ.'
        : 'Overcoming road nervousness to become an independent, calm, and skilled driver.',
    },
  ];

  return (
    <ScrollRevealSection
      id="learn"
      className="w-full bg-[#0a1628] px-4 sm:px-8 lg:px-12 xl:px-16 py-20 sm:py-28 text-white"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold font-sans uppercase tracking-[0.3em] text-[#c1272d]">
              {isKn ? 'ಪ್ರಾಯೋಗಿಕ ಕೌಶಲ್ಯಗಳು' : 'Comprehensive Curriculum'}
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              {isKn ? 'ನೀವು ಏನನ್ನು ಕಲಿಯುವಿರಿ' : "What You'll Learn"}
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base font-sans text-white/60">
            {isKn
              ? 'ವಾಹನದ ಮೂಲಭೂತ ನಿಯಂತ್ರಣಗಳಿಂದ ಹಿಡಿದು ಬೆಂಗಳೂರು ನಗರದ ದಟ್ಟಣೆಯಲ್ಲಿ ಸುರಕ್ಷಿತ ಚಾಲನೆಯವರೆಗೆ ಪ್ರಾಯೋಗಿಕ ಕೌಶಲ್ಯಗಳು.'
              : 'From essential vehicle controls to defensive city driving, each lesson is designed for real-world mastery.'}
          </p>
        </div>

        {/* 12 Practical Topics Responsive Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {topics.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08] hover:border-white/20"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white group-hover:bg-[#c1272d] transition-colors duration-300">
                      <Icon size={18} />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-white/30">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-4 font-serif text-base sm:text-lg font-bold text-white leading-snug">
                    {topic.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/65 font-sans">
                    {topic.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollRevealSection>
  );
}
