export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type GalleryCategory = 'Training' | 'Vehicles' | 'Students' | 'Branches' | 'School';
export type SocialPublishStatus = 'pending' | 'publishing' | 'published' | 'failed' | null;

export interface Appointment {
  id: string;
  appointment_id: string;
  name: string;
  phone: string;
  email: string | null;
  course: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: AppointmentStatus;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  storage_path: string;
  title: string;
  description: string | null;
  caption?: string | null;
  category: GalleryCategory;
  published: boolean;
  instagram_status?: SocialPublishStatus;
  instagram_post_id?: string | null;
  instagram_error?: string | null;
  instagram_published_at?: string | null;
  facebook_status?: SocialPublishStatus;
  facebook_post_id?: string | null;
  facebook_error?: string | null;
  facebook_published_at?: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  review_date: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: boolean;
  business_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  opening_hours: string;
  instagram_url: string | null;
  facebook_url: string | null;
  google_maps_url: string;
  google_reviews_url: string;
  social_auto_publish?: boolean;
  social_auto_publish_instagram?: boolean;
  social_auto_publish_facebook?: boolean;
  updated_at: string;
}

export interface SocialMediaPost {
  id: string;
  gallery_photo_id: string;
  caption: string | null;
  instagram_status: SocialPublishStatus;
  facebook_status: SocialPublishStatus;
  instagram_media_id?: string | null;
  facebook_post_id?: string | null;
  instagram_error?: string | null;
  facebook_error?: string | null;
  published_at?: string | null;
  instagram_published_at?: string | null;
  facebook_published_at?: string | null;
  created_at: string;
  updated_at: string;
  gallery_photo?: GalleryPhoto | null;
}

export const courses = [
  'Car Driving Classes (Four-Wheeler)',
  'Two-Wheeler Driving Classes',
  'Motor Training (Beginner Course)',
  'Heavy Vehicle Driving Classes',
  'Driving License Consultation',
  'RTO Consultation',
  'Driving License Consultant Services',
  'International Driving License Assistance',
  'Refresher Driving Course',
  'Other',
] as const;

export const timeSlots = [
  '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM',
] as const;
