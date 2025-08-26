"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, XCircle, UploadCloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/auth';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import LoadingSpinner from './common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

interface ContactAvatarUploadProps {
  initialAvatarUrl?: string | null;
  onAvatarChange: (url: string | null) => void;
  disabled?: boolean;
}

const ContactAvatarUpload: React.FC<ContactAvatarUploadProps> = ({ initialAvatarUrl, onAvatarChange, disabled }) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl || null);
  }, [initialAvatarUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user) {
      showError(t('errors.upload_avatar_auth'));
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError(t('errors.select_image_file'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError(t('errors.file_size_limit'));
      return;
    }

    setIsUploading(true);
    const toastId = showLoading(t('loading_messages.uploading_image'));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error(t('errors.public_url_error'));
      }

      setAvatarUrl(publicUrlData.publicUrl);
      onAvatarChange(publicUrlData.publicUrl);
      showSuccess(t('system_messages.upload_success'));
    } catch (error: unknown) {
      console.error("Error uploading avatar:", error);
      showError(t('errors.upload_error', { message: error instanceof Error ? error.message : t('common.unknown_error') }));
      setAvatarUrl(initialAvatarUrl || null);
    } finally {
      dismissToast(toastId);
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!session?.user || !avatarUrl) return;

    setIsUploading(true);
    const toastId = showLoading(t('loading_messages.deleting_image'));

    try {
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts.slice(urlParts.indexOf('avatars') + 1).join('/');

      const { error } = await supabase.storage
        .from('avatars')
        .remove([fileName]);

      if (error) {
        throw error;
      }

      setAvatarUrl(null);
      onAvatarChange(null);
      showSuccess(t('system_messages.delete_success'));
    } catch (error: unknown) {
      console.error("Error removing avatar:", error);
      showError(t('errors.delete_image_error', { message: error instanceof Error ? error.message : t('common.unknown_error') }));
    } finally {
      dismissToast(toastId);
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <Avatar className="h-28 w-28 border-4 border-blue-400 dark:border-blue-600 shadow-lg">
        <AvatarImage src={avatarUrl || undefined} alt="Contact Avatar" />
        <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700 text-5xl font-bold flex items-center justify-center">
          <Camera size={48} />
        </AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="avatar-upload-input"
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        >
          {isUploading && <LoadingSpinner size={16} className="me-2" />}
          <UploadCloud size={16} />
          {isUploading ? t('actions.uploading') : t('actions.upload_image')}
        </Button>
        {avatarUrl && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemoveAvatar}
            disabled={disabled || isUploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-300"
          >
            {isUploading && <LoadingSpinner size={16} className="me-2" />}
            <XCircle size={16} />
            {t('actions.delete_image')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContactAvatarUpload;