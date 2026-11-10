import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET_NAME = 'cv-assets';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const SupabaseStorageService = {
  /**
   * Upload cropped profile photo to private `cv-assets` bucket at `{userId}/profile/photo.webp`
   * and return a secure signed URL (or Data URL in Guest Mode).
   */
  async uploadProfilePhoto(
    blob: Blob,
    userId?: string
  ): Promise<{ photoPath?: string; signedUrl: string }> {
    const dataUrl = await blobToDataUrl(blob);

    if (isSupabaseConfigured && supabase && userId) {
      const objectPath = `${userId}/profile/photo.webp`;
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(objectPath, blob, {
          contentType: blob.type || 'image/webp',
          upsert: true,
        });

      if (!uploadErr) {
        // Persist storage path in profiles table
        await supabase
          .from('profiles')
          .update({ photo_path: objectPath, updated_at: new Date().toISOString() })
          .eq('id', userId);

        const { data: signedData } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(objectPath, 3600);

        return {
          photoPath: objectPath,
          signedUrl: signedData?.signedUrl || dataUrl,
        };
      } else {
        console.warn('Supabase photo upload fallback to local data URL:', uploadErr.message);
      }
    }

    return { signedUrl: dataUrl };
  },

  /**
   * Generate or refresh a 1-hour signed URL for a private storage object path.
   */
  async getSignedUrl(objectPath: string, expiresInSeconds = 3600): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase || !objectPath) return null;
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(objectPath, expiresInSeconds);
      if (error || !data?.signedUrl) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  /**
   * Remove profile photo from private `cv-assets` bucket and clear `profiles.photo_path`.
   */
  async deleteProfilePhoto(photoPath?: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase && userId) {
      const targetPath = photoPath || `${userId}/profile/photo.webp`;
      await supabase.storage.from(BUCKET_NAME).remove([targetPath]);
      await supabase
        .from('profiles')
        .update({ photo_path: null, updated_at: new Date().toISOString() })
        .eq('id', userId);
    }
    return true;
  },

  /**
   * Upload original imported CV (PDF or DOCX) to `{userId}/resumes/{resumeId}/original.{ext}`.
   */
  async uploadOriginalResumeFile(
    file: File,
    resumeId: string,
    userId?: string
  ): Promise<{ sourceFilePath?: string }> {
    if (!isSupabaseConfigured || !supabase || !userId) {
      return {};
    }

    const ext = file.name.toLowerCase().endsWith('.docx') ? 'docx' : 'pdf';
    const objectPath = `${userId}/resumes/${resumeId}/original.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(objectPath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.warn('Supabase original CV upload warning:', error.message);
      return {};
    }

    return { sourceFilePath: objectPath };
  },
};
