export type Language = 'en' | 'kn';

export interface Translations {
  // Common & UI
  language: string;
  selectLanguage: string;
  english: string;
  kannada: string;
  taglineSchool: string;
  schoolName: string;
  drivingSchool: string;
  openNowBadge: string;
  closedNowBadge: string;

  // Nav
  navHome: string;
  navAbout: string;
  navCourses: string;
  navWhyUs: string;
  navJourney: string;
  navLearn: string;
  navFaq: string;
  navGallery: string;
  navReviews: string;
  navLocation: string;
  navContact: string;
  navBookAppointment: string;
  navCheckAppointment: string;
  navAdminLogin: string;
  navOwnerLogin: string;

  // Hero
  heroTagline: string;
  heroTitle1: string;
  heroTitle2: string;
  heroTitle3: string;
  heroSubtitle: string;
  heroBookBtn: string;
  heroCheckStatusBtn: string;
  heroWhatsappBtn: string;
  heroCallNowBtn: string;
  heroDirectionsBtn: string;
  heroReviewsLabel: string;
  heroYearsExp: string;
  heroEstablished: string;
  heroLocationBadge: string;
  heroInstructorsBadge: string;

  // About
  aboutEyebrow: string;
  aboutTitle1: string;
  aboutTitle2: string;
  aboutSubtitle: string;
  aboutYearsExp: string;
  aboutYearsExpLabel: string;
  aboutBullet1: string;
  aboutBullet2: string;
  aboutBullet3: string;
  aboutBullet4: string;
  aboutBullet5: string;
  aboutBullet6: string;
  aboutExploreBtn: string;

  // Courses / Services
  coursesEyebrow: string;
  coursesTitle: string;
  coursesSubtitle: string;
  trainingCategoriesTitle: string;
  trainingCategoriesSubtitle: string;
  catTwoWheelerTitle: string;
  catTwoWheelerDesc: string;
  catFourWheelerTitle: string;
  catFourWheelerDesc: string;
  catMenTitle: string;
  catMenDesc: string;
  catWomenTitle: string;
  catWomenDesc: string;
  course1Title: string;
  course1Desc: string;
  course2Title: string;
  course2Desc: string;
  course3Title: string;
  course3Desc: string;
  course4Title: string;
  course4Desc: string;
  course5Title: string;
  course5Desc: string;
  course6Title: string;
  course6Desc: string;
  course7Title: string;
  course7Desc: string;
  course8Title: string;
  course8Desc: string;
  courseBookBtn: string;

  // Course Names mapping for selects
  courseNames: Record<string, string>;

  // Why Choose Us
  whyUsEyebrow: string;
  whyUsTitle1: string;
  whyUsTitle2: string;
  whyUsSubtitle: string;
  benefit1Title: string;
  benefit1Text: string;
  benefit2Title: string;
  benefit2Text: string;
  benefit3Title: string;
  benefit3Text: string;
  benefit4Title: string;
  benefit4Text: string;
  benefit5Title: string;
  benefit5Text: string;
  benefit6Title: string;
  benefit6Text: string;
  benefit7Title: string;
  benefit7Text: string;

  // Gallery
  galleryEyebrow: string;
  galleryTitle: string;
  gallerySubtitle: string;
  galleryEmpty: string;
  galleryViewAll: string;
  galleryViewMore: string;
  galleryLoadingMore: string;
  galleryAllLoaded: string;
  galleryLoadError: string;
  galleryRetry: string;
  galleryFullTitle: string;
  galleryAllPhotos: string;
  galleryClose: string;
  galleryBackHome: string;

  // Reviews
  reviewsEyebrow: string;
  reviewsTitle1: string;
  reviewsTitle2: string;
  reviewsSubtitle: string;
  reviewsGoogleBtn: string;
  reviewsRatingLabel: string;
  reviewsDefaultHighlight: string;
  reviewsViewMore: string;
  reviewsViewMoreGoogle: string;
  reviewsLoading: string;
  reviewsAllLoaded: string;
  reviewsWriteReview: string;
  reviewsViewOnGoogle: string;
  reviewsError: string;
  reviewsRetry: string;
  reviewsEmpty: string;

  // CTA Banner
  ctaEyebrow: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaCallBtn: string;
  ctaWhatsappBtn: string;
  ctaDirectionsBtn: string;

  // Contact
  contactEyebrow: string;
  contactTitle1: string;
  contactTitle2: string;
  contactSubtitle: string;
  contactPhoneLabel: string;
  contactHoursLabel: string;
  contactHoursDetail: string;
  contactAddressLabel: string;
  contactViewMaps: string;
  contactGetDirections: string;

  // Location
  locationEyebrow: string;
  locationTitle1: string;
  locationTitle2: string;
  locationSubtitle: string;

  // Footer
  footerDesc: string;
  footerNavHeading: string;
  footerCoursesHeading: string;
  footerContactHeading: string;
  footerCopyright: string;
  footerTagline: string;
  footerAdminLogin: string;

  // Mobile Bottom Bar
  mobileCall: string;
  mobileWhatsapp: string;
  mobileBook: string;
  mobileDirections: string;

  // Appointment Form
  formEyebrow: string;
  formTitle: string;
  formSubtitle: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formPhoneLabel: string;
  formPhonePlaceholder: string;
  formEmailLabel: string;
  formEmailPlaceholder: string;
  formCourseLabel: string;
  formCourseSelect: string;
  formDateLabel: string;
  formTimeLabel: string;
  formTimeSelect: string;
  formMessageLabel: string;
  formMessagePlaceholder: string;
  formSubmitBtn: string;
  formBookingLoading: string;
  formErrName: string;
  formErrPhone: string;
  formErrCourse: string;
  formErrDate: string;
  formErrFutureDate: string;
  formErrTime: string;
  formErrServer: string;

  // Booking Success
  successReceivedEyebrow: string;
  successThankYou: string;
  successDesc: string;
  successApptId: string;
  successCourse: string;
  successDate: string;
  successTime: string;
  successStatus: string;
  successPendingText: string;
  successCallBtn: string;
  successWhatsappBtn: string;
  successBookAnother: string;

  // Status Page
  statusBackWeb: string;
  statusSchoolName: string;
  statusPageTitle: string;
  statusPageSubtitle: string;
  statusTabId: string;
  statusTabPhone: string;
  statusInputIdPlaceholder: string;
  statusInputPhonePlaceholder: string;
  statusCheckBtn: string;
  statusLabelPending: string;
  statusDescPending: string;
  statusLabelConfirmed: string;
  statusDescConfirmed: string;
  statusLabelCompleted: string;
  statusDescCompleted: string;
  statusLabelCancelled: string;
  statusDescCancelled: string;
  statusNotFound: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    taglineSchool: 'Sri Sagar',
    schoolName: 'Sri Sagar Driving School',
    drivingSchool: 'Driving School',
    openNowBadge: 'Open now · Closes 7:30 PM',
    closedNowBadge: 'Closed now · Opens 8:30 AM',

    navHome: 'Home',
    navAbout: 'About',
    navCourses: 'Services & Courses',
    navWhyUs: 'Why Choose Us',
    navJourney: 'How It Works',
    navLearn: "What You'll Learn",
    navFaq: 'FAQ',
    navGallery: 'Gallery',
    navReviews: 'Reviews',
    navLocation: 'Location',
    navContact: 'Contact',
    navBookAppointment: 'Enquire Now',
    navCheckAppointment: 'Check appointment',
    navAdminLogin: 'Admin Login',
    navOwnerLogin: 'Owner / Admin Login',

    heroTagline: 'Sri Sagar Driving School · Bhadrappa Layout, Bengaluru',
    heroTitle1: 'Learn to drive with',
    heroTitle2: 'practical skill &',
    heroTitle3: 'safety.',
    heroSubtitle: 'Professional driving training in Bhadrappa Layout, Bengaluru. Operating since 2001 with 25 years in business, providing instruction for both two-wheelers and four-wheelers, and training for both men and women with male & female instructor options.',
    heroBookBtn: 'Enquire Now',
    heroCheckStatusBtn: 'Check Status',
    heroWhatsappBtn: 'WhatsApp',
    heroCallNowBtn: 'Call Now',
    heroDirectionsBtn: 'Get Directions',
    heroReviewsLabel: 'Reviews',
    heroYearsExp: '25 Years Experience',
    heroEstablished: 'Established 2001',
    heroLocationBadge: 'Bhadrappa Layout, Bengaluru',
    heroInstructorsBadge: 'Male & Female Instructors',

    aboutEyebrow: 'About Sri Sagar Driving School',
    aboutTitle1: '25 Years of trusted',
    aboutTitle2: 'driving instruction in Bengaluru.',
    aboutSubtitle: 'Sri Sagar Driving School is an established motor training school providing driving training for learners in Bhadrappa Layout, Bengaluru. Operating since 2001 with 25 years in business, we offer training for both two-wheelers and four-wheelers and provide instruction for both male and female learners.',
    aboutYearsExp: '25',
    aboutYearsExpLabel: 'Years in business (Est. 2001)',
    aboutBullet1: '25 years in business (operating since 2001)',
    aboutBullet2: 'Training for both two-wheelers and four-wheelers',
    aboutBullet3: 'Instruction for both male and female learners',
    aboutBullet4: 'Dual-control vehicles & hands-on practical road training',
    aboutBullet5: 'Patient, polite, and experienced instructors',
    aboutBullet6: 'Complete driving license & RTO consultation',
    aboutExploreBtn: 'View our training services',

    coursesEyebrow: 'Our Services',
    coursesTitle: 'Motor Training & RTO Services',
    coursesSubtitle: 'Specialized driving lessons, license consultancy, and RTO solutions in Bhadrappa Layout, Bengaluru.',
    trainingCategoriesTitle: 'Training Categories',
    trainingCategoriesSubtitle: 'Comprehensive, structured driving instruction for all learners and vehicle types.',
    catTwoWheelerTitle: 'Two Wheeler Training',
    catTwoWheelerDesc: 'Geared motorcycles & non-geared scooters with balance and road discipline.',
    catFourWheelerTitle: 'Four Wheeler / Car Training',
    catFourWheelerDesc: 'Dual-control car lessons covering clutch, steering, parking, and traffic.',
    catMenTitle: 'Training for Men',
    catMenDesc: 'Focused practical driving sessions with patient guidance.',
    catWomenTitle: 'Training for Women',
    catWomenDesc: 'Comfortable, supportive, and beginner-friendly instruction.',
    course1Title: 'Motor Training',
    course1Desc: 'Complete foundation motor training for beginners learning to drive with road discipline, steering control, and traffic safety.',
    course2Title: 'Two Wheeler Driving Classes',
    course2Desc: 'Geared motorcycle and non-geared scooter training covering balance, clutch coordination, safe braking, and city road navigation.',
    course3Title: 'Car Driving Classes',
    course3Desc: 'Hands-on practical car lessons on dual-control vehicles focusing on clutch control, reversing, parallel parking, slope starts, and city traffic.',
    course4Title: 'Heavy Vehicle Driving Classes',
    course4Desc: 'Professional training for commercial and heavy motor vehicles covering vehicle dynamics, road safety regulations, and licensing guidelines.',
    course5Title: 'Driving License Consultation',
    course5Desc: 'Step-by-step guidance and documentation support for Learner’s License (LL), Permanent Driving License (DL), and test trials.',
    course6Title: 'RTO Consultation',
    course6Desc: 'Comprehensive RTO support including vehicle registration assistance, ownership transfers, address updates, and NOCs.',
    course7Title: 'Driving License Consultant Services',
    course7Desc: 'Dedicated consultant services for license renewal, duplicate DL issuance, endorsement additions, and re-test assistance.',
    course8Title: 'International Driving License Assistance',
    course8Desc: 'Hassle-free application assistance and documentation guidance for obtaining International Driving Permits (IDP).',
    courseBookBtn: 'Enquire for this service',

    courseNames: {
      'Motor Training': 'Motor Training',
      'Two-Wheeler Driving Classes': 'Two-Wheeler Driving Classes',
      'Car Driving Classes (Four-Wheeler)': 'Car Driving Classes (Four-Wheeler)',
      'Heavy Vehicle Driving Classes': 'Heavy Vehicle Driving Classes',
      'Driving License Consultation': 'Driving License Consultation',
      'RTO Consultation': 'RTO Consultation',
      'Driving License Consultant Services': 'Driving License Consultant Services',
      'International Driving License Assistance': 'International Driving License Assistance',
      'Motor Training (Beginner Course)': 'Motor Training',
      'Car Driving Classes': 'Car Driving Classes',
      'Refresher Driving Course': 'Refresher Driving Course',
      'Two-Wheeler Training': 'Two Wheeler Training',
      'Four-Wheeler Training': 'Four Wheeler / Car Training',
      'Training for Men': 'Training for Men',
      'Training for Women': 'Training for Women',
      'Other': 'Other Service / Consultation'
    },

    whyUsEyebrow: 'Why Choose Us',
    whyUsTitle1: 'Genuine strengths.',
    whyUsTitle2: 'Trusted local training.',
    whyUsSubtitle: 'Providing disciplined, practical driver education in Bhadrappa Layout with safety, patience, and 25 years of experience at the center.',
    benefit1Title: '25 Years in Business (Est. 2001)',
    benefit1Text: 'A quarter-century of dependable driver training experience serving learners across Bhadrappa Layout and Bengaluru.',
    benefit2Title: 'Practical On-Road Instruction',
    benefit2Text: 'Hands-on training in real city traffic, covering parking, lane changing, slope management, and defensive driving.',
    benefit3Title: 'Training for Men & Women',
    benefit3Text: 'Safe, respectful, and beginner-friendly instruction tailored for both male and female learners.',
    benefit4Title: 'Male & Female Instructors',
    benefit4Text: 'Choose from male or female instructors based on your comfort, personal preference, and availability.',
    benefit5Title: 'Bhadrappa Layout Location',
    benefit5Text: 'Conveniently situated at 1st Floor, Srinika Complex on Bhadrappa Layout Service Road (Near Big Bazaar).',
    benefit6Title: 'Convenient Operating Hours',
    benefit6Text: 'Open 7 days a week from 8:30 AM to 7:30 PM with flexible morning and evening time slots.',
    benefit7Title: 'Complete RTO & License Support',
    benefit7Text: 'Streamlined assistance for Learner’s License (LL), Permanent DL tests, renewals, and International Driving Permits.',

    galleryEyebrow: 'Gallery',
    galleryTitle: 'Training & school photos.',
    gallerySubtitle: 'Real photos from Sri Sagar Driving School in Bhadrappa Layout, Bengaluru.',
    galleryEmpty: 'Gallery photos will appear here soon.',
    galleryViewAll: 'View all photos',
    galleryViewMore: 'View More',
    galleryLoadingMore: 'Loading more photos...',
    galleryAllLoaded: 'Showing all published gallery photos',
    galleryLoadError: 'Unable to load more photos right now.',
    galleryRetry: 'Retry',
    galleryFullTitle: 'Full Gallery',
    galleryAllPhotos: 'All Training & School Photos',
    galleryClose: 'Close',
    galleryBackHome: 'Back to homepage',

    reviewsEyebrow: 'Customer feedback',
    reviewsTitle1: 'What our',
    reviewsTitle2: 'learners say.',
    reviewsSubtitle: 'Real experiences and reviews from learners trained at Sri Sagar Driving School in Bhadrappa Layout, Bengaluru.',
    reviewsGoogleBtn: 'View on Google',
    reviewsRatingLabel: 'Google Reviews',
    reviewsDefaultHighlight: 'Recognized for patient instruction, polite coaches, practical road training, and seamless RTO assistance.',
    reviewsViewMore: 'View More Reviews',
    reviewsViewMoreGoogle: 'View More Reviews on Google',
    reviewsLoading: 'Loading reviews...',
    reviewsAllLoaded: 'All published reviews loaded',
    reviewsWriteReview: 'Write a review on Google',
    reviewsViewOnGoogle: 'View on Google',
    reviewsError: 'Unable to load reviews at this moment.',
    reviewsRetry: 'Try again',
    reviewsEmpty: 'No reviews published at this time.',

    ctaEyebrow: 'Queries',
    ctaTitle: 'Learn to drive with practical skill and safety.',
    ctaSubtitle: 'Have queries about driving lessons, dual-control car training, two-wheeler classes, or RTO licenses? Call, WhatsApp, or enquire with Sri Sagar Driving School today.',
    ctaCallBtn: 'Call +91 90195 04489',
    ctaWhatsappBtn: 'WhatsApp Us',
    ctaDirectionsBtn: 'Get Directions',

    contactEyebrow: 'Queries & Contact',
    contactTitle1: 'Learn to drive with',
    contactTitle2: 'practical skill & safety.',
    contactSubtitle: 'Call, WhatsApp, or submit your query and appointment request below. Our team in Bhadrappa Layout will confirm your schedule promptly.',
    contactPhoneLabel: 'Phone & WhatsApp',
    contactHoursLabel: 'Operating Hours',
    contactHoursDetail: 'Monday – Sunday: 8:30 AM – 7:30 PM',
    contactAddressLabel: 'Verified Address',
    contactViewMaps: 'VIEW ON GOOGLE MAPS',
    contactGetDirections: 'GET DIRECTIONS',

    locationEyebrow: 'Location & Directions',
    locationTitle1: 'Visit Sri Sagar Driving School',
    locationTitle2: 'in Bhadrappa Layout, Bengaluru.',
    locationSubtitle: '1st Floor, Srinika Complex, Bhadrappa Layout Service Rd, Bhadrappa Layout, Koti Hosahalli, Bengaluru, Karnataka 560094.',

    footerDesc: 'Sri Sagar Driving School is an established motor training school providing professional driving training and RTO consultation in Bhadrappa Layout, Bengaluru since 2001.',
    footerNavHeading: 'Navigation',
    footerCoursesHeading: 'Services',
    footerContactHeading: 'Contact Information',
    footerCopyright: '© 2026 Sri Sagar Driving School. All Rights Reserved.',
    footerTagline: 'Motor Training School in Bhadrappa Layout, Bengaluru',
    footerAdminLogin: 'Admin Login',

    mobileCall: 'Call Now',
    mobileWhatsapp: 'WhatsApp',
    mobileBook: 'Enquire',
    mobileDirections: 'Directions',

    formEyebrow: 'Reserve your lesson',
    formTitle: 'Enquire or book an appointment.',
    formSubtitle: 'Choose your preferred course and time slot. The school will get in touch to confirm your schedule.',
    formNameLabel: 'Full name *',
    formNamePlaceholder: 'Your full name',
    formPhoneLabel: 'Phone number *',
    formPhonePlaceholder: '10-digit mobile number',
    formEmailLabel: 'Email (optional)',
    formEmailPlaceholder: 'you@example.com',
    formCourseLabel: 'Service / Course *',
    formCourseSelect: 'Select a course or service',
    formDateLabel: 'Preferred date *',
    formTimeLabel: 'Preferred time *',
    formTimeSelect: 'Select a time slot (8:30 AM – 7:00 PM)',
    formMessageLabel: 'Message / requirements',
    formMessagePlaceholder: 'e.g. beginner training, 2-wheeler classes, RTO license enquiry',
    formSubmitBtn: 'Submit Enquiry',
    formBookingLoading: 'Submitting enquiry...',
    formErrName: 'Please enter your full name.',
    formErrPhone: 'Please enter a valid 10-digit Indian phone number.',
    formErrCourse: 'Please select a course or service.',
    formErrDate: 'Please select a preferred date.',
    formErrFutureDate: 'Please choose today or a future date.',
    formErrTime: 'Please select a preferred time slot.',
    formErrServer: 'We could not submit the enquiry right now. Please call +91 90195 04489 or WhatsApp us directly.',

    successReceivedEyebrow: 'Enquiry received',
    successThankYou: 'Thank you',
    successDesc: 'Your enquiry has been received successfully. Sri Sagar Driving School will contact you shortly on your phone to confirm details.',
    successApptId: 'Enquiry ID',
    successCourse: 'Course / Service',
    successDate: 'Date',
    successTime: 'Time',
    successStatus: 'Status',
    successPendingText: 'Pending confirmation',
    successCallBtn: 'Call school',
    successWhatsappBtn: 'WhatsApp school',
    successBookAnother: 'Submit another enquiry',

    statusBackWeb: 'Back to website',
    statusSchoolName: 'Sri Sagar Driving School',
    statusPageTitle: 'Check Appointment Status',
    statusPageSubtitle: 'Enter your Appointment ID or registered phone number below.',
    statusTabId: 'Appointment ID',
    statusTabPhone: 'Phone Number',
    statusInputIdPlaceholder: 'SSDS-YYYYMMDD-XXX',
    statusInputPhonePlaceholder: 'Enter your phone number',
    statusCheckBtn: 'Check status',
    statusLabelPending: 'Pending Confirmation',
    statusDescPending: 'Your appointment request has been received and is pending school confirmation.',
    statusLabelConfirmed: 'Confirmed',
    statusDescConfirmed: 'Your appointment has been confirmed by the school.',
    statusLabelCompleted: 'Completed',
    statusDescCompleted: 'Your appointment has been completed.',
    statusLabelCancelled: 'Cancelled',
    statusDescCancelled: 'Your appointment has been cancelled.',
    statusNotFound: 'No appointment was found. Please check your Appointment ID or phone number and try again.'
  },

  kn: {
    language: 'ಭಾಷೆ',
    selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    taglineSchool: 'ಶ್ರೀ ಸಾಗರ್',
    schoolName: 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್',
    drivingSchool: 'ಡ್ರೈವಿಂಗ್ ಶಾಲೆ',
    openNowBadge: 'ಈಗ ತೆರೆದಿದೆ · 7:30 PM ಮುಕ್ತಾಯ',
    closedNowBadge: 'ಈಗ ಮುಚ್ಚಿದೆ · 8:30 AM ಪ್ರಾರಂಭ',

    navHome: 'ಮುಖಪುಟ',
    navAbout: 'ನಮ್ಮ ಬಗ್ಗೆ',
    navCourses: 'ಸೇವೆಗಳು ಮತ್ತು ಕೋರ್ಸ್‌ಗಳು',
    navWhyUs: 'ನಮ್ಮನ್ನೇಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು',
    navJourney: 'ಕಲಿಕೆಯ ಹಾದಿ',
    navLearn: 'ಏನು ಕಲಿಯುವಿರಿ',
    navFaq: 'ಪ್ರಶ್ನೋತ್ತರ (FAQ)',
    navGallery: 'ಗ್ಯಾಲರಿ',
    navReviews: 'ವಿಮರ್ಶೆಗಳು',
    navLocation: 'ಸ್ಥಳ',
    navContact: 'ಸಂಪರ್ಕಿಸಿ',
    navBookAppointment: 'ವಿಚಾರಿಸಿ',
    navCheckAppointment: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಪರಿಶೀಲಿಸಿ',
    navAdminLogin: 'ನಿರ್ವಾಹಕರ ಲಾಗಿನ್',
    navOwnerLogin: 'ಮಾಲೀಕರು / ನಿರ್ವಾಹಕರ ಲಾಗಿನ್',

    heroTagline: 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ · ಭದ್ರಪ್ಪ ಲೇಔಟ್, ಬೆಂಗಳೂರು',
    heroTitle1: 'ಪ್ರಾಯೋಗಿಕ ಕೌಶಲ್ಯ ಮತ್ತು',
    heroTitle2: 'ಸುರಕ್ಷತೆಯೊಂದಿಗೆ',
    heroTitle3: 'ಚಾಲನೆ ಕಲಿಯಿರಿ.',
    heroSubtitle: 'ಬೆಂಗಳೂರಿನ ಭದ್ರಪ್ಪ ಲೇಔಟ್‌ನಲ್ಲಿ ವೃತ್ತಿಪರ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿ. 2001 ರಿಂದ 25 ವರ್ಷಗಳ ಅನುಭವದೊಂದಿಗೆ ದ್ವಿಚಕ್ರ ವಾಹನ ಮತ್ತು ಕಾರು ಚಾಲನೆ, ಪುರುಷ ಮತ್ತು ಮಹಿಳೆಯರಿಗೆ ಪ್ರತ್ಯೇಕ ಗಮನ, ಪುರುಷ ಮತ್ತು ಮಹಿಳಾ ತರಬೇತುದಾರರ ಲಭ್ಯತೆ.',
    heroBookBtn: 'ವಿಚಾರಿಸಿ / ಬುಕ್ ಮಾಡಿ',
    heroCheckStatusBtn: 'ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ',
    heroWhatsappBtn: 'ವಾಟ್ಸಾಪ್',
    heroCallNowBtn: 'ಈಗ ಕರೆ ಮಾಡಿ',
    heroDirectionsBtn: 'ದಾರಿ ತಿಳಿಯಿರಿ',
    heroReviewsLabel: 'ವಿಮರ್ಶೆಗಳು',
    heroYearsExp: '25 ವರ್ಷಗಳ ಅನುಭವ',
    heroEstablished: '2001 ರಲ್ಲಿ ಸ್ಥಾಪಿತ',
    heroLocationBadge: 'ಭದ್ರಪ್ಪ ಲೇಔಟ್, ಬೆಂಗಳೂರು',
    heroInstructorsBadge: 'ಪುರುಷ & ಮಹಿಳಾ ತರಬೇತುದಾರರು',

    aboutEyebrow: 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ ಬಗ್ಗೆ',
    aboutTitle1: '25 ವರ್ಷಗಳ ವಿಶ್ವಾಸಾರ್ಹ',
    aboutTitle2: 'ಚಾಲನಾ ತರಬೇತಿ ಅನುಭವ.',
    aboutSubtitle: 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ 2001 ರಿಂದ (25 ವರ್ಷಗಳ ಅನುಭವ) ಬೆಂಗಳೂರಿನ ಭದ್ರಪ್ಪ ಲೇಔಟ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿರುವ ಪ್ರತಿಷ್ಠಿತ ಮೋಟಾರ್ ತರಬೇತಿ ಶಾಲೆ. ಪುರುಷರು ಮತ್ತು ಮಹಿಳೆಯರಿಗೆ ದ್ವಿಚಕ್ರ ಮತ್ತು ನಾಲ್ಕು ಚಕ್ರ ವಾಹನಗಳ ಸುರಕ್ಷಿತ ಚಾಲನೆಯ ಪ್ರಾಯೋಗಿಕ ತರಬೇತಿಯನ್ನು ನಾವು ನೀಡುತ್ತೇವೆ.',
    aboutYearsExp: '25',
    aboutYearsExpLabel: 'ವರ್ಷಗಳ ವ್ಯವಹಾರ ಅನುಭವ (ಸ್ಥಾಪನೆ 2001)',
    aboutBullet1: '25 ವರ್ಷಗಳ ವಿಶ್ವಾಸಾರ್ಹ ಸ್ಥಳೀಯ ಡ್ರೈವಿಂಗ್ ಶಾಲೆಯ ಅನುಭವ (2001)',
    aboutBullet2: 'ದ್ವಿಚಕ್ರ ಮತ್ತು ನಾಲ್ಕು ಚಕ್ರ ವಾಹನಗಳೆರಡಕ್ಕೂ ತರಬೇತಿ',
    aboutBullet3: 'ಪುರುಷರು ಮತ್ತು ಮಹಿಳೆಯರಿಗೆ ಸಮರ್ಪಕ ಚಾಲನಾ ತರಬೇತಿ',
    aboutBullet4: 'ಡ್ಯುಯಲ್-ಕಂಟ್ರೋಲ್ ವಾಹನಗಳು & ರಸ್ತೆ ಸುರಕ್ಷತೆ ಜಾಗೃತಿ',
    aboutBullet5: 'ತಾಳ್ಮೆಯುಳ್ಳ, ನುರಿತ ಮತ್ತು ಸಭ್ಯ ಬೋಧಕರು',
    aboutBullet6: 'ಸಂಪೂರ್ಣ ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ & RTO ಕನ್ಸಲ್ಟೇಶನ್',
    aboutExploreBtn: 'ನಮ್ಮ ತರಬೇತಿ ಸೇವೆಗಳನ್ನು ನೋಡಿ',

    coursesEyebrow: 'ನಮ್ಮ ಸೇವೆಗಳು',
    coursesTitle: 'ಮೋಟಾರ್ ತರಬೇತಿ ಮತ್ತು RTO ಸೇವೆಗಳು',
    coursesSubtitle: 'ಭದ್ರಪ್ಪ ಲೇಔಟ್, ಬೆಂಗಳೂರಿನಲ್ಲಿ ದ್ವಿಚಕ್ರ, ಕಾರು, ಭಾರಿ ವಾಹನ ಚಾಲನೆ ಮತ್ತು ಲೈಸೆನ್ಸ್ ಕನ್ಸಲ್ಟೆನ್ಸಿ ಸೇವೆಗಳು.',
    trainingCategoriesTitle: 'ತರಬೇತಿ ವಿಭಾಗಗಳು',
    trainingCategoriesSubtitle: 'ಎಲ್ಲಾ ಕಲಿಯುವವರಿಗೂ ಮತ್ತು ವಾಹನ ಪ್ರಕಾರಗಳಿಗೂ ಸಮಗ್ರ ತರಬೇತಿ.',
    catTwoWheelerTitle: 'ದ್ವಿಚಕ್ರ ವಾಹನ ತರಬೇತಿ',
    catTwoWheelerDesc: 'ಗೇರ್ ಬೈಕ್ ಮತ್ತು ಸ್ಕೂಟರ್ ಚಾಲನೆ, ಸಮತೋಲನ ಮತ್ತು ರಸ್ತೆ ನಿಯಮಗಳ ತರಬೇತಿ.',
    catFourWheelerTitle: 'ನಾಲ್ಕು ಚಕ್ರ / ಕಾರ್ ತರಬೇತಿ',
    catFourWheelerDesc: 'ಕ್ಲಚ್, ಸ್ಟೀರಿಂಗ್, ಪಾರ್ಕಿಂಗ್ ಮತ್ತು ಟ್ರಾಫಿಕ್ ನಿರ್ವಹಣೆಯ ಪ್ರಾಯೋಗಿಕ ಕಾರ್ ತರಬೇತಿ.',
    catMenTitle: 'ಪುರುಷರಿಗೆ ತರಬೇತಿ',
    catMenDesc: 'ತಾಳ್ಮೆಯ ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಕೇಂದ್ರೀಕೃತ ಪ್ರಾಯೋಗಿಕ ಡ್ರೈವಿಂಗ್ ತರಬೇತಿ.',
    catWomenTitle: 'ಮಹಿಳೆಯರಿಗೆ ತರಬೇತಿ',
    catWomenDesc: 'ಆರಾಮದಾಯಕ, ಸುರಕ್ಷಿತ ಮತ್ತು ಆರಂಭಿಕ ಸ್ನೇಹಿ ವೈಯಕ್ತಿಕ ತರಬೇತಿ.',
    course1Title: 'ಮೋಟಾರ್ ತರಬೇತಿ',
    course1Desc: 'ಮೊದಲ ಬಾರಿಗೆ ವಾಹನ ಕಲಿಯುವವರಿಗಾಗಿ ರಸ್ತೆ ಶಿಸ್ತು, ಸ್ಟೀರಿಂಗ್ ನಿಯಂತ್ರಣ ಮತ್ತು ಸುರಕ್ಷತೆಯನ್ನು ಕಲಿಸುವ ಸಂಪೂರ್ಣ ಮೂಲಭೂತ ತರಬೇತಿ.',
    course2Title: 'ದ್ವಿಚಕ್ರ ವಾಹನ ತರಬೇತಿ ತರಗತಿಗಳು',
    course2Desc: 'ಗೇರ್ ಬೈಕ್ ಮತ್ತು ಸ್ಕೂಟರ್ ಚಾಲನೆ, ಸಮತೋಲನ, ಸುರಕ್ಷಿತ ಬ್ರೇಕಿಂಗ್ ಮತ್ತು ರಸ್ತೆ ನಿಯಂತ್ರಣದ ತರಬೇತಿ.',
    course3Title: 'ಕಾರ್ ಡ್ರೈವಿಂಗ್ ತರಗತಿಗಳು',
    course3Desc: 'ಕ್ಲಚ್ ನಿಯಂತ್ರಣ, ಸ್ಟೀರಿಂಗ್, ರಿವರ್ಸ್, ಪಾರ್ಕಿಂಗ್, ಸ್ಲೋಪ್ ಚಾಲನೆ ಮತ್ತು ಬೆಂಗಳೂರು ಟ್ರಾಫಿಕ್ ನಿರ್ವಹಣೆಯನ್ನು ಒಳಗೊಂಡ ಡ್ಯುಯಲ್-ಕಂಟ್ರೋಲ್ ಕಾರ್ ತರಬೇತಿ.',
    course4Title: 'ಭಾರಿ ವಾಹನ ಚಾಲನಾ ತರಬೇತಿ',
    course4Desc: 'ವಾಣಿಜ್ಯ ಮತ್ತು ಭಾರಿ ವಾಹನಗಳ ಡ್ರೈವಿಂಗ್ ಡೈನಾಮಿಕ್ಸ್, ರಸ್ತೆ ಸುರಕ್ಷತಾ ನಿಯಮಗಳು ಮತ್ತು ಲೈಸೆನ್ಸಿಂಗ್ ತರಬೇತಿ.',
    course5Title: 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ಕನ್ಸಲ್ಟೇಶನ್',
    course5Desc: 'ಲರ್ನರ್ಸ್ ಲೈಸೆನ್ಸ್ (LL), ಶಾಶ್ವತ ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ (DL) ಮತ್ತು ಪರೀಕ್ಷೆಗಳಿಗೆ ಹಂತ-ಹಂತದ ಮಾರ್ಗದರ್ಶನ.',
    course6Title: 'RTO ಕನ್ಸಲ್ಟೇಶನ್',
    course6Desc: 'ವಾಹನ ನೋಂದಣಿ, ಮಾಲೀಕತ್ವ ವರ್ಗಾವಣೆ, ವಿಳಾಸ ಬದಲಾವಣೆ ಮತ್ತು NOC ಗಳಿಗೆ ಸಂಪೂರ್ಣ RTO ನೆರವು.',
    course7Title: 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ಕನ್ಸಲ್ಟೆಂಟ್ ಸೇವೆಗಳು',
    course7Desc: 'ಲೈಸೆನ್ಸ್ ನವೀಕರಣ, ಡ್ಯೂಪ್ಲಿಕೇಟ್ DL, ಮರು-ಪರೀಕ್ಷೆ ಮತ್ತು ವಿಶೇಷ ಅನುಮತಿಗಳಿಗೆ ತಜ್ಞರ ಸೇವೆಗಳು.',
    course8Title: 'ಅಂತಾರಾಷ್ಟ್ರೀಯ ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ನೆರವು',
    course8Desc: 'ವಿದೇಶ ಪ್ರಯಾಣಕ್ಕಾಗಿ ಅಂತಾರಾಷ್ಟ್ರೀಯ ಚಾಲನಾ ಪರವಾನಗಿ (International Driving Permit) ಪಡೆಯಲು ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶನ.',
    courseBookBtn: 'ಈ ಸೇವೆಗಾಗಿ ವಿಚಾರಿಸಿ',

    courseNames: {
      'Motor Training': 'ಮೋಟಾರ್ ತರಬೇತಿ',
      'Two-Wheeler Driving Classes': 'ದ್ವಿಚಕ್ರ ವಾಹನ ತರಬೇತಿ ತರಗತಿಗಳು',
      'Car Driving Classes (Four-Wheeler)': 'ಕಾರ್ ಡ್ರೈವಿಂಗ್ ತರಗತಿಗಳು (ನಾಲ್ಕು ಚಕ್ರ)',
      'Heavy Vehicle Driving Classes': 'ಭಾರಿ ವಾಹನ ಚಾಲನಾ ತರಬೇತಿ',
      'Driving License Consultation': 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ಕನ್ಸಲ್ಟೇಶನ್',
      'RTO Consultation': 'RTO ಕನ್ಸಲ್ಟೇಶನ್',
      'Driving License Consultant Services': 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ಕನ್ಸಲ್ಟೆಂಟ್ ಸೇವೆಗಳು',
      'International Driving License Assistance': 'ಅಂತಾರಾಷ್ಟ್ರೀಯ ಲೈಸೆನ್ಸ್ (IDP) ಸಹಾಯ',
      'Motor Training (Beginner Course)': 'ಮೋಟಾರ್ ತರಬೇತಿ',
      'Car Driving Classes': 'ಕಾರ್ ಡ್ರೈವಿಂಗ್ ತರಗತಿಗಳು',
      'Refresher Driving Course': 'ರಿಫ್ರೆಶರ್ ಡ್ರೈವಿಂಗ್ ಕೋರ್ಸ್',
      'Two-Wheeler Training': 'ದ್ವಿಚಕ್ರ ವಾಹನ ತರಬೇತಿ',
      'Four-Wheeler Training': 'ನಾಲ್ಕು ಚಕ್ರ / ಕಾರ್ ತರಬೇತಿ',
      'Training for Men': 'ಪುರುಷರಿಗೆ ತರಬೇತಿ',
      'Training for Women': 'ಮಹಿಳೆಯರಿಗೆ ತರಬೇತಿ',
      'Other': 'ಇತರೆ ಸೇವೆಗಳು'
    },

    whyUsEyebrow: 'ನಮ್ಮನ್ನೇಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು',
    whyUsTitle1: 'ನಿಜವಾದ ಅನುಭವ.',
    whyUsTitle2: 'ವಿಶ್ವಾಸಾರ್ಹ ಸ್ಥಳೀಯ ತರಬೇತಿ.',
    whyUsSubtitle: 'ಭದ್ರಪ್ಪ ಲೇಔಟ್‌ನಲ್ಲಿ ರಸ್ತೆ ಸುರಕ್ಷತೆ, ತಾಳ್ಮೆ ಮತ್ತು 25 ವರ್ಷಗಳ ಅನುಭವದೊಂದಿಗೆ ಶಿಸ್ತುಬದ್ಧ ಡ್ರೈವಿಂಗ್ ಶಿಕ್ಷಣ.',
    benefit1Title: '2001 ರಲ್ಲಿ ಸ್ಥಾಪಿತ (25 ವರ್ಷಗಳ ಅನುಭವ)',
    benefit1Text: 'ಭದ್ರಪ್ಪ ಲೇಔಟ್ ಮತ್ತು ಬೆಂಗಳೂರಿನಲ್ಲಿ ಕಾಲು ಶತಮಾನಕ್ಕೂ ಹೆಚ್ಚು ಕಾಲ ಕಲಿಯುವವರಿಗೆ ಗುಣಮಟ್ಟದ ಚಾಲನಾ ತರಬೇತಿ ನೀಡಿದ ಹಿರಿಮೆ.',
    benefit2Title: 'ನೈಜ ರಸ್ತೆಗಳಲ್ಲಿ ಪ್ರಾಯೋಗಿಕ ತರಬೇತಿ',
    benefit2Text: 'ಬೆಂಗಳೂರು ಸಿಟಿ ಟ್ರಾಫಿಕ್‌ನಲ್ಲಿ ಪಾರ್ಕಿಂಗ್, ಲೇನ್ ಬದಲಾವಣೆ, ಸ್ಲೋಪ್ ಮತ್ತು ರಕ್ಷಣಾತ್ಮಕ ಚಾಲನೆಯ ಪ್ರಾಯೋಗಿಕ ಅನುಭವ.',
    benefit3Title: 'ಪುರುಷರು ಮತ್ತು ಮಹಿಳೆಯರಿಗೆ ತರಬೇತಿ',
    benefit3Text: 'ಎಲ್ಲಾ ವಯೋಮಾನದ ಪುರುಷ ಮತ್ತು ಮಹಿಳಾ ಕಲಿಯುವವರಿಗೂ ಗೌರವಾನ್ವಿತ, ಸುರಕ್ಷಿತ ಮತ್ತು ಪ್ರೋತ್ಸಾಹದಾಯಕ ಕಲಿಕೆಯ ವಾತಾವರಣ.',
    benefit4Title: 'ಪುರುಷ ಮತ್ತು ಮಹಿಳಾ ತರಬೇತುದಾರರು',
    benefit4Text: 'ನಿಮ್ಮ ಆರಾಮದಾಯಕತೆ ಮತ್ತು ವೈಯಕ್ತಿಕ ಆದ್ಯತೆಗೆ ತಕ್ಕಂತೆ ಪುರುಷ ಅಥವಾ ಮಹಿಳಾ ತರಬೇತುದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    benefit5Title: 'ಭದ್ರಪ್ಪ ಲೇಔಟ್‌ನ ಪ್ರಮುಖ ಸ್ಥಳ',
    benefit5Text: '1ನೇ ಮಹಡಿ, ಶ್ರೀನಿಕ ಕಾಂಪ್ಲೆಕ್ಸ್, ಭದ್ರಪ್ಪ ಲೇಔಟ್ ಸರ್ವೀಸ್ ರೋಡ್ (ಬಿಗ್ ಬಜಾರ್ ಹತ್ತಿರ), ಭದ್ರಪ್ಪ ಲೇಔಟ್.',
    benefit6Title: 'ಅನುಕೂಲಕರ ಕಾರ್ಯನಿರ್ವಹಣೆಯ ಸಮಯ',
    benefit6Text: 'ವಾರದ ಎಲ್ಲಾ 7 ದಿನಗಳೂ ಬೆಳಗ್ಗೆ 8:30 ರಿಂದ ಸಂಜೆ 7:30 ರವರೆಗೆ ಹೊಂದಿಕೊಳ್ಳುವ ಸಮಯದ ಸ್ಲಾಟ್‌ಗಳು ಲಭ್ಯ.',
    benefit7Title: 'ಸಂಪೂರ್ಣ RTO & ಲೈಸೆನ್ಸ್ ಸಹಾಯ',
    benefit7Text: 'ಲರ್ನರ್ಸ್ ಲೈಸೆನ್ಸ್ (LL), DL ಪರೀಕ್ಷೆ ತಯಾರಿ, ನವೀಕರಣಗಳು ಮತ್ತು ಅಂತಾರಾಷ್ಟ್ರೀಯ ಲೈಸೆನ್ಸ್‌ಗೆ ಸಂಪೂರ್ಣ ನೆರವು.',

    galleryEyebrow: 'ಗ್ಯಾಲರಿ',
    galleryTitle: 'ತರಬೇತಿ ಮತ್ತು ಶಾಲೆಯ ಫೋಟೋಗಳು.',
    gallerySubtitle: 'ಬೆಂಗಳೂರಿನ ಭದ್ರಪ್ಪ ಲೇಔಟ್‌ನ ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಶಾಲೆಯ ನೈಜ ಫೋಟೋಗಳು.',
    galleryEmpty: 'ಗ್ಯಾಲರಿ ಫೋಟೋಗಳು ಶೀಘ್ರದಲ್ಲೇ ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳಲಿವೆ.',
    galleryViewAll: 'ಎಲ್ಲಾ ಫೋಟೋಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    galleryViewMore: 'ಇನ್ನಷ್ಟು ವೀಕ್ಷಿಸಿ',
    galleryLoadingMore: 'ಇನ್ನಷ್ಟು ಫೋಟೋಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    galleryAllLoaded: 'ಎಲ್ಲಾ ಪ್ರಕಟಿತ ಗ್ಯಾಲರಿ ಫೋಟೋಗಳನ್ನು ಪ್ರದರ್ಶಿಸಲಾಗಿದೆ',
    galleryLoadError: 'ಫೋಟೋಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
    galleryRetry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    galleryFullTitle: 'ಸಂಪೂರ್ಣ ಗ್ಯಾಲರಿ',
    galleryAllPhotos: 'ಎಲ್ಲಾ ತರಬೇತಿ ಮತ್ತು ಶಾಲೆಯ ಫೋಟೋಗಳು',
    galleryClose: 'ಮುಚ್ಚಿ',
    galleryBackHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',

    reviewsEyebrow: 'ಗ್ರಾಹಕರ ಪ್ರತಿಕ್ರಿಯೆ',
    reviewsTitle1: 'ನಮ್ಮ ಕಲಿಯುವವರು',
    reviewsTitle2: 'ಏನು ಹೇಳುತ್ತಾರೆ.',
    reviewsSubtitle: 'ಬೆಂಗಳೂರಿನ ಭದ್ರಪ್ಪ ಲೇಔಟ್‌ನ ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಶಾಲೆಯ ಕಲಿಯುವವರ ನೈಜ ಅನುಭವಗಳು ಮತ್ತು ವಿಮರ್ಶೆಗಳು.',
    reviewsGoogleBtn: 'ಗೂಗಲ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ',
    reviewsRatingLabel: 'ಗೂಗಲ್ ವಿಮರ್ಶೆಗಳು',
    reviewsDefaultHighlight: 'ತಾಳ್ಮೆಯುಳ್ಳ ಬೋಧನೆ, ಸಭ್ಯ ತರಬೇತುದಾರರು, ಪ್ರಾಯೋಗಿಕ ರಸ್ತೆ ತರಬೇತಿ ಮತ್ತು ಸುಲಭ RTO ಸಹಾಯಕ್ಕಾಗಿ ಮೆಚ್ಚುಗೆ ಪಡೆದಿದೆ.',
    reviewsViewMore: 'ಇನ್ನಷ್ಟು ವಿಮರ್ಶೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    reviewsViewMoreGoogle: 'ಗೂಗಲ್‌ನಲ್ಲಿ ಇನ್ನಷ್ಟು ವಿಮರ್ಶೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    reviewsLoading: 'ವಿಮರ್ಶೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    reviewsAllLoaded: 'ಎಲ್ಲಾ ಪ್ರಕಟಿತ ವಿಮರ್ಶೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ',
    reviewsWriteReview: 'ಗೂಗಲ್‌ನಲ್ಲಿ ವಿಮರ್ಶೆ ಬರೆಯಿರಿ',
    reviewsViewOnGoogle: 'ಗೂಗಲ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ',
    reviewsError: 'ಈ ಸಮಯದಲ್ಲಿ ವಿಮರ್ಶೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.',
    reviewsRetry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    reviewsEmpty: 'ಈ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ವಿಮರ್ಶೆಗಳು ಲಭ್ಯವಿಲ್ಲ.',

    ctaEyebrow: 'ಪ್ರಶ್ನೆಗಳು / ವಿಚಾರಣೆ',
    ctaTitle: 'ಪ್ರಾಯೋಗಿಕ ಕೌಶಲ್ಯ ಮತ್ತು ಸುರಕ್ಷತೆಯೊಂದಿಗೆ ಚಾಲನೆ ಕಲಿಯಿರಿ.',
    ctaSubtitle: 'ಡ್ರೈವಿಂಗ್ ತರಗತಿಗಳು, ಕಾರ್ ತರಬೇತಿ, ದ್ವಿಚಕ್ರ ವಾಹನ ಅಥವಾ RTO ಲೈಸೆನ್ಸ್ ಕುರಿತು ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದಲ್ಲಿ ಇಂದೇ ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ ಸಂಪರ್ಕಿಸಿ.',
    ctaCallBtn: 'ಕರೆ ಮಾಡಿ: +91 90195 04489',
    ctaWhatsappBtn: 'ವಾಟ್ಸಾಪ್ ಮಾಡಿ',
    ctaDirectionsBtn: 'ದಾರಿ ತಿಳಿಯಿರಿ',

    contactEyebrow: 'ಪ್ರಶ್ನೆಗಳು & ಸಂಪರ್ಕ',
    contactTitle1: 'ಪ್ರಾಯೋಗಿಕ ಕೌಶಲ್ಯ ಮತ್ತು',
    contactTitle2: 'ಸುರಕ್ಷತೆಯೊಂದಿಗೆ ಚಾಲನೆ ಕಲಿಯಿರಿ.',
    contactSubtitle: 'ಫೋನ್ ಮಾಡಿ, ವಾಟ್ಸಾಪ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗೆ ವಿಚಾರಣೆ/ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಸಲ್ಲಿಸಿ. ಭದ್ರಪ್ಪ ಲೇಔಟ್‌ನಲ್ಲಿರುವ ನಮ್ಮ ತಂಡ ಶೀಘ್ರದಲ್ಲೇ ಸಂಪರ್ಕಿಸುತ್ತದೆ.',
    contactPhoneLabel: 'ದೂರವಾಣಿ & ವಾಟ್ಸಾಪ್',
    contactHoursLabel: 'ಕಾರ್ಯನಿರ್ವಹಣೆಯ ಸಮಯ',
    contactHoursDetail: 'ಸೋಮವಾರ – ಭಾನುವಾರ: 8:30 AM – 7:30 PM',
    contactAddressLabel: 'ಪರಿಶೀಲಿತ ವಿಳಾಸ',
    contactViewMaps: 'ಗೂಗಲ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ',
    contactGetDirections: 'ದಾರಿ ತಿಳಿಯಿರಿ',

    locationEyebrow: 'ಸ್ಥಳ & ಮಾರ್ಗ',
    locationTitle1: 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಶಾಲೆ',
    locationTitle2: 'ಭದ್ರಪ್ಪ ಲೇಔಟ್, ಬೆಂಗಳೂರು.',
    locationSubtitle: '1ನೇ ಮಹಡಿ, ಶ್ರೀನಿಕ ಕಾಂಪ್ಲೆಕ್ಸ್, ಭದ್ರಪ್ಪ ಲೇಔಟ್ ಸರ್ವೀಸ್ ರೋಡ್, ಭದ್ರಪ್ಪ ಲೇಔಟ್, ಕೋಟಿ ಹೊಸಹಳ್ಳಿ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ 560094.',

    footerDesc: 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ 2001 ರಿಂದ ಬೆಂಗಳೂರಿನ ಭದ್ರಪ್ಪ ಲೇಔಟ್‌ನಲ್ಲಿ ವೃತ್ತಿಪರ, ಪ್ರಾಯೋಗಿಕ ಚಾಲನಾ ತರಬೇತಿ ಮತ್ತು RTO ಕನ್ಸಲ್ಟೇಶನ್ ಸೇವೆಗಳನ್ನು ಒದಗಿಸುತ್ತಿದೆ.',
    footerNavHeading: 'ನ್ಯಾವಿಗೇಷನ್',
    footerCoursesHeading: 'ಸೇವೆಗಳು',
    footerContactHeading: 'ಸಂಪರ್ಕ ಮಾಹಿತಿ',
    footerCopyright: '© 2026 ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
    footerTagline: 'ಮೋಟಾರ್ ತರಬೇತಿ ಶಾಲೆ, ಭದ್ರಪ್ಪ ಲೇಔಟ್, ಬೆಂಗಳೂರು',
    footerAdminLogin: 'ನಿರ್ವಾಹಕರ ಲಾಗಿನ್',

    mobileCall: 'ಕರೆ',
    mobileWhatsapp: 'ವಾಟ್ಸಾಪ್',
    mobileBook: 'ವಿಚಾರಿಸಿ',
    mobileDirections: 'ದಾರಿ',

    formEyebrow: 'ನಿಮ್ಮ ತರಗತಿಯನ್ನು ಕಾಯ್ದಿರಿಸಿ',
    formTitle: 'ವಿಚಾರಣೆ ಅಥವಾ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ.',
    formSubtitle: 'ನಿಮಗೆ ಸೂಕ್ತವಾದ ಕೋರ್ಸ್ ಮತ್ತು ಸಮಯವನ್ನು ಆರಿಸಿ. ಶಾಲೆ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ ಸಮಯವನ್ನು ದೃಢಪಡಿಸುತ್ತದೆ.',
    formNameLabel: 'ಪೂರ್ಣ ಹೆಸರು *',
    formNamePlaceholder: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು',
    formPhoneLabel: 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ *',
    formPhonePlaceholder: '10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    formEmailLabel: 'ಇಮೇಲ್ (ಐಚ್ಛಿಕ)',
    formEmailPlaceholder: 'you@example.com',
    formCourseLabel: 'ಸೇವೆ / ಕೋರ್ಸ್ *',
    formCourseSelect: 'ಕೋರ್ಸ್ ಅಥವಾ ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    formDateLabel: 'ಆದ್ಯತೆಯ ದಿನಾಂಕ *',
    formTimeLabel: 'ಆದ್ಯತೆಯ ಸಮಯ *',
    formTimeSelect: 'ಸಮಯದ ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ (8:30 AM – 7:00 PM)',
    formMessageLabel: 'ಸಂದೇಶ / ಅಗತ್ಯತೆಗಳು',
    formMessagePlaceholder: 'ಉದಾ: ಆರಂಭಿಕರ ಕಾರ್ ತರಬೇತಿ, ಬೈಕ್ ತರಬೇತಿ, DL ಅಥವಾ RTO ವಿಚಾರಣೆ',
    formSubmitBtn: 'ವಿಚಾರಣೆ ಸಲ್ಲಿಸಿ',
    formBookingLoading: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
    formErrName: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.',
    formErrPhone: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    formErrCourse: 'ದಯವಿಟ್ಟು ಕೋರ್ಸ್ ಅಥವಾ ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    formErrDate: 'ದಯವಿಟ್ಟು ಆದ್ಯತೆಯ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    formErrFutureDate: 'ದಯವಿಟ್ಟು ಇಂದಿನ ಅಥವಾ ಮುಂದಿನ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    formErrTime: 'ದಯವಿಟ್ಟು ಆದ್ಯತೆಯ ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    formErrServer: 'ಈ ಸಮಯದಲ್ಲಿ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಸಲ್ಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನೇರವಾಗಿ +91 90195 04489 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ.',

    successReceivedEyebrow: 'ವಿಚಾರಣೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
    successThankYou: 'ಧನ್ಯವಾದಗಳು',
    successDesc: 'ನಿಮ್ಮ ವಿಚಾರಣೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ವಿವರಗಳನ್ನು ದೃಢಪಡಿಸಲು ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್ ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಫೋನ್‌ಗೆ ಕರೆ ಮಾಡುತ್ತದೆ.',
    successApptId: 'ವಿಚಾರಣೆ ಐಡಿ',
    successCourse: 'ಕೋರ್ಸ್ / ಸೇವೆ',
    successDate: 'ದಿನಾಂಕ',
    successTime: 'ಸಮಯ',
    successStatus: 'ಸ್ಥಿತಿ',
    successPendingText: 'ದೃಢೀಕರಣಕ್ಕಾಗಿ ಬಾಕಿ ಇದೆ',
    successCallBtn: 'ಶಾಲೆಗೆ ಕರೆ ಮಾಡಿ',
    successWhatsappBtn: 'ಶಾಲೆಗೆ ವಾಟ್ಸಾಪ್ ಮಾಡಿ',
    successBookAnother: 'ಮತ್ತೊಂದು ವಿಚಾರಣೆ ಸಲ್ಲಿಸಿ',

    statusBackWeb: 'ವೆಬ್‌ಸೈಟ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    statusSchoolName: 'ಶ್ರೀ ಸಾಗರ್ ಡ್ರೈವಿಂಗ್ ಸ್ಕೂಲ್',
    statusPageTitle: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ',
    statusPageSubtitle: 'ಕೆಳಗೆ ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಐಡಿ ಅಥವಾ ನೋಂದಾಯಿತ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    statusTabId: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಐಡಿ',
    statusTabPhone: 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ',
    statusInputIdPlaceholder: 'SSDS-YYYYMMDD-XXX',
    statusInputPhonePlaceholder: 'ನಿಮ್ಮ ದೂರವಾಣಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
    statusCheckBtn: 'ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ',
    statusLabelPending: 'ದೃಢೀಕರಣಕ್ಕಾಗಿ ಬಾಕಿ ಇದೆ',
    statusDescPending: 'ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ ಮತ್ತು ಶಾಲೆಯ ದೃಢೀಕರಣಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ.',
    statusLabelConfirmed: 'ಖಚಿತಪಡಿಸಲಾಗಿದೆ',
    statusDescConfirmed: 'ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಅನ್ನು ಶಾಲೆಯು ಖಚಿತಪಡಿಸಿದೆ.',
    statusLabelCompleted: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    statusDescCompleted: 'ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಪೂರ್ಣಗೊಂಡಿದೆ.',
    statusLabelCancelled: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
    statusDescCancelled: 'ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಅನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.',
    statusNotFound: 'ಯಾವುದೇ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಐಡಿ ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
  }
};
