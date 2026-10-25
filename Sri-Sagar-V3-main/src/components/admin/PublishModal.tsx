import { AlertCircle, Check, Facebook, Hash, Instagram, LoaderCircle, RefreshCw, Send, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { publishFacebookPost } from '@/lib/facebookPublisher';
import { galleryImageUrl, supabase } from '@/lib/supabase';
import { GalleryPhoto } from '@/lib/types';

interface PublishModalProps {
  photo: GalleryPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PublishResult {
  instagram?: {
    status: string;
    postId?: string | null;
    error?: string | null;
  };
  facebook?: {
    status: string;
    postId?: string | null;
    error?: string | null;
  };
}

const defaultHashtags = [
  '#SriSagarDrivingSchool',
  '#BhadrappaLayout',
  '#DrivingSchoolBengaluru',
  '#LearnToDrive',
  '#DrivingLicense',
  '#Bengaluru',
];

export function PublishModal({ photo, isOpen, onClose, onSuccess }: PublishModalProps) {
  const [caption, setCaption] = useState('');
  const [publishInstagram, setPublishInstagram] = useState(true);
  const [publishFacebook, setPublishFacebook] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (photo) {
      const initialCaption =
        photo.caption ||
        photo.description ||
        `${photo.title} — Sri Sagar Driving School, Bhadrappa Layout, Bengaluru. Contact: +91 90195 04489`;
      setCaption(initialCaption);
      setPublishInstagram(photo.instagram_status !== 'published');
      setPublishFacebook(photo.facebook_status !== 'published');
      setResult(null);
      setGeneralError(null);
    }
  }, [photo]);

  if (!isOpen || !photo) return null;

  const handleAddHashtag = (tag: string) => {
    if (caption.includes(tag)) return;
    setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedCaption = caption.trim();

    if (!publishInstagram && !publishFacebook) {
      setGeneralError('Please select at least one platform (Instagram or Facebook).');
      return;
    }

    setPublishing(true);
    setGeneralError(null);
    setResult(null);

    const imageUrl = galleryImageUrl(photo.storage_path);
    const combinedResult: PublishResult = {};

    try {
      const promises: Promise<void>[] = [];

      // 1. Facebook Publishing via Supabase Edge Function `publish-facebook-post`
      if (publishFacebook) {
        promises.push(
          (async () => {
            const fbRes = await publishFacebookPost({
              message: trimmedCaption,
              imageUrl,
              photoId: photo.id,
            });

            if (fbRes.success) {
              combinedResult.facebook = {
                status: 'published',
                postId: fbRes.postId,
                error: null,
              };
            } else {
              combinedResult.facebook = {
                status: 'failed',
                error: fbRes.error || 'Facebook publishing failed',
              };
            }
          })()
        );
      }

      // 2. Instagram Publishing
      if (publishInstagram) {
        promises.push(
          (async () => {
            const { data, error } = await supabase.functions.invoke('publish-social-post', {
              body: {
                photoId: photo.id,
                imageUrl,
                caption: trimmedCaption,
                platforms: ['instagram'],
                retry: true,
              },
            });

            if (error) {
              combinedResult.instagram = {
                status: 'failed',
                error: error.message || 'Instagram publishing request failed',
              };
            } else if (data?.instagram) {
              combinedResult.instagram = data.instagram;
            }
          })()
        );
      }

      await Promise.all(promises);
      setResult(combinedResult);

      const hasAnySuccess =
        combinedResult.facebook?.status === 'published' ||
        combinedResult.instagram?.status === 'published';

      if (hasAnySuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : 'Unexpected error during social media publishing');
    } finally {
      setPublishing(false);
    }
  };

  const handleRetryPlatform = async (platform: 'instagram' | 'facebook') => {
    setPublishing(true);
    setGeneralError(null);
    const imageUrl = galleryImageUrl(photo.storage_path);
    const trimmedCaption = caption.trim();

    try {
      if (platform === 'facebook') {
        const fbRes = await publishFacebookPost({
          message: trimmedCaption,
          imageUrl,
          photoId: photo.id,
        });

        if (fbRes.success) {
          setResult((prev) => ({
            ...prev,
            facebook: {
              status: 'published',
              postId: fbRes.postId,
              error: null,
            },
          }));
          onSuccess();
        } else {
          setResult((prev) => ({
            ...prev,
            facebook: {
              status: 'failed',
              error: fbRes.error || 'Failed to retry publishing to Facebook',
            },
          }));
          if (fbRes.error) {
            setGeneralError(fbRes.error);
          }
        }
      } else {
        const { data, error } = await supabase.functions.invoke('publish-social-post', {
          body: {
            photoId: photo.id,
            imageUrl,
            caption: trimmedCaption,
            platforms: ['instagram'],
            retry: true,
          },
        });

        if (error) {
          setGeneralError(error.message || `Failed to retry publishing to ${platform}`);
        } else if (data) {
          setResult((prev) => ({
            ...prev,
            instagram: data.instagram,
          }));
          onSuccess();
        }
      }
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : `Retry failed on ${platform}`);
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
        className="relative flex flex-col max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-[#0a1628] text-white shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#0c1b30]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c1272d] text-white">
                <Send size={14} />
              </span>
              <h3 className="font-display text-lg font-extrabold text-white">Publish to Social Media</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Post photo directly to Instagram & Facebook Page</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handlePublish} className="overflow-y-auto p-5 sm:p-6 space-y-5 max-h-[calc(92vh-140px)]">
          {/* Photo Preview & Details */}
          <div className="flex gap-4 rounded-2xl bg-white/5 p-3.5 border border-white/5 items-center">
            <img
              src={galleryImageUrl(photo.storage_path)}
              alt={photo.title}
              className="h-20 w-20 rounded-xl object-cover border border-white/10 shrink-0 bg-black/40"
            />
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                {photo.category}
              </span>
              <h4 className="font-bold text-sm text-white truncate mt-1">{photo.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Uploaded: {new Date(photo.created_at).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Caption Input */}
          <div>
            <label htmlFor="publish-caption" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Social Media Post Caption
            </label>
            <textarea
              id="publish-caption"
              rows={4}
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter caption with details, phone numbers, and hashtags..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#c1272d] focus:ring-1 focus:ring-[#c1272d] focus:outline-none leading-relaxed"
            />

            {/* Quick Hashtags */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Hash size={12} /> Add:
              </span>
              {defaultHashtags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleAddHashtag(tag)}
                  className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:bg-white/20 hover:text-white transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Platform Checkboxes */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Select Publishing Channels
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Instagram */}
              <label
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                  publishInstagram
                    ? 'border-pink-500/50 bg-pink-950/20'
                    : 'border-white/10 bg-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={publishInstagram}
                    onChange={(e) => setPublishInstagram(e.target.checked)}
                    className="h-4 w-4 rounded text-[#c1272d] focus:ring-[#c1272d]"
                  />
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
                      <Instagram size={15} />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-white">Instagram</span>
                      <span className="block text-[10px] text-slate-400">Professional account</span>
                    </div>
                  </div>
                </div>
                {photo.instagram_status === 'published' && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Already posted
                  </span>
                )}
              </label>

              {/* Facebook */}
              <label
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                  publishFacebook
                    ? 'border-blue-500/50 bg-blue-950/20'
                    : 'border-white/10 bg-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={publishFacebook}
                    onChange={(e) => setPublishFacebook(e.target.checked)}
                    className="h-4 w-4 rounded text-[#c1272d] focus:ring-[#c1272d]"
                  />
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877F2] text-white">
                      <Facebook size={15} />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-white">Facebook</span>
                      <span className="block text-[10px] text-slate-400">Business Page</span>
                    </div>
                  </div>
                </div>
                {photo.facebook_status === 'published' && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Already posted
                  </span>
                )}
              </label>
            </div>
          </div>

          {/* General Error Notice */}
          {generalError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-950/40 border border-red-800/40 p-3.5 text-xs text-red-300">
              <AlertCircle size={17} className="shrink-0 text-red-400 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Post-Publish Outcomes / Results */}
          {result && (
            <div className="rounded-2xl bg-black/40 border border-white/10 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Publishing Outcome</p>

              {result.instagram && (
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                  <div className="flex items-center gap-2">
                    <Instagram size={16} className="text-pink-400" />
                    <span className="text-xs font-bold text-white">Instagram</span>
                  </div>
                  {result.instagram.status === 'published' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Check size={14} /> Published
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-400">Failed</span>
                      <button
                        type="button"
                        disabled={publishing}
                        onClick={() => void handleRetryPlatform('instagram')}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-500"
                      >
                        <RefreshCw size={12} /> Retry
                      </button>
                    </div>
                  )}
                </div>
              )}

              {result.facebook && (
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                  <div className="flex items-center gap-2">
                    <Facebook size={16} className="text-blue-400" />
                    <span className="text-xs font-bold text-white">Facebook</span>
                  </div>
                  {result.facebook.status === 'published' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Check size={14} /> Published successfully to Facebook.
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-400">Failed</span>
                      <button
                        type="button"
                        disabled={publishing}
                        onClick={() => void handleRetryPlatform('facebook')}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-500"
                      >
                        <RefreshCw size={12} /> Retry
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(result.instagram?.error || result.facebook?.error) && (
                <div className="rounded-lg bg-red-950/30 border border-red-800/30 p-2.5 text-[11px] text-red-300">
                  {result.instagram?.error && <p className="mb-1"><strong>Instagram:</strong> {result.instagram.error}</p>}
                  {result.facebook?.error && <p><strong>Facebook:</strong> {result.facebook.error}</p>}
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={publishing || (!publishInstagram && !publishFacebook)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c1272d] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#a51f25] transition disabled:opacity-50 shadow-md"
            >
              {publishing ? (
                <>
                  <LoaderCircle className="animate-spin" size={15} />
                  <span>Publishing to Meta...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Publish Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
