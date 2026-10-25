import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wcurzjcdqxkahcardcyi.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2PguQk3d0whzDe5_qGT7Bg__jyyWdgS';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Deterministic UUID generation so that multiple runs never create duplicates
function generateDeterministicUUID(input: string): string {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  // Format as standard UUID 8-4-4-4-12
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export interface ReviewImportItem {
  name: string;
  text: string;
  rating: number;
  reviewDate: string; // YYYY-MM-DD format for database date column
  relativeDate?: string;
  metadata?: string;
  reactionCount?: number;
  hasPhoto?: boolean;
  hasVideo?: boolean;
  isLocalGuide?: boolean;
  reviewCount?: number;
}

export const rawReviewsData: ReviewImportItem[] = [
  {
    name: 'Komalagk477 Ganesh',
    text: 'Good service, great experience,\nI had an excellent experience learning at Sri sagar driving school they were very friendly especially is Amala sis. Thanks to Amala and I highly recommend this driving school located in Bhadrapada layout 👍',
    rating: 5,
    reviewDate: '2026-04-23',
    relativeDate: '4 months ago',
    metadata: '3 reviews, 4 months ago, 2 reactions, Video 1 and Video 2 in review.',
    reactionCount: 2,
    hasVideo: true,
    reviewCount: 3
  },
  {
    name: 'Pranay reddy',
    text: 'I learned to ride a geared two-wheeler at Sri Sagar Driving School and had a good experience overall. My instructor, Bharath, was patient and explained things clearly, which made it easier to learn and improve. He pointed out mistakes …More',
    rating: 5,
    reviewDate: '2026-06-23',
    relativeDate: '2 months ago',
    metadata: '1 review, 2 months ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 1
  },
  {
    name: 'Kalyani Mahagon',
    text: 'I had a great experience with Sri mathru Driving School. Mr. Vijay is a very patient, friendly, and professional instructor who made learning to drive easy and comfortable. He explained everything clearly, gave useful tips, and helped me …More',
    rating: 5,
    reviewDate: '2026-05-23',
    relativeDate: '3 months ago',
    metadata: '4 reviews, 3 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 4
  },
  {
    name: 'manu arya',
    text: 'I would highly recommend this place to anyone looking to learn driving. The training schedule is very convenient, and the instructors ensure that you learn quickly and confidently. Mr. Raghu is extremely friendly and humble, which makes the …More',
    rating: 5,
    reviewDate: '2026-04-23',
    relativeDate: '4 months ago',
    metadata: '7 reviews, 1 photo, 4 months ago, 2 reactions.',
    reactionCount: 2,
    hasPhoto: true,
    reviewCount: 7
  },
  {
    name: 'Ashutosh Agrawal',
    text: 'Had an efficient and pleasant experience with Sri Sagar driving school. Mr Sagar was professional in all his work and handled all the required paperwork starting from the LL issuance to the classes themselves and the final DL test quite …More',
    rating: 5,
    reviewDate: '2026-04-23',
    relativeDate: '4 months ago',
    metadata: '4 reviews, 4 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 4
  },
  {
    name: 'vahid Ali',
    text: 'Mr. Raghu is a very kind and helpful person. My license had expired, and he guided me through the renewal process smoothly and quickly. For any type of new license or renewal services, I highly recommend visiting him. Excellent support and professional service.',
    rating: 5,
    reviewDate: '2026-06-23',
    relativeDate: '2 months ago',
    metadata: '5 reviews, 2 months ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 5
  },
  {
    name: 'Deepen Shah',
    text: 'Had a great and smooth learning experience with the Sri Sagar Driving School. Mr. Raghu is the owner who is really helpful in every way possible. He already has a vast experience, and you can directly reach out to him anytime for any …More',
    rating: 5,
    reviewDate: '2026-05-23',
    relativeDate: '3 months ago',
    metadata: 'Local Guide, 6 reviews, 3 months ago, 2 reactions.',
    isLocalGuide: true,
    reactionCount: 2,
    reviewCount: 6
  },
  {
    name: 'Sathyaraj Raj',
    text: 'Ramanaiah as trainer is well experienced and thought my wife driving very well. Also the coordination for documentation and DL was exceptional. Thank you again for Sri Sagar driving school. My wife was able to drive independently soon after a few days of car driving classes.',
    rating: 5,
    reviewDate: '2026-06-23',
    relativeDate: '2 months ago',
    metadata: 'Local Guide, 8 reviews, 5 photos, 2 months ago, 1 reaction.',
    isLocalGuide: true,
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 8
  },
  {
    name: 'Rama Ashok',
    text: 'Professional Driving School. I have enrolled for 2 wheeler driving and Amala was my Instructor. She came to my nearby location every day and taught the classes. She was flexible with the timings and days, understanding our needs. The fees …More',
    rating: 5,
    reviewDate: '2026-04-23',
    relativeDate: '4 months ago',
    metadata: '8 reviews, 1 photo, 4 months ago, 2 reactions.',
    reactionCount: 2,
    hasPhoto: true,
    reviewCount: 8
  },
  {
    name: 'Madhu M',
    text: 'Mr.RaghuSagar is the Gem person ....he DONE The RC transfer within 5 days with reasonable price.....i will suggest all to visit the driving school',
    rating: 5,
    reviewDate: '2026-08-09',
    relativeDate: '2 weeks ago',
    metadata: '2 reviews, 2 weeks ago, New, 1 reaction.',
    reactionCount: 1,
    reviewCount: 2
  },
  {
    name: 'Devika R',
    text: 'I had a really good experience with this driving school. The instructors were patient and guided me well, which helped me learn car driving confidently. I also received both my two-wheeler and four-wheeler licenses without any hassle. Trust worthy 👍',
    rating: 5,
    reviewDate: '2026-04-23',
    relativeDate: '4 months ago',
    metadata: '3 reviews, 4 months ago, 3 reactions.',
    reactionCount: 3,
    reviewCount: 3
  },
  {
    name: 'Yamini Jindal',
    text: 'Great scooty trainer[AMALA MAM]! Very patient and friendly, explains everything in a simple way. I felt comfortable and gained confidence quickly. Training was smooth and helpful. Highly recommended!',
    rating: 5,
    reviewDate: '2026-05-23',
    relativeDate: '3 months ago',
    metadata: '2 reviews, 3 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 2
  },
  {
    name: 'Akshay R',
    text: 'I had a great experience at Sri Sagar driving school. I had taken two wheeler lessons (geared bike) and it was very helpful. Instructor Bharath was very experienced and answered all questions with patience. I have gained confidence to drive bike now. I highly recommend this driving school to anyone wanting to learn with proper guidance.',
    rating: 5,
    reviewDate: '2026-01-23',
    relativeDate: '7 months ago',
    metadata: '1 review, 7 months ago, 3 reactions.',
    reactionCount: 3,
    reviewCount: 1
  },
  {
    name: 'Manjula N',
    text: 'Raghu sagar Sir told me you will pass in first attempt only and Iam also passed in first attempt in driving test and I got good experience here. So everyone should come here for good driving learning experience and excellent coaching visit sri sagar driving school',
    rating: 5,
    reviewDate: '2025-11-23',
    relativeDate: '9 months ago',
    metadata: '1 review, 9 months ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 1
  },
  {
    name: 'Lakshmi Raja',
    text: 'I had a great learning experience at this driving school. The instructors were very patient, professional, and explained everything clearly, which made me feel confident while learning to drive.I highly recommend this driving school to anyone who wants to learn car driving in a comfortable and supportive environment.',
    rating: 5,
    reviewDate: '2026-02-23',
    relativeDate: '6 months ago',
    metadata: '1 review, 6 months ago, 3 reactions.',
    reactionCount: 3,
    reviewCount: 1
  },
  {
    name: 'sindhu',
    text: 'I had great experience during my initial driving lessons here in Sri Sagar driving school.the entire process was well supported and efficient. I would recommend Sri Sagar driving school to all beginers.',
    rating: 5,
    reviewDate: '2026-02-23',
    relativeDate: '6 months ago',
    metadata: 'Local Guide, 10 reviews, 7 photos, 6 months ago, 2 reactions.',
    isLocalGuide: true,
    reactionCount: 2,
    hasPhoto: true,
    reviewCount: 10
  },
  {
    name: 'Elijah Stephen',
    text: 'Bharath is a very good, patient instructor. He taught me 2 wheeler geared bike well and he is willing to clarify doubts when riding the bike.',
    rating: 5,
    reviewDate: '2026-05-23',
    relativeDate: '3 months ago',
    metadata: '1 review, 3 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 1
  },
  {
    name: 'Dr.shruthi Dr.shruthi',
    text: 'It was a nice experience n d ramaiah driver was very patience n dedicated in teaching me…n asla Raghu sir helped me a lot n encouraged me a Lot ..thank u all for guiding n guiding my confidence ..I would refer this to all my well wishers',
    rating: 5,
    reviewDate: '2026-04-23',
    relativeDate: '4 months ago',
    metadata: '1 review, 4 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 1
  },
  {
    name: 'K Sushmitha',
    text: 'Had an amazing experience with this driving school.\nThey managed all the license documentation so it was hassle free for me. Highly recommended!',
    rating: 5,
    reviewDate: '2026-04-23',
    relativeDate: '4 months ago',
    metadata: '6 reviews, 4 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 6
  },
  {
    name: 'Prajesh Kumar',
    text: "I visited the establishment to update the address on my driver's license and obtain a new smart card. The service was delivered promptly, prior to my international travel. I appreciate the service.",
    rating: 5,
    reviewDate: '2026-06-23',
    relativeDate: '2 months ago',
    metadata: 'Local Guide, 14 reviews, 2 months ago, 1 reaction.',
    isLocalGuide: true,
    reactionCount: 1,
    reviewCount: 14
  },
  {
    name: 'Krishna Mohan',
    text: 'I had an excellent experience learning at Sagar driving school. From start to finish, everything was handled so smoothly and professionally. Raghu sir, the owner, is very kind, approachable, and always ready to help. He took care of the …More',
    rating: 5,
    reviewDate: '2025-10-23',
    relativeDate: '10 months ago',
    metadata: '7 reviews, 10 months ago, 4 reactions.',
    reactionCount: 4,
    reviewCount: 7
  },
  {
    name: 'Geetha S',
    text: 'Ramu sir is a very patient and excellent driving coach. He explained everything clearly and helped me gain confidence in driving.',
    rating: 5,
    reviewDate: '2026-05-23',
    relativeDate: '3 months ago',
    metadata: '3 reviews, 3 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 3
  },
  {
    name: 'Prajwal Gowda',
    text: 'Excellent service, got my LL and DL as early as requested. Very supportive drivers in driving classes.',
    rating: 5,
    reviewDate: '2026-07-23',
    relativeDate: '1 month ago',
    metadata: '2 reviews, 1 month ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 2
  },
  {
    name: 'Shiva Kumar',
    text: 'Sri Sagar Driving School – Highly Recommended!\n\nI had an excellent experience learning at Sri Sagar Driving School. The classes …More',
    rating: 5,
    reviewDate: '2025-11-23',
    relativeDate: '9 months ago',
    metadata: '6 reviews, 9 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 6
  },
  {
    name: 'Siva',
    text: 'Nice I had an excellent experience with Sri Sagar Driving School. Mr. Raghu is a very patient and professional instructor who makes learning to drive easy and comfortable. He explains every detail clearly, gives practical tips, and builds …More',
    rating: 5,
    reviewDate: '2025-09-23',
    relativeDate: '11 months ago',
    metadata: '2 reviews, 11 months ago, 5 reactions.',
    reactionCount: 5,
    reviewCount: 2
  },
  {
    name: 'Vipin V P',
    text: 'Good instructors. Helped me get my license without any problem.',
    rating: 5,
    reviewDate: '2026-07-23',
    relativeDate: '1 month ago',
    metadata: 'Local Guide, 24 reviews, 22 photos, 1 month ago, 1 reaction.',
    isLocalGuide: true,
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 24
  },
  {
    name: 'Nithu Choudhary',
    text: 'Overall a good learning experience. The staff was supportive and helped build basic confidence in driving',
    rating: 5,
    reviewDate: '2026-01-23',
    relativeDate: '7 months ago',
    metadata: '3 reviews, 7 months ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 3
  },
  {
    name: 'Keerthana Parthiban',
    text: 'I had took admission for two wheeler at Sri sagar driving school and had a very good experience and better learning with the trainer called Amala thanks for the learning 😄 …More',
    rating: 5,
    reviewDate: '2026-03-23',
    relativeDate: '5 months ago',
    metadata: '2 reviews, 5 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 2
  },
  {
    name: 'Sushant Mohakud',
    text: 'Vry good\nThe sagar school one of the best driving school at Badrappa lay out and the owner of Driving school Mr. Raghu is a sweet talking professional and committed to …More',
    rating: 5,
    reviewDate: '2025-10-23',
    relativeDate: 'Edited 10 months ago',
    metadata: '1 review, Edited 10 months ago, 3 reactions.',
    reactionCount: 3,
    reviewCount: 1
  },
  {
    name: 'Lavanya Nandan',
    text: 'Thanks to Mr. Raghu, the owner of Shree Sagar Driving School, for ensuring a smooth and efficient driving licence process. I highly recommend this driving school for a hassle-free experience.',
    rating: 5,
    reviewDate: '2026-01-23',
    relativeDate: '7 months ago',
    metadata: '11 reviews, 7 months ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 11
  },
  {
    name: 'Dominic David',
    text: 'Reghu Sir was very Helpful. I had been to Gokul Driving School and They Deliberately Made me Fail even after Passing the Bike Test. But After I met Reghu Sir In Sri Sagar Driving School He has given me some tips and tricks to Overcome the …More',
    rating: 5,
    reviewDate: '2025-11-23',
    relativeDate: '9 months ago',
    metadata: '9 reviews, 9 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 9
  },
  {
    name: 'Raghav Poojari',
    text: 'Good services. Great experience! The Raghu helped me get my bike learner licence smoothly. Staff were polite, explained everything clearly, and the process was quick. Highly recommend this motor licence shop!”',
    rating: 5,
    reviewDate: '2025-12-23',
    relativeDate: '8 months ago',
    metadata: '6 reviews, 8 months ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 6
  },
  {
    name: 'GNANESH V',
    text: 'Great experience ,teaching and dl issue process were done seamlessly from start to finish would definitely recommend anyone who is trying to learn and get a license',
    rating: 5,
    reviewDate: '2026-03-23',
    relativeDate: '5 months ago',
    metadata: '1 review, 5 months ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 1
  },
  {
    name: 'Swapna Harish',
    text: 'Most recommended driving school. Specia” Thank you to my guru - Ramu sir”. Classes were organised as per our convenience . Easily learnable and instructor was polite.',
    rating: 5,
    reviewDate: '2025-11-23',
    relativeDate: '9 months ago',
    metadata: '12 reviews, 3 photos, 9 months ago, 1 reaction.',
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 12
  },
  {
    name: 'Chai Thara',
    text: 'Had very good experience, taught 4 wheeler driving very well and patiently, DL is done very quick and nice work.\nThank you',
    rating: 5,
    reviewDate: '2026-04-23',
    relativeDate: '4 months ago',
    metadata: '2 reviews, 4 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 2
  },
  {
    name: 'Saroj Seain',
    text: 'My experience with Sri Sagar Motor Driving school was awesome. They are very flexible and always adjust with your availability. Right from day 1 until your driving test they will always guide you and will make sure you sail through the …More',
    rating: 5,
    reviewDate: '2025-10-23',
    relativeDate: 'Edited 10 months ago',
    metadata: '3 reviews, Edited 10 months ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 3
  },
  {
    name: 'Tamilarasi K G',
    text: 'Excellent driving school, learnt in a short time, flexible timings and a very good coach Amala.',
    rating: 5,
    reviewDate: '2026-05-23',
    relativeDate: '3 months ago',
    metadata: '3 reviews, 3 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 3
  },
  {
    name: 'Sunil Kumar N',
    text: 'Nice co-ordination with customer and time time giving good updates and feedbacks\nOne of the best learning driving school and best cost driving school fees and …More',
    rating: 5,
    reviewDate: '2022-08-23',
    relativeDate: '4 years ago',
    metadata: '4 reviews, 1 photo, 4 years ago, 1 reaction, Photo 1 in review.',
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 4
  },
  {
    name: 'Theertha Kaveramma',
    text: '“I really enjoyed my classes at Sri Sagar Driving School. My instructor was calm, friendly, and explained everything clearly. They helped me overcome my fear of driving and made me feel comfortable on the road. Thank you for helping me get my license!”',
    rating: 5,
    reviewDate: '2025-10-23',
    relativeDate: '10 months ago',
    metadata: '6 reviews, 1 photo, 10 months ago, 2 reactions.',
    reactionCount: 2,
    hasPhoto: true,
    reviewCount: 6
  },
  {
    name: 'Savitha s',
    text: 'I had a good experience at Sagar Driving School. The trainer is good and patiently clarifies all your doubts. The licence procedure is handled smoothly by Mr. Raghu Sir, without any hassle. I would definitely recommend this driving school to anyone planning to join driving classes.',
    rating: 5,
    reviewDate: '2025-08-23',
    relativeDate: 'a year ago',
    metadata: '3 reviews, a year ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 3
  },
  {
    name: 'Ankush Kumar',
    text: 'I recently got my license, and i would definitely recommended this driving school. The owner is absolutely humble and deliver per promise. He will support u throughout the entire process. The fee is premium compare to other driving schools in this neighbourhood, keeping fee aside. You will surely be satisfied with end service.',
    rating: 5,
    reviewDate: '2025-08-23',
    relativeDate: 'a year ago',
    metadata: '9 reviews, a year ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 9
  },
  {
    name: 'Surya Chandra',
    text: 'Learning to drive with Sri Sagar Driving School was a wonderful experience. Mr. Raghu is not just a trainer, he is a true mentor on the road. He teaches with so much patience and calmness that even beginners feel comfortable and confident. …',
    rating: 5,
    reviewDate: '2025-09-23',
    relativeDate: '11 months ago',
    metadata: 'Local Guide, 13 reviews, 15 photos, 11 months ago, 1 reaction.',
    isLocalGuide: true,
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 13
  },
  {
    name: 'Momeen Mursaleen Khan',
    text: 'This is very good driving school. The driver is very friendly and they teach in very smooth manner\nThey have provided what they have told\nThank you sir',
    rating: 5,
    reviewDate: '2026-01-23',
    relativeDate: '7 months ago',
    metadata: '1 review, 7 months ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 1
  },
  {
    name: 'Raghavendra Upadhya',
    text: 'I had a wonderful experience with Sri Sagar driving school! They are professional, punctual, and truly committed to delivering the best service. The driving school lead by Mr. Raghu, who stands out with his calm and cool nature. He listens …',
    rating: 5,
    reviewDate: '2025-08-23',
    relativeDate: 'a year ago',
    metadata: 'Local Guide, 57 reviews, 11 photos, a year ago, 2 reactions.',
    isLocalGuide: true,
    reactionCount: 2,
    hasPhoto: true,
    reviewCount: 57
  },
  {
    name: 'Gonama Nageswara',
    text: 'Good Teaching techniques & excellent co ordination. I really loved the way of driving techniques & as well as timely response... Thank you',
    rating: 5,
    reviewDate: '2026-02-23',
    relativeDate: '6 months ago',
    metadata: 'Local Guide, 50 reviews, 9 photos, 6 months ago, 1 reaction.',
    isLocalGuide: true,
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 50
  },
  {
    name: 'Kavin.P',
    text: "The driving session taught me a lot. The trainer Ram sir is such a nice person. He taught me in a polite way without any tension. Whenever I made a mistake he corrected me without any harsh behavior. He always comes on time for every session. I strongly recommend for everyone and it's value for money.",
    rating: 5,
    reviewDate: '2025-08-23',
    relativeDate: 'a year ago',
    metadata: 'Local Guide, 4 reviews, 9 photos, a year ago, 3 reactions.',
    isLocalGuide: true,
    reactionCount: 3,
    hasPhoto: true,
    reviewCount: 4
  },
  {
    name: 'vinay kumar',
    text: 'Service is good . I would prefer providing my upcoming vehicles for rc renewal',
    rating: 5,
    reviewDate: '2026-05-23',
    relativeDate: '3 months ago',
    metadata: '6 reviews, 3 months ago, 2 reactions.',
    reactionCount: 2,
    reviewCount: 6
  },
  {
    name: 'Nithin N Reddy',
    text: 'Experience with this Driving School was very smooth and Comfortable. The trainer was polite and trust worthy. And the License also was Received very fast after the driving test with in a span of 20 days.\nSo Overall this School is Very good.',
    rating: 5,
    reviewDate: '2025-08-23',
    relativeDate: 'a year ago',
    metadata: '5 reviews, a year ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 5
  },
  {
    name: 'srirekha warrier',
    text: 'I had a wonderful experience with Sri Sagar Driving school. Raghu Sir was very supportive and helpful in each step of getting my DL. I highly recommend.',
    rating: 5,
    reviewDate: '2025-11-23',
    relativeDate: '9 months ago',
    metadata: '3 reviews, 1 photo, 9 months ago, 1 reaction.',
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 3
  },
  {
    name: 'SLIVER Pony',
    text: 'I had a wonderful experience with Sri Sagar Driving School! The trainers are very professional, patient, and made me feel comfortable right from the first day. They explained every detail clearly, gave me the confidence to drive, and guided …',
    rating: 5,
    reviewDate: '2025-08-23',
    relativeDate: 'a year ago',
    metadata: 'Local Guide, 1 review, a year ago, 1 reaction.',
    isLocalGuide: true,
    reactionCount: 1,
    reviewCount: 1
  },
  {
    name: 'Sathya Narayan',
    text: 'It was a great experience with Sri Sagar Driving School. The instructor was polite and trustworthy. Was on time. Mr Raghu was very helpful during classes and test drives at the rto . And the License also was Received very fast after the …',
    rating: 5,
    reviewDate: '2025-08-23',
    relativeDate: 'a year ago',
    metadata: 'Local Guide, 13 reviews, 60 photos, a year ago, 1 reaction.',
    isLocalGuide: true,
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 13
  },
  {
    name: 'Arun S',
    text: 'Had very good experience with sri sagar driving school and good teaching skills',
    rating: 5,
    reviewDate: '2026-03-23',
    relativeDate: '5 months ago',
    metadata: '3 reviews, 5 months ago, 1 reaction.',
    reactionCount: 1,
    reviewCount: 3
  },
  {
    name: 'Janardan Nayak R',
    text: 'Excellent Driving School..\n\nI had a fantastic experience with Sri Sagar Driving school! From day one, the …',
    rating: 5,
    reviewDate: '2025-08-23',
    relativeDate: 'a year ago',
    metadata: 'Local Guide, 10 reviews, 8 photos, a year ago, 1 reaction.',
    isLocalGuide: true,
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 10
  },
  {
    name: 'SUPRIYA NAGARAJ',
    text: 'I had a fantastic experience with this driving class! The instructor Mr.Ramu was incredibly patient, knowledgeable and always made sure I felt comfortable. The lessons were well-structured and covered everything from basic controls to real road conditions. I gained a lot of confidence and learned essential safe driving habits.',
    rating: 5,
    reviewDate: '2025-08-23',
    relativeDate: 'a year ago',
    metadata: '8 reviews, 1 photo, a year ago, 1 reaction.',
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 8
  },
  {
    name: 'Ashish Santhosh',
    text: 'The driving instructor and the manger of the school was really helpful. The instructor(Ramamurthy) was really good in giving tips and in communication. The manager Sagar really helped me in getting a slot for DL. Thank you all',
    rating: 5,
    reviewDate: '2025-08-23',
    relativeDate: 'a year ago',
    metadata: '7 reviews, 9 photos, a year ago, 1 reaction.',
    reactionCount: 1,
    hasPhoto: true,
    reviewCount: 7
  },
  {
    name: 'Ankith Bshetty',
    text: 'I had a very good experience with sri saga',
    rating: 5,
    reviewDate: '2026-01-15',
    relativeDate: '7 months ago',
    metadata: '1 review, 7 months ago',
    reviewCount: 1
  }
];

export async function runImport() {
  console.log(`Starting import of ${rawReviewsData.length} reviews...`);

  const records = rawReviewsData.map((item, index) => {
    // Unique deterministic id based on reviewer name and review index
    const deterministicId = generateDeterministicUUID(`sri-sagar-review-${index}-${item.name}`);
    return {
      id: deterministicId,
      customer_name: item.name,
      rating: item.rating || 5,
      review_text: item.text,
      review_date: item.reviewDate,
      featured: index < 6, // mark the first 6 as featured
      published: true,
    };
  });

  // Batch insert/upsert in chunks
  const chunkSize = 20;
  let totalImported = 0;

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error } = await supabaseAdmin
      .from('reviews')
      .upsert(chunk, { onConflict: 'id' });

    if (error) {
      console.error(`Error importing chunk ${i / chunkSize + 1}:`, error);
    } else {
      totalImported += chunk.length;
      console.log(`Successfully imported chunk ${i / chunkSize + 1} (${chunk.length} reviews). Total so far: ${totalImported}`);
    }
  }

  console.log(`Finished importing. Total records processed: ${totalImported} / ${records.length}`);
}

// If run directly via tsx/node
if (process.argv[1]?.includes('importReviews')) {
  runImport().catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  });
}
