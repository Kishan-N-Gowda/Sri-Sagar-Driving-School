/**
 * Static Asset Index for Sri Sagar Motor Driving School
 * 
 * Consistent ESM import pattern for all non-public static image assets,
 * ensuring correct processing, hash generation, and asset bundling by Vite
 * for both HTML <img> elements and CSS inline/background styles.
 */

import realSchoolHero from './real-school-hero.webp';
import realSchoolHeroWebp from './real-school-hero.webp';
import realSchoolHeroJpg from './real-school-hero.jpg';
import realSchoolHeroPng from './real-school-hero.png';
import ownerPhoto from './owner.webp';
import heroSchool from './real-school-hero.webp';
import heroSchoolWebp from './real-school-hero.webp';
import heroSchoolFocused from './real-school-hero.jpg';
import twoWheelerAcademy from './sri-sagar-motor-driving-school-sanjay-nagar-bangalore-motor-training-schools-for-two-wheeler-NqMWCOr0zf.avif';
import twoWheelerWebp from './sri-sagar-motor-driving-school-two-wheeler.webp';
import twoWheelerJpg from './sri-sagar-motor-driving-school-two-wheeler.jpg';
import schoolFacility from './sri-sagar-driving-school-sanjay-nagar-bangalore-motor-training-schools-r1kvfz4wp4.avif';
import branchWebp from './sri-sagar-driving-school-branch.webp';
import branchJpg from './sri-sagar-driving-school-branch.jpg';
import mainFleet from './unnamed.webp';
import studentSuccess from './unnamed-3.webp';
import trainingCar from './unnamed-2.webp';
import practicalSession from './unnamed-5.webp';
import studentDl from './unnamed-8.webp';
import motorTwoWheeler from './sri-sagar-motor-driving-school-sanjay-nagar-bangalore-motor-training-schools-for-two-wheeler-23rAhGk1hL-250.jpg';
import onroadGuidance from './unnamed-1.webp';

export {
  realSchoolHero,
  realSchoolHeroWebp,
  realSchoolHeroJpg,
  realSchoolHeroPng,
  ownerPhoto,
  heroSchool,
  heroSchoolWebp,
  heroSchoolFocused,
  twoWheelerAcademy,
  twoWheelerWebp,
  twoWheelerJpg,
  schoolFacility,
  branchWebp,
  branchJpg,
  mainFleet,
  studentSuccess,
  trainingCar,
  practicalSession,
  studentDl,
  motorTwoWheeler,
  onroadGuidance,
};

/**
 * Registry mapping public asset paths and aliases to Vite-bundled asset URLs.
 */
export const staticImageRegistry: Record<string, string> = {
  // Full root-relative paths
  '/images/real-school-hero.webp': realSchoolHeroWebp,
  '/images/real-school-hero.jpg': realSchoolHeroJpg,
  '/images/real-school-hero.png': realSchoolHeroPng,
  '/images/owner.webp': ownerPhoto,
  '/images/hero-school.png': realSchoolHeroPng,
  '/images/hero-school.webp': realSchoolHeroWebp,
  '/images/hero-school.jpg': realSchoolHeroJpg,
  '/images/hero-school-focused.jpg': realSchoolHeroJpg,
  '/images/sri-sagar-motor-driving-school-two-wheeler.webp': twoWheelerWebp,
  '/images/sri-sagar-motor-driving-school-two-wheeler.jpg': twoWheelerJpg,
  '/images/sri-sagar-motor-driving-school-sanjay-nagar-bangalore-motor-training-schools-for-two-wheeler-NqMWCOr0zf.avif': twoWheelerWebp,
  '/images/sri-sagar-driving-school-branch.webp': branchWebp,
  '/images/sri-sagar-driving-school-branch.jpg': branchJpg,
  '/images/sri-sagar-driving-school-sanjay-nagar-bangalore-motor-training-schools-r1kvfz4wp4.avif': branchWebp,
  '/images/unnamed.webp': mainFleet,
  '/images/unnamed-1.webp': onroadGuidance,
  '/images/unnamed (1).webp': onroadGuidance,
  '/images/unnamed-2.webp': trainingCar,
  '/images/unnamed (2).webp': trainingCar,
  '/images/unnamed-3.webp': studentSuccess,
  '/images/unnamed (3).webp': studentSuccess,
  '/images/unnamed-5.webp': practicalSession,
  '/images/unnamed (5).webp': practicalSession,
  '/images/unnamed-8.webp': studentDl,
  '/images/unnamed (8).webp': studentDl,
  '/images/sri-sagar-motor-driving-school-sanjay-nagar-bangalore-motor-training-schools-for-two-wheeler-23rAhGk1hL-250.jpg': motorTwoWheeler,

  // Filename-only aliases
  'real-school-hero.webp': realSchoolHeroWebp,
  'real-school-hero.jpg': realSchoolHeroJpg,
  'real-school-hero.png': realSchoolHeroPng,
  'owner.webp': ownerPhoto,
  'hero-school.png': realSchoolHeroPng,
  'hero-school.webp': realSchoolHeroWebp,
  'hero-school.jpg': realSchoolHeroJpg,
  'hero-school-focused.jpg': realSchoolHeroJpg,
  'sri-sagar-motor-driving-school-two-wheeler.webp': twoWheelerWebp,
  'sri-sagar-motor-driving-school-two-wheeler.jpg': twoWheelerJpg,
  'sri-sagar-motor-driving-school-sanjay-nagar-bangalore-motor-training-schools-for-two-wheeler-NqMWCOr0zf.avif': twoWheelerWebp,
  'sri-sagar-driving-school-branch.webp': branchWebp,
  'sri-sagar-driving-school-branch.jpg': branchJpg,
  'sri-sagar-driving-school-sanjay-nagar-bangalore-motor-training-schools-r1kvfz4wp4.avif': branchWebp,
  'unnamed.webp': mainFleet,
  'unnamed-1.webp': onroadGuidance,
  'unnamed (1).webp': onroadGuidance,
  'unnamed-2.webp': trainingCar,
  'unnamed (2).webp': trainingCar,
  'unnamed-3.webp': studentSuccess,
  'unnamed (3).webp': studentSuccess,
  'unnamed-5.webp': practicalSession,
  'unnamed (5).webp': practicalSession,
  'unnamed-8.webp': studentDl,
  'unnamed (8).webp': studentDl,
  'sri-sagar-motor-driving-school-sanjay-nagar-bangalore-motor-training-schools-for-two-wheeler-23rAhGk1hL-250.jpg': motorTwoWheeler,
};

/**
 * Helper to generate CSS url(...) values from imported static assets or image paths
 * for inline styles (e.g. style={{ backgroundImage: cssBgUrl(realSchoolHero) }})
 */
export function cssBgUrl(imageSource: string): string {
  if (!imageSource) return 'none';
  const resolved = staticImageRegistry[imageSource] || imageSource;
  return `url("${resolved}")`;
}

/**
 * Helper to produce full React CSSProperties for background image styling
 */
export function bgImageStyle(imageSource: string, additionalStyles?: React.CSSProperties): React.CSSProperties {
  return {
    backgroundImage: cssBgUrl(imageSource),
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    ...additionalStyles,
  };
}
