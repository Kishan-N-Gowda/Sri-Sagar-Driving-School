import { supabase } from './supabase';
import { GalleryPhoto } from './types';
import { getActiveHardcodedPhotos, mergeAndDeduplicatePhotos } from './galleryDefaults';

export async function fetchPublishedGalleryPhotos(): Promise<GalleryPhoto[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false });

    const activeHardcoded = getActiveHardcodedPhotos();

    if (!error && data && data.length > 0) {
      return mergeAndDeduplicatePhotos(activeHardcoded, data as GalleryPhoto[]);
    }
    return activeHardcoded;
  } catch (err) {
    console.warn('Error loading published gallery photos:', err);
    return getActiveHardcodedPhotos();
  }
}
