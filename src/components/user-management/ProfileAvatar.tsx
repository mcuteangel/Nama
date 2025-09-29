import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/auth';
import { showSuccess, showError } from '@/utils/toast';

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  onAvatarUpdate: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  onAvatarUpdate,
  size = 'md',
  editable = true
}) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError(t('errors.invalid_file_type'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError(t('errors.file_too_large'));
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${session?.user?.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.publicUrl })
          .eq('id', session?.user?.id);

        if (updateError) {
          throw updateError;
        }

        onAvatarUpdate(data.publicUrl);
        showSuccess(t('system_messages.avatar_updated'));
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showError(t('errors.avatar_upload_failed'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', session?.user?.id);

      if (error) throw error;

      onAvatarUpdate('');
      showSuccess(t('system_messages.avatar_removed'));
    } catch (error) {
      showError(t('errors.avatar_remove_failed'));
    }
  };

  return (
    <div className="relative inline-block">
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white/20 dark:border-gray-700/50 shadow-xl`}
        onMouseEnter={() => editable && setShowButtons(true)}
        onMouseLeave={() => setShowButtons(false)}
        whileHover={{ scale: 1.05 }}
      >
        {avatarUrl ? (
          <motion.img
            src={avatarUrl}
            alt={t('profile.avatar_alt')}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <motion.div
            className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <User size={iconSizes[size] * 0.6} className="text-primary/60" />
          </motion.div>
        )}

        {/* Upload overlay */}
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            />
          </motion.div>
        )}

        {/* Action buttons */}
        {editable && !isUploading && (
          <>
            {/* Upload button */}
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/80 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: showButtons ? 1 : 0.7,
                scale: showButtons ? 1 : 0.9
              }}
              aria-label={t('profile.edit_avatar')}
            >
              <Camera size={14} className="text-white" />
            </motion.button>

            {/* Remove button */}
            {avatarUrl && (
              <motion.button
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -left-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: showButtons ? 1 : 0.7,
                  scale: showButtons ? 1 : 0.9
                }}
                aria-label={t('profile.remove_avatar')}
              >
                <X size={12} className="text-white" />
              </motion.button>
            )}
          </>
        )}
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label={t('profile.select_image')}
      />
    </div>
  );
};

export default ProfileAvatar;
