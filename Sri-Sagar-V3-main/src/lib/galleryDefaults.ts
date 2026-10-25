import { GalleryPhoto } from './types';

const STORAGE_KEY_DELETED_PHOTOS = 'sri_sagar_deleted_gallery_photo_ids';

export const defaultHardcodedPhotos: GalleryPhoto[] = [
  {
    id: 'gallery-photo-gellery1',
    storage_path: '/images/gellery1.jpeg',
    title: 'Sri Sagar Motor Driving School',
    description: 'Training and instruction at Sri Sagar Driving School, Bhadrappa Layout, Bengaluru.',
    caption: 'Sri Sagar Driving School — Bhadrappa Layout & Sanjay Nagar, Bengaluru.',
    category: 'Training',
    published: true,
    created_at: new Date('2026-08-31T19:24:00Z').toISOString(),
  },
  {
    id: 'gallery-photo-gellery3',
    storage_path: '/images/gellery3.jpeg',
    title: 'Sri Sagar Motor Driving School',
    description: 'Motor driving training and facilities at Sri Sagar Driving School, Bengaluru.',
    caption: 'Sri Sagar Driving School — Bhadrappa Layout & Sanjay Nagar, Bengaluru.',
    category: 'Training',
    published: true,
    created_at: new Date('2026-08-31T19:31:00Z').toISOString(),
  },
  {
    id: 'gallery-photo-gellery4',
    storage_path: '/images/gellery4.jpeg',
    title: 'Sri Sagar Motor Driving School',
    description: 'Practical driving lessons and instruction at Sri Sagar Driving School.',
    caption: 'Sri Sagar Driving School — Bhadrappa Layout & Sanjay Nagar, Bengaluru.',
    category: 'Training',
    published: true,
    created_at: new Date('2026-08-31T19:40:00Z').toISOString(),
  },
  {
    id: 'gallery-photo-gellery5',
    storage_path: '/images/gellery5.jpeg',
    title: 'Sri Sagar Motor Driving School',
    description: 'Fleet and training vehicles at Sri Sagar Driving School.',
    caption: 'Sri Sagar Driving School — Bhadrappa Layout & Sanjay Nagar, Bengaluru.',
    category: 'Training',
    published: true,
    created_at: new Date('2026-08-31T19:41:00Z').toISOString(),
  },
  {
    id: 'gallery-photo-gellery6',
    storage_path: '/images/gellery6.jpeg',
    title: 'Sri Sagar Motor Driving School',
    description: 'Driver training sessions and guidance by certified instructors.',
    caption: 'Sri Sagar Driving School — Bhadrappa Layout & Sanjay Nagar, Bengaluru.',
    category: 'Training',
    published: true,
    created_at: new Date('2026-08-31T19:42:00Z').toISOString(),
  },
  {
    id: 'gallery-photo-gellery7',
    storage_path: '/images/gellery7.jpeg',
    title: 'Sri Sagar Motor Driving School',
    description: 'Driving school facilities and RTO assistance services.',
    caption: 'Sri Sagar Driving School — Bhadrappa Layout & Sanjay Nagar, Bengaluru.',
    category: 'Training',
    published: true,
    created_at: new Date('2026-08-31T19:43:00Z').toISOString(),
  },
  {
    id: 'gallery-photo-gellery8',
    storage_path: '/images/gellery8.jpeg',
    title: 'Sri Sagar Motor Driving School',
    description: 'Hands-on practical driving training on Bangalore roads.',
    caption: 'Sri Sagar Driving School — Bhadrappa Layout & Sanjay Nagar, Bengaluru.',
    category: 'Training',
    published: true,
    created_at: new Date('2026-08-31T19:44:00Z').toISOString(),
  },
  {
    id: 'gallery-photo-gellery2',
    storage_path: '/images/gellery2.jpeg',
    title: 'Sri Sagar Motor Driving School',
    description: 'Practical driving lessons and school facilities at Sri Sagar Driving School.',
    caption: 'Sri Sagar Driving School — Bhadrappa Layout & Sanjay Nagar, Bengaluru.',
    category: 'Training',
    published: true,
    created_at: new Date('2026-08-31T19:45:00Z').toISOString(),
  },
];

export const permanentlyRemovedPhotoKeys: string[] = [
  '56e09125-0dc8-45e6-9b5c-1c0a5fc50e52',
  '7bf19ced-7d11-4825-9e67-3ecf632a5184',
  '9023070d-a136-4a70-a693-f3c31a8ab577-unnamed--6-.webp',
  '6a520748-382c-4597-9f4b-d6bc355d866d-screenshot-2026-08-23-003459.png',
  '6a520748-382c-4597-9f4b-d6bc355d866d-Screenshot-2026-08-23-003459.png',
  'screenshot 2026-08-23 003459.png',
  'screenshot-2026-08-23-003459.png',
  'screenshot-2026-08-23-003459',
  'unnamed--6-.webp',
  'unnamed-6.webp',
  'unnamed (6).webp',
  'canonical:owner',
  'canonical:unnamed-base',
  'owner',
  'ai'
];

export function getDeletedPhotoIds(): string[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_DELETED_PHOTOS) : null;
    const userDeleted = raw ? JSON.parse(raw) : [];
    const userDeletedList = Array.isArray(userDeleted) ? userDeleted : [];
    return Array.from(new Set([...permanentlyRemovedPhotoKeys, ...userDeletedList]));
  } catch {
    return [...permanentlyRemovedPhotoKeys];
  }
}

/**
 * Returns a stable canonical identity for any photo storage path, URL, or alias.
 * This guarantees that distinct filenames referencing the same physical photograph
 * (e.g. `unnamed (1).webp` ↔ `unnamed-1.webp` or `uuid-unnamed--2-.jpg` ↔ `unnamed-2.webp`)
 * resolve to the exact same canonical key.
 */
export function getCanonicalPhotoKey(storagePathOrId?: string | null): string {
  if (!storagePathOrId) return '';
  let raw = String(storagePathOrId).trim();

  // Extract storage object name if it is a Supabase storage URL
  const urlMatch = raw.match(/\/gallery\/([^?#]+)/i);
  if (urlMatch) {
    raw = urlMatch[1];
  }
  raw = raw.split('?')[0].split('#')[0];
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // Ignore decode error
  }

  let clean = raw
    .replace(/^https?:\/\/[^/]+\//, '')
    .replace(/^\/+/, '')
    .replace(/^images\//i, '')
    .replace(/^gallery\//i, '')
    .toLowerCase();

  // Strip UUID prefix if present (e.g. 5184faa1-2c39-4310-9dd9-a40bb9b529c1-unnamed--2-.jpg)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.+)$/i;
  const uuidMatch = clean.match(uuidRegex);
  if (uuidMatch) {
    clean = uuidMatch[1];
  }

  // Canonical groupings for verified equivalent photographic assets
  if (
    /unnamed.*1\.(webp|jpg|jpeg|png|avif)$/i.test(clean) ||
    clean.includes('unnamed--1-') ||
    clean.includes('unnamed (1)') ||
    clean.includes('unnamed-1')
  ) {
    return 'canonical:onroad-guidance-1';
  }
  if (
    /unnamed.*2\.(webp|jpg|jpeg|png|avif)$/i.test(clean) ||
    clean.includes('unnamed--2-') ||
    clean.includes('unnamed (2)') ||
    clean.includes('unnamed-2')
  ) {
    return 'canonical:dual-control-car-2';
  }
  if (
    /unnamed.*3\.(webp|jpg|jpeg|png|avif)$/i.test(clean) ||
    clean.includes('unnamed--3-') ||
    clean.includes('unnamed (3)') ||
    clean.includes('unnamed-3')
  ) {
    return 'canonical:student-success-3';
  }
  if (
    /unnamed.*5\.(webp|jpg|jpeg|png|avif)$/i.test(clean) ||
    clean.includes('unnamed--5-') ||
    clean.includes('unnamed (5)') ||
    clean.includes('unnamed-5')
  ) {
    return 'canonical:practical-session-5';
  }
  if (
    /unnamed.*8\.(webp|jpg|jpeg|png|avif)$/i.test(clean) ||
    clean.includes('unnamed--8-') ||
    clean.includes('unnamed (8)') ||
    clean.includes('unnamed-8')
  ) {
    return 'canonical:graduate-dl-8';
  }
  if (clean.includes('branch') || clean.includes('r1kvfz4wp4')) {
    return 'canonical:school-branch';
  }
  if (clean.includes('23rahgk1hl-250')) {
    return 'canonical:two-wheeler-250';
  }
  if (clean.includes('two-wheeler') || clean.includes('nqmwcor0zf')) {
    return 'canonical:motor-training-two-wheeler';
  }
  if (clean.includes('hero-school') || clean.includes('real-school-hero')) {
    return 'canonical:school-hero';
  }
  if (clean.includes('owner')) {
    return 'canonical:owner';
  }
  if (clean === 'unnamed.webp' || clean === 'unnamed.jpg' || clean === 'unnamed.png') {
    return 'canonical:unnamed-base';
  }

  return clean;
}

export function isPhotoDeleted(photo: GalleryPhoto, deletedIds: string[]): boolean {
  if (deletedIds.includes(photo.id)) return true;
  if (photo.storage_path && deletedIds.includes(photo.storage_path)) return true;
  const canonicalKey = getCanonicalPhotoKey(photo.storage_path || photo.id);
  if (canonicalKey && deletedIds.includes(canonicalKey)) return true;
  return false;
}

export function markPhotoAsDeleted(idOrPath: string): void {
  try {
    const current = getDeletedPhotoIds();
    const toAdd = [idOrPath];
    const canonical = getCanonicalPhotoKey(idOrPath);
    if (canonical) toAdd.push(canonical);

    const next = Array.from(new Set([...current, ...toAdd]));
    localStorage.setItem(STORAGE_KEY_DELETED_PHOTOS, JSON.stringify(next));
  } catch (e) {
    console.warn('Failed to persist deleted photo id:', e);
  }
}

export function getActiveHardcodedPhotos(): GalleryPhoto[] {
  const deleted = getDeletedPhotoIds();
  return defaultHardcodedPhotos.filter((p) => !isPhotoDeleted(p, deleted));
}

/**
 * Deduplicates and merges local default photos and Supabase database photos.
 * Ensures that each unique photograph appears EXACTLY ONCE.
 */
export function mergeAndDeduplicatePhotos(
  localPhotos: GalleryPhoto[],
  dbPhotos: GalleryPhoto[]
): GalleryPhoto[] {
  const deletedIds = getDeletedPhotoIds();

  // Filter out any deleted or unpublished photos
  const validDbPhotos = dbPhotos.filter(
    (dp) => dp.published !== false && !isPhotoDeleted(dp, deletedIds)
  );
  const validLocalPhotos = localPhotos.filter(
    (lp) => lp.published !== false && !isPhotoDeleted(lp, deletedIds)
  );

  const photoMap = new Map<string, GalleryPhoto>();

  // 1. Add valid local default photos first (retaining reliable local /images/ paths and rich descriptions)
  for (const localPhoto of validLocalPhotos) {
    const key = getCanonicalPhotoKey(localPhoto.storage_path || localPhoto.id);
    if (key && !photoMap.has(key)) {
      photoMap.set(key, localPhoto);
    }
  }

  // 2. Process database photos
  for (const dbPhoto of validDbPhotos) {
    const key = getCanonicalPhotoKey(dbPhoto.storage_path || dbPhoto.id);
    if (!key) continue;

    if (!photoMap.has(key)) {
      // New distinct upload from DB (not matching any local default photo)
      photoMap.set(key, dbPhoto);
    } else {
      // If DB has an updated custom title or caption that is not a single placeholder dot, enrich the existing record
      const existing = photoMap.get(key)!;
      const hasMeaningfulTitle = dbPhoto.title && dbPhoto.title.trim() !== '.' && dbPhoto.title.trim() !== '';
      const hasMeaningfulCaption = dbPhoto.caption && dbPhoto.caption.trim() !== '.' && dbPhoto.caption.trim() !== '';

      if (hasMeaningfulTitle || hasMeaningfulCaption) {
        photoMap.set(key, {
          ...existing,
          title: hasMeaningfulTitle ? dbPhoto.title : existing.title,
          caption: hasMeaningfulCaption ? dbPhoto.caption : existing.caption,
          category: dbPhoto.category || existing.category,
        });
      }
    }
  }

  return Array.from(photoMap.values());
}
