import { AlertCircle, Check, LoaderCircle, Pencil, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { galleryImageUrl, supabase } from '@/lib/supabase';
import { GalleryPhoto } from '@/lib/types';

interface EditCaptionModalProps {
  photo: GalleryPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCaptionModal({ photo, isOpen, onClose, onSuccess }: EditCaptionModalProps) {
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (photo) {
      setCaption(photo.caption || photo.description || photo.title);
      setError(null);
    }
  }, [photo]);

  if (!isOpen || !photo) return null;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('gallery_photos')
        .update({ caption: caption.trim() })
        .eq('id', photo.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update caption');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-3xl bg-[#0a1628] text-white shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#0c1b30]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c1272d] text-white">
              <Pencil size={14} />
            </span>
            <h3 className="font-display text-base font-extrabold text-white">Edit Social Media Caption</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
            <img
              src={galleryImageUrl(photo.storage_path)}
              alt={photo.title}
              className="h-14 w-14 rounded-lg object-cover bg-black/50"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-white truncate">{photo.title}</h4>
              <p className="text-[10px] text-slate-400">{photo.category}</p>
            </div>
          </div>

          <div>
            <label htmlFor="edit-caption-text" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Caption
            </label>
            <textarea
              id="edit-caption-text"
              rows={4}
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#c1272d] focus:ring-1 focus:ring-[#c1272d] focus:outline-none leading-relaxed"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 p-3 text-xs text-red-300">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c1272d] px-5 py-2 text-xs font-bold text-white hover:bg-[#a51f25] transition disabled:opacity-50"
            >
              {saving ? <LoaderCircle className="animate-spin" size={14} /> : <Check size={14} />}
              Save Caption
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
