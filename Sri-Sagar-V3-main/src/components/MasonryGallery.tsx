import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { galleryImageUrl } from '@/lib/supabase';
import { GalleryPhoto } from '@/lib/types';

interface MasonryGalleryProps {
  images: GalleryPhoto[];
  onSelectImage: (originalIndex: number) => void;
  variant?: 'homepage-asymmetric' | 'full-gallery';
}

function GalleryCard({
  img,
  originalIndex,
  onSelectImage,
  customClass = '',
}: {
  img: GalleryPhoto;
  originalIndex: number;
  onSelectImage: (idx: number) => void;
  customClass?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const resolvedUrl = galleryImageUrl(img.storage_path);
  const [imgSrc, setImgSrc] = useState(resolvedUrl);

  // Sync state whenever img.storage_path or img.id changes
  useEffect(() => {
    const nextUrl = galleryImageUrl(img.storage_path);
    setImgSrc(nextUrl);
  }, [img.storage_path, img.id]);

  const handleError = () => {
    const raw = (img.storage_path || '').trim();
    const cleanFilename = raw.replace(/^\/+/, '').replace(/^images\//, '');
    
    // If not already pointing to direct /images/<cleanFilename>, try it
    if (cleanFilename && !imgSrc.endsWith(`/images/${cleanFilename}`)) {
      setImgSrc(`/images/${cleanFilename}`);
      return;
    }
    setLoaded(true);
  };

  return (
    <button
      type="button"
      onClick={() => onSelectImage(originalIndex)}
      className={`group relative block w-full overflow-hidden rounded-[22px] bg-[#0a1628] text-left transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#c1272d] cursor-pointer ${customClass}`}
      aria-label={`View photo: ${img.title || 'Training photo'}`}
    >
      <img
        src={imgSrc}
        alt={img.title || 'Sri Sagar Driving School Training Photo'}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: 'contain',
          borderRadius: '22px',
        }}
        className={`w-full h-auto block object-contain rounded-[22px] transition-transform duration-500 ease-out group-hover:scale-[1.02] ${
          loaded ? 'opacity-100' : 'opacity-90'
        }`}
      />

      {/* Category Pill */}
      {img.category && (
        <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-10 opacity-90 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="rounded-full bg-[#0a1628]/85 text-white backdrop-blur-xs px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-bold font-sans tracking-wide uppercase shadow-sm border border-white/15">
            {img.category}
          </span>
        </div>
      )}

      {/* Subtle Caption Overlay on Hover */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end bg-gradient-to-t from-[#0a1628]/95 via-[#0a1628]/60 to-transparent p-3 sm:p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none rounded-b-[22px]">
        <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold font-sans text-white leading-snug">
          <ArrowUpRight size={15} className="shrink-0 text-[#c1272d]" />
          <span className="line-clamp-1">{img.title || img.caption || 'Sri Sagar Driving School'}</span>
        </span>
      </div>
    </button>
  );
}

export default function MasonryGallery({
  images,
  onSelectImage,
}: MasonryGalleryProps) {
  if (!images || images.length === 0) return null;

  // Mobile / Tablet 2-column distribution
  const mobileCols: { photo: GalleryPhoto; origIndex: number }[][] = [[], []];
  images.forEach((photo, idx) => {
    mobileCols[idx % 2].push({ photo, origIndex: idx });
  });

  // Desktop 3-column (or 2-column if < 3 images) distribution
  const desktopColCount = images.length >= 3 ? 3 : 2;
  const desktopCols: { photo: GalleryPhoto; origIndex: number }[][] = Array.from(
    { length: desktopColCount },
    () => []
  );
  images.forEach((photo, idx) => {
    desktopCols[idx % desktopColCount].push({ photo, origIndex: idx });
  });

  return (
    <div className="w-full">
      {/* Mobile & Tablet View: 2 Independent Columns with 16px Gaps */}
      <div className="flex lg:hidden items-start gap-4 w-full">
        {mobileCols.map((col, colIdx) => (
          <div
            key={`mobile-col-${colIdx}`}
            className="flex-1 min-w-0 flex flex-col gap-4"
          >
            {col.map(({ photo, origIndex }) => (
              <GalleryCard
                key={photo.id || `m-img-${origIndex}`}
                img={photo}
                originalIndex={origIndex}
                onSelectImage={onSelectImage}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Desktop View: Responsive Multi-Column Masonry with 16px Gaps */}
      <div className="hidden lg:flex items-start gap-4 xl:gap-5 w-full">
        {desktopCols.map((col, colIdx) => (
          <div
            key={`desktop-col-${colIdx}`}
            className="flex-1 min-w-0 flex flex-col gap-4 xl:gap-5"
          >
            {col.map(({ photo, origIndex }) => (
              <GalleryCard
                key={photo.id || `d-img-${origIndex}`}
                img={photo}
                originalIndex={origIndex}
                onSelectImage={onSelectImage}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


