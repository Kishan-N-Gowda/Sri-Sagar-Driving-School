import { createClient } from '@supabase/supabase-js';

export const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://wcurzjcdqxkahcardcyi.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_2PguQk3d0whzDe5_qGT7Bg__jyyWdgS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function whatsappUrl(phone: string, message: string): string {
  const normalized = phone.replace(/[^0-9]/g, '').replace(/^0+/, '');
  const international = normalized.startsWith('91') ? normalized : `91${normalized}`;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}

export function phoneUrl(phone: string): string {
  const normalized = phone.replace(/[^0-9+]/g, '');
  return `tel:${normalized.startsWith('+') ? normalized : `+${normalized}`}`;
}

export function galleryImageUrl(storagePath: string | null | undefined): string {
  if (!storagePath || typeof storagePath !== 'string') return '';
  const trimmed = storagePath.trim();
  if (!trimmed) return '';

  // 1. Direct absolute URLs (HTTP/HTTPS, Data URI, Blob)
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // 2. Direct local root-relative /images/... path - MUST return unchanged!
  if (trimmed.startsWith('/images/')) {
    return trimmed;
  }

  // 3. Local relative path (e.g. 'images/filename.webp')
  if (trimmed.startsWith('images/')) {
    return `/${trimmed}`;
  }

  // 4. Other root-relative paths (e.g. /assets/...)
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // 5. Check if it is a bare filename in public/images/
  const knownLocalFiles = [
    'backroundimage.jpeg',
    'gellery1.jpeg',
    'gellery3.jpeg',
    'gellery4.jpeg',
    'gellery5.jpeg',
    'gellery6.jpeg',
    'gellery7.jpeg',
    'gellery8.jpeg',
    'hero-school-focused.jpg',
    'hero-school.jpg',
    'hero-school.png',
    'hero-school.webp',
    'owner.webp',
    'real-school-hero.jpg',
    'real-school-hero.png',
    'real-school-hero.webp',
    'sri-sagar-driving-school-branch.jpg',
    'sri-sagar-driving-school-branch.webp',
    'sri-sagar-driving-school-sanjay-nagar-bangalore-motor-training-schools-r1kvfz4wp4.avif',
    'sri-sagar-motor-driving-school-sanjay-nagar-bangalore-motor-training-schools-for-two-wheeler-23rAhGk1hL-250.jpg',
    'sri-sagar-motor-driving-school-sanjay-nagar-bangalore-motor-training-schools-for-two-wheeler-NqMWCOr0zf.avif',
    'sri-sagar-motor-driving-school-two-wheeler.jpg',
    'sri-sagar-motor-driving-school-two-wheeler.webp',
    'unnamed (1).webp',
    'unnamed (2).webp',
    'unnamed (3).webp',
    'unnamed (5).webp',
    'unnamed (8).webp',
    'unnamed-1.webp',
    'unnamed-2.webp',
    'unnamed-3.webp',
    'unnamed-5.webp',
    'unnamed-8.webp',
    'unnamed.webp',
  ];

  const cleanFilename = trimmed.replace(/^\/+/, '').replace(/^images\//, '');
  if (knownLocalFiles.includes(cleanFilename)) {
    return `/images/${cleanFilename}`;
  }

  // 6. Supabase Storage bucket object path for dynamically uploaded photos (e.g. uuid.jpg)
  let cleanPath = trimmed.replace(/^\/+/, '');
  if (cleanPath.startsWith('gallery/')) {
    cleanPath = cleanPath.substring('gallery/'.length);
  }

  try {
    const { data } = supabase.storage.from('gallery').getPublicUrl(cleanPath);
    if (data?.publicUrl) return data.publicUrl;
  } catch {
    // fallback if supabase client storage call fails
  }

  const base = supabaseUrl.replace(/\/+$/, '');
  return `${base}/storage/v1/object/public/gallery/${cleanPath}`;
}

export function extractGalleryStorageKey(storagePath: string | null | undefined): string | null {
  if (!storagePath || typeof storagePath !== 'string') return null;
  const trimmed = storagePath.trim();
  if (!trimmed) return null;

  // Local assets are NOT Supabase storage objects
  if (trimmed.startsWith('/images/') || trimmed.startsWith('images/')) {
    return null;
  }

  // 1. If it is a Supabase Storage URL (e.g. https://<supabase>/storage/v1/object/public/gallery/path/to/image.jpg)
  const supabaseStoragePrefixRegex = /^https?:\/\/[^/]+\/storage\/v1\/object\/(?:public|sign|authenticated)\/gallery\/(.+)$/i;
  const match = trimmed.match(supabaseStoragePrefixRegex);
  if (match && match[1]) {
    const rawKey = match[1].split('?')[0].replace(/^\/+/, '');
    return rawKey ? decodeURIComponent(rawKey) : null;
  }

  // 2. Generic check if it's a URL containing /gallery/
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.includes('/storage/v1/object/')) {
      const parts = trimmed.split(/\/gallery\//i);
      if (parts.length > 1) {
        const rawKey = parts.slice(1).join('/gallery/').split('?')[0].replace(/^\/+/, '');
        if (rawKey) return decodeURIComponent(rawKey);
      }
    }
    // External third-party URL (e.g. Unsplash)
    return null;
  }

  // 3. Relative paths: remove leading slashes and leading 'gallery/' bucket prefix if present
  let clean = trimmed.replace(/^\/+/, '');
  if (clean.toLowerCase().startsWith('gallery/')) {
    clean = clean.substring('gallery/'.length).replace(/^\/+/, '');
  }

  return clean || null;
}
