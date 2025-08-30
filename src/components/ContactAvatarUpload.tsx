"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernLoader } from '@/components/ui/modern-loader';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/integrations/supabase/auth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, UploadCloud, XCircle } from 'lucide-react';

interface ContactAvatarUploadProps {
  initialAvatarUrl?: string | null;
  onAvatarChange: (url: string | null) => void;
  disabled?: boolean;
}

const ContactAvatarUpload: React.FC<ContactAvatarUploadProps> = React.memo(({ initialAvatarUrl, onAvatarChange, disabled }) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl || null);
  }, [initialAvatarUrl]);

  // Memoize the file change handler
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user) {
      toast.error(t('errors.upload_avatar_auth'));
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('errors.select_image_file'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('errors.file_size_limit'));
      return;
    }

    setIsUploading(true);
    
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
      toast.success(t('system_messages.upload_success'));
    } catch (error: unknown) {
      console.error("Error uploading avatar:", error);
      toast.error(t('errors.upload_error', { message: error instanceof Error ? error.message : t('common.unknown_error') }));
      setAvatarUrl(initialAvatarUrl || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [session, t, toast, initialAvatarUrl, onAvatarChange]);

  // Memoize the remove avatar handler
  const handleRemoveAvatar = useCallback(async () => {
    if (!session?.user || !avatarUrl) return;

    setIsUploading(true);
    
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
      toast.success(t('system_messages.delete_success'));
    } catch (error: unknown) {
      console.error("Error removing avatar:", error);
      toast.error(t('errors.delete_image_error', { message: error instanceof Error ? error.message : t('common.unknown_error') }));
    } finally {
      setIsUploading(false);
    }
  }, [session, avatarUrl, toast, onAvatarChange]);

  return (
    <div className="flex flex-col items-center gap-4 mb-6 p-6 rounded-xl glass">
      <Avatar className="h-32 w-32 border-4 border-blue-400 dark:border-blue-600 shadow-xl hover-lift">
        <AvatarImage src={avatarUrl || undefined} alt="Contact Avatar" />
        <AvatarFallback className="bg-gradient-primary text-white text-5xl font-bold flex items-center justify-center">
          <Camera size={48} />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="avatar-upload-input"
          disabled={disabled || isUploading}
        />
        <ModernButton
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          variant="gradient-primary"
          effect="lift"
          className="w-full sm:w-auto px-6 py-3 font-semibold shadow-lg hover:shadow-xl"
        >
          {isUploading && <ModernLoader variant="spinner" size="sm" className="me-2" />}
          <UploadCloud size={18} className="mr-2" />
          {isUploading ? t('actions.uploading') : t('actions.upload_image')}
        </ModernButton>
        {avatarUrl && (
          <ModernButton
            type="button"
            variant="gradient-danger"
            effect="lift"
            onClick={handleRemoveAvatar}
            disabled={disabled || isUploading}
            className="w-full sm:w-auto px-6 py-3 font-semibold shadow-lg hover:shadow-xl"
          >
            {isUploading && <ModernLoader variant="spinner" size="sm" className="me-2" />}
            <XCircle size={18} className="mr-2" />
            {t('actions.delete_image')}
          </ModernButton>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.initialAvatarUrl === nextProps.initialAvatarUrl &&
    prevProps.disabled === nextProps.disabled
  );
});

ContactAvatarUpload.displayName = 'ContactAvatarUpload';

export default ContactAvatarUpload;