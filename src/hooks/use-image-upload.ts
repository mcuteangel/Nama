import { useState, useCallback } from 'react';
import { useSession } from '@/integrations/supabase/auth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

export interface ImageUploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // in bytes, default 5MB
  allowedTypes?: string[]; // default ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string | null>;
  deleteImage: (url: string) => Promise<boolean>;
  isUploading: boolean;
  isDeleting: boolean;
  progress: number;
}

export const useImageUpload = (options: ImageUploadOptions): UseImageUploadReturn => {
  const { session } = useSession();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);

  const {
    bucket,
    folder = '',
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    onSuccess,
    onError,
  } = options;

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return t('errors.select_image_file');
    }

    if (!allowedTypes.includes(file.type)) {
      return t('errors.invalid_file_type', { types: allowedTypes.join(', ') });
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return t('errors.file_size_limit', { size: maxSizeMB });
    }

    return null;
  }, [allowedTypes, maxSize, t]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!session?.user) {
      const error = new Error(t('errors.upload_auth_required'));
      toast.error(error.message);
      onError?.(error);
      return null;
    }

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      onError?.(new Error(validationError));
      return null;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const userId = session.user.id;
      const fileName = folder
        ? `${folder}/${userId}/${timestamp}.${fileExt}`
        : `${userId}/${timestamp}.${fileExt}`;

      setProgress(25);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setProgress(75);

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error(t('errors.public_url_error'));
      }

      setProgress(100);
      toast.success(t('system_messages.upload_success'));
      onSuccess?.(publicUrlData.publicUrl);

      return publicUrlData.publicUrl;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('common.unknown_error');
      console.error("Error uploading image:", error);
      toast.error(t('errors.upload_error', { message: errorMessage }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [session, bucket, folder, validateFile, toast, t, onSuccess, onError]);

  const deleteImage = useCallback(async (url: string): Promise<boolean> => {
    if (!session?.user) {
      toast.error(t('errors.delete_auth_required'));
      return false;
    }

    setIsDeleting(true);

    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.indexOf(bucket);

      if (bucketIndex === -1) {
        throw new Error(t('errors.invalid_image_url'));
      }

      const fileName = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        throw error;
      }

      toast.success(t('system_messages.delete_success'));
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('common.unknown_error');
      console.error("Error deleting image:", error);
      toast.error(t('errors.delete_image_error', { message: errorMessage }));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [session, bucket, toast, t]);

  return {
    uploadImage,
    deleteImage,
    isUploading,
    isDeleting,
    progress,
  };
};