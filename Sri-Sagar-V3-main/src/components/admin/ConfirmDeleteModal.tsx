import React from 'react';
import { AlertTriangle, LoaderCircle, Trash2, X } from 'lucide-react';
import { GalleryPhoto } from '@/lib/types';
import { galleryImageUrl } from '@/lib/supabase';

interface ConfirmDeleteModalProps {
  photo: GalleryPhoto | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  photo,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!isOpen || !photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onClick={() => {
        if (!isDeleting) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={isDeleting}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-50"
          aria-label="Cancel deletion"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1 pr-4">
            <h3 id="delete-dialog-title" className="font-display text-base sm:text-lg font-bold text-slate-900">
              Delete Photo?
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800 font-semibold">"{photo.title || 'this photo'}"</strong>?
            </p>
          </div>
        </div>

        {/* Thumbnail Preview */}
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 border border-slate-200/80">
          <img
            src={galleryImageUrl(photo.storage_path)}
            alt={photo.title}
            className="h-14 w-14 rounded-lg object-cover bg-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-slate-800">{photo.title}</span>
            <span className="block text-[11px] text-slate-500 font-medium">Category: {photo.category}</span>
            <span className="block text-[10px] text-slate-400">
              {new Date(photo.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-red-600 font-medium">
          This photo will be permanently removed from the website gallery and database.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-[0.98] transition disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="animate-spin" size={14} /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} /> Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
