import { CheckCircle2, Facebook, Instagram, LoaderCircle, Send, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { galleryImageUrl } from '@/lib/supabase';
import { GalleryPhoto } from '@/lib/types';

interface SocialHistoryViewProps {
  photos: GalleryPhoto[];
  onOpenPublish: (photo: GalleryPhoto) => void;
  onRetry: (photo: GalleryPhoto, platform: 'instagram' | 'facebook') => Promise<void>;
  retryingPlatform: { photoId: string; platform: 'instagram' | 'facebook' } | null;
}

export function SocialHistoryView({
  photos,
  onOpenPublish,
  onRetry,
  retryingPlatform,
}: SocialHistoryViewProps) {
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'instagram' | 'facebook'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'failed' | 'unposted'>('all');

  const filteredPhotos = photos.filter((photo) => {
    // Platform match
    const hasIg = photo.instagram_status && photo.instagram_status !== 'pending';
    const hasFb = photo.facebook_status && photo.facebook_status !== 'pending';

    if (filterPlatform === 'instagram' && !hasIg && filterStatus !== 'unposted') return false;
    if (filterPlatform === 'facebook' && !hasFb && filterStatus !== 'unposted') return false;

    // Status match
    if (filterStatus === 'published') {
      return photo.instagram_status === 'published' || photo.facebook_status === 'published';
    }
    if (filterStatus === 'failed') {
      return photo.instagram_status === 'failed' || photo.facebook_status === 'failed';
    }
    if (filterStatus === 'unposted') {
      return !photo.instagram_status && !photo.facebook_status;
    }
    return true;
  });

  return (
    <div className="rounded-2xl border border-[#e2e0db] bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-black/5 pb-4">
        <div>
          <h3 className="font-display text-base font-extrabold text-[#0a1628]">Publishing Activity & History</h3>
          <p className="text-xs text-slate-500">Track and manage Instagram & Facebook post deliverables</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value as 'all' | 'instagram' | 'facebook')}
            className="rounded-lg border border-[#e2e0db] bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'failed' | 'unposted')}
            className="rounded-lg border border-[#e2e0db] bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="failed">Failed / Alert</option>
            <option value="unposted">Unposted</option>
          </select>
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e2e0db] p-8 text-center text-xs text-slate-500 my-4">
          No records match the selected filters.
        </div>
      ) : (
        <div className="mt-4 divide-y divide-black/5">
          {filteredPhotos.map((photo) => {
            const isIgRetrying = retryingPlatform?.photoId === photo.id && retryingPlatform?.platform === 'instagram';
            const isFbRetrying = retryingPlatform?.photoId === photo.id && retryingPlatform?.platform === 'facebook';

            return (
              <div key={photo.id} className="py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Photo & Caption Details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <img
                    src={galleryImageUrl(photo.storage_path)}
                    alt={photo.title}
                    className="h-16 w-16 rounded-xl object-cover border border-[#e2e0db] shrink-0 bg-slate-100"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {photo.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(photo.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#0a1628] truncate mt-0.5">{photo.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {photo.caption || photo.description || 'No custom caption'}
                    </p>
                  </div>
                </div>

                {/* Status Badges & Quick Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Instagram Badge */}
                  <div className="flex items-center gap-1.5 rounded-xl border border-[#e2e0db] bg-[#faf9f6] px-3 py-1.5">
                    <Instagram size={14} className="text-pink-600" />
                    <span className="text-xs font-bold">IG:</span>
                    {photo.instagram_status === 'published' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={12} className="text-emerald-600" /> Done
                      </span>
                    ) : photo.instagram_status === 'publishing' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                        <LoaderCircle className="animate-spin" size={12} /> Syncing
                      </span>
                    ) : photo.instagram_status === 'failed' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-red-600 flex items-center gap-0.5">
                          <ShieldAlert size={12} /> Fail
                        </span>
                        <button
                          type="button"
                          disabled={isIgRetrying}
                          onClick={() => void onRetry(photo, 'instagram')}
                          className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-red-500"
                        >
                          {isIgRetrying ? <LoaderCircle className="animate-spin" size={10} /> : 'Retry'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Not posted</span>
                    )}
                  </div>

                  {/* Facebook Badge */}
                  <div className="flex items-center gap-1.5 rounded-xl border border-[#e2e0db] bg-[#faf9f6] px-3 py-1.5">
                    <Facebook size={14} className="text-blue-600" />
                    <span className="text-xs font-bold">FB:</span>
                    {photo.facebook_status === 'published' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={12} className="text-emerald-600" /> Done
                      </span>
                    ) : photo.facebook_status === 'publishing' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                        <LoaderCircle className="animate-spin" size={12} /> Syncing
                      </span>
                    ) : photo.facebook_status === 'failed' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-red-600 flex items-center gap-0.5">
                          <ShieldAlert size={12} /> Fail
                        </span>
                        <button
                          type="button"
                          disabled={isFbRetrying}
                          onClick={() => void onRetry(photo, 'facebook')}
                          className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-red-500"
                        >
                          {isFbRetrying ? <LoaderCircle className="animate-spin" size={10} /> : 'Retry'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Not posted</span>
                    )}
                  </div>

                  {/* Open Publish Button */}
                  <button
                    type="button"
                    onClick={() => onOpenPublish(photo)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#0a1628] px-3 py-1.5 text-xs font-bold text-white hover:bg-black transition"
                  >
                    <Send size={12} /> Publish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
