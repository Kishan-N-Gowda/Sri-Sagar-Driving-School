import { AlertCircle, CheckCircle2, Facebook, ImagePlus, LoaderCircle, Send, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { publishFacebookPost } from '@/lib/facebookPublisher';
import { galleryImageUrl, supabase } from '@/lib/supabase';

interface FacebookQuickPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FacebookQuickPostModal({ isOpen, onClose, onSuccess }: FacebookQuickPostModalProps) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishedPostId, setPublishedPostId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClearImage = () => {
    setFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById('fb-quick-file') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setErrorMessage('Please enter a message for your Facebook post.');
      return;
    }

    setPublishing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPublishedPostId(null);

    let publicImageUrl: string | null = null;

    try {
      // 1. If an image file was selected, upload it to public storage to obtain a public HTTPS URL
      if (file) {
        const path = `fb-posts/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
        const uploadResult = await supabase.storage.from('gallery').upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

        if (uploadResult.error) {
          throw new Error(`Failed to upload image: ${uploadResult.error.message}`);
        }

        publicImageUrl = galleryImageUrl(path);
      }

      // 2. Call the deployed Supabase Edge Function `publish-facebook-post`
      const result = await publishFacebookPost({
        message: trimmedMessage,
        imageUrl: publicImageUrl,
      });

      if (result.success) {
        setSuccessMessage('Published successfully to Facebook.');
        setPublishedPostId(result.postId || null);
        setMessage('');
        handleClearImage();
        onSuccess?.();
      } else {
        setErrorMessage(result.error || 'Failed to publish to Facebook. Please try again.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred while publishing to Facebook.');
    } finally {
      setPublishing(false);
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#0c1b30]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-xs">
              <Facebook size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-extrabold text-white">Publish to Facebook Page</h3>
              <p className="text-[11px] text-slate-400">Post text & photos to Sri Sagar Driving School Page</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Post text message */}
          <div>
            <label htmlFor="fb-post-message" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Post Message / Caption <span className="text-red-400">*</span>
            </label>
            <textarea
              id="fb-post-message"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like to share on Facebook? (e.g. New driving batches, test pass announcements, admission offers...)"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Optional Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Attach Image (Optional)
            </label>

            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/15 rounded-xl p-4 cursor-pointer hover:border-[#1877F2]/50 hover:bg-white/5 transition">
                <ImagePlus size={24} className="text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-300">Click to select photo</span>
                <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP (Uploaded to public HTTPS storage)</span>
                <input
                  id="fb-quick-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-xl border border-white/10 bg-white/5 p-2 flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="h-16 w-16 rounded-lg object-cover bg-black/40 border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{file?.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''} · Attached
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="rounded-lg bg-white/10 p-2 text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-950/40 border border-red-800/40 p-3.5 text-xs text-red-300">
              <AlertCircle size={17} className="shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-800/40 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>{successMessage}</span>
              </div>
              {publishedPostId && (
                <p className="text-[10px] text-slate-400 font-mono">Post ID: {publishedPostId}</p>
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={publishing || !message.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#166fe5] transition disabled:opacity-50 shadow-md"
            >
              {publishing ? (
                <>
                  <LoaderCircle className="animate-spin" size={15} />
                  <span>Publishing to Facebook...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Publish to Facebook</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
